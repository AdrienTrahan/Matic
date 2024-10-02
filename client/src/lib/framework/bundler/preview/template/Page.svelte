<!-- @format -->
<script>
    // @ts-ignore
    import Matic from "./Matic"
    import { get } from "svelte/store"
    // @ts-ignore
    import Component from "./Component.svelte"

    let instanceId
    export function load() {
        instanceId = get(Matic.getVariable("presentedComponent"))
    }
</script>

{#if instanceId}
    <Component {instanceId} />
{/if}
