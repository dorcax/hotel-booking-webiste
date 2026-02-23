import { RoomCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { PaginationqueryDto } from 'src/utils/paginationQuery.type';

export class createRoomDto {
  @ApiProperty({ description: 'Room title', example: 'Deluxe Suite' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Room description', example: 'Spacious suite with ocean view' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Price per night', example: 150 })
  @Type(() => Number)
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Amenities available in the room', example: ['WiFi', 'TV'], type: [String] })
  @IsArray()
  amenities: string[];




  
  @ApiProperty({ description: 'Maximum occupancy of the room', example: 4 })
  @Type(() => Number)
  @IsNumber()
  capacity: number;

  @ApiProperty({ description: 'Category of the room', enum: RoomCategory })
  @IsEnum(RoomCategory)
  category: RoomCategory;

  @ApiProperty({ description: 'IDs of attachments/images for the room', type: [String] })
  @IsArray()
  attachments: string[];

  
  @IsString()
  propertyId:string

  
}



export class updateRoomDto extends PartialType(createRoomDto) {}




export class listRoomQuery extends PaginationqueryDto {
  @ApiPropertyOptional({
    description: 'Filter rooms by ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4')
  propertyId: string;
}
