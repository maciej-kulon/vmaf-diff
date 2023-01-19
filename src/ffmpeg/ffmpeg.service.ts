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

        this.subscribeToFfmpegEvents(
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
            `[0:v]scale=${original.width}:${original.height}[dist]; [1:v]scale=${original.width}:${original.height}[original]; [dist][original]libvmaf=psnr=1:phone_model=1:log_fmt=json:log_path=/dev/stdout`,
          )
          .format('null')
          .save('-');
      } catch (error) {
        reject(error);
      }
    });
  }

  public async exportFramesComparison(
    vmafResults: VmafResult[],
    frameNumber: number,
    frameWidth: number,
    frameHeight: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const ffmpeg = FfmpegCommand();

        this.subscribeToFfmpegEvents(ffmpeg, resolve, reject);

        for (const vmafResult of vmafResults) {
          ffmpeg.addInput(vmafResult.identifier);
        }

        const exportFrameFilters = this.createExportFrameFilters(
          vmafResults,
          frameNumber,
          frameHeight,
          frameWidth,
        );

        const frameStreams = this.prepareFrameStreamsString(vmafResults);

        ffmpeg
          .addOption(
            '-filter_complex',
            `${exportFrameFilters.join(' ')} ${frameStreams}hstack=inputs=${
              vmafResults.length
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

  private prepareFrameStreamsString(vmafResults: VmafResult[]): string {
    let frameStreams = '';
    for (const vmafResult of vmafResults) {
      const fStream = `[${path.parse(vmafResult.identifier).name}]`;
      frameStreams += fStream;
    }
    return frameStreams;
  }

  private createExportFrameFilters(
    vmafResults: VmafResult[],
    frameNumber: number,
    frameHeight: number,
    frameWidth: number,
  ): string[] {
    const exportFrameFilters: string[] = [];
    for (let i = 0; i < vmafResults.length; i++) {
      const vmafScoreText = `VMAF score=${
        Math.round(
          vmafResults[i].log.frames.find((s) => s.frameNum == frameNumber)
            .metrics.vmaf * 100,
        ) / 100
      }`;
      const lowerResolutionValue: number =
        frameHeight < frameWidth ? frameHeight : frameWidth;
      const fontSize = Math.round(lowerResolutionValue / 20);
      exportFrameFilters.push(
        `[${i}:v]select=eq(n\\,${frameNumber}),setpts=1,drawtext=text=File name=${
          vmafResults[i].identifier
        }\n${vmafScoreText}\nFrame number=${frameNumber}:bordercolor=White:borderw=1:fontsize=${fontSize}[${
          path.parse(vmafResults[i].identifier).name
        }];`,
      );
    }
    return exportFrameFilters;
  }

  private subscribeToFfmpegEvents(
    ffmpeg: FfmpegCommand.FfmpegCommand,
    callback: any,
    errorHandler: any,
  ): void {
    ffmpeg.on('error', (error) => {
      console.log(error);
      errorHandler(error);
    });
    ffmpeg.on('progress', ({ percent }) => {
      console.log(`${Math.round(percent)}%`);
    });
    ffmpeg.on('end', callback);
    ffmpeg.on('start', console.log);
    ffmpeg.on('stderr', console.log);
  }
}
