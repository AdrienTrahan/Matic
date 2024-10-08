<!-- @format -->

<script>
    // @ts-nocheck
    import Component from "./Component.svelte"
    import Preloader from "./Preloader"
    export let component
    let instance
</script>

<Component bind:this={instance} {...$$props} />

{#if instance}
    {#each component.plugins ?? [] as plugin}
        <svelte:component this={Preloader[plugin]} component={instance} />
    {/each}
{/if}
