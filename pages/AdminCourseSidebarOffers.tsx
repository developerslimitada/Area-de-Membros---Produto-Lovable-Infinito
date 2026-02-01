
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ShoppingBag, X, DollarSign, Link as LinkIcon, Tag, LayoutGrid, Crown, Zap, Star } from 'lucide-react';
import { getDB, initializeStore, subscribeToChanges } from '../supabaseStore';
import { SidebarOffer } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const AdminCourseSidebarOffers: React.FC = () => {
    const [offers, setOffers] = useState<SidebarOffer[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState<SidebarOffer | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState<Partial<SidebarOffer>>({
        key: '',
        title: '',
        description: '',
        button_text: '',
        button_url: '',
        badge_text: '',
        price_original: 0,
        price_promocional: 0,
        is_active: true
    });

    useEffect(() => {
        loadData();
        const unsub = subscribeToChanges('course_sidebar_offers', () => loadData());
        return () => unsub();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('course_sidebar_offers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOffers(data || []);
        } catch (err) {
            console.error('Error loading sidebar offers:', err);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (offer?: SidebarOffer) => {
        if (offer) {
            setEditingOffer(offer);
            setFormData(offer);
        } else {
            setEditingOffer(null);
            setFormData({
                key: '',
                title: '',
                description: '',
                button_text: '',
                button_url: '',
                badge_text: '',
                price_original: 0,
                price_promocional: 0,
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.key || !formData.title || !formData.button_text || !formData.button_url) {
            alert("Key, Título, Texto do Botão e URL são obrigatórios.");
            return;
        }

        try {
            setSaving(true);
            setMessage(null);

            if (editingOffer) {
                const { error } = await supabase
                    .from('course_sidebar_offers')
                    .update(formData)
                    .eq('id', editingOffer.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('course_sidebar_offers')
                    .insert([formData]);

                if (error) throw error;
            }

            setMessage({ type: 'success', text: `Oferta "${formData.title}" salva com sucesso!` });
            setIsModalOpen(false);
            loadData();
        } catch (err) {
            console.error('Error saving sidebar offer:', err);
            setMessage({ type: 'error', text: 'Erro ao salvar oferta.' });
        } finally {
            setSaving(false);
        }
    };


    const handleSetFeatured = async (id: string) => {
        const offer = offers.find(o => o.id === id);
        if (!offer || (offer.key === 'cross_sell' && offer.is_active) || saving) return;

        try {
            setSaving(true);
            setMessage(null);

            // 1. Resetar qualquer cross_sell existente para tipo comum
            const existingFeatured = offers.find(o => o.key === 'cross_sell');
            if (existingFeatured && existingFeatured.id !== id) {
                await supabase
                    .from('course_sidebar_offers')
                    .update({ key: 'sidebar_generic' })
                    .eq('id', existingFeatured.id);
            }

            // 2. Definir a nova como cross_sell (destaque)
            const { error } = await supabase
                .from('course_sidebar_offers')
                .update({
                    key: 'cross_sell',
                    is_active: true
                })
                .eq('id', id);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Oferta definida como destaque de Luxúria!' });
            await loadData();
        } catch (err) {
            console.error('Error setting featured offer:', err);
            setMessage({ type: 'error', text: 'Erro ao definir destaque.' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Excluir esta oferta permanentemente?')) {
            try {
                const { error } = await supabase
                    .from('course_sidebar_offers')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                setMessage({ type: 'success', text: 'Oferta excluída com sucesso.' });
                loadData();
            } catch (err) {
                console.error('Error deleting sidebar offer:', err);
                setMessage({ type: 'error', text: 'Erro ao excluir oferta.' });
            }
        }
    };

    const stats = {
        total: offers.length,
        active: offers.filter(o => o.is_active).length,
        vipGroup: offers.filter(o => o.key === 'vip_group').length,
        crossSell: offers.filter(o => o.key === 'cross_sell').length
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">Cross-sell de Cursos</h1>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Ofertas na Sidebar de Aulas</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] active:scale-95 shrink-0"
                >
                    <Plus size={18} strokeWidth={3} />
                    Nova Oferta Sidebar
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total de Ofertas', value: stats.total, icon: LayoutGrid, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                    { label: 'Ofertas Ativas', value: stats.active, icon: ShoppingBag, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Grupo VIP', value: stats.vipGroup, icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    { label: 'Cross-sell', value: stats.crossSell, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
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

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-2xl border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    <p className="font-bold text-sm">{message.text}</p>
                </div>
            )}

            <div className="bg-[#0f0f13] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#0a0a0f] text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
                            <tr>
                                <th className="px-8 py-6">Key / Tipo</th>
                                <th className="px-8 py-6">Oferta</th>
                                <th className="px-8 py-6">Preços</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {offers.map(offer => (
                                <tr key={offer.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            {offer.key === 'vip_group' ? (
                                                <Crown className="text-purple-400" size={20} />
                                            ) : offer.key === 'cross_sell' ? (
                                                <Zap className="text-yellow-400" size={20} />
                                            ) : (
                                                <Tag className="text-slate-400" size={20} />
                                            )}
                                            <div>
                                                <p className="font-extrabold text-sm text-white">{offer.key}</p>
                                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{offer.badge_text || 'Sem badge'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="max-w-[250px]">
                                            <p className="font-extrabold text-sm text-white truncate">{offer.title}</p>
                                            <p className="text-xs text-slate-500 truncate mt-1">{offer.description}</p>
                                            <p className="text-[10px] text-indigo-400 font-bold mt-1 truncate">{offer.button_text}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            {offer.price_original > 0 && (
                                                <span className="text-[10px] text-slate-600 line-through font-bold">R$ {offer.price_original.toFixed(2)}</span>
                                            )}
                                            {offer.price_promocional > 0 && (
                                                <span className="text-sm text-emerald-400 font-black">R$ {offer.price_promocional.toFixed(2)}</span>
                                            )}
                                            {offer.price_original === 0 && offer.price_promocional === 0 && (
                                                <span className="text-xs text-slate-600 font-bold">Sem preço</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${offer.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                                            {offer.is_active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => handleSetFeatured(offer.id)}
                                                disabled={saving}
                                                className={`p-3 transition-all rounded-xl border ${offer.key === 'cross_sell'
                                                    ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
                                                    : 'text-slate-600 hover:text-yellow-400 hover:bg-yellow-400/10 border-transparent hover:border-yellow-400/20'
                                                    }`}
                                                title={offer.key === 'cross_sell' ? 'Oferta em Destaque' : 'Definir como Destaque'}
                                            >
                                                <Star size={18} fill={offer.key === 'cross_sell' ? 'currentColor' : 'none'} strokeWidth={offer.key === 'cross_sell' ? 1.5 : 2.5} />
                                            </button>
                                            <button
                                                onClick={() => openModal(offer)}
                                                className="p-3 text-slate-500 hover:text-indigo-400 transition-all rounded-xl hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(offer.id)}
                                                className="p-3 text-slate-500 hover:text-red-400 transition-all rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}</tbody>
                    </table>
                    {offers.length === 0 && (
                        <div className="py-24 text-center">
                            <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Nenhuma oferta cadastrada.</p>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0f0f13] w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/5">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{editingOffer ? 'Editar Oferta' : 'Nova Oferta'}</h3>
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Sidebar de Aulas</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white">
                                    <X size={28} />
                                </button>
                            </div>

                            <div className="p-8 space-y-8 overflow-y-auto no-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Key (Identificador)</label>
                                        <select
                                            value={formData.key}
                                            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all text-white text-sm font-bold"
                                        >
                                            <option value="sidebar_generic">sidebar_generic (Oferta Comum)</option>
                                            <option value="vip_group">vip_group (Grupo VIP)</option>
                                            <option value="cross_sell">cross_sell (Destaque Luxúria)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Badge Text</label>
                                        <input
                                            type="text"
                                            value={formData.badge_text || ''}
                                            onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                                            placeholder="Ex: Oferta Expirando"
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all text-white text-sm font-bold placeholder:text-slate-700"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Título da Oferta</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Ex: Comunidade Premium Infinito"
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all text-white text-sm font-bold placeholder:text-slate-700"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Descrição</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Descrição detalhada da oferta..."
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all text-white text-sm font-medium leading-relaxed resize-none placeholder:text-slate-700"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Texto do Botão</label>
                                        <input
                                            type="text"
                                            value={formData.button_text}
                                            onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                                            placeholder="Ex: Quero Participar"
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all text-white text-sm font-bold placeholder:text-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">URL de Destino</label>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                            <input
                                                type="url"
                                                value={formData.button_url}
                                                onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                                                placeholder="https://..."
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all text-white text-sm font-bold placeholder:text-slate-700"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Preço Original (R$)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                            <input
                                                type="number"
                                                value={formData.price_original}
                                                onChange={(e) => setFormData({ ...formData, price_original: parseFloat(e.target.value) || 0 })}
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all text-white text-sm font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Preço Promocional (R$)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" size={16} />
                                            <input
                                                type="number"
                                                value={formData.price_promocional}
                                                onChange={(e) => setFormData({ ...formData, price_promocional: parseFloat(e.target.value) || 0 })}
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all text-white text-sm font-bold border-emerald-500/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Status</label>
                                    <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
                                        {[
                                            { id: true, label: 'Ativo', icon: ShoppingBag },
                                            { id: false, label: 'Inativo', icon: X },
                                        ].map(type => (
                                            <button
                                                key={String(type.id)}
                                                onClick={() => setFormData({ ...formData, is_active: type.id })}
                                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all flex items-center justify-center gap-2 ${formData.is_active === type.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'}`}
                                            >
                                                <type.icon size={14} />
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-white/5 flex gap-4 bg-[#0a0a0f]/50 backdrop-blur-md">
                                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-500 font-black text-xs uppercase tracking-widest hover:text-white transition-all">Descartar</button>
                                <button onClick={handleSave} disabled={saving} className="flex-1 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] transition-all active:scale-95 disabled:opacity-50">
                                    {saving ? 'Salvando...' : (editingOffer ? 'Atualizar Oferta' : 'Criar Oferta')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminCourseSidebarOffers;
