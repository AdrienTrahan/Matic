<script>
    import Matic from "./Matic";
    const matic = Matic();

    export let components;

    Matic.onReady(() => {
        matic.drawable.setSize(Matic.getBreakpoint(), document.documentElement.scrollHeight);
    })
</script>