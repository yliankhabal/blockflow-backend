import { Logger } from '@nestjs/common';

export const wait = (ms: number) => {
  Logger.log(`Triggered delay ${ms} ms`);
  return new Promise(res => setTimeout(res, ms));
};
