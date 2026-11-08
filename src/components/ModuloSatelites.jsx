import React, { useState } from 'react';
import api from '../api/client';
import { FileText, Printer, Check, AlertCircle, Loader2, Plus, Sparkles } from 'lucide-react';

export default function ModuloSatelites({ empresaId = 1, onAbrirModalEntrega, onLiquidacionCompleta }) {
    // Ajustamos por defecto al rango actual que incluya hoy
    const [fechaInicio, setFechaInicio] = useState('2026-11-01');
    const [fechaFin, setFechaFin] = useState('2026-11-15');
    const [retenciones, setRetenciones] = useState(0);
    const [observaciones, setObservaciones] = useState('Corte quincenal confección lotes');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [comprobante, setComprobante] = useState(null);

    const ejecutarLiquidacion = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = `/satelites/liquidar/taller/${empresaId}/satelite/1?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&retenciones=${retenciones}&observaciones=${encodeURIComponent(observaciones)}`;
            const res = await api.post(url);

            // Guardar el comprobante generado
            setComprobante(res.data);
            setError(null);

            // Notificar al Dashboard sin recargar toda la interfaz
            if (onLiquidacionCompleta) {
                onLiquidacionCompleta();
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.mensaje || 'No hay entregas pendientes por liquidar para este satélite en el periodo indicado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-6">

            {/* Cabecera con botón de Nueva Entrega integrado */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        Cierre y Liquidación de Maquila (Satélites)
                    </h2>
                    <p className="text-sm text-slate-500">
                        Calcula la cuenta de cobro sin aportes parafiscales, consolidando prendas recibidas por taller externo.
                    </p>
                </div>
                <button
                    onClick={onAbrirModalEntrega}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition shadow-sm active:scale-95"
                >
                    <Plus className="h-4 w-4 text-indigo-400" />
                    Nueva Entrega Satélite
                </button>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Controles de Corte */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fecha Inicio</label>
                    <input
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white font-medium"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fecha Fin</label>
                    <input
                        type="date"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white font-medium"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Retenciones / Anticipos ($)</label>
                    <input
                        type="number"
                        value={retenciones}
                        onChange={(e) => setRetenciones(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white font-medium"
                    />
                </div>
                <div className="flex items-end">
                    <button
                        onClick={ejecutarLiquidacion}
                        disabled={loading}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        {loading ? 'Liquidando...' : 'Liquidar Período'}
                    </button>
                </div>
            </div>

            {/* Comprobante de Liquidación Generado */}
            {comprobante && (
                <div className="border border-indigo-200 rounded-xl bg-indigo-50/30 p-6 space-y-4 print:p-0 print:border-none">
                    <div className="flex justify-between items-center border-b border-indigo-100 pb-3">
                        <div>
              <span className="text-xs font-bold uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                <Sparkles className="h-3 w-3" /> Liquidación Exitosa
              </span>
                            <h3 className="text-base font-bold text-slate-800 mt-1">
                                Cuenta de Cobro #{comprobante.id} — {comprobante.satelite?.nombreTaller || 'Confecciones Doña Carmen'}
                            </h3>
                            <p className="text-xs text-slate-500">
                                Encargado: {comprobante.satelite?.nombreEncargado || 'Carmen Rosa Gomez'} | CC/NIT: {comprobante.satelite?.nitOIdentificacion || '60234567'}
                            </p>
                        </div>
                        <button
                            onClick={imprimirComprobante}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition"
                        >
                            <Printer className="h-4 w-4 text-slate-600" /> Imprimir Comprobante
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-white p-4 rounded-lg border border-indigo-100/60">
                        <div>
                            <p className="text-xs text-slate-400">Rango Liquidado:</p>
                            <p className="font-semibold text-slate-800">{comprobante.fechaInicio} al {comprobante.fechaFin}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Prendas Aprobadas:</p>
                            <p className="font-bold text-indigo-600 text-base">{comprobante.totalPrendasConfeccionadas} uds</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Subtotal Devengado:</p>
                            <p className="font-semibold text-slate-800">${Number(comprobante.subtotalBruto).toLocaleString('es-CO')}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Neto a Desembolsar:</p>
                            <p className="font-extrabold text-emerald-600 text-lg">${Number(comprobante.netoAPagar).toLocaleString('es-CO')}</p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}