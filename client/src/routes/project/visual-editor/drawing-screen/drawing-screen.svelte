<!-- @format -->
<script lang="ts">
    import { getDrawableFiles, getDrawableInjectedCode } from "$framework/bundler/drawable"
    import type { Project } from "$framework/project"
    import type { Viewer } from "$framework/viewer"
    import { Bundler } from "$lib/components/utils/bundler"
    import { IS_TRANSFORMING_CONTEXT_KEY, PROJECT_CONTEXT_KEY } from "$lib/constants"
    import { getContext } from "svelte"
    import { derived, writable, type Writable } from "svelte/store"

    const project: Project = getContext(PROJECT_CONTEXT_KEY)
    const editor = project.getEditor()
    const viewer: Writable<Viewer> = writable($editor.getViewer())
    $: viewer.set($editor.getViewer())
    $: drawableIframe = $viewer.drawableIframe

    const isTransforming: Writable<boolean> = getContext(IS_TRANSFORMING_CONTEXT_KEY)
    const connector = derived([viewer], ([$viewer]) => $viewer.getConnector())

    $: pluginDependencies = $editor
        .getAllPluginsDependencies()
        .map(dependencyId => $editor.getPluginWithId(dependencyId))

    $: drawableFiles = getDrawableFiles(pluginDependencies)
</script>

<Bundler iframes={[$drawableIframe]} handlers={[$connector.handlers]} files={drawableFiles} theme="light" />
<div class="absolute inset-0 transition-all duration-200" style="opacity:{$isTransforming ? 0 : 1};">
    <iframe
        allowtransparency={true}
        class="absolute w-full h-full inset-0 z-10 select-none pointer-events-none"
        title="drawable"
        bind:this={$drawableIframe}
        style="display:{$isTransforming ? 'none' : 'block'};"
        sandbox={["allow-scripts"].join(" ")}
        srcdoc={getDrawableInjectedCode()} />
</div>
