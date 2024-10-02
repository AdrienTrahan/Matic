/** @format */

import { Doc } from "sharedb/lib/client"
import { singleton } from "tsyringe"
import {
    COMPONENT_COLLECTION,
    getComponentDocumentId,
    getProjectDocumentId,
    PROJECT_COLLECTION,
} from "../../../shared/sharedb"
import { UNEXPECTED_ERROR_OCCURED } from "../../error"
import { OTBackendService } from "../ot-backend"
import { getDefaultComponentStructure } from "./default-structure/component"
import { DEFAULT_PAGE_COMPONENT_NAME, getDefaultProjectStructure } from "./default-structure/project"

@singleton()
export class OTFrontendService {
    constructor(private readonly otBackendService: OTBackendService) {}

    getProjectDocument(documentId: string) {
        const connection = this.otBackendService.getConnection()
        const document = connection.get(PROJECT_COLLECTION, documentId)
        return document
    }

    getComponentDocument(documentId: string) {
        const connection = this.otBackendService.getConnection()
        const document = connection.get(COMPONENT_COLLECTION, documentId)
        return document
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
        const documentId = getProjectDocumentId(projectId)
        // Shouldn't exist anyways -> useless check?
        const projectExists = await this.projectExists(documentId)
        if (projectExists[0] || projectExists[1]) return projectExists

        const doc = this.getProjectDocument(documentId)!

        const [componentDocId, err] = await this.createComponent(projectId, "0")
        if (err) throw UNEXPECTED_ERROR_OCCURED
        return await new Promise<any>(resolve =>
            doc.create(getDefaultProjectStructure(projectId, componentDocId), err =>
                err ? resolve([null, err]) : resolve([null, null])
            )
        )
    }

    async createComponent(projectId: string, componentId?: string) {
        if (componentId === undefined) {
            const projectDocId = getProjectDocumentId(projectId)
            const projDoc = this.getProjectDocument(projectDocId)

            const [_, err] = await this.updateDocument(projDoc)
            if (err || !projDoc?.data) return [null, err]
            componentId = `${Object.values(projDoc.data.library).length + Object.values(projDoc.data.pages).length}`
        }

        const componentDocId = getComponentDocumentId(projectId, componentId)
        const componentDoc = this.getComponentDocument(componentDocId)!

        return await new Promise<any>(resolve =>
            componentDoc.create(getDefaultComponentStructure(componentDocId), err =>
                err ? resolve([null, err]) : resolve([componentDocId, null])
            )
        )
    }

    async addComponentToProject(componentDocId: string, projectId: string, name: string): Promise<any[]> {
        const projectDocId = getProjectDocumentId(projectId)
        const projDoc = this.getProjectDocument(projectDocId)
        const [_, err] = await this.updateDocument(projDoc)
        if (err || !projDoc?.data) return [null, err]

        return await new Promise(resolve => {
            projDoc.submitOp({ p: ["library", componentDocId], oi: name }, {}, error =>
                resolve(error ? [null, error] : [null, null])
            )
        })
    }
}
