import { ReadStream } from 'fs';
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
  psnr_y?: number;
  vmaf: number;
};

export type OriginalVideoData = {
  source: string | ReadStream | Duplex;
  width: number;
  height: number;
  fps: string;
};

export type CompareCommandOptions = {
  original: string;
  distorted: string[];
  count: number;
};

export type FFprobeShrinkedData = {
  width: number;
  height: number;
  fps: string;
};

export type FrameDeltaData = {
  frameNum: number;
  delta: number;
};
