import { ApiOperation } from "@nestjs/swagger";
import { OperationObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import {YagwOperationOptionsType} from "../types/yagw-operation-options.type";
import {uuid} from "uuidv4";
import {YagwGlobalStorage} from "../storage/yagw-storage.class";

export const ApiYagwOperation = (YagwOptions:YagwOperationOptionsType, operation: Partial<OperationObject>) =>{

  const operationId = uuid()
  YagwGlobalStorage.addMethodOptions(operationId, YagwOptions)

  return ApiOperation({
    ...operation,
    operationId,
  });
}

