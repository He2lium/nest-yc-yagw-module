import { DynamicModule, Module } from "@nestjs/common";
import { YagwService } from './yagw.service';
import {YagwModuleAsyncOptionsType} from "./types/yagw-module-options.type";
import {YAGW_OPTIONS_TOKEN} from "./yagw.constants";

@Module({})
export class YagwModule{
  static forRootAsync(options: YagwModuleAsyncOptionsType): DynamicModule{
    return {
      module: YagwModule,
      global: true,
      imports: options.imports,
      providers: [{
        provide: YAGW_OPTIONS_TOKEN,
        useFactory: options.useFactory,
        inject: options.inject
      },YagwService],
      exports: [YagwService]
    }
  }
}
