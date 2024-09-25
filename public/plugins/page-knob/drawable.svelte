<script>
    import Matic from "./Matic"
    import { fade } from 'svelte/transition';

    let {isZooming, isTransforming, scaleFactor} = Matic;
</script>
{#if !$isTransforming}
    <div in:fade={{ duration: 200 }} class="knob">
        <p>Desktop</p>
    </div>
{/if}


<style>
    .knob {
        position: absolute;
        top: -8px;
        left: 0px;
        height: 28px;
        width: 200px;
        background-color: var(--tw-zinc-200);
        transform: translateY(-100%);
        border-radius: 6px;
        display: flex;
        align-items: center;
    }

    .knob p{
        color: var(--tw-zinc-500);
        font-weight: 600;
        margin: 0px;
        font-size: 12px;
        font-family: "Open Sans";
        padding: 0px 8px;
    }
</style>