/** @format */
import { Viewer } from "$framework/viewer"
import { ComponentTypes } from "$shared/sharedb"
import { get, writable, type Writable } from "svelte/store"
import { Component } from "./component"
import type { ComponentLoader, PluginLoader } from "./element-loader"
import type { Project } from "./project"

export class Editor {
    private componentLoader: ComponentLoader
    private pluginLoader: PluginLoader
    private project: Project
    private viewer: Viewer
    private presentedComponent: Writable<Component | null> = writable(null)

    constructor(project: Project, componentLoader: ComponentLoader, pluginLoader: PluginLoader) {
        this.project = project

        this.componentLoader = componentLoader
        this.pluginLoader = pluginLoader

        this.viewer = new Viewer(this)
    }

    async presentComponent(componentId: string) {
        let component = this.componentLoader.getComponentWithId(componentId)
        if (component === undefined) {
            await this.project.reloadProject()
            return await get(this.project.getEditor()).presentComponent(componentId)
        }
        this.presentedComponent.set(component)
        this.viewer.resetPresentedComponent()
    }

    getPresentedComponent() {
        return this.presentedComponent
    }

    getComponentWithId(id: string) {
        return this.componentLoader.getComponentWithId(id)
    }

    getAllComponentsDependencies(): string[] {
        const dependencies = new Set<string>([])
        for (const componentId of this.componentLoader.getAllLoadedComponentIds()) {
            const component = this.componentLoader.getComponentWithId(componentId)
            if (component.componentType !== ComponentTypes.TREE) continue
            for (const dependency of this.componentLoader.getComponentDependencies(componentId)) {
                dependencies.add(dependency)
            }
            dependencies.add(componentId)
        }
        return Array.from(dependencies)
    }

    getAllComponentsTreeDependencies() {
        return this.getAllComponentsDependencies().filter(
            dependency => this.getComponentWithId(dependency).componentType == ComponentTypes.TREE
        )
    }

    getAllComponentsFileDependencies() {
        return this.getAllComponentsDependencies().filter(
            dependency => this.getComponentWithId(dependency).componentType == ComponentTypes.FILE
        )
    }

    getPresentedComponentDependencies(includePresentedComponent: boolean = true): string[] {
        const $presentedComponent = get(this.presentedComponent)
        if ($presentedComponent === null) return []
        const dependencies = Array.from(this.componentLoader.getComponentDependencies($presentedComponent.id))
        if (includePresentedComponent) return [$presentedComponent.id, ...dependencies]
        return dependencies
    }

    getPresentedComponentTreeDependencies() {
        return this.getPresentedComponentDependencies().filter(
            dependency => this.getComponentWithId(dependency).componentType == ComponentTypes.TREE
        )
    }

    getPresentedComponentFileDependencies() {
        return this.getPresentedComponentDependencies().filter(
            dependency => this.getComponentWithId(dependency).componentType == ComponentTypes.FILE
        )
    }

    loadComponent(componentId: string) {}

    getViewer() {
        return this.viewer
    }
}
