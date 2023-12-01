import {Injectable} from '@nestjs/common';
import {YagwModuleOptionsType} from "./types/yagw-module-options.type";
import {InjectYagwOptions} from "./decorators/inject-yagw-options.decorator";
import {OpenAPIObject} from "@nestjs/swagger";
import {YagwGlobalStorage} from "./storage/yagw-storage.class";
import {YagwOperationOptionsType} from "./types/yagw-operation-options.type";

@Injectable()
export class YagwService {
    constructor(@InjectYagwOptions() private options: YagwModuleOptionsType) {
    }

    public postProcessing(originalDocument: OpenAPIObject) {
        let doc = originalDocument as OpenAPIObject & any;
        const instanceOptions = this.options

        /**
         * Add Components
         */
        if (!doc.components) doc.components = {}

        // Add security schemas
        for (let securitySchemaToken in instanceOptions.securities) {
            if (!doc.components.securitySchemes) doc.components.securitySchemes = {}
            doc.components.securitySchemes[securitySchemaToken] = instanceOptions.securities[securitySchemaToken]
        }

        // Add validators
        for (let validatorSchemaToken in instanceOptions.validators) {
            if (!doc.components["x-yc-apigateway-validators"]) doc.components["x-yc-apigateway-validators"] = {}
            doc.components["x-yc-apigateway-validators"][validatorSchemaToken] = instanceOptions.validators[validatorSchemaToken]
        }

        // Add CORS rules
        for (let corsSchemaToken in instanceOptions.cors) {
            if (!doc.components["x-yc-apigateway-cors-rules"]) doc.components["x-yc-apigateway-cors-rules"] = {}
            doc.components["x-yc-apigateway-cors-rules"][corsSchemaToken] = instanceOptions.cors[corsSchemaToken]
        }

        /**
         * Add global options
         */

        // Add servers
        if (!instanceOptions.servers.length) throw new Error('Servers are required')
        for (let serverUrl of instanceOptions.servers)
            doc.servers.push({url: serverUrl})

        // Add global CORS
        if (!doc["x-yc-apigateway"]) doc["x-yc-apigateway"] = {}
        if (instanceOptions.globalCORSToken) {
            doc["x-yc-apigateway"]["cors"] = {"$ref": `#/components/x-yc-apigateway-cors-rules/${instanceOptions.globalCORSToken}`}
        }

        // Add global validator
        if (instanceOptions.globalValidatorToken) {
            doc["x-yc-apigateway"]["validator"] = {"$ref": `#/components/x-yc-apigateway-validators/${instanceOptions.globalValidatorToken}`}
        }

        /**
         * Add options by path
         */

        // Document objects by path
        for (let pathUrl of Object.keys(doc.paths)) {

            // Document objects by method
            for (let pathMethod of Object.keys(doc.paths[pathUrl])) {

                // Get document operation ID
                const pathOperationId = doc.paths[pathUrl][pathMethod].operationId

                // Looking for operation ID in YAGW global storage
                const yagwPathOptionTokens: YagwOperationOptionsType = YagwGlobalStorage.getMethodOptions(pathOperationId)
                if (yagwPathOptionTokens) {
                    // Websocket methods by path
                    if (yagwPathOptionTokens.websocket) {
                        delete doc.paths[pathUrl][pathMethod]
                        const integration =
                            instanceOptions.integrations ?
                                instanceOptions.integrations[yagwPathOptionTokens.websocket.integration]
                                :
                                undefined
                        doc.paths[pathUrl][`x-yc-apigateway-websocket-${yagwPathOptionTokens.websocket.type}`] =
                            {"x-yc-apigateway-integration": integration}
                    } else {
                        // Responses
                        if (doc.paths[pathUrl][pathMethod].responses) {
                            for (let status in doc.paths[pathUrl][pathMethod].responses) {
                                doc.paths[pathUrl][pathMethod].responses[status].description =
                                    "Response" + doc.paths[pathUrl][pathMethod].responses[status].description
                            }
                        }

                        // Integration
                        if (yagwPathOptionTokens.integration) {
                            const integration =
                                instanceOptions.integrations ?
                                    instanceOptions.integrations[yagwPathOptionTokens.integration]
                                    :
                                    undefined

                            switch (integration?.type) {
                                case "cloud_functions":
                                    doc.paths[pathUrl][pathMethod]['x-yc-apigateway-integration'] = integration
                                    break;
                                case "http":
                                    doc.paths[pathUrl][pathMethod]['x-yc-apigateway-integration'] = {
                                        ...integration,
                                        url: `${integration.url}${pathUrl}`
                                    }
                                    break;
                                default:
                                    throw new Error(`Incorrect integration type`)

                            }
                        }


                        // Securities
                        for (let securityToken in yagwPathOptionTokens.securities) {

                            // Get integration source object from module instance
                            const security = instanceOptions.securities ?
                                instanceOptions.securities[securityToken]
                                :
                                undefined

                            if (!security) throw new Error('Security not found')

                            // Add path security if it does not exist
                            if (!doc.paths[pathUrl][pathMethod].security) doc.paths[pathUrl][pathMethod].security = []

                            // Add security
                            doc.paths[pathUrl][pathMethod].security.push({
                                [`${securityToken}`]: yagwPathOptionTokens.securities[securityToken]
                            })
                        }

                        // Validator
                        if (yagwPathOptionTokens.validator) {
                            const validator = instanceOptions.validators ?
                                instanceOptions.validators[yagwPathOptionTokens.validator]
                                :
                                undefined

                            if (!validator) throw new Error('Validator not found')
                            doc.paths[pathUrl][pathMethod]["x-yc-apigateway-validator"] = {
                                "$ref": `#/components/x-yc-apigateway-validators/${yagwPathOptionTokens.validator}`
                            }
                        }

                        // CORS
                        if (yagwPathOptionTokens.cors) {
                            const cors = instanceOptions.cors ?
                                instanceOptions.cors[yagwPathOptionTokens.cors]
                                :
                                undefined

                            if (!cors) throw new Error('CORS not found')
                            doc.paths[pathUrl][pathMethod]["x-yc-apigateway-cors"] = {
                                "$ref": `#/components/x-yc-apigateway-cors-rules/${yagwPathOptionTokens.cors}`
                            }
                        }
                    }


                } else {

                    // Delete document object if it does not exist in YAGW global storage
                    delete doc.paths[pathUrl][pathMethod]
                    if (!Object.keys(doc.paths[pathUrl]).length) delete doc.paths[pathUrl]
                }
            }

            // Delete unused schemas
            const jsonDoc = JSON.stringify(doc)
            for (let schemaName in doc.components.schemas) {
                if (!jsonDoc.includes(`#/components/schemas/${schemaName}`))
                    delete doc.components.schemas[schemaName]
            }
        }

        return doc;
    }
}
