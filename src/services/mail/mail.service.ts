import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(
      this.configService.get<string>('RESEND_API_KEY'),
    );
  }

 
   
 async sendMail<T extends Record<string, any>>(
  to: string,
  subject: string,
  Template: React.ComponentType<T>, 
  props: T                          
) {
//   const html = renderToStaticMarkup(<Template {...props} />);
  const html = renderToStaticMarkup(React.createElement(Template, props));

  
  await this.resend.emails.send({
    from: 
    // this.configService.get<string>('RESEND_FROM_EMAIL')
    //  ||
      'onboarding@resend.dev',
    to,
    subject,
    html,
    
  });
}

}
