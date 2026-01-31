import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Trash2, RefreshCw } from 'lucide-react';
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

const AdminSupport: React.FC = () => {
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const currentUser = getLoggedUser();

    useEffect(() => {
        loadMessages();

        // Real-time subscription
        const subscription = supabase
            .channel('support_messages_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_messages' }, () => {
                loadMessages();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('support_messages')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (err) {
            console.error('Error loading messages:', err);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            setSending(true);
            const { error } = await supabase
                .from('support_messages')
                .insert([{
                    user_id: currentUser?.id,
                    content: newMessage,
                    is_admin: true,
                    is_bot: false
                }]);

            if (error) throw error;
            setNewMessage('');
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
        } catch (err) {
            console.error('Error deleting message:', err);
            alert('Erro ao excluir mensagem');
        }
    };

    const stats = {
        total: messages.length,
        admin: messages.filter(m => m.is_admin).length,
        users: messages.filter(m => !m.is_admin && !m.is_bot).length,
        bot: messages.filter(m => m.is_bot).length
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">Suporte</h1>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Mensagens e Atendimento</p>
                </div>
                <button
                    onClick={loadMessages}
                    className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] active:scale-95 shrink-0"
                >
                    <RefreshCw size={18} strokeWidth={3} />
                    Atualizar
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total', value: stats.total, icon: MessageCircle, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                    { label: 'Admin', value: stats.admin, icon: User, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    { label: 'Usuários', value: stats.users, icon: User, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Bot', value: stats.bot, icon: Bot, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-[#0f0f13] border border-white/5 rounded-[2rem] p-8 flex items-center gap-6 shadow-xl">
                        <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shrink-0 border border-white/5`}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Messages */}
            <div className="bg-[#0f0f13] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 500px)', minHeight: '400px' }}>
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-8 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <MessageCircle size={64} className="text-slate-700 mb-4" />
                            <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Nenhuma mensagem ainda</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={`flex gap-4 ${msg.is_admin ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.is_bot ? 'bg-yellow-500/10 text-yellow-400' :
                                            msg.is_admin ? 'bg-purple-500/10 text-purple-400' :
                                                'bg-emerald-500/10 text-emerald-400'
                                        }`}>
                                        {msg.is_bot ? <Bot size={20} /> : <User size={20} />}
                                    </div>
                                    <div className={`flex-1 max-w-[70%] ${msg.is_admin ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                        <div className={`px-6 py-4 rounded-3xl ${msg.is_admin ? 'bg-purple-600/20 border border-purple-500/20' :
                                                msg.is_bot ? 'bg-yellow-600/20 border border-yellow-500/20' :
                                                    'bg-white/5 border border-white/5'
                                            }`}>
                                            <p className="text-sm text-white leading-relaxed">{msg.content}</p>
                                        </div>
                                        <div className="flex items-center gap-3 px-2">
                                            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                                                {new Date(msg.created_at || '').toLocaleString('pt-BR')}
                                            </span>
                                            <button
                                                onClick={() => deleteMessage(msg.id)}
                                                className="p-1 text-slate-600 hover:text-red-400 transition-all rounded-lg hover:bg-red-500/10"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Input */}
                <div className="p-6 border-t border-white/5 bg-[#0a0a0f]/50 backdrop-blur-md">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !sending && sendMessage()}
                            placeholder="Digite sua mensagem..."
                            className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all text-white text-sm font-medium placeholder:text-slate-700"
                            disabled={sending}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={sending || !newMessage.trim()}
                            className="px-8 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                        >
                            <Send size={18} />
                            {sending ? 'Enviando...' : 'Enviar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSupport;
