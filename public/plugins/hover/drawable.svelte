<script>
    import { onMount } from "svelte"
    import { writable } from "svelte/store"
    import Matic from "./Matic"

    let {scaleFactor} = Matic;
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
<div class="outline" style="top:{$outline.top * $scaleFactor}px;left:{$outline.left * $scaleFactor}px;width:{$outline.width * $scaleFactor}px;height:{$outline.height * $scaleFactor}px;"></div>
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