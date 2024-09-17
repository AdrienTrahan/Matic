/** @format */

import type { Connection } from "sharedb/lib/client"
import { get, writable, type Writable } from "svelte/store"
import { Component, type ParentComponent } from "./component"
import { Plugin } from "./plugin"
import { TreeComponentCodeLoader } from "./code-loader"
import {
    compileSvelteImports,
    flattenComponentWithIds,
    generateSvelteInjectedPluginTag,
    renameElementId,
} from "$shared/sharedb"

export class ComponentLoader {
    loadedComponents: { [key: string]: Component } = {}

    main: Writable<ParentComponent | undefined> = writable()
    registerComponent(component: ParentComponent) {
        this.main.set(component)
    }
    loadElement(component: Component) {
        if (this.loadedComponents[component.id] === undefined) this.loadedComponents[component.id] = component
        return this.loadedComponents[component.id]
    }

    clearLoadedElements() {
        this.loadedComponents = {}
    }
}

export class PluginLoader {
    pluginsStructure: Writable<{
        [key: string]: string[]
    }> = writable({})
    loadedPlugins: Writable<{ [key: string]: Plugin }> = writable({})

    async loadPluginsFromComponent(parentComponent: ParentComponent, connection: Connection) {
        this.clearLoadedPlugins()

        if (!(parentComponent.codeLoader instanceof TreeComponentCodeLoader)) return
        const componentLoader = parentComponent.componentLoader
        const componentsId = Array.from(get(parentComponent.codeLoader.imports))

        const loadedComponents = [
            parentComponent,
            ...componentsId.map(componentId => componentLoader.loadedComponents[componentId]),
        ]
        const loadedComponentsObj = { [parentComponent.id]: parentComponent }
        Object.assign(loadedComponentsObj, componentLoader.loadedComponents)

        let componentsByUnique = flattenComponentWithIds(parentComponent.documentData)
        let pluginsByUnique = Object.fromEntries(
            Object.entries(componentsByUnique).map(([unique, component]) => [
                unique,
                loadedComponentsObj[component.id]?.documentData?.plugins ?? [],
            ])
        )

        let uniquesByPlugins = get(this.pluginsStructure)

        for (const [unique, plugins] of Object.entries(pluginsByUnique)) {
            for (const plugin of plugins) {
                if (!uniquesByPlugins[plugin]) uniquesByPlugins[plugin] = []
                uniquesByPlugins[plugin].push(unique)
            }
        }

        this.pluginsStructure.set(uniquesByPlugins)

        let newLoadedPlugins = get(this.loadedPlugins)
        for (const component of loadedComponents) {
            for (const plugin of component.documentData.plugins ?? []) {
                if (!newLoadedPlugins[plugin]) newLoadedPlugins[plugin] = await Plugin.init(plugin, this, connection)
            }
        }

        this.loadedPlugins.set(newLoadedPlugins)
    }

    generateInjectedPlugins() {
        return `
            <script>
                import { onMount } from "svelte";
                export let components;
                let loaded = false;
                $: if (components) loaded = true;
                ${getPluginImportsCode(get(this.loadedPlugins), "injected")}
            </script>
            {#if loaded}
                ${getHTMLInjectedPluginsTags(get(this.loadedPlugins), get(this.pluginsStructure))}
            {/if}
        `
    }

    generateInjectedPluginsFile() {
        return getPluginsFileCode(get(this.loadedPlugins), "injected")
    }

    clearLoadedPlugins() {
        this.loadedPlugins.set({})
        this.pluginsStructure.set({})
    }
}

export function getPluginImportsCode(loadedPlugins: { [key: string]: Plugin }, key) {
    return compileSvelteImports(
        Object.entries(loadedPlugins)
            .map(([id, plugin]) => {
                let code = plugin.codeLoader?.getCode()[key]
                if (!code) return
                return id
            })
            .filter(id => typeof id != `undefined`)
    )
}

function getHTMLInjectedPluginsTags(
    loadedPlugins: {
        [key: string]: Plugin
    },
    pluginsStructure: {
        [key: string]: string[]
    }
) {
    let tags = ``
    for (const [pluginId, uniques] of Object.entries(pluginsStructure)) {
        if (loadedPlugins[pluginId]?.codeLoader?.getCode().injected === undefined) continue
        for (const unique of uniques) {
            tags += `${generateSvelteInjectedPluginTag(pluginId, unique)}`
        }
    }
    return tags
}

export function getPluginsFileCode(loadedPlugins: { [key: string]: Plugin }, key: string) {
    return Object.entries(loadedPlugins)
        .map(([id, plugin]) => {
            let code = plugin.codeLoader?.getCode()[key]
            if (!code) return
            return {
                name: renameElementId(id),
                type: "svelte",
                source: code,
            }
        })
        .filter(plugin => typeof plugin !== "undefined")
}
