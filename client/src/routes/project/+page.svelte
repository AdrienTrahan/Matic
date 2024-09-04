<!-- @format -->

<script lang="ts">
    import { ParentComponent } from "$framework/component"
    import { get } from "svelte/store"
    import ComponentPreview from "./component-preview.svelte"
    import ItemsPanel from "./panels/items-panel/items-panel.svelte"
    import PropertiesPanel from "./panels/properties-panel/properties-panel.svelte"
    import ToolPanel from "./panels/tool-panel/tool-panel.svelte"
    import PanningWindow from "./panning-window.svelte"
    import type { Project } from "$framework/project"
    export let data: {
        projectId: string
        project: Project
        projectData: any
    }

    const { projectData } = data.project
    let currentComponent

    loadComponent($projectData.pages[Object.keys($projectData.pages)[0]])

    async function loadComponent(id: string) {
        currentComponent = await ParentComponent.init(id, data.projectId)
    }
    async function switchSelectedComponent(id: string) {
        loadComponent(id)
    }
</script>

<div class="fixed inset-0 flex justify-center">
    <div class="absolute inset-0 z-0 bg-zinc-100">
        <PanningWindow>
            <div>
                {#if currentComponent}
                    <ComponentPreview component={currentComponent} />
                {/if}
            </div>
        </PanningWindow>
    </div>
    <div class="absolute p-2 z-10 top-0 left-0 right-0">
        <ToolPanel projectName={data.projectData.project_name} />
    </div>
    <div class="absolute pl-2 pb-2 z-10 left-0 top-14 bottom-0">
        <ItemsPanel
            current={currentComponent}
            on:switchSelection={({ detail: { id } }) => switchSelectedComponent(id)}
            project={data} />
    </div>
    <div class="pr-2 pb-2 z-10 fixed right-0 bottom-0 top-14">
        <PropertiesPanel />
    </div>
</div>
