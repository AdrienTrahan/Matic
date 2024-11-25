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
<h1>Some text</h1>
<style>
    h1{
        margin: 0px;
        font-family: sans-serif;
    }
</style>