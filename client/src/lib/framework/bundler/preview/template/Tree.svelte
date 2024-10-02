<!-- @format -->
<script>
    // @ts-ignore
    import Component from "./Component.svelte"

    export let slots = []
</script>

{#each slots as slot}
    {#each slot as child}
        <Component instanceId={child.id} />
    {/each}
{/each}
