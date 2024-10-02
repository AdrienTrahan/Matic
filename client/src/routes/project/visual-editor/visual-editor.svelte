<!-- @format -->
<script lang="ts">
    import type { Project } from "$framework/project"
    import { INITIAL_ZOOM, PROJECT_CONTEXT_KEY } from "$lib/constants"
    import { cn } from "$lib/utils"
    import { getContext, onMount } from "svelte"
    import { resize } from "svelte-resize-observer-action"
    import { writable } from "svelte/store"
    import PanningWindow from "./panning-window.svelte"
    import PreviewScreen from "./preview-screen/preview-screen.svelte"

    const project: Project = getContext(PROJECT_CONTEXT_KEY)
    const editor = project.getEditor()
    $: currentComponent = $editor.getPresentedComponent()

    export let displacement
    const initialZoom = (INITIAL_ZOOM * displacement.width) / document.body.clientWidth

    let editorContainer: HTMLDivElement
    let previewSize = writable({ width: 0, height: 0 })
    onMount(() => {
        updateDisplacement()
    })
    async function updateDisplacement() {
        if (editorContainer) previewSize.set(editorContainer.getBoundingClientRect())
    }
</script>

<div class={cn("transition-opacity inset-0 absolute")}>
    <PanningWindow
        displacement={{ x: displacement.x + displacement.width / 2, y: displacement.y + displacement.height / 2 }}
        {initialZoom}>
        <div use:resize={updateDisplacement}>
            {#if $currentComponent}
                <PreviewScreen />
            {/if}
        </div>
        <svelte:fragment slot="drawable" let:anchorBox>
            <!-- <DrawingScreen ready={drawingReady} {anchorBox} /> -->
        </svelte:fragment>
    </PanningWindow>
</div>
<!-- <div
    class={cn(
        "absolute flex justify-center items-center transition-opacity pointer-events-none",
        ready ? "opacity-0" : "opacity-100",
    )}
    style="top:{displacement.y}px;left:{displacement.x}px;width:{displacement.width}px;height:{displacement.height}px;">
    <Spinner size="medium" />
</div> -->
