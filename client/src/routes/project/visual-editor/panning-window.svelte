<!-- @format -->
<script lang="ts">
    import {
        DRAWABLE_SHOWN_CONTEXT_KEY,
        IS_TRANSFORMING_CONTEXT_KEY,
        IS_ZOOMING_CONTEXT_KEY,
        PANZOOM_TRANSFORM_CONTEXT_KEY,
        SCALE_FACTOR_CONTEXT_KEY,
        WHEEL_UPDATE_DELAY,
        ZOOM_UPDATE_DELAY,
    } from "$lib/constants"
    import { cn } from "$lib/utils"
    import Panzoom from "panzoom"
    import { getContext, onMount, setContext, tick } from "svelte"
    import { resize } from "svelte-resize-observer-action"
    import { derived, writable, type Writable } from "svelte/store"
    import EventInterceptor from "./drawing-screen/event-interceptor.svelte"

    const panzoomTransform: Writable<{ x: number; y: number; scale: number }> =
        getContext(PANZOOM_TRANSFORM_CONTEXT_KEY)
    export let initialZoom: number

    let scrollableContainer: HTMLDivElement
    let scrollableContent: HTMLDivElement
    let anchorContainer: HTMLDivElement
    let showDrawable: Writable<boolean> = writable(true)
    let isTransforming: Writable<boolean> = writable(false)
    let isZooming: Writable<boolean> = writable(false)
    let scaleFactor = derived([panzoomTransform], ([{ scale }]) => scale)

    let eventHandler = () => {}

    setContext(DRAWABLE_SHOWN_CONTEXT_KEY, showDrawable)
    setContext(IS_ZOOMING_CONTEXT_KEY, isZooming)
    setContext(IS_TRANSFORMING_CONTEXT_KEY, isTransforming)
    setContext(SCALE_FACTOR_CONTEXT_KEY, scaleFactor)

    export let displacement
    export const anchorBox: Writable<{ width: number; height: number; top: number; left: number }> = writable({
        width: 10,
        height: 10,
        top: 0,
        left: 0,
    })

    let zoomingTimeout: any = null

    let panzoom

    onMount(() => {
        panzoom = Panzoom(scrollableContent, {
            smoothScroll: false,
            zoomSpeed: 2,
            maxZoom: 2,
            minZoom: 0.1,
            initialZoom: initialZoom,
            beforeWheel: event => !event.ctrlKey,
            beforeMouseDown: event => !event.altKey,
        })

        let transformEndTimeout: any = null
        panzoom.on("transform", () => {
            $isTransforming = true
            clearTimeout(transformEndTimeout)
            transformEndTimeout = setTimeout(updateAnchorPosition, WHEEL_UPDATE_DELAY)
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

        panzoom.on("zoom", () => {
            $isZooming = true
            clearTimeout(zoomingTimeout)
            zoomingTimeout = setTimeout(() => {
                $isZooming = false
            }, ZOOM_UPDATE_DELAY)
        })

        updateAnchorPosition()
    })

    export async function updateAnchorPosition() {
        $isTransforming = false
        if (!anchorContainer || !scrollableContainer) return

        let { top, left } = anchorContainer.getBoundingClientRect()
        let { width, height } = scrollableContainer.getBoundingClientRect()
        if ($showDrawable) $showDrawable = false
        await tick()
        await new Promise(resolve => requestAnimationFrame(resolve))
        anchorBox.update(obj => {
            obj.top = top
            obj.width = width
            obj.left = left
            obj.height = height
            return obj
        })
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div use:resize={updateAnchorPosition} class="absolute inset-0 overflow-hidden">
    <EventInterceptor on:event={eventHandler}>
        <div
            on:dblclick|capture={event => event.stopImmediatePropagation()}
            class="absolute inset-0 overflow-visible pointer-events-auto">
            <div bind:this={scrollableContainer} class="absolute inset-0 overflow-visible pointer-events-auto">
                <div bind:this={scrollableContent} class="absolute inset-0 pointer-events-none">
                    <div
                        class="absolute"
                        style="left:{displacement.x / initialZoom}px;top:{displacement.y / initialZoom}px;">
                        <slot />
                    </div>
                </div>
                <div
                    bind:this={anchorContainer}
                    class="absolute pointer-events-none"
                    style="left:{(displacement.x * $panzoomTransform.scale) / initialZoom +
                        $panzoomTransform.x}px;top:{(displacement.y * $panzoomTransform.scale) / initialZoom +
                        $panzoomTransform.y}px">
                    <div
                        class={cn("absolute flex justify-center items-center")}
                        style="opacity:{$showDrawable
                            ? 1
                            : 0};width:{$anchorBox.width}px;height:{$anchorBox.height}px;top:{-$anchorBox.top}px;left:{-$anchorBox.left}px;">
                        <slot name="drawable" {anchorBox} />
                    </div>
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
