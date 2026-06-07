interface SendBillEmailRequest {
    meterId: string;
    billId: string;
}
export declare const sendBillEmail: import("firebase-functions/v2/https").CallableFunction<SendBillEmailRequest, Promise<{
    success: boolean;
    message: string;
}>, unknown>;
export {};
//# sourceMappingURL=sendBillEmail.d.ts.map