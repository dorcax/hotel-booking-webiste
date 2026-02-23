import { Injectable } from '@nestjs/common';
import { CreatePropertyDto, listPropertyQuery } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { userEntity } from '../auth/auth.types';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { bad } from 'src/utils/error';
import { Prisma, PropertyType } from '@prisma/client';
import { connectId, createAttachments } from 'prisma/prisma.util';
import { makeFullText, searchQuery } from 'src/utils/filter';

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
      const fullText = makeFullText(
           dto,
           {},
           'description',
           'title',
           'price',
           "type"
         );
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
      fullText
    };

    const property = await this.prisma.property.create({ data: propertyData });
    return { message: 'Property created successfully', property };
  }

  // VERIFY PROPERTY by admin
  async verifyProperty(propertyId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property) bad('Property not found');
 
    if (property.isVerified) bad('the property have already been verified ');

    await this.prisma.property.update({
      where: { id: propertyId },
      data: { isVerified: true },
    });

    return { message: 'Property verified successfully' };
  }

  // GET ALL VERIFIED PROPERTIES by admin
  async findAll() {
    return this.prisma.property.findMany({
      where: { isVerified: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // GET PROPERTIES OF A HOST
  async findHostProperty(query:listPropertyQuery,user: userEntity) {
    
    const search =searchQuery(query.search ??"")
    const take=+query.count ||10
    const page =query.page ||1
    const skip =take*(page-1)
     const orderBy = { createdAt: 'desc' } as const;
     const [list, totalCount, apartmentCount,hotelCount] = await Promise.all([
      this.prisma.property.findMany({
        where: {
          hostId:user.id,
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
      this.prisma.property.count({ where:{hostId:user.id} }),
      this.prisma.property.count({
        where: {
          hostId:user.id,
          type:PropertyType.APARTMENT,
        },
      }),
      this.prisma.property.count({
        where: {
       hostId:user.id,
          type:PropertyType.HOTEL ,
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
        APARTMENT:apartmentCount,
        HOTEL: hotelCount,
      },
    };

    console.log("list",list)
    return {
      list,
      pagination,
    };
  
  }

  // GET SINGLE PROPERTY

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
      include: {
        attachments: { include: { uploads: true } }, // load existing uploads
      },
    });

    if (!property) bad('Property not found');

    if (property.isVerified) bad('You cannot edit a verified property');

    // property validation
    if (
      rest.type === PropertyType.APARTMENT &&
      (!rest.price || !rest.capacity)
    ) {
      bad('Price and capacity required for apartments');
    }
    if (rest.type === PropertyType.HOTEL && (rest.price || rest.capacity)) {
      bad('Hotels should not have price or capacity');
    }

    await this.prisma.$transaction(async (tx) => {
      // 1️⃣ Update main fields
      await tx.property.update({
        where: { id: property.id },
        data: {
          ...rest,
          rule: rule ? connectId(rule) : undefined,
        },
      });

      
      if (attachments && attachments.length > 0) {
        const newAttachmentId = attachments[0];

      
        if (
          property.attachments &&
          property.attachments.id !== newAttachmentId
        ) {
          for (const upload of property.attachments.uploads) {
            await tx.upload.delete({ where: { id: upload.id } });
          }
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
      include: {
        bookings: true,
      },
    });
    if (!property || property.hostId !== user.id)
      bad('Property not found or you are not the owner');
    // prevent deletion if they are active booking
    const activeBooking = await this.prisma.booking.findFirst({
      where: {
        propertyId,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });
    if (activeBooking)
      bad('you can not delete a property that have active booking');

    await this.prisma.property.delete({ where: { id: property.id } });
    return { message: 'Property deleted successfully' };
  }
}
