/** @format */
import {
    compileSvelteImports,
    flattenComponentWithIds,
    generateSveltePreviewPluginTag,
    renameElementId,
} from "$shared/sharedb"
import type { Connection } from "sharedb/lib/client"
import { get, writable, type Writable } from "svelte/store"
import { TreeComponentCodeLoader } from "./code-loader"
import { Component, type ParentComponent } from "./component"
import { Plugin } from "./plugin"
import uniqid from "uniqid"

export class ComponentLoader {
    loadedComponents: { [key: string]: Component } = {}

    constructor(loadableComponents) {}

    main: Writable<ParentComponent | undefined> = writable()
    registerMainComponent(component: ParentComponent) {
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
    loaded: Writable<boolean> = writable(false)

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
        this.loaded.set(true)
    }

    generatePreviewPlugins() {
        const expectedPluginsObject = Object.fromEntries(
            Object.entries(get(this.pluginsStructure)).map(([pluginId, componentInstancesIds]) => [
                pluginId,
                Object.fromEntries(componentInstancesIds.map(componentInstancesId => [componentInstancesId, null])),
            ])
        )

        return `
            <script>
                import Matic from "./Matic";
                import ContextInjector from "./ContextInjector.svelte"
                import { onMount } from "svelte";
                export let components;
                const plugins = ${JSON.stringify(expectedPluginsObject)};
                let loaded = false;
                $: if (components) loaded = true;
                $: if (Object.values(plugins).every(componentInstance => Object.values(componentInstance).every(plugin => plugin != null))) initConnector();
                async function initConnector(){
                    await Matic.init(plugins, "preview");
                }
                
                ${getPluginImportsCode(get(this.loadedPlugins), "preview")}
            </script>
            {#if loaded}
                ${getHTMLPreviewPluginsTags(get(this.loadedPlugins), get(this.pluginsStructure))}
            {/if}
        `
    }

    generatePreviewPluginsFile() {
        return getPluginsFileCode(get(this.loadedPlugins), "preview")
    }

    clearLoadedPlugins() {
        this.loadedPlugins.set({})
        this.pluginsStructure.set({})
        this.loaded.set(false)
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

function getHTMLPreviewPluginsTags(
    loadedPlugins: {
        [key: string]: Plugin
    },
    pluginsStructure: {
        [key: string]: string[]
    }
) {
    let tags = ``
    for (const [pluginId, uniques] of Object.entries(pluginsStructure)) {
        if (loadedPlugins[pluginId]?.codeLoader?.getCode().preview === undefined) continue
        for (const componentInstanceId of uniques) {
            tags += `${generateSveltePreviewPluginTag(pluginId, componentInstanceId)}`
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
