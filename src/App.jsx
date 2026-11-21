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
    FileSpreadsheet,
    ClipboardList,
    Users,
    UserPlus,
    LayoutDashboard,
    Menu,
    LogOut,
    Download,
    Trash2
} from 'lucide-react';
import AuthScreen from './components/AuthScreen';

export default function App() {
    const [sesion, setSesion] = useState(() => {
        const guardada = localStorage.getItem('mitaller_sesion');
        return guardada ? JSON.parse(guardada) : null;
    });

    const empresaId = sesion?.empresaId;

    const cerrarSesion = () => {
        localStorage.removeItem('mitaller_token');
        localStorage.removeItem('mitaller_sesion');
        setSesion(null);
    };

    // Navegación por módulos (Sidebar)
    const [vistaActiva, setVistaActiva] = useState('resumen');
    const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

    // Estados generales
    const [dashboard, setDashboard] = useState(null);
    const [fichas, setFichas] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [fichaSeleccionadaId, setFichaSeleccionadaId] = useState(null);
    const [costoData, setCostoData] = useState(null);
    const [precioVentaSimulado, setPrecioVentaSimulado] = useState(45000);
    const [errorBackend, setErrorBackend] = useState(null);

    // Modal: Nueva Ficha Técnica
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

    // Modal: Nuevo Insumo (Telas / Avíos)
    const [modalInsumoAbierto, setModalInsumoAbierto] = useState(false);
    const [modalInsumoCargando, setModalInsumoCargando] = useState(false);
    const [modalInsumoError, setModalInsumoError] = useState(null);
    const [modalInsumoExito, setModalInsumoExito] = useState(null);
    const [formInsumo, setFormInsumo] = useState({
        nombre: '',
        tipoInsumo: 'TELA',
        unidadMedida: 'METROS',
        costoUnitario: ''
    });

    // Modal: Nueva Orden de Producción
    const [modalOrdenAbierto, setModalOrdenAbierto] = useState(false);
    const [modalOrdenCargando, setModalOrdenCargando] = useState(false);
    const [modalOrdenError, setModalOrdenError] = useState(null);
    const [modalOrdenExito, setModalOrdenExito] = useState(null);
    const [formOrden, setFormOrden] = useState({
        numeroOrden: `OP-${new Date().getFullYear()}-002`,
        fichaTecnicaId: '1',
        cantidadProgramada: '300',
        cantidadCortada: '300',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaEntregaEstimada: ''
    });

    // Modal: Entrega Satélite
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalCargando, setModalCargando] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [modalExito, setModalExito] = useState(null);
    const [formEntrega, setFormEntrega] = useState({
        sateliteId: '1',
        ordenId: '',
        cantidad: '',
        precioPorPrenda: '3200',
        fecha: new Date().toISOString().split('T')[0]
    });

    // Liquidación Satélite
    const [sateliteLiquidacionId, setSateliteLiquidacionId] = useState('1');
    const [fechaInicio, setFechaInicio] = useState('2026-11-01');
    const [fechaFin, setFechaFin] = useState('2026-11-30');
    const [retenciones, setRetenciones] = useState(0);
    const [liqCargando, setLiqCargando] = useState(false);
    const [liqError, setLiqError] = useState(null);
    const [comprobante, setComprobante] = useState(null);

    // Talleres Satélites Dinámicos
    const [satelites, setSatelites] = useState([]);
    const [modalSateliteAbierto, setModalSateliteAbierto] = useState(false);
    const [modalSateliteCargando, setModalSateliteCargando] = useState(false);
    const [modalSateliteError, setModalSateliteError] = useState(null);
    const [modalSateliteExito, setModalSateliteExito] = useState(null);
    const [formSatelite, setFormSatelite] = useState({
        nombreTaller: '',
        nombreEncargado: '',
        nitOIdentificacion: '',
        telefono: '',
        especialidad: 'Confección General'
    });

    // Módulo de Nómina Interna y Personal
    const [empleados, setEmpleados] = useState([]);
    const [fasesProduccion, setFasesProduccion] = useState([]);
    const [empleadoNominaId, setEmpleadoNominaId] = useState('');
    const [nominaInicio, setNominaInicio] = useState('2026-11-01');
    const [nominaFin, setNominaFin] = useState('2026-11-15');
    const [nominaCargando, setNominaCargando] = useState(false);
    const [nominaError, setNominaError] = useState(null);
    const [colillaPago, setColillaPago] = useState(null);

    // Modal: Nuevo Empleado
    const [modalEmpleadoAbierto, setModalEmpleadoAbierto] = useState(false);
    const [modalEmpleadoCargando, setModalEmpleadoCargando] = useState(false);
    const [modalEmpleadoError, setModalEmpleadoError] = useState(null);
    const [modalEmpleadoExito, setModalEmpleadoExito] = useState(null);
    const [formEmpleado, setFormEmpleado] = useState({
        nombreCompleto: '',
        documentoIdentidad: '',
        tipoVinculacion: 'DESTAJO',
        especialidad: 'Operario Confección',
        salarioBase: '0'
    });

    // Modal: Registrar Tarea / Destajo en Planta
    const [modalDestajoAbierto, setModalDestajoAbierto] = useState(false);
    const [modalDestajoCargando, setModalDestajoCargando] = useState(false);
    const [modalDestajoError, setModalDestajoError] = useState(null);
    const [modalDestajoExito, setModalDestajoExito] = useState(null);
    const [formDestajo, setFormDestajo] = useState({
        empleadoId: '',
        fichaTecnicaId: '1',
        faseProduccionId: '',
        ordenProduccionId: '',
        cantidad: '',
        tarifaPorPrenda: '1200',
        fecha: new Date().toISOString().split('T')[0]
    });

    // Carga integral de datos
    const cargarTodo = async (idFichaActual = fichaSeleccionadaId, precio = precioVentaSimulado) => {
        try {
            setErrorBackend(null);

            try {
                const resDash = await api.get(`/dashboard/taller/${empresaId}`);
                setDashboard(resDash.data);
            } catch (e) {
                console.warn("Aviso en Dashboard:", e);
            }

            let idFichaParaCosteo = idFichaActual;

            try {
                const resFichas = await api.get(`/fichas/empresa/${empresaId}`);
                if (Array.isArray(resFichas.data)) {
                    const fichasActivas = resFichas.data.filter(f => f.activa !== false);
                    setFichas(fichasActivas);
                    if (!idFichaParaCosteo && fichasActivas.length > 0) {
                        idFichaParaCosteo = fichasActivas[0].id;
                        setFichaSeleccionadaId(idFichaParaCosteo);
                    }
                }
            } catch (e) {
                console.warn("Aviso en Fichas:", e);
            }

            try {
                const resOrd = await api.get(`/ordenes/empresa/${empresaId}`);
                if (Array.isArray(resOrd.data)) {
                    setOrdenes(resOrd.data);
                    if (resOrd.data.length > 0) {
                        setFormEntrega(prev => ({ ...prev, ordenId: prev.ordenId || String(resOrd.data[0].id) }));
                    }
                }
            } catch (e) {
                console.warn("Aviso en Órdenes:", e);
            }

            try {
                const resInsumos = await api.get(`/insumos/empresa/${empresaId}`);
                if (Array.isArray(resInsumos.data)) {
                    const insumosActivos = resInsumos.data.filter(i => i.activo !== false);
                    setInsumosDisponibles(insumosActivos);
                    const tela = insumosActivos.find(i => i.tipoInsumo === 'TELA') || insumosActivos[0];
                    if (tela) {
                        setFormFicha(prev => ({ ...prev, insumoId: tela.id }));
                    }
                }
            } catch (e) {
                console.warn("Aviso en Insumos:", e);
            }

            if (idFichaParaCosteo) {
                try {
                    const resCosto = await api.get(`/fichas/${idFichaParaCosteo}/resumen-costos?precioVenta=${precio}`);
                    setCostoData(resCosto.data);
                } catch (e) {
                    console.warn("Aviso en Costos:", e);
                }
            } else {
                setCostoData(null);
            }

            try {
                const resSatelites = await api.get(`/satelites/empresa/${empresaId}`);
                if (Array.isArray(resSatelites.data)) {
                    const satelitesActivos = resSatelites.data.filter(s => s.activo !== false);
                    setSatelites(satelitesActivos);
                    if (satelitesActivos.length > 0) {
                        const primerId = String(satelitesActivos[0].id);
                        setSateliteLiquidacionId(prev =>
                            satelitesActivos.some(s => String(s.id) === String(prev)) ? prev : primerId
                        );
                        setFormEntrega(prev => ({
                            ...prev,
                            sateliteId: satelitesActivos.some(s => String(s.id) === String(prev.sateliteId))
                                ? prev.sateliteId
                                : primerId
                        }));
                    }
                }
            } catch (e) {
                console.warn("Aviso en Satélites:", e);
            }

            try {
                const resEmp = await api.get(`/empleados/taller/${empresaId}`);
                if (Array.isArray(resEmp.data)) {
                    const empleadosActivos = resEmp.data.filter(emp => emp.activo !== false);
                    setEmpleados(empleadosActivos);
                    if (empleadosActivos.length > 0) {
                        const primerEmpId = String(empleadosActivos[0].id);
                        setEmpleadoNominaId(prev =>
                            empleadosActivos.some(e => String(e.id) === String(prev)) ? prev : primerEmpId
                        );
                        setFormDestajo(prev => ({
                            ...prev,
                            empleadoId: empleadosActivos.some(e => String(e.id) === String(prev.empleadoId))
                                ? prev.empleadoId
                                : primerEmpId
                        }));
                    }
                }
            } catch (e) {
                console.warn("Aviso en Empleados:", e);
            }

            try {
                const resFases = await api.get(`/produccion-planta/fases`);
                if (Array.isArray(resFases.data)) {
                    setFasesProduccion(resFases.data);
                    if (resFases.data.length > 0) {
                        setFormDestajo(prev => ({ ...prev, faseProduccionId: prev.faseProduccionId || String(resFases.data[0].id) }));
                    }
                }
            } catch (e) {
                console.warn("Aviso en Fases:", e);
            }
        } catch (err) {
            console.error("Error global de conexión:", err);
            setErrorBackend("No se pudo conectar con el servidor Spring Boot.");
        }
    };

    useEffect(() => {
        if (empresaId) {
            cargarTodo(null, 45000);
        }
    }, [empresaId]);

    const handleCambiarFicha = (id) => {
        const numId = Number(id);
        setFichaSeleccionadaId(numId);
        cargarTodo(numId, precioVentaSimulado);
    };

    const recalcularMargen = (nuevoPrecio) => {
        setPrecioVentaSimulado(nuevoPrecio);
        cargarTodo(fichaSeleccionadaId, nuevoPrecio);
    };

    // Guardar Ficha Técnica
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
                setFormFicha(prev => ({ ...prev, referencia: '', descripcion: '' }));
                setModalFichaAbierto(false);
            }, 1000);
        } catch (err) {
            setModalFichaError(err.response?.data?.mensaje || "Error al crear la ficha técnica.");
        } finally {
            setModalFichaCargando(false);
        }
    };

    // Guardar Nuevo Insumo
    const guardarInsumo = async (e) => {
        e.preventDefault();
        setModalInsumoCargando(true);
        setModalInsumoError(null);
        setModalInsumoExito(null);

        const payload = {
            nombre: formInsumo.nombre.trim(),
            tipoInsumo: formInsumo.tipoInsumo,
            unidadMedida: formInsumo.unidadMedida,
            costoUnitario: Number(formInsumo.costoUnitario),
            activo: true
        };

        try {
            const res = await api.post(`/insumos/empresa/${empresaId}`, payload);
            setModalInsumoExito(`¡Insumo "${res.data.nombre}" creado con éxito!`);
            await cargarTodo();

            setTimeout(() => {
                setModalInsumoExito(null);
                setFormInsumo({
                    nombre: '',
                    tipoInsumo: 'TELA',
                    unidadMedida: 'METROS',
                    costoUnitario: ''
                });
                setModalInsumoAbierto(false);
            }, 1000);
        } catch (err) {
            setModalInsumoError(err.response?.data?.mensaje || "Error al registrar el insumo.");
        } finally {
            setModalInsumoCargando(false);
        }
    };

    // Guardar Orden de Producción
    const guardarOrdenProduccion = async (e) => {
        e.preventDefault();
        setModalOrdenCargando(true);
        setModalOrdenError(null);
        setModalOrdenExito(null);

        const payload = {
            numeroOrden: formOrden.numeroOrden.trim(),
            fichaTecnicaId: Number(formOrden.fichaTecnicaId || (fichas[0]?.id ?? 1)),
            cantidadProgramada: Number(formOrden.cantidadProgramada),
            cantidadCortada: Number(formOrden.cantidadCortada),
            fechaInicio: formOrden.fechaInicio,
            fechaEntregaEstimada: formOrden.fechaEntregaEstimada || null
        };

        try {
            const res = await api.post(`/ordenes/empresa/${empresaId}`, payload);
            setModalOrdenExito(`¡Orden ${res.data.numeroOrden} creada con éxito!`);
            await cargarTodo();

            setTimeout(() => {
                setModalOrdenExito(null);
                setFormOrden({
                    numeroOrden: `OP-${new Date().getFullYear()}-00${ordenes.length + 2}`,
                    fichaTecnicaId: fichas[0]?.id || '1',
                    cantidadProgramada: '300',
                    cantidadCortada: '300',
                    fechaInicio: new Date().toISOString().split('T')[0],
                    fechaEntregaEstimada: ''
                });
                setModalOrdenAbierto(false);
            }, 1000);
        } catch (err) {
            setModalOrdenError(err.response?.data?.mensaje || "Error al registrar la orden de producción.");
        } finally {
            setModalOrdenCargando(false);
        }
    };

    // Guardar Entrega de Satélite
    const guardarEntrega = async (e) => {
        e.preventDefault();
        if (!formEntrega.cantidad || Number(formEntrega.cantidad) <= 0) {
            setModalError("Digita una cantidad válida mayor a 0");
            return;
        }

        const idOrden = formEntrega.ordenId || (ordenes[0]?.id ?? 1);
        setModalCargando(true);
        setModalError(null);
        setModalExito(null);

        try {
            await api.post(
                `/satelites/entregas/taller/${empresaId}/satelite/${formEntrega.sateliteId}/orden/${idOrden}?cantidad=${formEntrega.cantidad}&precioPorPrenda=${formEntrega.precioPorPrenda}&fecha=${formEntrega.fecha}`
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

    // Guardar Nuevo Taller Satélite
    const guardarSatelite = async (e) => {
        e.preventDefault();
        setModalSateliteCargando(true);
        setModalSateliteError(null);
        setModalSateliteExito(null);

        try {
            const res = await api.post(`/satelites/empresa/${empresaId}`, formSatelite);
            setModalSateliteExito(`¡Taller ${res.data.nombreTaller} registrado con éxito!`);
            await cargarTodo();

            const nuevoId = String(res.data.id);
            setSateliteLiquidacionId(nuevoId);
            setFormEntrega(prev => ({ ...prev, sateliteId: nuevoId }));

            setTimeout(() => {
                setModalSateliteExito(null);
                setFormSatelite({
                    nombreTaller: '',
                    nombreEncargado: '',
                    nitOIdentificacion: '',
                    telefono: '',
                    especialidad: 'Confección General'
                });
                setModalSateliteAbierto(false);
            }, 1000);
        } catch (err) {
            setModalSateliteError(err.response?.data?.mensaje || "Error al registrar el taller satélite.");
        } finally {
            setModalSateliteCargando(false);
        }
    };

    // Liquidar período satélite
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

    // Guardar Nuevo Empleado
    const guardarEmpleado = async (e) => {
        e.preventDefault();
        setModalEmpleadoCargando(true);
        setModalEmpleadoError(null);
        setModalEmpleadoExito(null);

        const payload = {
            nombreCompleto: formEmpleado.nombreCompleto.trim(),
            documentoIdentidad: formEmpleado.documentoIdentidad.trim(),
            tipoVinculacion: formEmpleado.tipoVinculacion,
            especialidad: formEmpleado.especialidad.trim(),
            salarioBase: Number(formEmpleado.salarioBase || 0),
            activo: true
        };

        try {
            const res = await api.post(`/empleados/taller/${empresaId}`, payload);
            setModalEmpleadoExito(`¡${res.data.nombreCompleto} registrado en nómina!`);
            await cargarTodo();

            const nuevoId = String(res.data.id);
            setEmpleadoNominaId(nuevoId);
            setFormDestajo(prev => ({ ...prev, empleadoId: nuevoId }));

            setTimeout(() => {
                setModalEmpleadoExito(null);
                setFormEmpleado({
                    nombreCompleto: '',
                    documentoIdentidad: '',
                    tipoVinculacion: 'DESTAJO',
                    especialidad: 'Operario Confección',
                    salarioBase: '0'
                });
                setModalEmpleadoAbierto(false);
            }, 1000);
        } catch (err) {
            setModalEmpleadoError(err.response?.data?.mensaje || "Error al registrar el empleado.");
        } finally {
            setModalEmpleadoCargando(false);
        }
    };

    // Registrar Producción a Destajo de Operario
    const guardarDestajo = async (e) => {
        e.preventDefault();
        if (!formDestajo.cantidad || Number(formDestajo.cantidad) <= 0) {
            setModalDestajoError("Digita una cantidad válida mayor a 0");
            return;
        }

        setModalDestajoCargando(true);
        setModalDestajoError(null);
        setModalDestajoExito(null);

        const empId = formDestajo.empleadoId || empleados[0]?.id;
        const fichaId = formDestajo.fichaTecnicaId || fichas[0]?.id || 1;
        const faseId = formDestajo.faseProduccionId || fasesProduccion[0]?.id || 1;
        const ordenParam = formDestajo.ordenProduccionId ? `&ordenProduccionId=${formDestajo.ordenProduccionId}` : '';

        try {
            await api.post(
                `/produccion-planta/taller/${empresaId}?empleadoId=${empId}&fichaTecnicaId=${fichaId}&faseProduccionId=${faseId}&cantidad=${formDestajo.cantidad}&tarifaPorPrenda=${formDestajo.tarifaPorPrenda}&fecha=${formDestajo.fecha}${ordenParam}`
            );
            setModalDestajoExito(`¡${formDestajo.cantidad} unidades cargadas al operario!`);
            await cargarTodo();

            setTimeout(() => {
                setModalDestajoExito(null);
                setFormDestajo(prev => ({ ...prev, cantidad: '' }));
                setModalDestajoAbierto(false);
            }, 1000);
        } catch (err) {
            setModalDestajoError(err.response?.data?.mensaje || "Error al registrar la producción en planta.");
        } finally {
            setModalDestajoCargando(false);
        }
    };

    // Liquidar Nómina Interna de Empleado
    const liquidarNominaEmpleado = async () => {
        if (!empleadoNominaId) {
            setNominaError("Selecciona un trabajador para liquidar.");
            return;
        }
        setNominaCargando(true);
        setNominaError(null);
        try {
            const res = await api.post(
                `/nomina/liquidar/taller/${empresaId}/empleado/${empleadoNominaId}?fechaInicio=${nominaInicio}&fechaFin=${nominaFin}`
            );
            const liq = res.data;
            const resColilla = await api.get(`/nomina/colilla/${liq.id}`);
            setColillaPago({
                ...resColilla.data,
                salarioBaseProporcional: liq.salarioBaseProporcional,
                auxilioTransporte: liq.auxilioTransporte
            });
            await cargarTodo();
        } catch (err) {
            setNominaError(err.response?.data?.mensaje || "Error al liquidar la nómina del trabajador.");
        } finally {
            setNominaCargando(false);
        }
    };

    // Descargar Reporte Contable en Excel (CSV)
    const descargarReporte = async (tipo, nombreArchivo) => {
        try {
            const res = await api.get(`/reportes/${tipo}/empresa/${empresaId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', nombreArchivo);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert("No se pudo generar el archivo de exportación.");
        }
    };

    // Archivar o desactivar registro
    const eliminarRegistro = async (ruta, nombreElemento) => {
        if (!window.confirm(`¿Deseas archivar o desactivar "${nombreElemento}"?`)) return;
        try {
            await api.delete(ruta);
            await cargarTodo(null, precioVentaSimulado);
        } catch (err) {
            alert(err.response?.data?.mensaje || "No se pudo eliminar el registro.");
        }
    };

    const telasDisponibles = Array.isArray(insumosDisponibles)
        ? insumosDisponibles.filter(ins => ins && ins.tipoInsumo === 'TELA')
        : [];

    const navItems = [
        { id: 'resumen', label: 'Vista Integral', icon: LayoutDashboard },
        { id: 'costeo', label: 'Costeo e Insumos', icon: FileSpreadsheet },
        { id: 'ordenes', label: 'Órdenes de Corte', icon: ClipboardList },
        { id: 'satelites', label: 'Talleres Satélites', icon: Truck },
        { id: 'nomina', label: 'Nómina de Planta', icon: Users }
    ];

    const mostrarSeccion = (seccion) => vistaActiva === 'resumen' || vistaActiva === seccion;

    if (!sesion) {
        return <AuthScreen onLoginSuccess={(datos) => setSesion(datos)} />;
    }

    return (
        <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">

            {/* Sidebar Lateral (Escritorio) */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex-shrink-0">
                <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-800">
                    <Scissors className="h-6 w-6 text-indigo-400" />
                    <span className="text-lg font-bold text-white tracking-tight">
                        MiTaller <span className="text-indigo-400 font-normal">SaaS</span>
                    </span>
                </div>

                <div className="p-4 flex-1 space-y-1">
                    <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Módulos Operativos
                    </p>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const activo = vistaActiva === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setVistaActiva(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                                    activo
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
                    <div>
                        <p className="font-semibold text-slate-200">{sesion.razonSocial}</p>
                        <p>{sesion.ciudad} • {sesion.nombreUsuario}</p>
                    </div>
                    <button
                        onClick={cerrarSesion}
                        className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-300 border border-slate-700 transition font-medium"
                    >
                        <LogOut className="h-3.5 w-3.5" /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenedor Principal */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Topbar */}
                <header className="h-16 bg-white border-b border-slate-200 px-6 flex justify-between items-center sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
                            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <h1 className="text-base md:text-lg font-bold text-slate-800">
                            {navItems.find((n) => n.id === vistaActiva)?.label || 'Panel de Control'}
                        </h1>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => cargarTodo()}
                            className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-medium transition"
                        >
                            <RefreshCw className="h-3.5 w-3.5" /> Sincronizar
                        </button>
                        <span className="hidden sm:inline-block text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full font-semibold">
                            {sesion.razonSocial}
                        </span>
                    </div>
                </header>

                {/* Menú Móvil Desplegable */}
                {menuMovilAbierto && (
                    <div className="lg:hidden bg-slate-900 text-white px-4 py-3 space-y-1 border-b border-slate-800">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setVistaActiva(item.id);
                                        setMenuMovilAbierto(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                                        vistaActiva === item.id ? 'bg-indigo-600 text-white' : 'text-slate-300'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">

                    {errorBackend && (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm flex items-center gap-3 no-print">
                            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                            <span>{errorBackend}</span>
                        </div>
                    )}

                    {/* Tarjetas KPI */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 no-print">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Órdenes Activas</p>
                                <h3 className="text-2xl font-bold text-slate-800 mt-1">{dashboard?.ordenesActivas ?? ordenes.length}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <Layers className="h-6 w-6" />
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Prendas Producidas</p>
                                <h3 className="text-2xl font-bold text-slate-800 mt-1">{dashboard?.totalPrendasProducidasMes ?? 0} uds</h3>
                            </div>
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nómina Pagada</p>
                                <h3 className="text-2xl font-bold text-slate-800 mt-1">
                                    ${Number(dashboard?.totalNominaPagadaMes ?? 0).toLocaleString('es-CO')}
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
                                    ${Number(dashboard?.provisionesAcumuladasMes ?? 0).toLocaleString('es-CO')}
                                </h3>
                            </div>
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                        </div>
                    </section>

                    {/* Barra de Exportación Contable */}
                    <section className="bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Exportación Contable (Excel / CSV):
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => descargarReporte('nomina', `Planilla_Nomina_${sesion.razonSocial}.csv`)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition"
                            >
                                <Download className="h-3.5 w-3.5" /> Planilla Nómina
                            </button>
                            <button
                                onClick={() => descargarReporte('satelites', `Maquila_Satelites_${sesion.razonSocial}.csv`)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition"
                            >
                                <Download className="h-3.5 w-3.5" /> Liquidaciones Satélites
                            </button>
                            <button
                                onClick={() => descargarReporte('fichas', `Catalogo_Prendas_${sesion.razonSocial}.csv`)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition"
                            >
                                <Download className="h-3.5 w-3.5" /> Catálogo Prendas
                            </button>
                        </div>
                    </section>

                    {/* 1. Panel de Costeo Técnico e Insumos */}
                    {mostrarSeccion('costeo') && (
                        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden no-print">
                            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                                        Motor de Costeo Técnico
                                    </span>

                                    <select
                                        value={fichaSeleccionadaId || ''}
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
                                            <option value="">Sin prendas registradas</option>
                                        )}
                                    </select>

                                    {fichaSeleccionadaId && fichas.length > 0 && (
                                        <button
                                            onClick={() => {
                                                const actual = fichas.find(f => String(f.id) === String(fichaSeleccionadaId));
                                                eliminarRegistro(`/fichas/${fichaSeleccionadaId}`, actual?.referencia || 'Ficha seleccionada');
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition"
                                            title="Archivar prenda seleccionada"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => setModalFichaAbierto(true)}
                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200 transition"
                                    >
                                        <Plus className="h-3.5 w-3.5" /> Nueva Prenda
                                    </button>

                                    <button
                                        onClick={() => setModalInsumoAbierto(true)}
                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200 transition"
                                    >
                                        <Plus className="h-3.5 w-3.5" /> Nuevo Insumo
                                    </button>
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

                            {/* Catálogo rápido de insumos activos */}
                            {insumosDisponibles.length > 0 && (
                                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center gap-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                                        Insumos activos:
                                    </span>
                                    {insumosDisponibles.map((ins) => (
                                        <span
                                            key={ins.id}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-white text-slate-700 border border-slate-200"
                                        >
                                            <span>{ins.nombre} (${Number(ins.costoUnitario).toLocaleString('es-CO')})</span>
                                            <button
                                                onClick={() => eliminarRegistro(`/insumos/${ins.id}`, ins.nombre)}
                                                className="text-slate-400 hover:text-red-600 transition"
                                                title="Desactivar insumo"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {/* 2. Órdenes de Producción */}
                    {mostrarSeccion('ordenes') && (
                        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5 no-print">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <ClipboardList className="h-5 w-5 text-indigo-600" />
                                        Órdenes de Producción y Control de Lotes
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Control de unidades cortadas, asignación de referencias y seguimiento de manufactura.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setModalOrdenAbierto(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition active:scale-95 shadow-sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    Nueva Orden de Producción
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-400 border-b border-slate-100">
                                    <tr>
                                        <th className="py-3 px-4">N° Orden</th>
                                        <th className="py-3 px-4">Referencia Prenda</th>
                                        <th className="py-3 px-4 text-center">Lote Cortado</th>
                                        <th className="py-3 px-4">Avance Maquila</th>
                                        <th className="py-3 px-4 text-center">Fecha Inicio</th>
                                        <th className="py-3 px-4 text-center">Estado</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                    {ordenes.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-6 text-center text-slate-400 italic">
                                                No hay órdenes de producción registradas en este momento.
                                            </td>
                                        </tr>
                                    ) : (
                                        ordenes.map((op) => {
                                            const totalEntregado = (op.entregas || []).reduce(
                                                (sum, ent) => sum + (ent.cantidadPrendas || 0),
                                                0
                                            );
                                            const meta = op.cantidadCortada > 0 ? op.cantidadCortada : op.cantidadProgramada;
                                            const porcentaje = meta > 0 ? Math.min(100, Math.round((totalEntregado / meta) * 100)) : 0;
                                            const estaFinalizada = op.estado === 'FINALIZADA' || op.estado === 'TERMINADA' || porcentaje >= 100;

                                            return (
                                                <tr key={op.id} className="hover:bg-slate-50/60 transition">
                                                    <td className="py-3 px-4 font-bold text-slate-900">{op.numeroOrden}</td>
                                                    <td className="py-3 px-4 font-medium text-slate-700">
                                                        {op.fichaTecnica?.referencia || `Ficha #${op.fichaTecnicaId || '1'}`}
                                                    </td>
                                                    <td className="py-3 px-4 text-center font-bold text-indigo-600">{meta} uds</td>
                                                    <td className="py-3 px-4 min-w-[180px]">
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="font-semibold text-slate-700">
                                                                {totalEntregado} / {meta} uds
                                                            </span>
                                                            <span className={`font-bold ${estaFinalizada ? 'text-emerald-600' : 'text-indigo-600'}`}>
                                                                {porcentaje}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className={`h-2 rounded-full transition-all duration-500 ${
                                                                    estaFinalizada ? 'bg-emerald-500' : 'bg-indigo-600'
                                                                }`}
                                                                style={{ width: `${porcentaje}%` }}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-center text-xs text-slate-500">{op.fechaInicio || '—'}</td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                            estaFinalizada
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                : op.estado === 'EN_PROCESO' || op.estado === 'EN_CONFECCION'
                                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                        }`}>
                                                            {op.estado}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* 3. Talleres Satélites */}
                    {mostrarSeccion('satelites') && (
                        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 no-print">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Truck className="h-5 w-5 text-indigo-600" />
                                        Liquidación de Talleres Satélites (Maquila)
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Liquidación consolidada sin sobrecostos de aportes patronales ni parafiscales.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setModalSateliteAbierto(true)}
                                        className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-semibold transition"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Nuevo Satélite
                                    </button>
                                    <button
                                        onClick={() => setModalAbierto(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition active:scale-95"
                                    >
                                        <Plus className="h-4 w-4 text-indigo-400" />
                                        Nueva Entrega Satélite
                                    </button>
                                </div>
                            </div>

                            {liqError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm no-print">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>{liqError}</span>
                                </div>
                            )}

                            {/* Formulario Liquidación */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60 no-print">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Taller Satélite</label>
                                    <select
                                        value={sateliteLiquidacionId}
                                        onChange={(e) => setSateliteLiquidacionId(e.target.value)}
                                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white font-medium"
                                    >
                                        {satelites.length > 0 ? (
                                            satelites.map((sat) => (
                                                <option key={sat.id} value={sat.id}>
                                                    {sat.nombreTaller} {sat.nombreEncargado ? `(${sat.nombreEncargado})` : ''}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="">Sin talleres satélites</option>
                                        )}
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
                                        disabled={liqCargando || satelites.length === 0}
                                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {liqCargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                        {liqCargando ? 'Liquidando...' : 'Liquidar Período'}
                                    </button>
                                </div>
                            </div>

                            {/* Directorio rápido de satélites activos */}
                            {satelites.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 no-print">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                                        Satélites activos:
                                    </span>
                                    {satelites.map((sat) => (
                                        <span
                                            key={sat.id}
                                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-700 border border-slate-200"
                                        >
                                            <strong>{sat.nombreTaller}</strong> ({sat.especialidad || 'Maquila'})
                                            <button
                                                onClick={() => eliminarRegistro(`/satelites/${sat.id}`, sat.nombreTaller)}
                                                className="text-slate-400 hover:text-red-600 transition"
                                                title="Desactivar taller satélite"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Comprobante Emitido */}
                            {comprobante && (
                                <div className="border border-indigo-200 rounded-xl bg-indigo-50/40 p-6 space-y-4 print-area">
                                    <div className="flex justify-between items-center border-b border-indigo-100 pb-3">
                                        <div>
                                            <span className="text-xs font-bold uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                                                Cuenta de Cobro Aprobada • {sesion.razonSocial}
                                            </span>
                                            <h3 className="text-base font-bold text-slate-800 mt-1">
                                                Liquidación #{comprobante.id} — {comprobante.satelite?.nombreTaller}
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Encargado(a): {comprobante.satelite?.nombreEncargado} | CC/NIT: {comprobante.satelite?.nitOIdentificacion}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => window.print()}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition no-print"
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
                    )}

                    {/* 4. Módulo de Nómina Interna (Planta y Destajo) */}
                    {mostrarSeccion('nomina') && (
                        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 no-print">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-indigo-600" />
                                        Nómina Interna de Planta y Destajo (CST)
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Liquidación laboral con salario base, comisiones a destajo, dominical variable (Art. 176) y provisiones prestacionales.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setModalEmpleadoAbierto(true)}
                                        className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-semibold transition"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        Nuevo Empleado
                                    </button>
                                    <button
                                        onClick={() => setModalDestajoAbierto(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition active:scale-95"
                                    >
                                        <Plus className="h-4 w-4 text-emerald-400" />
                                        Cargar Destajo
                                    </button>
                                </div>
                            </div>

                            {nominaError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm no-print">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>{nominaError}</span>
                                </div>
                            )}

                            {/* Formulario Liquidación Nómina */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60 no-print">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Trabajador / Operario</label>
                                    <select
                                        value={empleadoNominaId}
                                        onChange={(e) => setEmpleadoNominaId(e.target.value)}
                                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white font-medium"
                                    >
                                        {empleados.length === 0 ? (
                                            <option value="">Sin empleados registrados</option>
                                        ) : (
                                            empleados.map((emp) => (
                                                <option key={emp.id} value={emp.id}>
                                                    {emp.nombreCompleto} — {emp.tipoVinculacion}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fecha Inicio</label>
                                    <input
                                        type="date"
                                        value={nominaInicio}
                                        onChange={(e) => setNominaInicio(e.target.value)}
                                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fecha Fin</label>
                                    <input
                                        type="date"
                                        value={nominaFin}
                                        onChange={(e) => setNominaFin(e.target.value)}
                                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={liquidarNominaEmpleado}
                                        disabled={nominaCargando || empleados.length === 0}
                                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {nominaCargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                        {nominaCargando ? 'Calculando...' : 'Liquidar Nómina'}
                                    </button>
                                </div>
                            </div>

                            {/* Listado rápido de personal activo en Nómina */}
                            {empleados.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 no-print">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                                        Personal activo:
                                    </span>
                                    {empleados.map((emp) => (
                                        <span
                                            key={emp.id}
                                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-700 border border-slate-200"
                                        >
                                            <strong>{emp.nombreCompleto}</strong> ({emp.especialidad || emp.tipoVinculacion})
                                            <button
                                                onClick={() => eliminarRegistro(`/empleados/${emp.id}`, emp.nombreCompleto)}
                                                className="text-slate-400 hover:text-red-600 transition"
                                                title="Retirar de nómina activa"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Colilla de Pago Detallada */}
                            {colillaPago && (
                                <div className="border border-emerald-200 rounded-xl bg-emerald-50/40 p-6 space-y-4 print-area">
                                    <div className="flex justify-between items-center border-b border-emerald-100 pb-3">
                                        <div>
                                            <span className="text-xs font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                                Desprendible de Nómina ({colillaPago.tipoContrato}) • {colillaPago.empresaNombre}
                                            </span>
                                            <h3 className="text-base font-bold text-slate-800 mt-1">
                                                {colillaPago.empleadoNombre} — CC {colillaPago.empleadoDocumento}
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Período: {colillaPago.periodoInicio} al {colillaPago.periodoFin}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => window.print()}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition no-print"
                                        >
                                            <Printer className="h-4 w-4 text-slate-600" /> Imprimir Colilla
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm bg-white p-4 rounded-lg border border-emerald-100">
                                        <div>
                                            <p className="text-xs text-slate-400">Base Proporcional:</p>
                                            <p className="font-semibold text-slate-800">${Number(colillaPago.salarioBaseProporcional || 0).toLocaleString('es-CO')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Destajo + Dominical:</p>
                                            <p className="font-semibold text-indigo-600">${Number(colillaPago.totalDestajoBruto || 0).toLocaleString('es-CO')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Aux. Transporte:</p>
                                            <p className="font-semibold text-slate-800">${Number(colillaPago.auxilioTransporte || 0).toLocaleString('es-CO')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Deducciones (8%):</p>
                                            <p className="font-semibold text-red-600">-${Number(colillaPago.totalDeducciones || 0).toLocaleString('es-CO')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Neto a Transferir:</p>
                                            <p className="font-extrabold text-emerald-600 text-lg">${Number(colillaPago.netoAPagar || 0).toLocaleString('es-CO')}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-xs text-amber-800 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                                        <span>Reserva Prestaciones Sociales Empleador (Prima, Cesantías, Int., Vacaciones):</span>
                                        <span className="font-bold">${Number(colillaPago.provisionesEmpresa || 0).toLocaleString('es-CO')} COP</span>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                </main>
            </div>

            {/* ================= MODALES ================= */}

            {/* Modal: Crear Nueva Orden de Producción */}
            {modalOrdenAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 no-print">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5 text-indigo-600" />
                                    Nueva Orden de Producción
                                </h3>
                                <p className="text-xs text-slate-500">Lanzamiento de lote de corte y confección</p>
                            </div>
                            <button onClick={() => setModalOrdenAbierto(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={guardarOrdenProduccion} className="p-6 space-y-4">
                            {modalOrdenError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">{modalOrdenError}</div>}
                            {modalOrdenExito && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs">{modalOrdenExito}</div>}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">N° Orden</label>
                                    <input
                                        type="text"
                                        value={formOrden.numeroOrden}
                                        onChange={(e) => setFormOrden({ ...formOrden, numeroOrden: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Referencia Prenda</label>
                                    <select
                                        value={formOrden.fichaTecnicaId}
                                        onChange={(e) => setFormOrden({ ...formOrden, fichaTecnicaId: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    >
                                        {fichas.map((f) => (
                                            <option key={f.id} value={f.id}>{f.referencia}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Unidades Programadas</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formOrden.cantidadProgramada}
                                        onChange={(e) => setFormOrden({ ...formOrden, cantidadProgramada: e.target.value, cantidadCortada: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Unidades Cortadas</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formOrden.cantidadCortada}
                                        onChange={(e) => setFormOrden({ ...formOrden, cantidadCortada: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fecha de Inicio</label>
                                    <input
                                        type="date"
                                        value={formOrden.fechaInicio}
                                        onChange={(e) => setFormOrden({ ...formOrden, fechaInicio: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Entrega Estimada</label>
                                    <input
                                        type="date"
                                        value={formOrden.fechaEntregaEstimada}
                                        onChange={(e) => setFormOrden({ ...formOrden, fechaEntregaEstimada: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" onClick={() => setModalOrdenAbierto(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
                                <button type="submit" disabled={modalOrdenCargando} className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 shadow-sm transition disabled:opacity-50">
                                    {modalOrdenCargando && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {modalOrdenCargando ? 'Registrando...' : 'Lanzar Orden'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Crear Nueva Ficha Técnica */}
            {modalFichaAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 no-print">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
                                    Nueva Ficha Técnica de Prenda
                                </h3>
                                <p className="text-xs text-slate-500">Define los parámetros de costeo técnico</p>
                            </div>
                            <button onClick={() => setModalFichaAbierto(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={guardarFichaTecnica} className="p-6 space-y-4">
                            {modalFichaError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">{modalFichaError}</div>}
                            {modalFichaExito && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs">{modalFichaExito}</div>}

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
                                        placeholder="S,M,L,XL"
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
                                            <option value="">Crea primero una tela en "Nuevo Insumo"</option>
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
                                <button type="button" onClick={() => setModalFichaAbierto(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
                                <button type="submit" disabled={modalFichaCargando} className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 shadow-sm transition disabled:opacity-50">
                                    {modalFichaCargando && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {modalFichaCargando ? 'Guardando...' : 'Crear Ficha Técnica'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Crear Nuevo Insumo */}
            {modalInsumoAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 no-print">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <Layers className="h-5 w-5 text-emerald-600" />
                                    Registrar Materia Prima / Insumo
                                </h3>
                                <p className="text-xs text-slate-500">Catálogo de telas, hilos y avíos para fichas técnicas</p>
                            </div>
                            <button onClick={() => setModalInsumoAbierto(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={guardarInsumo} className="p-6 space-y-4">
                            {modalInsumoError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">{modalInsumoError}</div>}
                            {modalInsumoExito && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs">{modalInsumoExito}</div>}

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre del Insumo</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Tela Popelina Blanca o Hilo Calibre 120"
                                    value={formInsumo.nombre}
                                    onChange={(e) => setFormInsumo({ ...formInsumo, nombre: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Categoría</label>
                                    <select
                                        value={formInsumo.tipoInsumo}
                                        onChange={(e) => setFormInsumo({ ...formInsumo, tipoInsumo: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    >
                                        <option value="TELA">Tela Base</option>
                                        <option value="AVIO">Avío / Accesorio</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Unidad de Medida</label>
                                    <select
                                        value={formInsumo.unidadMedida}
                                        onChange={(e) => setFormInsumo({ ...formInsumo, unidadMedida: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    >
                                        <option value="METROS">Metros</option>
                                        <option value="UNIDADES">Unidades</option>
                                        <option value="CONOS">Conos</option>
                                        <option value="KILOS">Kilos</option>
                                        <option value="CENTIMETROS">Centímetros</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Costo Unitario ($ COP)</label>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    placeholder="Ej: 16500"
                                    value={formInsumo.costoUnitario}
                                    onChange={(e) => setFormInsumo({ ...formInsumo, costoUnitario: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" onClick={() => setModalInsumoAbierto(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
                                <button type="submit" disabled={modalInsumoCargando} className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-2 shadow-sm transition disabled:opacity-50">
                                    {modalInsumoCargando && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {modalInsumoCargando ? 'Guardando...' : 'Guardar Insumo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Entrega Satélite */}
            {modalAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 no-print">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">Registrar Entrega de Satélite</h3>
                                <p className="text-xs text-slate-500">Recepción de lote confeccionado</p>
                            </div>
                            <button onClick={() => setModalAbierto(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={guardarEntrega} className="p-6 space-y-4">
                            {modalError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">{modalError}</div>}
                            {modalExito && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs">{modalExito}</div>}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Taller Satélite</label>
                                    <select
                                        value={formEntrega.sateliteId}
                                        onChange={(e) => setFormEntrega({ ...formEntrega, sateliteId: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    >
                                        {satelites.length > 0 ? (
                                            satelites.map((sat) => (
                                                <option key={sat.id} value={sat.id}>
                                                    {sat.nombreTaller} {sat.nombreEncargado ? `(${sat.nombreEncargado})` : ''}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="">Sin talleres satélites</option>
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Orden de Producción</label>
                                    <select
                                        value={formEntrega.ordenId}
                                        onChange={(e) => setFormEntrega({ ...formEntrega, ordenId: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    >
                                        {ordenes.length === 0 ? (
                                            <option value="">No hay órdenes activas</option>
                                        ) : (
                                            ordenes.map((op) => {
                                                const entregado = (op.entregas || []).reduce((acc, e) => acc + (e.cantidadPrendas || 0), 0);
                                                const pendientes = Math.max(0, (op.cantidadCortada || op.cantidadProgramada) - entregado);
                                                return (
                                                    <option key={op.id} value={op.id} disabled={pendientes === 0}>
                                                        {op.numeroOrden} — {op.fichaTecnica?.referencia || `Ficha #${op.fichaTecnicaId || '1'}`} ({pendientes} pendientes)
                                                    </option>
                                                );
                                            })
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
                                <button type="button" onClick={() => setModalAbierto(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
                                <button type="submit" disabled={modalCargando} className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 shadow-sm transition disabled:opacity-50">
                                    {modalCargando && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {modalCargando ? 'Guardando...' : 'Confirmar Recepción'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Crear Nuevo Taller Satélite */}
            {modalSateliteAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 no-print">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-indigo-600" />
                                    Registrar Taller Satélite
                                </h3>
                                <p className="text-xs text-slate-500">Alta de taller externo de maquila y confección</p>
                            </div>
                            <button onClick={() => setModalSateliteAbierto(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={guardarSatelite} className="p-6 space-y-4">
                            {modalSateliteError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">{modalSateliteError}</div>}
                            {modalSateliteExito && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs">{modalSateliteExito}</div>}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre del Taller</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Satélite El Costurero"
                                        value={formSatelite.nombreTaller}
                                        onChange={(e) => setFormSatelite({ ...formSatelite, nombreTaller: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Encargado(a)</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Martha Lucía Pérez"
                                        value={formSatelite.nombreEncargado}
                                        onChange={(e) => setFormSatelite({ ...formSatelite, nombreEncargado: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">NIT o Cédula</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 1098654321"
                                        value={formSatelite.nitOIdentificacion}
                                        onChange={(e) => setFormSatelite({ ...formSatelite, nitOIdentificacion: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Teléfono / WhatsApp</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 315 890 1234"
                                        value={formSatelite.telefono}
                                        onChange={(e) => setFormSatelite({ ...formSatelite, telefono: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Especialidad de Confección</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Jeans, Camisería, Tejido de punto"
                                    value={formSatelite.especialidad}
                                    onChange={(e) => setFormSatelite({ ...formSatelite, especialidad: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" onClick={() => setModalSateliteAbierto(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
                                <button type="submit" disabled={modalSateliteCargando} className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 shadow-sm transition disabled:opacity-50">
                                    {modalSateliteCargando && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {modalSateliteCargando ? 'Guardando...' : 'Guardar Taller'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Crear Nuevo Empleado */}
            {modalEmpleadoAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 no-print">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <UserPlus className="h-5 w-5 text-indigo-600" />
                                    Registrar Personal en Nómina
                                </h3>
                                <p className="text-xs text-slate-500">Operarios de planta, destajo o personal administrativo</p>
                            </div>
                            <button onClick={() => setModalEmpleadoAbierto(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={guardarEmpleado} className="p-6 space-y-4">
                            {modalEmpleadoError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">{modalEmpleadoError}</div>}
                            {modalEmpleadoExito && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs">{modalEmpleadoExito}</div>}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre Completo</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Carlos Andrés Mejía"
                                        value={formEmpleado.nombreCompleto}
                                        onChange={(e) => setFormEmpleado({ ...formEmpleado, nombreCompleto: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Cédula / Documento</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 1095812345"
                                        value={formEmpleado.documentoIdentidad}
                                        onChange={(e) => setFormEmpleado({ ...formEmpleado, documentoIdentidad: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tipo de Vinculación</label>
                                    <select
                                        value={formEmpleado.tipoVinculacion}
                                        onChange={(e) => setFormEmpleado({ ...formEmpleado, tipoVinculacion: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    >
                                        <option value="DESTAJO">Destajo / Base + Comisión</option>
                                        <option value="SALARIO_FIJO">Salario Fijo (Administrativo)</option>
                                        <option value="PRESTACION_SERVICIOS">Prestación de Servicios</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Cargo / Especialidad</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Fileteador, Cortador, Contador"
                                        value={formEmpleado.especialidad}
                                        onChange={(e) => setFormEmpleado({ ...formEmpleado, especialidad: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                                    Salario Base Mensual ($ COP) — <span className="text-slate-400 font-normal">0 si es 100% destajo</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Ej: 1423500"
                                    value={formEmpleado.salarioBase}
                                    onChange={(e) => setFormEmpleado({ ...formEmpleado, salarioBase: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" onClick={() => setModalEmpleadoAbierto(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
                                <button type="submit" disabled={modalEmpleadoCargando} className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 shadow-sm transition disabled:opacity-50">
                                    {modalEmpleadoCargando && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {modalEmpleadoCargando ? 'Guardando...' : 'Guardar Trabajador'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Registrar Producción a Destajo */}
            {modalDestajoAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 no-print">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">Registrar Producción a Destajo</h3>
                                <p className="text-xs text-slate-500">Carga de prendas o fases confeccionadas en planta</p>
                            </div>
                            <button onClick={() => setModalDestajoAbierto(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={guardarDestajo} className="p-6 space-y-4">
                            {modalDestajoError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">{modalDestajoError}</div>}
                            {modalDestajoExito && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs">{modalDestajoExito}</div>}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Operario</label>
                                    <select
                                        value={formDestajo.empleadoId}
                                        onChange={(e) => setFormDestajo({ ...formDestajo, empleadoId: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    >
                                        {empleados.map((emp) => (
                                            <option key={emp.id} value={emp.id}>{emp.nombreCompleto}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fase / Operación</label>
                                    <select
                                        value={formDestajo.faseProduccionId}
                                        onChange={(e) => setFormDestajo({ ...formDestajo, faseProduccionId: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    >
                                        {fasesProduccion.length > 0 ? (
                                            fasesProduccion.map((f) => (
                                                <option key={f.id} value={f.id}>{f.nombre}</option>
                                            ))
                                        ) : (
                                            <option value="1">Confección General</option>
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Referencia Prenda</label>
                                    <select
                                        value={formDestajo.fichaTecnicaId}
                                        onChange={(e) => setFormDestajo({ ...formDestajo, fichaTecnicaId: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    >
                                        {fichas.map((f) => (
                                            <option key={f.id} value={f.id}>{f.referencia}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Orden (Opcional)</label>
                                    <select
                                        value={formDestajo.ordenProduccionId}
                                        onChange={(e) => setFormDestajo({ ...formDestajo, ordenProduccionId: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    >
                                        <option value="">Sin orden específica</option>
                                        {ordenes.map((op) => (
                                            <option key={op.id} value={op.id}>{op.numeroOrden}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Cantidad</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Ej: 45"
                                        value={formDestajo.cantidad}
                                        onChange={(e) => setFormDestajo({ ...formDestajo, cantidad: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tarifa ($)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formDestajo.tarifaPorPrenda}
                                        onChange={(e) => setFormDestajo({ ...formDestajo, tarifaPorPrenda: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fecha</label>
                                    <input
                                        type="date"
                                        value={formDestajo.fecha}
                                        onChange={(e) => setFormDestajo({ ...formDestajo, fecha: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {Number(formDestajo.cantidad) > 0 && (
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                                    <span className="text-slate-600">Total Destajo Generado:</span>
                                    <span className="text-emerald-600 font-bold text-sm">
                                        ${(Number(formDestajo.cantidad) * Number(formDestajo.tarifaPorPrenda)).toLocaleString('es-CO')} COP
                                    </span>
                                </div>
                            )}

                            <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" onClick={() => setModalDestajoAbierto(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
                                <button type="submit" disabled={modalDestajoCargando} className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-2 shadow-sm transition disabled:opacity-50">
                                    {modalDestajoCargando && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {modalDestajoCargando ? 'Guardando...' : 'Cargar Producción'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}