/** @format */

import {
    compileComponentList2SvelteList,
    compileSvelteImports,
    createSvelteFile,
    findSvelteImports,
    flattenHMTL,
} from "$shared/sharedb"
import { get, writable, type Writable } from "svelte/store"
import { Component, type ParentComponent } from "./component"

export class ComponentLoader {
    loadedComponents: { [key: string]: Component } = {}
    main: ParentComponent | undefined

    registerComponent(component: ParentComponent) {
        this.main = component
    }

    loadComponent(component: Component) {
        if (this.loadedComponents[component.id] === undefined) this.loadedComponents[component.id] = component
        return this.loadedComponents[component.id]
    }

    clearLoadedComponents() {
        this.loadedComponents = {}
    }
}

export class CodeLoader {
    component: Component
    code: Writable<string> = writable(``)

    constructor(component: Component) {
        this.component = component
    }

    async load() {
        throw "Not Implemented"
    }

    getCode() {
        return get(this.code)
    }
}

export class TreeCodeLoader extends CodeLoader {
    imports: Writable<string[]> = writable([])
    htmlComponents: Writable<any[]> = writable([])

    constructor(component: Component) {
        super(component)
        this.imports.subscribe(this.updateCode.bind(this))
        this.htmlComponents.subscribe(this.updateCode.bind(this))
    }

    async load() {
        await this.loadImports()
        this.generateSvelteDOM()
    }

    async loadImports() {
        this.imports.set(Array.from(findSvelteImports(this.component.doc!.data.tree)))
        get(this.imports).forEach(
            async (id: string) => await Component.init(id, this.component.componentLoader!, this.component.connection!)
        )
    }

    generateSvelteDOM() {
        this.htmlComponents.set(compileComponentList2SvelteList(this.component.doc?.data.tree))
    }

    updateCode() {
        const svelteImportsCode = compileSvelteImports(get(this.imports))
        const svelteDomCode = flattenHMTL(get(this.htmlComponents))
        const svelteFileCode = createSvelteFile(svelteImportsCode, svelteDomCode)
        this.code.set(svelteFileCode)
    }
}
