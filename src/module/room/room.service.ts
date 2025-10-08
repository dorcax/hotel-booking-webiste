import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { createRoomDto, listRoomQuery, updateRoomDto } from './room.type';
import {
  connectId,
  createAttachments,
  updateAttachments,
} from 'prisma/prisma.util';
import { userEntity } from '../auth/auth.types';
import { bad } from 'src/utils/error';
import { makeFullText, searchQuery } from 'src/utils/filter';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async createRoom(dto: createRoomDto) {
    const { attachments, hotelId, ...rest } = dto;

    // check if hotel exists
    const room = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!room) {
      throw new Error('Hotel not found');
    }
    // create the room
    const fullText = makeFullText(rest, 'description', 'name');
    await this.prisma.room.create({
      data: {
        ...rest,
        fullText,
        hotel: connectId(hotelId),
        attachment: createAttachments(attachments),
      },
    });

    return { message: 'room created successfully' };
  }

  // room search and pagination

  async list(query: listRoomQuery) {
    let where: Prisma.RoomWhereInput = {};
    if (query.search) {
      where.fullText = { search: query.search };
    }

    if (query.hotelId) {
      where.hotelId = { equals: query.hotelId };
    }
    const take = query.count || 10;
    const page = query.page || 1;
    const skip = take * (page - 1);

    const [rooms, totalCount] = await Promise.all([
      this.prisma.room.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          attachment: true,
        },
      }),
      this.prisma.room.count({ where }),
    ]);
    return {
      data: rooms,
      totalCount,
      totalPage: Math.ceil(totalCount / take),
    };
  }

  async findHotelByUser(hotelId: string, user: userEntity) {
    const hotel = await this.prisma.hotel.findFirst({
      where: {
        id: hotelId,
        userId: user.id,
      },
    });
    return hotel;
  }
  // find  hotels associated with user
  async getRooms(hotelId: string, user: userEntity) {
    //  find if the hotel exist
    const hotel = await this.findHotelByUser(hotelId,user)
    if (!hotel) bad('hotel not found ')

    const rooms = await this.prisma.room.findMany({
      where: { hotelId: hotel.id },
    });
    if (!rooms.length) bad('no rooms found  ');

    return rooms;
  }

  // find each hotel
  async getRoom(hotelId: string, roomId: string, user: userEntity) {
    const hotel = await this.findHotelByUser(hotelId,user)
    if (!hotel) bad('hotel not found ');
    const room = await this.prisma.room.findFirst({
      where: {
        id: roomId,
      },
    });
    if (!room) bad('no room found for this user ');

    return room;
  }

  //   update room
  async updateRoom(dto: updateRoomDto, roomId: string) {
    const { attachments, ...rest } = dto;
    // check if room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new Error('Hotel not found');
    }
    const fullText = makeFullText({ ...room, ...rest }, 'description', 'name');
    await this.prisma.$transaction(async (tx) => {
      await tx.room.update({
        where: {
          id: roomId,
        },
        data: {
          ...rest,
          attachment: attachments.length
            ? updateAttachments(attachments)
            : undefined,
        },
      });

      if (attachments.length) {
        await this.prisma.upload.deleteMany({
          where: {
            id: { notIn: attachments },
            attachments: { some: { id: room.attachmentId } },
          },
        });
      }
    });
    return { message: 'room updated successfully' };
  }

  async deleteRoom(roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      bad('room not found ');
    }

    await this.prisma.room.delete({
      where: { id: roomId },
    });

    return { message: 'room deleted successfully' };
  }
}
