import express from "express";

export const REQUEST_BADLY_FORMATTED = {reason: "Request is badly formatted", id: 1, code: "REQUEST BADLY FORMATTED"}
export const UNEXPECTED_ERROR_OCCURED = {reason: "An unexpected error occured", id: 2, code: "UNEXPECTED ERROR OCCURED"}
export const EMAIL_ALREADY_IN_USE = {reason: "The provided email is already in use", id: 3, code: "EMAIL ALREADY IN USE"}
export const NO_USER_FOUND = {reason: "No user was found with this email and password", id: 4, code: "NO USER FOUND"}
export const INVALID_CREDENTIALS = {reason: "Invalid credentials", id: 5, code: "INVALID_CREDENTIALS"}
export const UNAUTHORIZED = {reason: "Request not authorized", id: 6, code: "UNAUTHORIZED"}
export const INSUFFICIENT_PERMISSIONS = {reason: "You don't have sufficient permissions to execute the following action", id: 7, code: "INSUFFICIENT PERMISSIONS"}
export const INVALID_EMAIL_FORMAT = {reason: "The supplied email is not a valid email address", id: 8, code: "INVALID EMAIL FORMAT"}
export const INVALID_PASSWORD_FORMAT = {reason: "Password must be at least 6  characters long, include an uppercase letter, a lowercase letter and a number", id: 9, code: "INVALID PASSWORD FORMAT"}
export const INVALID_RECOVERY_CODE = {reason: "Provided recovery code is either invalid or expired", id: 10, code: "INVALID RECOVERY CODE"}
export const NO_USER_EMAIL = {reason: "Could not find a user with matching email", id: 11, code: "NO USER WITH EMAIL"}

export function respondWithError(error: any, res: express.Response){
    if (error.reason == undefined || error.id == undefined || error.code == undefined){
        error = UNEXPECTED_ERROR_OCCURED;
    }
    res.status(500).json(error)
}

export function databaseError(error: any){
    if (error.message.startsWith("CUSTOM:")){
        let errorCode = error.message.replace("CUSTOM:", "");
        throw module.exports[errorCode] ?? UNEXPECTED_ERROR_OCCURED;
    }
    throw UNEXPECTED_ERROR_OCCURED;
}