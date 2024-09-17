/** @format */

import { getPointerInjectionCode } from "$framework/drawable/pointer-inject"
import { getResizeHandlerComponent } from "$framework/drawable/resize-handler"
import { getPluginImportsCode, getPluginsFileCode } from "$framework/element-loader"
import { Plugin } from "$framework/plugin"
import { generateSvelteDrawablePluginTag } from "$shared/sharedb"
export const injectedJS = getPointerInjectionCode()
export function getDrawableBundle(loadedPlugins, pluginsStructure) {
    return [
        {
            name: "App",
            type: "svelte",
            source:
                `<scr` +
                `ipt>
                    import { onMount } from "svelte";
                    import ResizeHandler from "./resize-handler.svelte"
                    ${getPluginImportsCode(loadedPlugins, "drawable")}
                    onMount(() => {
                        parent.postMessage({ action: 'load' }, '*');
                    })
                </sc` +
                `ript>
                <ResizeHandler>
                    ${getHTMLDrawablePluginsTags(loadedPlugins, pluginsStructure)}
                </ResizeHandler>
            `,
        },
        getResizeHandlerComponent(),
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
