import {YagwModule} from "./yagw.module";
import {YagwService} from "./yagw.service";
import {YagwTypes} from "./types/nest-swagger";
import {YagwModuleOptionsType, YagwModuleAsyncOptionsType} from "./types/yagw-module-options.type";
import {YagwOperationOptionsType} from "./types/yagw-operation-options.type";
import {YagwApiOperation} from "./decorators/api-operation.decorator";
import {YagwJwtPayloadType, YagwJwtPayload} from "./decorators/jwt-payload-param.decorator";
import {YagwRoleMergerFactory, YagwRoleType} from "./types/scope.type";
import {YagwApiProperty} from "./decorators/api-property.decorator";

export {
    YagwModuleOptionsType,
    YagwOperationOptionsType,
    YagwModuleAsyncOptionsType,
    YagwApiOperation,
    YagwJwtPayloadType,
    YagwModule,
    YagwTypes,
    YagwJwtPayload,
    YagwService,
    YagwRoleMergerFactory,
    YagwRoleType,
    YagwApiProperty
}