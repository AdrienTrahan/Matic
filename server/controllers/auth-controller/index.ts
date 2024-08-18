import { Router, Response } from "express";
import { validate } from "express-validation";
import { singleton } from "tsyringe";
import { AbstractController } from "..";
import { respondWithError, INVALID_CREDENTIALS } from "../../error";
import { AuthService } from "../../services/auth-service";
import { CheckRecoveryCodeQuerySchema, LoginQuerySchema, LogoutQuerySchema, RecoverQuerySchema, RefreshQuerySchema, ResetPasswordQuerySchema, SignupQuerySchema, TokenVerificationRequestSchema } from "../../validators/auth";

@singleton()
export class AuthController extends AbstractController{
    constructor(
        private authService: AuthService
    ){
        super("/auth")
    }
    protected configureRoutes(router: Router): void {
        router.post("/login", validate(LoginQuerySchema), async (req, res) => {
            try{
                let { email, password } = req.body;
                let id = await this.authService.login(email, password);
                let [ auth_token, refresh_token ] = await this.authService.generateTokenForUser(id);
                AuthController.setCookies(res, auth_token, refresh_token)
                res.send({success: 1});
            }catch(error){
                respondWithError(error, res)
            }
        });

        router.post("/signup", validate(SignupQuerySchema), async (req, res) => {
            try{
                let { firstname, lastname, email, password } = req.body;
                let id = await this.authService.signup(firstname, lastname, email, password);
                let [ auth_token, refresh_token ] = await this.authService.generateTokenForUser(id);
                AuthController.setCookies(res, auth_token, refresh_token)
                res.send({success: 1});
            }catch(error){
                respondWithError(error, res)
            }
        });
        
        router.post("/logout", (req, res, next) => {
            if (req.cookies.session) return next()
            AuthController.clearSessionCookies(res)
            res.redirect("/login")
        }, validate(TokenVerificationRequestSchema), validate(LogoutQuerySchema), async (req, res) => {
            try{
                let { token, userId } = JSON.parse(req.cookies.session);
                AuthController.clearSessionCookies(res)
                if (!(await this.authService.isTokenValid(token, userId))) throw INVALID_CREDENTIALS;
                await this.authService.logout(token, userId);
            }catch(error){}
            res.redirect("/login")
        });

        router.get("/recover", validate(RecoverQuerySchema), async (req, res) => {
            try{
                let { email } = req.query;
                await this.authService.recover(email as string);
                res.send({success: 1});
            }catch(error){
                respondWithError(error, res);
            }
        });

        router.get("/check-recovery-code", validate(CheckRecoveryCodeQuerySchema), async (req, res) => {
            try{
                let { email, recovery } = req.query as any;
                await this.authService.checkRecoveryCode(email, recovery);
                res.send({success: 1});
            }catch(error){
                respondWithError(error, res);
            }
        });

        router.post("/reset-password", validate(ResetPasswordQuerySchema), async (req, res) => {
            try{
                let { email, password, recovery } = req.body;
                let id = await this.authService.resetPassword(email, password, recovery);
                let [ auth_token, refresh_token ] = await this.authService.generateTokenForUser(id);
                AuthController.setCookies(res, auth_token, refresh_token)
                res.send({success: 1});
            }catch(error){
                respondWithError(error, res)
            }
        });

        router.post("/refresh", async (req, res) => {
            try{
                let { token, userId } = JSON.parse(req.cookies.session);
                let refresh = `${req.cookies.refresh}`;
                await this.authService.refresh(token, userId, refresh);
                let [ auth_token, refresh_token ] = await this.authService.generateTokenForUser(userId);
                AuthController.setCookies(res, auth_token, refresh_token)
                res.send({success: 1});
            }catch(error){
                respondWithError(error, res);
            }
        });
    }

    static setCookies(res: Response, token: any, refresh : any){
        const sameSite = process.env.DEVMODE ? "none" : "strict";
        res.cookie('session', JSON.stringify(token), { maxAge: 4 * 60 * 60 * 1000, sameSite, secure: true, httpOnly: true });
        res.cookie('refresh', `${refresh}`, { maxAge: 31 * 24 * 60 * 60 * 1000, sameSite, httpOnly: true, secure: true, path: "/api/auth/refresh"})
    }

    static clearSessionCookies(res: Response){
        const sameSite = process.env.DEVMODE ? "none" : "strict";
        res.clearCookie('session', { sameSite, secure: true, httpOnly: true });
        res.clearCookie('refresh', { sameSite, httpOnly: true, secure: true, path: "/api/auth/refresh"})
    }
    
}