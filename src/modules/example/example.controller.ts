import { Controller, Get } from '@nestjs/common';
import { ExampleService } from './example.service';

@Controller('example')
export class ExampleController {
  constructor(private readonly service: ExampleService) {}

  @Get()
  getHello(): string {
    return this.service.getHello();
  }
}
