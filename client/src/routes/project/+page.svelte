<!-- @format -->

<script lang="ts">
    import { ParentComponent } from "$framework/component"
    import ItemsPanel from "./panels/items-panel/items-panel.svelte"
    import PropertiesPanel from "./panels/properties-panel/properties-panel.svelte"
    import ToolPanel from "./panels/tool-panel/tool-panel.svelte"
    export let data: any
    let currentPageName = Object.keys(data.pages)[0]
    let pageManager

    $: {
        loadPage()
    }

    async function loadPage() {
        pageManager = await ParentComponent.init(data.pages[currentPageName].classId, data.projectId)
    }
</script>

<div class="fixed inset-0 flex justify-center">
    <div class="absolute inset-0 z-0 bg-zinc-100"></div>
    <div class="absolute p-2 z-10 top-0 left-0 right-0">
        <ToolPanel projectName={data.projectData.project_name} />
    </div>
    <div class="absolute pl-2 pb-2 z-10 left-0 top-14 bottom-0">
        <ItemsPanel bind:currentPage={currentPageName} pages={Object.keys(data.pages)} />
    </div>
    <div class="pr-2 pb-2 z-10 fixed right-0 bottom-0 top-14">
        <PropertiesPanel />
    </div>
</div>
