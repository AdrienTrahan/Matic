<!-- @format -->
<script lang="ts">
    import { ParentComponent } from "$framework/component"
    import type { ComponentLoader, PluginLoader } from "$framework/element-loader"
    import type { Project } from "$framework/project"
    import { Connector } from "$framework/socket/connection"
    import {
        COMPONENT_LOADER_CONTEXT_KEY,
        PANZOOM_TRANSFORM_CONTEXT_KEY,
        PLUGIN_LOADER_CONTEXT_KEY,
        PROJECT_CONTEXT_KEY,
    } from "$lib/constants"
    import { onMount, setContext } from "svelte"
    import { resize } from "svelte-resize-observer-action"
    import { get, writable } from "svelte/store"
    import ItemsPanel from "./panels/items-panel/items-panel.svelte"
    import PropertiesPanel from "./panels/properties-panel/properties-panel.svelte"
    import ToolPanel from "./panels/tool-panel/tool-panel.svelte"
    import VisualEditor from "./visual-editor/visual-editor.svelte"

    export let data: {
        project: Project
        componentLoader: ComponentLoader
        pluginLoader: PluginLoader
    }

    const { project, componentLoader, pluginLoader } = data
    const { data: projectData } = project

    const currentComponent = componentLoader.main

    let editorSection: HTMLDivElement
    let displacement = {
        x: 0,
        y: 0,
    }

    setContext(PROJECT_CONTEXT_KEY, project)
    setContext(COMPONENT_LOADER_CONTEXT_KEY, componentLoader)
    setContext(PLUGIN_LOADER_CONTEXT_KEY, pluginLoader)
    setContext(PANZOOM_TRANSFORM_CONTEXT_KEY, writable({ x: 0, y: 0, scale: 1 }))

    loadComponent($projectData.pages[Object.keys($projectData.pages)[0]])

    async function loadComponent(id: string) {
        pluginLoader.clearLoadedPlugins()
        componentLoader.clearLoadedElements()

        const connection = await Connector.get(project.id)
        let parentComponent = await ParentComponent.init(id, componentLoader, connection)

        await pluginLoader.loadPluginsFromComponent(parentComponent, connection)

        parentComponent.bundleCode(pluginLoader)
    }

    async function switchSelectedComponent(id: string) {
        await loadComponent(id)
    }

    onMount(() => {
        setDisplacement()
    })

    function setDisplacement() {
        displacement = editorSection.getBoundingClientRect()
    }
</script>

<div class="fixed inset-0 flex flex-col pointer-events-none">
    <div class="absolute inset-0 z-0 bg-zinc-100 pointer-events-auto">
        {#key $currentComponent}
            {#if $currentComponent}
                <VisualEditor {displacement} />
            {/if}
        {/key}
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
