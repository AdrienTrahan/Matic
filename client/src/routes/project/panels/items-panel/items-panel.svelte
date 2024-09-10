<!-- @format -->

<script lang="ts">
    import * as Card from "$lib/components/ui/card"
    import * as Tabs from "$lib/components/ui/tabs"
    import ComponentSection from "./component-section/component-section.svelte"
    import LayersSection from "./layers-section/layers-section.svelte"
    import PageSection from "./page-section/page-section.svelte"
    let selectedSection = "page"
</script>

<div class="h-full flex-col flex">
    <div class="flex flex-1 gap-2">
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
            {#if selectedSection == "page"}
                <PageSection on:switchSelection />
            {:else if selectedSection == "component"}
                <ComponentSection on:switchSelection />
            {:else if selectedSection == "layers"}
                <LayersSection />
            {/if}
        </Card.Root>
    </div>
</div>
