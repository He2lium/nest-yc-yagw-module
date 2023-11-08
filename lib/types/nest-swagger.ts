export namespace YAGWTypes {

  export interface JWTSecuritySchema {
    type: "openIdConnect"
    openIdConnectUrl: string
    "x-yc-apigateway-authorizer":{
      type: "jwt"
      jwksUri?: string,
      identitySource: {
        in: "header" | "query" | "cookie",
        name: string,
        prefix?: string
      }
      issuers?: string[],
      audiences?: string[],
      requiredClaims?: string[],
      authorizer_result_ttl_in_seconds?: number,
      authorizer_result_caching_mode?: "path" | "uri",
      jwkTtlInSeconds?: number
    }
  }

  export interface FunctionSecuritySchema {
    type: "http"
    scheme: "basic"
    "x-yc-apigateway-authorizer":{
      type: "function",
      function_id: string,
      tag?: string,
      service_account_id: string
      authorizer_result_ttl_in_seconds?: number
    }
  }

  export interface Validator {
    "validateRequestBody"?: boolean,
    "validateRequestParameters"?: boolean,
    "validateResponseBody"?: boolean,
    "validateResponseHeaders"?: "any" | "superset" | "subset" | "exact",
  }

  export interface CORS{
    origin: string | string[] | boolean
    method?: string | string[]
    allowedHeaders?: string | string[]
    exposedHeaders?: string | string[]
    credentials?: boolean
    maxAge?: number,
    optionsSuccessStatus?: number
  }

  export interface CloudFunctionContext {
    UserDataURL: string,
    issuer: string,
    audience: string,
    refresh?: boolean
  }

  export interface CloudFunctionIntegration {
    type: "cloud_functions",
    function_id: string,
    tag?: string
    service_account_id: string,
    context?: CloudFunctionContext,
    payload_format_version?: "0.1" | "1.0"
  }

  export interface HttpIntegration {
    type: "http",
    url: string,
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS",
    headers?: {[key: string]:string|string[]}
    query?: {[key: string]:string|string[]}
    timeouts?: {
      read?: number,
      connect?: number
    }
    omitEmptyHeaders?: boolean,
    omitEmptyQueryParameters?: boolean
  }
}