<!-- @format -->
<script lang="ts">
    import { hoveredElement } from "$framework/selector"
    import { LOADER_CONTEXT_KEY, PANZOOM_TRANSFORM_CONTEXT_KEY } from "$lib/constants"
    import { getContext, onMount } from "svelte"
    import ComponentPreview from "./component-preview.svelte"
    import HoverOutline from "./hover-outline.svelte"
    import PanningWindow from "./panning-window.svelte"
    import type { ComponentLoader } from "$framework/loader"
    import { writable, type Writable } from "svelte/store"
    import { resize } from "svelte-resize-observer-action"

    const loader: ComponentLoader = getContext(LOADER_CONTEXT_KEY)
    const panzoomTransform: Writable<{ x: number; y: number; scale: number }> =
        getContext(PANZOOM_TRANSFORM_CONTEXT_KEY)

    export let displacement

    let outlines: any = []
    let previewContainer: HTMLDivElement
    let previewSize = writable({ width: 0, height: 0 })
    $: newDisplacement = { x: displacement.x - $previewSize.width / 2, y: displacement.y - $previewSize.height / 2 }
    onMount(() => {
        updateDisplacement()
    })
    function updateDisplacement() {
        previewSize.set(previewContainer.getBoundingClientRect())
    }
</script>

<!-- @format -->
<PanningWindow displacement={newDisplacement}>
    <div bind:this={previewContainer} use:resize={updateDisplacement}>
        {#if loader.main}
            <ComponentPreview bind:outlines />
        {/if}
    </div>

    <div slot="anchor">
        {#if $hoveredElement?.uniqueId !== undefined}
            <HoverOutline
                left={outlines[$hoveredElement?.viewIndex][$hoveredElement.uniqueId].x * $panzoomTransform.scale}
                top={outlines[$hoveredElement?.viewIndex][$hoveredElement.uniqueId].y * $panzoomTransform.scale}
                width={outlines[$hoveredElement?.viewIndex][$hoveredElement.uniqueId].width * $panzoomTransform.scale}
                height={outlines[$hoveredElement?.viewIndex][$hoveredElement.uniqueId].height *
                    $panzoomTransform.scale} />
        {/if}
    </div>
</PanningWindow>
