/** @format */

import { goto } from "$app/navigation"
import { formUrlEncode, safeFetch } from "./networking"

class User {
    constructor() {}

    async signup(data) {
        return await safeFetch("/auth/signup", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
            body: formUrlEncode(data),
        })
    }

    async login(data) {
        return await safeFetch("/auth/login", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
            body: formUrlEncode(data),
        })
    }

    async recoverAccount(data) {
        return await safeFetch("/auth/recover?" + new URLSearchParams(data).toString(), { credentials: "include" })
    }

    async checkRecoveryCode(data) {
        return await safeFetch("/auth/check-recovery-code?" + new URLSearchParams(data).toString(), {
            credentials: "include",
        })
    }

    async resetPassword(data) {
        return await safeFetch("/auth/reset-password", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
            body: formUrlEncode(data),
        })
    }

    async logout() {
        await safeFetch("/auth/logout", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
        })
        goto("/login")
    }
}

export const user = new User()
