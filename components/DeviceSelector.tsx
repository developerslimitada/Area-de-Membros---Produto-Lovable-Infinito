import React, { useState, useEffect } from 'react';
import { Smartphone, Apple } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getLoggedUser } from '../supabaseStore';

interface DeviceSelectorProps {
    onDeviceChange?: (device: 'android' | 'iphone') => void;
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({ onDeviceChange }) => {
    const [selectedDevice, setSelectedDevice] = useState<'android' | 'iphone'>('iphone');
    const [saving, setSaving] = useState(false);
    const user = getLoggedUser();

    useEffect(() => {
        loadDevicePreference();
    }, []);

    const loadDevicePreference = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('device_type')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            if (data?.device_type) {
                setSelectedDevice(data.device_type as 'android' | 'iphone');
            }
        } catch (err) {
            console.error('Error loading device preference:', err);
        }
    };

    const saveDevicePreference = async (device: 'android' | 'iphone') => {
        if (!user) return;

        try {
            setSaving(true);
            const { error } = await supabase
                .from('profiles')
                .update({ device_type: device })
                .eq('id', user.id);

            if (error) throw error;

            setSelectedDevice(device);
            if (onDeviceChange) {
                onDeviceChange(device);
            }
        } catch (err) {
            console.error('Error saving device preference:', err);
            alert('Erro ao salvar preferência de dispositivo');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-[#0f0f13] rounded-[2.5rem] border border-white/5 shadow-2xl p-8 space-y-6">
            <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Meu Dispositivo</h3>
                <p className="text-xs text-slate-500 mt-2">Selecione seu dispositivo para ver vídeos específicos</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* iPhone */}
                <button
                    onClick={() => saveDevicePreference('iphone')}
                    disabled={saving}
                    className={`relative overflow-hidden rounded-3xl p-8 transition-all border-2 ${selectedDevice === 'iphone'
                            ? 'bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.3)]'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${selectedDevice === 'iphone'
                                ? 'bg-indigo-500/20 text-indigo-400'
                                : 'bg-white/5 text-slate-500'
                            }`}>
                            <Apple size={40} />
                        </div>
                        <div className="text-center">
                            <p className={`text-sm font-black uppercase tracking-wider ${selectedDevice === 'iphone' ? 'text-white' : 'text-slate-400'
                                }`}>
                                iPhone
                            </p>
                            <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest">iOS</p>
                        </div>
                    </div>

                    {selectedDevice === 'iphone' && (
                        <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    )}
                </button>

                {/* Android */}
                <button
                    onClick={() => saveDevicePreference('android')}
                    disabled={saving}
                    className={`relative overflow-hidden rounded-3xl p-8 transition-all border-2 ${selectedDevice === 'android'
                            ? 'bg-gradient-to-br from-emerald-600/20 to-green-600/20 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${selectedDevice === 'android'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-white/5 text-slate-500'
                            }`}>
                            <Smartphone size={40} />
                        </div>
                        <div className="text-center">
                            <p className={`text-sm font-black uppercase tracking-wider ${selectedDevice === 'android' ? 'text-white' : 'text-slate-400'
                                }`}>
                                Android
                            </p>
                            <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest">Google</p>
                        </div>
                    </div>

                    {selectedDevice === 'android' && (
                        <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    )}
                </button>
            </div>

            {saving && (
                <div className="text-center">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest animate-pulse">Salvando...</p>
                </div>
            )}
        </div>
    );
};

export default DeviceSelector;
