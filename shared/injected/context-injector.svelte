<!-- @format -->
<script>
    import { setContext } from "svelte"
    import Matic from "./Matic"
    export let pluginId
    export let componentId
    setContext(Matic.ACTIVE_PLUGIN_ID_CONTEXT_KEY, pluginId)
    setContext(Matic.ACTIVE_COMPONENT_INSTANCE_ID_CONTEXT_KEY, componentId)
</script>

<slot />
