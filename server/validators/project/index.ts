/** @format */

import { Joi } from "express-validation"
import { PROJECT_NAME_REGEX } from "../../../shared/validation"

export const CreateProjectQuerySchema = {
    body: Joi.object({
        user_id: Joi.string().required(),
    }),
}

export const GetProjectQuerySchema = {
    body: Joi.object({
        user_id: Joi.string().required(),
    }),
    query: Joi.object({
        id: Joi.string().min(1),
    }),
}

export const ListProjectQuerySchema = {
    body: Joi.object({
        user_id: Joi.string().required(),
    }),
}

export const UpdateNameProjectQuerySchema = {
    body: Joi.object({
        user_id: Joi.string().required(),
        id: Joi.string().required().min(1),
        name: Joi.string().regex(PROJECT_NAME_REGEX).required(),
    }),
}
