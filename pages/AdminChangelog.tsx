import React, { useState, useEffect } from 'react';
import { History, Calendar, Package, CheckCircle, Code, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

interface ChangelogEntry {
    id: string;
    version: string;
    release_date: string;
    title: string;
    description: string;
    changes: {
        features: Array<{
            category: string;
            items: string[];
        }>;
        technical: string[];
    };
}

const AdminChangelog: React.FC = () => {
    const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadChangelog();
    }, []);

    const loadChangelog = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('changelog')
                .select('*')
                .order('release_date', { ascending: false });

            if (error) throw error;
            setChangelog(data || []);
        } catch (err) {
            console.error('Error loading changelog:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-xs font-black text-slate-600 uppercase tracking-widest animate-pulse">Carregando Histórico...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase flex items-center gap-4">
                        <History size={40} className="text-indigo-400" />
                        Histórico de Atualizações
                    </h1>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Versões e melhorias da plataforma</p>
                </div>
                <div className="px-6 py-3 bg-indigo-600/20 border-2 border-indigo-500/50 rounded-2xl">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Versão Atual</p>
                    <p className="text-2xl font-black text-indigo-400 mt-1">{changelog[0]?.version || '1.0.0'}</p>
                </div>
            </div>

            {/* Changelog Timeline */}
            <div className="space-y-8">
                {changelog.map((entry, index) => (
                    <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                    >
                        {/* Timeline Line */}
                        {index < changelog.length - 1 && (
                            <div className="absolute left-6 top-24 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500/50 to-transparent" />
                        )}

                        {/* Version Card */}
                        <div className="bg-[#0f0f13] rounded-[2.5rem] border-2 border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.2)] p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -mr-32 -mt-32" />

                            {/* Version Badge */}
                            <div className="relative z-10 flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-indigo-600/20 border-2 border-indigo-500/50 rounded-2xl">
                                        <Package size={32} className="text-indigo-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tight">Versão {entry.version}</h2>
                                        <p className="text-sm font-bold text-slate-500 mt-1">{entry.title}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                                    <Calendar size={16} className="text-indigo-400" />
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                        {formatDate(entry.release_date)}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            {entry.description && (
                                <p className="relative z-10 text-slate-400 text-sm leading-relaxed mb-8 pl-20">
                                    {entry.description}
                                </p>
                            )}

                            {/* Features */}
                            <div className="relative z-10 space-y-6">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3 pl-20">
                                    <Zap size={20} className="text-yellow-400" />
                                    Funcionalidades Implementadas
                                </h3>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pl-20">
                                    {entry.changes.features.map((feature, idx) => (
                                        <div key={idx} className="bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4">
                                            <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                                <Code size={16} />
                                                {feature.category}
                                            </h4>
                                            <ul className="space-y-2">
                                                {feature.items.map((item, itemIdx) => (
                                                    <li key={itemIdx} className="flex items-start gap-3 text-sm text-slate-400">
                                                        <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>

                                {/* Technical Details */}
                                {entry.changes.technical && entry.changes.technical.length > 0 && (
                                    <div className="pl-20 mt-6">
                                        <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Detalhes Técnicos</h4>
                                        <div className="bg-black/30 rounded-2xl border border-white/5 p-6">
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {entry.changes.technical.map((tech, techIdx) => (
                                                    <li key={techIdx} className="flex items-center gap-3 text-sm text-slate-500">
                                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                                        <span>{tech}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Empty State */}
            {changelog.length === 0 && (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                    <History size={64} className="text-slate-700 mb-4" />
                    <p className="text-slate-600 font-bold uppercase tracking-widest text-sm">Nenhuma atualização registrada</p>
                </div>
            )}
        </div>
    );
};

export default AdminChangelog;
