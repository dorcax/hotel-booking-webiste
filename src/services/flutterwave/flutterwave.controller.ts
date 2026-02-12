import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { userEntity } from 'src/module/auth/auth.types';
import { AuthUser } from 'src/module/auth/deocorator/auth.decorator';
import { CreateFlutterwaveDto } from './dto/create-flutterwave.dto';
import { FlutterwaveService } from './flutterwave.service';

@Controller('flutterwave')
export class FlutterwaveController {
  constructor(private readonly flutterwaveService: FlutterwaveService) {}

  @Post()
  create(@Body() createFlutterwaveDto: CreateFlutterwaveDto,@AuthUser() user:userEntity ) {
    return this.flutterwaveService.initiatePayment(createFlutterwaveDto,user);
  }

  @Get()
  findAll() {
    return this.flutterwaveService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flutterwaveService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.flutterwaveService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.flutterwaveService.remove(+id);
  }
}
