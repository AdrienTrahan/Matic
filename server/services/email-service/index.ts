/** @format */

import nodemailer from "nodemailer"
import "dotenv/config"
import fs from "fs"
import { UNEXPECTED_ERROR_OCCURED } from "../../error"
import { singleton } from "tsyringe"
import * as EmailTemplatesJSON from "./emails.json"
const emailTemplates: any = EmailTemplatesJSON

@singleton()
export class EmailService {
    private transporter: nodemailer.Transporter | undefined
    constructor() {
        this.init()
    }
    async sendEmail(messageType: string, email: string, data: Array<string>) {
        return this.transporter ? this.sendEmailWithGmail(messageType, email, data) : undefined
    }
    private async sendEmailWithGmail(messageType: string, email: string, data: Array<string>) {
        var message = {
            from: `${process.env.EMAIL_USERNAME} <${process.env.EMAIL_ADDRESS}>`,
            to: email,
            subject: this.injectDataInFile(data, emailTemplates[messageType].title),
            text: this.injectDataInFile(data, this.getFile(false, messageType)),
            html: this.injectDataInFile(data, this.getFile(true, messageType)),
        }
        return new Promise((resolve, reject) => {
            this.transporter!.sendMail(message, (error: any, info: any) => {
                if (error) {
                    reject(UNEXPECTED_ERROR_OCCURED)
                } else {
                    resolve({ success: 1 })
                }
            })
        })
    }

    private init() {
        this.transporter = this.hasRequireEnvironnementVariables()
            ? nodemailer.createTransport({
                  service: "gmail",
                  auth: {
                      user: process.env.EMAIL_ADDRESS,
                      pass: process.env.EMAIL_APP_PASSWORD,
                  },
              })
            : undefined
    }

    private hasRequireEnvironnementVariables() {
        return (
            process.env.EMAIL_ADDRESS != undefined &&
            process.env.EMAIL_APP_PASSWORD != undefined &&
            process.env.EMAIL_USERNAME != undefined
        )
    }

    private getFile(html: boolean, messageType: string) {
        if (html) {
            return fs.readFileSync(
                `./server/services/email-service/templates/compiled/${emailTemplates[messageType].path}.html`,
                "utf-8"
            )
        } else {
            return fs.readFileSync(
                `./server/services/email-service/templates/plaintext/${emailTemplates[messageType].path}.txt`,
                "utf-8"
            )
        }
    }
    private injectDataInFile(data: Array<string>, file: string) {
        let regex = /\$(\d+)/g
        let injectedFile = file.replace(regex, (match, p1) => {
            let index = parseInt(p1) - 1 // Convert captured group to array index
            return data[index] || match // Use array value if it exists, else keep the match
        })
        return injectedFile
    }
}
