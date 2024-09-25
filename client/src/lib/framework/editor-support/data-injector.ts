/** @format */

export function getViewTypeSettingCode(viewType: string) {
    return `
        if (!window.Matic) window.Matic = {};
        window.Matic.viewType = "${viewType}";
    `
}

export function getIframeIndexSettingCode(index) {
    return `
        if (!window.Matic) window.Matic = {};
        window.Matic.iframeIndex = ${index};
    `
}
