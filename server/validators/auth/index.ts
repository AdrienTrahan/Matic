/** @format */

import deepEmailValidator from "deep-email-validator"
import Joi from "joi"
import { PASSWORD_REGEX } from "../../../shared/validation"
const deepEmailValidation = async function (value: any, helpers: Joi.ExternalHelpers<any>) {
    let validationResult = await deepEmailValidator({
        email: value,
        sender: value,
        validateRegex: true,
        validateMx: true,
        validateTypo: true,
        validateDisposable: true,
        validateSMTP: false,
    }).catch(() => undefined)
    if (validationResult != undefined && validationResult.valid === true) {
        return
    }
    return helpers.error("email")
}

export const LoginQuerySchema = {
    body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(24).required(),
    }),
}

export const SignupQuerySchema = {
    body: Joi.object({
        firstname: Joi.string()
            .regex(/^[a-zA-ZÀ-ÖØ-öø-ÿ]{2,24}$/)
            .required(),
        lastname: Joi.string()
            .regex(/^[a-zA-ZÀ-ÖØ-öø-ÿ]{2,24}$/)
            .required(),
        email: Joi.string().email().external(deepEmailValidation).required(),
        password: Joi.string().regex(PASSWORD_REGEX).min(4).max(24).required(),
    }),
}

export const JoinQuerySchema = {
    body: Joi.object({
        firstname: Joi.string()
            .regex(/^[a-zA-ZÀ-ÖØ-öø-ÿ]{2,24}$/)
            .required(),
        lastname: Joi.string()
            .regex(/^[a-zA-ZÀ-ÖØ-öø-ÿ]{2,24}$/)
            .required(),
        email: Joi.string().email().external(deepEmailValidation).required(),
        password: Joi.string()
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{6,}$/)
            .min(4)
            .max(24)
            .required(),
        invite: Joi.string().length(64).required(),
    }),
}

export const LogoutQuerySchema = {
    body: Joi.object({}).unknown(true),
}

export const TokenVerificationRequestSchema = {
    body: Joi.object({
        user_id: Joi.custom((value, helpers) => (value !== undefined ? helpers.error("user_id") : value)),
    }).unknown(true),
    cookies: Joi.object({
        session: Joi.string()
            .required()
            .custom((value, helpers) => {
                try {
                    const parsedValue = JSON.parse(value)
                    if (typeof parsedValue === "object") {
                        if (typeof parsedValue.token === "string" && typeof parsedValue.userId === "string") {
                            return parsedValue
                        }
                    }
                    return helpers.error("any.invalid")
                } catch (error) {
                    return helpers.error("any.invalid")
                }
            }),
    }).unknown(true),
}

export const RecoverQuerySchema = {
    query: Joi.object({
        email: Joi.string().email().required(),
    }),
}

export const CheckRecoveryCodeQuerySchema = {
    query: Joi.object({
        email: Joi.string().email().required(),
        recovery: Joi.string().length(64).required(),
    }),
}

export const ResetPasswordQuerySchema = {
    body: Joi.object({
        email: Joi.string().email().required(),
        recovery: Joi.string().length(64).required(),
        password: Joi.string()
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{6,}$/)
            .min(4)
            .max(24)
            .required(),
    }),
}

export const RefreshQuerySchema = {
    cookies: Joi.object({
        session: Joi.string()
            .required()
            .custom((value, helpers) => {
                try {
                    const parsedValue = JSON.parse(value)
                    if (typeof parsedValue === "object") {
                        if (typeof parsedValue.token === "string" && typeof parsedValue.userId === "string") {
                            return parsedValue
                        }
                    }
                    return helpers.error("any.invalid")
                } catch (error) {
                    return helpers.error("any.invalid")
                }
            }),
        refresh: Joi.string().length(64).required(),
    }).unknown(true),
}
