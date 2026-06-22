import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { redis } from '../config/redis';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatContext {
  userId: string;
  hotelId?: string;
  userRole: string;
}

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

export class AIService {
  /**
   * Chat avec contexte enrichi depuis la DB
   */
  static async chat(
    messages: ChatMessage[],
    context: ChatContext,
    options: { provider?: 'openai' | 'anthropic'; stream?: boolean } = {}
  ): Promise<{ content: string; tokens: number; cost: number }> {
    // 1. Rate limiting par user
    const rateLimitKey = `ai:ratelimit:${context.userId}`;
    const current = await redis.incr(rateLimitKey);
    if (current === 1) await redis.expire(rateLimitKey, 60); // 1 min
    if (current > 20) throw new Error('Rate limit dépassé (20 req/min)');

    // 2. Enrichir le contexte avec données métier
    const enrichedMessages = await this.enrichContext(messages, context);

    // 3. Système prompt selon rôle
    const systemPrompt = SYSTEM_PROMPTS[context.userRole as keyof typeof SYSTEM_PROMPTS]
      || SYSTEM_PROMPTS.client;

    const finalMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...enrichedMessages,
    ];

    // 4. Appel API
    const provider = options.provider || (context.userRole === 'admin' ? 'anthropic' : 'openai');
    const startTime = Date.now();

    let response: { content: string; tokens: number };
    if (provider === 'openai') {
      response = await this.callOpenAI(finalMessages);
    } else {
      response = await this.callAnthropic(finalMessages);
    }

    const duration = Date.now() - startTime;
    const cost = this.estimateCost(provider, response.tokens);

    // 5. Logger pour analytics
    logger.info(`AI request completed: provider=${provider} tokens=${response.tokens} cost=${cost} userId=${context.userId} hotelId=${context.hotelId ?? 'n/a'}`);

    return { ...response, cost };
  }

  /**
   * Enrichit le contexte avec données spécifiques à l'hôtel/user
   */
  private static async enrichContext(messages: ChatMessage[], context: ChatContext): Promise<ChatMessage[]> {
    const lastUserMessage = messages[messages.length - 1];
    if (!lastUserMessage || lastUserMessage.role !== 'user') return messages;

    const userMessage = lastUserMessage.content.toLowerCase();
    let contextData = '';

    // Détection d'intent pour room service
    if (userMessage.includes('commander') || userMessage.includes('manger') || userMessage.includes('repas')) {
      const popular = await prisma.roomOrder.findMany({
        where: { hotelId: context.hotelId },
        include: { items: true },
        take: 20,
      });
      const topItems = popular.flatMap((o) => o.items).reduce((acc: any, item) => {
        acc[item.name] = (acc[item.name] || 0) + item.quantity;
        return acc;
      }, {});
      const top3 = Object.entries(topItems).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3);
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

  private static async callOpenAI(messages: ChatMessage[]): Promise<{ content: string; tokens: number }> {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any,
      max_tokens: 500,
      temperature: 0.7,
    });

    return {
      content: completion.choices[0].message.content || '',
      tokens: completion.usage?.total_tokens || 0,
    };
  }

  private static async callAnthropic(messages: ChatMessage[]): Promise<{ content: string; tokens: number }> {
    const systemMsg = messages.find((m) => m.role === 'system');
    const convMessages = messages.filter((m) => m.role !== 'system');

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      system: systemMsg?.content || '',
      messages: convMessages as any,
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    return {
      content: textBlock && 'text' in textBlock ? textBlock.text : '',
      tokens: response.usage.input_tokens + response.usage.output_tokens,
    };
  }

  private static estimateCost(provider: string, tokens: number): number {
    const rates: Record<string, number> = {
      openai: 0.00015 / 1000, // gpt-4o-mini
      anthropic: 0.003 / 1000, // claude-3-5-sonnet
    };
    return tokens * (rates[provider] || 0);
  }

  // ════════════════════════════════════════════════════════════
  // SUGGESTIONS AUTOMATIQUES
  // ════════════════════════════════════════════════════════════

  static async suggestOrderImprovements(hotelId: string): Promise<string> {
    const orders = await prisma.roomOrder.findMany({
      where: { hotelId, createdAt: { gte: new Date(Date.now() - 7 * 86400_000) } },
      include: { items: true },
    });

    const prompt = `Analyse ces données de commandes et propose 3 améliorations concrètes:
${JSON.stringify(orders.slice(0, 50), null, 2)}

Réponds en français, format JSON: [{title, description, impact}]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
    });

    return response.choices[0].message.content || '';
  }

  static async generateWelcomeMessage(guestName: string, hotelName: string): Promise<string> {
    const response = await openai.chat.completions.create({
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
