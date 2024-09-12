<!-- @format -->
<script lang="ts">
    import type { ComponentLoader } from "$framework/loader"
    import { LOADER_CONTEXT_KEY } from "$lib/constants"
    import { getContext, onMount } from "svelte"
    import { resize } from "svelte-resize-observer-action"
    import { derived, writable } from "svelte/store"
    import ComponentPreview from "./component-preview.svelte"
    import DrawingScreen from "./drawing-screen.svelte"
    import PanningWindow from "./panning-window.svelte"

    const loader: ComponentLoader = getContext(LOADER_CONTEXT_KEY)

    export let displacement

    let outlines: any = []
    let previewContainer: HTMLDivElement
    let previewSize = writable({ width: 0, height: 0 })
    $: newDisplacement = derived([previewSize], () => ({
        x: displacement.x - $previewSize.width / 2,
        y: displacement.y - $previewSize.height / 2,
    }))
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
    <svelte:fragment slot="drawable" let:anchorBox>
        <DrawingScreen {anchorBox} />
    </svelte:fragment>
</PanningWindow>
