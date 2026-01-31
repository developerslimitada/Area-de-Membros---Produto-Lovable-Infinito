import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Bot, User, Trash2, RefreshCw, ArrowLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getLoggedUser } from '../supabaseStore';
import { motion, AnimatePresence } from 'framer-motion';

interface SupportMessage {
    id: string;
    user_id: string | null;
    content: string;
    is_bot: boolean | null;
    is_admin: boolean | null;
    created_at: string | null;
}

interface UserConversation {
    user_id: string;
    user_name: string;
    user_email: string;
    user_avatar: string | null;
    messages: SupportMessage[];
    lastMessage: SupportMessage;
    unreadCount: number;
    hasAdminReply: boolean;
}

const AdminSupport: React.FC = () => {
    const [conversations, setConversations] = useState<UserConversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<UserConversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentUser = getLoggedUser();

    useEffect(() => {
        loadConversations();

        // Real-time subscription
        const subscription = supabase
            .channel('support_messages_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_messages' }, () => {
                loadConversations();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedConversation?.messages]);

    const loadConversations = async () => {
        try {
            setLoading(true);

            // Carregar todas as mensagens
            const { data: messages, error } = await supabase
                .from('support_messages')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Carregar profiles para pegar nomes
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, name, email, avatar');

            // Agrupar mensagens por user_id
            const conversationsMap = new Map<string, SupportMessage[]>();

            messages?.forEach(msg => {
                // Pegar o user_id real (não do admin)
                if (msg.user_id && !msg.is_admin) {
                    const existing = conversationsMap.get(msg.user_id) || [];
                    existing.push(msg);
                    conversationsMap.set(msg.user_id, existing);
                } else if (msg.user_id && msg.is_admin) {
                    // Adicionar resposta do admin na conversa do usuário que está sendo respondido
                    // Procurar a qual usuário essa resposta pertence
                    // Por enquanto, vamos associar pela sequência temporal
                }
            });

            // Para cada usuário que mandou mensagem, criar uma conversa
            const userIds = [...new Set(messages?.filter(m => !m.is_admin && !m.is_bot && m.user_id).map(m => m.user_id) || [])];

            const convs: UserConversation[] = userIds.map(userId => {
                const userProfile = profiles?.find(p => p.id === userId);
                const userMessages = messages?.filter(m => m.user_id === userId) || [];

                // Pegar todas as mensagens relacionadas a este usuário (incluindo respostas admin)
                const allMessagesForUser = messages?.filter(m =>
                    m.user_id === userId ||
                    (m.is_admin && userMessages.some(um => new Date(m.created_at || 0) > new Date(um.created_at || 0)))
                ) || [];

                // Ordenar cronologicamente
                allMessagesForUser.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());

                const lastMsg = allMessagesForUser[allMessagesForUser.length - 1];
                const hasAdminReply = allMessagesForUser.some(m => m.is_admin);
                const unreadCount = allMessagesForUser.filter(m => !m.is_admin && !m.is_bot).length;

                return {
                    user_id: userId as string,
                    user_name: userProfile?.name || 'Usuário',
                    user_email: userProfile?.email || '',
                    user_avatar: userProfile?.avatar,
                    messages: userMessages,
                    lastMessage: lastMsg,
                    unreadCount,
                    hasAdminReply
                };
            }).filter(c => c.messages.length > 0);

            // Ordenar por última mensagem
            convs.sort((a, b) => new Date(b.lastMessage?.created_at || 0).getTime() - new Date(a.lastMessage?.created_at || 0).getTime());

            setConversations(convs);

            // Atualizar conversa selecionada se existir
            if (selectedConversation) {
                const updated = convs.find(c => c.user_id === selectedConversation.user_id);
                if (updated) setSelectedConversation(updated);
            }
        } catch (err) {
            console.error('Error loading conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            setSending(true);
            const { error } = await supabase
                .from('support_messages')
                .insert([{
                    user_id: selectedConversation.user_id,
                    content: newMessage,
                    is_admin: true,
                    is_bot: false
                }]);

            if (error) throw error;
            setNewMessage('');
            await loadConversations();
        } catch (err) {
            console.error('Error sending message:', err);
            alert('Erro ao enviar mensagem');
        } finally {
            setSending(false);
        }
    };

    const deleteMessage = async (id: string) => {
        if (!window.confirm('Excluir esta mensagem?')) return;

        try {
            const { error } = await supabase
                .from('support_messages')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await loadConversations();
        } catch (err) {
            console.error('Error deleting message:', err);
            alert('Erro ao excluir mensagem');
        }
    };

    const stats = {
        total: conversations.reduce((acc, c) => acc + c.messages.length, 0),
        conversations: conversations.length,
        pending: conversations.filter(c => !c.hasAdminReply).length,
        answered: conversations.filter(c => c.hasAdminReply).length
    };

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return 'Agora';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
        return date.toLocaleDateString('pt-BR');
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">Suporte</h1>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Conversas com Alunos</p>
                </div>
                <button
                    onClick={loadConversations}
                    className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] active:scale-95 shrink-0"
                >
                    <RefreshCw size={18} strokeWidth={3} />
                    Atualizar
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Mensagens', value: stats.total, icon: MessageCircle, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                    { label: 'Conversas', value: stats.conversations, icon: User, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                    { label: 'Aguardando', value: stats.pending, icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                    { label: 'Respondidas', value: stats.answered, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-[#0f0f13] border border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-xl">
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white">{stat.value}</p>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="bg-[#0f0f13] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden" style={{ height: 'calc(100vh - 420px)', minHeight: '500px' }}>
                <div className="flex h-full">
                    {/* Conversations List */}
                    <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-96 border-r border-white/5 flex flex-col`}>
                        <div className="p-4 border-b border-white/5">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Conversas</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                    <MessageCircle size={48} className="text-slate-700 mb-4" />
                                    <p className="text-slate-600 font-bold text-sm">Nenhuma conversa ainda</p>
                                    <p className="text-slate-700 text-xs mt-1">Quando um aluno enviar uma mensagem, aparecerá aqui</p>
                                </div>
                            ) : (
                                conversations.map((conv) => (
                                    <button
                                        key={conv.user_id}
                                        onClick={() => setSelectedConversation(conv)}
                                        className={`w-full p-4 flex items-start gap-3 hover:bg-white/5 transition-all border-b border-white/5 text-left ${selectedConversation?.user_id === conv.user_id ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500' : ''}`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                                            {conv.user_avatar ? (
                                                <img src={conv.user_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                conv.user_name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-bold text-white text-sm truncate">{conv.user_name}</span>
                                                <span className="text-[10px] text-slate-500 shrink-0">{formatTime(conv.lastMessage?.created_at)}</span>
                                            </div>
                                            <p className="text-xs text-slate-400 truncate mt-1">{conv.lastMessage?.content}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                {!conv.hasAdminReply ? (
                                                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[9px] font-bold uppercase rounded-full">Aguardando</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase rounded-full">Respondida</span>
                                                )}
                                                <span className="text-[10px] text-slate-600">{conv.messages.length} msg</span>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`${selectedConversation ? 'block' : 'hidden md:flex'} flex-1 flex flex-col`}>
                        {selectedConversation ? (
                            <>
                                {/* Header */}
                                <div className="p-4 border-b border-white/5 flex items-center gap-4">
                                    <button
                                        onClick={() => setSelectedConversation(null)}
                                        className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-all"
                                    >
                                        <ArrowLeft size={20} className="text-slate-400" />
                                    </button>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                        {selectedConversation.user_avatar ? (
                                            <img src={selectedConversation.user_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            selectedConversation.user_name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{selectedConversation.user_name}</p>
                                        <p className="text-xs text-slate-500">{selectedConversation.user_email}</p>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    <AnimatePresence>
                                        {selectedConversation.messages.map((msg) => (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className={`flex gap-3 ${msg.is_admin ? 'flex-row-reverse' : 'flex-row'}`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.is_bot ? 'bg-yellow-500/20 text-yellow-400' :
                                                        msg.is_admin ? 'bg-purple-500/20 text-purple-400' :
                                                            'bg-emerald-500/20 text-emerald-400'
                                                    }`}>
                                                    {msg.is_bot ? <Bot size={16} /> : <User size={16} />}
                                                </div>
                                                <div className={`flex-1 max-w-[75%] ${msg.is_admin ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                                    <div className={`px-4 py-3 rounded-2xl ${msg.is_admin ? 'bg-purple-600/20 border border-purple-500/20' :
                                                            msg.is_bot ? 'bg-yellow-600/20 border border-yellow-500/20' :
                                                                'bg-white/5 border border-white/5'
                                                        }`}>
                                                        <p className="text-sm text-white">{msg.content}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 px-1">
                                                        <span className="text-[10px] text-slate-600">
                                                            {new Date(msg.created_at || '').toLocaleString('pt-BR')}
                                                        </span>
                                                        <button
                                                            onClick={() => deleteMessage(msg.id)}
                                                            className="p-1 text-slate-700 hover:text-red-400 transition-all rounded"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="p-4 border-t border-white/5 bg-[#0a0a0f]/50">
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && !sending && sendMessage()}
                                            placeholder="Digite sua resposta..."
                                            className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white text-sm"
                                            disabled={sending}
                                        />
                                        <button
                                            onClick={sendMessage}
                                            disabled={sending || !newMessage.trim()}
                                            className="px-6 py-3 bg-indigo-600 text-white font-bold text-xs uppercase rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <Send size={16} />
                                            Enviar
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <MessageCircle size={64} className="text-slate-700 mb-4" />
                                <p className="text-slate-500 font-bold">Selecione uma conversa</p>
                                <p className="text-slate-600 text-sm mt-1">Escolha um aluno para ver o histórico de mensagens</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSupport;
