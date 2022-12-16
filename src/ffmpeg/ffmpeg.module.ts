import { Module } from '@nestjs/common';
import { StreamModule } from '../stream/stream.module';
import { FFmpegService } from './ffmpeg.service';

@Module({
  imports: [StreamModule],
  providers: [FFmpegService],
  exports: [FFmpegService],
})
export class FFmpegModule {}
