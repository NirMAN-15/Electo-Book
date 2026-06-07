interface GetAIAdviceRequest {
    meterId: string;
    meterState: any;
    settings?: any;
    alarms?: any[];
}
export declare const getAIAdvice: import("firebase-functions/v2/https").CallableFunction<GetAIAdviceRequest, Promise<{
    advice: string;
}>, unknown>;
export {};
//# sourceMappingURL=getAIAdvice.d.ts.map