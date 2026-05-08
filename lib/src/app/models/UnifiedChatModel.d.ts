import {
    ChatSendOptions,
    IChatModel,
    Message,
    ModelMessage,
} from '@microsoft/teams.ai';
import { LanguageModel } from 'ai';
export declare class UnifiedChatModel implements IChatModel {
    private aiModel;
    constructor(aiModel: LanguageModel);
    send(input: Message, options?: ChatSendOptions): Promise<ModelMessage>;
    private mapToCoreMessage;
}
