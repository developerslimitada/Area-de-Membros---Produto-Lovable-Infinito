
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Video, MessageCircle, Crown, Instagram, Youtube, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface VSLSettings {
    enabled: boolean;
    iphone_video_url: string;
    android_video_url: string;
    video_type: 'youtube' | 'drive' | 'url';
    autoplay: boolean;
    muted: boolean;
}

const ThankYou: React.FC = () => {
    const navigate = useNavigate();
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [videoType, setVideoType] = useState<'youtube' | 'drive' | 'url'>('youtube');

    useEffect(() => {
        // Tentar carregar vídeo das configurações de VSL para boas-vindas
        const loadSettings = async () => {
            try {
                const { data } = await supabase
                    .from('site_settings')
                    .select('value')
                    .eq('key', 'vsl_settings')
                    .single();

                if (data) {
                    const settings = data.value as unknown as VSLSettings;
                    // Usar o vídeo de iPhone como padrão para a página de obrigado se disponível
                    const url = settings.iphone_video_url || settings.android_video_url;
                    if (url) {
                        setVideoUrl(url);
                        setVideoType(settings.video_type);
                    }
                }
            } catch (err) {
                console.error('Error loading settings:', err);
            }
        };
        loadSettings();
    }, []);

    const getEmbedUrl = (url: string) => {
        if (videoType === 'youtube') {
            const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            const videoId = match ? match[1] : '';
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0`;
        }
        return url;
    };

    return (
        <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-4xl z-10 space-y-8 text-center"
            >
                {/* Header Section */}
                <div className="space-y-4">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)]"
                    >
                        <CheckCircle className="text-emerald-500" size={40} strokeWidth={2.5} />
                    </motion.div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase italic">
                        Inscrição <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Confirmada!</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                        Seu acesso à plataforma <span className="text-white font-bold">LOVABLE INFINITO</span> foi liberado com sucesso. Assista ao vídeo abaixo para começar.
                    </p>
                </div>

                {/* Video / Content Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-black/40 border border-white/5 shadow-2xl group"
                >
                    {videoUrl ? (
                        videoType === 'youtube' ? (
                            <iframe
                                src={getEmbedUrl(videoUrl)}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <video
                                src={videoUrl}
                                controls
                                autoPlay
                                className="w-full h-full object-cover"
                            />
                        )
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center space-y-4 p-8">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/5">
                                <Video size={32} />
                            </div>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Aguardando Boas-vindas...</p>
                        </div>
                    )}
                </motion.div>

                {/* Call to Action Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.button
                        whileHover={{ scale: 1.02, translateY: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/login')}
                        className="p-6 bg-white/5 border border-white/5 rounded-3xl flex flex-col items-center gap-3 hover:bg-indigo-600/10 transition-all hover:border-indigo-500/30 group"
                    >
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            <Layout size={24} />
                        </div>
                        <div className="text-center">
                            <p className="font-black text-xs uppercase tracking-widest text-white">Acessar Área</p>
                            <p className="text-[10px] text-slate-500 mt-1">Ir para o Dashboard</p>
                        </div>
                    </motion.button>

                    <motion.a
                        href="https://chat.whatsapp.com/G9Cj0L0" // Exemplo de link de comunidade
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02, translateY: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-6 bg-white/5 border border-white/5 rounded-3xl flex flex-col items-center gap-3 hover:bg-emerald-600/10 transition-all hover:border-emerald-500/30 group"
                    >
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <MessageCircle size={24} />
                        </div>
                        <div className="text-center">
                            <p className="font-black text-xs uppercase tracking-widest text-white">Grupo VIP</p>
                            <p className="text-[10px] text-slate-500 mt-1">Comunidade no WhatsApp</p>
                        </div>
                    </motion.a>

                    <motion.a
                        href="https://instagram.com/" // Exemplo de link
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02, translateY: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-6 bg-white/5 border border-white/5 rounded-3xl flex flex-col items-center gap-3 hover:bg-pink-600/10 transition-all hover:border-pink-500/30 group"
                    >
                        <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-all">
                            <Instagram size={24} />
                        </div>
                        <div className="text-center">
                            <p className="font-black text-xs uppercase tracking-widest text-white">Siga-nos</p>
                            <p className="text-[10px] text-slate-500 mt-1">Bastidores no Instagram</p>
                        </div>
                    </motion.a>
                </div>

                {/* Footer Message */}
                <div className="pt-8">
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">
                        Lovable Infinito &copy; 2026 • Experiência Exclusiva
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ThankYou;
