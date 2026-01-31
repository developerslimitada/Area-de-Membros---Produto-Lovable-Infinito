import React, { useState, useEffect } from 'react';
import { Users, BookOpen, PlayCircle, MessageCircle, TrendingUp, Award, Clock, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

interface DashboardStats {
    totalUsers: number;
    totalCourses: number;
    totalLessons: number;
    totalSupportMessages: number;
    newUsersThisMonth: number;
    activeCourses: number;
}

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalCourses: 0,
        totalLessons: 0,
        totalSupportMessages: 0,
        newUsersThisMonth: 0,
        activeCourses: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardStats();
    }, []);

    const loadDashboardStats = async () => {
        try {
            setLoading(true);

            // Total Users
            const { count: usersCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            // Total Courses
            const { count: coursesCount } = await supabase
                .from('courses')
                .select('*', { count: 'exact', head: true });

            // Total Lessons
            const { count: lessonsCount } = await supabase
                .from('lessons')
                .select('*', { count: 'exact', head: true });

            // Total Support Messages
            const { count: supportCount } = await supabase
                .from('support_messages')
                .select('*', { count: 'exact', head: true });

            // New Users This Month
            const firstDayOfMonth = new Date();
            firstDayOfMonth.setDate(1);
            firstDayOfMonth.setHours(0, 0, 0, 0);

            const { count: newUsersCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', firstDayOfMonth.toISOString());

            // Active Courses (with lessons)
            const { data: coursesWithLessons } = await supabase
                .from('courses')
                .select('id, modules(id, lessons(id))');

            const activeCourses = coursesWithLessons?.filter(course =>
                course.modules?.some((module: any) => module.lessons?.length > 0)
            ).length || 0;

            setStats({
                totalUsers: usersCount || 0,
                totalCourses: coursesCount || 0,
                totalLessons: lessonsCount || 0,
                totalSupportMessages: supportCount || 0,
                newUsersThisMonth: newUsersCount || 0,
                activeCourses
            });
        } catch (err) {
            console.error('Error loading dashboard stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total de Usuários',
            value: stats.totalUsers,
            icon: Users,
            color: 'indigo',
            gradient: 'from-indigo-600/20 to-purple-600/20',
            border: 'border-indigo-500/50',
            shadow: 'shadow-[0_0_30px_rgba(99,102,241,0.3)]'
        },
        {
            title: 'Novos Usuários (Mês)',
            value: stats.newUsersThisMonth,
            icon: TrendingUp,
            color: 'emerald',
            gradient: 'from-emerald-600/20 to-green-600/20',
            border: 'border-emerald-500/50',
            shadow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]'
        },
        {
            title: 'Total de Cursos',
            value: stats.totalCourses,
            icon: BookOpen,
            color: 'cyan',
            gradient: 'from-cyan-600/20 to-blue-600/20',
            border: 'border-cyan-500/50',
            shadow: 'shadow-[0_0_30px_rgba(6,182,212,0.3)]'
        },
        {
            title: 'Cursos Ativos',
            value: stats.activeCourses,
            icon: Award,
            color: 'yellow',
            gradient: 'from-yellow-600/20 to-orange-600/20',
            border: 'border-yellow-500/50',
            shadow: 'shadow-[0_0_30px_rgba(234,179,8,0.3)]'
        },
        {
            title: 'Total de Aulas',
            value: stats.totalLessons,
            icon: PlayCircle,
            color: 'pink',
            gradient: 'from-pink-600/20 to-rose-600/20',
            border: 'border-pink-500/50',
            shadow: 'shadow-[0_0_30px_rgba(236,72,153,0.3)]'
        },
        {
            title: 'Mensagens de Suporte',
            value: stats.totalSupportMessages,
            icon: MessageCircle,
            color: 'violet',
            gradient: 'from-violet-600/20 to-purple-600/20',
            border: 'border-violet-500/50',
            shadow: 'shadow-[0_0_30px_rgba(139,92,246,0.3)]'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-xs font-black text-slate-600 uppercase tracking-widest animate-pulse">Carregando Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-white tracking-tight uppercase">Painel Geral</h1>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Visão geral da plataforma</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative overflow-hidden bg-gradient-to-br ${card.gradient} rounded-[2.5rem] border-2 ${card.border} ${card.shadow} p-8 group hover:scale-105 transition-all duration-300`}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-all" />

                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">{card.title}</p>
                                <p className="text-5xl font-black text-white tracking-tight">{card.value}</p>
                            </div>
                            <div className={`p-4 bg-${card.color}-500/20 rounded-2xl`}>
                                <card.icon size={32} className={`text-${card.color}-400`} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-[#0f0f13] rounded-[2.5rem] border border-white/5 shadow-2xl p-8">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6">Ações Rápidas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <a
                        href="/admin/users"
                        className="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/10 transition-all group"
                    >
                        <Users size={24} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                        <div>
                            <p className="text-sm font-black text-white">Gerenciar Usuários</p>
                            <p className="text-xs text-slate-500 mt-1">Ver todos os usuários</p>
                        </div>
                    </a>
                    <a
                        href="/admin/courses"
                        className="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all group"
                    >
                        <BookOpen size={24} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                        <div>
                            <p className="text-sm font-black text-white">Gerenciar Cursos</p>
                            <p className="text-xs text-slate-500 mt-1">Criar e editar cursos</p>
                        </div>
                    </a>
                    <a
                        href="/admin/support"
                        className="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-violet-500/30 hover:bg-violet-500/10 transition-all group"
                    >
                        <MessageCircle size={24} className="text-violet-400 group-hover:scale-110 transition-transform" />
                        <div>
                            <p className="text-sm font-black text-white">Suporte</p>
                            <p className="text-xs text-slate-500 mt-1">Ver mensagens</p>
                        </div>
                    </a>
                    <a
                        href="/admin/feed"
                        className="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-yellow-500/30 hover:bg-yellow-500/10 transition-all group"
                    >
                        <Zap size={24} className="text-yellow-400 group-hover:scale-110 transition-transform" />
                        <div>
                            <p className="text-sm font-black text-white">Feed</p>
                            <p className="text-xs text-slate-500 mt-1">Gerenciar posts</p>
                        </div>
                    </a>
                </div>
            </div>

            {/* System Info */}
            <div className="bg-[#0f0f13] rounded-[2.5rem] border border-white/5 shadow-2xl p-8">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6">Informações do Sistema</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3 mb-3">
                            <Clock size={20} className="text-indigo-400" />
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Status</p>
                        </div>
                        <p className="text-2xl font-black text-emerald-400">Online</p>
                        <p className="text-xs text-slate-600 mt-2">Sistema operacional</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3 mb-3">
                            <Award size={20} className="text-yellow-400" />
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Versão</p>
                        </div>
                        <p className="text-2xl font-black text-white">1.0.0</p>
                        <p className="text-xs text-slate-600 mt-2">Lovable Infinito</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3 mb-3">
                            <TrendingUp size={20} className="text-cyan-400" />
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Performance</p>
                        </div>
                        <p className="text-2xl font-black text-cyan-400">Excelente</p>
                        <p className="text-xs text-slate-600 mt-2">Todos os sistemas OK</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
