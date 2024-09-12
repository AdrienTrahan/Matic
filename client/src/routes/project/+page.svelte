<!-- @format -->
<script lang="ts">
    import { ParentComponent } from "$framework/component"
    import type { ComponentLoader } from "$framework/loader"
    import type { Project } from "$framework/project"
    import { Connector } from "$framework/socket/connection"
    import { LOADER_CONTEXT_KEY, PANZOOM_TRANSFORM_CONTEXT_KEY, PROJECT_CONTEXT_KEY } from "$lib/constants"
    import { onMount, setContext } from "svelte"
    import { writable } from "svelte/store"
    import ItemsPanel from "./panels/items-panel/items-panel.svelte"
    import PropertiesPanel from "./panels/properties-panel/properties-panel.svelte"
    import ToolPanel from "./panels/tool-panel/tool-panel.svelte"
    import VisualEditor from "./visual-editor/visual-editor.svelte"
    import { resize } from "svelte-resize-observer-action"

    export let data: {
        project: Project
        loader: ComponentLoader
    }

    const { project, loader } = data
    const { data: projectData } = project

    let editorSection: HTMLDivElement
    let displacement = {
        x: 0,
        y: 0,
    }

    setContext(PROJECT_CONTEXT_KEY, project)
    setContext(LOADER_CONTEXT_KEY, loader)
    setContext(PANZOOM_TRANSFORM_CONTEXT_KEY, writable({ x: 0, y: 0, scale: 1 }))

    loadComponent($projectData.pages[Object.keys($projectData.pages)[0]])

    async function loadComponent(id: string) {
        const connection = await Connector.get(project.id)
        await ParentComponent.init(id, loader, connection)
    }

    async function switchSelectedComponent(id: string) {
        loadComponent(id)
    }
    onMount(() => {
        setDisplacement()
    })

    function setDisplacement() {
        const { x, y, width, height } = editorSection.getBoundingClientRect()
        displacement = { x: x + width / 2, y: y + height / 2 }
    }
</script>

<div class="fixed inset-0 flex flex-col pointer-events-none">
    <div class="absolute inset-0 z-0 bg-zinc-100 pointer-events-auto">
        <VisualEditor {displacement} />
    </div>
    <div class="z-20 p-1 pointer-events-auto">
        <ToolPanel />
    </div>
    <div class="flex flex-1 z-20 pt-0 p-1">
        <div class="pointer-events-auto">
            <ItemsPanel on:switchSelection={({ detail: { id } }) => switchSelectedComponent(id)} />
        </div>
        <div class="flex-1 pointer-events-none" use:resize={setDisplacement} bind:this={editorSection}></div>
        <div class="pointer-events-auto">
            <PropertiesPanel />
        </div>
    </div>
</div>
