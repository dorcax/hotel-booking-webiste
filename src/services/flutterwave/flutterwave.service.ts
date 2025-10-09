import { Injectable } from '@nestjs/common';
import { CreateFlutterwaveDto } from './dto/create-flutterwave.dto';
import { UpdateFlutterwaveDto } from './dto/update-flutterwave.dto';

@Injectable()
export class FlutterwaveService {
  create(createFlutterwaveDto: CreateFlutterwaveDto) {
    return 'This action adds a new flutterwave';
  }

  findAll() {
    return `This action returns all flutterwave`;
  }

  findOne(id: number) {
    return `This action returns a #${id} flutterwave`;
  }

  update(id: number, updateFlutterwaveDto: UpdateFlutterwaveDto) {
    return `This action updates a #${id} flutterwave`;
  }

  remove(id: number) {
    return `This action removes a #${id} flutterwave`;
  }
}
