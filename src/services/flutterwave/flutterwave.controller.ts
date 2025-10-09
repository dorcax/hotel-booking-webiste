import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FlutterwaveService } from './flutterwave.service';
import { CreateFlutterwaveDto } from './dto/create-flutterwave.dto';
import { UpdateFlutterwaveDto } from './dto/update-flutterwave.dto';

@Controller('flutterwave')
export class FlutterwaveController {
  constructor(private readonly flutterwaveService: FlutterwaveService) {}

  @Post()
  create(@Body() createFlutterwaveDto: CreateFlutterwaveDto) {
    return this.flutterwaveService.create(createFlutterwaveDto);
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
  update(@Param('id') id: string, @Body() updateFlutterwaveDto: UpdateFlutterwaveDto) {
    return this.flutterwaveService.update(+id, updateFlutterwaveDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.flutterwaveService.remove(+id);
  }
}
