<!-- @format -->
<script>
    // @ts-nocheck
    import Matic from "./Matic"
    import { get } from "svelte/store"
    import Component from "./Component.svelte"
    import PluginInjector from "./PluginInjector.svelte"

    let presentedComponent
    export function load() {
        let presentedId = get(Matic.getVariable("presentedComponent"))
        if (presentedId === undefined) return
        presentedComponent = Matic.getVariable(presentedId)
    }
    export function getHeight(){
        return document.documentElement.scrollHeight;
    }
</script>

{#if $presentedComponent != undefined}
    <PluginInjector component={$presentedComponent} />
{/if}
