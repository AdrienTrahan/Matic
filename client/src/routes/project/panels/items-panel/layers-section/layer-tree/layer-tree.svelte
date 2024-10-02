<!-- @format -->
<script lang="ts">
    import type { Component } from "$framework/component"
    import type { Project } from "$framework/project"
    import { PROJECT_CONTEXT_KEY } from "$lib/constants"
    import { ComponentTypes } from "$shared/sharedb"
    import { getContext } from "svelte"
    import type { Writable } from "svelte/store"
    import ComponentRow from "./component-row.svelte"

    const project: Project = getContext(PROJECT_CONTEXT_KEY)
    const editor = project.getEditor()
    $: mainComponent = $editor.getPresentedComponent()
    $: componentTree = $mainComponent?.documentData.children
</script>

{#if $mainComponent?.componentType == ComponentTypes.TREE}
    {#each componentTree as slot}
        {#each slot as layer}
            <ComponentRow {layer} />
        {/each}
    {/each}
{/if}
