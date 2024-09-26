/** @format */

import { ComponentLoader, PluginLoader } from "$framework/element-loader"
import { Project } from "$framework/project"
import { redirect } from "@sveltejs/kit"

export async function load({ url, fetch }) {
    const params = new URLSearchParams(url.searchParams)
    if (!params.get("id")) throw redirect(307, "/projects")
    const id = parseInt(params.get("id")!).toString()

    const project = await Project.init(id)

    const componentLoader = new ComponentLoader(Object.keys(project.library))
    const pluginLoader = new PluginLoader()

    const [_, error] = await project.loadGeneralProjectData(fetch)

    console.log(Object.keys(project.library))

    if (error) throw redirect(307, "/projects")

    return {
        project,
        componentLoader,
        pluginLoader,
    }
}
