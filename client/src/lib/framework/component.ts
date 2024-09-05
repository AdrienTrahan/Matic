/** @format */

import { type File } from "$lib/components/utils/bundler"
import { Packages } from "$shared/packages"
import { COMPONENT_COLLECTION, ComponentTypes, isComponentInHouseFromId } from "$shared/sharedb"
import type { Connection, Doc } from "sharedb/lib/client"
import { TreeCodeLoader, type CodeLoader, type ComponentLoader } from "./loader"

export class Component {
    componentLoader: ComponentLoader

    id: string
    connection: Connection | undefined
    doc: Doc | undefined

    importedComponents: Component[] = []
    componentType: ComponentTypes = ComponentTypes.TREE

    codeLoader: CodeLoader | undefined

    get documentData() {
        return isComponentInHouseFromId(this.id) ? Packages[this.id] : this.doc?.data
    }

    protected constructor(id: string, componentLoader: ComponentLoader) {
        this.componentLoader = componentLoader
        this.id = id
    }

    static async init(id: string, loader: ComponentLoader, connection: Connection) {
        let component = new Component(id, loader)
        component = loader.loadComponent(component)
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
            this.codeLoader = new TreeCodeLoader(this)
        } else {
            // this.fetchComponentFile()
        }

        await this.codeLoader!.load()
        return this
    }

    async loadDocument() {
        this.doc = this.connection!.get(COMPONENT_COLLECTION, this.id)
        await new Promise<void>((resolve, reject) => this.doc!.fetch(err => (err ? reject(err) : resolve())))
    }
}

export class ParentComponent extends Component {
    bundle: Array<File> | null = null

    static async init(id: string, loader: ComponentLoader, connection: Connection): Promise<ParentComponent> {
        const component = await new ParentComponent(id, loader).from(connection)
        component.bundleCode()
        loader.registerComponent(component)
        return component
    }

    bundleCode() {
        let files = [this, ...this.importedComponents].map((component: Component, index: number): File => {
            return {
                name: index == 0 ? "App" : component.id,
                type: "svelte",
                source: component.codeLoader!.getCode(),
            }
        })
        this.bundle = files
    }
}
