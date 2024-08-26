/** @format */

import { getProjectDocumentId, PROJECT_COLLECTION } from "$shared/sharedb"
import type { Connection, Doc } from "sharedb/lib/client"
import { Connector } from "./socket/connection"

export class Component {
    projectId: string
    id: string
    connection: Connection | undefined
    doc: Doc | undefined
    protected constructor(id: string, projectId: string) {
        this.projectId = projectId
        this.id = id
    }

    static async init(id: string, projectId: string, connection: Connection) {
        let component = new Component(id, projectId)
        component.connection = connection
        await component.loadDocument()
        return component
    }

    async loadDocument() {
        this.doc = this.connection!.get(PROJECT_COLLECTION, getProjectDocumentId(this.projectId))
        await new Promise<void>((resolve, reject) => this.doc!.fetch(err => (err ? reject(err) : resolve())))
    }
}

export class ParentComponent extends Component {
    static async init(id: string, projectId: string) {
        const connection = await ParentComponent.loadConnection(projectId)
        return await Component.init(id, projectId, connection)
    }
    static async loadConnection(projectId: string) {
        return await Connector.get(projectId)
    }
}
