/** @format */

export function parseCookies(cookieString = "") {
    const cookiesArray = cookieString.split("; ")

    const cookies: any = {}

    cookiesArray.forEach(cookie => {
        const [key, encodedValue] = cookie.split("=")
        const decodedValue = decodeURIComponent(encodedValue)
        try {
            cookies[key] = JSON.parse(decodedValue)
        } catch (e) {
            cookies[key] = decodedValue
        }
    })
    return cookies
}
