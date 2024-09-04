/** @format */

import { type File } from "$lib/components/utils/bundler"
import {
    compileComponentList2SvelteList,
    compileSvelteImports,
    COMPONENT_COLLECTION,
    ComponentTypes,
    findSvelteImports,
    flattenHMTL,
    isComponentInHouseFromId,
} from "$shared/sharedb"
import type { Connection, Doc } from "sharedb/lib/client"
import { get, writable, type Writable } from "svelte/store"
import { Connector } from "./socket/connection"
import { Packages } from "$shared/packages"
export class Component {
    projectId: string
    id: string
    connection: Connection | undefined
    doc: Doc | undefined
    loaded: boolean = false

    imports: Writable<string[]> = writable([])
    htmlComponents: Writable<any[]> = writable([])
    code: Writable<string> = writable(``)

    importedComponents: Component[] = []
    componentType: ComponentTypes = ComponentTypes.TREE

    get documentData() {
        return isComponentInHouseFromId(this.id) ? Packages[this.id] : this.doc?.data
    }

    protected constructor(id: string, projectId: string) {
        this.projectId = projectId
        this.id = id
        this.imports.subscribe(this.updateCode.bind(this))
        this.htmlComponents.subscribe(this.updateCode.bind(this))
    }

    static async init(id: string, projectId: string, connection: Connection) {
        let component = new Component(id, projectId)
        return await component.from(connection)
    }

    async from(connection: Connection) {
        this.connection = connection

        if (isComponentInHouseFromId(this.id)) {
            this.componentType = ComponentTypes.FILE
        } else {
            await this.loadDocument()
            this.componentType = this.doc?.data.type ?? ComponentTypes.FILE
        }
        if (this.componentType == ComponentTypes.TREE) {
            this.loadImports()
            await this.generateSvelteDOM()
        } else {
        }
        this.loaded = true
        return this
    }

    async loadDocument() {
        this.doc = this.connection!.get(COMPONENT_COLLECTION, this.id)
        await new Promise<void>((resolve, reject) => this.doc!.fetch(err => (err ? reject(err) : resolve())))
    }

    loadImports() {
        this.imports.set(Array.from(findSvelteImports(this.doc!.data.tree)))
    }

    async generateSvelteDOM() {
        this.htmlComponents.set(compileComponentList2SvelteList(this.doc?.data.tree))
    }

    updateCode() {
        if (this.componentType == ComponentTypes.FILE) return
        this.code.set(
            `<script>${compileSvelteImports(get(this.imports))}</script>${flattenHMTL(get(this.htmlComponents))}`
        )
    }
}

export class ParentComponent extends Component {
    bundle: Array<File> | null = null

    static async init(id: string, projectId: string): Promise<ParentComponent> {
        const connection = await ParentComponent.loadConnection(projectId)
        const component = await new ParentComponent(id, projectId).from(connection)

        component.bundleCode()

        return component
    }

    static async loadConnection(projectId: string) {
        return await Connector.get(projectId)
    }

    bundleCode() {
        let files = [this, ...this.importedComponents].map((component: Component, index: number): File => {
            return {
                name: index == 0 ? "App" : component.id,
                type: "svelte",
                source: get(component.code),
            }
        })
        this.bundle = files
    }
}
