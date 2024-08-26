/** @format */

import { Doc } from "sharedb/lib/client"
import { singleton } from "tsyringe"
import { DatabaseService } from "../database-service"
import { UNAUTHORIZED, UNEXPECTED_ERROR_OCCURED } from "../../error"
import { OTFrontendService } from "../ot-client"
import { DEFAULT_PROJECT_NAME } from "./contants"

@singleton()
export class ProjectService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly otFrontendService: OTFrontendService
    ) {}

    async createProject(userId: string) {
        let [project] = await this.databaseService
            .call("project", "create_project", [DEFAULT_PROJECT_NAME, userId])
            .catch(err => {
                throw UNEXPECTED_ERROR_OCCURED
            })
        if (!project || !project.id) throw UNEXPECTED_ERROR_OCCURED

        const projectId = project.id
        const [_, error] = await this.otFrontendService.createProject(projectId)
        if (error) throw UNEXPECTED_ERROR_OCCURED
        return projectId
    }

    async getProject(projectId: string, userId: string) {
        let projects = await this.databaseService.call("project", "get_project", [userId, projectId]).catch(err => {
            throw UNEXPECTED_ERROR_OCCURED
        })
        if (projects.length == 0) {
            throw UNAUTHORIZED
        }
        return projects[0]
    }

    async listProjects(userId: string) {
        return await this.databaseService.call("project", "list_projects", [userId]).catch(err => {
            throw UNEXPECTED_ERROR_OCCURED
        })
    }

    async updateName(name: string, projectId: string) {
        return await this.databaseService.call("project", "update_project-name", [name, projectId]).catch(err => {
            throw UNEXPECTED_ERROR_OCCURED
        })
    }
}
