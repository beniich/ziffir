"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const openai_1 = __importDefault(require("openai"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const redis_1 = require("../config/redis");
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
// Initialisation lazy pour éviter le crash si les clés sont absentes
let _openai = null;
let _anthropic = null;
const getOpenAI = () => {
    if (!_openai) {
        const key = process.env.OPENAI_API_KEY;
        if (!key || key.startsWith('sk-mock')) {
            throw new Error('OPENAI_API_KEY non configurée.');
        }
        _openai = new openai_1.default({ apiKey: key });
    }
    return _openai;
};
const getAnthropic = () => {
    if (!_anthropic) {
        const key = process.env.ANTHROPIC_API_KEY;
        if (!key) throw new Error('ANTHROPIC_API_KEY non configurée.');
        _anthropic = new sdk_1.default({ apiKey: key });
    }
    return _anthropic;
};

const SYSTEM_PROMPTS = {
    client: `Tu es l'assistant Zaphir, spécialisé dans l'hôtellerie de luxe.
Tu aides les clients avec :
- Le room service (suggestions de plats, régimes)
- Les activités de l'hôtel
- Les informations sur leur séjour
Réponds en français, sois concis et chaleureux. Maximum 200 mots par réponse.`,
    hotel: `Tu es l'assistant Zaphir pour les gérants d'hôtel.
Tu les aides avec :
- L'analyse des opérations (KPIs, tendances)
- Les suggestions d'optimisation (pricing, staffing)
- La résolution de problèmes opérationnels
Réponds en français, de manière professionnelle et data-driven. Maximum 250 mots.`,
    admin: `Tu es l'assistant Zaphir pour les administrateurs plateforme.
Tu les aides avec :
- L'analyse multi-hôtels
- Les insights business
- Les décisions stratégiques
Réponds en français, de manière concise et factuelle. Maximum 300 mots.`,
};
class AIService {
    /**
     * Chat avec contexte enrichi depuis la DB
     */
    static async chat(messages, context, options = {}) {
        // 1. Rate limiting par user
        const rateLimitKey = `ai:ratelimit:${context.userId}`;
        const current = await redis_1.redis.incr(rateLimitKey);
        if (current === 1)
            await redis_1.redis.expire(rateLimitKey, 60); // 1 min
        if (current > 20)
            throw new Error('Rate limit dépassé (20 req/min)');
        // 2. Enrichir le contexte avec données métier
        const enrichedMessages = await this.enrichContext(messages, context);
        // 3. Système prompt selon rôle
        const systemPrompt = SYSTEM_PROMPTS[context.userRole]
            || SYSTEM_PROMPTS.client;
        const finalMessages = [
            { role: 'system', content: systemPrompt },
            ...enrichedMessages,
        ];
        // 4. Appel API
        const provider = options.provider || (context.userRole === 'admin' ? 'anthropic' : 'openai');
        const startTime = Date.now();
        let response;
        if (provider === 'openai') {
            response = await this.callOpenAI(finalMessages);
        }
        else {
            response = await this.callAnthropic(finalMessages);
        }
        const duration = Date.now() - startTime;
        const cost = this.estimateCost(provider, response.tokens);
        // 5. Logger pour analytics
        logger_1.logger.info(`AI request completed: provider=${provider} tokens=${response.tokens} cost=${cost} userId=${context.userId} hotelId=${context.hotelId ?? 'n/a'}`);
        return { ...response, cost };
    }
    /**
     * Enrichit le contexte avec données spécifiques à l'hôtel/user
     */
    static async enrichContext(messages, context) {
        const lastUserMessage = messages[messages.length - 1];
        if (!lastUserMessage || lastUserMessage.role !== 'user')
            return messages;
        const userMessage = lastUserMessage.content.toLowerCase();
        let contextData = '';
        // Détection d'intent pour room service
        if (userMessage.includes('commander') || userMessage.includes('manger') || userMessage.includes('repas')) {
            const popular = await database_1.prisma.roomOrder.findMany({
                where: { hotelId: context.hotelId },
                include: { items: true },
                take: 20,
            });
            const topItems = popular.flatMap((o) => o.items).reduce((acc, item) => {
                acc[item.name] = (acc[item.name] || 0) + item.quantity;
                return acc;
            }, {});
            const top3 = Object.entries(topItems).sort((a, b) => b[1] - a[1]).slice(0, 3);
            contextData += `\n\nPlats populaires dans cet hôtel: ${top3.map(([name]) => name).join(', ')}.`;
        }
        // Détection d'intent pour activités
        if (userMessage.includes('activité') || userMessage.includes('faire')) {
            contextData += `\n\nL'hôtel propose: spa, dégustations de vin, cours de cuisine, excursions culturelles.`;
        }
        if (contextData) {
            return [
                ...messages.slice(0, -1),
                { ...lastUserMessage, content: lastUserMessage.content + contextData },
            ];
        }
        return messages;
    }
    static async callOpenAI(messages) {
        const completion = await getOpenAI().chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            max_tokens: 500,
            temperature: 0.7,
        });
        return {
            content: completion.choices[0].message.content || '',
            tokens: completion.usage?.total_tokens || 0,
        };
    }
    static async callAnthropic(messages) {
        const systemMsg = messages.find((m) => m.role === 'system');
        const convMessages = messages.filter((m) => m.role !== 'system');
        const response = await getAnthropic().messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 500,
            system: systemMsg?.content || '',
            messages: convMessages,
        });
        const textBlock = response.content.find((b) => b.type === 'text');
        return {
            content: textBlock && 'text' in textBlock ? textBlock.text : '',
            tokens: response.usage.input_tokens + response.usage.output_tokens,
        };
    }
    static estimateCost(provider, tokens) {
        const rates = {
            openai: 0.00015 / 1000, // gpt-4o-mini
            anthropic: 0.003 / 1000, // claude-3-5-sonnet
        };
        return tokens * (rates[provider] || 0);
    }
    // ════════════════════════════════════════════════════════════
    // SUGGESTIONS AUTOMATIQUES
    // ════════════════════════════════════════════════════════════
    static async suggestOrderImprovements(hotelId) {
        const orders = await database_1.prisma.roomOrder.findMany({
            where: { hotelId, createdAt: { gte: new Date(Date.now() - 7 * 86400_000) } },
            include: { items: true },
        });
        const prompt = `Analyse ces données de commandes et propose 3 améliorations concrètes:
${JSON.stringify(orders.slice(0, 50), null, 2)}

Réponds en français, format JSON: [{title, description, impact}]`;
        const response = await getOpenAI().chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 600,
        });
        return response.choices[0].message.content || '';
    }
    static async generateWelcomeMessage(guestName, hotelName) {
        const response = await getOpenAI().chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                    role: 'user',
                    content: `Génère un message de bienvenue personnalisé (max 100 mots) pour ${guestName} séjournant à l'hôtel ${hotelName}. Ton chaleureux et luxueux.`,
                }],
            max_tokens: 150,
        });
        return response.choices[0].message.content || '';
    }
}
exports.AIService = AIService;
//# sourceMappingURL=ai.service.js.map