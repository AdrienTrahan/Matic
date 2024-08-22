/** @format */

import { authFetch, formUrlEncode } from "./networking"

class Project {
    async createProject() {
        return await authFetch("/project/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
            body: formUrlEncode({}),
        })
    }

    async getProjects(fetch?) {
        return await authFetch("/project/get", {}, fetch)
    }

    async getPages() {}
}

export const project = new Project()
