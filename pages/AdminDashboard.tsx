import React, { useState, useEffect } from 'react';
import { Users, BookOpen, PlayCircle, MessageCircle, TrendingUp, Award, Eye, Clock, AlertTriangle, CheckCircle, XCircle, Zap, Target, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BusinessMetrics {
    totalUsers: number;
    newUsersThisMonth: number;
    newUsersLastMonth: number;
    userGrowthRate: number;
    activeUsersToday: number;
    androidUsers: number;
    iphoneUsers: number;
    totalCourses: number;
    totalModules: number;
    totalLessons: number;
    totalWatchTime: number;
    coursesWithoutLessons: number;
    totalProgress: number;
    completedLessons: number;
    inProgressLessons: number;
    avgCompletionRate: number;
    totalSupportMessages: number;
    userMessages: number;
    adminMessages: number;
    botMessages: number;
    unansweredMessages: number;
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    avgEngagementRate: number;
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

            // Datas necessárias
            const now = new Date();
            const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            // TODAS AS CHAMADAS EM PARALELO para máxima velocidade
            const [
                usersResult,
                newUsersThisMonthResult,
                newUsersLastMonthResult,
                activeUsersTodayResult,
                androidUsersResult,
                iphoneUsersResult,
                coursesResult,
                modulesResult,
                lessonsResult,
                lessonsDataResult,
                coursesWithModulesResult,
                progressResult,
                completedResult,
                supportResult,
                adminMessagesResult,
                botMessagesResult,
                postsResult,
                postsDataResult,
                commentsResult,
                offersResult,
                activeOffersResult
            ] = await Promise.all([
                // Usuários
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', firstDayThisMonth.toISOString()),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', firstDayLastMonth.toISOString()).lt('created_at', firstDayThisMonth.toISOString()),
                supabase.from('user_progress').select('user_id', { count: 'exact', head: true }).gte('last_watched_at', today.toISOString()),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('device_type', 'android'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('device_type', 'iphone'),
                // Conteúdo
                supabase.from('courses').select('*', { count: 'exact', head: true }),
                supabase.from('modules').select('*', { count: 'exact', head: true }),
                supabase.from('lessons').select('*', { count: 'exact', head: true }),
                supabase.from('lessons').select('duration_seconds'),
                supabase.from('courses').select('id, modules(id, lessons(id))'),
                // Progresso
                supabase.from('user_progress').select('*', { count: 'exact', head: true }),
                supabase.from('user_progress').select('*', { count: 'exact', head: true }).eq('completed', true),
                // Suporte
                supabase.from('support_messages').select('*', { count: 'exact', head: true }),
                supabase.from('support_messages').select('*', { count: 'exact', head: true }).eq('is_admin', true),
                supabase.from('support_messages').select('*', { count: 'exact', head: true }).eq('is_bot', true),
                // Comunidade
                supabase.from('posts').select('*', { count: 'exact', head: true }),
                supabase.from('posts').select('likes_count'),
                supabase.from('comments').select('*', { count: 'exact', head: true }),
                // Ofertas
                supabase.from('offers').select('*', { count: 'exact', head: true }),
                supabase.from('offers').select('*', { count: 'exact', head: true }).eq('status', 'active')
            ]);

            // Processar resultados
            const totalUsers = usersResult.count || 0;
            const newUsersThisMonth = newUsersThisMonthResult.count || 0;
            const newUsersLastMonth = newUsersLastMonthResult.count || 0;
            const activeUsersToday = activeUsersTodayResult.count || 0;
            const androidUsers = androidUsersResult.count || 0;
            const iphoneUsers = iphoneUsersResult.count || 0;
            const totalCourses = coursesResult.count || 0;
            const totalModules = modulesResult.count || 0;
            const totalLessons = lessonsResult.count || 0;
            const totalWatchTime = lessonsDataResult.data?.reduce((acc, l) => acc + (l.duration_seconds || 0), 0) || 0;
            const coursesWithoutLessons = coursesWithModulesResult.data?.filter(c => !c.modules?.some((m: any) => m.lessons?.length > 0)).length || 0;
            const totalProgress = progressResult.count || 0;
            const completedLessons = completedResult.count || 0;
            const inProgressLessons = totalProgress - completedLessons;
            const avgCompletionRate = totalProgress ? Math.round(completedLessons / totalProgress * 100) : 0;
            const totalSupportMessages = supportResult.count || 0;
            const adminMessages = adminMessagesResult.count || 0;
            const botMessages = botMessagesResult.count || 0;
            const userMessages = totalSupportMessages - adminMessages - botMessages;
            const unansweredMessages = Math.max(0, userMessages - adminMessages);
            const totalPosts = postsResult.count || 0;
            const totalLikes = postsDataResult.data?.reduce((acc, p) => acc + (p.likes_count || 0), 0) || 0;
            const totalComments = commentsResult.count || 0;
            const avgEngagementRate = totalPosts ? Math.round((totalLikes + totalComments) / totalPosts) : 0;
            const totalOffers = offersResult.count || 0;
            const activeOffers = activeOffersResult.count || 0;
            const userGrowthRate = newUsersLastMonth ? Math.round((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100) : (newUsersThisMonth > 0 ? 100 : 0);

            setMetrics({
                totalUsers,
                newUsersThisMonth,
                newUsersLastMonth,
                userGrowthRate,
                activeUsersToday,
                androidUsers,
                iphoneUsers,
                totalCourses,
                totalModules,
                totalLessons,
                totalWatchTime: Math.round(totalWatchTime / 3600),
                coursesWithoutLessons,
                totalProgress,
                completedLessons,
                inProgressLessons,
                avgCompletionRate,
                totalSupportMessages,
                userMessages,
                adminMessages,
                botMessages,
                unansweredMessages,
                totalPosts,
                totalLikes,
                totalComments,
                avgEngagementRate,
                activeOffers,
                totalOffers
            });
        } catch (err) {
            console.error('Error loading business metrics:', err);
        } finally {
            setLoading(false);
        }
    };

    const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const weeklyEngagement = [65, 80, 75, 90, 85, 45, 35];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96 bg-[#0a0a12]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a12] p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400 text-xs mt-1">Atualizado agora</p>
                </div>
                <button
                    onClick={loadBusinessMetrics}
                    className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-all flex items-center gap-2 text-sm"
                >
                    <Activity size={16} />
                    Atualizar
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-900/30 rounded-xl p-4 border border-cyan-500/30">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="text-cyan-400" size={20} />
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${metrics.userGrowthRate >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {metrics.userGrowthRate >= 0 ? '+' : ''}{metrics.userGrowthRate}%
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-white">{metrics.totalUsers}</p>
                    <p className="text-cyan-400 text-xs">Usuários</p>
                </div>

                <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/30 rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="text-purple-400" size={20} />
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">mês</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{metrics.newUsersThisMonth}</p>
                    <p className="text-purple-400 text-xs">Novos</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/30 rounded-xl p-4 border border-emerald-500/30">
                    <div className="flex items-center justify-between mb-2">
                        <Target className="text-emerald-400" size={20} />
                    </div>
                    <p className="text-2xl font-bold text-white">{metrics.avgCompletionRate}%</p>
                    <p className="text-emerald-400 text-xs">Conclusão</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-900/30 rounded-xl p-4 border border-yellow-500/30">
                    <div className="flex items-center justify-between mb-2">
                        <Zap className="text-yellow-400" size={20} />
                    </div>
                    <p className="text-2xl font-bold text-white">{metrics.activeUsersToday}</p>
                    <p className="text-yellow-400 text-xs">Ativos Hoje</p>
                </div>
            </div>

            {/* Alertas */}
            {(metrics.coursesWithoutLessons > 0 || metrics.unansweredMessages > 0) && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="text-red-400" size={18} />
                        <h3 className="text-red-400 font-bold text-sm">Gargalos</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {metrics.coursesWithoutLessons > 0 && (
                            <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded-lg text-sm">
                                <XCircle className="text-red-400" size={16} />
                                <span className="text-white">{metrics.coursesWithoutLessons} cursos sem aulas</span>
                            </div>
                        )}
                        {metrics.unansweredMessages > 0 && (
                            <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded-lg text-sm">
                                <MessageCircle className="text-red-400" size={16} />
                                <span className="text-white">{metrics.unansweredMessages} msgs sem resposta</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Grid Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Conteúdo */}
                <div className="bg-[#12121a] rounded-xl p-4 border border-white/5">
                    <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                        <BookOpen className="text-cyan-400" size={16} />
                        Conteúdo
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                            <span className="text-slate-300 text-sm">Cursos</span>
                            <span className="text-white font-bold">{metrics.totalCourses}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                            <span className="text-slate-300 text-sm">Módulos</span>
                            <span className="text-white font-bold">{metrics.totalModules}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                            <span className="text-slate-300 text-sm">Aulas</span>
                            <span className="text-white font-bold">{metrics.totalLessons}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-cyan-500/10 rounded-lg">
                            <span className="text-cyan-300 text-sm">Horas</span>
                            <span className="text-cyan-400 font-bold">{metrics.totalWatchTime}h</span>
                        </div>
                    </div>
                </div>

                {/* Progresso */}
                <div className="bg-[#12121a] rounded-xl p-4 border border-white/5">
                    <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                        <PlayCircle className="text-purple-400" size={16} />
                        Progresso
                    </h3>
                    <div className="flex items-center justify-center mb-3">
                        <div className="relative w-24 h-24">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#1e1e2e" strokeWidth="10" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="url(#grad)" strokeWidth="10"
                                    strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * metrics.avgCompletionRate / 100)} strokeLinecap="round" />
                                <defs><linearGradient id="grad"><stop offset="0%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#a855f7" /></linearGradient></defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-bold text-white">{metrics.avgCompletionRate}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-green-400 flex items-center gap-1"><CheckCircle size={12} /> Concluídas</span>
                            <span className="text-white font-bold">{metrics.completedLessons}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-yellow-400 flex items-center gap-1"><Clock size={12} /> Em Progresso</span>
                            <span className="text-white font-bold">{metrics.inProgressLessons}</span>
                        </div>
                    </div>
                </div>

                {/* Suporte */}
                <div className="bg-[#12121a] rounded-xl p-4 border border-white/5">
                    <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                        <MessageCircle className="text-rose-400" size={16} />
                        Suporte
                    </h3>
                    <div className="text-center mb-3">
                        <p className="text-3xl font-bold text-white">{metrics.totalSupportMessages}</p>
                        <p className="text-slate-400 text-xs">Mensagens</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between p-1.5 bg-blue-500/10 rounded text-xs">
                            <span className="text-blue-300">Usuários</span>
                            <span className="text-blue-400 font-bold">{metrics.userMessages}</span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 bg-green-500/10 rounded text-xs">
                            <span className="text-green-300">Admin</span>
                            <span className="text-green-400 font-bold">{metrics.adminMessages}</span>
                        </div>
                        {metrics.unansweredMessages > 0 && (
                            <div className="flex items-center justify-between p-1.5 bg-red-500/20 rounded text-xs border border-red-500/30">
                                <span className="text-red-300">⚠️ Sem Resposta</span>
                                <span className="text-red-400 font-bold">{metrics.unansweredMessages}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Engajamento */}
                <div className="bg-[#12121a] rounded-xl p-4 border border-white/5">
                    <h3 className="text-white font-bold text-sm mb-3">Engajamento / Dia</h3>
                    <div className="flex items-end justify-between h-28 gap-1">
                        {weeklyEngagement.map((val, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 flex-1">
                                <div className="w-full rounded-t transition-all" style={{ height: `${val}%`, background: val === 90 ? 'linear-gradient(180deg, #a855f7, #6366f1)' : 'linear-gradient(180deg, #22d3ee, #06b6d4)' }}></div>
                                <span className="text-[10px] text-slate-500">{weekDays[i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dispositivos */}
                <div className="bg-[#12121a] rounded-xl p-4 border border-white/5">
                    <h3 className="text-white font-bold text-sm mb-3">Dispositivos</h3>
                    <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#1e1e2e" strokeWidth="14" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#22d3ee" strokeWidth="14"
                                    strokeDasharray="251.2" strokeDashoffset={metrics.totalUsers ? 251.2 - (251.2 * metrics.androidUsers / metrics.totalUsers) : 251.2} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-lg font-bold text-white">{metrics.totalUsers}</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Android</span>
                                <span className="text-white font-bold">{metrics.androidUsers}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400"></span> iPhone</span>
                                <span className="text-white font-bold">{metrics.iphoneUsers}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-500"></span> Outro</span>
                                <span className="text-white font-bold">{metrics.totalUsers - metrics.androidUsers - metrics.iphoneUsers}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 3 - Comunidade */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#12121a] rounded-xl p-4 border border-white/5">
                    <MessageCircle className="text-pink-400 mb-2" size={18} />
                    <p className="text-xl font-bold text-white">{metrics.totalPosts}</p>
                    <p className="text-slate-400 text-xs">Posts</p>
                </div>
                <div className="bg-[#12121a] rounded-xl p-4 border border-white/5">
                    <Award className="text-red-400 mb-2" size={18} />
                    <p className="text-xl font-bold text-white">{metrics.totalLikes}</p>
                    <p className="text-slate-400 text-xs">Likes</p>
                </div>
                <div className="bg-[#12121a] rounded-xl p-4 border border-white/5">
                    <MessageCircle className="text-blue-400 mb-2" size={18} />
                    <p className="text-xl font-bold text-white">{metrics.totalComments}</p>
                    <p className="text-slate-400 text-xs">Comentários</p>
                </div>
                <div className="bg-[#12121a] rounded-xl p-4 border border-white/5">
                    <Zap className="text-green-400 mb-2" size={18} />
                    <p className="text-xl font-bold text-white">{metrics.activeOffers}/{metrics.totalOffers}</p>
                    <p className="text-slate-400 text-xs">Ofertas</p>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-[#12121a] rounded-xl p-3 border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-slate-400">Sistema Online • v1.0.7</span>
                </div>
                <span className="text-slate-500">Supabase Realtime</span>
            </div>
        </div>
    );
};

export default AdminDashboard;
