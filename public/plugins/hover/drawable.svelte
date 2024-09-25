<script>
    import { onMount } from "svelte"
    import { writable } from "svelte/store"
    import Matic from "./Matic"
    import { fade } from 'svelte/transition';

    let {isZooming, isTransforming, scaleFactor} = Matic;
    function mouseMoved(event){
        
    }

    onMount(() => {
        window.addEventListener("mousemove", mouseMoved)
        return () => window.removeEventListener("mousemove", mouseMoved)
    })

    const outline = writable({
        top: 0,
        left: 0,
        width: 100, 
        height: 100
    })

    
</script>
{#if !$isTransforming}
    <div in:fade={{ duration: 200 }} class="outline" style="top:{$outline.top * $scaleFactor}px;left:{$outline.left * $scaleFactor}px;width:{$outline.width * $scaleFactor}px;height:{$outline.height * $scaleFactor}px;"></div>
{/if}
<style>
    .outline {
        position: absolute;
        outline: 1px solid dodgerblue;
        outline-offset: -0.5px;
    }
    :is(button.hover){
        background-color: red;
    }

    :is(button.active){
        background-color: green;
    }
</style>