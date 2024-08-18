/** @format */

import express from "express"

export abstract class AbstractController {
    private path: string
    private router: express.Router
    private routesConfigured: boolean = false

    constructor(path: string) {
        this.path = path
        this.router = express.Router()
    }
    use(app: any) {
        if (!this.routesConfigured) {
            this.configureRoutes(this.router)
            this.routesConfigured = true
        }
        app.use(this.path, this.router)
    }
    protected abstract configureRoutes(router: express.Router): void
}

export abstract class ErrorHandlerController {
    private routesConfigured: boolean = false

    use(app: any) {
        if (!this.routesConfigured) {
            this.configureRoutes(app)
            this.routesConfigured = true
        }
    }
    protected abstract configureRoutes(router: express.Router): void
}
