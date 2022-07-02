export class ChatsApiError extends Error {
    public code: number;

    constructor(message: string = 'Server Error', code: number = 500) {
        super(message);

        this.code = code;
    }
}