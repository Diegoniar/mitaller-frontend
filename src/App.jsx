import React, { useState, useEffect } from 'react';
import api from './api/client';
import {
    Scissors,
    DollarSign,
    Layers,
    Users,
    CheckCircle,
    AlertCircle,
    Truck,
    RefreshCw
} from 'lucide-react';

export default function App() {
    const [empresaId] = useState(1);
    const [dashboard, setDashboard] = useState(null);
    const [costoData, setCostoData] = useState(null);
    const [precioVentaSimulado, setPrecioVentaSimulado] = useState(45000);
    const [cargando, setCargando] = useState(true);
    const [errorBackend, setErrorBackend] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            setErrorBackend(null);

            // 1. Consultar Dashboard
            try {
                const resDash = await api.get(`/dashboard/taller/${empresaId}`);
                setDashboard(resDash.data);
            } catch (e) {
                console.warn("Dashboard no respondió o está en blanco:", e);
            }

            // 2. Consultar Resumen de Costos de la prenda de prueba (ID 1)
            const resCosto = await api.get(`/fichas/1/resumen-costos?precioVenta=${precioVentaSimulado}`);
            setCostoData(resCosto.data);

        } catch (err) {
            console.error("Error al conectar con Spring Boot:", err);
            setErrorBackend("No se pudo conectar con el backend en el puerto 8080. Verifica que Spring Boot siga corriendo.");
        } finally {
            setCargando(false);
        }
    };

    const recalcularMargen = async (nuevoPrecio) => {
        setPrecioVentaSimulado(nuevoPrecio);
        try {
            const res = await api.get(`/fichas/1/resumen-costos?precioVenta=${nuevoPrecio}`);
            setCostoData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    if (cargando) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-slate-600 font-medium">Cargando MiTaller SaaS...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
            {/* Barra de Navegación */}
            <header className="bg-slate-900 text-white border-b border-slate-800 px-8 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center space-x-3">
                    <Scissors className="h-6 w-6 text-indigo-400" />
                    <span className="text-xl font-bold tracking-tight">MiTaller <span className="text-indigo-400 font-normal">SaaS</span></span>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={cargarDatos}
                        className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                    >
                        <RefreshCw className="h-3.5 w-3.5" /> Actualizar
                    </button>
                    <span className="text-sm bg-indigo-950/80 text-indigo-300 border border-indigo-800/50 px-3 py-1 rounded-full font-medium">
            Confecciones El Búcaro
          </span>
                </div>
            </header>

            {/* Contenedor Principal */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">

                {errorBackend && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                        <span>{errorBackend}</span>
                    </div>
                )}

                {/* Fila de Tarjetas / KPIs */}
                <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Órdenes Activas</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{dashboard?.ordenesActivas || 1}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Layers className="h-6 w-6" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Prendas Producidas</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{dashboard?.totalPrendasProducidasMes || 80} uds</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nómina Pagada</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">
                                ${Number(dashboard?.totalNominaPagadaMes || 256000).toLocaleString('es-CO')}
                            </h3>
                        </div>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                            <DollarSign className="h-6 w-6" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reserva Provisiones</p>
                            <h3 className="text-2xl font-bold text-amber-600 mt-1">
                                ${Number(dashboard?.provisionesAcumuladasMes || 55885).toLocaleString('es-CO')}
                            </h3>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                    </div>
                </section>

                {/* Panel de Costeo Dinámico */}
                <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                        <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                Motor de Costeo Técnico
              </span>
                            <h2 className="text-lg font-bold text-slate-800 mt-2">
                                Referencia: <span className="text-indigo-600">{costoData?.referencia || 'JEAN-REF-001'}</span>
                            </h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-slate-600">Simular Precio Venta ($):</label>
                            <input
                                type="number"
                                value={precioVentaSimulado}
                                onChange={(e) => recalcularMargen(Number(e.target.value))}
                                className="w-36 px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-right font-bold text-slate-800"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                        {/* Columna 1 */}
                        <div className="p-6 space-y-3.5">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Telas y Merma</h3>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Consumo tela (+ merma):</span>
                                <span className="font-semibold text-slate-800">{costoData?.consumoTelaPorPrenda} metros</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Costo total tela:</span>
                                <span className="font-semibold text-slate-800">${Number(costoData?.costoTelas || 0).toLocaleString('es-CO')}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Avíos e insumos menores:</span>
                                <span className="font-semibold text-slate-800">${Number(costoData?.costoAvios || 0).toLocaleString('es-CO')}</span>
                            </div>
                        </div>

                        {/* Columna 2 */}
                        <div className="p-6 space-y-3.5">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Procesos & Confección</h3>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Bordado / Estampado:</span>
                                <span className="font-semibold text-indigo-600">${Number(costoData?.costoEstampadoBordadoLavanderia || 0).toLocaleString('es-CO')}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Mano de obra directa (Coser):</span>
                                <span className="font-semibold text-slate-800">${Number(costoData?.costoManoObraDirecta || 0).toLocaleString('es-CO')}</span>
                            </div>
                            <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-sm font-bold">
                                <span className="text-slate-700">Costo Unitario Fabricación:</span>
                                <span className="text-slate-900">${Number(costoData?.costoTotalProduccion || 0).toLocaleString('es-CO')}</span>
                            </div>
                        </div>

                        {/* Columna 3 */}
                        <div className="p-6 space-y-3.5 bg-slate-50/80">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Utilidad y Margen</h3>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Ganancia por unidad:</span>
                                <span className="font-bold text-emerald-600">${Number(costoData?.margenBruto || 0).toLocaleString('es-CO')}</span>
                            </div>
                            <div className="flex justify-between items-baseline pt-1">
                                <span className="text-sm font-medium text-slate-600">Margen Comercial:</span>
                                <span className="text-3xl font-extrabold text-emerald-600">{costoData?.porcentajeMargen}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mt-1">
                                <div
                                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(costoData?.porcentajeMargen || 0, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Módulo de Satélites */}
                <section className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl mt-1">
                            <Truck className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-800">Liquidación de Talleres Satélites (Maquila)</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                                Última liquidación procesada: <strong className="text-slate-700">Confecciones Doña Carmen</strong> (80 prendas - $256,000 COP).
                                Las cuentas de cobro no cargan prestaciones sociales y se liquidan automáticamente contra lotes entregados.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => alert("Registro de entregas y liquidación semanal activo.")}
                        className="whitespace-nowrap px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition"
                    >
                        Nueva Entrega Satélite
                    </button>
                </section>

            </main>
        </div>
    );
}
