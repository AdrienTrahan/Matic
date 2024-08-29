/** @format */

import { singleton } from "tsyringe"
import { respondWithError, UNAUTHORIZED, UNEXPECTED_ERROR_OCCURED } from "../../error"
import { DatabaseService } from "../database-service"
import express from "express"

export enum ProjectPermissions {
    OWNER = 3,
    READ_WRITE = 2,
    READ = 1,
    REFUSED = 0,
}

@singleton()
export class PermissionService {
    constructor(private readonly databaseService: DatabaseService) {}

    async getProjectPermissionsForUser(userId: string, projectId: string): Promise<ProjectPermissions> {
        const result = (
            await this.databaseService.call("project", "get_permissions", [userId, projectId]).catch(err => {
                throw UNEXPECTED_ERROR_OCCURED
            })
        )[0]?.result
        return result ?? 0
    }

    async verifyPermission(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const { userId } = JSON.parse(req.cookies.session)
            const projectId = req.params?.projectId ?? (req.query.id as string)

            let permission = await this.getProjectPermissionsForUser(userId, projectId)
            if (permission == 0) throw UNAUTHORIZED
            next()
        } catch (error: any) {
            respondWithError(error, res)
        }
    }
}
