import { Injectable } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { userEntity } from '../auth/auth.types';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { bad } from 'src/utils/error';
import { PropertyType } from '@prisma/client';
import { connectId, createAttachments } from 'prisma/prisma.util';
@Injectable()
export class PropertyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePropertyDto, user: userEntity) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });
    if (!existingUser) bad('User not found');

    if (dto.type === PropertyType.APARTMENT && (!dto.price || !dto.capacity)) {
      bad('Price and capacity required for apartments');
    }

    const propertyData: any = {
      name: dto.name,
      description: dto.description,
      email: dto.email,
      location: dto.location,
      address: dto.address,
      type: dto.type,
      phoneNumber: dto.phoneNumber,
      rule: dto.rule ? connectId(dto.rule) : undefined,
      attachments: dto.attachments
        ? createAttachments(dto.attachments)
        : undefined,
      amenities: dto.amenities,
      features: dto.features,
      host: connectId(existingUser.id),
      price: dto.price,
      capacity: dto.capacity,
    };

    const property = await this.prisma.property.create({ data: propertyData });
    return { message: 'Property created successfully', property };
  }

  async verifyProperty(propertyId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property) bad('Property not found');

    await this.prisma.property.update({
      where: { id: propertyId },
      data: { isVerified: true },
    });

    return { message: 'Property verified successfully' };
  }

  async findAll() {
    return this.prisma.property.findMany({
      where: { isVerified: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findHostProperty(user: userEntity) {
    return this.prisma.property.findMany({ where: { hostId: user.id } });
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) bad('Property not found');
    return property;
  }

  async update(id: string, dto: UpdatePropertyDto) {
    const { rule, attachments, ...rest } = dto;

    // Find existing property
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: { attachments: true },
    });

    if (!property) bad('Property not found');

    await this.prisma.$transaction(async (tx) => {
      // Update main fields
      await tx.property.update({
        where: { id: property.id },
        data: {
          ...rest,
          rule: rule ? connectId(rule) : undefined,
          attachments: attachments?.length
            ? createAttachments(attachments)
            : undefined,
        },
      });

      // Delete old attachments that are NOT in the new list

      if (property.attachments) {
        const oldAttachmentId = property.attachments.id;
        if (!attachments?.includes(oldAttachmentId)) {
          await this.prisma.upload.delete({
            where: { id: oldAttachmentId },
          });
        }
      }
    });

    return { message: 'Property updated successfully' };
  }

  async remove(propertyId: string, user: userEntity) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property || property.hostId !== user.id)
      bad('Property not found or you are not the owner');

    await this.prisma.property.delete({ where: { id: property.id } });
    return { message: 'Property deleted successfully' };
  }
}

// async updateHotel(dto: updateHotelDto, hotelId) {
//   const { rule, attachments, ...rest } = dto;

//   // find if hotel exist
//   const hotel = await this.prisma.hotel.findUnique({
//     where: {
//       id: hotelId,
//     },
//   });
//   if (!hotel) bad('hotel not found ');
//   // update the hotel
//   await this.prisma.$transaction(async (tx) => {
//     await tx.hotel.update({
//       where: {
//         id: hotel.id,
//       },
//       data: {
//         ...rest,
//         rule: rule ? connectId(rule) : undefined,
//         attachment: attachments.length
//           ? updateAttachments(attachments)
//           : undefined,
//       },
//     });
//     // delete old upload
//     if (attachments.length) {
//       await this.prisma.upload.deleteMany({
//         where: {
//           id: { notIn: attachments },
//           attachments: { some: { id: hotel.attachmentId } },
//         },
//       });
//     }
//   });
//   return { message: 'hotel updated successfully ' };
// }
