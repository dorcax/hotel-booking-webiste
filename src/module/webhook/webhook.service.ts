import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { bad } from 'src/utils/error';
import * as crypto from 'crypto';

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async handleWebhook(req, res) {
    try {
      const secret = process.env.FLW_SECRET_HASH ;

      if (!secret) {
        return res.status(200).send('Webhook secret not configured');
      }
      // verify the webhook signature
      const signature = req.headers['verif-hash'];
      const hash = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (!signature || signature !== hash)
        return res.status(200).send(' invalid signature');

      // get information from the webhook data
      const event = req.body;
      // check if the event was successfull
      if (event.data.status !== 'successful') bad('payment not successfull');
      const txRef = event.data.tx_ref;

      // check for the transaction in db
      const transaction = await this.prisma.transaction.findFirst({
        where: {
         reference: txRef,
        },
        include: {
          user: true,
          booking: true,
        },
      });
      if (!transaction) return res.status(200).send('transaction not found');
      //   check if the webhook have been processed before
      if (transaction.status === 'SUCCESS')
        bad('transaction already processed');
      // verify amount
      if (event.data.amount !== transaction.booking?.totalPrice)
        return res.status(200).send('incorrect amount paid');

      // update the trasanction status
      await this.prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            status: 'SUCCESS',
            flwRef:event.data.flw_ref
          },
        });
        // // update the room availability ,
        // await tx.room.update({
        //   where: {
        //     id: transaction.roomId,
        //   },
        //   data: {
        //     isAvailable: false,
        //   },
        // });

        // update the reservation status
        await tx.booking.update({
          where: {
            id: transaction.bookingId ?? undefined,
            // id: '123',
            guestId: transaction.userId,
          },
          data: {
            status: 'CONFIRMED',
          },
        });
      });

      return res.status(200).send('Webhook processed successfully');
    } catch (error) {
      console.error(' Webhook error:', error);
      return res.status(200).send('internal server error');
    }
  }
}
