"use strict";

const API_FRANKFURTER =
  "https://api.frankfurter.dev/v2/rates?base=USD&quotes=EUR,MXN";

const CLAVE_INVENTARIO = "inventario_vehiculos";

const TASAS_FALLBACK = {
  USD: 1,
  EUR: 0.92,
  MXN: 17.0
};

const SUCURSALES = [
  {
    id: "suc-santa-ana",
    nombre: "Sucursal Santa Ana",
    lat: 13.9942,
    lon: -89.5597
  },
  {
    id: "suc-san-salvador",
    nombre: "Sucursal San Salvador",
    lat: 13.6929,
    lon: -89.2182
  },
  {
    id: "suc-san-miguel",
    nombre: "Sucursal San Miguel",
    lat: 13.4833,
    lon: -88.1833
  }
];

let divisaActiva = "USD";
let tasasConversion = { ...TASAS_FALLBACK };
let vehiculosDisponibles = [];
let sucursalCercana = null;

function crearVehiculosDePrueba() {
  return [
    {
      id: "veh-001",
      marca: "Toyota",
      modelo: "Corolla",
      anio: 2023,
      precioUSD: 24500,
      estado: "Disponible",
      sucursalId: "suc-san-salvador"
    },
    {
      id: "veh-002",
      marca: "Honda",
      modelo: "Civic",
      anio: 2022,
      precioUSD: 26900,
      estado: "Disponible",
      sucursalId: "suc-santa-ana"
    },
    {
      id: "veh-003",
      marca: "Hyundai",
      modelo: "Tucson",
      anio: 2024,
      precioUSD: 32750,
      estado: "Disponible",
      sucursalId: "suc-san-miguel"
    }
  ];
}

function obtenerVehiculos() {
  try {
    const inventarioGuardado = localStorage.getItem(CLAVE_INVENTARIO);

    if (inventarioGuardado) {
      const vehiculos = JSON.parse(inventarioGuardado);

      if (Array.isArray(vehiculos) && vehiculos.length > 0) {
        return vehiculos;
      }
    }
  } catch (error) {
    console.warn(
      "El inventario guardado no es válido; se crearán datos de prueba.",
      error
    );
  }

  const vehiculosDePrueba = crearVehiculosDePrueba();

  try {
    localStorage.setItem(CLAVE_INVENTARIO, JSON.stringify(vehiculosDePrueba));
  } catch (error) {
    console.warn("No fue posible guardar el inventario de prueba.", error);
  }

  return vehiculosDePrueba;
}

function obtenerNombreSucursal(sucursalId) {
  return (
    SUCURSALES.find((sucursal) => sucursal.id === sucursalId)?.nombre ??
    "Sucursal no asignada"
  );
}

function renderizarTabla(vehiculos, divisaActiva, tasaConversion) {
  const cuerpoTabla = document.querySelector("#tabla-inventario");

  if (!cuerpoTabla) {
    console.warn("No se encontró el cuerpo de la tabla de inventario.");
    return;
  }

  cuerpoTabla.replaceChildren();

  if (!Array.isArray(vehiculos) || vehiculos.length === 0) {
    const filaVacia = document.createElement("tr");
    const celdaVacia = document.createElement("td");

    celdaVacia.colSpan = 3;
    celdaVacia.className = "text-center text-body-secondary py-4";
    celdaVacia.textContent = "No hay vehículos para mostrar.";
    filaVacia.appendChild(celdaVacia);
    cuerpoTabla.appendChild(filaVacia);
    return;
  }

  const divisa = ["USD", "EUR", "MXN"].includes(divisaActiva)
    ? divisaActiva
    : "USD";
  const tasa = Number.isFinite(tasaConversion) ? tasaConversion : 1;
  const formatoMoneda = new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: divisa,
    minimumFractionDigits: 2
  });

  vehiculos.forEach((vehiculo) => {
    const fila = document.createElement("tr");
    const celdaVehiculo = document.createElement("td");
    const celdaSucursal = document.createElement("td");
    const celdaPrecio = document.createElement("td");
    const nombreVehiculo = `${vehiculo.marca ?? ""} ${vehiculo.modelo ?? ""}`.trim();
    const precioUSD = Number(vehiculo.precioUSD);
    const precioConvertido = Number.isFinite(precioUSD)
      ? precioUSD * tasa
      : 0;

    celdaVehiculo.textContent =
      `${nombreVehiculo || "Vehículo sin nombre"} (${vehiculo.anio ?? "N/D"})`;
    celdaSucursal.textContent = obtenerNombreSucursal(vehiculo.sucursalId);
    celdaPrecio.textContent = formatoMoneda.format(precioConvertido);

    fila.append(celdaVehiculo, celdaSucursal, celdaPrecio);
    cuerpoTabla.appendChild(fila);
  });
}

