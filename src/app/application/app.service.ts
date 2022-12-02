import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `Hello World! version: ${process.env.npm_package_version} - env: ${
      process.env.TEST_VALUE
    } date: ${new Date()}`;
  }
}
