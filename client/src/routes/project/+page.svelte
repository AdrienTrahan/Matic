<!-- @format -->
<script lang="ts">
    import type { Project } from "$framework/project"
    import { PANZOOM_TRANSFORM_CONTEXT_KEY, PROJECT_CONTEXT_KEY } from "$lib/constants"
    import { onDestroy, onMount, setContext } from "svelte"
    import { resize } from "svelte-resize-observer-action"
    import { derived, writable, type Writable } from "svelte/store"
    import ItemsPanel from "./panels/items-panel/items-panel.svelte"
    import PropertiesPanel from "./panels/properties-panel/properties-panel.svelte"
    import ToolPanel from "./panels/tool-panel/tool-panel.svelte"
    import VisualEditor from "./visual-editor/visual-editor.svelte"
    import type { Unsubscriber } from "svelte/motion"
    import type { Component } from "$framework/component"

    export let data: {
        project: Project
    }

    const { project } = data
    const { data: projectData } = project
    const editor = project.getEditor()
    let currentComponent: Writable<Component | null> = writable(null)

    let currentComponentUnsubscriber: Unsubscriber | null = null
    $: {
        if (currentComponentUnsubscriber != null) currentComponentUnsubscriber()
        currentComponentUnsubscriber = $editor.getPresentedComponent().subscribe($component => {
            currentComponent.set($component)
        })
    }
    onDestroy(() => {
        if (currentComponentUnsubscriber != null) currentComponentUnsubscriber()
    })

    let loaded = false
    let editorSection: HTMLDivElement
    let viewRect = writable({
        x: 0,
        y: 0,
        width: 0,
    })

    setContext(PROJECT_CONTEXT_KEY, project)
    setContext(PANZOOM_TRANSFORM_CONTEXT_KEY, writable({ x: 0, y: 0, scale: 1 }))

    $editor.presentComponent($projectData.pages[Object.keys($projectData.pages)[0]])

    async function switchSelectedComponent(id: string) {
        await $editor.presentComponent(id)
    }

    onMount(() => {
        setViewRect()
        loaded = true
    })

    function setViewRect() {
        $viewRect = editorSection.getBoundingClientRect()
    }
</script>

<div class="fixed inset-0 flex flex-col pointer-events-none">
    <div class="absolute inset-0 z-0 bg-zinc-100 pointer-events-auto">
        {#key $currentComponent != null}
            {#key $editor}
                {#if $currentComponent && loaded}
                    <VisualEditor {viewRect} />
                {/if}
            {/key}
        {/key}
    </div>
    <div class="z-20 p-1 pointer-events-auto">
        <ToolPanel />
    </div>
    <div class="flex flex-1 z-20 pt-0 p-1 min-h-0">
        <div class="pointer-events-auto min-h-0">
            <ItemsPanel on:switchSelection={({ detail: { id } }) => switchSelectedComponent(id)} />
        </div>
        <div class="flex-1 pointer-events-none" use:resize={setViewRect} bind:this={editorSection}></div>
        <div class="pointer-events-auto">
            <PropertiesPanel />
        </div>
    </div>
</div>
