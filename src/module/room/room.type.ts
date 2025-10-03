import { RoomCategory } from '@prisma/client';
import { IsArray, IsEnum, IsNumber, IsString } from 'class-validator';

export class createRoomDto {
  @IsString()
  name: string;
  @IsString()
  description: string;
  @IsNumber()
  price: number;
  @IsString()
  number: string;
  @IsEnum(RoomCategory)
  category: RoomCategory;
  @IsString()
  hotelId: string;
  @IsArray()
  attachments:string[]
}
 export class updateRoomDto {
    @IsString()
  name: string;
  @IsString()
  description: string;
  @IsNumber()
  price: number;
  @IsString()
  number: string;
  @IsEnum(RoomCategory)
  category: RoomCategory;
  @IsArray()
  attachments:string[]
 }