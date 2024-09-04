/** @format */

import { Joi } from "express-validation"
import { COMPONENT_NAME_REGEX, PROJECT_NAME_REGEX } from "../../../shared/validation"

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
        id: Joi.string().min(1).required(),
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

export const ProjectPreviewRequestSchema = {
    params: Joi.object({
        projectId: Joi.string().min(1).required(),
    }),
    body: Joi.object({
        user_id: Joi.string().required(),
    }),
}

export const CreateComponentProjectQuerySchema = {
    body: Joi.object({
        user_id: Joi.string().required(),
        projectId: Joi.string().min(1).required(),
        name: Joi.string().regex(COMPONENT_NAME_REGEX).required(),
    }),
}
