import { Injectable } from '@nestjs/common';
import FfmpegCommand from 'fluent-ffmpeg';
import { ReadStream } from 'fs';
import { StreamService } from '../stream/stream.service';
import { Duplex } from 'stream';

@Injectable()
export class FFmpegService {
  public constructor(private readonly streamService: StreamService) {}
  public async vmaf(
    distorted: string,
    original: ReadStream | Duplex | string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // TODO: Inject FFProbeService and perform ffprobe to find out original video resolution.
      try {
        const { w, h } = { w: 1280, h: 720 };
        const ffmpeg = FfmpegCommand();
        ffmpeg.on('end', (data) => {
          resolve(data);
        });

        ffmpeg.on('start', console.log);
        ffmpeg.on('progress', console.log);

        ffmpeg
          .addInput(distorted)
          .addInput(original)
          .addOption(
            '-filter_complex',
            `[0:v]scale=${w}x${h}:flags=bicubic[main]; [main][1:v]libvmaf=psnr=1:phone_model=1:log_fmt=json:log_path=/dev/stdout`,
          )
          .format('null')
          .save('-');
      } catch (error) {
        reject(error);
      }
    });
  }
}

//ts-node ./src/console.ts compare -o http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4 -d http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
// ffmpeg -i http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4 -i http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4 -y -filter_complex "[0:v]scale=1920x1080:flags=bicubic[main]; [main][1:v]libvmaf=psnr=1:phone_model=1:log_fmt=json:log_path=/dev/stdout" -f null -