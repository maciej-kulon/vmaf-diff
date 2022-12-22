import { Injectable } from '@nestjs/common';
import { FrameDeltaData, VmafResult } from '../types/types';

@Injectable()
export class VmafLogComparisonService {
  public compareVmafLogs(
    vmafResults: VmafResult[],
    maxDeltaCount: number,
  ): Promise<FrameDeltaData[]> {
    return new Promise((resolve, reject) => {
      try {
        const frameDeltas: FrameDeltaData[] = [];
        for (let i = 0; i < vmafResults[0].log.frames.length; i++) {
          const frames: number[] = [];
          for (const vmaf of vmafResults) {
            frames.push(vmaf.log.frames[i].metrics.vmaf);
          }
          const min = Math.min(...frames);
          const max = Math.max(...frames);
          frameDeltas.push({
            delta: max - min,
            frameNum: vmafResults[0].log.frames[i].frameNum,
          });
        }
        frameDeltas.sort((a, b) => b.delta - a.delta);
        resolve(frameDeltas.splice(0, maxDeltaCount));
      } catch (error) {
        reject(error);
      }
    });
  }
}
