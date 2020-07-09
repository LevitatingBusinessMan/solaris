const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

function getFakeTransport() {
    return {
        async sendMail(message) {
            console.log('-----');
            console.log(`SMTP DISABLED - Attempted to send email to [${message.to}] from [${message.from}]`);
            console.log(message.text);
            console.log(message.html);
            console.log('-----');
        }
    };
}

/*
    Emails will be sent via a local SMTP server using Postfix.
    See here: https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-postfix-as-a-send-only-smtp-server-on-ubuntu-14-04
*/

module.exports = class EmailService {

    TEMPLATES = {
        WELCOME: 'welcomeEmail.html'
    }

    constructor(config) {
        this.config = config;
    }

    _getTransport() {
        // If emails are disabled, return a fake transport which
        //outputs the message to the console.
        if (this.config.smtp.enabled) {
            return nodemailer.createTransport({
                host: this.config.smtp.host,
                port: this.config.smtp.port,
                tls: {
                      rejectUnauthorized: false
                }
            });
        } else {
            return getFakeTransport();
        }
    }

    async send(toEmail, subject, text) {
        const transport = this._getTransport();
        
        const message = {
            from: this.config.smtp.from,
            to: toEmail,
            subject,
            text
        };
        
        return await transport.sendMail(message);
    }

    async sendHtml(toEmail, subject, html) {
        const transport = this._getTransport();
        
        const message = {
            from: this.config.smtp.from,
            to: toEmail,
            subject,
            html
        };
        
        return await transport.sendMail(message);
    }

    async sendTemplate(toEmail, subject, templateKey, parameters) {
        parameters = parameters || [];

        const transport = this._getTransport();
        const filePath = path.join(__dirname, '../templates/', templateKey);
        const template = fs.readFileSync(filePath, { encoding: 'UTF8' });

        // Replace the parameters in the file
        for (let i = 0; i < parameters.length; i++) {
            let parameterString = `[{${i.toString()}}]`;

            template = template.replace(parameterString, parameters[i].toString());
        }
        
        const message = {
            from: this.config.smtp.from,
            to: toEmail,
            subject,
            html: template
        };
        
        return await transport.sendMail(message);
    }

};
