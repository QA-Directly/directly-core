import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(
    @Inject('NodemailerTransporter')
    private transporter: nodemailer.Transporter,
  ) {}

  async sendMail(mailOptions: nodemailer.SendMailOptions) {
    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Error sending email');
    }
  }

  async sendVerificationEmail(email: string, verificationLink: string) {
    const mailOptions = {
      to: email,
      subject: 'Verify Your Email',
      text: `Click the following link to verify your email: ${verificationLink}`,
    };
    return this.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(email: string, resetLink: string) {
    const mailOptions = {
      to: email,
      subject: 'Reset Your Password',
      text: `Click the following link to reset your password: ${resetLink}`,
    };
    return this.sendMail(mailOptions);
  }

  async sendResetPasswordConfirmationEmail(email: string) {
    const mailOptions = {
      to: email,
      subject: 'Password Reset Successful',
      text: 'Your password has been successfully reset.',
    };
    return this.sendMail(mailOptions);
  }
}
