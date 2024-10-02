<!-- @format -->

<script lang="ts">
    import type { Project } from "$framework/project"
    import * as Card from "$lib/components/ui/card"
    import * as Tabs from "$lib/components/ui/tabs"
    import { PROJECT_CONTEXT_KEY } from "$lib/constants"
    import { getContext } from "svelte"
    import ComponentSection from "./component-section/component-section.svelte"
    import LayersSection from "./layers-section/layers-section.svelte"
    import PageSection from "./page-section/page-section.svelte"
    let selectedSection = "page"

    const project: Project = getContext(PROJECT_CONTEXT_KEY)
    const editor = project.getEditor()
</script>

<div class="h-full flex-col flex min-h-0">
    <div class="flex flex-1 gap-2 min-h-0">
        <Card.Root class="w-64 h-full flex flex-col">
            <Card.Content class="flex-col justify-center items-center p-0">
                <Tabs.Root class="flex" bind:value={selectedSection}>
                    <Tabs.List class="flex-1 m-2 select-none">
                        <Tabs.Trigger value={"page"}>Pages</Tabs.Trigger>
                        <Tabs.Trigger value={"component"}>Components</Tabs.Trigger>
                        <Tabs.Trigger value={"layers"}>Layers</Tabs.Trigger>
                    </Tabs.List>
                </Tabs.Root>
            </Card.Content>
            {#key $editor}
                {#if selectedSection == "page"}
                    <PageSection on:switchSelection />
                {:else if selectedSection == "component"}
                    <ComponentSection on:switchSelection />
                {:else if selectedSection == "layers"}
                    <LayersSection />
                {/if}
            {/key}
        </Card.Root>
    </div>
</div>
