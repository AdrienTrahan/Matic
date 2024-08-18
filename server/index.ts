/** @format */

import "reflect-metadata"
import "dotenv/config"
import { container } from "tsyringe"
import { Application } from "./app"

;(async () => {
    const application = container.resolve(Application)
    application.start()
})()
