import { Injectable } from '@nestjs/common';
import FfmpegCommand from 'fluent-ffmpeg';
import { ReadStream } from 'fs';
import { FFprobeService } from '../ffprobe/ffprobe.service';
import { Duplex } from 'stream';

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

  public async exportFrames(
    sources: string[],
    frames: number[],
  ): Promise<void> {
    try {
      for (const source of sources) {
        await this.exportFramesFromSource(source, frames);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async exportFramesFromSource(
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
          .addOptions('-vf', `"select=gte(n\\,${frame})"`)
          .addOption('-vframes', '1')
          .addOption(`${source}_${frame}_%03d.png`);
      }
      ffmpeg.format('null').addOutput('-').run();
    });
  }
}
