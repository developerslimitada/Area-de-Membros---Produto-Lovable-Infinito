import React, { useState, useEffect } from 'react';
import { Users, BookOpen, PlayCircle, MessageCircle, TrendingUp, Award, Mail, Phone, Clock, BarChart3, PieChart } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardStats {
    totalUsers: number;
    totalCourses: number;
    totalLessons: number;
    totalSupportMessages: number;
    newUsersThisMonth: number;
    activeCourses: number;
    solvedTickets: number;
    openTickets: number;
}

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalCourses: 0,
        totalLessons: 0,
        totalSupportMessages: 0,
        newUsersThisMonth: 0,
        activeCourses: 0,
        solvedTickets: 0,
        openTickets: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardStats();
    }, []);

    const loadDashboardStats = async () => {
        try {
            setLoading(true);

            const { count: usersCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            const { count: coursesCount } = await supabase
                .from('courses')
                .select('*', { count: 'exact', head: true });

            const { count: lessonsCount } = await supabase
                .from('lessons')
                .select('*', { count: 'exact', head: true });

            const { count: supportCount } = await supabase
                .from('support_messages')
                .select('*', { count: 'exact', head: true });

            const firstDayOfMonth = new Date();
            firstDayOfMonth.setDate(1);
            firstDayOfMonth.setHours(0, 0, 0, 0);

            const { count: newUsersCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', firstDayOfMonth.toISOString());

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
                activeCourses,
                solvedTickets: Math.floor((supportCount || 0) * 0.7),
                openTickets: Math.floor((supportCount || 0) * 0.3)
            });
        } catch (err) {
            console.error('Error loading dashboard stats:', err);
        } finally {
            setLoading(false);
        }
    };

    // Chart data simulation
    const monthlyData = [40, 35, 50, 68, 55, 45, 60];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];
    const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const weeklyData = [45, 80, 65, 90, 55, 30];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96 bg-[#0a0a12]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Carregando Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a12] p-6 space-y-6">
            {/* Header Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Avg First Reply Time */}
                <div className="bg-gradient-to-br from-cyan-600/30 to-cyan-900/30 rounded-2xl p-6 border border-cyan-500/30 backdrop-blur-sm">
                    <p className="text-cyan-400 text-sm font-medium mb-2">Tempo Médio Resposta</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">30</span>
                        <span className="text-cyan-400 text-lg">h</span>
                        <span className="text-4xl font-bold text-white ml-2">15</span>
                        <span className="text-cyan-400 text-lg">min</span>
                    </div>
                </div>

                {/* Avg Full Resolve Time */}
                <div className="bg-gradient-to-br from-purple-600/30 to-purple-900/30 rounded-2xl p-6 border border-purple-500/30 backdrop-blur-sm">
                    <p className="text-purple-400 text-sm font-medium mb-2">Tempo Resolução</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">22</span>
                        <span className="text-purple-400 text-lg">h</span>
                        <span className="text-4xl font-bold text-white ml-2">40</span>
                        <span className="text-purple-400 text-lg">min</span>
                    </div>
                </div>

                {/* Messages */}
                <div className="bg-[#12121a] rounded-2xl p-4 border border-white/5 flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                        <MessageCircle className="text-purple-400" size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-slate-400 text-sm">Mensagens</p>
                        <p className="text-white font-bold text-xl">{stats.totalSupportMessages}</p>
                    </div>
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">-20%</span>
                </div>

                {/* Emails/Users */}
                <div className="bg-[#12121a] rounded-2xl p-4 border border-white/5 flex items-center gap-4">
                    <div className="p-3 bg-cyan-500/20 rounded-xl">
                        <Users className="text-cyan-400" size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-slate-400 text-sm">Usuários</p>
                        <p className="text-white font-bold text-xl">{stats.totalUsers}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">+33%</span>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart - Tickets Created vs Solved */}
                <div className="lg:col-span-2 bg-[#12121a] rounded-2xl p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-white font-bold text-lg">Cursos Criados vs Acessos</h3>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                                <span className="text-slate-400">Acessos</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-purple-400"></span>
                                <span className="text-slate-400">Cursos Criados</span>
                            </span>
                        </div>
                    </div>

                    {/* Chart Area */}
                    <div className="relative h-64">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between">
                            {[80, 60, 40, 20, 0].map((val) => (
                                <div key={val} className="flex items-center gap-2">
                                    <span className="text-xs text-slate-600 w-6">{val}</span>
                                    <div className="flex-1 border-t border-white/5"></div>
                                </div>
                            ))}
                        </div>

                        {/* Line Chart Visualization */}
                        <div className="absolute inset-0 ml-8 flex items-end">
                            <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                                {/* Gradient */}
                                <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="rgba(6, 182, 212, 0.3)" />
                                        <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
                                    </linearGradient>
                                </defs>

                                {/* Area fill */}
                                <path
                                    d={`M 0 200 L 0 ${200 - monthlyData[0] * 2.5} L ${400 / 6 * 1} ${200 - monthlyData[1] * 2.5} L ${400 / 6 * 2} ${200 - monthlyData[2] * 2.5} L ${400 / 6 * 3} ${200 - monthlyData[3] * 2.5} L ${400 / 6 * 4} ${200 - monthlyData[4] * 2.5} L ${400 / 6 * 5} ${200 - monthlyData[5] * 2.5} L 400 ${200 - monthlyData[6] * 2.5} L 400 200 Z`}
                                    fill="url(#lineGradient)"
                                />

                                {/* Line */}
                                <path
                                    d={`M 0 ${200 - monthlyData[0] * 2.5} L ${400 / 6 * 1} ${200 - monthlyData[1] * 2.5} L ${400 / 6 * 2} ${200 - monthlyData[2] * 2.5} L ${400 / 6 * 3} ${200 - monthlyData[3] * 2.5} L ${400 / 6 * 4} ${200 - monthlyData[4] * 2.5} L ${400 / 6 * 5} ${200 - monthlyData[5] * 2.5} L 400 ${200 - monthlyData[6] * 2.5}`}
                                    fill="none"
                                    stroke="#06b6d4"
                                    strokeWidth="3"
                                />

                                {/* Data points */}
                                {monthlyData.map((val, i) => (
                                    <circle
                                        key={i}
                                        cx={400 / 6 * i}
                                        cy={200 - val * 2.5}
                                        r="6"
                                        fill="#0a0a12"
                                        stroke="#06b6d4"
                                        strokeWidth="3"
                                    />
                                ))}
                            </svg>
                        </div>

                        {/* Tooltip */}
                        <div className="absolute top-1/3 left-1/2 bg-purple-500 text-white text-xs px-3 py-1 rounded-lg">
                            Max = 68
                        </div>
                    </div>

                    {/* X Axis Labels */}
                    <div className="flex justify-between mt-4 ml-8 text-xs text-slate-500">
                        {months.map(month => (
                            <span key={month}>{month}</span>
                        ))}
                    </div>
                </div>

                {/* Right Column - Stats */}
                <div className="space-y-4">
                    {/* First Reply Card */}
                    <div className="bg-[#12121a] rounded-2xl p-6 border border-white/5">
                        <h3 className="text-white font-bold text-lg mb-4">Resposta e Resolução</h3>
                        <div className="relative h-32">
                            {/* Mountain Chart */}
                            <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="mountainGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="rgba(45, 212, 191, 0.4)" />
                                        <stop offset="100%" stopColor="rgba(45, 212, 191, 0)" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M 0 100 L 20 70 L 50 60 L 80 40 L 120 50 L 160 30 L 200 45 L 200 100 Z"
                                    fill="url(#mountainGradient)"
                                />
                                <path
                                    d="M 0 70 L 20 70 L 50 60 L 80 40 L 120 50 L 160 30 L 200 45"
                                    fill="none"
                                    stroke="#2dd4bf"
                                    strokeWidth="2"
                                />
                            </svg>
                            <div className="absolute top-2 right-2 bg-[#1a1a25] px-2 py-1 rounded text-xs text-teal-400">
                                2.5 horas
                            </div>
                        </div>
                        <button className="text-slate-400 text-sm hover:text-white transition-colors">
                            Ver relatório completo →
                        </button>
                    </div>

                    {/* Weekly Stats */}
                    <div className="bg-[#12121a] rounded-2xl p-6 border border-white/5">
                        <h3 className="text-white font-bold text-lg mb-4">Acessos / Dia da Semana</h3>
                        <div className="flex items-end justify-between h-32 gap-2">
                            {weeklyData.map((val, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                    <div
                                        className="w-full rounded-t-lg transition-all"
                                        style={{
                                            height: `${val}%`,
                                            background: i === 3 ? 'linear-gradient(180deg, #a855f7, #6366f1)' : 'linear-gradient(180deg, #22d3ee, #06b6d4)'
                                        }}
                                    ></div>
                                    <span className="text-xs text-slate-500">{weekDays[i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Pie Chart - By Type */}
                <div className="bg-[#12121a] rounded-2xl p-6 border border-white/5">
                    <h3 className="text-white font-bold text-lg mb-4">Cursos por Tipo</h3>
                    <div className="flex items-center gap-6">
                        {/* Donut Chart */}
                        <div className="relative w-32 h-32">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#1e1e2e" strokeWidth="20" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#a855f7" strokeWidth="20"
                                    strokeDasharray="251.2" strokeDashoffset="62.8" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#22d3ee" strokeWidth="20"
                                    strokeDasharray="251.2" strokeDashoffset="125.6" strokeDashoffset="188.4" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#f43f5e" strokeWidth="20"
                                    strokeDasharray="251.2" strokeDashoffset="213.52" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">{stats.totalCourses}</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                                <span className="text-slate-400">Marketing</span>
                                <span className="text-white font-bold ml-auto">44%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                                <span className="text-slate-400">Vendas</span>
                                <span className="text-white font-bold ml-auto">25%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                                <span className="text-slate-400">Design</span>
                                <span className="text-white font-bold ml-auto">12%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-teal-400"></span>
                                <span className="text-slate-400">Tech</span>
                                <span className="text-white font-bold ml-auto">19%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* New vs Returned */}
                <div className="bg-[#12121a] rounded-2xl p-6 border border-white/5">
                    <h3 className="text-white font-bold text-lg mb-4">Novos vs Retornados</h3>
                    <div className="flex items-center gap-6">
                        {/* Donut Chart */}
                        <div className="relative w-32 h-32">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#1e1e2e" strokeWidth="20" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#22d3ee" strokeWidth="20"
                                    strokeDasharray="251.2" strokeDashoffset="94" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xs text-slate-400">Retornados</span>
                                <span className="text-xl font-bold text-white">{stats.newUsersThisMonth * 3}</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                                    <span className="text-slate-400 text-sm">Novos Usuários</span>
                                </div>
                                <span className="text-white font-bold text-xl">{stats.newUsersThisMonth}</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                                    <span className="text-slate-400 text-sm">Usuários Retornados</span>
                                </div>
                                <span className="text-white font-bold text-xl">{stats.totalUsers - stats.newUsersThisMonth}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="bg-[#12121a] rounded-2xl p-6 border border-white/5 space-y-4">
                    <h3 className="text-white font-bold text-lg">Status do Sistema</h3>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                <span className="text-slate-300">Sistema Online</span>
                            </div>
                            <span className="text-green-400 text-sm font-bold">Ativo</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                                <BookOpen size={16} className="text-cyan-400" />
                                <span className="text-slate-300">Total de Cursos</span>
                            </div>
                            <span className="text-white font-bold">{stats.totalCourses}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                                <PlayCircle size={16} className="text-purple-400" />
                                <span className="text-slate-300">Total de Aulas</span>
                            </div>
                            <span className="text-white font-bold">{stats.totalLessons}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Award size={16} className="text-yellow-400" />
                                <span className="text-slate-300">Versão</span>
                            </div>
                            <span className="text-white font-bold">1.0.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
