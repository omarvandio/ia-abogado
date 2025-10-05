import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Mic, Video, Phone } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getAbogaResponse } from '../lib/abogaAssistant';
import type { Database } from '../lib/supabase';

type Message = Database['public']['Tables']['chat_messages']['Row'];

const MAX_FREE_MESSAGES = 10;

export function Chat() {
  const { user, isAnonymous } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initSession();
  }, [user, isAnonymous]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initSession = async () => {
    const savedSessionId = localStorage.getItem('aboga_session_id');

    if (savedSessionId) {
      const { data } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', savedSessionId)
        .maybeSingle();

      if (data) {
        setSessionId(data.id);
        setMessageCount(data.message_count);
        loadMessages(data.id);
        return;
      }
    }

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: user?.id || null,
        title: 'Nueva consulta',
      })
      .select()
      .single();

    if (!error && data) {
      setSessionId(data.id);
      localStorage.setItem('aboga_session_id', data.id);
    }
  };

  const loadMessages = async (sessionId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionId || loading) return;

    if (!user && messageCount >= MAX_FREE_MESSAGES) {
      setShowLimitWarning(true);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    const tempUserMsg: Message = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      role: 'user',
      content: userMessage,
      structured_response: null,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: 'user',
        content: userMessage,
      });

      const abogaResponse = await getAbogaResponse(userMessage);

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        session_id: sessionId,
        role: 'assistant',
        content: abogaResponse.resumen_corto,
        structured_response: abogaResponse,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: 'assistant',
        content: abogaResponse.resumen_corto,
        structured_response: abogaResponse,
      });

      const newCount = messageCount + 2;
      setMessageCount(newCount);

      await supabase
        .from('chat_sessions')
        .update({
          message_count: newCount,
          title: userMessage.slice(0, 50),
        })
        .eq('id', sessionId);

      if (!user && newCount >= MAX_FREE_MESSAGES - 2) {
        setShowLimitWarning(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">ABOGA</h2>
            <p className="text-gray-600 mb-6">
              Asistente legal informativo para trámites en Perú
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              <button
                onClick={() => setInput('Necesito una carta notarial de requerimiento')}
                className="text-left p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="font-medium text-gray-900">Carta notarial</div>
                <div className="text-sm text-gray-500">Requerimiento formal</div>
              </button>
              <button
                onClick={() => setInput('Quiero presentar denuncia por usurpación')}
                className="text-left p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="font-medium text-gray-900">Denuncia</div>
                <div className="text-sm text-gray-500">Usurpación de inmueble</div>
              </button>
              <button
                onClick={() => setInput('Necesito información sobre desalojo')}
                className="text-left p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="font-medium text-gray-900">Desalojo</div>
                <div className="text-sm text-gray-500">Ocupación precaria</div>
              </button>
              <button
                onClick={() => setInput('¿Cómo consulto una partida registral en SUNARP?')}
                className="text-left p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="font-medium text-gray-900">SUNARP</div>
                <div className="text-sm text-gray-500">Búsqueda de partida</div>
              </button>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            structuredResponse={msg.structured_response}
          />
        ))}

        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center">
              <Loader2 className="animate-spin mr-2" size={20} />
              <span className="text-gray-600">Analizando...</span>
            </div>
          </div>
        )}

        {showLimitWarning && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-blue-900 mb-2">
              Has alcanzado el límite de consultas gratuitas ({MAX_FREE_MESSAGES} mensajes)
            </p>
            <p className="text-sm text-blue-700">
              Regístrate para continuar consultando o solicita asesoría con un abogado
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-2 mb-2">
          <button
            className="p-2 text-gray-400 hover:text-gray-600 transition"
            title="Audio (próximamente)"
          >
            <Mic size={20} />
          </button>
          <button
            className="p-2 text-gray-400 hover:text-gray-600 transition"
            title="Video (próximamente)"
          >
            <Video size={20} />
          </button>
          <button
            className="p-2 text-gray-400 hover:text-gray-600 transition"
            title="Llamar abogado (próximamente)"
          >
            <Phone size={20} />
          </button>
          <div className="text-xs text-gray-500 ml-2">
            Próximamente: audio, video y consulta telefónica
          </div>
        </div>

        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe tu consulta legal..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </div>

        {!user && (
          <div className="text-xs text-gray-500 mt-2 text-center">
            {messageCount}/{MAX_FREE_MESSAGES} consultas gratuitas usadas
          </div>
        )}
      </div>
    </div>
  );
}
