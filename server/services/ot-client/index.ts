/** @format */

import ShareDB, { Doc } from "sharedb/lib/client"
import { singleton } from "tsyringe"
import { OTBackendService } from "../ot-backend"

@singleton()
export class OTFrontendService {
    constructor(private readonly otBackendService: OTBackendService) {}

    getProjectDocument(projectId: string) {
        const connection = this.otBackendService.getConnection()
        const document = connection.get("PROJECTS", projectId)
        return document
    }

    async updateDocument(doc: Doc) {
        return await new Promise<[any, any]>(resolve => doc.fetch(err => resolve(err ? [null, err] : [null, null])))
    }

    async projectExists(projectId: string) {
        const doc = this.getProjectDocument(projectId)!
        const [_, error] = await this.updateDocument(doc)
        return [!!doc.type, error]
    }

    async createProject(projectId: string) {
        const projectExists = await this.projectExists(projectId)
        if (projectExists[0]) return projectExists
        if (projectExists[1]) return projectExists

        const doc = this.getProjectDocument(projectId)!
        const projectCreate = await new Promise<any>(resolve =>
            doc.create({ element: 2 }, err => (err ? resolve([null, err]) : resolve([null, null])))
        )
        if (projectCreate[1]) return projectCreate
    }
}
