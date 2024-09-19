<!-- @format -->
<script>
    import { setContext } from "svelte"
    import Matic from "./Matic"
    export let unique
    setContext(Matic.ACTIVE_PLUGIN_CONTEXT_KEY, unique)
</script>

<slot />
