import { Injectable } from '@nestjs/common';
import { HttpInputHandlerService } from '../input-handling/http/http-input.service';
import { FileInputHandlerService } from '../input-handling/file/file-input.service';
import { IInputHandler } from '../input-handling/InputHandler';

@Injectable()
export class StreamService {
  public constructor(
    private readonly httpInputService: HttpInputHandlerService,
    private readonly fileInputService: FileInputHandlerService,
  ) {}
  public getStreamHandler(source: string): IInputHandler {
    if (source.startsWith('http://')) {
      return this.httpInputService;
    } else {
      return this.fileInputService;
    }
  }
}
