import { Module } from '@nestjs/common';
import { StreamModule } from '../stream/stream.module';
import { CompareService } from './compare.service';
import { FFmpegModule } from '../ffmpeg/ffmpeg.module';

@Module({
  imports: [StreamModule, FFmpegModule],
  providers: [CompareService],
  exports: [CompareService],
})
export class CompareModule {}
