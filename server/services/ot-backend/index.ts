/** @format */

import * as https from "https"
import ShareDB from "sharedb"
import { Connection } from "sharedb/lib/client"
import { singleton } from "tsyringe"
import * as WebSocket from "ws"
import { parseCookies } from "../../utils"
import { AuthService } from "../auth-service"
import { ProjectService } from "../project-service"
import { PermissionService, ProjectPermissions } from "../permission-service"
const ShareDBMongo = require("sharedb-mongo")
const WebSocketJSONStream = require("websocket-json-stream")

@singleton()
export class OTBackendService {
    database: any
    backend: ShareDB | undefined
    webSocketServer: WebSocket.WebSocketServer | undefined
    connection: Connection | undefined

    constructor(private authService: AuthService, private permissionService: PermissionService) {
        this.database = ShareDBMongo(process.env.MONGO_CONNECTION_STRING)
    }

    launch(server: https.Server) {
        this.webSocketServer = new WebSocket.Server({ server: server })
        this.backend = new ShareDB({ db: this.database })

        this.configureMiddlewares()

        this.webSocketServer.on("connection", async (webSocket, req) => {
            var stream = new WebSocketJSONStream(webSocket)

            const projectId = new URLSearchParams(req.url?.startsWith("/") ? req.url.substring(1) : req.url).get(
                "projectId"
            )
            if (!projectId) return

            let { token, userId } = parseCookies(req.headers.cookie).session
            if (!(await this.authService.isTokenValid(token, userId))) return

            const permission = await this.permissionService.getProjectPermissionsForUser(userId, projectId)
            if (permission == 0) return

            this.backend!.listen(stream, {
                permissions: permission,
                projectId: projectId,
                backend: false,
            })
        })
    }

    configureMiddlewares() {
        if (!this.backend) throw "OTBackend used before service is launched"

        this.backend.use("readSnapshots", (context, next) => {
            // if (this.isBackendContext(context)) next()
        })
    }

    getConnection() {
        if (!this.connection) this.connection = this.backend?.connect(undefined, { backend: true })
        if (!this.connection) throw "OTBackend used before service is launched"
        return this.connection
    }
}
