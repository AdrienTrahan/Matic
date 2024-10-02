<!-- @format -->
<script>
    // @ts-nocheck
    import Matic from "./Matic"
    import Page from "./Page.svelte"
    import Component from "./Component.svelte"
    import { onMount } from "svelte"

    let page

    onMount(() => {
        Matic.init(page)
    })
</script>

<Page bind:this={page} />
