import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { CompareCommandModule } from './command/compare.module';

@Module({
  imports: [ConsoleModule, CompareCommandModule],
})
export class AppModule {}
