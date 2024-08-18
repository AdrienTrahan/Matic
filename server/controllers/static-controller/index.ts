import express from "express";
import { singleton } from "tsyringe";
import { AbstractController } from "..";

@singleton()
export class StaticController extends AbstractController{
    constructor(){
        super("/")
    }
    protected configureRoutes(router: express.Router): void {
        router.use("/", express.static("public/site"))
    }
}
