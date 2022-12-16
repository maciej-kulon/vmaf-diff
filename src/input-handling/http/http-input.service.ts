import { Injectable } from '@nestjs/common';
import got, { Got } from 'got';
import { Duplex } from 'stream';
import { IInputHandler } from '../InputHandler';

@Injectable()
export class HttpInputHandlerService implements IInputHandler {
  private client: Got = got.extend({
    retry: {
      limit: 5,
    },
  });
  public getStream(source: string): Promise<Duplex> {
    return new Promise((resolve, reject) => {
      try {
        resolve(this.client.stream(source));
      } catch (error) {
        reject(error);
      }
    });
  }
}
