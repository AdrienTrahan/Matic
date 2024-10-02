<!-- @format -->
<script lang="ts">
    import type { Project } from "$framework/project"
    import { Button } from "$lib/components/ui/button"
    import { PROJECT_CONTEXT_KEY } from "$lib/constants"
    import { createEventDispatcher, getContext } from "svelte"
    const dispatch = createEventDispatcher()
    const project: Project = getContext(PROJECT_CONTEXT_KEY)
    const editor = project.getEditor()
    $: current = $editor.getPresentedComponent()
    const pages = project.pages

    $: currentPage = Object.values($pages).some(page => $current && page == $current?.id) ? $current : undefined

    function selectPageWithId(id: string) {
        dispatch("switchSelection", { id })
    }
</script>

<div>
    <h1 class="text-lg font-bold mx-4 my-2">Pages</h1>
    {#each Object.entries($pages) as [page, id]}
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
