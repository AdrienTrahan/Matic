import { singleton } from "tsyringe";
import { DatabaseService } from "../database-service";
import express from "express";
import { EMAIL_ALREADY_IN_USE, INVALID_RECOVERY_CODE, NO_USER_EMAIL, NO_USER_FOUND, REQUEST_BADLY_FORMATTED, INVALID_CREDENTIALS, UNEXPECTED_ERROR_OCCURED, respondWithError } from "../../error";
import sha256 from "sha256";
import bcrypt from "bcrypt";
import { EmailService } from "../email-service";
import cron from "node-cron";

@singleton()
export class AuthService{
    saltRounds = 10;
    constructor(
        private databaseService: DatabaseService,
        private emailService: EmailService
        ){
        this.startTokenExpiryCron();
    }
    async login(email: string, password: string){
        email = email.toUpperCase();
        let loginRequest = await this.databaseService.call("auth", "login_user", [email]).catch((err) => {
            throw UNEXPECTED_ERROR_OCCURED
        });
        if (loginRequest.length == 0){
            throw NO_USER_FOUND
        }
        if (!bcrypt.compareSync(password, loginRequest[0]?.pwd)){
            throw NO_USER_FOUND
        }
        return loginRequest[0]?.id;
    }

    async signup(firstname: string, lastname: string, email: string, password: string){
        const salt = bcrypt.genSaltSync(this.saltRounds);
        let hashedPassword = bcrypt.hashSync(password, salt);
        [firstname, lastname, email] = [firstname, lastname, email].map(text => text.toUpperCase())
        let signupRequest = await this.databaseService.call("auth", "signup_user", [
            firstname,
            lastname,
            email,
            hashedPassword
        ]).catch((err) => {
            if (err.code === "23505" && err.message.includes("users_email_key")){
                throw EMAIL_ALREADY_IN_USE
            }
            throw UNEXPECTED_ERROR_OCCURED;
        })
        
        if (signupRequest[0]?.id === undefined){
            throw UNEXPECTED_ERROR_OCCURED
        }
        return signupRequest[0]?.id;
    }

    async logout(token: string, userId: string){
        await this.databaseService.call("auth", "logout_user", [token, userId]).catch((error) => {
            throw UNEXPECTED_ERROR_OCCURED
        });
    }

    async recover(email: string){
        email = email.toUpperCase();
        let recoveryCode = this.generateRecoveryCode(email);
        let recoverRequest = await this.databaseService.call("auth", "recover_password", [email, recoveryCode]).catch((err) => {
            throw UNEXPECTED_ERROR_OCCURED
        })
        if (recoverRequest.length == undefined || recoverRequest.length == 0 || recoverRequest[0].count == undefined){
            throw UNEXPECTED_ERROR_OCCURED
        }else if (recoverRequest[0].count == 0){
            throw NO_USER_EMAIL
        }
        await this.emailService.sendEmail('PASSWORD_RESET', email, [
            `${process.env.SERVER_SCHEMA}://${process.env.SERVER_HOST}/recover?recovery=${recoveryCode}&email=${email}`
        ])
    }

    async checkRecoveryCode(email: string, recovery: string){
        email = email.toUpperCase();
        let checkRequest = await this.databaseService.call("auth", "check_recovery", [email, recovery]).catch((err) => {
            throw UNEXPECTED_ERROR_OCCURED
        })
        if (checkRequest.length == undefined || checkRequest.length == 0 || checkRequest[0].count == undefined){
            throw UNEXPECTED_ERROR_OCCURED
        }else if (checkRequest[0].count == 0){
            throw INVALID_RECOVERY_CODE
        }
    }
    async resetPassword(email: string, password: string, recovery: string){

        email = email.toUpperCase();
        const salt = bcrypt.genSaltSync(this.saltRounds);
        
        let hashedPassword = bcrypt.hashSync(password, salt);
        let resetRequest = await this.databaseService.call("auth", "reset_password", [email, hashedPassword, recovery]).catch((err) => {
            throw UNEXPECTED_ERROR_OCCURED
        });
        if (resetRequest.length == undefined || resetRequest.length == 0 || resetRequest[0].count == undefined){
            throw UNEXPECTED_ERROR_OCCURED
        }else if (resetRequest[0].count == 0){
            throw INVALID_RECOVERY_CODE
        }else if (resetRequest[0].id == undefined){
            throw UNEXPECTED_ERROR_OCCURED
        }
        return resetRequest[0].id;
    }
    
    async refresh(token: string, userId: string, refresh: string){
        let refreshValidRequest = await this.databaseService.call("auth", "validate_refresh", [token, userId, refresh]).catch(error => {
            throw UNEXPECTED_ERROR_OCCURED;
        })
        if (refreshValidRequest.length == undefined || refreshValidRequest.length == 0 || refreshValidRequest[0].count == undefined){
            throw UNEXPECTED_ERROR_OCCURED
        }else if (refreshValidRequest[0].count == 0){
            throw INVALID_RECOVERY_CODE
        }
        return userId;
    }
    async generateTokenForUser(userId: string){
        let token = this.generateToken(userId);
        let refresh_token = this.generateRefreshToken(userId);
        await this.databaseService.call("auth", "create_token", [
            token,
            userId,
            refresh_token
        ]).catch((err) => {
            throw UNEXPECTED_ERROR_OCCURED
        });
        let cookie = {
            token: token,
            userId: `${userId}`
        }
        
        return [cookie,`${refresh_token}`]
    }

    async isTokenValid(token: string, userId: string){
        try{
            let expectedUserHash = this.generateUserHash(userId);
            let receivedUserHash = token.split("-")[1];
            if (receivedUserHash === expectedUserHash){
                let tokenSearchRequest = await this.databaseService.call("auth", "verify_token", [token]).catch((err) => {
                    throw false;
                })
                if (tokenSearchRequest.length > 0){
                    return true
                }
            }
            return false
        }catch{
            return false
        }
    }
    async verifyToken(req: express.Request, res: express.Response, next: express.NextFunction){
        try{
            let { token, userId } = JSON.parse(req.cookies.session);
            if (!(await this.isTokenValid(token, userId))){
                throw INVALID_CREDENTIALS;
            }
            req.body.user_id = userId;
            next();
        }catch (error: any){
            respondWithError(error, res);
        }
    }
    private generateRecoveryCode(email: string){
        return sha256(`${email}_${Math.random()}_recovery_code`);
    }
    private generateUserHash(userId: string){
        return sha256(`${userId}_userhash_id`);
    }
    private generateToken(userId: string){
        return `${sha256(`${userId}_${Math.random()}_token`)}-${this.generateUserHash(userId)}`;
    }
    private generateRefreshToken(userId: string){
        return `${sha256(`${userId}_${Math.random()}_token`)}`
    }
    private startTokenExpiryCron(){
        cron.schedule('0 * * * *', async () => {
            await this.databaseService.call("auth", "expire_token", []).catch(() => {
                console.error("failed to clean expired tokens");
            })
        });
    }
}