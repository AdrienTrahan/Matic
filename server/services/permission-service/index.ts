/** @format */

import { singleton } from "tsyringe"
import { UNEXPECTED_ERROR_OCCURED } from "../../error"
import { DatabaseService } from "../database-service"

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
}
