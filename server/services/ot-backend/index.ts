/** @format */

import * as WebSocket from "ws"
import * as http from "http"
const ShareDBMongo = require("sharedb-mongo")
import ShareDB from "sharedb"
import { Connection } from "sharedb/lib/client"
import { singleton } from "tsyringe"
const WebSocketJSONStream = require("websocket-json-stream")

@singleton()
export class OTBackendService {
    database: any
    backend: ShareDB | undefined
    webSocketServer: WebSocket.WebSocketServer | undefined
    connection: Connection | undefined

    constructor() {
        this.database = ShareDBMongo(process.env.MONGO_CONNECTION_STRING)
    }

    launch(server: http.Server) {
        this.webSocketServer = new WebSocket.Server({ server: server })
        this.backend = new ShareDB({ db: this.database })

        this.configureMiddlewares()

        this.webSocketServer.on("connection", webSocket => {
            var stream = new WebSocketJSONStream(webSocket)
            this.backend!.listen(stream)
        })
    }

    configureMiddlewares() {
        if (!this.backend) throw "OTBackend used before service is launched"

        this.backend.use("readSnapshots", (context, next) => {
            if (this.isBackendContext(context)) next()
        })
    }

    getConnection() {
        if (!this.connection) this.connection = this.backend?.connect()
        if (!this.connection) throw "OTBackend used before service is launched"
        return this.connection
    }

    isBackendContext(context: any) {
        return context.agent.clientId == this.connection?.agent?.clientId && this.connection
    }
}
