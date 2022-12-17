import { Command, Console } from 'nestjs-console';
import { FFmpegService } from '../ffmpeg/ffmpeg.service';
import { StreamService } from '../stream/stream.service';

type CompareCommandOptions = {
  original: string;
  distorted: string[];
};

@Console()
export class CompareService {
  public constructor(
    private readonly ffmpeg: FFmpegService,
    private readonly streamService: StreamService,
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
    ],
  })
  async compare(options: CompareCommandOptions): Promise<void> {
    if (options.distorted.length < 2) {
      console.error(
        'You have to provide at least 2 distorted videos to compare.',
      );
      return;
    }

    const promises: Promise<string>[] = [];
    for (const distorted of options.distorted) {
      promises.push(this.ffmpeg.vmaf(distorted, options.original));
    }

    const result = await Promise.all(promises);
    console.log(result);
  }
}
