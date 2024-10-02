/** @format */

import { Project } from "$framework/project"
import { Connector } from "$framework/socket/connection"
import { redirect } from "@sveltejs/kit"

export async function load({ url, fetch }) {
    const params = new URLSearchParams(url.searchParams)
    if (!params.get("id")) throw redirect(307, "/projects")

    const projectId = parseInt(params.get("id")!).toString()
    const connection = await Connector.get(projectId)
    const project = await Project.init(projectId, fetch)

    return {
        project,
        connection,
    }
}
