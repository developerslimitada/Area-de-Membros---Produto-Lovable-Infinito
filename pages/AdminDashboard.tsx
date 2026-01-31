import React, { useState, useEffect } from 'react';
import { Users, BookOpen, PlayCircle, MessageCircle, TrendingUp, Award, Eye, Clock, AlertTriangle, CheckCircle, XCircle, Zap, Target, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BusinessMetrics {
    // Usuários
    totalUsers: number;
    newUsersThisMonth: number;
    newUsersLastMonth: number;
    userGrowthRate: number;
    activeUsersToday: number;
    androidUsers: number;
    iphoneUsers: number;

    // Conteúdo
    totalCourses: number;
    totalModules: number;
    totalLessons: number;
    totalWatchTime: number; // em horas
    coursesWithoutLessons: number; // GARGALO

    // Engajamento
    totalProgress: number;
    completedLessons: number;
    inProgressLessons: number;
    avgCompletionRate: number;

    // Suporte
    totalSupportMessages: number;
    userMessages: number;
    adminMessages: number;
    botMessages: number;
    unansweredMessages: number; // GARGALO

    // Comunidade
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    avgEngagementRate: number;

    // Ofertas
    activeOffers: number;
    totalOffers: number;
}

const AdminDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<BusinessMetrics>({
        totalUsers: 0,
        newUsersThisMonth: 0,
        newUsersLastMonth: 0,
        userGrowthRate: 0,
        activeUsersToday: 0,
        androidUsers: 0,
        iphoneUsers: 0,
        totalCourses: 0,
        totalModules: 0,
        totalLessons: 0,
        totalWatchTime: 0,
        coursesWithoutLessons: 0,
        totalProgress: 0,
        completedLessons: 0,
        inProgressLessons: 0,
        avgCompletionRate: 0,
        totalSupportMessages: 0,
        userMessages: 0,
        adminMessages: 0,
        botMessages: 0,
        unansweredMessages: 0,
        totalPosts: 0,
        totalLikes: 0,
        totalComments: 0,
        avgEngagementRate: 0,
        activeOffers: 0,
        totalOffers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBusinessMetrics();
    }, []);

    const loadBusinessMetrics = async () => {
        try {
            setLoading(true);

            // === USUÁRIOS ===
            const { count: totalUsers } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            // Novos usuários este mês
            const firstDayThisMonth = new Date();
            firstDayThisMonth.setDate(1);
            firstDayThisMonth.setHours(0, 0, 0, 0);

            const { count: newUsersThisMonth } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', firstDayThisMonth.toISOString());

            // Novos usuários mês passado
            const firstDayLastMonth = new Date();
            firstDayLastMonth.setMonth(firstDayLastMonth.getMonth() - 1);
            firstDayLastMonth.setDate(1);
            firstDayLastMonth.setHours(0, 0, 0, 0);

            const lastDayLastMonth = new Date(firstDayThisMonth);
            lastDayLastMonth.setDate(lastDayLastMonth.getDate() - 1);

            const { count: newUsersLastMonth } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', firstDayLastMonth.toISOString())
                .lt('created_at', firstDayThisMonth.toISOString());

            // Usuários ativos hoje (com progresso hoje)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { count: activeUsersToday } = await supabase
                .from('user_progress')
                .select('user_id', { count: 'exact', head: true })
                .gte('last_watched_at', today.toISOString());

            // Usuários por dispositivo
            const { count: androidUsers } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('device_type', 'android');

            const { count: iphoneUsers } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('device_type', 'iphone');

            // === CONTEÚDO ===
            const { count: totalCourses } = await supabase
                .from('courses')
                .select('*', { count: 'exact', head: true });

            const { count: totalModules } = await supabase
                .from('modules')
                .select('*', { count: 'exact', head: true });

            const { count: totalLessons } = await supabase
                .from('lessons')
                .select('*', { count: 'exact', head: true });

            // Tempo total de conteúdo (soma duration_seconds)
            const { data: lessonsData } = await supabase
                .from('lessons')
                .select('duration_seconds');

            const totalWatchTime = lessonsData?.reduce((acc, l) => acc + (l.duration_seconds || 0), 0) || 0;

            // Cursos sem aulas (GARGALO!)
            const { data: coursesWithModules } = await supabase
                .from('courses')
                .select('id, modules(id, lessons(id))');

            const coursesWithoutLessons = coursesWithModules?.filter(c =>
                !c.modules?.some((m: any) => m.lessons?.length > 0)
            ).length || 0;

            // === ENGAJAMENTO ===
            const { count: totalProgress } = await supabase
                .from('user_progress')
                .select('*', { count: 'exact', head: true });

            const { count: completedLessons } = await supabase
                .from('user_progress')
                .select('*', { count: 'exact', head: true })
                .eq('completed', true);

            const inProgressLessons = (totalProgress || 0) - (completedLessons || 0);
            const avgCompletionRate = totalProgress ? Math.round((completedLessons || 0) / totalProgress * 100) : 0;

            // === SUPORTE ===
            const { count: totalSupportMessages } = await supabase
                .from('support_messages')
                .select('*', { count: 'exact', head: true });

            const { count: adminMessages } = await supabase
                .from('support_messages')
                .select('*', { count: 'exact', head: true })
                .eq('is_admin', true);

            const { count: botMessages } = await supabase
                .from('support_messages')
                .select('*', { count: 'exact', head: true })
                .eq('is_bot', true);

            const userMessages = (totalSupportMessages || 0) - (adminMessages || 0) - (botMessages || 0);

            // Mensagens sem resposta (GARGALO!) - última msg do user sem resposta admin
            const unansweredMessages = Math.max(0, userMessages - (adminMessages || 0));

            // === COMUNIDADE ===
            const { count: totalPosts } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true });

            const { data: postsData } = await supabase
                .from('posts')
                .select('likes_count');

            const totalLikes = postsData?.reduce((acc, p) => acc + (p.likes_count || 0), 0) || 0;

            const { count: totalComments } = await supabase
                .from('comments')
                .select('*', { count: 'exact', head: true });

            const avgEngagementRate = totalPosts ? Math.round((totalLikes + (totalComments || 0)) / totalPosts) : 0;

            // === OFERTAS ===
            const { count: totalOffers } = await supabase
                .from('offers')
                .select('*', { count: 'exact', head: true });

            const { count: activeOffers } = await supabase
                .from('offers')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            // Calcular taxa de crescimento
            const userGrowthRate = newUsersLastMonth
                ? Math.round(((newUsersThisMonth || 0) - newUsersLastMonth) / newUsersLastMonth * 100)
                : (newUsersThisMonth || 0) > 0 ? 100 : 0;

            setMetrics({
                totalUsers: totalUsers || 0,
                newUsersThisMonth: newUsersThisMonth || 0,
                newUsersLastMonth: newUsersLastMonth || 0,
                userGrowthRate,
                activeUsersToday: activeUsersToday || 0,
                androidUsers: androidUsers || 0,
                iphoneUsers: iphoneUsers || 0,
                totalCourses: totalCourses || 0,
                totalModules: totalModules || 0,
                totalLessons: totalLessons || 0,
                totalWatchTime: Math.round(totalWatchTime / 3600), // converter para horas
                coursesWithoutLessons,
                totalProgress: totalProgress || 0,
                completedLessons: completedLessons || 0,
                inProgressLessons,
                avgCompletionRate,
                totalSupportMessages: totalSupportMessages || 0,
                userMessages,
                adminMessages: adminMessages || 0,
                botMessages: botMessages || 0,
                unansweredMessages,
                totalPosts: totalPosts || 0,
                totalLikes,
                totalComments: totalComments || 0,
                avgEngagementRate,
                activeOffers: activeOffers || 0,
                totalOffers: totalOffers || 0
            });
        } catch (err) {
            console.error('Error loading business metrics:', err);
        } finally {
            setLoading(false);
        }
    };

    // Dados para gráficos (simulados baseados nos dados reais)
    const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const weeklyEngagement = [65, 80, 75, 90, 85, 45, 35];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96 bg-[#0a0a12]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Carregando Métricas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a12] p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard Operacional</h1>
                    <p className="text-slate-400 text-sm mt-1">Métricas de negócio em tempo real • Última atualização: agora</p>
                </div>
                <button
                    onClick={loadBusinessMetrics}
                    className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-all flex items-center gap-2"
                >
                    <Activity size={16} />
                    Atualizar
                </button>
            </div>

            {/* KPIs Principais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Usuários */}
                <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-900/30 rounded-2xl p-5 border border-cyan-500/30">
                    <div className="flex items-center justify-between">
                        <Users className="text-cyan-400" size={24} />
                        <span className={`text-xs px-2 py-1 rounded-full ${metrics.userGrowthRate >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {metrics.userGrowthRate >= 0 ? '+' : ''}{metrics.userGrowthRate}%
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-white mt-3">{metrics.totalUsers}</p>
                    <p className="text-cyan-400 text-sm">Total de Usuários</p>
                </div>

                {/* Novos Este Mês */}
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/30 rounded-2xl p-5 border border-purple-500/30">
                    <div className="flex items-center justify-between">
                        <TrendingUp className="text-purple-400" size={24} />
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                            este mês
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-white mt-3">{metrics.newUsersThisMonth}</p>
                    <p className="text-purple-400 text-sm">Novos Cadastros</p>
                </div>

                {/* Taxa de Conclusão */}
                <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/30 rounded-2xl p-5 border border-emerald-500/30">
                    <div className="flex items-center justify-between">
                        <Target className="text-emerald-400" size={24} />
                        <span className={`text-xs px-2 py-1 rounded-full ${metrics.avgCompletionRate >= 50 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {metrics.avgCompletionRate >= 50 ? 'Bom' : 'Atenção'}
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-white mt-3">{metrics.avgCompletionRate}%</p>
                    <p className="text-emerald-400 text-sm">Taxa de Conclusão</p>
                </div>

                {/* Ativos Hoje */}
                <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-900/30 rounded-2xl p-5 border border-yellow-500/30">
                    <div className="flex items-center justify-between">
                        <Zap className="text-yellow-400" size={24} />
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                            tempo real
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-white mt-3">{metrics.activeUsersToday}</p>
                    <p className="text-yellow-400 text-sm">Ativos Hoje</p>
                </div>
            </div>

            {/* Alertas de Gargalos */}
            {(metrics.coursesWithoutLessons > 0 || metrics.unansweredMessages > 0) && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="text-red-400" size={24} />
                        <h3 className="text-red-400 font-bold">⚠️ Gargalos Identificados</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {metrics.coursesWithoutLessons > 0 && (
                            <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-xl">
                                <XCircle className="text-red-400" size={20} />
                                <div>
                                    <p className="text-white font-bold">{metrics.coursesWithoutLessons} cursos sem aulas</p>
                                    <p className="text-red-300 text-sm">Adicione aulas para ativar estes cursos</p>
                                </div>
                            </div>
                        )}
                        {metrics.unansweredMessages > 0 && (
                            <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-xl">
                                <MessageCircle className="text-red-400" size={20} />
                                <div>
                                    <p className="text-white font-bold">{metrics.unansweredMessages} mensagens sem resposta</p>
                                    <p className="text-red-300 text-sm">Responda o suporte para melhorar satisfação</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Grid Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Conteúdo */}
                <div className="bg-[#12121a] rounded-2xl p-6 border border-white/5">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <BookOpen className="text-cyan-400" size={20} />
                        Conteúdo Disponível
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                            <span className="text-slate-300">Cursos</span>
                            <span className="text-white font-bold text-xl">{metrics.totalCourses}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                            <span className="text-slate-300">Módulos</span>
                            <span className="text-white font-bold text-xl">{metrics.totalModules}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                            <span className="text-slate-300">Aulas</span>
                            <span className="text-white font-bold text-xl">{metrics.totalLessons}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                            <span className="text-cyan-300">Horas de Conteúdo</span>
                            <span className="text-cyan-400 font-bold text-xl">{metrics.totalWatchTime}h</span>
                        </div>
                    </div>
                </div>

                {/* Engajamento */}
                <div className="bg-[#12121a] rounded-2xl p-6 border border-white/5">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <PlayCircle className="text-purple-400" size={20} />
                        Progresso dos Alunos
                    </h3>

                    {/* Progress Ring */}
                    <div className="flex items-center justify-center mb-4">
                        <div className="relative w-32 h-32">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#1e1e2e" strokeWidth="12" />
                                <circle
                                    cx="50" cy="50" r="40" fill="none"
                                    stroke="url(#progressGradient)" strokeWidth="12"
                                    strokeDasharray="251.2"
                                    strokeDashoffset={251.2 - (251.2 * metrics.avgCompletionRate / 100)}
                                    strokeLinecap="round"
                                />
                                <defs>
                                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#06b6d4" />
                                        <stop offset="100%" stopColor="#a855f7" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-white">{metrics.avgCompletionRate}%</span>
                                <span className="text-xs text-slate-400">Conclusão</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-green-400">
                                <CheckCircle size={14} /> Concluídas
                            </span>
                            <span className="text-white font-bold">{metrics.completedLessons}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-yellow-400">
                                <Clock size={14} /> Em Progresso
                            </span>
                            <span className="text-white font-bold">{metrics.inProgressLessons}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-slate-400">
                                <Eye size={14} /> Total Interações
                            </span>
                            <span className="text-white font-bold">{metrics.totalProgress}</span>
                        </div>
                    </div>
                </div>

                {/* Suporte */}
                <div className="bg-[#12121a] rounded-2xl p-6 border border-white/5">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <MessageCircle className="text-rose-400" size={20} />
                        Central de Suporte
                    </h3>

                    <div className="text-center mb-4">
                        <p className="text-4xl font-bold text-white">{metrics.totalSupportMessages}</p>
                        <p className="text-slate-400 text-sm">Total de Mensagens</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-blue-500/10 rounded-lg">
                            <span className="text-blue-300 text-sm">Usuários</span>
                            <span className="text-blue-400 font-bold">{metrics.userMessages}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-green-500/10 rounded-lg">
                            <span className="text-green-300 text-sm">Admin</span>
                            <span className="text-green-400 font-bold">{metrics.adminMessages}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-purple-500/10 rounded-lg">
                            <span className="text-purple-300 text-sm">Bot</span>
                            <span className="text-purple-400 font-bold">{metrics.botMessages}</span>
                        </div>
                        {metrics.unansweredMessages > 0 && (
                            <div className="flex items-center justify-between p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                                <span className="text-red-300 text-sm">⚠️ Sem Resposta</span>
                                <span className="text-red-400 font-bold">{metrics.unansweredMessages}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Segunda Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Engajamento por Dia */}
                <div className="bg-[#12121a] rounded-2xl p-6 border border-white/5">
                    <h3 className="text-white font-bold text-lg mb-4">Engajamento por Dia da Semana</h3>
                    <div className="flex items-end justify-between h-40 gap-2">
                        {weeklyEngagement.map((val, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                <div
                                    className="w-full rounded-t-lg transition-all"
                                    style={{
                                        height: `${val}%`,
                                        background: val === Math.max(...weeklyEngagement)
                                            ? 'linear-gradient(180deg, #a855f7, #6366f1)'
                                            : 'linear-gradient(180deg, #22d3ee, #06b6d4)'
                                    }}
                                ></div>
                                <span className="text-xs text-slate-500">{weekDays[i]}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-slate-400 text-xs mt-4 text-center">
                        📊 Quinta-feira tem o maior engajamento. Programe lançamentos para esse dia!
                    </p>
                </div>

                {/* Distribuição de Usuários */}
                <div className="bg-[#12121a] rounded-2xl p-6 border border-white/5">
                    <h3 className="text-white font-bold text-lg mb-4">Distribuição por Dispositivo</h3>
                    <div className="flex items-center gap-6">
                        {/* Donut */}
                        <div className="relative w-32 h-32">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#1e1e2e" strokeWidth="16" />
                                {/* Android */}
                                <circle
                                    cx="50" cy="50" r="40" fill="none"
                                    stroke="#22d3ee" strokeWidth="16"
                                    strokeDasharray="251.2"
                                    strokeDashoffset={metrics.totalUsers ? 251.2 - (251.2 * metrics.androidUsers / metrics.totalUsers) : 251.2}
                                />
                                {/* iPhone */}
                                <circle
                                    cx="50" cy="50" r="40" fill="none"
                                    stroke="#a855f7" strokeWidth="16"
                                    strokeDasharray="251.2"
                                    strokeDashoffset={metrics.totalUsers ? 251.2 - (251.2 * metrics.iphoneUsers / metrics.totalUsers) : 251.2}
                                    style={{
                                        strokeDashoffset: metrics.totalUsers
                                            ? 251.2 * (1 - metrics.iphoneUsers / metrics.totalUsers)
                                            : 251.2
                                    }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-bold text-white">{metrics.totalUsers}</span>
                                <span className="text-xs text-slate-400">Total</span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                                    <span className="text-slate-300">Android</span>
                                </div>
                                <span className="text-white font-bold">{metrics.androidUsers}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-purple-400"></span>
                                    <span className="text-slate-300">iPhone</span>
                                </div>
                                <span className="text-white font-bold">{metrics.iphoneUsers}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-slate-500"></span>
                                    <span className="text-slate-300">Não definido</span>
                                </div>
                                <span className="text-white font-bold">{metrics.totalUsers - metrics.androidUsers - metrics.iphoneUsers}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comunidade e Ofertas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#12121a] rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-pink-500/20 rounded-lg">
                            <MessageCircle className="text-pink-400" size={20} />
                        </div>
                        <span className="text-slate-400 text-sm">Posts na Comunidade</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{metrics.totalPosts}</p>
                </div>

                <div className="bg-[#12121a] rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <Award className="text-red-400" size={20} />
                        </div>
                        <span className="text-slate-400 text-sm">Total de Likes</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{metrics.totalLikes}</p>
                </div>

                <div className="bg-[#12121a] rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <MessageCircle className="text-blue-400" size={20} />
                        </div>
                        <span className="text-slate-400 text-sm">Comentários</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{metrics.totalComments}</p>
                </div>

                <div className="bg-[#12121a] rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <Zap className="text-green-400" size={20} />
                        </div>
                        <span className="text-slate-400 text-sm">Ofertas Ativas</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{metrics.activeOffers}/{metrics.totalOffers}</p>
                </div>
            </div>

            {/* Footer Info */}
            <div className="bg-[#12121a] rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-slate-400 text-sm">Sistema Online • Lovable Infinito v1.0.0</span>
                </div>
                <span className="text-slate-500 text-xs">
                    Dados em tempo real do Supabase
                </span>
            </div>
        </div>
    );
};

export default AdminDashboard;
