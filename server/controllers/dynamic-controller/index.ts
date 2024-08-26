/** @format */

import express from "express"
import { singleton } from "tsyringe"
import { AbstractController } from ".."
import { ApiController } from "../api-controller"
@singleton()
export class DynamicController extends AbstractController {
    constructor(private readonly apiController: ApiController) {
        super("/")
    }
    protected configureRoutes(router: express.Router): void {
        this.apiController.use(router)
    }
}
