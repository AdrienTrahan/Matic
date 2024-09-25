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
                    id: "IH_0",
                    name: "Frame",
                    children: [
                        [
                            {
                                id: "IH_0",
                                name: "Frame",
                                children: [],
                            },
                        ],
                    ],
                },
            ],
        ],
        plugins: ["BH_0", "BH_1", "BH_2"],
        breakpoints: [750],
        boxes: [
            {
                x: 0,
                y: 100,
                w: 700,
            },
            {
                x: 750,
                y: 0,
                w: 500,
            },
        ],
        slots: ["children"],
    }
}
