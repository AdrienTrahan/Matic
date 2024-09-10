<!-- @format -->
<script lang="ts">
    import { PANZOOM_TRANSFORM_CONTEXT_KEY } from "$lib/constants"
    import Panzoom from "panzoom"
    import { getContext, onMount } from "svelte"
    import type { Writable } from "svelte/store"
    let scrollableContainer: HTMLDivElement
    let scrollableContent: HTMLDivElement

    export let displacement = { x: 0, y: 0 }
    const panzoomTransform: Writable<{ x: number; y: number; scale: number }> =
        getContext(PANZOOM_TRANSFORM_CONTEXT_KEY)

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

        scrollableContainer.addEventListener(
            "wheel",
            ({ deltaX, deltaY }) => {
                let { x, y } = panzoom.getTransform()
                panzoom.moveTo(x - deltaX, y - deltaY)
            },
            { passive: true },
        )

        panzoomTransform.set(panzoom.getTransform())
        panzoom.on("pan", () => panzoomTransform.set(panzoom.getTransform()))
    })
</script>

<div bind:this={scrollableContainer} class="absolute inset-0 overflow-auto">
    <div bind:this={scrollableContent} class="absolute inset-0">
        <div class="absolute top-[50%]" style="left:{displacement.x}px;top:{displacement.y}px;">
            <slot />
        </div>
    </div>
    <div
        class="absolute"
        style="left:{displacement.x * $panzoomTransform.scale + $panzoomTransform.x}px;top:{displacement.y *
            $panzoomTransform.scale +
            $panzoomTransform.y}px">
        <slot name="anchor" />
    </div>
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
