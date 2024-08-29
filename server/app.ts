/** @format */

import cookieParser from "cookie-parser"
import cors from "cors"
import "dotenv/config"
import express from "express"
import fs from "fs"
import helmet from "helmet"
import http from "http"
import https from "https"
import { singleton } from "tsyringe"
import { DynamicController } from "./controllers/dynamic-controller"
import { StaticController } from "./controllers/static-controller"
import { OTBackendService } from "./services/ot-backend"

@singleton()
export class Application {
    private app: express.Application
    private httpsServer: https.Server
    private httpServer: http.Server

    constructor(
        readonly otBackendService: OTBackendService,
        private readonly dynamicController: DynamicController,
        private readonly staticController: StaticController
    ) {
        this.app = express()
        this.httpsServer = https.createServer(
            {
                key: fs.readFileSync(process.env.HTTPS_KEY_PATH || ""),
                cert: fs.readFileSync(process.env.HTTPS_CERT_PATH || ""),
            },
            this.app
        )

        this.httpServer = http.createServer((req, res) => {
            res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` })
            res.end()
        })
        this.configureMiddlewares()
        this.configureRoutes()

        otBackendService.launch(this.httpsServer)
    }

    start(
        httpsPort: string | number | undefined = process.env.SERVER_PORT_HTTPS || 443,
        httpPort: string | number | undefined = process.env.SERVER_PORT_HTTP || 80
    ) {
        this.httpsServer.listen(httpsPort, () => console.log(`HTTPS server running on port ${httpsPort}`))
        this.httpServer.listen(httpPort, () => console.log(`HTTP server running on port ${httpPort}`))
    }
    private configureMiddlewares() {
        this.app.use(cookieParser())
        this.app.use(
            cors({
                origin: ["http://localhost", "http://localhost:5173", "https://localhost:5173", "https://localhost"],
                credentials: true,
            })
        )
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }))
    }
    private configureRoutes() {
        this.staticController.use(this.app)
        this.dynamicController.use(this.app)
    }
    getHttpsServer() {
        return this.httpsServer
    }
    getHttpServer() {
        return this.httpServer
    }
}
