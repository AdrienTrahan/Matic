/** @format */

import { singleton } from "tsyringe"
import ShareDB from "sharedb"
import { getProjectDocumentId, PROJECT_COLLECTION } from "../../../../shared/sharedb"
import { UNAUTHORIZED } from "../../../error"

@singleton()
export class OTBackendMiddlewares {
    constructor() {}

    configure(backend: ShareDB) {
        backend.use("readSnapshots", this.readAuthMiddleware)
    }

    readAuthMiddleware(context: any, next: any) {
        const { projectId, backend, permissions } = context.agent.custom
        if (context.collection == PROJECT_COLLECTION) {
            const projectDocId = getProjectDocumentId(projectId)
            const projectIdMatches = context.snapshots.every((snapshot: any) => snapshot.id == projectDocId)
            ;(projectIdMatches && permissions > 0) || backend ? next() : next(UNAUTHORIZED)
        }
    }
}
