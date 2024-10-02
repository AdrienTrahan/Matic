<!-- @format -->
<script lang="ts">
    import type { Project } from "$framework/project"
    import { hoveredElement } from "$framework/selector"
    import { FALLBACK_LAYER_NAME, PROJECT_CONTEXT_KEY } from "$lib/constants"
    import { cn } from "$lib/utils"
    import { getContext } from "svelte"
    import { TriangleRight } from "svelte-radix"

    export let layer
    const project: Project = getContext(PROJECT_CONTEXT_KEY)
    const editor = project.getEditor()
    $: currentComponent = $editor.getComponentWithId(layer.id)
    $: componentData = currentComponent.componentData

    $: slots = layer.children.slice(0, $componentData.slots.length)
    let collapsed = false
</script>

<div>
    <div
        class={cn(
            "mx-2 p-2 rounded-md text-xs font-medium flex",
            $hoveredElement?.uniqueId && layer.unique == $hoveredElement?.uniqueId ? "bg-zinc-100" : "",
        )}>
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
        <div class="ml-4 mb-2">
            {#each $componentData.slots as _, index}
                <div class="-mb-3 -mt-1">
                    {#if $componentData.slots.length > 1}
                        <h4 class="text-xs text-zinc-400 ml-9 -my-1 cursor-default select-none">
                            {$componentData.slots[index]}
                        </h4>
                    {/if}
                    {#each slots[index] ?? [] as childLayer}
                        <svelte:self layer={childLayer} />
                    {/each}
                </div>
            {/each}
        </div>
    {/if}
</div>
