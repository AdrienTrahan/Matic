<!-- @format
<script lang="ts">
    import type { ParentComponent } from "$framework/component"
    import type { ComponentLoader } from "$framework/loader"
    import { Bundler, srcdoc } from "$lib/components/utils/bundler"
    import { LOADER_CONTEXT_KEY } from "$lib/constants"
    import { getContext } from "svelte"

    let iframes: (HTMLIFrameElement | null)[] = [null]
    const loader: ComponentLoader = getContext(LOADER_CONTEXT_KEY)

    const component: ParentComponent = loader.main!
    let disabled = false
</script>

{#if loader.main}
    {#if component.bundle}
        <Bundler bind:disabled {iframes} files={component.bundle} theme="light" />
        <div class="w-[40vw] h-[60vw] relative bg-white overflow-hidden translate-y-[calc(50%-30vh)]">
            <iframe
                class="pointer-events-none select-none w-full h-full"
                title="Preview"
                bind:this={iframes[0]}
                sandbox={["allow-scripts"].join(" ")}
                {srcdoc} />
        </div>
    {/if}
{/if} -->
