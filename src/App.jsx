import React, { useState, useEffect } from 'react';
import api from './api/client';
import {
    Scissors,
    DollarSign,
    Layers,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    Truck,
    Plus,
    X,
    Printer,
    Check,
    Loader2,
    FileSpreadsheet
} from 'lucide-react';

export default function App() {
    const empresaId = 1;

    // Estados de datos generales con valores por defecto seguros
    const [dashboard, setDashboard] = useState(null);
    const [fichas, setFichas] = useState([]);
    const [fichaSeleccionadaId, setFichaSeleccionadaId] = useState(1);
    const [costoData, setCostoData] = useState(null);
    const [precioVentaSimulado, setPrecioVentaSimulado] = useState(45000);
    const [errorBackend, setErrorBackend] = useState(null);

    // Estados del modal de Nueva Ficha Técnica
    const [modalFichaAbierto, setModalFichaAbierto] = useState(false);
    const [modalFichaCargando, setModalFichaCargando] = useState(false);
    const [modalFichaError, setModalFichaError] = useState(null);
    const [modalFichaExito, setModalFichaExito] = useState(null);
    const [insumosDisponibles, setInsumosDisponibles] = useState([]);
    const [formFicha, setFormFicha] = useState({
        referencia: '',
        descripcion: '',
        tallas: '28,30,32,34',
        insumoId: '',
        cantidadNecesaria: '1.20',
        porcentajeMerma: '5.0'
    });

    // Estados del modal de Entrega Satélite
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalCargando, setModalCargando] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [modalExito, setModalExito] = useState(null);
    const [formEntrega, setFormEntrega] = useState({
        sateliteId: '1',
        fichaId: '1',
        cantidad: '',
        precioPorPrenda: '3200',
        fecha: new Date().toISOString().split('T')[0]
    });

    // Estados de Liquidación de Satélite
    const [sateliteLiquidacionId, setSateliteLiquidacionId] = useState('1');
    const [fechaInicio, setFechaInicio] = useState('2026-11-01');
    const [fechaFin, setFechaFin] = useState('2026-11-15');
    const [retenciones, setRetenciones] = useState(0);
    const [liqCargando, setLiqCargando] = useState(false);
    const [liqError, setLiqError] = useState(null);
    const [comprobante, setComprobante] = useState(null);

    // Función única de carga de datos sin dependencias cruzadas
    const cargarTodo = async (idFichaActual = fichaSeleccionadaId, precio = precioVentaSimulado) => {
        try {
            setErrorBackend(null);

            // 1. Dashboard
            try {
                const resDash = await api.get(`/dashboard/taller/${empresaId}`);
                setDashboard(resDash.data);
            } catch (e) {
                console.warn("Aviso en Dashboard:", e);
            }

            // 2. Fichas
            try {
                const resFichas = await api.get(`/fichas/empresa/${empresaId}`);
                if (Array.isArray(resFichas.data)) {
                    setFichas(resFichas.data);
                }
            } catch (e) {
                console.warn("Aviso en Fichas:", e);
            }

            // 3. Insumos
            try {
                const resInsumos = await api.get(`/insumos/empresa/${empresaId}`);
                if (Array.isArray(resInsumos.data)) {
                    setInsumosDisponibles(resInsumos.data);
                    const tela = resInsumos.data.find(i => i.tipoInsumo === 'TELA') || resInsumos.data[0];
                    if (tela) {
                        setFormFicha(prev => ({ ...prev, insumoId: tela.id }));
                    }
                }
            } catch (e) {
                console.warn("Aviso en Insumos:", e);
            }

            // 4. Costos de la prenda actual
            if (idFichaActual) {
                try {
                    const resCosto = await api.get(`/fichas/${idFichaActual}/resumen-costos?precioVenta=${precio}`);
                    setCostoData(resCosto.data);
                } catch (e) {
                    console.warn("Aviso en Costos:", e);
                }
            }

        } catch (err) {
            console.error("Error global de conexión:", err);
            setErrorBackend("No se pudo conectar con el servidor Spring Boot.");
        }
    };

    // Se ejecuta estrictamente una vez al inicio
    useEffect(() => {
        cargarTodo(1, 45000);
    }, []);

    // Cambio manual de ficha en el selector
    const handleCambiarFicha = (id) => {
        const numId = Number(id);
        setFichaSeleccionadaId(numId);
        cargarTodo(numId, precioVentaSimulado);
    };

    // Recalcular simulación de precio
    const recalcularMargen = (nuevoPrecio) => {
        setPrecioVentaSimulado(nuevoPrecio);
        cargarTodo(fichaSeleccionadaId, nuevoPrecio);
    };

    // Guardar nueva ficha técnica
    const guardarFichaTecnica = async (e) => {
        e.preventDefault();
        setModalFichaCargando(true);
        setModalFichaError(null);
        setModalFichaExito(null);

        const idInsumoElegido = formFicha.insumoId || (insumosDisponibles[0]?.id ?? 2);

        const payload = {
            referencia: formFicha.referencia.toUpperCase().trim(),
            descripcion: formFicha.descripcion,
            tallas: formFicha.tallas,
            insumos: [
                {
                    insumoId: Number(idInsumoElegido),
                    cantidadNecesaria: Number(formFicha.cantidadNecesaria),
                    porcentajeMerma: Number(formFicha.porcentajeMerma)
                }
            ]
        };

        try {
            const res = await api.post(`/fichas/empresa/${empresaId}`, payload);
            setModalFichaExito(`¡Referencia ${res.data.referencia} creada con éxito!`);

            const nuevoId = res.data.id;
            setFichaSeleccionadaId(nuevoId);
            await cargarTodo(nuevoId, precioVentaSimulado);

            setTimeout(() => {
                setModalFichaExito(null);
                setFormFicha(prev => ({
                    ...prev,
                    referencia: '',
                    descripcion: ''
                }));
                setModalFichaAbierto(false);
            }, 1000);

        } catch (err) {
            console.error(err);
            setModalFichaError(err.response?.data?.mensaje || "Error al crear la ficha técnica.");
        } finally {
            setModalFichaCargando(false);
        }
    };

    // Guardar entrega de satélite
    const guardarEntrega = async (e) => {
        e.preventDefault();
        if (!formEntrega.cantidad || Number(formEntrega.cantidad) <= 0) {
            setModalError("Digita una cantidad válida mayor a 0");
            return;
        }

        setModalCargando(true);
        setModalError(null);
        setModalExito(null);

        try {
            await api.post(
                `/satelites/entregas/taller/${empresaId}/satelite/${formEntrega.sateliteId}/ficha/${formEntrega.fichaId}?cantidad=${formEntrega.cantidad}&precioPorPrenda=${formEntrega.precioPorPrenda}&fecha=${formEntrega.fecha}`
            );
            setModalExito(`Lote de ${formEntrega.cantidad} prendas registrado correctamente.`);
            cargarTodo();

            setTimeout(() => {
                setModalExito(null);
                setFormEntrega(prev => ({ ...prev, cantidad: '' }));
                setModalAbierto(false);
            }, 1000);
        } catch (err) {
            setModalError(err.response?.data?.mensaje || "Error al registrar la entrega.");
        } finally {
            setModalCargando(false);
        }
    };

    // Liquidar período de satélite
    const liquidarPeriodo = async () => {
        setLiqCargando(true);
        setLiqError(null);
        try {
            const url = `/satelites/liquidar/taller/${empresaId}/satelite/${sateliteLiquidacionId}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&retenciones=${retenciones}&observaciones=${encodeURIComponent('Corte de maquila semanal')}`;
            const res = await api.post(url);
            setComprobante(res.data);
            cargarTodo();
        } catch (err) {
            setLiqError(err.response?.data?.mensaje || "No hay entregas pendientes de liquidar para este satélite en el periodo indicado.");
        } finally {
            setLiqCargando(false);
        }
    };

    // Filtro seguro de telas
    const telasDisponibles = Array.isArray(insumosDisponibles)
        ? insumosDisponibles.filter(ins => ins && ins.tipoInsumo === 'TELA')
        : [];

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">

            {/* Barra de Navegación */}
            <header className="bg-slate-900 text-white border-b border-slate-800 px-8 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center space-x-3">
                    <Scissors className="h-6 w-6 text-indigo-400" />
                    <span className="text-xl font-bold tracking-tight">MiTaller <span className="text-indigo-400 font-normal">SaaS</span></span>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => cargarTodo()}
                        className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                    >
                        <RefreshCw className="h-3.5 w-3.5" /> Actualizar
                    </button>
                    <span className="text-sm bg-indigo-950 text-indigo-300 border border-indigo-800 px-3 py-1 rounded-full font-medium">
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

                {/* Tarjetas Superiores */}
                <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Órdenes Activas</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{dashboard?.ordenesActivas ?? 1}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Layers className="h-6 w-6" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Prendas Producidas</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{dashboard?.totalPrendasProducidasMes ?? 200} uds</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nómina Pagada</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">
                                ${Number(dashboard?.totalNominaPagadaMes ?? 55200).toLocaleString('es-CO')}
                            </h3>
                        </div>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                            <DollarSign className="h-6 w-6" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reserva Provisiones</p>
                            <h3 className="text-2xl font-bold text-amber-600 mt-1">
                                ${Number(dashboard?.provisionesAcumuladasMes ?? 13098).toLocaleString('es-CO')}
                            </h3>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                    </div>
                </section>

                {/* Panel de Costeo con Selector Dinámico */}
                <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md w-max">
                Motor de Costeo Técnico
              </span>

                            <div className="flex items-center gap-2">
                                <select
                                    value={fichaSeleccionadaId}
                                    onChange={(e) => handleCambiarFicha(e.target.value)}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                >
                                    {Array.isArray(fichas) && fichas.length > 0 ? (
                                        fichas.map((f) => (
                                            <option key={f.id} value={f.id}>
                                                {f.referencia} — {f.descripcion}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="1">JEAN-REF-001 (Pantalón)</option>
                                    )}
                                </select>

                                <button
                                    onClick={() => setModalFichaAbierto(true)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200 transition"
                                >
                                    <Plus className="h-3.5 w-3.5" /> Nueva Prenda
                                </button>
                            </div>
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
                        <div className="p-6 space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Telas y Merma</h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Consumo tela (+ merma):</span>
                                <span className="font-semibold">{costoData?.consumoTelaPorPrenda ?? 0} m</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Costo total tela:</span>
                                <span className="font-semibold">${Number(costoData?.costoTelas ?? 0).toLocaleString('es-CO')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Avíos e insumos menores:</span>
                                <span className="font-semibold">${Number(costoData?.costoAvios ?? 0).toLocaleString('es-CO')}</span>
                            </div>
                        </div>

                        <div className="p-6 space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Procesos & Confección</h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Bordado / Estampado:</span>
                                <span className="font-semibold text-indigo-600">${Number(costoData?.costoEstampadoBordadoLavanderia ?? 0).toLocaleString('es-CO')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Mano de obra ensamble:</span>
                                <span className="font-semibold">${Number(costoData?.costoManoObraDirecta ?? 0).toLocaleString('es-CO')}</span>
                            </div>
                            <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-bold">
                                <span>Costo Unitario Fabricación:</span>
                                <span className="text-slate-900">${Number(costoData?.costoTotalProduccion ?? 0).toLocaleString('es-CO')}</span>
                            </div>
                        </div>

                        <div className="p-6 space-y-3 bg-slate-50/50">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Utilidad y Margen</h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Ganancia por unidad:</span>
                                <span className="font-bold text-emerald-600">${Number(costoData?.margenBruto ?? 0).toLocaleString('es-CO')}</span>
                            </div>
                            <div className="flex justify-between items-baseline pt-1">
                                <span className="text-sm font-medium text-slate-600">Margen Comercial:</span>
                                <span className="text-3xl font-extrabold text-emerald-600">{costoData?.porcentajeMargen ?? 0}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mt-1">
                                <div
                                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(costoData?.porcentajeMargen ?? 0, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección de Talleres Satélites */}
                <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Truck className="h-5 w-5 text-indigo-600" />
                                Liquidación de Talleres Satélites (Maquila)
                            </h2>
                            <p className="text-sm text-slate-500">
                                Liquidación consolidada sin sobrecostos de aportes patronales ni parafiscales.
                            </p>
                        </div>
                        <button
                            onClick={() => setModalAbierto(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition active:scale-95"
                        >
                            <Plus className="h-4 w-4 text-indigo-400" />
                            Nueva Entrega Satélite
                        </button>
                    </div>

                    {liqError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{liqError}</span>
                        </div>
                    )}

                    {/* Formulario de Corte */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Taller Satélite</label>
                            <select
                                value={sateliteLiquidacionId}
                                onChange={(e) => setSateliteLiquidacionId(e.target.value)}
                                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white font-medium"
                            >
                                <option value="1">Confecciones Doña Carmen</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fecha Inicio</label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fecha Fin</label>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Descuentos ($)</label>
                            <input
                                type="number"
                                value={retenciones}
                                onChange={(e) => setRetenciones(Number(e.target.value))}
                                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white font-medium"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={liquidarPeriodo}
                                disabled={liqCargando}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {liqCargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                {liqCargando ? 'Liquidando...' : 'Liquidar Período'}
                            </button>
                        </div>
                    </div>

                    {/* Comprobante Emitido */}
                    {comprobante && (
                        <div className="border border-indigo-200 rounded-xl bg-indigo-50/40 p-6 space-y-4">
                            <div className="flex justify-between items-center border-b border-indigo-100 pb-3">
                                <div>
                  <span className="text-xs font-bold uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                    Cuenta de Cobro Aprobada
                  </span>
                                    <h3 className="text-base font-bold text-slate-800 mt-1">
                                        Liquidación #{comprobante.id} — {comprobante.satelite?.nombreTaller || 'Confecciones Doña Carmen'}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Encargada: {comprobante.satelite?.nombreEncargado || 'Carmen Rosa Gomez'} | CC: {comprobante.satelite?.nitOIdentificacion || '60234567'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => window.print()}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition"
                                >
                                    <Printer className="h-4 w-4 text-slate-600" /> Imprimir Comprobante
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-white p-4 rounded-lg border border-indigo-100">
                                <div>
                                    <p className="text-xs text-slate-400">Rango Liquidado:</p>
                                    <p className="font-semibold text-slate-800">{comprobante.fechaInicio} al {comprobante.fechaFin}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Prendas Aprobadas:</p>
                                    <p className="font-bold text-indigo-600 text-base">{comprobante.totalPrendasConfeccionadas} uds</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Subtotal Bruto:</p>
                                    <p className="font-semibold text-slate-800">${Number(comprobante.subtotalBruto).toLocaleString('es-CO')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Neto a Pagar:</p>
                                    <p className="font-extrabold text-emerald-600 text-lg">${Number(comprobante.netoAPagar).toLocaleString('es-CO')}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

            </main>

            {/* Modal: Crear Nueva Ficha Técnica */}
            {modalFichaAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
                                    Nueva Ficha Técnica de Prenda
                                </h3>
                                <p className="text-xs text-slate-500">Define los parámetros de costeo técnico</p>
                            </div>
                            <button
                                onClick={() => setModalFichaAbierto(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={guardarFichaTecnica} className="p-6 space-y-4">
                            {modalFichaError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                                    {modalFichaError}
                                </div>
                            )}
                            {modalFichaExito && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs">
                                    {modalFichaExito}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Referencia / Código</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: CAMISA-002"
                                        value={formFicha.referencia}
                                        onChange={(e) => setFormFicha({ ...formFicha, referencia: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tallas Disponibles</label>
                                    <input
                                        type="text"
                                        placeholder="S,M,L,XL o 28,30,32"
                                        value={formFicha.tallas}
                                        onChange={(e) => setFormFicha({ ...formFicha, tallas: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Descripción de la Prenda</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Camisa casual manga corta"
                                    value={formFicha.descripcion}
                                    onChange={(e) => setFormFicha({ ...formFicha, descripcion: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                />
                            </div>

                            {/* Insumo Principal y Consumos */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Insumo Principal (Tela Base)</span>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tela</label>
                                    <select
                                        value={formFicha.insumoId}
                                        onChange={(e) => setFormFicha({ ...formFicha, insumoId: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    >
                                        {telasDisponibles.length > 0 ? (
                                            telasDisponibles.map((ins) => (
                                                <option key={ins.id} value={ins.id}>
                                                    {ins.nombre} (${Number(ins.costoUnitario).toLocaleString('es-CO')} / {ins.unidadMedida})
                                                </option>
                                            ))
                                        ) : (
                                            <option value="2">Tela Denim Rigido 12oz ($14.000 / METROS)</option>
                                        )}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Metros x Prenda</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formFicha.cantidadNecesaria}
                                            onChange={(e) => setFormFicha({ ...formFicha, cantidadNecesaria: e.target.value })}
                                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Merma Técnica (%)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={formFicha.porcentajeMerma}
                                            onChange={(e) => setFormFicha({ ...formFicha, porcentajeMerma: e.target.value })}
                                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalFichaAbierto(false)}
                                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={modalFichaCargando}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                                >
                                    {modalFichaCargando && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {modalFichaCargando ? 'Guardando...' : 'Crear Ficha Técnica'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Entrega Satélite */}
            {modalAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">Registrar Entrega de Satélite</h3>
                                <p className="text-xs text-slate-500">Recepción de lote confeccionado</p>
                            </div>
                            <button
                                onClick={() => setModalAbierto(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={guardarEntrega} className="p-6 space-y-4">
                            {modalError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                                    {modalError}
                                </div>
                            )}
                            {modalExito && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs">
                                    {modalExito}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Taller Satélite</label>
                                    <select
                                        value={formEntrega.sateliteId}
                                        onChange={(e) => setFormEntrega({ ...formEntrega, sateliteId: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    >
                                        <option value="1">Confecciones Doña Carmen</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Referencia Prenda</label>
                                    <select
                                        value={formEntrega.fichaId}
                                        onChange={(e) => setFormEntrega({ ...formEntrega, fichaId: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    >
                                        {Array.isArray(fichas) && fichas.length > 0 ? (
                                            fichas.map((f) => (
                                                <option key={f.id} value={f.id}>
                                                    {f.referencia}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="1">JEAN-REF-001</option>
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Cantidad de Prendas</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Ej: 80"
                                        value={formEntrega.cantidad}
                                        onChange={(e) => setFormEntrega({ ...formEntrega, cantidad: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tarifa por Prenda ($)</label>
                                    <input
                                        type="number"
                                        value={formEntrega.precioPorPrenda}
                                        onChange={(e) => setFormEntrega({ ...formEntrega, precioPorPrenda: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fecha de Recepción</label>
                                <input
                                    type="date"
                                    value={formEntrega.fecha}
                                    onChange={(e) => setFormEntrega({ ...formEntrega, fecha: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                />
                            </div>

                            {Number(formEntrega.cantidad) > 0 && (
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                                    <span className="text-slate-600">Total a Pagar por Lote:</span>
                                    <span className="text-indigo-600 font-bold text-sm">
                    ${(Number(formEntrega.cantidad) * Number(formEntrega.precioPorPrenda)).toLocaleString('es-CO')} COP
                  </span>
                                </div>
                            )}

                            <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalAbierto(false)}
                                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={modalCargando}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                                >
                                    {modalCargando && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {modalCargando ? 'Guardando...' : 'Confirmar Recepción'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}