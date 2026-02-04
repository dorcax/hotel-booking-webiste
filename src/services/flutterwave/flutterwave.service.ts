import { Injectable } from '@nestjs/common';
import {
  CreateFlutterwaveDto,
  FLUTTERWAVE_INITIATE_PAYMENT,
} from './dto/create-flutterwave.dto';
import { UpdateFlutterwaveDto } from './dto/update-flutterwave.dto';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { generateTransactionRef } from 'src/utils/ref.util';
import { connectId } from 'prisma/prisma.util';
import { userEntity } from 'src/module/auth/auth.types';

@Injectable()
export class FlutterwaveService {
  constructor(
    private readonly httpServices: HttpService,
    private readonly prisma: PrismaService,
  ) {}
  async initiatePayment(
    createFlutterwaveDto: CreateFlutterwaveDto,
    user: userEntity,
  ) {
    const { roomId, amount, currency, reservationId } = createFlutterwaveDto;
    const txRef = await generateTransactionRef();
    try {
      // create a transaction table to show record
      const transaction = await this.prisma.transaction.create({
        data: {
          amount,
          currency,
         reference: txRef,
          user: connectId(user.id),
          redirectUrl: 'http://localhost:3000/payment/success',
          room: connectId(roomId),
          booking: connectId(reservationId),
        },
      });
      // call flutter wave

      const response = await this.httpServices.axiosRef.post(
        FLUTTERWAVE_INITIATE_PAYMENT,
        {
          txRef,
          amount,
          currency,
          redirectUrl: process.env.FLW_REDIRECT_URL,
          customer: {
            email: user.email,
            
          },
          customizations: {
            title: 'Flutterwave Standard Payment',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const paymentData = response.data.data;
      await this.prisma.transaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          flwRef: paymentData.flw_ref,
        
        },
      });
      return {
        message: 'Payment initiated successfully',
        payment_link: paymentData.link,
      };
    } catch (error) {
      console.log(error);
    }
  }

  findAll() {
    return `This action returns all flutterwave`;
  }

  findOne(id: number) {
    return `This action returns a #${id} flutterwave`;
  }

  update(id: number, updateFlutterwaveDto: UpdateFlutterwaveDto) {
    return `This action updates a #${id} flutterwave`;
  }

  remove(id: number) {
    return `This action removes a #${id} flutterwave`;
  }
}
