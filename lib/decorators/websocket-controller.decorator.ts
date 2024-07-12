import { Controller, ControllerOptions } from "@nestjs/common";
import { YagwGlobalStorage } from "../storage/yagw-storage.class";

export const YagwWebsocketController = (path: string, integrationToken: string)=>{
  YagwGlobalStorage.setWebsocketConfig(path, integrationToken)
  return Controller(path)
}