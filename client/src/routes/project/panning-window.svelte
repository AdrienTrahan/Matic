<!-- @format -->
<script lang="ts">
    import { onMount } from "svelte"
    import Panzoom from "panzoom"
    let scrollableContainer: HTMLDivElement
    let scrollableContent: HTMLDivElement
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
    })
</script>

<div bind:this={scrollableContainer} class="scrollableContainer absolute inset-0 overflow-auto">
    <div bind:this={scrollableContent} class="flex justify-center items-center w-full h-full">
        <slot />
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
