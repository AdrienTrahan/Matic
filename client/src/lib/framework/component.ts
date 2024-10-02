/** @format */

import { Components } from "$shared/packages"
import { COMPONENT_COLLECTION, ComponentTypes, isElementInHouseFromId } from "$shared/sharedb"
import type { Connection, Doc } from "sharedb/lib/client"
import { derived, writable, type Writable } from "svelte/store"
import { FileComponentCodeLoader, TreeComponentCodeLoader, type ComponentCodeLoader } from "./code-loader"
import { injectUniqueId } from "./selector"

export class Component {
    id: string
    componentType: ComponentTypes = ComponentTypes.TREE
    connection: Connection | undefined
    componentData: Writable<any> = writable({})
    dependencies: Writable<string[]> = writable([])

    doc: Doc | undefined
    codeLoader: ComponentCodeLoader | undefined

    get documentData() {
        return isElementInHouseFromId(this.id) ? Components[this.id] : this.doc?.data
    }

    protected constructor(id: string) {
        this.id = id
    }

    static async init(id: string, connection: Connection) {
        let component = new Component(id)
        return await component.from(connection)
    }

    async from(connection: Connection) {
        this.connection = connection

        await this.loadData()

        this.componentType = isElementInHouseFromId(this.id)
            ? ComponentTypes.FILE
            : this.doc?.data.type ?? ComponentTypes.FILE

        switch (this.componentType) {
            case ComponentTypes.TREE:
                this.codeLoader = new TreeComponentCodeLoader(this)
                break
            case ComponentTypes.FILE:
                this.codeLoader = new FileComponentCodeLoader(this)
                break
            default:
                throw "Invalid component type"
        }

        await this.codeLoader!.load()
        return this
    }

    async loadData() {
        return isElementInHouseFromId(this.id) ? this.loadPackage() : this.loadDocument()
    }

    loadPackage() {
        this.componentData.set(Components[this.id])
    }

    async loadDocument() {
        this.doc = this.connection!.get(COMPONENT_COLLECTION, this.id)
        this.doc.on("op", () => this.updateComponentData.bind(this))
        await new Promise<void>((resolve, reject) =>
            this.doc!.subscribe(err => {
                err ? reject(err) : resolve()
                const injectTree = injectUniqueId(this.doc?.data)
                this.componentData.set(injectTree)
            })
        )
        const injectTree = injectUniqueId(this.doc.data)
        this.componentData.set(injectTree)
    }

    updateComponentData() {
        this.componentData.set(this.doc?.data)
    }

    updateDependencies() {
        const dependencies = new Set<string>([])
        const searchForDependencies = (slots: any[][]) => {
            for (const slot of slots) {
                for (const child of slot) {
                    dependencies.add(child.id)
                    if (child.children) searchForDependencies(child.children)
                }
            }
        }
        searchForDependencies(this.documentData.children)
        this.dependencies.set(Array.from(dependencies))
    }
}
