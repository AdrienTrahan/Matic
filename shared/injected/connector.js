import { getContext, setContext } from "svelte";
import { writable, get, derived } from "svelte/store"
let type;
let plugins;
let id = 0;
let readyHandlers = [];

const pluginType = window.Matic.pluginType;
const iframeIndex = window.Matic.iframeIndex;

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
        handleReturn(data, messageId)
    } else if (action === "alert") {
        handleAlert(data.action, data.data)
    } else if (action === "transform") {
        if (get(Matic.scaleFactor) != data.scaleFactor) Matic.scaleFactor.set(data.scaleFactor)
        if (get(Matic.isZooming) != data.isZooming) Matic.isZooming.set(data.isZooming)
        if (get(Matic.isTransforming) != data.isTransforming) Matic.isTransforming.set(data.isTransforming)
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

function handleReturn({ message, unique }, messageId) {
    if (typeof window.Matic.sentMessages === "object" &&
        window.Matic.sentMessages[unique] !== undefined &&
        typeof window.Matic.sentMessages[unique][messageId] === "function") {
        const resolveFunction = window.Matic.sentMessages[unique][messageId];
        resolveFunction(message);
    }
}

function handleAlert(type, data) {
    switch (type) {
        case "ready":
            setIsPluginMounted();
            break;
        case "boxesChanged":
            updateBoxes(data)
    }
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

function sendSetting(setting, data) {
    parent.postMessage({ action: "setting", setting, data }, "*")
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

async function setIsReady() {
    if (iframeIndex !== undefined) setHeight(iframeIndex);
    sendSetting("ready", { type })
}

function setHeight(index) {
    sendSetting("height-changed", {
        iframe: index,
        height: document.documentElement.scrollHeight
    })
}

function updateBoxes(newBoxes) {
    Matic.boxes.update((currentBoxes) => {
        if (currentBoxes.length != newBoxes.length) {
            currentBoxes = newBoxes
        } else {
            for (const [i, box] of currentBoxes.entries()) {
                if (box.x != newBoxes[i].x) box.x = newBoxes[i].x
                if (box.y != newBoxes[i].y) box.y = newBoxes[i].y
                if (box.w != newBoxes[i].w) box.w = newBoxes[i].w
                if (box.h != newBoxes[i].h) box.h = newBoxes[i].h
            }
        }
        return currentBoxes;
    })
}

Matic.init = async function (newPlugins, newType) {
    if (plugins != undefined && type != undefined) return;
    delete Matic.init;
    plugins = newPlugins;
    type = newType

    setIsReady();
}

Matic.onReady = function (callback) {
    readyHandlers.push(callback);
}

Matic.ACTIVE_PLUGIN_CONTEXT_KEY = "ACTIVE_PLUGIN";

Matic.isZooming = writable(false)
Matic.isTransforming = writable(false)
Matic.scaleFactor = writable(1.0);
Matic.boxes = writable([]);
Matic.scaledBoxes = derived([Matic.boxes, Matic.scaleFactor], ([boxes, scaleFactor]) => boxes.map(({ x, y, w, h }) => ({ x: x * scaleFactor, y: y * scaleFactor, w: w * scaleFactor, h: h * scaleFactor })));


Matic.getBreakpoint = () => {
    return iframeIndex;
}

function setIsPluginMounted() {
    for (const readyHandler of readyHandlers) {
        readyHandler();
    }
    readyHandlers = [];
}