/** @format */

import { ComponentLoader } from "$framework/loader"
import { Project } from "$framework/project"
import { redirect } from "@sveltejs/kit"

export async function load({ url, fetch }) {
    const params = new URLSearchParams(url.searchParams)
    if (!params.get("id")) throw redirect(307, "/projects")
    const id = parseInt(params.get("id")!).toString()

    const loader = new ComponentLoader()
    const project = await Project.init(id)

    const [_, error] = await project.loadGeneralProjectData(fetch)
    if (error) throw redirect(307, "/projects")

    return {
        project,
        loader,
    }
}
