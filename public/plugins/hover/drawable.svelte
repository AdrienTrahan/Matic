<script>
    import { onMount } from "svelte"
    import Matic from "./Matic";
    const matic = Matic();
    async function clicked(){
        let result = await matic.preview.bob();
        console.log(result);
        
    }
    onMount(() => {
        (async () => {
            console.log(await matic.preview.bob())
        })()
    })

    export function joe() {
        return 3;
    }
</script>
<button on:click={clicked}>button</button>