
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, BarChart3, Award, User, BookOpen, ShoppingBag } from 'lucide-react';

const StudentNavbar = () => {
    const location = useLocation();
    const isAdminPreview = location.pathname.includes('/admin/preview/student');

    // Mapped links to match previous Sidebar functionality
    const links = [
        { label: 'Cursos', path: isAdminPreview ? '/admin/preview/student/courses' : '/student/courses', icon: BookOpen },
        { label: 'Feed', path: isAdminPreview ? '/admin/preview/student/feed' : '/student/feed', icon: TrendingUp },
        { label: 'Comunidade', path: isAdminPreview ? '/admin/preview/student/community' : '/student/community', icon: ShoppingBag },
        { label: 'Perfil', path: isAdminPreview ? '/admin/preview/student/profile' : '/student/profile', icon: User },
    ];

    const isActive = (path: string) => {
        return location.pathname === path || (path !== '/' && location.pathname.startsWith(path + '/'));
    };

    return (
        <nav className={`
            flex items-center justify-center w-full px-4 py-3 pb-safe
            bg-[#1a1a1a]/95 backdrop-blur-xl border-t border-white/10 
            text-slate-200 fixed bottom-0 z-50 transition-all duration-300
            min-h-[70px] safe-bottom
        `}>

            <div className="flex items-center justify-around w-full max-w-md gap-1">
                {links.map((link) => {
                    const active = isActive(link.path);
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`
                                flex flex-col items-center justify-center gap-1.5 
                                min-w-[70px] min-h-[56px] px-4 py-3 rounded-3xl
                                transition-all duration-300 active:scale-95
                                ${active
                                    ? 'text-white bg-red-600/20 shadow-[0_0_20px_rgba(239,68,68,0.3)] border border-red-600/30'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10'
                                }
                            `}
                        >
                            <link.icon size={24} strokeWidth={2.5} className={active ? 'text-red-500' : ''} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{link.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    );
}

export default StudentNavbar;
