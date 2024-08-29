/** @format */

import express from "express"
import { singleton } from "tsyringe"
import { AbstractController } from ".."
import { ApiController } from "../api-controller"
import { PreviewController } from "../preview-controller"
import { ValidationController } from "../validation-controller"
@singleton()
export class DynamicController extends AbstractController {
    constructor(
        private readonly validationController: ValidationController,
        private readonly apiController: ApiController,
        private readonly previewController: PreviewController
    ) {
        super("/")
    }
    protected configureRoutes(router: express.Router): void {
        this.apiController.use(router)
        this.previewController.use(router)
        // leave at the bottom
        this.validationController.use(router)
    }
}
