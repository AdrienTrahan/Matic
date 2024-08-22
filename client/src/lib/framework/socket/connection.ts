/** @format */

import ReconnectingWebSocket from "reconnecting-websocket"
import { Connection } from "sharedb/lib/client"
import { PUBLIC_WEBSOCKET_HOST } from "$env/static/public"

export class Connector {
    static connections = {}
    static get(projectId: string) {
        if (Connector.connections[projectId]) return this.connections
        Connector.connections[projectId] = this.getConnection(projectId)
    }

    private static getConnection(projectId: string) {
        const socket = new ReconnectingWebSocket(`${PUBLIC_WEBSOCKET_HOST}?projectId=${projectId}`, [], {
            maxEnqueuedMessages: 0,
        }) as any

        return new Connection(socket)
    }
}
