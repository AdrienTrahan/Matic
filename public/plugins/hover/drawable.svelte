<script>
    import Matic from "./Matic"
    const matic = Matic();
    import { get } from "svelte/store"
    let {scaleFactor} = Matic;
    let counter = 0;

    async function changeText(){
    }
</script>

<style>
    :is(.hover){
        background-color: red;
    }
</style>