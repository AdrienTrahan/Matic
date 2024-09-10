/** @format */

import { PUBLIC_API_URL } from "$env/static/public"
import { user } from "./auth"

export async function safeFetch(...args: any[]) {
    if (!args[0].startsWith("http://") && !args[0].startsWith("https://")) args[0] = PUBLIC_API_URL + args[0]
    return await (args[2] ?? (fetch as any))(...args)
        .then(async data => {
            const contentType = data.headers.get("Content-Type")
            const isJSON = contentType && contentType.includes("application/json")
            if (data.ok) {
                return (isJSON ? data.json() : data.text()).then(data => [data, null]).catch(error => [null, error])
            } else {
                return (isJSON ? data.json() : data.text()).then(data => [null, data]).catch(error => [null, error])
            }
        })
        .catch(error => {
            return [null, error]
        })
}

export async function authFetch(...args: any[]) {
    args[1] = args[1] ?? {}
    args[1]["credentials"] = "include"
    let result = await safeFetch(...args)
    if (result[1]?.id != 5) return result

    const [refreshResult, refreshError] = await safeFetch("/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
    })
    if (refreshError || !refreshResult.success) {
        await user.logout()
        return result
    }
    return await safeFetch(...args)
}

export function formUrlEncode(object: any) {
    var formBody: any = []
    for (var property in object) {
        var encodedKey = encodeURIComponent(property)
        var encodedValue = encodeURIComponent(object[property])
        formBody.push(encodedKey + "=" + encodedValue)
    }
    return formBody.join("&")
}
