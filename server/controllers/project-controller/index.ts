/** @format */

import { singleton } from "tsyringe"
import { AbstractController } from ".."
import { AuthService } from "../../services/auth-service"
import { validate } from "express-validation"
import { Router } from "express"
import { respondWithError } from "../../error"
import { ProjectService } from "../../services/project-service"
import { TokenVerificationRequestSchema } from "../../validators/auth"
import { CreateProjectQuerySchema, GetProjectQuerySchema } from "../../validators/project"

@singleton()
export class ProjectController extends AbstractController {
    constructor(private projectService: ProjectService, private authService: AuthService) {
        super("/project")
    }
    protected configureRoutes(router: Router): void {
        router.post(
            "/create",
            validate(TokenVerificationRequestSchema),
            this.authService.verifyToken.bind(this.authService),
            validate(CreateProjectQuerySchema),
            async (req, res) => {
                try {
                    const { userId } = JSON.parse(req.cookies.session)
                    let projectId = await this.projectService.createProject(userId)
                    res.json({ id: projectId })
                } catch (error) {
                    respondWithError(error, res)
                }
            }
        )

        router.get(
            "/get",
            validate(TokenVerificationRequestSchema),
            this.authService.verifyToken.bind(this.authService),
            validate(GetProjectQuerySchema),
            async (req, res) => {
                try {
                    const { userId } = JSON.parse(req.cookies.session)
                    let projects = await this.projectService.getProjects(userId)
                    res.json(projects)
                } catch (error) {
                    respondWithError(error, res)
                }
            }
        )
    }
}
