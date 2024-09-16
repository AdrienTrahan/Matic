/** @format */
/** @format */

import { Plugins } from "$shared/packages"
import { isElementInHouseFromId, PLUGIN_COLLECTION } from "$shared/sharedb"
import type { Connection, Doc } from "sharedb/lib/client"
import { writable, type Writable } from "svelte/store"
import { PluginCodeLoader } from "./code-loader"
import { type PluginLoader } from "./element-loader"
import { injectUniqueId } from "./selector"

export class Plugin {
    elementLoader: PluginLoader

    data: Writable<any> = writable({})

    id: string
    connection: Connection | undefined
    doc: Doc | undefined

    codeLoader: PluginCodeLoader | undefined

    get documentData() {
        return isElementInHouseFromId(this.id) ? Plugins[this.id] : this.doc?.data
    }

    protected constructor(id: string, elementLoader: PluginLoader) {
        this.elementLoader = elementLoader
        this.id = id
    }

    static async init(id: string, loader: PluginLoader, connection: Connection) {
        let plugin = new Plugin(id, loader)
        return await plugin.from(connection)
    }

    async from(connection: Connection) {
        this.connection = connection

        await this.loadData()

        this.codeLoader = new PluginCodeLoader(this)

        await this.codeLoader!.load()
        return this
    }

    async loadData() {
        return isElementInHouseFromId(this.id) ? this.loadPackage() : this.loadDocument()
    }

    loadPackage() {
        this.data.set(Plugins[this.id])
    }

    async loadDocument() {
        this.doc = this.connection!.get(PLUGIN_COLLECTION, this.id)
        await new Promise<void>((resolve, reject) => this.doc!.subscribe(err => (err ? reject(err) : resolve())))
        const injectTree = injectUniqueId(this.doc.data)
        this.data.set(injectTree)
    }
}
