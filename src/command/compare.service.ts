import { Command, Console } from 'nestjs-console';
import {
  CompareCommandOptions,
  FFprobeShrinkedData,
  OriginalVideoData,
  VmafResult,
} from '../types/types';
import { FFmpegService } from '../ffmpeg/ffmpeg.service';
import { FFprobeService } from '../ffprobe/ffprobe.service';
import { VmafLogComparisonService } from '../vmaf-log-comparison/vmaf-log-comparison.service';

@Console()
export class CompareCommandService {
  public constructor(
    private readonly ffmpeg: FFmpegService,
    private readonly ffprobe: FFprobeService,
    private readonly vmafLogComparison: VmafLogComparisonService,
  ) {}
  @Command({
    command: 'compare',
    options: [
      {
        flags: '-o, --original <original>',
        required: true,
      },
      {
        flags: '-d, --distorted <distorted...>',
        required: true,
      },
      {
        flags: '-c, --count <count>',
        defaultValue: 3,
        required: false,
      },
    ],
  })
  async compare(options: CompareCommandOptions): Promise<void> {
    if (options.distorted.length < 2) {
      console.error(
        'You have to provide at least 2 distorted videos to compare.',
      );
      return;
    }

    const ffprobeData: FFprobeShrinkedData = await this.ffprobe.getInfo(
      options.original,
    );

    const original: OriginalVideoData = {
      source: options.original,
      width: ffprobeData.width,
      height: ffprobeData.height,
      fps: ffprobeData.fps,
    };

    const commandDiffPromises: Promise<VmafResult>[] = [];
    for (const distorted of options.distorted) {
      commandDiffPromises.push(this.ffmpeg.vmaf(distorted, original));
    }

    const result = await Promise.all(commandDiffPromises);

    const maxDeltas = await this.vmafLogComparison.compareVmafLogs(
      result,
      options.count,
    );
    console.log(maxDeltas);

    const sources = result.map((item) => item.identifier);

    const exportFramesPromises = maxDeltas.map((item) => {
      return this.ffmpeg.exportFramesComparison(sources, item.frameNum);
    });

    await Promise.all(exportFramesPromises);

    console.log('Finished.');
  }
}
