export interface YagwOperationOptionsType {
  integration?: string
  securities?: {[securityToken: string]:Array<string>}
  validator?: string
  cors?: string
}