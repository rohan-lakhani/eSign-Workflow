import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private smtpConfig: any;

  constructor(private configService: ConfigService) {
    this.smtpConfig = this.configService.get('email.smtp');
    
    this.transporter = nodemailer.createTransport({
      host: this.smtpConfig.host,
      port: this.smtpConfig.port,
      secure: this.smtpConfig.secure,
      auth: this.smtpConfig.auth.user && this.smtpConfig.auth.pass ? {
        user: this.smtpConfig.auth.user,
        pass: this.smtpConfig.auth.pass,
      } : undefined,
    });
  }

  async sendSignatureRequest(
    toEmail: string,
    recipientName: string,
    documentName: string,
    signingUrl: string,
    roleNumber: number,
  ) {
    const fromEmail = this.configService.get<string>('email.from');
    
    const mailOptions = {
      from: fromEmail,
      to: toEmail,
      subject: `Signature Required: ${documentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Document Signature Request</h2>
          <p>Hello ${recipientName},</p>
          <p>You have been requested to sign the document: <strong>${documentName}</strong></p>
          <p>You are signing as <strong>Role ${roleNumber}</strong> in this workflow.</p>
          <div style="margin: 30px 0;">
            <a href="${signingUrl}" 
               style="background-color: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Sign Document
            </a>
          </div>
          <p>This link will expire in 7 days.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from eSign Workflow System. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    try {
      if (!this.smtpConfig.auth.user || !this.smtpConfig.auth.pass) {
        return { success: true, mock: true };
      }

      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendCompletionNotification(
    toEmail: string,
    documentName: string,
    downloadUrl: string,
  ) {
    const fromEmail = this.configService.get<string>('email.from');
    
    const mailOptions = {
      from: fromEmail,
      to: toEmail,
      subject: `Document Completed: ${documentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Document Signing Completed</h2>
          <p>The document <strong>${documentName}</strong> has been signed by all parties.</p>
          <div style="margin: 30px 0;">
            <a href="${downloadUrl}" 
               style="background-color: #2196F3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Download Document
            </a>
          </div>
          <p>Thank you for using eSign Workflow System.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from eSign Workflow System. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    try {
      if (!this.smtpConfig.auth.user || !this.smtpConfig.auth.pass) {
        return { success: true, mock: true };
      }

      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Failed to send completion email:', error);
      throw error;
    }
  }
} 