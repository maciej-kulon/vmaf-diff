import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { CompareModule } from './command/compare.module';

@Module({
  imports: [ConsoleModule, CompareModule],
})
export class AppModule {}
