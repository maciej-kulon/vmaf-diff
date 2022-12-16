import { Module } from '@nestjs/common';
import { HttpInputHandlerService } from './http-input.service';

@Module({
  providers: [HttpInputHandlerService],
  exports: [HttpInputHandlerService],
})
export class HttpInputHandlerModule {}
