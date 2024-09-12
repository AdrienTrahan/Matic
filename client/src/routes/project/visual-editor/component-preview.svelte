<!-- @format -->
<script lang="ts">
    import type { ParentComponent } from "$framework/component"
    import type { ComponentLoader } from "$framework/loader"
    import { resetHitboxes, updateHitboxes } from "$framework/selector"
    import { Bundler, srcdoc } from "$lib/components/utils/bundler"
    import { LOADER_CONTEXT_KEY } from "$lib/constants"
    import { getContext } from "svelte"
    import { type Writable } from "svelte/store"

    let iframes: (HTMLIFrameElement | null)[] = [null]

    export let outlines: {
        [key: string]: {
            x: number
            y: number
            width: number
            height: number
        }
    }[] = []

    let disabled = false

    const loader: ComponentLoader = getContext(LOADER_CONTEXT_KEY)
    const component: Writable<ParentComponent | undefined> = loader.main

    $: bundle = $component?.bundle
    $: if (bundle) {
        resetOutlines()
        resetHitboxes(iframes.length)
    }

    function resetOutlines() {
        outlines = new Array(iframes.length).fill(0).map(() => ({}))
    }

    function updateOutlines(
        viewIndex: number,
        id: string,
        outline: {
            x: number
            y: number
            width: number
            height: number
        },
    ) {
        outlines[viewIndex][id] = outline
    }
</script>

{#if $component && $bundle}
    <Bundler
        bind:disabled
        {iframes}
        handlers={{
            on_update_hitboxes: (i, { id, hitboxes }) => updateHitboxes(i, id, hitboxes),
            on_update_outlines: (i, { id, outlines }) => updateOutlines(i, id, outlines),
        }}
        files={$bundle}
        theme="light" />
    {#each iframes as iframe, index}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="w-48 h-96 relative bg-white overflow-hidden">
            <iframe
                class="pointer-events-none select-none w-full h-full"
                title="Preview"
                bind:this={iframe}
                sandbox={["allow-scripts"].join(" ")}
                {srcdoc} />
        </div>
    {/each}
{/if}
