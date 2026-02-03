import React, { useState, useEffect } from 'react';
import { Video, Save, Eye, EyeOff, Youtube, Link as LinkIcon, Play, Smartphone, Apple } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

interface VSLSettings {
    enabled: boolean;
    selected_device: 'android' | 'iphone';
    iphone_video_url: string;
    android_video_url: string;
    video_type: 'youtube' | 'drive' | 'url';
    autoplay: boolean;
    muted: boolean;
    show_pwa_message: boolean;
}

const AdminVSL: React.FC = () => {
    const [settings, setSettings] = useState<VSLSettings>({
        enabled: false,
        selected_device: 'iphone',
        iphone_video_url: '',
        android_video_url: '',
        video_type: 'youtube',
        autoplay: true,
        muted: true,
        show_pwa_message: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .eq('key', 'vsl_settings')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setSettings(data.value as unknown as VSLSettings);
            }
        } catch (err) {
            console.error('Error loading VSL settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        try {
            setSaving(true);
            setMessage(null);

            const { data: existing } = await supabase
                .from('site_settings')
                .select('id')
                .eq('key', 'vsl_settings')
                .single();

            if (existing) {
                const { error } = await supabase
                    .from('site_settings')
                    .update({ value: settings, updated_at: new Date().toISOString() })
                    .eq('key', 'vsl_settings');

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('site_settings')
                    .insert([{ key: 'vsl_settings', value: settings }]);

                if (error) throw error;
            }

            setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
        } catch (err) {
            console.error('Error saving VSL settings:', err);
            setMessage({ type: 'error', text: 'Erro ao salvar configurações.' });
        } finally {
            setSaving(false);
        }
    };

    const getVideoId = (url: string) => {
        if (settings.video_type === 'youtube') {
            const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            return match ? match[1] : '';
        }
        return url;
    };

    const getEmbedUrl = () => {
        const videoUrl = settings.selected_device === 'android'
            ? settings.android_video_url
            : settings.iphone_video_url;

        if (!videoUrl) return '';

        if (settings.video_type === 'youtube') {
            const videoId = getVideoId(videoUrl);
            return `https://www.youtube.com/embed/${videoId}?autoplay=${settings.autoplay ? 1 : 0}&mute=${settings.muted ? 1 : 0}`;
        }

        return videoUrl;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">Vídeos Login (VSL)</h1>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Configurar vídeo da página de login</p>
                </div>
                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] active:scale-95 shrink-0 disabled:opacity-50"
                >
                    <Save size={18} strokeWidth={3} />
                    {saving ? 'Salvando...' : 'Salvar Configurações'}
                </button>
            </div>

            {/* Message */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                >
                    <p className="font-bold text-sm">{message.text}</p>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Settings */}
                <div className="bg-[#0f0f13] rounded-[2.5rem] border border-white/5 shadow-2xl p-8 space-y-8">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Configurações</h2>

                    {/* Enable/Disable */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Status do VSL</label>
                        <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
                            {[
                                { id: true, label: 'Ativo', icon: Eye },
                                { id: false, label: 'Inativo', icon: EyeOff },
                            ].map(type => (
                                <button
                                    key={String(type.id)}
                                    onClick={() => setSettings({ ...settings, enabled: type.id })}
                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all flex items-center justify-center gap-2 ${settings.enabled === type.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'}`}
                                >
                                    <type.icon size={14} />
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Video Type */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Tipo de Vídeo</label>
                        <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
                            {[
                                { id: 'youtube', label: 'YouTube', icon: Youtube },
                                { id: 'drive', label: 'Drive', icon: Video },
                                { id: 'url', label: 'URL', icon: LinkIcon },
                            ].map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setSettings({ ...settings, video_type: type.id as any })}
                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all flex items-center justify-center gap-2 ${settings.video_type === type.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'}`}
                                >
                                    <type.icon size={14} />
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Device Selector */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Dispositivo do Vídeo</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setSettings({ ...settings, selected_device: 'iphone' })}
                                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${settings.selected_device === 'iphone' ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                            >
                                <Apple size={32} className={settings.selected_device === 'iphone' ? 'text-indigo-400' : 'text-slate-500'} />
                                <span className={`text-xs font-black uppercase tracking-widest ${settings.selected_device === 'iphone' ? 'text-white' : 'text-slate-500'}`}>iPhone</span>
                            </button>
                            <button
                                onClick={() => setSettings({ ...settings, selected_device: 'android' })}
                                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${settings.selected_device === 'android' ? 'bg-emerald-600/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                            >
                                <Smartphone size={32} className={settings.selected_device === 'android' ? 'text-emerald-400' : 'text-slate-500'} />
                                <span className={`text-xs font-black uppercase tracking-widest ${settings.selected_device === 'android' ? 'text-white' : 'text-slate-500'}`}>Android</span>
                            </button>
                        </div>
                    </div>

                    {/* iPhone Video URL */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Apple size={12} /> URL do Vídeo iPhone
                        </label>
                        <div className="relative">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                            <input
                                type="url"
                                value={settings.iphone_video_url}
                                onChange={(e) => setSettings({ ...settings, iphone_video_url: e.target.value })}
                                placeholder={settings.video_type === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'https://...'}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all text-white text-sm font-bold placeholder:text-slate-700"
                            />
                        </div>
                    </div>

                    {/* Android Video URL */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Smartphone size={12} /> URL do Vídeo Android
                        </label>
                        <div className="relative">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                            <input
                                type="url"
                                value={settings.android_video_url}
                                onChange={(e) => setSettings({ ...settings, android_video_url: e.target.value })}
                                placeholder={settings.video_type === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'https://...'}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/10 transition-all text-white text-sm font-bold placeholder:text-slate-700"
                            />
                        </div>
                    </div>

                    {/* PWA Message Toggle */}
                    <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                        <div>
                            <p className="text-sm font-black text-white">Mensagem PWA</p>
                            <p className="text-xs text-slate-500 mt-1">Mostrar mensagem de instalação do app</p>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, show_pwa_message: !settings.show_pwa_message })}
                            className={`w-14 h-8 rounded-full transition-all ${settings.show_pwa_message ? 'bg-indigo-600' : 'bg-slate-700'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full transition-all ${settings.show_pwa_message ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Autoplay */}
                    <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                        <div>
                            <p className="text-sm font-black text-white">Autoplay</p>
                            <p className="text-xs text-slate-500 mt-1">Iniciar vídeo automaticamente</p>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, autoplay: !settings.autoplay })}
                            className={`w-14 h-8 rounded-full transition-all ${settings.autoplay ? 'bg-indigo-600' : 'bg-slate-700'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full transition-all ${settings.autoplay ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Muted */}
                    <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                        <div>
                            <p className="text-sm font-black text-white">Mudo</p>
                            <p className="text-xs text-slate-500 mt-1">Iniciar vídeo sem som</p>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, muted: !settings.muted })}
                            className={`w-14 h-8 rounded-full transition-all ${settings.muted ? 'bg-indigo-600' : 'bg-slate-700'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full transition-all ${settings.muted ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                {/* Preview */}
                <div className="bg-[#0f0f13] rounded-[2.5rem] border border-white/5 shadow-2xl p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Preview</h2>
                        {settings.enabled && (
                            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Ativo
                            </span>
                        )}
                    </div>

                    {(settings.selected_device === 'android' ? settings.android_video_url : settings.iphone_video_url) ? (
                        <div className="aspect-video rounded-3xl overflow-hidden bg-black/50 border border-white/5">
                            {settings.video_type === 'youtube' ? (
                                <iframe
                                    src={getEmbedUrl()}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <video
                                    src={settings.selected_device === 'android' ? settings.android_video_url : settings.iphone_video_url}
                                    controls
                                    autoPlay={settings.autoplay}
                                    muted={settings.muted}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                    ) : (
                        <div className="aspect-video rounded-3xl overflow-hidden bg-black/50 border border-white/5 flex flex-col items-center justify-center">
                            <Play size={64} className="text-slate-700 mb-4" />
                            <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Adicione uma URL de vídeo</p>
                        </div>
                    )}

                    <div className="space-y-3 p-6 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Informações</p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Status:</span>
                                <span className={`font-bold ${settings.enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    {settings.enabled ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Tipo:</span>
                                <span className="font-bold text-white uppercase">{settings.video_type}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Autoplay:</span>
                                <span className="font-bold text-white">{settings.autoplay ? 'Sim' : 'Não'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Mudo:</span>
                                <span className="font-bold text-white">{settings.muted ? 'Sim' : 'Não'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminVSL;
