import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Send, Bot, User, Trash2, RefreshCw, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
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
    // Ref para evitar stale closure no loadConversations
    const selectedConvRef = useRef<UserConversation | null>(null);

    // Manter ref sincronizado com o estado
    useEffect(() => {
        selectedConvRef.current = selectedConversation;
    }, [selectedConversation]);

    // Auto-scroll quando mensagens mudam
    useEffect(() => {
        if (selectedConversation) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 50);
        }
    }, [selectedConversation?.messages.length]);

    const loadConversations = useCallback(async () => {
        try {
            setLoading(true);

            const { data: messages, error } = await supabase
                .from('support_messages')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;

            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, name, email, avatar');

            // IDs únicos de usuários que enviaram mensagens (não admin, não bot)
            const userIds = [...new Set(
                messages?.filter(m => !m.is_admin && !m.is_bot && m.user_id).map(m => m.user_id) || []
            )];

            const convs: UserConversation[] = userIds.map(userId => {
                const userProfile = profiles?.find(p => p.id === userId);

                // CORREÇÃO PRINCIPAL: filtrar mensagens pelo user_id correto
                // Mensagens do aluno: user_id === userId, is_admin = false
                // Mensagens admin para este aluno: user_id === userId, is_admin = true
                // Dessa forma cada conversa só tem suas próprias mensagens
                const allMessagesForUser = (messages || []).filter(m => m.user_id === userId);

                allMessagesForUser.sort((a, b) =>
                    new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
                );

                const lastMsg = allMessagesForUser[allMessagesForUser.length - 1];
                const hasAdminReply = allMessagesForUser.some(m => m.is_admin);
                const unreadCount = allMessagesForUser.filter(m => !m.is_admin && !m.is_bot).length;

                return {
                    user_id: userId as string,
                    user_name: userProfile?.name || 'Usuário',
                    user_email: userProfile?.email || '',
                    user_avatar: userProfile?.avatar,
                    messages: allMessagesForUser,
                    lastMessage: lastMsg,
                    unreadCount,
                    hasAdminReply
                };
            }).filter(c => {
                const isEscalated = c.messages.some(m => m.is_bot && m.content.includes('fila de espera'));
                return isEscalated || c.hasAdminReply;
            });

            convs.sort((a, b) =>
                new Date(b.lastMessage?.created_at || 0).getTime() - new Date(a.lastMessage?.created_at || 0).getTime()
            );

            if (convs.length === 0) {
                const demoConversations: UserConversation[] = [
                    {
                        user_id: 'demo-1',
                        user_name: 'Maria Silva',
                        user_email: 'maria@email.com',
                        user_avatar: null,
                        messages: [
                            { id: 'msg-1', user_id: 'demo-1', content: 'Olá! Estou com dificuldade para acessar o módulo 3 do curso. Podem me ajudar?', is_bot: false, is_admin: false, created_at: new Date(Date.now() - 3600000).toISOString() },
                            { id: 'msg-2', user_id: 'demo-1', content: 'Olá Maria! Claro, vou verificar sua conta. Aguarde um momento.', is_bot: false, is_admin: true, created_at: new Date(Date.now() - 3000000).toISOString() },
                            { id: 'msg-3', user_id: 'demo-1', content: 'Pronto! Já liberei o acesso. Tente novamente por favor.', is_bot: false, is_admin: true, created_at: new Date(Date.now() - 2400000).toISOString() },
                            { id: 'msg-4', user_id: 'demo-1', content: 'Muito obrigada! Agora está funcionando perfeitamente! 🎉', is_bot: false, is_admin: false, created_at: new Date(Date.now() - 1800000).toISOString() },
                        ],
                        lastMessage: { id: 'msg-4', user_id: 'demo-1', content: 'Muito obrigada! Agora está funcionando perfeitamente! 🎉', is_bot: false, is_admin: false, created_at: new Date(Date.now() - 1800000).toISOString() },
                        unreadCount: 2,
                        hasAdminReply: true
                    },
                    {
                        user_id: 'demo-2',
                        user_name: 'João Santos',
                        user_email: 'joao@email.com',
                        user_avatar: null,
                        messages: [
                            { id: 'msg-5', user_id: 'demo-2', content: 'Boa tarde! Gostaria de saber se vocês têm certificado para o curso.', is_bot: false, is_admin: false, created_at: new Date(Date.now() - 7200000).toISOString() },
                            { id: 'msg-6', user_id: 'demo-2', content: 'Também quero saber se posso baixar as aulas para assistir offline.', is_bot: false, is_admin: false, created_at: new Date(Date.now() - 7000000).toISOString() },
                        ],
                        lastMessage: { id: 'msg-6', user_id: 'demo-2', content: 'Também quero saber se posso baixar as aulas para assistir offline.', is_bot: false, is_admin: false, created_at: new Date(Date.now() - 7000000).toISOString() },
                        unreadCount: 2,
                        hasAdminReply: false
                    },
                    {
                        user_id: 'demo-3',
                        user_name: 'Ana Costa',
                        user_email: 'ana.costa@gmail.com',
                        user_avatar: null,
                        messages: [
                            { id: 'msg-7', user_id: 'demo-3', content: 'O vídeo da aula 5 está travando. Já tentei em vários navegadores.', is_bot: false, is_admin: false, created_at: new Date(Date.now() - 86400000).toISOString() },
                        ],
                        lastMessage: { id: 'msg-7', user_id: 'demo-3', content: 'O vídeo da aula 5 está travando. Já tentei em vários navegadores.', is_bot: false, is_admin: false, created_at: new Date(Date.now() - 86400000).toISOString() },
                        unreadCount: 1,
                        hasAdminReply: false
                    },
                    {
                        user_id: 'demo-4',
                        user_name: 'Pedro Oliveira',
                        user_email: 'pedro@email.com',
                        user_avatar: null,
                        messages: [
                            { id: 'msg-8', user_id: 'demo-4', content: 'Vocês podem me ajudar a resetar minha senha?', is_bot: false, is_admin: false, created_at: new Date(Date.now() - 172800000).toISOString() },
                            { id: 'msg-9', user_id: 'demo-4', content: 'Olá Pedro! Enviei um link de reset para seu email. Verifique sua caixa de entrada e spam.', is_bot: false, is_admin: true, created_at: new Date(Date.now() - 172000000).toISOString() },
                            { id: 'msg-10', user_id: 'demo-4', content: 'Perfeito, consegui! Valeu!', is_bot: false, is_admin: false, created_at: new Date(Date.now() - 171000000).toISOString() },
                        ],
                        lastMessage: { id: 'msg-10', user_id: 'demo-4', content: 'Perfeito, consegui! Valeu!', is_bot: false, is_admin: false, created_at: new Date(Date.now() - 171000000).toISOString() },
                        unreadCount: 2,
                        hasAdminReply: true
                    }
                ];
                setConversations(demoConversations);
            } else {
                setConversations(convs);

                // CORREÇÃO stale closure: usar ref para pegar valor atual de selectedConversation
                const currentSelected = selectedConvRef.current;
                if (currentSelected) {
                    const updated = convs.find(c => c.user_id === currentSelected.user_id);
                    if (updated) setSelectedConversation(updated);
                }
            }
        } catch (err) {
            console.error('Error loading conversations:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadConversations();

        const subscription = supabase
            .channel('support_messages_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_messages' }, () => {
                loadConversations();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [loadConversations]);

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || sending) return;

        const messageContent = newMessage.trim();
        const targetUserId = selectedConversation.user_id;

        // Otimista: adicionar mensagem localmente imediatamente
        const tempMsg: SupportMessage = {
            id: `temp-${Date.now()}`,
            user_id: targetUserId,
            content: messageContent,
            is_admin: true,
            is_bot: false,
            created_at: new Date().toISOString(),
        };

        setSelectedConversation(prev => {
            if (!prev || prev.user_id !== targetUserId) return prev;
            return { ...prev, messages: [...prev.messages, tempMsg] };
        });
        setNewMessage('');

        try {
            setSending(true);
            const { error } = await supabase
                .from('support_messages')
                .insert([{
                    user_id: targetUserId,
                    content: messageContent,
                    is_admin: true,
                    is_bot: false
                }]);

            if (error) throw error;
            await loadConversations();
        } catch (err) {
            console.error('Error sending message:', err);
            // Reverter mensagem otimista em caso de erro
            setSelectedConversation(prev => {
                if (!prev) return prev;
                return { ...prev, messages: prev.messages.filter(m => m.id !== tempMsg.id) };
            });
            setNewMessage(messageContent);
            alert('Erro ao enviar mensagem. Tente novamente.');
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !sending) {
            e.preventDefault();
            sendMessage();
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

    const isMobileView = selectedConversation !== null;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-700" style={{ minHeight: 0 }}>
            {/* Header + Stats — ocultos no mobile quando conversa está aberta */}
            <div className={`${isMobileView ? 'hidden md:block' : 'block'} space-y-6 mb-6 shrink-0`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">Suporte</h1>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Conversas com Alunos</p>
                    </div>
                    <button
                        onClick={loadConversations}
                        className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] active:scale-95 shrink-0"
                    >
                        <RefreshCw size={16} strokeWidth={3} className={loading ? 'animate-spin' : ''} />
                        Atualizar
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Total Mensagens', value: stats.total, icon: MessageCircle, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                        { label: 'Conversas', value: stats.conversations, icon: User, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                        { label: 'Aguardando', value: stats.pending, icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                        { label: 'Respondidas', value: stats.answered, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#0f0f13] border border-white/5 rounded-2xl p-4 flex items-center gap-3 shadow-xl">
                            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <p className="text-xl font-black text-white">{stat.value}</p>
                                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Panel — ocupa o restante da altura disponível */}
            <div className="bg-[#0f0f13] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden flex-1 min-h-0 flex flex-col">
                <div className="flex h-full min-h-0">

                    {/* Lista de Conversas */}
                    <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 border-r border-white/5 shrink-0`}>
                        <div className="p-4 border-b border-white/5 shrink-0">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Conversas</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center h-full py-16">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
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
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 text-sm overflow-hidden">
                                            {conv.user_avatar ? (
                                                <img src={conv.user_avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                conv.user_name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-bold text-white text-sm truncate">{conv.user_name}</span>
                                                <span className="text-[10px] text-slate-500 shrink-0">{formatTime(conv.lastMessage?.created_at)}</span>
                                            </div>
                                            <p className="text-xs text-slate-400 truncate mt-0.5">{conv.lastMessage?.content}</p>
                                            <div className="flex items-center gap-2 mt-1.5">
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

                    {/* Área do Chat */}
                    <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0 min-h-0`}>
                        {selectedConversation ? (
                            <>
                                {/* Cabeçalho do chat */}
                                <div className="p-4 border-b border-white/5 flex items-center gap-3 shrink-0">
                                    <button
                                        onClick={() => setSelectedConversation(null)}
                                        className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-all -ml-1"
                                        aria-label="Voltar"
                                    >
                                        <ArrowLeft size={20} className="text-slate-400" />
                                    </button>
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                                        {selectedConversation.user_avatar ? (
                                            <img src={selectedConversation.user_avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            selectedConversation.user_name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-white text-sm truncate">{selectedConversation.user_name}</p>
                                        <p className="text-xs text-slate-500 truncate">{selectedConversation.user_email}</p>
                                    </div>
                                </div>

                                {/* Mensagens */}
                                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-h-0">
                                    <AnimatePresence initial={false}>
                                        {selectedConversation.messages.map((msg) => (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.15 }}
                                                className={`flex gap-2 ${msg.is_admin ? 'flex-row-reverse' : 'flex-row'}`}
                                            >
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.is_bot
                                                    ? 'bg-yellow-500/20 text-yellow-400'
                                                    : msg.is_admin
                                                        ? 'bg-purple-500/20 text-purple-400'
                                                        : 'bg-emerald-500/20 text-emerald-400'
                                                    }`}>
                                                    {msg.is_bot ? <Bot size={14} /> : <User size={14} />}
                                                </div>
                                                <div className={`max-w-[75%] sm:max-w-[65%] flex flex-col gap-1 ${msg.is_admin ? 'items-end' : 'items-start'}`}>
                                                    <div className={`px-4 py-2.5 rounded-2xl ${msg.is_admin
                                                        ? 'bg-purple-600/20 border border-purple-500/20 rounded-tr-sm'
                                                        : msg.is_bot
                                                            ? 'bg-yellow-600/20 border border-yellow-500/20'
                                                            : 'bg-white/5 border border-white/5 rounded-tl-sm'
                                                        }`}>
                                                        <p className="text-sm text-white leading-relaxed">{msg.content}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-1">
                                                        <span className="text-[10px] text-slate-600">
                                                            {new Date(msg.created_at || '').toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <button
                                                            onClick={() => deleteMessage(msg.id)}
                                                            className="p-0.5 text-slate-700 hover:text-red-400 transition-all rounded"
                                                            title="Excluir mensagem"
                                                        >
                                                            <Trash2 size={11} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="p-3 md:p-4 border-t border-white/5 bg-[#0a0a0f]/50 shrink-0">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Digite sua resposta..."
                                            className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all text-white text-sm placeholder:text-slate-600"
                                            disabled={sending}
                                            autoComplete="off"
                                        />
                                        <button
                                            onClick={sendMessage}
                                            disabled={sending || !newMessage.trim()}
                                            className="px-4 md:px-6 py-3 bg-indigo-600 text-white font-bold text-xs uppercase rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                                        >
                                            <Send size={16} className={sending ? 'animate-pulse' : ''} />
                                            <span className="hidden sm:inline">Enviar</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <MessageCircle size={56} className="text-slate-700 mb-4" />
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
