/** @format */

import { getPluginImportsCode, getPluginsFileCode } from "$framework/element-loader"
import { Plugin } from "$framework/plugin"
import MaticConnector from "$shared/injected/connector.js?raw"
import ContextInjector from "$shared/injected/context-injector.svelte?raw"
import ResizeHandler from "$shared/injected/resize-handler.svelte?raw"
import TailwindColors from "$shared/injected/tailwind-colors.svelte?raw"
import EditorStyle from "$shared/injected/editor-style.svelte?raw"
import { generateSvelteDrawablePluginTag } from "$shared/sharedb"

export function getDrawableBundle(loadedPlugins, pluginsStructure) {
    return [
        {
            name: "App",
            type: "svelte",
            source:
                `
                <scr` +
                `ipt>
                    import TailwindColors from "./TailwindColors.svelte";
                    import EditorStyle from "./EditorStyle.svelte";
                    import Matic from "./Matic";
                    import ContextInjector from "./ContextInjector.svelte";
                    import { onMount } from "svelte";
                    import ResizeHandler from "./ResizeHandler.svelte"
                    const plugins = {};
                    ${getPluginImportsCode(loadedPlugins, "drawable")}
                    onMount(() => {
                        parent.postMessage({ action: 'load' }, '*');
                        Matic.init(plugins, "drawable");
                    })
                </sc` +
                `ript>
                <TailwindColors/>
                <EditorStyle />
                <ResizeHandler>
                    ${getHTMLDrawablePluginsTags(loadedPlugins, pluginsStructure)}
                </ResizeHandler>
            `,
        },
        {
            name: "ContextInjector",
            type: "svelte",
            source: ContextInjector,
        },
        {
            name: "Matic",
            type: "js",
            source: MaticConnector,
        },
        {
            name: "ResizeHandler",
            type: "svelte",
            source: ResizeHandler,
        },
        {
            name: "TailwindColors",
            type: "svelte",
            source: TailwindColors,
        },
        {
            name: "EditorStyle",
            type: "svelte",
            source: EditorStyle,
        },
        ...getPluginsFileCode(loadedPlugins, "drawable"),
    ]
}

function getHTMLDrawablePluginsTags(
    loadedPlugins: {
        [key: string]: Plugin
    },
    pluginsStructure: {
        [key: string]: string[]
    }
) {
    let tags = ``

    for (const [pluginId, uniques] of Object.entries(pluginsStructure)) {
        if (loadedPlugins[pluginId]?.codeLoader?.getCode().drawable === undefined) continue
        for (const unique of uniques) {
            tags += `${generateSvelteDrawablePluginTag(pluginId, unique)}`
        }
    }
    return tags
}
