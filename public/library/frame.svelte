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
<div bind:this={divElement} style="background-color: chartreuse; width: 100px; height: 100px; top: 0px; left: 0px;">
    <slot name="0" />
</div>
<div bind:this={divElement} style="background-color: blue;">
    <slot name="1" />
</div>