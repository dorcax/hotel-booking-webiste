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

  async createRoom(dto: createRoomDto, user) {
    const { attachments, ...rest } = dto;

    // find the hotel exist
    const hotel = await this.prisma.hotel.findUnique({
      where: {
        userId: user.sub,
      },
    });

    console.log("user",user)
    if (!hotel) bad("hotel does not exist")
    // create the room
    const fullText = makeFullText(rest,{}, 'description', 'roomNumber',"category");
    // const fullText = makeFullText(room, updates, 'roomNumber', 'description', 'category')
    await this.prisma.room.create({
      data: {
        ...rest,
        fullText,
        hotel: connectId(hotel.id),
        attachment: createAttachments(attachments),
      },
    });

    return { message: 'room created successfully' };
  }

  // room search and pagination

  // async list(query: listRoomQuery) {
  //   let where: Prisma.RoomWhereInput = {};
  //   const searchList =query.search
    
  //   const search = searchQuery(searchList);
  //   // if (query.search) {
  //   //   where.fullText = { search: query.search };
  //   // }

  //   // if (query.hotelId) {
  //   //   where.hotelId = { equals: query.hotelId };
  //   // }
  //   const take = query.count || 10;
  //   const page = query.page || 1;
  //   const skip = take * (page - 1);

  //   const [rooms, totalCount] = await Promise.all([
  //     this.prisma.room.findMany({
  //       where,
  //       skip,
  //       take,
  //       fullText:search ?{search} :undefined,
  //       orderBy: { createdAt: 'desc' },
  //       include: {
  //         attachment:{
  //           select:{
  //             uploads:true
  //           }
  //         }
  //       },
  //     }),
  //     this.prisma.room.count({ where }),
  //   ]);
  //   return {
  //     data: rooms,
  //    pagination:{
  //      totalCount,
  //     totalPage: Math.ceil(totalCount / take),
  //    }
  //   };
  // }
    async list(query: listRoomQuery) {
    let where: Prisma.RoomWhereInput = {};
    const search = searchQuery(query.search ?? "");
    const take = +query.count || 10;
    const page = query.page || 1;
    const skip = take * (page - 1);
    const orderBy = { createdAt: 'desc' } as const;
    where.hotelId = { equals: query.hotelId };

    const [list, totalCount, activeCount, inactiveCount] = await Promise.all([
      this.prisma.room.findMany({
        where: {
          ...where,
          fullText: search ? { search } : undefined,
        },
        skip,
        take,
        orderBy,
        include:{
          attachment:{
            select:{
              uploads:true
            }
          }
        }
      
      }),
      this.prisma.room.count({ where }),
      this.prisma.room.count({
        where: {
          ...where,
          isAvailable : true,
          
        },
      }),
      this.prisma.room.count({
        where: {
          ...where,
          isAvailable: false,
        },
      }),
    ]);

    const totalPages = take ? Math.ceil(totalCount / take) : 1;

    const pagination = {
      page,
      totalCount,
      totalPages,
      filterCounts: {
        TOTAL: totalCount,
        ACTIVE: activeCount,
        INACTIVE: inactiveCount,
      },
    };

    return {
      list,
      pagination,
    };
  }
  

  async findHotelByUser(hotelId: string, user: userEntity) {
    const hotel = await this.prisma.hotel.findFirst({
      where: {
        id: hotelId,
        userId: user.sub,
      },
    });
    return hotel;
  }
  // find  hotels associated with user
  async getRooms(hotelId: string, user: userEntity) {
    //  find if the hotel exist
    const hotel = await this.findHotelByUser(hotelId, user);
    if (!hotel) bad('hotel not found ');

    const rooms = await this.prisma.room.findMany({
      where: { hotelId: hotel.id },
    });
    if (!rooms.length) bad('no rooms found  ');

    return rooms;
  }

  // find each hotel
  async getRoom(hotelId: string, roomId: string, user: userEntity) {
    const hotel = await this.findHotelByUser(hotelId, user);
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
    const room = await this.prisma.room.findFirst({
      where: { id: roomId
       },
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