async function obtenerTasasConversion() {
  try {
    const respuesta = await fetch(API_FRANKFURTER);

    if (!respuesta.ok) {
      throw new Error(`Frankfurter respondió con estado ${respuesta.status}`);
    }

    const registros = await respuesta.json();

    if (!Array.isArray(registros)) {
      throw new Error("Frankfurter devolvió un formato inesperado");
    }

    const datos = {
      rates: Object.fromEntries(
        registros.map(({ quote, rate }) => [quote, rate])
      )
    };

    if (
      typeof datos.rates?.EUR !== "number" ||
      typeof datos.rates?.MXN !== "number"
    ) {
      throw new Error("Frankfurter devolvió tasas incompletas");
    }

    return {
      USD: 1,
      EUR: datos.rates.EUR,
      MXN: datos.rates.MXN
    };
  } catch (error) {
    console.warn(
      "No fue posible consultar Frankfurter; se usarán tasas de respaldo.",
      error
    );
    return { ...TASAS_FALLBACK };
  }
}

async function cargarVehiculosDisponibles() {
  try {
    const vehiculos = await obtenerVehiculos();
    return Array.isArray(vehiculos) ? vehiculos : [];
  } catch (error) {
    console.error("No fue posible obtener los vehículos.", error);
    return [];
  }
}

function filtrarPorSucursal(vehiculos) {
  const switchFiltro = document.querySelector("#filtro-sucursal");

  if (!switchFiltro?.checked || !sucursalCercana) {
    return vehiculos;
  }

  // Admite nombres de propiedad comunes sin imponer un modelo a otro integrante.
  const obtenerSucursalId = (vehiculo) =>
      vehiculo.sucursalId ??
      vehiculo.sucursal_id ??
      vehiculo.sucursal?.id ??
      (typeof vehiculo.sucursal === "string" ? vehiculo.sucursal : undefined);

  const hayDatosDeSucursal = vehiculos.some(
    (vehiculo) => obtenerSucursalId(vehiculo) !== undefined
  );

  if (!hayDatosDeSucursal) {
    // El evento filtroSucursalCambiado permite que el módulo dueño del modelo filtre.
    return vehiculos;
  }

  return vehiculos.filter(
    (vehiculo) => obtenerSucursalId(vehiculo) === sucursalCercana.id
  );
}

function actualizarTablaInventario() {
  const tasaConversion = tasasConversion[divisaActiva] ?? 1;
  const vehiculos = filtrarPorSucursal(vehiculosDisponibles);

  renderizarTabla(vehiculos, divisaActiva, tasaConversion);
}

function configurarSelectorDivisa() {
  const selector = document.querySelector("#selector-divisa");

  if (!selector) {
    return;
  }

  selector.value = divisaActiva;
  selector.addEventListener("change", (evento) => {
    const nuevaDivisa = evento.target.value;

    if (!Object.hasOwn(tasasConversion, nuevaDivisa)) {
      return;
    }

    divisaActiva = nuevaDivisa;
    actualizarTablaInventario();

    document.dispatchEvent(
      new CustomEvent("divisaCambiada", {
        detail: {
          divisaActiva,
          tasaConversion: tasasConversion[divisaActiva]
        }
      })
    );
  });
}

