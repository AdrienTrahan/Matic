<!-- @format -->
<script lang="ts">
    import { Bundler, type File, srcdoc } from "$lib/components/utils/bundler"
    import { getPointerInjectionCode } from "$framework/drawable/pointer-inject"
    import { EVENT_INTERCEPTOR_CONTEXT_KEY } from "$lib/constants"
    import { clearObjectProperties, serializeObject } from "$lib/utils"
    import { getContext, onMount } from "svelte"
    import { writable, type Writable } from "svelte/store"
    import { getResizeHandlerComponent } from "$framework/drawable/resize-handler"
    export let anchorBox: Writable<{ width: number; height: number; top: number; left: number }>
    let iframe

    let bundle: Writable<File[]> = writable([
        {
            name: "App",
            type: "svelte",
            source:
                `<scr` +
                `ipt>
                    import ResizeHandler from "./resize-handler.svelte"
                </sc` +
                `ript>
                <ResizeHandler>
                    asd
                </ResizeHandler>
            `,
        },
        getResizeHandlerComponent(),
    ])
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

    anchorBox.subscribe(anchorBox => {
        sendMessage("resize", true, {
            anchorBox,
        })
    })

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
    $: injectedJS = getPointerInjectionCode()
</script>

<!-- @format -->
<Bundler {injectedJS} iframes={[iframe]} files={$bundle} theme="light" />
<div class="absolute inset-0">
    <iframe
        allowtransparency={true}
        class="absolute w-full h-full inset-0 z-10 select-none pointer-events-none"
        title="drawable"
        bind:this={iframe}
        {srcdoc}
        sandbox={["allow-scripts"].join(" ")} />
</div>
