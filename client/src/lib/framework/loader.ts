/** @format */

import {
    compileComponentList2SvelteList,
    compileSvelteImports,
    createSvelteFile,
    findSvelteImports,
    flattenHMTL,
    isComponentInHouseFromId,
} from "$shared/sharedb"
import { get, writable, type Writable } from "svelte/store"
import { Component, type ParentComponent } from "./component"
import { Packages } from "$shared/packages"
import { PUBLIC_LIB_URL, PUBLIC_MARKETPLACE_URL } from "$env/static/public"
import { safeFetch } from "./networking"

export class ComponentLoader {
    loadedComponents: { [key: string]: Component } = {}
    main: Writable<ParentComponent | undefined> = writable()

    registerComponent(component: ParentComponent) {
        this.main.set(component)
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

export class FileCodeLoader extends CodeLoader {
    constructor(component: Component) {
        super(component)
    }

    async load() {
        const path = this.getFilePath()
        const code = await this.fetchCodeFromFile(path)

        if (code === undefined) return
        this.code.set(code)
    }

    async fetchCodeFromFile(path) {
        const [result, error] = await safeFetch(path, {
            credentials: "omit",
        })
        if (error) return
        return result
    }

    getFilePath() {
        if (isComponentInHouseFromId(this.component.id)) {
            return `${PUBLIC_LIB_URL}${Packages[this.component.id].file}`
        } else {
            return `${PUBLIC_MARKETPLACE_URL}${this.component?.doc?.data.file}`
        }
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

        for (const componentId of get(this.imports)) {
            await Component.init(componentId, this.component.componentLoader!, this.component.connection!)
        }
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
