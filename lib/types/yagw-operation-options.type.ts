
export enum WebsocketOperationType {
  connect = "connect",
  message = "message",
  disconnect = "disconnect"
}

export interface YagwOperationOptionsType {
  integration?: string
  securities?: {[securityToken: string]:Array<string>}
  validator?: string
  cors?: string,
  websocket?: {
    type: WebsocketOperationType,
    integration: string
  }
}