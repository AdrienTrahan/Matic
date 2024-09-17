<!-- @format -->
<script lang="ts">
    import type { ComponentLoader } from "$framework/element-loader"
    import Spinner from "$lib/components/ui/spinner/spinner.svelte"
    import { COMPONENT_LOADER_CONTEXT_KEY } from "$lib/constants"
    import { cn } from "$lib/utils"
    import { getContext, onMount } from "svelte"
    import { resize } from "svelte-resize-observer-action"
    import { derived, writable } from "svelte/store"
    import DrawingScreen from "./drawing-screen/drawing-screen.svelte"
    import PanningWindow from "./panning-window.svelte"
    import PreviewScreen from "./preview-screen/preview-screen.svelte"

    const componentLoader: ComponentLoader = getContext(COMPONENT_LOADER_CONTEXT_KEY)

    export let displacement

    let previewReady = writable(false)
    let drawingReady = writable(false)
    $: ready = $previewReady && $drawingReady
    let previewContainer: HTMLDivElement
    let previewSize = writable({ width: 0, height: 0 })
    $: newDisplacement = derived([previewSize], () => ({
        x: displacement.x - $previewSize.width / 2,
        y: displacement.y - $previewSize.height / 2,
    }))

    onMount(() => {
        updateDisplacement()
    })
    async function updateDisplacement() {
        previewSize.set(previewContainer.getBoundingClientRect())
    }
</script>

<!-- @format -->
<div class={cn("transition-opacity", ready ? "opacity-100" : "opacity-0")}>
    <PanningWindow displacement={newDisplacement}>
        <div bind:this={previewContainer} use:resize={updateDisplacement}>
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
    style="top:{$newDisplacement.y}px;left:{$newDisplacement.x}px;width:{$previewSize.width}px;height:{$previewSize.height}px;">
    <Spinner size="medium" />
</div>
