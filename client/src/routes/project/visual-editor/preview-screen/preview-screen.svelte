<!-- @format -->
<script lang="ts">
    import type { ParentComponent } from "$framework/component"
    import type { ComponentLoader } from "$framework/element-loader"
    import { Bundler, srcdoc } from "$lib/components/utils/bundler"
    import { COMPONENT_LOADER_CONTEXT_KEY } from "$lib/constants"
    import { getContext } from "svelte"
    import { type Writable } from "svelte/store"

    let iframes: (HTMLIFrameElement | null)[] = [null]

    let iframeData: {
        loaded: boolean
    }[] = Array(iframes.length)
        .fill(0)
        .map(() => ({
            loaded: false,
        }))

    let handlers: any[] = Array(iframes.length)
        .fill(0)
        .map((_, index) => ({
            loaded: () => (iframeData[index].loaded = true),
        }))

    export let ready: Writable<boolean>
    $: {
        $ready = iframeData.every(({ loaded }) => loaded)
    }

    let disabled = false

    const componentLoader: ComponentLoader = getContext(COMPONENT_LOADER_CONTEXT_KEY)
    const component: Writable<ParentComponent | undefined> = componentLoader.main

    $: bundle = $component?.bundle
</script>

{#if $component && $bundle}
    <Bundler bind:disabled {iframes} {handlers} files={$bundle} theme="light" />
    {#each iframes as _, index}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="w-48 h-96 relative bg-white overflow-hidden">
            <iframe
                class="pointer-events-none select-none w-full h-full"
                title="Preview"
                bind:this={iframes[index]}
                sandbox={["allow-scripts"].join(" ")}
                {srcdoc} />
        </div>
    {/each}
{/if}
