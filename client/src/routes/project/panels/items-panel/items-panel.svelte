<!-- @format -->

<script lang="ts">
    import type { Component } from "$framework/component"
    import * as Card from "$lib/components/ui/card"
    import * as Tabs from "$lib/components/ui/tabs"
    import ComponentSection from "./component-section.svelte"
    import PageSection from "./page-section.svelte"
    let selectedSection = "page"
    export let project: any
    export let current: Component | undefined
    const { projectData } = project.project

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
        <PageSection on:switchSelection current={currentPage} {project} />
    {:else if selectedSection == "component"}
        <ComponentSection on:switchSelection current={currentComponent} {project} />
    {/if}
</Card.Root>
