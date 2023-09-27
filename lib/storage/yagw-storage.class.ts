import {YagwOperationOptionsType} from "../types/yagw-operation-options.type";

class YagwStorage {
    private methodOptions: {[operationId: string]: YagwOperationOptionsType}

    constructor() {
        this.methodOptions = {}
    }

    public addMethodOptions(operationId: string, options: YagwOperationOptionsType){
        this.methodOptions[operationId] = options
    }

    public getMethodOptions(operationId: string){
        return this.methodOptions[operationId]
    }
}

const globalRef = global as any;
export const YagwGlobalStorage = globalRef.YagwStorage || (globalRef.YagwStorage = new YagwStorage());