<script>
    // @ts-ignore
    import Matic from "./Matic"
    const anchor = Matic.getVariable("anchor");
    const boxes = Matic.getVariable("boxes");
    const transform = Matic.getVariable("transform");
</script>
<div class="positionnal-wrapper" style="left:{($anchor?.left ?? 0) - ($boxes?.[0]?.w ?? 0)/2 * ($transform?.scale ?? 0)}px;top:{($anchor?.top ?? 0) - (($boxes?.[0]?.h ?? 0 )/2) * ($transform?.scale ?? 0)}px;">
    <slot />
</div>

<style>
    .positionnal-wrapper{
        position: fixed;
        background-color: red;
        text-align: center;
    }
</style>