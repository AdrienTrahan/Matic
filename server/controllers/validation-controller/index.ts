/** @format */

import { NextFunction, Request, Response, Router } from "express"
import { ValidationError } from "express-validation"
import { singleton } from "tsyringe"
import { ErrorHandlerController } from ".."
import {
    INVALID_EMAIL_FORMAT,
    INVALID_PASSWORD_FORMAT,
    REQUEST_BADLY_FORMATTED,
    INVALID_CREDENTIALS,
    respondWithError,
} from "../../error"

@singleton()
export class ValidationController extends ErrorHandlerController {
    protected configureRoutes(router: Router) {
        router.use((error: any, req: Request, res: Response, next: NextFunction) => {
            try {
                if (error instanceof ValidationError) {
                    //cookies
                    if (error?.details?.cookies?.length != undefined && error?.details?.cookies?.length > 0) {
                        for (var errorMessage of error?.details?.cookies as Array<any>) {
                            if (errorMessage.context?.key === "session") {
                                throw INVALID_CREDENTIALS
                            } else if (errorMessage.context?.key === "refresh") {
                                throw INVALID_CREDENTIALS
                            }
                        }
                        // body
                    } else if (error?.details?.body?.length != undefined && error?.details?.body?.length > 0) {
                        for (var errorMessage of error?.details?.body as Array<any>) {
                            if (errorMessage.context?.key === "email") {
                                throw INVALID_EMAIL_FORMAT
                            } else if (errorMessage.context?.key === "password") {
                                throw INVALID_PASSWORD_FORMAT
                            }
                        }
                        // query
                    } else if (error?.details?.query?.length != undefined && error?.details?.query?.length > 0) {
                        for (var errorMessage of error?.details?.query as Array<any>) {
                            if (errorMessage.context?.key === "email") {
                                throw INVALID_EMAIL_FORMAT
                            } else if (errorMessage.context?.key === "password") {
                                throw INVALID_PASSWORD_FORMAT
                            }
                        }
                    }
                    throw REQUEST_BADLY_FORMATTED
                }
                next(error)
            } catch (error) {
                respondWithError(error, res)
            }
        })
    }
}
