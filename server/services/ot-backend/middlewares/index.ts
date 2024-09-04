/** @format */

import { singleton } from "tsyringe"
import ShareDB from "sharedb"
import {
    COMPONENT_COLLECTION,
    getComponentDocumentIdPrefix,
    getProjectDocumentId,
    PROJECT_COLLECTION,
} from "../../../../shared/sharedb"
import { UNAUTHORIZED, UNEXPECTED_ERROR_OCCURED } from "../../../error"

@singleton()
export class OTBackendMiddlewares {
    constructor() {}

    configure(backend: ShareDB) {
        backend.use("readSnapshots", this.readAuthMiddleware)
    }

    readAuthMiddleware(context: any, next: any) {
        try {
            const { projectId, backend, permissions } = context.agent.custom

            if (context.collection == PROJECT_COLLECTION) {
                const projectDocId = getProjectDocumentId(projectId)
                const projectIdMatches = context.snapshots.every((snapshot: any) => snapshot.id == projectDocId)
                ;(projectIdMatches && permissions > 0) || backend ? next() : next(UNAUTHORIZED)
            } else if (context.collection == COMPONENT_COLLECTION) {
                const componentDocId = getComponentDocumentIdPrefix(projectId)
                const componentIdMatches = context.snapshots.every((snapshot: any) =>
                    (snapshot.id ?? "").startsWith(componentDocId)
                )
                ;(componentIdMatches && permissions > 0) || backend ? next() : next(UNAUTHORIZED)
            }
        } catch {
            next(UNEXPECTED_ERROR_OCCURED)
        }
    }
}
