/** @format */

import { singleton } from "tsyringe"
import { DatabaseService } from "../database-service"
import { OTFrontendService } from "../ot-client"

@singleton()
export class BuilderService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly otFrontendService: OTFrontendService
    ) {}

    generateHTML(projectId: string, page: string) {}
}