function convertirGradosARadianes(grados) {
  return grados * (Math.PI / 180);
}

function calcularDistanciaHaversine(lat1, lon1, lat2, lon2) {
  const RADIO_TIERRA_KM = 6371;
  const diferenciaLatitud = convertirGradosARadianes(lat2 - lat1);
  const diferenciaLongitud = convertirGradosARadianes(lon2 - lon1);
  const latitud1 = convertirGradosARadianes(lat1);
  const latitud2 = convertirGradosARadianes(lat2);

  const haversine =
    Math.sin(diferenciaLatitud / 2) ** 2 +
    Math.cos(latitud1) *
      Math.cos(latitud2) *
      Math.sin(diferenciaLongitud / 2) ** 2;

  const anguloCentral =
    2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return RADIO_TIERRA_KM * anguloCentral;
}

function encontrarSucursalMasCercana(latitud, longitud) {
  return SUCURSALES.reduce((masCercana, sucursal) => {
    const distancia = calcularDistanciaHaversine(
      latitud,
      longitud,
      sucursal.lat,
      sucursal.lon
    );

    if (!masCercana || distancia < masCercana.distancia) {
      return { ...sucursal, distancia };
    }

    return masCercana;
  }, null);
}

function mostrarAlertaSucursal(sucursal) {
  const contenedor = document.querySelector("#alerta-sucursal");

  if (!contenedor) {
    return;
  }

  contenedor.innerHTML = `
    <div class="alert alert-info" role="alert">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <span>
          Detectamos que tu sucursal más cercana es ${sucursal.nombre}.
          ¿Deseas filtrar el inventario de esta zona?
        </span>
        <div class="form-check form-switch mb-0">
          <input
            class="form-check-input"
            type="checkbox"
            role="switch"
            id="filtro-sucursal"
          >
          <label class="form-check-label" for="filtro-sucursal">
            Filtrar por sucursal
          </label>
        </div>
      </div>
    </div>
  `;

  document
    .querySelector("#filtro-sucursal")
    ?.addEventListener("change", (evento) => {
      actualizarTablaInventario();

      document.dispatchEvent(
        new CustomEvent("filtroSucursalCambiado", {
          detail: {
            activo: evento.target.checked,
            sucursalId: sucursal.id
          }
        })
      );
    });
}

function detectarSucursalCercana() {
  if (!("geolocation" in navigator)) {
    console.info("La geolocalización no está disponible en este navegador.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (posicion) => {
      const { latitude, longitude } = posicion.coords;
      sucursalCercana = encontrarSucursalMasCercana(latitude, longitude);

      if (!sucursalCercana) {
        return;
      }

      sessionStorage.setItem("sucursal_cercana_id", sucursalCercana.id);
      mostrarAlertaSucursal(sucursalCercana);
    },
    (error) => {
      console.info(
        "No se pudo determinar la sucursal más cercana.",
        error.message
      );
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000
    }
  );
}

async function inicializarConectividadExterna() {
  configurarSelectorDivisa();
  detectarSucursalCercana();

  const [tasas, vehiculos] = await Promise.all([
    obtenerTasasConversion(),
    cargarVehiculosDisponibles()
  ]);

  tasasConversion = tasas;
  vehiculosDisponibles = vehiculos;
  actualizarTablaInventario();
}

document.addEventListener("DOMContentLoaded", inicializarConectividadExterna);

// API pública mínima para facilitar la integración con los demás módulos.
globalThis.conectividadExterna = {
  SUCURSALES,
  calcularDistanciaHaversine,
  obtenerTasasConversion,
  actualizarTablaInventario
};
