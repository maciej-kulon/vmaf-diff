import { Injectable } from '@nestjs/common';
import FfmpegCommand, { FfprobeData } from 'fluent-ffmpeg';
import { ReadStream } from 'fs';
import { FFprobeShrinkedData } from '../types/types';
import { Duplex } from 'stream';

@Injectable()
export class FFprobeService {
  public getInfo(
    source: string | ReadStream | Duplex,
  ): Promise<FFprobeShrinkedData> {
    return new Promise((resolve, reject) => {
      try {
        const ffmpeg = FfmpegCommand();
        ffmpeg.addInput(source).ffprobe((error, data: FfprobeData) => {
          if (error) reject(error);
          const vStream = data.streams.find(
            (stream) => stream.codec_type === 'video',
          );
          resolve({
            width: vStream.width,
            height: vStream.height,
            fps: vStream.r_frame_rate,
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
