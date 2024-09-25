<script>
    import Matic from "./Matic"
    
    let {scaleFactor, scaledBoxes} = Matic;
</script>
{#each $scaledBoxes as {x,y,w}}
    <div class="knob" style="left:{x}px;top:{y}px;width:{w}px">
        <p>Desktop</p>
    </div>
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