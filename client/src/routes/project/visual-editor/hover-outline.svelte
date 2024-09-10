<!-- @format -->
<script lang="ts">
    export let top: number = 0
    export let left: number = 0
    export let width: number = 0
    export let height: number = 0
</script>

{#if width > 0 && height > 0}
    <div
        style="top:{top}px;left:{left}px;width:{width}px;height:{height}px;border-width: 1px;"
        class="absolute top-0 left-0 w-12 h-12 border-blue-400 z-10">
    </div>
{/if}
