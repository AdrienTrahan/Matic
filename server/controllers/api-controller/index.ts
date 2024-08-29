/** @format */

import express from "express"
import { singleton } from "tsyringe"
import { AbstractController } from ".."
import { OTFrontendService } from "../../services/ot-client"
import { AuthController } from "../auth-controller"
import { ProjectController } from "../project-controller"
import { ValidationController } from "../validation-controller"
@singleton()
export class ApiController extends AbstractController {
    constructor(
        private readonly otFrontendService: OTFrontendService,
        private readonly authController: AuthController,
        private readonly projectController: ProjectController
    ) {
        super("/api")
    }
    protected configureRoutes(router: express.Router): void {
        this.authController.use(router)
        this.projectController.use(router)
    }
}
