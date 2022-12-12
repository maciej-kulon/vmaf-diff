import { FfmpegCommand, FfprobeData } from 'fluent-ffmpeg';
import { Injectable } from '@nestjs/common';
import { PathLike } from 'fs';

@Injectable()
export class FFprobeService {
  public getMediaInfo(
    inputSource: PathLike,
    ffmpeg?: FfmpegCommand, // Parameter for testing purposes.
  ): Promise<FfprobeData> {
    return new Promise((resolve, reject) => {
      const cmd = ffmpeg ? ffmpeg : new FfmpegCommand();

      cmd.input(inputSource.toString())
        .ffprobe((error: Error, data: FfprobeData) => {
          if (error) {
            reject(error);
          }
          resolve(data);
        });
    });
  }
}
