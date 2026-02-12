import { Injectable } from '@nestjs/common';
import { Prisma, PropertyType } from '@prisma/client';
import {
  connectId,
  createAttachments
} from 'prisma/prisma.util';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { bad } from 'src/utils/error';
import { makeFullText, searchQuery } from 'src/utils/filter';
import { userEntity } from '../auth/auth.types';
import { createRoomDto, listRoomQuery, updateRoomDto } from './room.type';

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async createRoom(dto: createRoomDto, user: userEntity) {
    const { attachments, ...rest } = dto;

    // find the hotel exist
    const property = await this.prisma.property.findFirst({
      where: {
        hostId: user.id,
        
      },
    });
      
    
    
    if (!property || property.hostId !== user.id) {
    bad('Property not found or you are not the owner');
  }
 
    if (property.type !== PropertyType.HOTEL) {
      bad('Rooms can only be created for property  type of HOTEL');
    }
    // create the room
    const fullText = makeFullText(
      rest,
      {},
      'description',
      'roomNumber',
      'category',
    );
   
    await this.prisma.room.create({
      data: {
        ...rest,
        fullText,
        property: connectId(property.id),
        attachments: createAttachments(attachments),
      },
    });

    return { message: 'room created successfully' };
  }


  async list(query: listRoomQuery) {
    let where: Prisma.RoomWhereInput = {};
    const search = searchQuery(query.search ?? '');
    const take = +query.count || 10;
    const page = query.page || 1;
    const skip = take * (page - 1);
    const orderBy = { createdAt: 'desc' } as const;
    where.propertyId = { equals: query.propertyId };

    const [list, totalCount, activeCount, inactiveCount] = await Promise.all([
      this.prisma.room.findMany({
        where: {
          ...where,
          fullText: search ? { search } : undefined,
        },
        skip,
        take,
        orderBy,
        include: {
          attachments: {
            select: {
              uploads: true,
            },
          },
        },
      }),
      this.prisma.room.count({ where }),
      this.prisma.room.count({
        where: {
          ...where,
          isAvailable: true,
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

    console.log("list",list)
    return {
      list,
      pagination,
    };
  }

  async findHotelByUser(hotelId: string, user: userEntity) {
    const hotel = await this.prisma.property.findFirst({
      where: {
        id: hotelId,
        hostId: user.id,
      },
    });
    return hotel;
  }
  // find  hotels associated with user
  async getRooms(propertyId: string, user: userEntity) {
    //  find if the hotel exist
    const property = await this.findHotelByUser(propertyId, user);
    if (!property) bad('hotel not found ');

    const rooms = await this.prisma.room.findMany({
      where: { propertyId: property.id },
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
  async updateRoom(dto: updateRoomDto, user: userEntity, roomId: string) {
    const { attachments, ...rest } = dto;
    console.log('images to be updated', attachments);
    // check if room exist

    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        attachments: {
          select: {
            uploads: true,
          },
        },
      },
    });

    if (!room) {
      throw new Error('Hotel not found');
    }

    const existingImages = room.attachments.uploads.map((img: any) => img.url);
    console.log('attachment image to be updated', existingImages);

    //  determine which image to delete
    const urlToDelete = existingImages.filter(
      (url) => !dto.attachments?.includes(url),
    );
    const urlToCreate = dto.attachments?.filter(
      (url) => !existingImages.includes(url),
    );

    const updatedRoom = await this.prisma.$transaction(async (tx) => {
      // delete remove upload
      if (urlToDelete.length) {
        await tx.upload.deleteMany({
          where: {
            url: { in: urlToDelete },
          },
        });
      }
      // update the room info

      await tx.room.update({
        where: {
          id: room.id,
        },
        data: {
          ...rest,
          attachments: {
            update: {
              uploads: {
                create: urlToCreate?.map((url, idx) => ({
                  url,
                  name: 'upload',
                  type: 'image/jpeg',
                  publicId: url,
                  size: 1,
                  order: existingImages.length + idx + 1,
                  user: { connect: { id: user.id } },
                })),
              },
            },
          },
        },
      });
    });
    console.log('updated be room', updatedRoom);
    return {
      message: 'room updated successfully',
      updatedRoom,
    };
  }

  async deleteRoom(roomId: string) {
    const room = await this.prisma.room.findFirst({
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
