/** @format */

import { browser } from "$app/environment"

export function extractNonce() {
    if (!browser) return
    const metaCsp = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
    if (metaCsp) {
        const cspContent = metaCsp.getAttribute("content")
        const nonceMatch = cspContent?.match(/'nonce-([^']+)'/)
        if (nonceMatch) return nonceMatch[1]
    }
}
