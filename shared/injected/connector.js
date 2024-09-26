import { getContext, setContext } from "svelte";
import { writable, get, derived } from "svelte/store"
let type;
let plugins;
let id = 0;
let readyHandlers = [];

const pluginType = window.Matic.pluginType;
const iframeIndex = window.Matic.iframeIndex;

const selections = writable(new Set());

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

async function handleCall({ type: senderType, senderIndex, pluginId, componentId, key, args }, messageId) {
    let responseMessage;
    let pluginInstances = [];

    if (pluginType == "drawable") {
        pluginInstances = plugins[pluginId]["0"];
    } else if (componentId == "*") {
        pluginInstances = Object.values(plugins[pluginId]);
    } else {
        pluginInstances = plugins[pluginId][componentId] ? [plugins[pluginId][componentId]] : []
    }
    for (const pluginInstance of pluginInstances) {
        const method = pluginInstance[key];
        if (typeof method == "function") {
            try {
                responseMessage = await method(...args);
            } catch { }
        }
    }
    returnMessage(pluginId, componentId, senderType, senderIndex, responseMessage, messageId);
}

function handleReturn({ message, pluginId, componentId }, messageId) {
    if (typeof window.Matic.sentMessages === "object" &&
        window.Matic.sentMessages[`${pluginId}-${componentId}`] !== undefined &&
        typeof window.Matic.sentMessages[`${pluginId}-${componentId}`][messageId] === "function") {
        const resolveFunction = window.Matic.sentMessages[`${pluginId}-${componentId}`][messageId];
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
            break;
        case "componentTreeChanged":
            updateComponentTree(data)
            break;
        case "selection":
            updateSelections(data);
            break;
    }
}

async function sendMessage(pluginId, componentId, receiverType, key, args, receiverIndex = "*") {
    const currentMessageId = id++;

    const returnPromise = new Promise((resolve) => {
        if (typeof window.Matic.sentMessages[`${pluginId}-${componentId}`] !== "object") window.Matic.sentMessages[`${pluginId}-${componentId}`] = {};
        window.Matic.sentMessages[`${pluginId}-${componentId}`][currentMessageId] = resolve;
    });

    parent.postMessage({
        action: "call",
        data: {
            receiverType,
            senderType: type,
            senderIndex: iframeIndex,
            pluginId,
            componentId,
            key,
            args,
            receiverIndex
        },
        messageId: currentMessageId
    }, "*")

    return returnPromise;
}


function returnMessage(pluginId, componentId, senderType, senderIndex, message, messageId) {
    parent.postMessage({
        action: "return",
        data: {
            senderType,
            senderIndex,
            pluginId,
            componentId,
            message
        },
        messageId: messageId
    }, "*")
}

function sendAlert(alert, data) {
    parent.postMessage({ action: "alert", alert, data }, "*")
}


const sendMessageProxyHandler = {
    get: (target, key) => {
        if (target.type == "drawable") return (...args) => sendMessage(target.pluginId, target.componentId, target.type, key, args);
        if (target.type == "preview") {
            const destination = target.dest;
            delete target.dest;
            return (...args) => sendMessage(target.pluginId, target.comp, target.type, key, args, destination);
        }
    },
    set: (target, key, value) => {
        if (key != "dest" && key != "comp") throw new Error('Cannot write on read-only proxy')
        if (key == "dest") target.dest = value;
        if (key == "comp") target.comp = value;
        return target;
    },
    deleteProperty: () => {
        throw new Error('Cannot delete on read-only proxy')
    }
}

class Connection {
    #pluginId;
    #componentId;
    #drawableProxy;
    #previewProxy;

    constructor(pluginId, componentId) {
        this.#pluginId = pluginId;
        this.#componentId = componentId;
        this.#drawableProxy = new Proxy({ type: "drawable", pluginId: this.#pluginId, componentId: this.#componentId }, sendMessageProxyHandler);
        this.#previewProxy = new Proxy({ type: "preview", pluginId: this.#pluginId, componentId: this.#componentId }, sendMessageProxyHandler);
    }
    drawable() {
        return this.#drawableProxy;
    }
    preview(componentId, destinationIndex) {
        if (destinationIndex === undefined) destinationIndex = "*";
        if (typeof componentId !== "string") componentId = "*";
        this.#previewProxy.comp = componentId
        this.#previewProxy.dest = destinationIndex;
        return this.#previewProxy;
    }
}

export default function Matic() {
    try {
        const pluginId = getContext(Matic.ACTIVE_PLUGIN_ID_CONTEXT_KEY);
        setContext(Matic.ACTIVE_PLUGIN_ID_CONTEXT_KEY, undefined);

        const componentInstanceId = getContext(Matic.ACTIVE_COMPONENT_INSTANCE_ID_CONTEXT_KEY);
        setContext(Matic.ACTIVE_COMPONENT_INSTANCE_ID_CONTEXT_KEY, undefined);
        return new Connection(pluginId, componentInstanceId);
    } catch { }
    throw "Matic must be initialized at the top level of a Plugin"
}

async function setIsReady() {
    if (iframeIndex !== undefined) setHeight(iframeIndex);
    sendAlert("ready", { type, index: iframeIndex })
}

function setHeight(index) {
    sendAlert("height-changed", {
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

function updateComponentTree(newComponentTree) {
    Matic.componentTree.set(newComponentTree);
}

function updateSelections(newSelections) {
    console.log(newSelections);
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

Matic.ACTIVE_PLUGIN_ID_CONTEXT_KEY = "ACTIVE_PLUGIN_ID";
Matic.ACTIVE_COMPONENT_INSTANCE_ID_CONTEXT_KEY = "ACTIVE_COMPONENT_INSTANCE_ID"

Matic.isZooming = writable(false)
Matic.isTransforming = writable(false)
Matic.scaleFactor = writable(1.0);
Matic.boxes = writable([]);
Matic.scaledBoxes = derived([Matic.boxes, Matic.scaleFactor], ([boxes, scaleFactor]) => boxes.map(({ x, y, w, h }) => ({ x: x * scaleFactor, y: y * scaleFactor, w: w * scaleFactor, h: h * scaleFactor })));
Matic.componentTree = writable({});


Matic.selectComponent = function (uniqueId) {
    if ($selections.has(uniqueId)) selections.update(currentSelections => currentSelections.add(uniqueId));
}

Matic.getBreakpoint = () => {
    return iframeIndex;
}

function setIsPluginMounted() {
    for (const readyHandler of readyHandlers) {
        readyHandler();
    }
    readyHandlers = [];
}