/** @format */

import { Joi } from "express-validation"

export const CreateProjectQuerySchema = {
    body: Joi.object({
        user_id: Joi.string().required(),
    }),
}

export const GetProjectQuerySchema = {
    body: Joi.object({
        user_id: Joi.string().required(),
    }),
}
