import React, { useState } from 'react';
import api from '../api/client';
import { Scissors, Lock, Mail, Building2, User, MapPin, Hash, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function AuthScreen({ onLoginSuccess }) {
    const [modoRegistro, setModoRegistro] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    const [formLogin, setFormLogin] = useState({ email: '', password: '' });
    const [formRegistro, setFormRegistro] = useState({
        nit: '',
        razonSocial: '',
        ciudad: 'Barrancabermeja',
        nombreCompleto: '',
        email: '',
        password: ''
    });

    const procesarSesion = (data) => {
        localStorage.setItem('mitaller_token', data.token);
        localStorage.setItem('mitaller_sesion', JSON.stringify(data));
        onLoginSuccess(data);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError(null);
        try {
            const res = await api.post('/auth/login', formLogin);
            procesarSesion(res.data);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Credenciales inválidas. Verifica tu correo y contraseña.');
        } finally {
            setCargando(false);
        }
    };

    const handleRegistro = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError(null);
        try {
            const res = await api.post('/auth/registro', formRegistro);
            procesarSesion(res.data);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'No se pudo registrar el taller.');
        } finally {
            setCargando(false);
        }
    };

    const handleAccesoDemo = async () => {
        setCargando(true);
        setError(null);
        try {
            const res = await api.post('/auth/demo');
            procesarSesion(res.data);
        } catch (err) {
            setError('Error conectando con el servidor Spring Boot.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
                {/* Encabezado */}
                <div className="bg-slate-950 px-8 py-6 text-center border-b border-slate-800">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 mb-3">
                        <Scissors className="h-6 w-6 text-indigo-400" />
                    </div>
                    <h1 className="text-xl font-bold text-white tracking-tight">
                        MiTaller <span className="text-indigo-400 font-normal">SaaS</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Sistema Integral de Costeo, Maquila y Nómina Textil
                    </p>
                </div>

                {/* Pestañas Login / Registro */}
                <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase">
                    <button
                        type="button"
                        onClick={() => { setModoRegistro(false); setError(null); }}
                        className={`py-3 transition ${!modoRegistro ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        type="button"
                        onClick={() => { setModoRegistro(true); setError(null); }}
                        className={`py-3 transition ${modoRegistro ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Registrar Taller
                    </button>
                </div>

                <div className="p-8 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {!modoRegistro ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                                    <input
                                        type="email"
                                        placeholder="admin@mitaller.com"
                                        value={formLogin.email}
                                        onChange={(e) => setFormLogin({ ...formLogin, email: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Contraseña</label>
                                <div className="relative">
                                    <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={formLogin.password}
                                        onChange={(e) => setFormLogin({ ...formLogin, password: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={cargando}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                            >
                                {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                                Ingresar a mi Taller
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegistro} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">NIT / RUT</label>
                                    <div className="relative">
                                        <Hash className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                                        <input
                                            type="text"
                                            placeholder="900456789-1"
                                            value={formRegistro.nit}
                                            onChange={(e) => setFormRegistro({ ...formRegistro, nit: e.target.value })}
                                            className="w-full pl-8 pr-2.5 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Ciudad</label>
                                    <div className="relative">
                                        <MapPin className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                                        <input
                                            type="text"
                                            placeholder="Medellín"
                                            value={formRegistro.ciudad}
                                            onChange={(e) => setFormRegistro({ ...formRegistro, ciudad: e.target.value })}
                                            className="w-full pl-8 pr-2.5 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre del Taller / Empresa</label>
                                <div className="relative">
                                    <Building2 className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                                    <input
                                        type="text"
                                        placeholder="Confecciones Textil Norte S.A.S"
                                        value={formRegistro.razonSocial}
                                        onChange={(e) => setFormRegistro({ ...formRegistro, razonSocial: e.target.value })}
                                        className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre Administrador</label>
                                <div className="relative">
                                    <User className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                                    <input
                                        type="text"
                                        placeholder="Laura Gómez"
                                        value={formRegistro.nombreCompleto}
                                        onChange={(e) => setFormRegistro({ ...formRegistro, nombreCompleto: e.target.value })}
                                        className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Correo Electrónico</label>
                                <input
                                    type="email"
                                    placeholder="gerencia@textilnorte.com"
                                    value={formRegistro.email}
                                    onChange={(e) => setFormRegistro({ ...formRegistro, email: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Contraseña</label>
                                <input
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={formRegistro.password}
                                    onChange={(e) => setFormRegistro({ ...formRegistro, password: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={cargando}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                            >
                                {cargando && <Loader2 className="h-4 w-4 animate-spin" />}
                                Crear Taller y Entrar
                            </button>
                        </form>
                    )}

                    {/* Botón Acceso Rápido Planta Principal */}
                    <div className="pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={handleAccesoDemo}
                            disabled={cargando}
                            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition border border-slate-200"
                        >
                            Acceso Rápido: Confecciones El Búcaro (Planta Demo)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}