/** @format */
import type { Connection } from "sharedb/lib/client"
import { Component } from "./component"
import { Plugin } from "./plugin"

export class ComponentLoader {
    private loadedComponents: { [key: string]: Component } = {}
    private constructor() {}

    static async from(loadableComponentsIds: string[], connection: Connection) {
        const componentLoader = new ComponentLoader()
        for (const loadableComponentId of loadableComponentsIds) {
            const component = await Component.init(loadableComponentId, connection)
            componentLoader.loadComponent(component)
        }
        return componentLoader
    }

    loadComponent(component: Component) {
        if (this.loadedComponents[component.id] === undefined) this.loadedComponents[component.id] = component
        return this.loadedComponents[component.id]
    }

    getComponentWithId(componentId: string) {
        return this.loadedComponents[componentId]
    }

    getComponentDependencies(componentId: string, dependencies: Set<string> = new Set([])) {
        const searchForDependencies = (slots: any[][]) => {
            for (const slot of slots) {
                for (const child of slot) {
                    dependencies.add(child.id)
                    if (child.children) searchForDependencies(child.children)
                    if (!dependencies.has(child.id)) this.getComponentDependencies(child.id, dependencies)
                }
            }
        }
        searchForDependencies(this.loadedComponents[componentId].documentData.children)
        return dependencies
    }

    getDependencyPlugins() {
        const dependencyPlugins = new Set<string>()
        for (const component of Object.values(this.loadedComponents)) {
            for (const plugin of component.getPlugins()) {
                dependencyPlugins.add(plugin)
            }
        }
        return Array.from(dependencyPlugins)
    }

    getAllLoadedComponentIds() {
        return Object.values(this.loadedComponents).map(({ id }) => id)
    }
}

export class PluginLoader {
    loadedPlugins: { [key: string]: Plugin } = {}
    private constructor() {}
    static async from(loadablePluginsIds: string[], connection: Connection) {
        const pluginLoader = new PluginLoader()
        for (const loadablePluginId of loadablePluginsIds) {
            const plugin = await Plugin.init(loadablePluginId, connection)
            pluginLoader.loadElement(plugin)
        }
        return pluginLoader
    }

    loadElement(plugin: Plugin) {
        if (this.loadedPlugins[plugin.id] === undefined) this.loadedPlugins[plugin.id] = plugin
        return this.loadedPlugins[plugin.id]
    }

    getPluginWithId(pluginId: string) {
        return this.loadedPlugins[pluginId]
    }

    getAllLoadedPluginIds() {
        return Object.values(this.loadedPlugins).map(({ id }) => id)
    }
}
