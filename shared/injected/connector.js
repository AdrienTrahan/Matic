import { getContext, setContext } from "svelte";

let type;
let plugins;
let id = 0;

if (!window?.Matic?.handleMessage) {
    window.addEventListener("message", handleMessage);
    if (typeof window.Matic != "object") window.Matic = {};
    window.Matic.handleMessage = handleMessage;
    window.Matic.sentMessages = {};
}

async function handleMessage({ data: { action, data, messageId } }) {
    if (action === "call") {
        handleCall(data, messageId)
    } else if (action === "return") {
        if (typeof window.Matic.sentMessages === "object" &&
            window.Matic.sentMessages[data.unique] !== undefined &&
            typeof window.Matic.sentMessages[data.unique][messageId] === "function") {
            const resolveFunction = window.Matic.sentMessages[data.unique][messageId];
            resolveFunction(data.message);
        }

    }
}

async function handleCall({ type: senderType, unique, key, args }, messageId) {
    let responseMessage;
    const pluginInstance = plugins[unique];

    if (pluginInstance) {
        const method = pluginInstance[key];
        if (typeof method == "function") {
            try {
                responseMessage = await method(...args);
            } catch { }
        }
    }
    returnMessage(unique, senderType, responseMessage, messageId);
}

async function sendMessage(unique, receiverType, key, args) {
    const currentMessageId = id++;
    const returnPromise = new Promise((resolve) => {
        if (typeof window.Matic.sentMessages[unique] !== "object") window.Matic.sentMessages[unique] = {};
        window.Matic.sentMessages[unique][currentMessageId] = resolve;
    });
    parent.postMessage({
        action: "call",
        data: {
            receiverType,
            senderType: type,
            unique,
            key,
            args
        },
        messageId: currentMessageId
    }, "*")

    return returnPromise;
}


function returnMessage(unique, type, message, messageId) {
    parent.postMessage({
        action: "return",
        data: {
            senderType: type,
            unique,
            message
        },
        messageId: messageId
    }, "*")
}


const sendMessageProxyHandler = {
    get: (target, key) => {
        return (...args) => {
            return sendMessage(target.unique, target.type, key, args)
        };
    },
    set: () => {
        throw new Error('Cannot write on read-only proxy')
    },
    deleteProperty: () => {
        throw new Error('Cannot delete on read-only proxy')
    }
}

class Connection {
    #unique;
    #drawableProxy;
    #previewProxy;

    constructor(unique) {
        this.#unique = unique;
        this.#drawableProxy = new Proxy({ type: "drawable", unique: this.#unique }, sendMessageProxyHandler);
        this.#previewProxy = new Proxy({ type: "preview", unique: this.#unique }, sendMessageProxyHandler);
    }
    get drawable() {
        return this.#drawableProxy;
    }
    get preview() {
        return this.#previewProxy;
    }
}


export default function Matic() {
    try {
        const unique = getContext(Matic.ACTIVE_PLUGIN_CONTEXT_KEY);
        setContext(Matic.ACTIVE_PLUGIN_CONTEXT_KEY, undefined);
        return new Connection(unique);
    } catch { }
    throw "Matic must be initialized at the top level of a Plugin"
}

Matic.init = async function (newPlugins, newType) {
    if (plugins != undefined && type != undefined) return;
    delete Matic.init;
    plugins = newPlugins;
    type = newType
}

Matic.ACTIVE_PLUGIN_CONTEXT_KEY = "ACTIVE_PLUGIN";