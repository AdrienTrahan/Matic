/** @format */

import { ComponentTypes } from "../../../../shared/sharedb"

/** @format */
export function getDefaultComponentStructure(componentId: string) {
    return {
        id: componentId,
        type: ComponentTypes.TREE,
        children: [
            [
                {
                    id: "IH_1",
                    name: "Frame",
                    children: [[]],
                },
                {
                    id: "IH_0",
                    name: "Frame",
                    children: [[]],
                },
            ],
        ],
        plugins: ["BH_0", "BH_1"],
        breakpoints: [600],
        boxes: [
            {
                x: 0,
                y: 0,
                w: 700,
            },
            {
                x: 800,
                y: 0,
                w: 500,
            },
        ],
        slots: ["children"],
    }
}
