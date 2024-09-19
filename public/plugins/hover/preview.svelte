<script>
    import Matic from "./Matic";
    const matic = Matic();
    
    export let components;
    export function bob(){
        return 2;
    }
    (async () => {
        console.log(await matic.drawable.joe())
    })()
</script>
test