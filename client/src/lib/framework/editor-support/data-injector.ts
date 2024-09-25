/** @format */

export function getPluginTypeSettingCode(pluginType: string) {
    return `
        if (!window.Matic) window.Matic = {};
        window.Matic.pluginType = "${pluginType}";
    `
}

export function getIframeIndexSettingCode(index) {
    return `
        if (!window.Matic) window.Matic = {};
        window.Matic.iframeIndex = ${index};
    `
}
