import { Injectable } from '@nestjs/common';
import FfmpegCommand from 'fluent-ffmpeg';
import path from 'path';
import { OriginalVideoData, VmafResult } from '../types/types';

@Injectable()
export class FFmpegService {
  public async vmaf(
    distorted: string,
    original: OriginalVideoData,
  ): Promise<VmafResult> {
    return new Promise((resolve, reject) => {
      try {
        const ffmpeg = FfmpegCommand({ stdoutLines: 0 });

        this.subscribeFFmpegEvents(
          ffmpeg,
          (data: string) => {
            resolve({ identifier: distorted, log: JSON.parse(data) });
          },
          reject,
        );

        ffmpeg
          .addInput(distorted)
          .addInput(original.source)
          .addOption(
            '-filter_complex',
            `[0:v]scale=${original.width}x${original.height}:flags=bicubic[main]; [main][1:v]libvmaf=psnr=1:phone_model=1:log_fmt=json:log_path=/dev/stdout`,
          )
          .format('null')
          .save('-');
      } catch (error) {
        reject(error);
      }
    });
  }

  public async exportFramesComparison(
    sources: string[],
    frameNumber: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const ffmpeg = FfmpegCommand();

        this.subscribeFFmpegEvents(ffmpeg, resolve, reject);

        for (const source of sources) {
          ffmpeg.addInput(source);
        }

        const exportFrameFilters = this.createExportFrameFilters(
          sources,
          frameNumber,
        );

        const frameStreams = this.prepareFrameStreamsString(sources);

        ffmpeg
          .addOption(
            '-filter_complex',
            `${exportFrameFilters.join(' ')} ${frameStreams}hstack=inputs=${
              sources.length
            }[result]`,
          )
          .addOption('-map', `[result]`)
          .addOutput(`./frame_${frameNumber}${frameStreams}.png`)
          .run();
      } catch (error) {
        console.error(error);
        throw error;
      }
    });
  }

  private prepareFrameStreamsString(sources: string[]) {
    let frameStreams = '';
    for (const source of sources) {
      const fStream = `[${path.parse(source).name}]`;
      frameStreams += fStream;
    }
    return frameStreams;
  }

  private createExportFrameFilters(sources: string[], frameNumber: number) {
    const exportFrameFilters: string[] = [];
    for (let i = 0; i < sources.length; i++) {
      exportFrameFilters.push(
        `[${i}:v]select=eq(n\\,${frameNumber}),setpts=1[${
          path.parse(sources[i]).name
        }];`,
      );
    }
    return exportFrameFilters;
  }

  private subscribeFFmpegEvents(
    ffmpeg: FfmpegCommand.FfmpegCommand,
    callback: any,
    errorHandler: any,
  ) {
    ffmpeg.on('error', (error) => {
      console.log(error);
      errorHandler(error);
    });
    ffmpeg.on('end', callback);
    ffmpeg.on('start', console.log);
  }
}
