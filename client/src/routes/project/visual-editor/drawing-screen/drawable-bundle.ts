/** @format */

import type { PluginLoader } from "$framework/element-loader"
import { compileSvelteImports, generateSveltePluginTag, renameElementId } from "$shared/sharedb"
import { Plugin } from "$framework/plugin"
import { getResizeHandlerComponent } from "$framework/drawable/resize-handler"
import { getPointerInjectionCode } from "$framework/drawable/pointer-inject"
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
                    ${getImportsCode(loadedPlugins)}
                    onMount(() => {
                        parent.postMessage({ action: 'load' }, '*');
                    })
                </sc` +
                `ript>
                <ResizeHandler>
                    ${getHTMLPluginsTags(loadedPlugins, pluginsStructure)}
                </ResizeHandler>
            `,
        },
        getResizeHandlerComponent(),
        ...getPluginsFileCode(loadedPlugins),
    ]
}

function getImportsCode(loadedPlugins: { [key: string]: Plugin }) {
    return compileSvelteImports(
        Object.entries(loadedPlugins)
            .map(([id, plugin]) => {
                let code = plugin.codeLoader?.getCode().drawable
                if (!code) return
                return id
            })
            .filter(id => typeof id != `undefined`)
    )
}

function getHTMLPluginsTags(
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
            tags += `${generateSveltePluginTag(pluginId, unique)}`
        }
    }
    return tags
}

function getPluginsFileCode(loadedPlugins: { [key: string]: Plugin }) {
    return Object.entries(loadedPlugins)
        .map(([id, plugin]) => {
            let code = plugin.codeLoader?.getCode().drawable
            if (!code) return
            return {
                name: renameElementId(id),
                type: "svelte",
                source: code,
            }
        })
        .filter(plugin => typeof plugin !== "undefined")
}
