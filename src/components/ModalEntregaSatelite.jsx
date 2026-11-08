import React, { useState } from 'react';
import api from '../api/client';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ModalEntregaSatelite({ isOpen, onClose, empresaId = 1, onRegistroExitoso }) {
    const [formData, setFormData] = useState({
        sateliteId: '1',
        fichaId: '1',
        cantidad: '',
        precioPorPrenda: '3200',
        fecha: new Date().toISOString().split('T')[0],
    });

    const [loading, setLoading] = useState(false);
    const [mensajeError, setMensajeError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensajeError(null);
        setMensajeExito(null);

        const { sateliteId, fichaId, cantidad, precioPorPrenda, fecha } = formData;

        if (!cantidad || Number(cantidad) <= 0) {
            setMensajeError('Debes ingresar una cantidad válida mayor a 0');
            setLoading(false);
            return;
        }

        try {
            // Envío hacia el backend mediante Query Params como está mapeado en el Controller
            const response = await api.post(
                `/satelites/entregas/taller/${empresaId}/satelite/${sateliteId}/ficha/${fichaId}?cantidad=${cantidad}&precioPorPrenda=${precioPorPrenda}&fecha=${fecha}`
            );

            const totalLote = (Number(cantidad) * Number(precioPorPrenda)).toLocaleString('es-CO');
            setMensajeExito(`Lote registrado: ${cantidad} prendas recibidas ($${totalLote} COP pendientes de liquidar).`);

            if (onRegistroExitoso) {
                onRegistroExitoso(response.data);
            }

            // Reiniciar cantidad y cerrar modal tras 1.5s
            setTimeout(() => {
                setFormData((prev) => ({ ...prev, cantidad: '' }));
                setMensajeExito(null);
                onClose();
            }, 1500);

        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.mensaje || 'Error al conectar con el servidor para registrar la entrega.';
            setMensajeError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Cabecera del Modal */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-base font-bold text-slate-800">Registrar Entrega de Satélite</h3>
                        <p className="text-xs text-slate-500">Recepción de lote confeccionado listo para revisión</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {mensajeError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{mensajeError}</span>
                        </div>
                    )}

                    {mensajeExito && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-700 text-xs">
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            <span>{mensajeExito}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Taller Satélite */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                Taller Satélite
                            </label>
                            <select
                                name="sateliteId"
                                value={formData.sateliteId}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                            >
                                <option value="1">Confecciones Doña Carmen</option>
                            </select>
                        </div>

                        {/* Ficha Técnica / Prenda */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                Referencia Prenda
                            </label>
                            <select
                                name="fichaId"
                                value={formData.fichaId}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                            >
                                <option value="1">JEAN-REF-001 (Pantalón)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Cantidad Recibida */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                Cantidad de Prendas
                            </label>
                            <input
                                type="number"
                                name="cantidad"
                                placeholder="Ej: 50"
                                min="1"
                                value={formData.cantidad}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800"
                                required
                            />
                        </div>

                        {/* Precio Acordado por Prenda */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                Tarifa x Prenda (COP)
                            </label>
                            <input
                                type="number"
                                name="precioPorPrenda"
                                value={formData.precioPorPrenda}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800"
                                required
                            />
                        </div>
                    </div>

                    {/* Fecha de Entrega */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                            Fecha de Recepción
                        </label>
                        <input
                            type="date"
                            name="fecha"
                            value={formData.fecha}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700 font-medium"
                            required
                        />
                    </div>

                    {/* Cálculo Previo del Lote */}
                    {formData.cantidad && Number(formData.cantidad) > 0 && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 flex justify-between items-center text-xs">
                            <span className="text-slate-600">Subtotal por liquidar:</span>
                            <span className="text-indigo-600 font-bold text-sm">
                ${(Number(formData.cantidad) * Number(formData.precioPorPrenda)).toLocaleString('es-CO')} COP
              </span>
                        </div>
                    )}

                    {/* Botones de Acción */}
                    <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {loading ? 'Guardando...' : 'Confirmar Recepción'}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}