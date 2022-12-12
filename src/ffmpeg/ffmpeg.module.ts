import { Module } from '@nestjs/common';
import { FFprobeService } from 'src/ffprobe/ffprobe.service';
import { FFmpegService } from './ffmpeg.service';

@Module({
  imports: [FFprobeService],
  providers: [FFmpegService],
  exports: [FFmpegService],
})
export class FFmpegModule {}
