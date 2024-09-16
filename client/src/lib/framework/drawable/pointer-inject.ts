/** @format */
export function getPointerInjectionCode() {
    return `
        window.addEventListener("message", handleMessage)

        function handleMessage({ data: messageData }) {
            const { action, data, functional } = messageData
            if (functional && action == "pointer") onPointer(data);
        }
        function onResize(anchorBox) {
            const anchors = document.getElementsByClassName("anchor")
            for (const anchor of anchors) {
                anchor.style.top = anchorBox.top + "px"
                anchor.style.left = anchorBox.left + "px"
                anchor.style.display = "unset"
            }
        }

        function onPointer({ name, event: eventData }) {
            let targets =
                eventData.pageX && eventData.pageY ? document.elementsFromPoint(eventData.pageX, eventData.pageY) ?? [] : []
            if (targets) updateHover(targets)
            const event = new Event(name, {
                ...eventData,
                bubbles: true,
                cancelable: true,
                view: window,
            })
            ;(targets[0] ?? window).dispatchEvent(event)
        }
            
        let lastHoveredElements = []
        function updateHover(targets) {
            for (const target of targets) {
                if (!lastHoveredElements.includes(target)) {
                    target.dispatchEvent(
                        new MouseEvent("mouseenter", {
                            bubbles: true,
                            cancelable: true,
                            view: window,
                        })
                    )
                    target.dispatchEvent(
                        new MouseEvent("mouseover", {
                            bubbles: true,
                            cancelable: true,
                            view: window,
                        })
                    )
                }
            }
            for (const lastHoveredElement of lastHoveredElements) {
                if (!targets.includes(lastHoveredElement)) {
                    lastHoveredElement.dispatchEvent(
                        new MouseEvent("mouseleave", {
                            bubbles: true,
                            cancelable: true,
                            view: window,
                        })
                    )
                }
            }
            lastHoveredElements = targets
        }
    `
}
