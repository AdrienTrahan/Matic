/** @format */

import ShareDB, { Doc } from "sharedb/lib/client"
import { singleton } from "tsyringe"
import { OTBackendService } from "../ot-backend"
import { getDefaultProjectStructure } from "./default-structure/project"
import { getDefaultComponentStructure } from "./default-structure/component"

@singleton()
export class OTFrontendService {
    constructor(private readonly otBackendService: OTBackendService) {}

    getProjectDocument(documentId: string) {
        const connection = this.otBackendService.getConnection()
        const document = connection.get("PR", documentId)
        return document
    }

    getComponentDocument(documentId: string) {
        const connection = this.otBackendService.getConnection()
        const document = connection.get("CP", documentId)
        return document
    }

    getProjectDocumentId(projectId: string) {
        return `PR_${projectId}`
    }

    getComponentDocumentId(projectId: string, componentId: string) {
        return `CP_${projectId}-${componentId}`
    }

    async updateDocument(doc: Doc) {
        return await new Promise<[any, any]>(resolve => doc.fetch(err => resolve(err ? [null, err] : [null, null])))
    }

    async projectExists(documentId: string) {
        const doc = this.getProjectDocument(documentId)!
        const [_, error] = await this.updateDocument(doc)
        return [!!doc.type, error]
    }

    async createProject(projectId: string) {
        const documentId = this.getProjectDocumentId(projectId)
        // Shouldn't exist anyways & useless check?
        const projectExists = await this.projectExists(documentId)
        if (projectExists[0] || projectExists[1]) return projectExists

        const doc = this.getProjectDocument(documentId)!

        const componentId = await this.createComponent(documentId, "0")

        return await new Promise<any>(resolve =>
            doc.create(getDefaultProjectStructure(projectId, componentId), err =>
                err ? resolve([null, err]) : resolve([null, null])
            )
        )
    }

    async createComponent(projectId: string, componentId: string) {
        const documentId = this.getComponentDocumentId(projectId, componentId)
        const doc = this.getComponentDocument(documentId)!
        await new Promise<any>(resolve =>
            doc.create(getDefaultComponentStructure(documentId), err =>
                err ? resolve([null, err]) : resolve([null, null])
            )
        )
        return documentId
    }
}
