/** @format */

import { goto } from "$app/navigation"
import { PUBLIC_WEBSOCKET_HOST } from "$env/static/public"
import { UNEXPECTED_ERROR } from "$framework/error"
import ReconnectingWebSocket from "reconnecting-websocket"
import { Connection } from "sharedb/lib/client"

export class Connector {
    static connections = {}
    static async get(projectId: string) {
        if (Connector.connections[projectId]) return this.connections[projectId]
        const [connection, error] = await this.getConnection(projectId)
        if (error) throw error
        Connector.connections[projectId] = connection
        return Connector.connections[projectId]
    }

    private static async getConnection(projectId: string) {
        return await new Promise((resolve, reject) => {
            const socket = new ReconnectingWebSocket(`${PUBLIC_WEBSOCKET_HOST}?projectId=${projectId}`, [], {
                maxEnqueuedMessages: 0,
            })

            const openEventListener = () => {
                socket.removeEventListener("open", openEventListener)
                resolve(socket)
            }
            const closeEventListener = () => {
                socket.removeEventListener("close", openEventListener)
                socket.close()
                delete Connector.connections[projectId]
                reject()
            }
            socket.addEventListener("open", openEventListener)
            socket.addEventListener("close", closeEventListener)
        })
            .then((socket: any) => {
                return [new Connection(socket), null]
            })
            .catch(() => {
                alert("Unauthorized")
                goto("/projects")
                return [null, UNEXPECTED_ERROR]
            })
    }
}
