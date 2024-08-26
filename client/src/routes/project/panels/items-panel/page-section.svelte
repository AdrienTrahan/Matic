<!-- @format -->
<script lang="ts">
    import { Button } from "$lib/components/ui/button"
    import { createEventDispatcher } from "svelte"
    const dispatch = createEventDispatcher()
    export let pages: string[] = []
    export let currentPage: string
</script>

<div class="flex-col">
    {#each pages as page}
        <div class="flex">
            <Button
                on:click={() => (currentPage = page)}
                variant={page == currentPage ? "secondary" : "ghost"}
                class="flex-1 m-2 justify-start"
                size="sm">{page}</Button>
        </div>
    {/each}
</div>
