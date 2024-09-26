<script>
    import Matic from "./Matic"

    let { scaledBoxes } = Matic;
</script>
{#each $scaledBoxes as {x,y,w, h}}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="knob" style="left:{x}px;top:{y}px;width:{w}px">
        <p>Desktop</p>
    </div>
    <div class="outline" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px"></div>
{/each}
<style>
    .knob {
        position: absolute;
        height: 28px;
        background-color: var(--tw-zinc-200);
        transform: translateY(calc(-8px - 100%));
        border-radius: 6px;
        display: flex;
        align-items: center;
        transition: 150ms background-color, 150ms outline;
    }

    .knob p{
        color: var(--tw-zinc-500);
        font-weight: 600;
        margin: 0px;
        font-size: 12px;
        font-family: "Open Sans";
        padding: 0px 8px;
        transition: 150ms color;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }
    :is(.knob.hover){
        background-color: var(--tw-blue-100);
    }

    :is(.knob.hover) p{
        color: var(--tw-blue-500);
    }

    :is(.knob.hover) + div{
        opacity: 1;
    }

    .outline {
        position: absolute;
        outline: 1px solid var(--tw-blue-500);
        outline-offset: -0.5px;
        opacity: 0;
        transition: 150ms opacity;
        pointer-events: none;
    }
</style>