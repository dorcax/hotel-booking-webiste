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

  // CREATE PROPERTY
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
      attachments: dto.attachments ? createAttachments(dto.attachments) : undefined,
      amenities: dto.amenities,
      features: dto.features,
      host: connectId(existingUser.id),
      price: dto.price,
      capacity: dto.capacity,
    };

    const property = await this.prisma.property.create({ data: propertyData });
    return { message: 'Property created successfully', property };
  }

  // VERIFY PROPERTY
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

  // GET ALL VERIFIED PROPERTIES
  async findAll() {
    return this.prisma.property.findMany({
      where: { isVerified: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // GET PROPERTIES OF A HOST
  async findHostProperty(user: userEntity) {
    return this.prisma.property.findMany({ where: { hostId: user.id } });
  }

  // GET SINGLE PROPERTY
  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) bad('Property not found');
    return property;
  }

  // UPDATE PROPERTY
 async update(id: string, dto: UpdatePropertyDto) {
  const { rule, attachments, ...rest } = dto;

  // Find existing property
  const property = await this.prisma.property.findUnique({
    where: { id },
    include: { attachments: true }, // one-to-one
  });

  if (!property) bad('Property not found');
  if (property.isVerified) bad('You cannot edit a verified property');

  await this.prisma.$transaction(async (tx) => {
    // 1️⃣ Update main fields
    await tx.property.update({
      where: { id: property.id },
      data: {
        ...rest,
        rule: rule ? connectId(rule) : undefined,
      },
    });

    // 2️⃣ Handle one-to-one attachment
    if (attachments && attachments.length > 0) {
      const newAttachmentId = attachments[0]; // pick first

      // Delete old attachment if it exists and is different
      if (property.attachments && property.attachments.id !== newAttachmentId) {
        await tx.upload.delete({ where: { id: property.attachments.id } });
      }

      // Connect new attachment
      await tx.property.update({
        where: { id: property.id },
        data: {
          attachments: { connect: { id: newAttachmentId } },
        },
      });
    }
  });

  return { message: 'Property updated successfully' };
}


  // DELETE PROPERTY
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
