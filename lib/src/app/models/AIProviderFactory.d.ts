import { LanguageModel } from 'ai';
export declare class AIProviderFactory {
    static getLanguageModel(
        provider: string,
        modelName: string,
        apiKey: string,
    ): LanguageModel;
}
