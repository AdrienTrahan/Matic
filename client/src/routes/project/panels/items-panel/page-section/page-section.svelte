<!-- @format -->
<script lang="ts">
    import type { ParentComponent } from "$framework/component"
    import type { ComponentLoader } from "$framework/element-loader"
    import type { Project } from "$framework/project"
    import { Button } from "$lib/components/ui/button"
    import { COMPONENT_LOADER_CONTEXT_KEY, PROJECT_CONTEXT_KEY } from "$lib/constants"
    import { createEventDispatcher, getContext } from "svelte"
    import type { Writable } from "svelte/store"
    const dispatch = createEventDispatcher()

    const project: Project = getContext(PROJECT_CONTEXT_KEY)
    const componentLoader: ComponentLoader = getContext(COMPONENT_LOADER_CONTEXT_KEY)
    const current: Writable<ParentComponent | undefined> = componentLoader.main

    const { data: projectData } = project

    $: currentPage = Object.values($projectData.pages).some(page => $current && page == $current?.id)
        ? $current
        : undefined

    function selectPageWithId(id: string) {
        dispatch("switchSelection", { id })
    }

    $: pages = Object.entries($projectData.pages) as any
</script>

<div>
    <h1 class="text-lg font-bold mx-4 my-2">Pages</h1>
    {#each pages as [page, id]}
        <div class="flex">
            <Button
                on:click={() => selectPageWithId(id)}
                variant={currentPage && currentPage.id == id ? "secondary" : "ghost"}
                class="flex-1 mx-2 justify-between shadow-none"
                size="sm"
                >{page}
            </Button>
        </div>
    {/each}
</div>
