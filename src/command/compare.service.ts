import { Command, Console } from 'nestjs-console';
import {
  FFmpegService,
  VmafResult,
  OriginalVideoData,
} from '../ffmpeg/ffmpeg.service';
import {
  FFprobeService,
  FFprobeShrinkedData,
} from '../ffprobe/ffprobe.service';
import { VmafLogComparisonService } from '../vmaf-log-comparison/vmaf-log-comparison.service';
import fs from 'fs';

type CompareCommandOptions = {
  original: string;
  distorted: string[];
  count: number;
};

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

    const promises: Promise<VmafResult>[] = [];
    for (const distorted of options.distorted) {
      promises.push(this.ffmpeg.vmaf(distorted, original));
    }

    const result = await Promise.all(promises);

    const maxDeltas = await this.vmafLogComparison.compareVmafLogs(
      result,
      options.count,
    );
    console.log(maxDeltas);

    await this.ffmpeg.exportFrames(
      result.map((item) => item.identifier),
      maxDeltas.map((item) => item.frameNum),
    );

    // fs.writeFileSync('./vmaf.json', JSON.stringify(result, undefined, 2));
    // console.log('Done');
  }
}
