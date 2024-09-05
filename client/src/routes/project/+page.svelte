<!-- @format -->
<script lang="ts">
    import { ParentComponent } from "$framework/component"
    import type { Project } from "$framework/project"
    import { LOADER_CONTEXT_KEY, PROJECT_CONTEXT_KEY } from "$lib/constants"
    import { setContext } from "svelte"
    import ComponentPreview from "./component-preview.svelte"
    import ItemsPanel from "./panels/items-panel/items-panel.svelte"
    import PropertiesPanel from "./panels/properties-panel/properties-panel.svelte"
    import ToolPanel from "./panels/tool-panel/tool-panel.svelte"
    import PanningWindow from "./panning-window.svelte"
    import type { ComponentLoader } from "$framework/loader"
    import { Connector } from "$framework/socket/connection"

    export let data: {
        project: Project
        loader: ComponentLoader
    }

    const { project, loader } = data

    setContext(PROJECT_CONTEXT_KEY, project)
    setContext(LOADER_CONTEXT_KEY, loader)

    const { data: projectData } = data.project

    loadComponent($projectData.pages[Object.keys($projectData.pages)[0]])

    async function loadComponent(id: string) {
        const connection = await Connector.get(project.id)
        await ParentComponent.init(id, loader, connection)
    }

    async function switchSelectedComponent(id: string) {
        loadComponent(id)
    }
</script>
@format

<div class="fixed inset-0 flex justify-center">
    <div class="absolute inset-0 z-0 bg-zinc-100">
        <PanningWindow>
            <div>
                {#if loader.main}
                    <ComponentPreview />
                {/if}
            </div>
        </PanningWindow>
    </div>
    <div class="absolute p-2 z-10 top-0 left-0 right-0">
        <ToolPanel />
    </div>
    <div class="absolute pl-2 pb-2 z-10 left-0 top-14 bottom-0">
        <ItemsPanel on:switchSelection={({ detail: { id } }) => switchSelectedComponent(id)} />
    </div>
    <div class="pr-2 pb-2 z-10 fixed right-0 bottom-0 top-14">
        <PropertiesPanel />
    </div>
</div>
