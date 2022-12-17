import { Module } from '@nestjs/common';
import { VmafLogComparisonService } from './vmaf-log-comparison.service';

@Module({
  providers: [VmafLogComparisonService],
  exports: [VmafLogComparisonService],
})
export class VmafLogComparisonModule {}
