<!-- @format -->
<script>
    import { onMount, tick } from "svelte"
    import { writable } from "svelte/store"
    import Matic from "./Matic"

    const { scaleFactor, boxes } = Matic
    let anchorBox = writable({
        top: 0,
        left: 0,
    })
    let origin = {
        top: 0,
        left: 0,
    }

    let display = "none"
    onMount(() => {
        let handler = ({ data: messageData }) => {
            const { action, data, functional } = messageData
            if (functional && action == "resize") onResize(data.anchorBox, data.unique)
        }
        window.addEventListener("message", handler)
        return () => window.removeEventListener("message", handler)
    })
    $: {
        origin.top = $anchorBox.top - (($boxes[0]?.y ?? 0) + ($boxes[0]?.h ?? 0) / 2) * $scaleFactor
        origin.left = $anchorBox.left - (($boxes[0]?.x ?? 0) + ($boxes[0]?.w ?? 0) / 2) * $scaleFactor
    }
    async function onResize(newAnchorBox, unique) {
        anchorBox.set(newAnchorBox)
        display = "unset"
        await tick()
        parent.postMessage({ action: "resized", data: { unique } }, "*")
    }
</script>

<div class="anchor" style="position:fixed;left:{origin.left}px;top:{origin.top}px;display:{display};">
    <slot />
</div>
