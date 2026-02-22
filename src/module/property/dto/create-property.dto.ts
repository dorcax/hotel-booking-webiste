import { PropertyType } from '@prisma/client';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationqueryDto } from 'src/utils/paginationQuery.type';

export class CreatePropertyDto {
  @ApiProperty({
    example: 'Luxury 2 Bedroom Apartment',
    description: 'Name of the property',
    minLength: 6,
    maxLength: 30,
  })
  @IsString()
  @Length(6, 30)
  name: string;

  @ApiProperty({
    example: 'A fully furnished 2 bedroom apartment with ocean view.',
    description: 'Detailed description of the property',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '12 Palm Street, Victoria Island',
    description: 'Full address of the property',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    example: 'host@property.com',
    description: 'Contact email for the property',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Lagos, Nigeria',
    description: 'City or geographical location of the property',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    enum: PropertyType,
    example: PropertyType.APARTMENT,
    description: 'Type of property',
  })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiProperty({
    example: ['WiFi', 'Air Conditioning', 'Swimming Pool'],
    description: 'List of amenities available in the property',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  amenities: string[];

  @ApiProperty({
    example: '+2348012345678',
    description: 'Contact phone number',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    example: ['Free Parking', '24/7 Security'],
    description: 'Additional features of the property',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiProperty({
    example: 'No smoking inside the apartment.',
    description: 'Rules and regulations of the property',
  })
  @IsString()
  @IsNotEmpty()
  rule: string;

  @ApiPropertyOptional({
    example: 150000,
    description: 'Price per night or rental period',
    minimum: 0,
  })
  @IsNumber()
  @Min(0, {
    message: 'price must not be less than 0',
  })
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    example: 4,
    description: 'Maximum number of guests the property can accommodate',
    minimum: 1,
  })
  @IsNumber()
  @Min(1, {
    message: 'capacity must be at least 1',
  })
  @IsOptional()
  capacity?: number;

  @ApiProperty({
    example: [
      'https://cloudinary.com/property1.jpg',
      'https://cloudinary.com/property2.jpg',
    ],
    description: 'List of image URLs for the property',
    type: [String],
  })
  @IsArray()
  attachments: string[];
}

export class listPropertyQuery extends PaginationqueryDto {

}