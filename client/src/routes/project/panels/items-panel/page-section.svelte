<!-- @format -->
<script lang="ts">
    import type { Component } from "$framework/component"
    import type { Project } from "$framework/project"
    import { Button } from "$lib/components/ui/button"
    import { PROJECT_CONTEXT_KEY } from "$lib/constants"
    import { createEventDispatcher, getContext } from "svelte"
    const dispatch = createEventDispatcher()

    const project: Project = getContext(PROJECT_CONTEXT_KEY)
    export let current: Component | undefined
    const { data: projectData } = project

    function selectPageWithId(id: string) {
        dispatch("switchSelection", { id })
    }

    $: pages = Object.entries($projectData.pages) as any
</script>

<div>
    {#each pages as [page, id]}
        <div class="flex">
            <Button
                on:click={() => selectPageWithId(id)}
                variant={current && current.id == id ? "secondary" : "ghost"}
                class="flex-1 mx-2 justify-start shadow-none"
                size="sm">{page}</Button>
        </div>
    {/each}
</div>
