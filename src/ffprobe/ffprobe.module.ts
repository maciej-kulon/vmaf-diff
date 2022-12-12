import { Module } from '@nestjs/common';
import { FFprobeService } from './ffprobe.service';

@Module({
  exports: [FFprobeService],
  providers: [FFprobeService],
})
export class FFprobeModule {}
