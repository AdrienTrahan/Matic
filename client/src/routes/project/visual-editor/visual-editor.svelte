<!-- @format -->
<script lang="ts">
    import type { ComponentLoader } from "$framework/element-loader"
    import Spinner from "$lib/components/ui/spinner/spinner.svelte"
    import { COMPONENT_LOADER_CONTEXT_KEY, INITIAL_ZOOM } from "$lib/constants"
    import { cn } from "$lib/utils"
    import { getContext, onMount } from "svelte"
    import { resize } from "svelte-resize-observer-action"
    import { writable } from "svelte/store"
    import DrawingScreen from "./drawing-screen/drawing-screen.svelte"
    import PanningWindow from "./panning-window.svelte"
    import PreviewScreen from "./preview-screen/preview-screen.svelte"

    const componentLoader: ComponentLoader = getContext(COMPONENT_LOADER_CONTEXT_KEY)

    export let displacement
    const initialZoom = (INITIAL_ZOOM * displacement.width) / document.body.clientWidth
    let previewReady = writable(false)
    let drawingReady = writable(false)
    $: ready = $previewReady && $drawingReady
    let editorContainer: HTMLDivElement
    let previewSize = writable({ width: 0, height: 0 })
    onMount(() => {
        updateDisplacement()
    })
    async function updateDisplacement() {
        if (editorContainer) previewSize.set(editorContainer.getBoundingClientRect())
    }
</script>

<!-- @format -->
<div class={cn("transition-opacity inset-0 absolute", ready ? "opacity-100" : "opacity-0")}>
    <PanningWindow
        displacement={{ x: displacement.x + displacement.width / 2, y: displacement.y + displacement.height / 2 }}
        initialZoom={1}>
        <div use:resize={updateDisplacement}>
            {#if componentLoader.main}
                <PreviewScreen ready={previewReady} />
            {/if}
        </div>
        <svelte:fragment slot="drawable" let:anchorBox>
            <DrawingScreen ready={drawingReady} {anchorBox} />
        </svelte:fragment>
    </PanningWindow>
</div>
<div
    class={cn(
        "absolute flex justify-center items-center transition-opacity pointer-events-none",
        ready ? "opacity-0" : "opacity-100",
    )}
    style="top:{displacement.y}px;left:{displacement.x}px;width:{displacement.width}px;height:{displacement.height}px;">
    <Spinner size="medium" />
</div>
