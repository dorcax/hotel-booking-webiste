import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Verification_Mail } from './event.type';
import { MailService } from '../mail/mail.service';
import { OtpEmail } from '../mail/templates/verify-email';

@Injectable()
export class EventService {
constructor(private readonly mailService:MailService){}
    @OnEvent("verification_mail",{async:true})
        async SendUserVerificationMail(payload:Verification_Mail){
        await this.mailService.sendMail(payload.email,"verify your email",OtpEmail,  {                                     // props for the template
        name: payload.name,
        code: payload.code,
        year: new Date().getFullYear(),
      })

        }


    
}
