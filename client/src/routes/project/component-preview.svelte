<!-- @format -->
<script lang="ts">
    import type { ParentComponent } from "$framework/component"
    import type { ComponentLoader } from "$framework/loader"
    import { Bundler, srcdoc } from "$lib/components/utils/bundler"
    import { LOADER_CONTEXT_KEY } from "$lib/constants"
    import { getContext } from "svelte"
    import { type Writable } from "svelte/store"

    let iframes: (HTMLIFrameElement | null)[] = [null]
    let disabled = false

    const loader: ComponentLoader = getContext(LOADER_CONTEXT_KEY)
    const component: Writable<ParentComponent | undefined> = loader.main
    $: bundle = $component?.bundle
</script>

{#if $component && $bundle}
    <Bundler bind:disabled {iframes} files={$bundle} theme="light" />
    <div class="w-[20vw] h-[30vw] ml-52 relative bg-white overflow-hidden translate-y-[calc(50%-15vh)]">
        <iframe
            class="pointer-events-none select-none w-full h-full"
            title="Preview"
            bind:this={iframes[0]}
            sandbox={["allow-scripts"].join(" ")}
            {srcdoc} />
    </div>
{/if}
