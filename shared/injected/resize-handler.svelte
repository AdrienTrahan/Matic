<!-- @format -->
<script>
    import { tick, onMount } from "svelte"

    let top = 0
    let left = 0
    let display = "none"
    onMount(() => {
        let handler = ({ data: messageData }) => {
            const { action, data, functional } = messageData
            if (functional && action == "resize") onResize(data.anchorBox, data.unique)
        }
        window.addEventListener("message", handler)
        return () => window.removeEventListener("message", handler)
    })

    async function onResize(anchorBox, unique) {
        const anchors = document.getElementsByClassName("anchor")
        for (const anchor of anchors) {
            top = anchorBox.top
            left = anchorBox.left
            display = "unset"
        }
        await tick()
        parent.postMessage({ action: "resized", data: { unique } }, "*")
    }
</script>

<div class="anchor" style="position:fixed;left:{left}px;top:{top}px;display:{display};">
    <slot />
</div>
