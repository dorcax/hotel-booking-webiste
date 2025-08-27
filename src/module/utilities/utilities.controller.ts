import { Controller } from '@nestjs/common';
import { UtilitiesService } from './utilities.service';

@Controller('utilities')
export class UtilitiesController {
  constructor(private readonly utilitiesService: UtilitiesService) {}
}
