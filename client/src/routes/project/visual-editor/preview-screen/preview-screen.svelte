<!-- @format -->
<script lang="ts">
    import type { ParentComponent } from "$framework/component"
    import {
        boxes,
        componentTree,
        handleMessage,
        registeredIframes,
        returnMessage,
        setAlert,
    } from "$framework/editor-support/connector-redirect"
    import { getIframeIndexSettingCode, getPluginTypeSettingCode } from "$framework/editor-support/data-injector"
    import type { ComponentLoader } from "$framework/element-loader"
    import { Bundler, INJECTED_SRCDOC_SYMBOL, srcdoc } from "$lib/components/utils/bundler"
    import { COMPONENT_LOADER_CONTEXT_KEY, MIN_PAGE_HEIGHT } from "$lib/constants"
    import { getContext, onDestroy } from "svelte"
    import { type Writable } from "svelte/store"

    const componentLoader: ComponentLoader = getContext(COMPONENT_LOADER_CONTEXT_KEY)
    const component: Writable<ParentComponent | undefined> = componentLoader.main
    let unsubscribeComponentData

    boxes.update(currentBoxes => {
        if (currentBoxes.length != $component?.documentData?.boxes?.length) return $component?.documentData?.boxes
        for (const [i, box] of currentBoxes.entries()) {
            if (box.x != $component?.documentData?.boxes[i].x) box.x = $component?.documentData?.boxes[i].x
            if (box.y != $component?.documentData?.boxes[i].y) box.y = $component?.documentData?.boxes[i].y
            if (box.w != $component?.documentData?.boxes[i].w) box.w = $component?.documentData?.boxes[i].w
        }
        return currentBoxes
    })

    if ($component?.data)
        unsubscribeComponentData = $component.data.subscribe(newComponentData => {
            componentTree.set({
                children: newComponentData.children,
                unique: newComponentData.unique,
            })
        })

    onDestroy(unsubscribeComponentData)

    $: origin = { x: ($boxes[0]?.x ?? 0) + ($boxes[0]?.w ?? 0) / 2, y: ($boxes[0]?.y ?? 0) + ($boxes[0]?.h ?? 0) / 2 }

    let iframes: (HTMLIFrameElement | null)[] = Array($component?.documentData.breakpoints.length + 1)
        .fill(0)
        .map(() => null)
    let iframeData: {
        loaded: boolean
    }[] = Array($component?.documentData.breakpoints.length + 1)
        .fill(0)
        .map(() => ({ loaded: false }))

    $: registeredIframes.preview = iframes.every(iframe => iframe !== null) ? iframes : []

    let handlers: any[] = Array(iframes.length)
        .fill(0)
        .map((_, index) => ({
            loaded: () => (iframeData[index].loaded = true),
            call: ({
                data: { receiverType, senderType, senderIndex, receiverIndex, pluginId, componentId, key, args },
                messageId,
            }) =>
                handleMessage(
                    receiverType,
                    senderType,
                    senderIndex,
                    receiverIndex,
                    pluginId,
                    componentId,
                    key,
                    args,
                    messageId,
                ),

            return: ({ data: { senderType, senderIndex, pluginId, componentId, message }, messageId }) =>
                returnMessage(senderType, senderIndex, pluginId, componentId, message, messageId),
            alert: ({ alert, data }) => setAlert(alert, data),
        }))

    export let ready: Writable<boolean>
    $: {
        $ready = iframeData.every(({ loaded }) => loaded)
    }

    let disabled = false

    $: bundle = $component?.bundle
</script>

{#if $component && $bundle}
    <Bundler bind:disabled {iframes} {handlers} files={$bundle} theme="light" />
    <div class="flex gap-x-8 relative">
        {#each iframes as _, index}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
                class="absolute bg-white overflow-hidden"
                style="left:{($boxes[index]?.x ?? 0) - origin.x}px;top:{($boxes[index]?.y ?? 0) -
                    origin.y}px;width:{$boxes[index]?.w ?? 0}px;height:{Math.max(
                    $boxes[index]?.h ?? 0,
                    MIN_PAGE_HEIGHT,
                )}px;">
                <iframe
                    class="pointer-events-none select-none w-full h-full"
                    title="Preview"
                    bind:this={iframes[index]}
                    sandbox={["allow-scripts"].join(" ")}
                    srcdoc={srcdoc.replace(
                        INJECTED_SRCDOC_SYMBOL,
                        getIframeIndexSettingCode(index) + getPluginTypeSettingCode("preview"),
                    )} />
            </div>
        {/each}
    </div>
{/if}
