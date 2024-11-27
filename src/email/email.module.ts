import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    EmailService,
    {
      provide: 'NodemailerTransporter',
      useFactory: (configService: ConfigService) => {
        return nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: configService.get<string>('EMAIL_USER'),
            pass: configService.get<string>('EMAIL_PASS'),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
