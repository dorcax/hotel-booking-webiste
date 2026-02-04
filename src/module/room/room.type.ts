import { RoomCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsString, IsUUID } from 'class-validator';
import { PaginationqueryDto } from 'src/utils/paginationQuery.type';

export class listRoomQuery extends PaginationqueryDto {
  @IsUUID('4')
  propertyId: string;
}

export class createRoomDto {
  @IsString()
  title: string;
  @IsString()
  description: string;
  @Type(() => Number)
  @IsNumber()
  price: number;
  @IsArray()
  amenities: string[];
  @Type(() => Number)
  @IsNumber()
  floor: number;
  @Type(() => Number)
  @IsNumber()
  capacity: number;
  @IsEnum(RoomCategory)
  category: RoomCategory;
  @IsArray()
  attachments: string[];
}

export class updateRoomDto  extends createRoomDto{


}
