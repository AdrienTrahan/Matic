/** @format */

import ReconnectingWebSocket from "reconnecting-websocket"
import { Connection } from "sharedb/lib/client"
import { PUBLIC_WEBSOCKET_HOST } from "$env/static/public"

var socket = new ReconnectingWebSocket(PUBLIC_WEBSOCKET_HOST, [], {
    maxEnqueuedMessages: 0,
}) as any

export const connection = new Connection(socket)
