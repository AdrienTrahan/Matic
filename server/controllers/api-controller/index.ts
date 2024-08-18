import express from "express";
import { singleton } from "tsyringe";
import { AbstractController } from "..";
import { NextFunction, Router, Response, Request} from "express";
import { ValidationError, validate } from "express-validation";
import { OTFrontendService } from "../../services/ot-client";
import { AuthController } from "../auth-controller";
import { ValidationController } from "../validation-controller";
@singleton()
export class ApiController extends AbstractController{
    constructor(
        private readonly otFrontendService: OTFrontendService,
        private readonly authController: AuthController,
        private readonly validationController: ValidationController
    ){
        super("/api")
    }
    protected configureRoutes(router: express.Router): void {
        router.get("/create-project", ({query}, res) => {
            this.otFrontendService.createProject(query.name as string)
        })

        this.authController.use(router);
        // leave at the bottom
        this.validationController.use(router);
    }
}

