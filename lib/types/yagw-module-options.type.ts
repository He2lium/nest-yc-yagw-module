import { YAGWTypes } from "./nest-swagger";
import Validator = YAGWTypes.Validator;
import CORS = YAGWTypes.CORS;
import {FactoryProvider, ModuleMetadata} from "@nestjs/common";
import FunctionSecuritySchema = YAGWTypes.FunctionSecuritySchema;
import CloudFunctionIntegration = YAGWTypes.CloudFunctionIntegration;
import JWTSecuritySchema = YAGWTypes.JWTSecuritySchema;
import HttpIntegration = YAGWTypes.HttpIntegration;

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