import { Module } from '@nestjs/common';
import { FileInputHandlerModule } from '../input-handling/file/file-input.module';
import { FileInputHandlerService } from '../input-handling/file/file-input.service';
import { HttpInputHandlerModule } from '../input-handling/http/http-input.module';
import { HttpInputHandlerService } from '../input-handling/http/http-input.service';
import { StreamService } from './stream.service';

@Module({
  imports: [HttpInputHandlerModule, FileInputHandlerModule],
  providers: [StreamService, HttpInputHandlerService, FileInputHandlerService],
  exports: [StreamService],
})
export class StreamModule {}
