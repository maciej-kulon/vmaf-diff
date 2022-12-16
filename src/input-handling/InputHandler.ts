import { ReadStream } from 'fs';
import { Duplex } from 'stream';

export interface IInputHandler {
  getStream(source: string): Promise<Duplex | ReadStream>;
}
