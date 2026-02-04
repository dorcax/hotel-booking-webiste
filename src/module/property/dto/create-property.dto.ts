import { PropertyType } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  @Length(6, 30)
  name: string;

  @IsString()
  @Length(40, 200)
  description: string;
  @IsString()
  @IsNotEmpty()
  address: string;
  @IsString()
  @IsNotEmpty()
  city: string;
  @IsString()
  @IsNotEmpty()
  country: string;
  @IsEnum(PropertyType)
  type: PropertyType;
  @IsArray()
  @IsString({ each: true })
  amenities: string[];

  @IsNumber()
  @Min(0, {
    message: 'price must not be less than 0',
  })
  @IsOptional()
  price?:number;
  @IsNumber()
  @Min(1, {
    message: 'price must not be atleast 1',
  })
  @IsOptional()
  capacity?: number;

  @IsArray()
  attachments: string[];

  
}
