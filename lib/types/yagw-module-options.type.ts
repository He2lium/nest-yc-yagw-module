import { YagwTypes } from "./nest-swagger";
import Validator = YagwTypes.Validator;
import CORS = YagwTypes.CORS;
import {FactoryProvider, ModuleMetadata} from "@nestjs/common";
import FunctionSecuritySchema = YagwTypes.FunctionSecuritySchema;
import CloudFunctionIntegration = YagwTypes.CloudFunctionIntegration;
import JWTSecuritySchema = YagwTypes.JWTSecuritySchema;
import HttpIntegration = YagwTypes.HttpIntegration;

export interface YagwModuleOptionsType {
  integrations?: { [integrationToken: string]: (CloudFunctionIntegration | HttpIntegration) }
  securities?: { [securitySchemaToken: string]: (JWTSecuritySchema | FunctionSecuritySchema) }
  validators?: { [validatorSchemaToken: string]: Validator }
  globalValidatorToken?: string
  cors?: {[corsSchemaToken: string]: CORS}
  globalCORSToken?: string
  servers: string[]
}

export type YagwModuleAsyncOptionsType =
    Pick<ModuleMetadata, "imports"> &
    Pick<FactoryProvider<YagwModuleOptionsType>,"useFactory"|"inject">