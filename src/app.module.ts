import { Module } from '@nestjs/common';
import { VmafDiffCommand } from './command/vmaf-diff.command';

@Module({
  providers: [VmafDiffCommand],
})
export class AppModule {}
