interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
interface ChatContext {
    userId: string;
    hotelId?: string;
    userRole: string;
}
export declare class AIService {
    /**
     * Chat avec contexte enrichi depuis la DB
     */
    static chat(messages: ChatMessage[], context: ChatContext, options?: {
        provider?: 'openai' | 'anthropic';
        stream?: boolean;
    }): Promise<{
        content: string;
        tokens: number;
        cost: number;
    }>;
    /**
     * Enrichit le contexte avec données spécifiques à l'hôtel/user
     */
    private static enrichContext;
    private static callOpenAI;
    private static callAnthropic;
    private static estimateCost;
    static suggestOrderImprovements(hotelId: string): Promise<string>;
    static generateWelcomeMessage(guestName: string, hotelName: string): Promise<string>;
}
export {};
//# sourceMappingURL=ai.service.d.ts.map