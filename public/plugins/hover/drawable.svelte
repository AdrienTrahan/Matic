<script>
    import Matic from "./Matic"
    import {get} from "svelte/store"

    const boxes = Matic.getVariable("boxes");
    const transform = Matic.getVariable("transform");
    $: console.log($boxes, get(Matic.isReady));
</script>
{#each $boxes as box, i}
    <div class="thumbBar" style="top:{box.y * $transform.scale}px;left:{box.x * $transform.scale}px;width:{box.w * $transform.scale}px;">{i} --- iiic</div>
{/each}
<style>
    .thumbBar{
        position: absolute;
        background-color: lightgray;
        text-align: left;
        height: 24px;
        margin-top: -32px;
    }
</style>