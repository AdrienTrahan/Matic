/** @format */

import { Router } from "express"
import { validate } from "express-validation"
import { singleton } from "tsyringe"
import { AbstractController } from ".."
import { AuthService } from "../../services/auth-service"
import { ProjectService } from "../../services/project-service"
import { TokenVerificationRequestSchema } from "../../validators/auth"
import { respondWithError } from "../../error"
import { PermissionService } from "../../services/permission-service"
import { ProjectPreviewRequestSchema } from "../../validators/project"

@singleton()
export class PreviewController extends AbstractController {
    constructor(
        private projectService: ProjectService,
        private authService: AuthService,
        private permissionService: PermissionService
    ) {
        super("/project")
    }
    protected configureRoutes(router: Router): void {
        router.use(
            "/:projectId/preview",
            validate(TokenVerificationRequestSchema),
            this.authService.verifyToken.bind(this.authService),
            validate(ProjectPreviewRequestSchema),
            this.permissionService.verifyPermission.bind(this.permissionService),
            async (req, res) => {
                try {
                    const { userId } = JSON.parse(req.cookies.session)
                    res.send(`${req.params.projectId} ${req.path}`)
                } catch (error) {
                    respondWithError(error, res)
                }
            }
        )
    }
}
