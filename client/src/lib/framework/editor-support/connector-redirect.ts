/** @format */

import { get, writable, type Writable } from "svelte/store"

export let pluginsReady: {
    drawable: boolean
    preview: { [index: string]: boolean }
} = {
    drawable: false,
    preview: {},
}

export let registeredIframes: { [message: string]: HTMLIFrameElement[] | null } = {}

export let boxes: Writable<
    {
        x: number
        y: number
        w: number
        h: number
    }[]
> = writable([])

export let componentTree: Writable<any> = writable({})

const selections = writable(new Set())

boxes.subscribe(updateBoxes)

componentTree.subscribe(updateComponentTree)

function updateBoxes(currentBoxes = get(boxes)) {
    sendAlert("*", "boxesChanged", currentBoxes)
}

function updateComponentTree(currentComponentTree = get(componentTree)) {
    sendAlert("*", "componentTreeChanged", currentComponentTree)
}

export function handleMessage(
    receiverType,
    senderType,
    senderIndex,
    receiverIndex,
    pluginId,
    componentId,
    key,
    args,
    messageId
) {
    const selectedIframes = registeredIframes[receiverType]

    if (selectedIframes) {
        const iframes = selectedIframes.filter((_, i) => receiverIndex == "*" || i == receiverIndex)
        for (const iframe of iframes) {
            iframe.contentWindow?.postMessage(
                {
                    action: "call",
                    data: {
                        type: senderType,
                        senderIndex,
                        pluginId,
                        componentId,
                        key,
                        args,
                    },
                    messageId,
                },
                "*"
            )
        }
        if (iframes.length > 0) return
    }
    returnMessage(senderType, senderIndex, pluginId, componentId, undefined, messageId)
}

export function returnMessage(senderType, senderIndex, pluginId, componentId, message, messageId) {
    const selectedIframes = registeredIframes[senderType]
    if (selectedIframes && selectedIframes[senderIndex ?? 0]) {
        selectedIframes[senderIndex ?? 0].contentWindow?.postMessage(
            {
                action: "return",
                data: {
                    type: senderType,
                    pluginId,
                    componentId,
                    message,
                },
                messageId,
            },
            "*"
        )
    }
}

export function setAlert(type, data) {
    switch (type) {
        case "ready":
            setIsReady(data.type, data.index)
            break
        case "height-changed":
            setHeight(data.iframe, data.height)
            break
        case "selection":
            setSelections(data.selections)
            break
    }
}

function setIsReady(type, index) {
    if (type == "drawable") {
        pluginsReady[type] = true
    } else {
        pluginsReady[type][index] = true
    }
    if (pluginsReady.drawable && get(boxes).every((_, i) => pluginsReady.preview[i])) {
        setupImportantData()
        sendAlert("*", "ready", {})
    }
}

function setHeight(iframe, height) {
    boxes.update(currentBoxes => {
        currentBoxes[iframe].h = height
        return currentBoxes
    })
}

function setSelections(newSelections) {
    selections.set(newSelections)
}

function sendAlert(type, action, data) {
    let targetIframes: HTMLIFrameElement[] = []
    if (type == "*") {
        targetIframes = [...Object.values(registeredIframes).filter(iframes => iframes !== null)].flat()
    }
    for (const targetIframe of targetIframes) {
        targetIframe?.contentWindow?.postMessage(
            {
                action: "alert",
                data: {
                    action,
                    data,
                },
            },
            "*"
        )
    }
}

export function resetConnections() {
    pluginsReady = {
        drawable: false,
        preview: {},
    }
    registeredIframes = {
        drawable: null,
        preview: null,
    }
    boxes.set([])
    componentTree.set({})
}

function setupImportantData() {
    updateBoxes()
    updateComponentTree()
}
