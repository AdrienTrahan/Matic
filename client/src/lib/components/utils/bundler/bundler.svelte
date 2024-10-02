<!-- @format -->
<script lang="ts">
    import ReplProxy from "./ReplProxy"

    import type { Writable } from "svelte/store"
    import { writable } from "svelte/store"
    import Bundler from "./Bundler"
    import type { Handlers } from "./proxy"
    import type { Bundle, File } from "./types"
    import { PUBLIC_SVELTE_VERSION } from "$env/static/public"

    export let packagesUrl = "https://unpkg.com"
    export let svelteUrl = `${packagesUrl}/svelte@${PUBLIC_SVELTE_VERSION}`

    export let files: File[] = []
    export let injectedJS = ""
    export let injectedCSS = ""
    export let theme: "light" | "dark" = "light"
    export let handlers: Handlers[] = []
    export let disabled: boolean = true

    $: disabled = error || pending || pending_imports || !$iframesReady.every(isReady => isReady) || !initialized

    let bundle: Writable<Bundle | null> = writable(null)
    export let iframes: (HTMLIFrameElement | null)[] = []
    let proxies: ReplProxy[] = []
    let iframesReady: Writable<boolean[]> = writable([])
    let initialized = false
    let pending_imports = 0
    let pending = false
    let error: any
    let lastUpdated = 0

    let bundler = new Bundler({
        packages_url: packagesUrl,
        svelte_url: svelteUrl,
        onstatus: message => {},
    })

    $: {
        ;(async () => {
            $bundle = await bundler.bundle(files)
        })()
    }
    // TO FIX: proxies are recreated everytime regardless of the specific iframe that changes.
    $: {
        for (const proxy of proxies) {
            proxy.destroy()
        }
        proxies = []

        iframesReady.update($iframesReady => {
            const newIframeCount = iframes.filter(iframe => iframe).length
            if ($iframesReady.length > newIframeCount) {
                const difference = $iframesReady.length - newIframeCount
                for (let i = 0; i < difference; i++) {
                    $iframesReady.splice(0, difference)
                }
            } else if ($iframesReady.length < newIframeCount) {
                const difference = newIframeCount - $iframesReady.length
                for (let i = 0; i < difference; i++) {
                    $iframesReady.push(false)
                }
                lastUpdated += difference
            }
            return $iframesReady
        })

        for (let i = 0; i < iframes.length; i++) {
            const iframe = iframes[i]

            let handler = handlers[i]
            if (!iframe) continue

            proxies.push(
                new ReplProxy(iframe, {
                    on_fetch_progress: progress => {
                        pending_imports = progress
                        handler.on_fetch_progress && handler.on_fetch_progress(progress)
                    },
                    on_unhandled_rejection: event => {
                        let error = event.value
                        if (typeof error === "string") error = { message: error }
                        error.message = "Uncaught (in promise): " + error.message
                        handler.on_unhandled_rejection && handler.on_unhandled_rejection(event)
                    },
                    ...handler,
                }),
            )
            const iframeIndex = i
            iframe.addEventListener("load", () => ($iframesReady[iframeIndex] = true))
        }
    }

    $: if ($iframesReady.every(isReady => isReady))
        for (let proxy of proxies) proxy?.iframe_command("set_theme", { theme })

    async function apply_bundle($bundle: Bundle) {
        if ($bundle.error) console.error("Plugin error", $bundle?.error)

        if (!$bundle || $bundle.error) return
        try {
            await Promise.all(
                proxies.slice(proxies.length - lastUpdated).map(proxy => {
                    return proxy?.eval(`
                        ${injectedJS}

                        ${styles}

                        const styles = document.querySelectorAll('style[id^=svelte-]');

                        let i = styles.length;
                        while (i--) styles[i].parentNode.removeChild(styles[i]);

                        if (window.component) {
                            try {
                                window.component.$destroy();
                            } catch (err) {
                                console.error(err);
                            }
                        }

                        document.body.innerHTML = '';
                        window.location.hash = '';
                        window._svelteTransitionManager = null;

                        ${$bundle.dom?.code}

                        window.component = new SvelteComponent.default({
                            target: document.body
                        });
                    `)
                }),
            )
            lastUpdated = 0
            error = null
        } catch {}
        initialized = true
    }

    $: if ($iframesReady.every(isReady => isReady) && $bundle) apply_bundle($bundle)

    $: styles =
        injectedCSS &&
        `{
		const style = document.createElement('style');
		style.textContent = ${JSON.stringify(injectedCSS)};
		document.head.appendChild(style);
	}`
</script>
