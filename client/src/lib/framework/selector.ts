/** @format */
import type { NullValue } from "@rollup/browser"
import { get, writable, type Writable } from "svelte/store"
import uniqid from "uniqid"

export const hoveredElement: Writable<{
    viewIndex: number
    uniqueId: number
} | null> = writable(null)

export const hitboxesMap: Writable<
    {
        [key: string]: DOMRect[]
    }[]
> = writable([])

export function resetHitboxes(viewCount: number) {
    hitboxesMap.set(new Array(viewCount).fill(0).map(() => ({})))
}

export function updateHitboxes(viewIndex: number, id: string, hitboxes: DOMRect[]) {
    hitboxesMap.update(obj => {
        obj[viewIndex][id] = hitboxes
        return obj
    })
}

export function updateHoverState(tree: any, viewIndex: number, x: number, y: number) {
    const element = getElementAt(tree, viewIndex, x, y)
    if (get(hoveredElement)?.uniqueId != element?.unique || get(hoveredElement)?.viewIndex != viewIndex) {
        hoveredElement.set(
            element
                ? {
                      uniqueId: element.unique,
                      viewIndex,
                  }
                : null
        )
    }
}

function getElementAt(tree: any, viewIndex: number, x: number, y: number): any {
    if (x < 0 || y < 0 || viewIndex < 0) return null
    let pathLength = 0
    let selectedElement = null

    function travelBranches(subtree: any, lastElement: any = null, currentPathLength = pathLength) {
        for (var i = 0; i < subtree.length; i++) {
            for (var j = 0; j < subtree[i].length; j++) {
                const hitboxes = get(hitboxesMap)[viewIndex][subtree[i][j].unique] ?? []

                if (!coordinatesMatchesHitboxes(hitboxes, x, y)) continue

                if (currentPathLength >= pathLength) {
                    pathLength = currentPathLength
                    selectedElement = subtree[i][j]
                }

                travelBranches(subtree[i][j].children, subtree[i][j], currentPathLength + 2)
            }
        }
    }
    travelBranches(tree)
    return selectedElement
}

function coordinatesMatchesHitboxes(hitboxes: DOMRect[], x: number, y: number) {
    for (const hitbox of hitboxes) {
        if (hitbox.left < x && hitbox.top < y && x < hitbox.right && y < hitbox.bottom) return true
    }
}

export function injectUniqueId(data: any) {
    if (!data.tree) return data
    const inject = object => {
        for (var i = 0; i < object?.length; i++) {
            for (var j = 0; j < object[i]?.length; j++) {
                if (typeof object[i][j] == "object") {
                    object[i][j].unique = uniqid()
                    if (Array.isArray(object[i][j].children)) inject(object[i][j].children)
                }
            }
        }
    }

    inject(data.tree)

    return data
}

export function deselectCurrentHover() {
    hoveredElement.set(null)
}
