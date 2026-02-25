import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { userEntity } from '../auth/auth.types';
import { Auth, AuthUser } from '../auth/deocorator/auth.decorator';
import { CreatePropertyDto, listPropertyQuery } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyService } from './property.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Properties')
@ApiCookieAuth("access_token")
@Controller('property')

export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  
 

  @Auth([Role.GUEST])
  @Post()
  @ApiOperation({
    summary: 'Create a new property (Host only)',
    description: 'Allows a host to create and list a new property.',
  })
  @ApiResponse({
    status: 201,
    description: 'Property created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only HOST can create property',
  })
  create(
    @Body() createPropertyDto: CreatePropertyDto,
    @AuthUser() user: userEntity,
  ) {
    return this.propertyService.create(createPropertyDto, user);
  }



  // @Auth([Role.GUEST])
  @Get()
  @ApiOperation({
    summary: 'Get all properties created by host',
  })
  @ApiResponse({
    status: 200,
    description: 'List of properties retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Only HOST can access this endpoint',
  })
  findAll() {
    return this.propertyService.findAll();
  }


  @Auth([Role.GUEST])
  @Get("host")
  @ApiOperation({
    summary: 'Get all properties created by host',
  })
  @ApiResponse({
    status: 200,
    description: 'List of properties retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Only HOST can access this endpoint',
  })
  findHostProperty(@Query() query: listPropertyQuery,@AuthUser() user: userEntity) {
    return this.propertyService.findHostProperty(query,user);
  }


  @Auth()
  @Get(':id')
  @ApiOperation({
    summary: 'Get property by ID',
  })
  @ApiParam({
    name: 'id',
    example: 'clx9abc123xyz',
    description: 'Unique ID of the property',
  })
  @ApiResponse({
    status: 200,
    description: 'Property retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found',
  })
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }


  @Auth([Role.ADMIN])
  @Patch(':propertyId')
  @ApiOperation({
    summary: 'Verify property listing (Admin only)',
    description: 'Admin approves and verifies property before public visibility.',
  })
  @ApiParam({
    name: 'propertyId',
    example: 'clx9abc123xyz',
    description: 'Unique ID of the property',
  })
  @ApiResponse({
    status: 200,
    description: 'Property verified successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Only ADMIN can verify property',
  })
  verifyProperty(@Param('propertyId') propertyId: string) {
    return this.propertyService.verifyProperty(propertyId);
  }

  

  @Auth([Role.HOST])
  @Patch('update/:id')
  @ApiOperation({
    summary: 'Update property details (Host only)',
  })
  @ApiParam({
    name: 'id',
    example: 'clx9abc123xyz',
    description: 'Unique ID of the property',
  })
  @ApiResponse({
    status: 200,
    description: 'Property updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found',
  })
  update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertyService.update(id, updatePropertyDto);
  }

  @Auth([Role.GUEST])
  @Delete(':propertyId')
  @ApiOperation({
    summary: 'Delete property (Host only)',
  })
  @ApiParam({
    name: 'propertyId',
    example: 'clx9abc123xyz',
    description: 'Unique ID of the property',
  })
  @ApiResponse({
    status: 200,
    description: 'Property deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Only HOST can delete property',
  })
  remove(
    @Param('propertyId') propertyId: string,
    @AuthUser() user: userEntity,
  ) {
    return this.propertyService.remove(propertyId, user);
  }
}
