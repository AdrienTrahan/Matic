<!-- @format -->
<script lang="ts">
    import { srcdoc, Bundler } from "$lib/components/utils/bundler"
    let iframes: (HTMLIFrameElement | null)[] = [null, null]
    let name = ""
    $: files = [
        {
            name: "App",
            type: "svelte",
            source: "<scri" + 'pt>import Joe from "./Joe.svelte"</sc' + "ript><Joe />",
        },
        {
            name: "Joe",
            type: "svelte",
            source: name,
        },
    ]
    let disabled: boolean
</script>

hgfhgf

<iframe
    title="Result"
    bind:this={iframes[0]}
    sandbox={["allow-scripts", "allow-popups", "allow-forms", "allow-pointer-lock", "allow-modals"].join(" ")}
    {srcdoc} />
<iframe
    title="Result"
    bind:this={iframes[1]}
    sandbox={["allow-scripts", "allow-popups", "allow-forms", "allow-pointer-lock", "allow-modals"].join(" ")}
    {srcdoc} />
<Bundler {iframes} {files} bind:disabled theme="light" />

{disabled};

<input type="text" bind:value={name} />
