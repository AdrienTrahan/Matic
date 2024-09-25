/** @format */

import { writable, type Writable } from "svelte/store"

export let pluginsReady = {
    drawable: false,
    preview: false,
}

export let registeredIframes: { [message: string]: HTMLIFrameElement[] | null } = {
    drawable: null,
    preview: null,
}

export let boxes: Writable<
    {
        x: number
        y: number
        w: number
        h: number
    }[]
> = writable([])

boxes.subscribe(currentBoxes => {
    sendAlert("*", "boxesChanged", currentBoxes)
})

export function handleMessage(receiverType, senderType, unique, key, args, messageId) {
    const selectedIframes = registeredIframes[receiverType]
    if (selectedIframes) {
        for (const iframe of selectedIframes) {
            iframe.contentWindow?.postMessage(
                {
                    action: "call",
                    data: {
                        type: senderType,
                        unique,
                        key,
                        args,
                    },
                    messageId,
                },
                "*"
            )
        }
    }
}

export function returnMessage(senderType, unique, message, messageId) {
    const selectedIframes = registeredIframes[senderType]
    if (selectedIframes) {
        for (const iframe of selectedIframes) {
            iframe.contentWindow?.postMessage(
                {
                    action: "return",
                    data: {
                        type: senderType,
                        unique,
                        message,
                    },
                    messageId,
                },
                "*"
            )
        }
    }
}

export function setSetting(type, data) {
    switch (type) {
        case "ready":
            setIsReady(data.type)
            break
        case "height-changed":
            setHeight(data.iframe, data.height)
            break
    }
}

function setIsReady(type) {
    pluginsReady[type] = true
    if (pluginsReady.drawable && pluginsReady.preview) {
        sendAlert("*", "ready", {})
    }
}

function setHeight(iframe, height) {
    boxes.update(currentBoxes => {
        currentBoxes[iframe].h = height
        return currentBoxes
    })
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
