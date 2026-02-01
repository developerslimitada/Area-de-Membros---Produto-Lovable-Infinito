import React, { useState, useEffect } from 'react';
import { History, Calendar, Package, CheckCircle, Zap, GitCommit, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

interface ChangelogEntry {
    id: string;
    version: string;
    release_date: string;
    title: string;
    type: 'feature' | 'fix' | 'perf' | 'release';
    changes: string[];
    commit?: string;
}

// Histórico baseado na auditoria contínua
const defaultChangelog: ChangelogEntry[] = [
    {
        id: '10',
        version: '1.0.10',
        release_date: '2026-01-31T21:05:00',
        title: 'Popup discreto de dispositivo',
        type: 'fix',
        changes: [
            'Popup com fade transparente (40%)',
            'Design minimalista e discreto',
            'Sem alertas de erro',
            'Animação suave de entrada'
        ],
        commit: '3b30c33'
    },
    {
        id: '9',
        version: '1.0.9',
        release_date: '2026-01-31T21:02:00',
        title: 'Seletor de Dispositivo Android/iPhone',
        type: 'feature',
        changes: [
            'Popup no primeiro acesso perguntando qual celular usa',
            'Botões Android (verde) e iPhone (cinza)',
            'Salvamento automático no Supabase',
            'Integração com Dashboard Admin'
        ],
        commit: '8d71df5'
    },
    {
        id: '8',
        version: '1.0.8',
        release_date: '2026-01-31T20:54:00',
        title: 'Dashboard Ultra Rápido',
        type: 'perf',
        changes: [
            '21 consultas em paralelo (Promise.all)',
            'Carregamento instantâneo',
            'Design simplificado e leve',
            'Spinner otimizado'
        ],
        commit: '5224e50'
    },
    {
        id: '7',
        version: '1.0.7',
        release_date: '2026-01-31T20:49:00',
        title: 'Dados demo no Suporte',
        type: 'feature',
        changes: [
            '4 conversas de exemplo com alunos',
            'Maria, João, Ana e Pedro',
            'Status Aguardando e Respondida'
        ],
        commit: '971f5f1'
    },
    {
        id: '6',
        version: '1.0.6',
        release_date: '2026-01-31T20:45:00',
        title: 'Suporte estilo Inbox',
        type: 'feature',
        changes: [
            'Conversas separadas por aluno',
            'Lista de conversas (sidebar)',
            'Chat individual por aluno',
            'Badges Aguardando/Respondida',
            'Realtime updates'
        ],
        commit: 'acf9ae3'
    },
    {
        id: '5',
        version: '1.0.5',
        release_date: '2026-01-31T20:27:00',
        title: 'Remoção de comentários',
        type: 'fix',
        changes: [
            'Área de comentários removida das aulas',
            'Alunos usam suporte em vez de comentários'
        ],
        commit: '370137b'
    },
    {
        id: '4',
        version: '1.0.4',
        release_date: '2026-01-31T20:22:00',
        title: 'Dashboard Operacional',
        type: 'feature',
        changes: [
            'KPIs: Total Usuários, Novos Cadastros',
            'Taxa de Conclusão',
            'Sistema de Alertas de Gargalos'
        ],
        commit: 'a4286b3'
    },
    {
        id: '3',
        version: '1.0.3',
        release_date: '2026-01-31T20:18:00',
        title: 'Dashboard CRM',
        type: 'feature',
        changes: [
            'Design estilo CRM moderno',
            'Gráficos de linha, pizza e barras'
        ],
        commit: '6f97018'
    },
    {
        id: '2',
        version: '1.0.2',
        release_date: '2026-01-31T20:12:00',
        title: 'Dashboard como página inicial',
        type: 'fix',
        changes: [
            'AdminDashboard como página padrão do /admin'
        ],
        commit: '09005ce'
    },
    {
        id: '1',
        version: '1.0.1',
        release_date: '2026-01-31T19:58:00',
        title: 'SPA Routing Vercel',
        type: 'fix',
        changes: [
            'vercel.json para SPA routing',
            'Correção de erro 404'
        ],
        commit: 'ea3a387'
    },
    {
        id: '0',
        version: '1.0.0',
        release_date: '2026-01-31T16:52:00',
        title: 'Release Inicial',
        type: 'release',
        changes: [
            'AdminDashboard completo',
            'Sistema de Changelog',
            'Sistema VSL (Android/iPhone)',
            'Sistema de Suporte',
            'Lazy Loading',
            'Sistema de Roles',
            'PWA configurado',
            'Proteção de rotas'
        ],
        commit: '1357f78'
    }
];

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

            if (error || !data || data.length === 0) {
                // Usar dados locais se não houver dados no Supabase
                setChangelog(defaultChangelog);
            } else {
                setChangelog(data);
            }
        } catch (err) {
            console.error('Error loading changelog:', err);
            setChangelog(defaultChangelog);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'feature': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'fix': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'perf': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
            case 'release': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'feature': return '⭐ Feature';
            case 'fix': return '🔧 Fix';
            case 'perf': return '⚡ Performance';
            case 'release': return '🚀 Release';
            default: return '📦 Update';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Carregando...</p>
                </div>
            </div>
        );
    }

    const currentVersion = changelog[0]?.version || '1.0.0';
    const totalVersions = changelog.length;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <History size={28} className="text-indigo-400" />
                        Histórico de Atualizações
                    </h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                        Todas as versões e melhorias
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Versão Atual</p>
                        <p className="text-xl font-black text-indigo-400">{currentVersion}</p>
                    </div>
                    <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total</p>
                        <p className="text-xl font-black text-white">{totalVersions}</p>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-3">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-emerald-400">{changelog.filter(c => c.type === 'feature').length}</p>
                    <p className="text-[10px] text-emerald-400/70 font-bold uppercase">Features</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-yellow-400">{changelog.filter(c => c.type === 'fix').length}</p>
                    <p className="text-[10px] text-yellow-400/70 font-bold uppercase">Fixes</p>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-cyan-400">{changelog.filter(c => c.type === 'perf').length}</p>
                    <p className="text-[10px] text-cyan-400/70 font-bold uppercase">Perf</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-purple-400">{changelog.filter(c => c.type === 'release').length}</p>
                    <p className="text-[10px] text-purple-400/70 font-bold uppercase">Releases</p>
                </div>
            </div>

            {/* Changelog Timeline */}
            <div className="space-y-4">
                {changelog.map((entry, index) => (
                    <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative"
                    >
                        <div className={`bg-[#12121a] rounded-2xl border border-white/5 p-5 hover:border-indigo-500/30 transition-all ${index === 0 ? 'border-indigo-500/30 shadow-lg shadow-indigo-500/10' : ''}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    {/* Version Badge */}
                                    <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-xl px-3 py-2 text-center min-w-[70px]">
                                        <Tag size={14} className="text-indigo-400 mx-auto mb-1" />
                                        <p className="text-sm font-black text-indigo-400">{entry.version}</p>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <h3 className="text-white font-bold text-sm">{entry.title}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getTypeColor(entry.type)}`}>
                                                {getTypeLabel(entry.type)}
                                            </span>
                                            {index === 0 && (
                                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-[10px] font-bold">
                                                    ATUAL
                                                </span>
                                            )}
                                        </div>

                                        {/* Changes List */}
                                        <div className="flex flex-wrap gap-2">
                                            {entry.changes.map((change, idx) => (
                                                <span key={idx} className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-lg">
                                                    <CheckCircle size={10} className="text-emerald-400" />
                                                    {change}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Date & Commit */}
                                <div className="text-right shrink-0">
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                        <Calendar size={12} />
                                        <span>{formatDate(entry.release_date)}</span>
                                    </div>
                                    {entry.commit && (
                                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-600">
                                            <GitCommit size={12} />
                                            <code className="font-mono">{entry.commit}</code>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Footer */}
            <div className="text-center py-6">
                <p className="text-xs text-slate-600">
                    <Zap size={12} className="inline mr-1" />
                    Histórico gerado automaticamente pela Auditoria Contínua
                </p>
            </div>
        </div>
    );
};

export default AdminChangelog;
