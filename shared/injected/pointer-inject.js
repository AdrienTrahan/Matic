let isPointerDown = false;

if (!window.Matic?.alreadyInjected) {
    window.addEventListener("message", handleMessage)
    if (typeof window.Matic != "object") window.Matic = {};
    window.Matic.alreadyInjected = true;
}

function handleMessage({ data: messageData }) {
    const { action, data, functional } = messageData
    if (functional && action == "pointer") onPointer(data);
}

function onPointer({ name, event: eventData }) {
    let pointerStatusChanged = isPointerDown;
    if (["mousedown", "pointerdown", "touchstart"].includes(name)) isPointerDown = true
    if (["mouseup", "pointerup", "touchend", "touchcancel"].includes(name)) isPointerDown = false
    let leaveEvents = ["mouseleave", "mouseout"]
    pointerStatusChanged = pointerStatusChanged != isPointerDown;

    let targets =
        eventData.pageX && eventData.pageY ? document.elementsFromPoint(eventData.pageX, eventData.pageY) ?? [] : []
    if (leaveEvents.includes(eventData.type)) targets = []

    targets = targets.filter(el => window.getComputedStyle(el).pointerEvents !== 'none');

    if (targets) updateHover(targets)
    if (targets && pointerStatusChanged) updateActive(targets);

    let eventType = Event;
    if (eventData.mouseEvent) eventType = MouseEvent
    if (eventData.pointerEvent) eventType = PointerEvent

    const event = new eventType(name, {
        ...eventData,
        bubbles: true,
        cancelable: true,
        view: window
    });

    (targets[0] ?? window).dispatchEvent(event)
}

let lastHoveredElements = []
function updateHover(targets) {
    for (const target of targets) {
        if (!lastHoveredElements.includes(target)) {
            target.classList.add("hover")
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
            lastHoveredElement.classList.remove("hover")
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

function updateActive(targets) {
    if (isPointerDown) {
        for (const target of targets) {
            target.classList.add("active")
        }
    } else {
        const targets = document.getElementsByClassName("active") ?? [];
        for (let i = targets.length - 1; i >= 0; i--) {
            targets[i].classList.remove("active");
        }
    }
}