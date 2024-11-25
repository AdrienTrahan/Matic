<script>
    import { onMount } from "svelte"
    import { writable } from "svelte/store";

    export const hitboxes = writable({});
    let divElement = null;
    onMount(() => {
        if (!divElement) return
        hitboxes.set(divElement.getBoundingClientRect())
    })
    
</script>
<div bind:this={divElement} style="background-color: red; width: 100px; height: 100px; top: 0px; left: 0px; color: white;">
    this is a frame component
    <slot name="0" />
</div>
<div bind:this={divElement} style="background-color: blue;">
    <slot name="1" />
</div>