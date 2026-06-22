import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { api } from '../../shared/api/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Bonjour ! Je suis votre assistant Zaphir. Comment puis-je vous aider ?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const { data } = await api.ai.chat([...messages, { role: 'user', content: userMessage }]);
      setMessages((m) => [...m, { role: 'assistant', content: data.data.content }]);
    } catch (err: any) {
      setMessages((m) => [...m, { role: 'assistant', content: `❌ Erreur: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shadow-glow-gold flex items-center justify-center z-50 hover:scale-110 transition-transform"
      >
        <Bot className="w-6 h-6 text-slate-950" />
      </button>
    );
  }

  return (
    <Card variant="glass-strong" className="fixed bottom-6 right-6 w-96 h-[600px] flex flex-col z-50 animate-slide-up">
      <header className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100">Assistant Zaphir</h3>
            <Badge variant="cyber" size="sm">IA</Badge>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-100">
          <X className="w-5 h-5" />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-slate-950" />
              </div>
            )}
            <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-amber-500/20 text-amber-100' : 'bg-slate-800 text-slate-100'}`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                <UserIcon className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-slate-950 animate-pulse" />
            </div>
            <div className="bg-slate-800 p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-700/50 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && send()}
          placeholder="Posez votre question..."
          fullWidth
        />
        <Button onPress={send} disabled={!input.trim() || loading} variant="primary" icon={<Send className="w-4 h-4" />}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
