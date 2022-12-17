import { Module } from '@nestjs/common';
import { FFprobeModule } from '../ffprobe/ffprobe.module';
import { FFmpegService } from './ffmpeg.service';

@Module({
  imports: [FFprobeModule],
  providers: [FFmpegService],
  exports: [FFmpegService],
})
export class FFmpegModule {}
