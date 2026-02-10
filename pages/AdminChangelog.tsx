import React from 'react';
import { History, CheckCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface Version {
    version: string;
    name: string;
    keywords: string[];
    type: 'feature' | 'fix' | 'perf' | 'release';
}

// Histórico de versões baseado na auditoria contínua
const versions: Version[] = [
    { version: '1.0.23', name: 'Triagem de Suporte Inteligente', keywords: ['Bot', 'Fila de Espera', 'Horários'], type: 'feature' },
    { version: '1.0.22', name: 'Entregabilidade de Ofertas', keywords: ['Fuso Horário', 'Expiração', 'Admin'], type: 'fix' },
    { version: '1.0.21', name: 'Community Invite', keywords: ['CTA', 'UX', 'Mock'], type: 'fix' },
    { version: '1.0.20', name: 'Cinematic Player Fix', keywords: ['YouTube', 'Shorts', 'Automático'], type: 'fix' },
    { version: '1.0.19', name: 'Smart Lesson Preview', keywords: ['YouTube', 'Fix', 'Admin'], type: 'fix' },
    { version: '1.0.18', name: 'Formulários Inteligentes', keywords: ['Select', 'Admin', 'UX'], type: 'feature' },
    { version: '1.0.17', name: 'Admin Persistence', keywords: ['Supabase', 'CRUD', 'Persistence'], type: 'feature' },
    { version: '1.0.16', name: 'Destaque Dinâmico', keywords: ['Oferta', 'Highlight', 'Admin'], type: 'feature' },
    { version: '1.0.15', name: 'App Icon Branding', keywords: ['Ícone', 'PWA', 'Logo'], type: 'feature' },
    { version: '1.0.14', name: 'Popup Uma Vez', keywords: ['Primeiro Acesso', 'Discreto', 'Uma Vez'], type: 'fix' },
    { version: '1.0.13', name: 'Cross-Sell Premium', keywords: ['Luxúria', 'Native Ads', 'Conversão'], type: 'feature' },
    { version: '1.0.12', name: 'Lista Simplificada', keywords: ['Vertical', 'Keywords', 'Static'], type: 'fix' },
    { version: '1.0.11', name: 'Histórico Completo', keywords: ['Changelog', 'Timeline', 'Versões'], type: 'feature' },
    { version: '1.0.10', name: 'Popup Discreto', keywords: ['Fade', 'Transparente', 'Silencioso'], type: 'fix' },
    { version: '1.0.9', name: 'Seletor de Dispositivo', keywords: ['Android', 'iPhone', 'Primeiro Acesso'], type: 'feature' },
    { version: '1.0.8', name: 'Dashboard Rápido', keywords: ['Promise.all', 'Paralelo', 'Instantâneo'], type: 'perf' },
    { version: '1.0.7', name: 'Demo no Suporte', keywords: ['Conversas', 'Exemplo', 'Mockup'], type: 'feature' },
    { version: '1.0.6', name: 'Suporte Inbox', keywords: ['Chat', 'Alunos', 'Separado'], type: 'feature' },
    { version: '1.0.5', name: 'Sem Comentários', keywords: ['Removido', 'Aulas', 'Limpo'], type: 'fix' },
    { version: '1.0.4', name: 'Dashboard KPIs', keywords: ['Métricas', 'Gargalos', 'Analytics'], type: 'feature' },
    { version: '1.0.3', name: 'Dashboard CRM', keywords: ['Gráficos', 'Moderno', 'Design'], type: 'feature' },
    { version: '1.0.2', name: 'Rota Admin', keywords: ['Dashboard', 'Inicial', 'Default'], type: 'fix' },
    { version: '1.0.1', name: 'Vercel SPA', keywords: ['Routing', '404', 'Fix'], type: 'fix' },
    { version: '1.0.0', name: 'Release Inicial', keywords: ['PWA', 'Supabase', 'Completo'], type: 'release' },
];

const AdminChangelog: React.FC = () => {
    const currentVersion = versions[0];
    const totalVersions = versions.length;

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'feature': return '⭐';
            case 'fix': return '🔧';
            case 'perf': return '⚡';
            case 'release': return '🚀';
            default: return '📦';
        }
    };

    const getTypeBg = (type: string) => {
        switch (type) {
            case 'feature': return 'bg-emerald-500/10 border-emerald-500/30';
            case 'fix': return 'bg-yellow-500/10 border-yellow-500/30';
            case 'perf': return 'bg-cyan-500/10 border-cyan-500/30';
            case 'release': return 'bg-purple-500/10 border-purple-500/30';
            default: return 'bg-slate-500/10 border-slate-500/30';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black text-white flex items-center gap-2">
                        <History size={22} className="text-indigo-400" />
                        Histórico de Atualizações
                    </h1>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                        Auditoria Contínua
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-xl px-4 py-2 text-center">
                        <p className="text-[10px] text-slate-500 uppercase">Atual</p>
                        <p className="text-lg font-black text-indigo-400">{currentVersion.version}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
                        <p className="text-[10px] text-slate-500 uppercase">Total</p>
                        <p className="text-lg font-black text-white">{totalVersions}</p>
                    </div>
                </div>
            </div>

            {/* Lista de Versões */}
            <div className="space-y-2">
                {versions.map((v, index) => (
                    <motion.div
                        key={v.version}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`${getTypeBg(v.type)} border rounded-xl p-4 ${index === 0 ? 'ring-2 ring-indigo-500/50' : ''}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Número da versão */}
                                <div className="bg-white/10 rounded-lg px-3 py-1 min-w-[60px] text-center">
                                    <span className="text-white font-mono font-bold text-sm">{v.version}</span>
                                </div>

                                {/* Nome e Keywords */}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{getTypeIcon(v.type)}</span>
                                        <h3 className="text-white font-bold text-sm">{v.name}</h3>
                                        {index === 0 && (
                                            <span className="bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                                Atual
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        {v.keywords.map((kw, i) => (
                                            <span key={i} className="text-[10px] text-slate-400 bg-black/20 px-2 py-0.5 rounded">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Check */}
                            <CheckCircle size={18} className="text-emerald-400/50" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Footer */}
            <div className="text-center py-4 border-t border-white/5">
                <p className="text-xs text-slate-600 flex items-center justify-center gap-1">
                    <Zap size={12} />
                    Atualizado automaticamente pela Auditoria Contínua
                </p>
            </div>
        </div>
    );
};

export default AdminChangelog;
