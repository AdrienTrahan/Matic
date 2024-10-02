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
        breakpoints: [],
        boxes: [
            {
                x: 0,
                y: 0,
                w: 700,
            },
        ],
        slots: ["children"],
    }
}
