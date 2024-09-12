<!-- @format -->

<script lang="ts">
    import { EVENT_INTERCEPTOR_CONTEXT_KEY } from "$lib/constants"
    import { onMount, setContext } from "svelte"
    import { get, writable, type Writable } from "svelte/store"
    const eventHandlers: Writable<Set<any>> = writable(new Set())
    setContext(EVENT_INTERCEPTOR_CONTEXT_KEY, eventHandlers)

    let container

    onMount(() => {
        if (!container) return
        ;["click", "mousemove"].forEach(eventName => {
            container.addEventListener(eventName, event => {
                get(eventHandlers).forEach(handler => {
                    handler({ name: eventName, event })
                })
            })
        })
    })
</script>

<div bind:this={container} class="w-full h-full m-0 absolute inset-0">
    <slot />
</div>
