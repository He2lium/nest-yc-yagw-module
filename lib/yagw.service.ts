import { Inject, Injectable } from "@nestjs/common";
import { YagwModuleOptionsType } from "./types/yagw-module-options.type";
import { OpenAPIObject } from "@nestjs/swagger";
import { YagwGlobalStorage } from "./storage/yagw-storage.class";
import { YagwOperationOptionsType } from "./types/yagw-operation-options.type";
import { YAGW_OPTIONS_TOKEN } from "./yagw.constants";
import { YagwWebsocketMethodsEnum } from "./types/yagw-websocket-methods.enum";

@Injectable()
export class YagwService {
  constructor(@Inject(YAGW_OPTIONS_TOKEN) private options: YagwModuleOptionsType) {
  }

  private _getIntegration(token: string) {
    return this.options.integrations?.[token]
  }

  public postProcessing(originalDocument: OpenAPIObject, globalPrefix?: string) {
    let doc = originalDocument as OpenAPIObject & any;
    const instanceOptions = this.options;

    /**
     * Add Components
     */
    if (!doc.components) doc.components = {};

    // Add security schemas
    for (let componentName in instanceOptions.securities) {
      if (!doc.components.securitySchemes) doc.components.securitySchemes = {};
      doc.components.securitySchemes[componentName] =
          instanceOptions.securities[componentName];
    }

    // Add validators
    for (let componentName in instanceOptions.validators) {
      if (!doc.components["x-yc-apigateway-validators"])
        doc.components["x-yc-apigateway-validators"] = {};
      doc.components["x-yc-apigateway-validators"][componentName] =
          instanceOptions.validators[componentName];
    }

    // Add CORS rules
    for (let componentName in instanceOptions.cors) {
      if (!doc.components["x-yc-apigateway-cors-rules"])
        doc.components["x-yc-apigateway-cors-rules"] = {};
      doc.components["x-yc-apigateway-cors-rules"][componentName] =
          instanceOptions.cors[componentName];
    }

    // Add integrations
    for (let componentName in instanceOptions.integrations) {
      if (!doc.components["x-yc-apigateway-integrations"])
        doc.components["x-yc-apigateway-integrations"] = {};
      doc.components["x-yc-apigateway-integrations"][componentName] =
          instanceOptions.integrations[componentName];
    }

    /**
     * Add global options
     */

    // Add servers
    if (!instanceOptions.servers.length)
      throw new Error("Servers are required");
    for (let serverUrl of instanceOptions.servers)
      doc.servers.push({ url: serverUrl });

    // Add global CORS
    if (!doc["x-yc-apigateway"]) doc["x-yc-apigateway"] = {};
    if (instanceOptions.globalCORSToken) {
      doc["x-yc-apigateway"]["cors"] = {
        $ref: `#/components/x-yc-apigateway-cors-rules/${instanceOptions.globalCORSToken}`
      };
    }

    // Add global validator
    if (instanceOptions.globalValidatorToken) {
      doc["x-yc-apigateway"]["validator"] = {
        $ref: `#/components/x-yc-apigateway-validators/${instanceOptions.globalValidatorToken}`
      };
    }

    /**
     * Add options by path
     */

    // Document objects by path
    for (let pathUrl of Object.keys(doc.paths)) {
      // Document objects by method
      for (let pathMethod of Object.keys(doc.paths[pathUrl])) {
        // Get document operation ID
        const pathOperationId = doc.paths[pathUrl][pathMethod].operationId;

        // Looking for operation ID in YAGW global storage
        const yagwPathOptionTokens: YagwOperationOptionsType =
            YagwGlobalStorage.getMethodOptions(pathOperationId);
        if (yagwPathOptionTokens) {
          // Responses
          if (doc.paths[pathUrl][pathMethod].responses) {
            for (let status in doc.paths[pathUrl][pathMethod].responses) {
              doc.paths[pathUrl][pathMethod].responses[status].description =
                  "Response" +
                  doc.paths[pathUrl][pathMethod].responses[status].description;
            }

            // Integration
            if (yagwPathOptionTokens.integration) {
              const integration = this._getIntegration(yagwPathOptionTokens.integration)
              switch (integration?.type) {
                case "cloud_functions":
                  doc.paths[pathUrl][pathMethod][
                      "x-yc-apigateway-integration"
                      ] = {
                    $ref: `#/components/x-yc-apigateway-integrations/${yagwPathOptionTokens.integration}`
                  };
                  break;
                case "http":
                  doc.paths[pathUrl][pathMethod][
                      "x-yc-apigateway-integration"
                      ] = {
                    $ref: `#/components/x-yc-apigateway-integrations/${yagwPathOptionTokens.integration}`,
                    url: `${integration.url}${pathUrl}`
                  };
                  break;
                default:
                  throw new Error(`Incorrect integration type`);
              }
            }

            // Securities
            for (let securityToken in yagwPathOptionTokens.securities) {
              // Get integration source object from module instance
              const security = instanceOptions.securities
                  ? instanceOptions.securities[securityToken]
                  : undefined;

              if (!security) throw new Error("Security not found");

              // Add path security if it does not exist
              if (!doc.paths[pathUrl][pathMethod].security)
                doc.paths[pathUrl][pathMethod].security = [];

              // Add security
              doc.paths[pathUrl][pathMethod].security.push({
                [`${securityToken}`]:
                    yagwPathOptionTokens.securities[securityToken]
              });
            }

            // Validator
            if (yagwPathOptionTokens.validator) {
              const validator = instanceOptions.validators
                  ? instanceOptions.validators[yagwPathOptionTokens.validator]
                  : undefined;

              if (!validator) throw new Error("Validator not found");
              doc.paths[pathUrl][pathMethod]["x-yc-apigateway-validator"] = {
                $ref: `#/components/x-yc-apigateway-validators/${yagwPathOptionTokens.validator}`
              };
            }

            // CORS
            if (yagwPathOptionTokens.cors) {
              const cors = instanceOptions.cors
                  ? instanceOptions.cors[yagwPathOptionTokens.cors]
                  : undefined;

              if (!cors) throw new Error("CORS not found");
              doc.paths[pathUrl][pathMethod]["x-yc-apigateway-cors"] = {
                $ref: `#/components/x-yc-apigateway-cors-rules/${yagwPathOptionTokens.cors}`
              };
            }
          }
        } else {
          // Delete document object if it does not exist in YAGW global storage
          delete doc.paths[pathUrl][pathMethod];
          if (!Object.keys(doc.paths[pathUrl]).length)
            delete doc.paths[pathUrl];
        }
      }

      // Delete unused schemas
      const jsonDoc = JSON.stringify(doc);
      for (let schemaName in doc.components.schemas) {
        if (!jsonDoc.includes(`#/components/schemas/${schemaName}`))
          delete doc.components.schemas[schemaName];
      }
    }

    // Websocket paths
    if(YagwGlobalStorage.websocketConfig){
      const {path, integrationToken} = YagwGlobalStorage.websocketConfig
      const wsPath:object = {}
      const integration = this._getIntegration(integrationToken)
      if(!integration || integration.type !== "http")
        throw new Error('Integration for websocket not found or has incorrect type');
      wsPath["parameters"] = [
        {
          "name": "token",
          "required": false,
          "in": "query",
          "schema": {
            "type": "string"
          }
        }
      ]
      for (let method of Object.values(YagwWebsocketMethodsEnum)){
        wsPath[`x-yc-apigateway-websocket-${method}`] = {
          "x-yc-apigateway-integration": {
            $ref: `#/components/x-yc-apigateway-integrations/${integrationToken}`,
            url: `${integration.url}/${globalPrefix ? globalPrefix + "/":""}${path}`
          }
        }
      }

      doc.paths = {
        [`/${globalPrefix ? globalPrefix + "/":""}${path}`]:wsPath,
        ...doc.paths
      }
    }

    // Extra paths from config
    if (this.options.extraPaths)
      doc.paths = {
        ...this.options.extraPaths,
        ...doc.paths
      };

    return doc;
  }
}