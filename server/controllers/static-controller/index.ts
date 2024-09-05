/** @format */

import express, { NextFunction, Request, Response } from "express"
import { singleton } from "tsyringe"
import { AbstractController } from ".."
import crypto from "crypto"
import { stringReplace } from "string-replace-middleware"

@singleton()
export class StaticController extends AbstractController {
    constructor() {
        super("/")
    }
    protected configureRoutes(router: express.Router): void {
        router.use("/", StaticController.nonceMiddleWare)

        router.use("/", express.static("public/site"))
        router.use("/lib", express.static("public/library"))
    }

    static nonceMiddleWare(req: Request, res: Response, next: NextFunction) {
        return stringReplace(
            {
                "{%NONCE%}": StaticController.generateNonce(),
            },
            {
                contentTypeFilterRegexp: /.*text\/html.*/,
            }
        )(req, res, next)
    }
    static generateNonce() {
        return crypto.randomBytes(16).toString("base64")
    }
}
