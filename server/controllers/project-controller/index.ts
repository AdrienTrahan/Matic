/** @format */

import { singleton } from "tsyringe"
import { AbstractController } from ".."
import { AuthService } from "../../services/auth-service"
import { validate } from "express-validation"
import { Router } from "express"
import { respondWithError, UNEXPECTED_ERROR_OCCURED } from "../../error"
import { ProjectService } from "../../services/project-service"
import { TokenVerificationRequestSchema } from "../../validators/auth"
import {
    CreateComponentProjectQuerySchema,
    CreateProjectQuerySchema,
    GetProjectQuerySchema,
    ListProjectQuerySchema,
    UpdateNameProjectQuerySchema,
} from "../../validators/project"

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
                    const projectId = req.query.id as string
                    let project = await this.projectService.getProject(projectId, userId)
                    res.json(project)
                } catch (error) {
                    respondWithError(error, res)
                }
            }
        )

        router.get(
            "/list",
            validate(TokenVerificationRequestSchema),
            this.authService.verifyToken.bind(this.authService),
            validate(ListProjectQuerySchema),
            async (req, res) => {
                try {
                    const { userId } = JSON.parse(req.cookies.session)
                    let projects = await this.projectService.listProjects(userId)
                    res.json(projects)
                } catch (error) {
                    respondWithError(error, res)
                }
            }
        )

        router.post(
            "/update-name",
            validate(TokenVerificationRequestSchema),
            this.authService.verifyToken.bind(this.authService),
            validate(UpdateNameProjectQuerySchema),
            async (req, res) => {
                try {
                    await this.projectService.updateName(req.body.name, req.body.id)
                    res.json({ success: 1 })
                } catch (error) {
                    respondWithError(error, res)
                }
            }
        )

        router.post(
            "/create-component",
            validate(TokenVerificationRequestSchema),
            this.authService.verifyToken.bind(this.authService),
            validate(CreateComponentProjectQuerySchema),
            async (req, res) => {
                try {
                    const [id, error] = await this.projectService.createComponent(req.body.name, req.body.projectId)
                    if (error) throw UNEXPECTED_ERROR_OCCURED
                    res.json({ id })
                } catch (error) {
                    respondWithError(error, res)
                }
            }
        )
    }
}
