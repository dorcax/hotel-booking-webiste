import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { bad } from 'src/utils/error';

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async handleWebhook(req, res) {
    try {
      const secret_hash = process.env.FLW_SECRET_HASH;
      const signature = req.headers['verif-hash'];
      if (!signature || signature !== secret_hash) bad('invalid webhook');

      // get information from the webhook data
      const event = req.body;
      // check if the event was successfull
      if (event.data.status !== 'successful') bad('payment not successfull');
      const txRef = event.data.tx_ref;

      // check for the transaction in db
      const transaction = await this.prisma.transaction.findFirst({
        where: {
          txRef,
        },
        include: {
          user: true,
          reservation: true,
        },
      });
      if (!transaction) bad('transaction not found ');
      //   check if the webhook have been processed before
      if (transaction.transactionStatus === 'SUCCESS')
        bad('transaction already processed');

      // update the trasanction status
      await this.prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            transactionStatus: 'SUCCESS',
          },
        });
        // update the room availability ,
        await tx.room.update({
          where: {
            id: transaction.roomId,
          },
          data: {
            isAvailable: false,
          },
        });

        // update the reservation status
        await tx.reservation.update({
          where: {
            //   id: transaction.reservationId,
            id: '123',
            userId: transaction.userId,
          },
          data: {
            status: 'CONFIRMED',
          },
        });
      });

      return;
    } catch (error) {
      console.error(' Webhook error:', error);
      return { message: 'Internal server error' };
    }
  }
}
