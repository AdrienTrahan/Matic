<!-- @format -->
<script lang="ts">
    import type { Project } from "$framework/project"
    import Spinner from "$lib/components/ui/spinner/spinner.svelte"
    import { INITIAL_ZOOM, PROJECT_CONTEXT_KEY } from "$lib/constants"
    import { cn } from "$lib/utils"
    import { getContext, onDestroy, onMount } from "svelte"
    import { resize } from "svelte-resize-observer-action"
    import type { Unsubscriber } from "svelte/motion"
    import { derived, get, writable, type Writable } from "svelte/store"
    import DrawingScreen from "./drawing-screen/drawing-screen.svelte"
    import PanningWindow from "./panning-window.svelte"
    import PreviewScreen from "./preview-screen/preview-screen.svelte"

    const project: Project = getContext(PROJECT_CONTEXT_KEY)
    const editor = project.getEditor()
    $: currentComponent = $editor.getPresentedComponent()
    const viewer = derived([editor], ([$editor]) => $editor.getViewer())
    const connector = derived([viewer], ([$viewer]) => $viewer.getConnector())

    let isLoaded = writable(get($connector.isLoaded))

    let isLoadedUnsubscriber: Unsubscriber | undefined
    $: {
        if (typeof isLoadedUnsubscriber === "function") isLoadedUnsubscriber()
        isLoadedUnsubscriber = $connector.isLoaded.subscribe($isLoaded => {
            isLoaded.set($isLoaded)
        })
    }

    onDestroy(() => {
        if (typeof isLoadedUnsubscriber === "function") isLoadedUnsubscriber()
    })

    export let viewRect : Writable<any>;
    const initialZoom = (INITIAL_ZOOM * $viewRect.width) / document.body.clientWidth

    let editorContainer: HTMLDivElement
    let previewSize = writable({ width: 0, height: 0 })

    let displacement = derived(viewRect, $newViewRect => ({ x: $newViewRect.x + $newViewRect.width / 2, y: $newViewRect.y + $newViewRect.height / 2 }));

    onMount(() => {
        updatePreviewSize()
    })
    async function updatePreviewSize() {
        if (editorContainer) previewSize.set(editorContainer.getBoundingClientRect())
    }
</script>

<div class={cn("transition-opacity inset-0 absolute", $isLoaded ? "opacity-100" : "opacity-0")}>
    <PanningWindow
        {displacement}
        {initialZoom}>
        <div use:resize={updatePreviewSize}>
            {#if $currentComponent}
                <PreviewScreen />
            {/if}
        </div>
        <svelte:fragment slot="drawable">
            <DrawingScreen />
        </svelte:fragment>
    </PanningWindow>
</div>
<div
    class={cn(
        "absolute flex justify-center items-center transition-opacity pointer-events-none",
        $isLoaded ? "opacity-0" : "opacity-100",
    )}
    style="top:{$viewRect.y}px;left:{$viewRect.x}px;width:{$viewRect.width}px;height:{$viewRect.height}px;">
    <Spinner size="medium" />
</div>
