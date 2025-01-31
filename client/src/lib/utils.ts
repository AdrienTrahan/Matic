/** @format */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { cubicOut } from "svelte/easing"
import type { TransitionConfig } from "svelte/transition"
import { slide } from "svelte/transition"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

type FlyAndScaleParams = {
    y?: number
    x?: number
    start?: number
    duration?: number
}

export const flyAndScale = (
    node: Element,
    params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
    const style = getComputedStyle(node)
    const transform = style.transform === "none" ? "" : style.transform

    const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
        const [minA, maxA] = scaleA
        const [minB, maxB] = scaleB

        const percentage = (valueA - minA) / (maxA - minA)
        const valueB = percentage * (maxB - minB) + minB

        return valueB
    }

    const styleToString = (style: Record<string, number | string | undefined>): string => {
        return Object.keys(style).reduce((str, key) => {
            if (style[key] === undefined) return str
            return str + `${key}:${style[key]};`
        }, "")
    }

    return {
        duration: params.duration ?? 200,
        delay: 0,
        css: t => {
            const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0])
            const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0])
            const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1])

            return styleToString({
                transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                opacity: t,
            })
        },
        easing: cubicOut,
    }
}

export function fadeSlide(node, options) {
    const slideTrans = slide(node, options)
    return {
        duration: options.duration,
        css: t => `
			${(slideTrans as any).css(t)}
			opacity: ${t};
		`,
    }
}

export function getRGBColor(color) {
    let d = document.createElement("div")
    d.style.color = color
    document.body.appendChild(d)
    return window.getComputedStyle(d).color
}

export function serializeObject(object, depth = 0, max_depth = 2) {
    if (depth > max_depth) return "Object"
    const obj = {}
    for (let key in object) {
        let value = object[key]
        if (value instanceof Node) value = { id: (value as any).id }
        else if (value instanceof Window) value = "Window"
        else if (value instanceof Object) value = serializeObject(value, depth + 1, max_depth)

        obj[key] = value
    }
    return obj
}

export function clearObjectProperties(object) {
    return Object.fromEntries(
        Object.entries(object).filter(
            ([key, value]: [string, any]) => typeof value !== "object" && typeof value !== "function"
        )
    )
}
