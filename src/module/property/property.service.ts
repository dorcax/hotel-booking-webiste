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
      where: {
        id: user.id,
      },
    });

    if (!existingUser) bad('user not found');
    // create property

    const propertyData: any = {
      name: dto.name,
      description: dto.description,
      city: dto.city,
      country: dto.country,
      address:dto.address,
      type:dto.type,
      attachments: dto.attachments
        ? createAttachments(dto.attachments)
        : undefined,
      amenities: dto.amenities,
      host:connectId(existingUser.id)
    };
    if (dto.type === PropertyType.APARTMENT) {
      propertyData.price = dto.price;
      propertyData.capacity = dto.capacity;
    }
    const property = await this.prisma.property.create({
      data: propertyData,
    });

    // send an email notification to user 
    return {
      message: 'property created successfully',
      property: property,
    };
  }


  // verify a property (admin )

async  verifyProperty(propertyId:string){
    const property =await this.prisma.property.findUnique({
      where:{
        id:propertyId
      }
    })


    if(!property) bad("property not found ")

    // approve the property 

    const verify =await this.prisma.property.update({
      where:{
        id:propertyId
      },
      data:{
        isVerified:true
      }
    })

    return {
      message:"property verified successfully"
    }



  }



async findAll() {
  return await this.prisma.property.findMany({
    where:{
      isVerified:true
    }
  })
  }

  // find a single user property 

  async findHostProperty(user:userEntity){
    return await this.prisma.property.findUnique({
      where:{
        id:user.id
      }
    })

  }

  async findOne(id:string) {
    return await this.prisma.property.findUnique({
      where:{
        id
      }
    });
  }

  update(id: number, updatePropertyDto: UpdatePropertyDto) {
    return `This action updates a #${id} property`;
  }

  async remove(propertyId: string, user: userEntity) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property || property.hostId !== user.id) {
      bad('Hotel not found or you are not the owner');
    }

    await this.prisma.property.delete({
      where: { id: property.id},
    });

    return { message: 'property deleted successfully' };
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