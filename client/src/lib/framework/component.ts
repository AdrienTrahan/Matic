/** @format */

import { type File } from "$lib/components/utils/bundler"
import { Packages } from "$shared/packages"
import {
    COMPONENT_COLLECTION,
    ComponentTypes,
    generateEntrySvelteComponent,
    isComponentInHouseFromId,
} from "$shared/sharedb"
import type { Connection, Doc } from "sharedb/lib/client"
import { writable, type Writable } from "svelte/store"
import { FileCodeLoader, TreeCodeLoader, type CodeLoader, type ComponentLoader } from "./loader"
import { injectUniqueId } from "./selector"

export class Component {
    componentLoader: ComponentLoader

    data: Writable<any> = writable({})

    id: string
    connection: Connection | undefined
    doc: Doc | undefined

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

        await this.loadData()

        this.componentType = isComponentInHouseFromId(this.id)
            ? ComponentTypes.FILE
            : this.doc?.data.type ?? ComponentTypes.FILE

        switch (this.componentType) {
            case ComponentTypes.TREE:
                this.codeLoader = new TreeCodeLoader(this)
                break
            case ComponentTypes.FILE:
                this.codeLoader = new FileCodeLoader(this)
                break
            default:
                throw "Invalid component type"
        }

        await this.codeLoader!.load()
        return this
    }

    async loadData() {
        if (isComponentInHouseFromId(this.id)) {
            return this.loadPackage()
        }
        await this.loadDocument()
    }

    loadPackage() {
        this.data.set(Packages[this.id])
    }

    async loadDocument() {
        this.doc = this.connection!.get(COMPONENT_COLLECTION, this.id)
        // this.doc.on("op", () => {})
        await new Promise<void>((resolve, reject) => this.doc!.subscribe(err => (err ? reject(err) : resolve())))
        const injectTree = injectUniqueId(this.doc.data)
        this.data.set(injectTree)
    }
}

export class ParentComponent extends Component {
    bundle: Writable<Array<File> | null> = writable(null)

    static async init(id: string, loader: ComponentLoader, connection: Connection): Promise<ParentComponent> {
        loader.clearLoadedComponents()

        const component = await new ParentComponent(id, loader).from(connection)

        loader.registerComponent(component)

        component.bundleCode()
        return component
    }

    bundleCode() {
        let files = [this, ...Object.values(this.componentLoader.loadedComponents)].map(
            (component: Component): File => {
                return {
                    name: component.id,
                    type: "svelte",
                    source: component.codeLoader!.getCode(),
                }
            }
        )
        files = [
            {
                name: "App",
                type: "svelte",
                source: generateEntrySvelteComponent(this.id),
            },
            ...files,
        ]

        this.bundle.set(files)
    }
}
