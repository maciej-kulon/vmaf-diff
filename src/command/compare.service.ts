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
    // const originalStreamHandler = this.streamService.getStreamHandler(
    //   options.original,
    // );
    // const originalStream = await originalStreamHandler.getStream(
    //   options.original,
    // );

    for (const distorted of options.distorted) {
      const result = await this.ffmpeg.vmaf(distorted, options.original);
      console.log(result);
    }
  }
}
