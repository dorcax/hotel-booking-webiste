import { Injectable } from '@nestjs/common';
import { createHotelDto, updateHotelDto } from './hotel.type';
import { userEntity } from '../auth/auth.types';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { bad } from 'src/utils/error';
import {
  connectId,
  createAttachments,
  updateAttachments,
} from 'prisma/prisma.util';
import { HotObservable } from 'rxjs/internal/testing/HotObservable';

@Injectable()
export class HotelService {
  constructor(private readonly prisma: PrismaService) {}
  async createHotel(dto: createHotelDto, user: userEntity) {
    const { attachments, rule, ...rest } = dto;

    // find if user exist
    const currentUser = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!currentUser) bad('user does not exist');
    const hotel = await this.prisma.hotel.create({
      data: {
        ...rest,
        rule: connectId(rule),
        attachment: createAttachments(attachments),
        user: connectId(currentUser.id),
      },
    });
    return hotel;
  }

  // find  hotels associated with user
  async getHotels(user: userEntity) {
    const hotels = await this.prisma.hotel.findMany({
      where: {
        userId: user.id,
      },
    });
    if (!hotels.length) bad('no hotels found for this user ');

    return hotels;
  }

  // find each hotel
  async getHotel(user: userEntity, hotelId: string) {
    const hotel = await this.prisma.hotel.findUnique({
      where: {
        id: hotelId,
        userId: user.id,
      },
    });
    if (!hotel) bad('no hotel found for this user ');

    return hotel;
  }

  //   update hotel

  async updateHotel(dto: updateHotelDto, hotelId) {
    const { rule, attachments, ...rest } = dto;

    // find if hotel exist
    const hotel = await this.prisma.hotel.findUnique({
      where: {
        id: hotelId,
      },
    });
    if (!hotel) bad('hotel not found ');
    // update the hotel
    await this.prisma.$transaction(async (tx) => {
      await tx.hotel.update({
        where: {
          id: hotel.id,
        },
        data: {
          ...rest,
          rule: rule ? connectId(rule) : undefined,
          attachment: attachments.length
            ? updateAttachments(attachments)
            : undefined,
        },
      });
      // delete old upload
      if (attachments.length) {
        await this.prisma.upload.deleteMany({
          where: {
            id: { notIn: attachments },
            attachments: { some: { id: hotel.attachmentId } },
          },
        });
      }
    });
    return { message: 'hotel updated successfully ' };
  }

  // delete hotel

  async deleteHotel(hotelId: string, user: userEntity) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel || hotel.userId !== user.id) {
      bad('Hotel not found or you are not the owner');
    }

    await this.prisma.hotel.delete({
      where: { id: hotelId },
    });

    return { message: 'Hotel deleted successfully' };
  }
}
