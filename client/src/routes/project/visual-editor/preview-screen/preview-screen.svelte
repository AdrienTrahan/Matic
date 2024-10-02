<!-- @format -->
<script lang="ts">
    import { getPreviewFiles, getPreviewInjectedCode } from "$framework/bundler/preview"
    import type { Project } from "$framework/project"
    import type { Viewer } from "$framework/viewer"
    import { Bundler } from "$lib/components/utils/bundler"
    import { MIN_PAGE_HEIGHT, PROJECT_CONTEXT_KEY } from "$lib/constants"
    import { getContext, onDestroy, onMount, tick } from "svelte"
    import type { Unsubscriber } from "svelte/motion"
    import { derived, writable, type Writable } from "svelte/store"
    const project: Project = getContext(PROJECT_CONTEXT_KEY)
    const editor = project.getEditor()
    const viewer: Writable<Viewer> = writable($editor.getViewer())

    $: viewer.set($editor.getViewer())
    const connector = derived([viewer], ([$viewer]) => $viewer.getConnector())

    const boxes: Writable<
        {
            x: number
            y: number
            w: number
            h: number
        }[]
    > = writable([])

    const windowCount: Writable<number> = writable(0)
    $: previewIframes = $viewer.previewIframes

    let boxesUnsubscriber: Unsubscriber | null = null
    let windowCountUnsubscriber: Unsubscriber | null = null

    $: {
        if (boxesUnsubscriber != null) boxesUnsubscriber()
        if (windowCountUnsubscriber != null) windowCountUnsubscriber()
        boxesUnsubscriber = $viewer.boxes.subscribe(async $boxes => {
            boxes.set($boxes)
        })
        windowCountUnsubscriber = $viewer.windowCount.subscribe($windowCount => {
            windowCount.set($windowCount)
        })
    }

    $: componentDependencies = $editor
        .getAllComponentsFileDependencies()
        .map(dependencyId => $editor.getComponentWithId(dependencyId))

    $: previewFiles = getPreviewFiles(componentDependencies)
    $: origin = { x: ($boxes[0]?.x ?? 0) + ($boxes[0]?.w ?? 0) / 2, y: ($boxes[0]?.y ?? 0) + ($boxes[0]?.h ?? 0) / 2 }

    onDestroy(() => {
        if (boxesUnsubscriber != null) boxesUnsubscriber()
        if (windowCountUnsubscriber != null) windowCountUnsubscriber()
    })
</script>

<Bundler
    iframes={Object.values($previewIframes)}
    files={previewFiles}
    handlers={Array($windowCount)
        .fill(0)
        .map(() => $connector.handlers)}
    theme="light" />
<div class="flex gap-x-8 relative">
    {#each $boxes as box, index}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            class="absolute bg-white overflow-hidden"
            style="left:{(box.x ?? 0) - origin.x}px;top:{(box.y ?? 0) - origin.y}px;width:{box.w ??
                0}px;height:{Math.max(box.h ?? 0, MIN_PAGE_HEIGHT)}px;">
            <iframe
                class="pointer-events-none select-none w-full h-full"
                title="Preview"
                bind:this={$previewIframes[index]}
                sandbox={["allow-scripts"].join(" ")}
                srcdoc={getPreviewInjectedCode(index)} />
        </div>
    {/each}
</div>
