/** @format */

import type { Connection } from "sharedb/lib/client"
import { get, writable, type Writable } from "svelte/store"
import { Component, type ParentComponent } from "./component"
import { Plugin } from "./plugin"
import { TreeComponentCodeLoader } from "./code-loader"
import { flattenComponentWithIds } from "$shared/sharedb"

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
        const loadedComponentsObj = componentLoader.loadedComponents
        loadedComponentsObj[parentComponent.id] = parentComponent

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

    clearLoadedPlugins() {
        this.loadedPlugins.set({})
        this.pluginsStructure.set({})
    }
}
