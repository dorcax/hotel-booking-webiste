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
    const { attachments,propertyId, ...rest  } = dto;

    // find the hotel exist
    const property = await this.prisma.property.findUnique({
      where: {
        id: propertyId,
        
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
      'title',
      'category',
    );
   
    await this.prisma.room.create({
      data: {
        ...rest,
        fullText,
        property: connectId(propertyId),
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
// Update room
async updateRoom(dto: updateRoomDto, user: userEntity, roomId: string) {
  const { attachments, ...rest } = dto;
  console.log('images to be updated', attachments);

  // Check if room exists
  const room = await this.prisma.room.findUnique({
    where: { id: roomId },
    include: {
      attachments: {
        include: {
          uploads: true, // Use 'include' instead of 'select' to get full upload objects
        },
      },
    },
  });

  if (!room) {
    throw new Error('Room not found'); // Fixed error message
  }

  // Get existing image URLs
  const existingImages = room.attachments?.uploads?.map((img: any) => img.url) || [];
  console.log('existing images', existingImages);

  // Determine which images to delete and create
  const urlsToDelete = existingImages.filter(
    (url) => !attachments?.includes(url),
  );
  
  const urlsToCreate = attachments?.filter(
    (url) => !existingImages.includes(url),
  ) || [];

  // Perform update in transaction
  const updatedRoom = await this.prisma.$transaction(async (tx) => {
    // Delete removed uploads
    if (urlsToDelete.length > 0) {
      await tx.upload.deleteMany({
        where: {
          url: { in: urlsToDelete },
          attachmentsId: room.attachments?.id, 
        },
      });
    }

    // Update room info and handle new attachments
    if (urlsToCreate.length > 0) {
      // Create new uploads
      await tx.upload.createMany({
        data: urlsToCreate.map((url, idx) => ({
          url,
          name: `upload-${Date.now()}-${idx}`,
          type: 'image/jpeg',
          publicId: url.split('/').pop() || url, // Better publicId extraction
          size: 0,
          order: (room.attachments?.uploads?.length || 0) + idx + 1,
          userId: user.id,
          roomAttachmentId: room.attachments?.id,
        })),
      });
    }

    // Update room basic info
    return tx.room.update({
      where: { id: roomId },
      data: {
        ...rest,
        // Only update the updatedAt timestamp if needed
        updatedAt: new Date(),
      },
      include: {
        attachments: {
          include: {
            uploads: true,
          },
        },
      },
    });
  });

  console.log('updated room', updatedRoom);
  
  return {
    message: 'Room updated successfully',
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
