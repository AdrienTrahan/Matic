<!-- @format -->
<script lang="ts">
    import { boxes, registeredIframes, returnMessage, setSetting } from "$framework/editor-support/connector-redirect"
    import type { PluginLoader } from "$framework/element-loader"
    import { Bundler, INJECTED_SRCDOC_SYMBOL, srcdoc } from "$lib/components/utils/bundler"
    import {
        DRAWABLE_SHOWN_CONTEXT_KEY,
        EVENT_INTERCEPTOR_CONTEXT_KEY,
        IS_TRANSFORMING_CONTEXT_KEY,
        IS_ZOOMING_CONTEXT_KEY,
        PLUGIN_LOADER_CONTEXT_KEY,
        SCALE_FACTOR_CONTEXT_KEY,
    } from "$lib/constants"
    import { clearObjectProperties, serializeObject } from "$lib/utils"
    import { getContext, onMount } from "svelte"
    import { derived, get, type Readable, type Writable } from "svelte/store"
    import uniqid from "uniqid"
    import { getDrawableBundle } from "./drawable-bundle"

    import { handleMessage } from "$framework/editor-support/connector-redirect"
    import { getPluginTypeSettingCode } from "$framework/editor-support/data-injector"
    import type { File } from "$lib/components/utils/bundler"
    import PointerInject from "$shared/injected/pointer-inject.js?raw"

    export let anchorBox: Writable<{ width: number; height: number; top: number; left: number }>
    export let ready: Writable<boolean>
    let iframe
    let registeredResizes = {}
    let showDrawable: Writable<boolean> = getContext(DRAWABLE_SHOWN_CONTEXT_KEY)

    const { loadedPlugins, pluginsStructure, loaded }: PluginLoader = getContext(PLUGIN_LOADER_CONTEXT_KEY)
    const isZooming: Writable<boolean> = getContext(IS_ZOOMING_CONTEXT_KEY)
    const isTransforming: Writable<boolean> = getContext(IS_TRANSFORMING_CONTEXT_KEY)
    const scaleFactor: Writable<number> = getContext(SCALE_FACTOR_CONTEXT_KEY)

    let bundle: Readable<File[] | undefined> = derived([loaded], () => {
        if ($loaded) {
            return getDrawableBundle($loadedPlugins, $pluginsStructure)
        }
    })

    const events: Writable<Set<any>> = getContext(EVENT_INTERCEPTOR_CONTEXT_KEY)

    onMount(() => {
        $events.add(onEventHandler)

        return () => {
            $events.delete(onEventHandler)
        }
    })
    $: registeredIframes.drawable = [iframe]

    export const onEventHandler = event => {
        event.event = serializeObject(event.event)
        event.event = clearObjectProperties(event.event)
        sendMessage("pointer", true, event)
    }
    isTransforming.subscribe(updatePanZoomState)
    isZooming.subscribe(updatePanZoomState)

    anchorBox.subscribe(anchorBoxHasChanged)
    async function anchorBoxHasChanged(newAnchorBox = get(anchorBox)) {
        if ($ready) {
            let eventId = uniqid()
            registeredResizes[eventId] = true
            sendMessage("resize", true, {
                anchorBox: newAnchorBox,
                unique: eventId,
                boxes: $boxes,
            })
        }
    }

    function updatePanZoomState() {
        sendMessage("transform", true, {
            isTransforming: $isTransforming,
            isZooming: $isZooming,
            scaleFactor: $scaleFactor,
        })
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

<!-- svelte-ignore missing-declaration -->
{#if $loaded}
    <Bundler
        injectedJS={PointerInject}
        iframes={[iframe]}
        handlers={[
            {
                load: () => {
                    ready.set(true)
                    anchorBoxHasChanged()
                },
                resized: iframeHasResized,
                call: ({ data: { receiverType, senderType, unique, key, args }, messageId }) =>
                    handleMessage(receiverType, senderType, unique, key, args, messageId),
                return: ({ data: { senderType, unique, message }, messageId }) =>
                    returnMessage(senderType, unique, message, messageId),
                setting: ({ setting, data }) => setSetting(setting, data),
            },
        ]}
        files={$bundle}
        theme="light" />
    <div class="absolute inset-0 transition-all duration-200" style="opacity:{$isTransforming ? 0 : 1};">
        <iframe
            allowtransparency={true}
            class="absolute w-full h-full inset-0 z-10 select-none pointer-events-none"
            title="drawable"
            bind:this={iframe}
            style="display:{$isTransforming ? 'none' : 'block'};"
            sandbox={["allow-scripts"].join(" ")}
            srcdoc={srcdoc.replace(INJECTED_SRCDOC_SYMBOL, getPluginTypeSettingCode("drawable"))} />
    </div>
{/if}
