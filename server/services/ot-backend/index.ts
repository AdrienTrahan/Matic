/** @format */

import { IncomingMessage } from "http"
import * as https from "https"
import ShareDB from "sharedb"
import { Connection } from "sharedb/lib/client"
import { singleton } from "tsyringe"
import * as WebSocket from "ws"
import { INVALID_CREDENTIALS, UNAUTHORIZED, UNEXPECTED_ERROR_OCCURED } from "../../error"
import { parseCookies } from "../../utils"
import { AuthService } from "../auth-service"
import { PermissionService } from "../permission-service"
import { OTBackendMiddlewares } from "./middlewares"
const ShareDBMongo = require("sharedb-mongo")
const WebSocketJSONStream = require("websocket-json-stream")

@singleton()
export class OTBackendService {
    database: any
    backend: ShareDB | undefined
    webSocketServer: WebSocket.WebSocketServer | undefined
    connection: Connection | undefined

    constructor(
        private authService: AuthService,
        private permissionService: PermissionService,
        private otBackendMiddlewares: OTBackendMiddlewares
    ) {
        this.database = ShareDBMongo(process.env.MONGO_CONNECTION_STRING)
    }

    launch(server: https.Server) {
        this.webSocketServer = new WebSocket.Server({ noServer: true })
        this.backend = new ShareDB({ db: this.database })

        this.otBackendMiddlewares.configure(this.backend)

        server.on("upgrade", async (request: any, socket, head) => {
            const [result, error] = await this.verifyClient(request)
            if (!result || error) {
                socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n")
                socket.destroy()
                return
            }

            request.customUserData = result

            this.webSocketServer!.handleUpgrade(request, socket, head, ws => {
                this.webSocketServer!.emit("connection", ws, request)
            })
        })

        this.webSocketServer.on("connection", (socket, request: any) => {
            const stream = new WebSocketJSONStream(socket)
            const agent = this.backend!.listen(stream)
            agent.custom = request.customUserData
        })
    }

    getConnection() {
        if (!this.connection) this.connection = this.backend?.connect()
        if (!this.connection) throw "OTBackend used before service is launched"
        if (this.connection.agent) this.connection.agent.custom = { backend: true }
        return this.connection
    }

    async verifyClient(req: IncomingMessage) {
        try {
            const projectId = new URLSearchParams(req.url?.startsWith("/") ? req.url.substring(1) : req.url).get(
                "projectId"
            )
            if (!projectId) return [null, UNAUTHORIZED]

            const sessionData = parseCookies(req?.headers?.cookie)?.session
            const token = sessionData?.token
            const userId = sessionData?.userId

            if (!token || !userId || !(await this.authService.isTokenValid(token, userId)))
                return [null, INVALID_CREDENTIALS]
            const permission = await this.permissionService.getProjectPermissionsForUser(userId, projectId)

            if (permission == 0) return [null, UNAUTHORIZED]
            return [
                {
                    permissions: permission,
                    projectId: projectId,
                    backend: false,
                },
                null,
            ]
        } catch (error) {
            return [null, UNEXPECTED_ERROR_OCCURED]
        }
    }
}
