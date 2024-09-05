<!-- @format -->

<script lang="ts">
    import type { Component, ParentComponent } from "$framework/component"
    import * as Card from "$lib/components/ui/card"
    import * as Tabs from "$lib/components/ui/tabs"
    import { getContext } from "svelte"
    import ComponentSection from "./component-section.svelte"
    import PageSection from "./page-section.svelte"
    import { LOADER_CONTEXT_KEY, PROJECT_CONTEXT_KEY } from "$lib/constants"
    import type { Project } from "$framework/project"
    import type { ComponentLoader } from "$framework/loader"

    let selectedSection = "page"

    const project: Project = getContext(PROJECT_CONTEXT_KEY)
    const loader: ComponentLoader = getContext(LOADER_CONTEXT_KEY)

    const current: ParentComponent | undefined = loader.main
    const { data: projectData } = project

    $: currentPage = Object.values($projectData.pages).some(page => current && page == current?.id)
        ? current
        : undefined
    $: currentComponent = Object.keys($projectData.library).some(component => current && component == current?.id)
        ? current
        : undefined
</script>

<Card.Root class="w-52 h-full flex flex-col">
    <Card.Content class="flex-col justify-center items-center p-0">
        <Tabs.Root class="flex" bind:value={selectedSection}>
            <Tabs.List class="flex-1 m-2 select-none">
                <Tabs.Trigger value={"page"}>Pages</Tabs.Trigger>
                <Tabs.Trigger value={"component"}>Components</Tabs.Trigger>
            </Tabs.List>
        </Tabs.Root>
    </Card.Content>
    {#if selectedSection == "page"}
        <PageSection on:switchSelection current={currentPage} />
    {:else if selectedSection == "component"}
        <ComponentSection on:switchSelection current={currentComponent} />
    {/if}
</Card.Root>
