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
    let iframesReady: Writable<boolean[]> = writable([])
    let initialized = false
    let pending_imports = 0
    let pending = false
    let error: any
    let lastUpdated = 0

    let proxies: Writable<
        {
            proxy: ReplProxy
            iframe: HTMLIFrameElement | null
            bundled: boolean
            ready: boolean
        }[]
    > = writable([])

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

    $: {
        for (let i = $proxies.length - 1; i >= 0; i--) {
            let iframeExists = false
            for (const iframe of iframes) {
                if (iframe == $proxies[i].iframe) iframeExists = true
            }
            if ($proxies[i].iframe == null || !iframeExists) {
                $proxies[i].proxy.destroy()
                $proxies.splice(i, 1)
                continue
            }
        }
    }
    $: {
        for (let i = 0; i < iframes.length; i++) {
            const iframe = iframes[i]
            const handler = handlers[i]
            if (iframe == null) continue
            let iframeExists = false
            for (const proxy of $proxies) if (proxy.iframe == iframe) iframeExists = true
            if (iframeExists) continue

            const proxy = createProxy(iframe, handler)
            const proxyObject = {
                iframe,
                proxy,
                bundled: false,
                ready: false,
            }
            iframe.addEventListener("load", () => {
                proxyObject.ready = true
                proxies.update($proxies => $proxies)
            })

            $proxies.push(proxyObject)
        }
    }

    $: if ($proxies.every(({ ready }) => ready))
        for (let proxy of $proxies) proxy.proxy.iframe_command("set_theme", { theme })
    $: {
        if ($proxies.every(({ ready }) => ready)) {
            if ($bundle) {
                if ($bundle.error) {
                    console.error("Plugin error", $bundle?.error)
                } else {
                    applyBundle($bundle)
                    error = null
                }
            }
        }
    }
    $: styles =
        injectedCSS &&
        `{
		const style = document.createElement('style');
		style.textContent = ${JSON.stringify(injectedCSS)};
		document.head.appendChild(style);
	}`

    function createProxy(iframe, handler) {
        return new ReplProxy(iframe, {
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
        })
    }

    function applyBundle($bundle) {
        for (const proxy of $proxies) {
            if (proxy.bundled) continue
            try {
                proxy?.proxy?.eval(`
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
                proxy.bundled = true
            } catch {}
        }
    }
</script>
