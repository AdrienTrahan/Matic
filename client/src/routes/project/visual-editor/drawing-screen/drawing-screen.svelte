<!-- @format -->
<script lang="ts">
    import type { PluginLoader } from "$framework/element-loader"
    import { Bundler, srcdoc } from "$lib/components/utils/bundler"
    import {
        DRAWABLE_SHOWN_CONTEXT_KEY,
        EVENT_INTERCEPTOR_CONTEXT_KEY,
        PLUGIN_LOADER_CONTEXT_KEY,
    } from "$lib/constants"
    import { clearObjectProperties, serializeObject } from "$lib/utils"
    import { getContext, onMount } from "svelte"
    import { derived, get, type Writable } from "svelte/store"
    import uniqid from "uniqid"
    import { getDrawableBundle, injectedJS } from "./drawable-bundle"

    export let anchorBox: Writable<{ width: number; height: number; top: number; left: number }>
    export let ready: Writable<boolean>
    let iframe
    let registeredResizes = {}
    let showDrawable: Writable<boolean> = getContext(DRAWABLE_SHOWN_CONTEXT_KEY)

    const { loadedPlugins, pluginsStructure }: PluginLoader = getContext(PLUGIN_LOADER_CONTEXT_KEY)

    let bundle = derived([loadedPlugins, pluginsStructure], () => getDrawableBundle($loadedPlugins, $pluginsStructure))

    const events: Writable<Set<any>> = getContext(EVENT_INTERCEPTOR_CONTEXT_KEY)

    onMount(() => {
        $events.add(onEventHandler)
        return () => {
            $events.delete(onEventHandler)
        }
    })

    export const onEventHandler = event => {
        event.event = serializeObject(event.event)
        event.event = clearObjectProperties(event.event)
        sendMessage("pointer", true, event)
    }

    anchorBox.subscribe(anchorBoxHasChanged)
    async function anchorBoxHasChanged(newAnchorBox = get(anchorBox)) {
        if ($ready) {
            let eventId = uniqid()
            registeredResizes[eventId] = true
            sendMessage("resize", true, {
                anchorBox: newAnchorBox,
                unique: eventId,
            })
        }
    }

    function sendMessage(action: string, functional: boolean = false, message: any) {
        if (!iframe) return
        iframe?.contentWindow?.postMessage(
            {
                action,
                functional,
                data: message,
            },
            "*",
        )
    }

    function iframeHasResized({ data: { unique } }) {
        delete registeredResizes[unique]
        if (Object.keys(registeredResizes).length == 0) {
            $showDrawable = true
        }
    }
</script>

<Bundler
    {injectedJS}
    iframes={[iframe]}
    handlers={[
        {
            load: () => {
                ready.set(true)
                anchorBoxHasChanged()
            },
            resized: iframeHasResized,
        },
    ]}
    files={$bundle}
    theme="light" />
<div class="absolute inset-0">
    <iframe
        allowtransparency={true}
        class="absolute w-full h-full inset-0 z-10 select-none pointer-events-none"
        title="drawable"
        bind:this={iframe}
        {srcdoc}
        sandbox={["allow-scripts"].join(" ")} />
</div>
