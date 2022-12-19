import { Injectable } from '@nestjs/common';
import FfmpegCommand from 'fluent-ffmpeg';
import { ReadStream } from 'fs';
import { Duplex } from 'stream';
import path from 'path';

export type VmafResult = {
  identifier: string;
  log: VmafLog;
};

export type VmafLog = {
  frames: Frame[];
};

export type Frame = {
  frameNum: number;
  metrics: FrameMetrics;
};

export type FrameMetrics = {
  psnr_y: number;
  integer_adm2: number;
  integer_adm_scale0: number;
  integer_adm_scale1: number;
  integer_adm_scale2: number;
  integer_adm_scale3: number;
  integer_motion2: number;
  integer_motion: number;
  integer_vif_scale0: number;
  integer_vif_scale1: number;
  integer_vif_scale2: number;
  integer_vif_scale3: number;
  vmaf: number;
};

export type OriginalVideoData = {
  source: string | ReadStream | Duplex;
  width: number;
  height: number;
  fps: string;
};

@Injectable()
export class FFmpegService {
  public async vmaf(
    distorted: string,
    original: OriginalVideoData,
  ): Promise<VmafResult> {
    return new Promise((resolve, reject) => {
      try {
        const ffmpeg = FfmpegCommand({ stdoutLines: 0 });
        ffmpeg.on('start', console.log);
        ffmpeg.on('error', (error) => {
          reject(error);
        });
        ffmpeg.on('end', (data) => {
          resolve({ identifier: distorted, log: JSON.parse(data) });
        });

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

  public async exportFramesFromAllSources(
    sources: string[],
    frames: number[],
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const ffmpeg = FfmpegCommand();
        ffmpeg.on('error', (error) => {
          console.log(error);
          reject(error);
        });
        ffmpeg.on('stderr', (data) => {
          console.log(data);
        });
        ffmpeg.on('end', resolve);
        ffmpeg.on('start', console.log);
        // ffmpeg.on('progress', console.log);
        ffmpeg.on('codecData', console.log);
        for (const source of sources) {
          ffmpeg.addInput(source);
        }

        const inputFilters: string[] = [];
        for (let i = 0; i < sources.length; i++) {
          for (const frame of frames) {
            inputFilters.push(
              `[${i}:v]select=eq(n\\,${frame}),setpts=1[${
                path.parse(sources[i]).name
              }_${frame}];`,
            );
          }
        }

        for (const frame of frames) {
          let frameStreams = '';
          for (const source of sources) {
            const fStream = `[${path.parse(source).name}_${frame}]`;
            frameStreams += fStream;
          }
          ffmpeg
            .addOption(
              '-filter_complex',
              `${inputFilters.join(' ')} ${frameStreams}hstack=inputs=${
                sources.length
              }`,
            )
            .addOption(`./result_${frameStreams}_%03d.png`);
        }
        ffmpeg.format('null').addOutput(`-`).run();
      } catch (error) {
        console.error(error);
        throw error;
      }
    });
  }

  private async exportFramesFromSingleSource(
    source: string,
    frames: number[],
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = FfmpegCommand();

      ffmpeg.on('end', resolve);
      ffmpeg.on('error', (error) => {
        console.log(error);
        reject(error);
      });
      ffmpeg.on('start', console.log);

      ffmpeg.addInput(source);
      for (const frame of frames) {
        ffmpeg
          .addOptions(
            '-vf',
            `select=gte(n\\,${frame})[${path.parse(source).name}_${frame}]`,
          )
          .addOption('-vframes', '1');
        //.addOption(`-`);
      }
      ffmpeg.format('null').addOutput(`-`).run();
    });
  }
}

// ffmpeg -i ./samples/distorted1.mp4 -i ./samples/distorted2.mp4 -y -an -filter_complex "[0]select=gte(n\,10)[distorted1_10]; [1]select=gte(n\,10)[distorted2_10]; [distorted1_10][distorted2_10]hstack=inputs=2 ./result_[distorted1_10][distorted2_10].png" -f null -
