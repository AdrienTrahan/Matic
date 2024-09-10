<script>
    import { onMount } from "svelte"
    import { writable } from "svelte/store";

    export const hitboxes = writable([]);
    export const outlines = writable({});

    let divElement;
    export let unique;

    onMount(() => {
        if (!divElement) return
        hitboxes.set([divElement.getBoundingClientRect()])
        outlines.set(divElement.getBoundingClientRect())
    })
    
</script>
<div {unique} bind:this={divElement} style="background-color: lightgray; width: 100px; height: 100px">
    <slot name="0" />
</div>