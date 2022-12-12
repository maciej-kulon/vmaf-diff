import { Command, CommandRunner } from 'nest-commander';

@Command({
  name: 'compare',
  description:
    'Runs VMAF on the given input and returns the most different frames.',
  options: { isDefault: true },
})
export class VmafDiffCommand extends CommandRunner {
  run(passedParams: string[], options?: Record<string, any>): Promise<void> {
    console.log('Input processing will be performed here');
    return Promise.resolve();
  }
}
