import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { userEntity } from '../auth/auth.types';
import { Auth, AuthUser } from '../auth/deocorator/auth.decorator';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyService } from './property.service';

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}


  @Auth([Role.HOST])
  @Post()
  create(@Body() createPropertyDto: CreatePropertyDto,@AuthUser() user:userEntity) {
    return this.propertyService.create(createPropertyDto,user);
  }



   @Auth([Role.HOST])
  @Get()
  findAll() {
    return this.propertyService.findAll();
  }

  @Auth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }


 @Auth([Role.ADMIN])
  @Patch(":propertyId")
  verifyProperty(@Param("propertyId") propertyId:string) {
    return this.propertyService.verifyProperty(propertyId);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto) {
    return this.propertyService.update(+id, updatePropertyDto);
  }


   @Auth([Role.HOST])
  @Delete(':propertyId')
  remove(@Param('propertyId') propertyId: string,@AuthUser() user:userEntity) {
    return this.propertyService.remove(propertyId,user);
  }
}
