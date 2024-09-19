/** @format */

export let registeredIframes: { [message: string]: HTMLIFrameElement[] | null } = {
    drawable: null,
    preview: null,
}

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
