<!-- @format -->
<script lang="ts">
    import { DRAWABLE_SHOWN_CONTEXT_KEY, PANZOOM_TRANSFORM_CONTEXT_KEY, WHEEL_UPDATE_DELAY } from "$lib/constants"
    import Panzoom from "panzoom"
    import { getContext, onMount, setContext, tick } from "svelte"
    import { resize } from "svelte-resize-observer-action"
    import { writable, type Writable } from "svelte/store"
    import EventInterceptor from "./drawing-screen/event-interceptor.svelte"
    import { cn } from "$lib/utils"

    let scrollableContainer: HTMLDivElement
    let scrollableContent: HTMLDivElement
    let anchorContainer: HTMLDivElement
    let showDrawable: Writable<boolean> = writable(true)
    let eventHandler = () => {}

    setContext(DRAWABLE_SHOWN_CONTEXT_KEY, showDrawable)

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
        panzoom.on("transform", () => {
            // wheel end
            clearTimeout(wheelEventEndTimeout)
            wheelEventEndTimeout = setTimeout(updateAnchorPosition, WHEEL_UPDATE_DELAY)
        })

        scrollableContainer.addEventListener(
            "wheel",
            ({ deltaX, deltaY }) => {
                let { x, y } = panzoom.getTransform()
                panzoom.moveTo(x - deltaX, y - deltaY)
            },
            { passive: true },
        )

        panzoomTransform.set(panzoom.getTransform())
        panzoom.on("pan", () => {
            panzoomTransform.set(panzoom.getTransform())
        })

        panzoom.on("zoomend", updateAnchorPosition)
        panzoom.on("panend", updateAnchorPosition)

        updateAnchorPosition()
        displacement.subscribe(async _ => {
            await tick()
            updateAnchorPosition()
        })
    })

    export async function updateAnchorPosition() {
        if (!anchorContainer || !scrollableContainer) return

        let { top, left } = anchorContainer.getBoundingClientRect()
        let { width, height } = scrollableContainer.getBoundingClientRect()
        if ($showDrawable) $showDrawable = false
        await tick()
        requestAnimationFrame(() => {
            anchorBox.update(obj => {
                obj.top = top
                obj.width = width
                obj.left = left
                obj.height = height
                return obj
            })
        })
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div use:resize={updateAnchorPosition} class="absolute inset-0 overflow-hidden">
    <EventInterceptor on:event={eventHandler}>
        <div bind:this={scrollableContainer} class="absolute inset-0 overflow-visible pointer-events-auto">
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
                    class={cn("absolute flex justify-center items-center")}
                    style="opacity:{$showDrawable
                        ? 1
                        : 0}; width:{$anchorBox.width}px;height:{$anchorBox.height}px;top:{-$anchorBox.top}px;left:{-$anchorBox.left}px;">
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
