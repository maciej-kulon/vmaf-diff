import { Injectable } from '@nestjs/common';
import { IInputHandler } from '../InputHandler';
import fs, { ReadStream } from 'fs';
import { Duplex } from 'stream';

@Injectable()
export class FileInputHandlerService implements IInputHandler {
  public getStream(source: string): Promise<Duplex | ReadStream> {
    return new Promise((resolve, reject) => {
      try {
        resolve(fs.createReadStream(source));
      } catch (error) {
        reject(error);
      }
    });
  }
}
