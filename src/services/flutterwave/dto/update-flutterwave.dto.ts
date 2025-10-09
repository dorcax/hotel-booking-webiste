import { PartialType } from '@nestjs/mapped-types';
import { CreateFlutterwaveDto } from './create-flutterwave.dto';

export class UpdateFlutterwaveDto extends PartialType(CreateFlutterwaveDto) {}
