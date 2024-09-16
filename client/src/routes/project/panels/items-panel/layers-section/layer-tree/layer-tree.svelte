<!-- @format -->
<script lang="ts">
    import type { ParentComponent } from "$framework/component"
    import type { ComponentLoader } from "$framework/element-loader"
    import { COMPONENT_LOADER_CONTEXT_KEY } from "$lib/constants"
    import { ComponentTypes } from "$shared/sharedb"
    import { getContext } from "svelte"
    import type { Writable } from "svelte/store"
    import ComponentRow from "./component-row.svelte"

    const componentLoader: ComponentLoader = getContext(COMPONENT_LOADER_CONTEXT_KEY)
    const mainComponent: Writable<ParentComponent | undefined> = componentLoader.main
    $: componentTree = $mainComponent?.doc?.data?.children
</script>

{#if $mainComponent?.componentType == ComponentTypes.TREE}
    {#each componentTree as slot}
        {#each slot as layer}
            <ComponentRow {layer} />
        {/each}
    {/each}
{/if}
