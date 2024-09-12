<!-- @format -->
<script lang="ts">
    import { DRAWABLE_EXTRA_PADDING_FACTOR, PANZOOM_TRANSFORM_CONTEXT_KEY, WHEEL_UPDATE_DELAY } from "$lib/constants"
    import Panzoom from "panzoom"
    import { getContext, onMount, tick } from "svelte"
    import { resize } from "svelte-resize-observer-action"
    import { writable, type Writable } from "svelte/store"
    import EventInterceptor from "./event-interceptor.svelte"

    let scrollableContainer: HTMLDivElement
    let scrollableContent: HTMLDivElement
    let anchorContainer: HTMLDivElement
    let eventHandler = () => {}

    export let displacement
    const panzoomTransform: Writable<{ x: number; y: number; scale: number }> =
        getContext(PANZOOM_TRANSFORM_CONTEXT_KEY)
    export const anchorBox: Writable<{ width: number; height: number; top: number; left: number }> = writable({
        width: 10,
        height: 10,
        top: 0,
        left: 0,
    })

    let panzoom

    onMount(() => {
        panzoom = Panzoom(scrollableContent, {
            smoothScroll: false,
            zoomSpeed: 2,
            maxZoom: 4,
            minZoom: 0.3,
            beforeWheel: event => !event.ctrlKey,
            beforeMouseDown: () => true,
            zoomDoubleClickSpeed: 1,
        })

        let wheelEventEndTimeout: any = null
        scrollableContainer.addEventListener(
            "wheel",
            ({ deltaX, deltaY }) => {
                let { x, y } = panzoom.getTransform()
                panzoom.moveTo(x - deltaX, y - deltaY)
                // wheel end
                clearTimeout(wheelEventEndTimeout)
                wheelEventEndTimeout = setTimeout(updateAnchorPosition, WHEEL_UPDATE_DELAY)
            },
            { passive: true },
        )

        panzoomTransform.set(panzoom.getTransform())
        panzoom.on("pan", () => {
            panzoomTransform.set(panzoom.getTransform())
        })

        panzoom.on("zoomend", updateAnchorPosition)
        panzoom.on("panend", updateAnchorPosition)

        displacement.subscribe(async () => {
            await tick()
            updateAnchorPosition()
        })
    })

    function updateAnchorPosition() {
        if (!anchorContainer || !scrollableContainer) return

        let { top, left } = anchorContainer.getBoundingClientRect()
        let { width, height } = scrollableContainer.getBoundingClientRect()

        anchorBox.update(obj => {
            obj.top = top + (height * (DRAWABLE_EXTRA_PADDING_FACTOR - 1)) / 2
            obj.width = width * DRAWABLE_EXTRA_PADDING_FACTOR
            obj.left = left + (width * (DRAWABLE_EXTRA_PADDING_FACTOR - 1)) / 2
            obj.height = height * DRAWABLE_EXTRA_PADDING_FACTOR
            return obj
        })
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div use:resize={updateAnchorPosition} class="absolute inset-0 overflow-hidden">
    <EventInterceptor on:event={eventHandler}>
        <div bind:this={scrollableContainer} class="absolute inset-0 overflow-auto pointer-events-auto">
            <div bind:this={scrollableContent} class="absolute inset-0 pointer-events-none">
                <div class="absolute top-[50%]" style="left:{$displacement.x}px;top:{$displacement.y}px;">
                    <slot />
                </div>
            </div>
            <div
                bind:this={anchorContainer}
                class="absolute pointer-events-none"
                style="left:{$displacement.x * $panzoomTransform.scale + $panzoomTransform.x}px;top:{$displacement.y *
                    $panzoomTransform.scale +
                    $panzoomTransform.y}px">
                <div
                    class="absolute flex justify-center items-center"
                    style="width:{$anchorBox.width}px;height:{$anchorBox.height}px;top:{-$anchorBox.top}px;left:{-$anchorBox.left}px;">
                    <slot name="drawable" {anchorBox} />
                </div>
            </div>
        </div>
    </EventInterceptor>
</div>

<style>
    *::-webkit-scrollbar {
        display: none;
    }
    * {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
