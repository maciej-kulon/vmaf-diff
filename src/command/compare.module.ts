import { Module } from '@nestjs/common';
import { CompareCommandService } from './compare.service';
import { FFmpegModule } from '../ffmpeg/ffmpeg.module';
import { FFprobeModule } from '../ffprobe/ffprobe.module';
import { VmafLogComparisonModule } from '../vmaf-log-comparison/vmaf-log-comparison.module';

@Module({
  imports: [FFmpegModule, FFprobeModule, VmafLogComparisonModule],
  providers: [CompareCommandService],
  exports: [CompareCommandService],
})
export class CompareCommandModule {}
