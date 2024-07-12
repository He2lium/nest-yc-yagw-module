import {YagwOperationOptionsType} from "../types/yagw-operation-options.type";

class YagwStorage {
    private _methodOptions: {[operationId: string]: YagwOperationOptionsType}

    constructor() {
        this._methodOptions = {}
    }

    private _websocketConfig?:{path: string, integrationToken: string}

    public setWebsocketConfig(path:string, integrationToken: string) {
        this._websocketConfig = {path, integrationToken}
    }

    get websocketConfig(){
        return this._websocketConfig
    }

    public addMethodOptions(operationId: string, options: YagwOperationOptionsType){
        this._methodOptions[operationId] = options
    }

    public getMethodOptions(operationId: string){
        return this._methodOptions[operationId]
    }
}

const globalRef = global as any;
export const YagwGlobalStorage:YagwStorage = globalRef.YagwStorage || (globalRef.YagwStorage = new YagwStorage());