import { Controller, Post, Req, Res } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import type { Request, Response } from 'express';


@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}
 
  @Post()
async createWebhook(@Req() req:Request, @Res() res: Response) {
  await this.webhookService.handleWebhook(req, res);
  return res.status(200).json({ message: 'Webhook received successfully' });
}

}
