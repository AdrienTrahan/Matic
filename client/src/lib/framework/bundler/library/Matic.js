
import { writable } from "svelte/store";
let messageId = 0;
let isEditingVariable = false;

let pageResolveFunction;
let page = new Promise(resolve => pageResolveFunction = resolve);

// @ts-ignore
const whoAmI = window.Matic;
const isReady = writable(false);

const topLevelHandler = {
    loaded: hasFinishedLoading,
    variable: (name, value) => setVariable(name, value, false),
    clearVariables: clearVariables,
    triggerIsReady: triggerIsReady,
    getHeight: async () => (await page).getHeight()
}
const messageHandlers = {
    topLevel: topLevelHandler
};

const sentMessages = {}
const variables = {};

window.addEventListener("message", handleMessage)

function handleMessage({ data }) {
    switch (data.action) {
        case "call":
            handleCall(data);
            break;
        case "return":
            handleReturn(data);
            break;
    }
}

export default class Matic {
    static get whoAmI() { return whoAmI };
    static registerTarget = registerTarget;
    static init = init;
    static setVariable = setVariable;
    static getVariable = getVariable;
    static isReady = isReady
}

async function handleCall(data) {
    let response;
    if (data?.data?.action != undefined) {
        const destination = data.destination ?? "topLevel";
        if (messageHandlers[destination] && messageHandlers[destination][data.data.action]) {
            response = await messageHandlers[destination][data.data.action](...(data?.data?.args ?? []))
        }
    }
    returnMessage(data, response)
}

function handleReturn(data) {
    if (typeof sentMessages[data.messageId] == "function") sentMessages[data.messageId](data.data)
}

function registerTarget(targetId, targetInstance) {
    messageHandlers[targetId] = targetInstance;
}

function setVariable(name, value, notify = true) {
    if (variables[name] === undefined) {
        if (!notify) isEditingVariable = true;
        variables[name] = writable(value)
        variables[name].subscribe(($value) => {
            if (isEditingVariable) return;
            updateVariable(name, $value)
        })
    } else {
        isEditingVariable = true;
        variables[name].set(value)
    }
    isEditingVariable = false;
}

async function updateVariable(name, value) {
    await sendMessage("*", {
        action: "redirect", data: {
            action: "variable",
            args: [name, value]
        }
    })
}

function getVariable(name) {
    if (name) return variables[name];
}

function returnMessage(info, data) {
    window.parent.postMessage({
        ...info,
        data,
        action: "return",
    }, "*")
}

async function sendMessage(destination, data, destinationIndex) {
    window.parent.postMessage({
        destination: destination,
        destinationIndex,
        origin: whoAmI.type,
        originIndex: whoAmI.index,
        action: "redirect",
        messageId: messageId,
        ...data
    }, "*")
    let resolveCallback;
    const promise = new Promise((resolve) => resolveCallback = resolve)
    sentMessages[messageId++] = resolveCallback;
    const result = await promise;

    if (destination != "*" && destinationIndex != "*" && result.length == 1) return result[0];

    return result;
}

async function clearVariables() {
    isReady.set(false);
    Object.keys(variables).forEach(key => {
        setVariable(key, undefined, false);
    });
}

async function hasFinishedLoading() {
    const loadedPage = await page;
    isReady.set(true);
    loadedPage.load()
}

function init(pageInstance) {
    pageResolveFunction(pageInstance)
}

function triggerIsReady() {
    window.parent.postMessage({
        action: "ready",
        origin: whoAmI
    }, "*");
}


triggerIsReady();

