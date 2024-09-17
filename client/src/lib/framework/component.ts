/** @format */

import { type File } from "$lib/components/utils/bundler"
import { Components } from "$shared/packages"
import {
    COMPONENT_COLLECTION,
    ComponentTypes,
    generateEntrySvelteComponent,
    isElementInHouseFromId,
} from "$shared/sharedb"
import type { Connection, Doc } from "sharedb/lib/client"
import { writable, type Writable } from "svelte/store"
import { FileComponentCodeLoader, TreeComponentCodeLoader, type ComponentCodeLoader } from "./code-loader"
import { injectUniqueId } from "./selector"
import type { ComponentLoader, PluginLoader } from "./element-loader"

export class Component {
    componentLoader: ComponentLoader

    data: Writable<any> = writable({})

    id: string
    connection: Connection | undefined
    doc: Doc | undefined

    componentType: ComponentTypes = ComponentTypes.TREE

    codeLoader: ComponentCodeLoader | undefined

    get documentData() {
        return isElementInHouseFromId(this.id) ? Components[this.id] : this.doc?.data
    }

    protected constructor(id: string, componentLoader: ComponentLoader) {
        this.componentLoader = componentLoader
        this.id = id
    }

    static async init(id: string, loader: ComponentLoader, connection: Connection) {
        let component = new Component(id, loader)
        component = loader.loadElement(component)
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
        this.data.set(Components[this.id])
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
        loader.clearLoadedElements()

        const component = await new ParentComponent(id, loader).from(connection)

        loader.registerComponent(component)

        return component
    }

    bundleCode(pluginLoader: PluginLoader) {
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
            {
                name: "Plugins",
                type: "svelte",
                source: pluginLoader.generateInjectedPlugins(),
            },
            ...files,
            ...pluginLoader.generateInjectedPluginsFile(),
        ]

        this.bundle.set(files)
    }
}
