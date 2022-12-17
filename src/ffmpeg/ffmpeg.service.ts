import { Injectable } from '@nestjs/common';
import FfmpegCommand from 'fluent-ffmpeg';
import { ReadStream } from 'fs';
import {
  FFprobeService,
  FFprobeShrinkedData,
} from '../ffprobe/ffprobe.service';
import { Duplex } from 'stream';

@Injectable()
export class FFmpegService {
  public constructor(private readonly ffprobeService: FFprobeService) {}
  public async vmaf(
    distorted: string,
    original: Duplex | ReadStream | string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.ffprobeService
        .getInfo(original)
        .then((originalData) => {
          const ffmpeg = FfmpegCommand({ stdoutLines: 0 });
          console.log('Original video data: ', originalData);
          ffmpeg.on('start', console.log);
          ffmpeg.on('error', (error) => {
            reject(error);
          });
          ffmpeg.on('end', (data) => {
            resolve(data);
          });

          ffmpeg
            .addInput(distorted)
            .addInput(original)
            .addOption(
              '-filter_complex',
              `[0:v]scale=${originalData.width}x${originalData.height}:flags=bicubic[main]; [main][1:v]libvmaf=psnr=1:phone_model=1:log_fmt=json:log_path=/dev/stdout`,
            )
            .format('null')
            .save('-');
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}

//ts-node ./src/console.ts compare -o http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4 -d http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
// ffmpeg -i http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4 -i http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4 -y -filter_complex "[0:v]scale=1920x1080:flags=bicubic[main]; [main][1:v]libvmaf=psnr=1:phone_model=1:log_fmt=json:log_path=/dev/stdout" -f null -
