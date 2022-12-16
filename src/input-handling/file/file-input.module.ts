import { Module } from '@nestjs/common';
import { FileInputHandlerService } from './file-input.service';

@Module({
  exports: [FileInputHandlerService],
  providers: [FileInputHandlerService],
})
export class FileInputHandlerModule {}
