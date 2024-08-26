<!-- @format -->

<script lang="ts">
    import * as Tabs from "$lib/components/ui/tabs"
    import * as Card from "$lib/components/ui/card"
    import ComponentSection from "./component-section.svelte"
    import PageSection from "./page-section.svelte"
    let selectedSection = "page"
    export let pages: string[]
    export let currentPage
</script>

<Card.Root class="w-52 h-full">
    <Card.Content class="flex-col justify-center items-center p-0">
        <Tabs.Root class="flex" bind:value={selectedSection}>
            <Tabs.List class="flex-1 m-2">
                <Tabs.Trigger value={"page"}>Pages</Tabs.Trigger>
                <Tabs.Trigger value={"component"}>Components</Tabs.Trigger>
            </Tabs.List>
        </Tabs.Root>
    </Card.Content>
    {#if selectedSection == "page"}
        <PageSection bind:currentPage {pages} />
    {:else if selectedSection == "component"}
        <ComponentSection />
    {/if}
</Card.Root>
