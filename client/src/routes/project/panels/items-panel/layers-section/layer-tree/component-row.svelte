<!-- @format -->
<script lang="ts">
    import { TriangleRight } from "svelte-radix"
    import type { ComponentLoader } from "$framework/loader"
    import { FALLBACK_LAYER_NAME, LOADER_CONTEXT_KEY } from "$lib/constants"
    import { getContext } from "svelte"
    import type { Writable } from "svelte/store"
    import { cn } from "$lib/utils"

    export let layer
    const componentLoader: ComponentLoader = getContext(LOADER_CONTEXT_KEY)
    const currentComponent = componentLoader.loadedComponents[layer.id]
    const componentData: Writable<any> = currentComponent.data

    $: slots = layer.children.slice(0, $componentData.slots.length)
    let collapsed = false
</script>

<div>
    <div class="mx-2 p-2 rounded-md text-xs font-medium flex">
        <div class="w-6 -ml-1">
            {#if slots.length > 0}
                <button on:click={() => (collapsed = !collapsed)} class="my-auto cursor-pointer">
                    <div
                        class={cn(
                            "min-h-4 min-w-6 flex items-center justify-center transition-transform",
                            collapsed ? "" : "rotate-90",
                        )}>
                        <TriangleRight class="text-zinc-400" size="12" />
                    </div>
                </button>
            {/if}
        </div>
        <p class="select-none">{layer.name ?? FALLBACK_LAYER_NAME}</p>
    </div>
    {#if !collapsed}
        <div class="ml-2">
            {#each $componentData.slots as _, index}
                {#if $componentData.slots.length > 1}
                    <h4 class="text-xs ml-4">{$componentData.slots[index]}</h4>
                {/if}
                {#each slots[index] ?? [] as childLayer}
                    <svelte:self layer={childLayer} />
                {/each}
            {/each}
        </div>
    {/if}
</div>
