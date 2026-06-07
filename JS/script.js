//ts-check
import persistencia from './Controller/Persistencia.js';
import { ValidarEntrada } from './Controller/ValidarEntrada.js'
import { Vehiculo } from './dto/Vehiculo.js'
import { LocalizacionServicio } from './Controller/LocalizacionServicio.js';
import { CalculoDivisaService } from './Controller/CalculoDivisaService.js';

const validador = new ValidarEntrada();
const geoServicio = new LocalizacionServicio();
const divisaServicio = new CalculoDivisaService();

const formuVeh = document.getElementById("formulario-vehiculo");
var miGraficoDona = null;
var divisaActual = 'USD';
var tasaCambioActual = 1;
var todasLasTasas = { EUR: 0.93, JPY: 159.86 }; // Valores iniciales por defecto

function mostrarMsgErr(mensaje) {

  const contenedor = document.getElementById("contenedor-alertas");
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i> ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

async function cargarDataInicial() {
  var vehiculos = await persistencia.ObtenerVehiculos();
  console.log("Inventario cargado");
  try {
    todasLasTasas = await divisaServicio.ObtenerTasasDivisa();
  } catch (er) {
    console.error("Error al obtener las divisas: ", er);
  }
  await ejModGeolocalizacion();
  await renderizarTabla(vehiculos, divisaActual, tasaCambioActual);
  await actualizarMetricas(vehiculos);
}

document.addEventListener("DOMContentLoaded", async () => {
  if (formuVeh) {
    formuVeh.addEventListener("submit", enviarFormulario);
  }
  var btnCancelar = document.getElementById("btn-cancelar-edicion");
  if (btnCancelar) {
    btnCancelar.addEventListener("click", abortarEdicion);
  }

  var seltDivisa = document.getElementById("select-divisa");

  if (seltDivisa) {
    seltDivisa.addEventListener("change", async (e) => {
      var obj = e.target;
      divisaActual = obj.value;
      if (divisaActual == 'USD') tasaCambioActual = 1;
      if (divisaActual == 'EUR') tasaCambioActual = todasLasTasas.EUR;
      if (divisaActual == 'JPY') tasaCambioActual = todasLasTasas.JPY;
      var vehiculo = await persistencia.ObtenerVehiculos();
      await renderizarTabla(vehiculo, divisaActual, tasaCambioActual);
    });

  }

  cargarDataInicial();
});

//en evento se esperar el submit del formulario, es decir el boton send
async function enviarFormulario(evento) {
  var vehiculo = new Vehiculo();

  evento.preventDefault(); //Evitamos en navegadores que el evento de recarga se active.
  limpiarInvalidos();

  vehiculo.id = document.getElementById("imput-id").value || null;
  vehiculo.marca = document.getElementById("imput-marca").value;
  vehiculo.modelo = document.getElementById("imput-modelo").value;
  vehiculo.anio = document.getElementById("imput-anio").value;
  vehiculo.precioUSD = document.getElementById("imput-precio").value;
  vehiculo.estado = document.getElementById("imput-estado").value;
  vehiculo.sucursalId = document.getElementById("imput-suculsal").value;

  var validacion = await validador.ValidarDatosVehiculos(vehiculo);
  console.log("valido es: ", validacion.esValido);
  if (validacion == null) {

  }
  if (!validacion.esValido) {
    console.log(`Valido: ${validacion}`);
    for (const element in validacion.mensaje) {
      var atributo = document.getElementById(`imput-${element}`);
      console.log(`Valido: ${validacion.esValido}, mensaje ${element}`);
      if (atributo) {
        atributo.classList.add("is-invalid");

        var feedback = atributo.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
          feedback.innerHTML = validacion.mensaje[element]
        }
      }
    }
    mostrarMsgErr("Por favor, corrige las entradas inválidas en el formulario.");
    return;
  }

  vehiculo.anio = parseInt(vehiculo.anio, 10);
  vehiculo.precioUSD = parseFloat(vehiculo.precioUSD);

  if (await persistencia.GuardarVehiculo(vehiculo)) {
    formuVeh.reset();
    abortarEdicion();
    var datos = await persistencia.ObtenerVehiculos()
    await renderizarTabla(datos, divisaActual, tasaCambioActual);
    await actualizarMetricas(datos);
    document.getElementById("imput-id").value = "";
    alert("Vehiculo guardado");
  } else {
    mostrarMsgErr("Error crítico: No se pudo escribir en el almacenamiento del navegador.");
  }
}

async function limpiarInvalidos() {
  var invalidados = document.querySelectorAll('.is-invalid');
  for (let index = 0; index < invalidados.length; index++) {
    const element = invalidados[index];
    element.classList.remove('is-invalid');
  }
}

async function renderizarTabla(vehiculos, divisaActiva = 'USD', tasaConversion = 1) {
  const tablaBody = document.getElementById('tabla-vehiculos-body');
  if (!tablaBody) return;

  tablaBody.innerHTML = "";

  var simbolo = "$";
  if (divisaActiva == "EUR") simbolo = "€";
  if (divisaActiva == "JPY") simbolo = "¥";
  vehiculos.forEach(v => {
    var fila = document.createElement('tr');
    console.log(`vehiculos guardados`, vehiculos);
    var claseBadge = "bg-success";
    if (v._estado == "Vendido") {
      claseBadge = "bg-danger";
    } else if (v._estado == "Reservado") {
      claseBadge = "bg-warning text-dark";
    }

    var precioCalculado = (parseFloat(v._precioUSD) * tasaConversion).toFixed(2);
    console.log(`marca+${v._marca}`);
    fila.innerHTML = `<td><strong>${v._marca}</strong></td>`;
    fila.innerHTML += `<td>${v._modelo}</td>`;
    fila.innerHTML += `<td>${v._anio}</td>`;
    fila.innerHTML += `<td>${simbolo}${Number(precioCalculado).toLocaleString('en-US')}</td>`;
    fila.innerHTML += `<td><span class="badge ${claseBadge}">${v._estado}</span></td>`;
    fila.innerHTML += `<td><button class="btn btn-sm btn-outline-primary btn-editar" data-id="${v._id}">
    <i class="bi bi-pencil-square"></i>
    </button>
    <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${v.id}">
      <i class="bi bi-trash-fill"></i>
    </button>
    </td>`;

    fila.querySelector(".btn-editar")?.addEventListener("click", async () => {
      await cargarVehiculoFormulario(v);
    });

    fila.querySelector(".btn-eliminar")?.addEventListener("click", async () => {
      var salida = `Deseas eliminar el registro de: ${v._marca} ${v._modelo}?`;
      if (confirm(salida)) {
        var completado = await persistencia.EliminarVehiculo(v._id);
        if (completado) {
          var invRefress = await persistencia.ObtenerVehiculos();
          await renderizarTabla(invRefress, divisaActual, tasaConversion);
          await actualizarMetricas(invRefress);
        } else {
          mostrarMsgErr("Error al intentar eliminar el vehiculo");
        }
      }
    });
    tablaBody.appendChild(fila);
  });
}

async function cargarVehiculoFormulario(vehiculo) {
  document.getElementById("imput-id").value = vehiculo._id;
  document.getElementById("imput-marca").value = vehiculo._marca;
  document.getElementById("imput-modelo").value = vehiculo._modelo;
  document.getElementById("imput-anio").value = vehiculo._anio;
  document.getElementById("imput-precio").value = vehiculo._precioUSD;
  document.getElementById("imput-estado").value = vehiculo._estado;
  document.getElementById("imput-suculsal").value = vehiculo.sucursalId;

  document.getElementById("titulo-formulario").innerHTML = `<i class="bi bi-pencil-square me-2 text-warning"></i>Modificar Vehículo`;
  document.getElementById("btn-guardar").className = "btn btn-warning w-100";
  document.getElementById("btn-guardar").innerText = "Actualizar Cambios";
  document.getElementById("btn-cancelar-edicion").classList.remove("d-none");

  document.getElementById("formulario-vehiculo")?.scrollIntoView({ behavior: 'smooth' });
}

function abortarEdicion() {
  formuVeh.reset();
  document.getElementById("imput-id").value = "";
  document.getElementById("titulo-formulario").innerHTML = `<i class="bi bi-pencil-square me-2 text-primary"></i>Registrar Vehículo`;
  document.getElementById("btn-guardar").className = "btn btn-primary w-100";
  document.getElementById("btn-guardar").innerText = "Guardar Vehículo";
  document.getElementById("btn-cancelar-edicion").classList.add("d-none");
  limpiarInvalidos();
}

async function inicilizarGraficas(datosMetrica) {
  const ctx = document.getElementById("graficoEstados");
  //datos dashboard
  var vehiculos = await persistencia.ObtenerVehiculos();
  var totalv = 0;
  document.getElementById('metrica-total').innerHTML = datosMetrica.Disponible + datosMetrica.Reservado;
  vehiculos.forEach(v => {
    if (v._estado != 'Vendido') totalv += v._precioUSD;
  });
  document.getElementById('metrica-valor').innerHTML = totalv;
  document.getElementById('metrica-salidas').innerHTML = datosMetrica.Vendido + datosMetrica.Reservado;

  if (!ctx) return;
  var confData = {
    labels: ['Disponible', 'Vendido', 'Reservado'],
    datasets: [{
      label: 'Vehiculo por Estado',
      data: [datosMetrica.Disponible, datosMetrica.Vendido, datosMetrica.Reservado],
      backgroundColor: ['#198754', '#dc3545', '#ffc107'],
      hoverOffset: 4
    }]
  };
  if (!miGraficoDona) {
    var ext = Chart.getChart(ctx);
    if (ext) {
      ext.destroy();
    }
  }

  if (miGraficoDona) {
    miGraficoDona.data = confData;
    miGraficoDona.update();
  } else {
    miGraficoDona = new Chart(ctx, {
      type: 'doughnut',
      data: confData,
      options: {
        reponsive: true,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }
}

async function actualizarMetricas(vehiculos) {
  var conteoE = { Disponible: 0, Vendido: 0, Reservado: 0 };

  vehiculos.forEach(v => {
    if (v._estado == "Disponible") conteoE.Disponible++;
    if (v._estado == "Vendido") conteoE.Vendido++;
    if (v._estado == "Reservado") conteoE.Reservado++;
  });
  console.log("conteo: ", conteoE);

  await inicilizarGraficas(conteoE);
}

async function ejModGeolocalizacion() {
  try {
    var resGeo = await geoServicio.CalcularSedeMasCercana();
    var infSuc = resGeo.sucursal;
    var distancia = resGeo.distancia.toFixed(1);
    var distancias = resGeo.distanciasCompletas;

    var spanSantaAna = document.getElementById("distancia-santa-ana");
    var spanSanSalvador = document.getElementById("distancia-san-salvador");
    var spanSanMiguel = document.getElementById("distancia-san-miguel");
    var statusBanner = document.getElementById("geolocalizacion-status");
    if (statusBanner) statusBanner.classList.add("d-none");
    if (spanSantaAna && distancias["suc-santa-ana"]) spanSantaAna.innerText = `${distancias["suc-santa-ana"].toFixed(1)} km`;
    
    if (spanSanSalvador && distancias["suc-san-salvador"]) spanSanSalvador.innerText = `${distancias["suc-san-salvador"].toFixed(1)} km`;
    
    if (spanSanMiguel && distancias["suc-san-miguel"]) spanSanMiguel.innerText = `${distancias["suc-san-miguel"].toFixed(1)} km`;
    
    var cont = document.getElementById('contenedor-alertas');
    if (!cont) return;

    var alertGeo = document.createElement('div');
    alertGeo.className = "alert alert-info alert-dismissible fade show d-flex align-items-center justify-content-between flex-wrap gap-2";
    alertGeo.setAttribute('role', 'alert');
    alertGeo.innerHTML = `<div>
        <i class="bi bi-geo-alt-fill text-danger fs-5 me-2"></i>
        Tu sucursal más cercana es <strong>${infSuc.nombre}</strong> (a ${distancia} km).
      </div>
      <div class="form-check form-switch ms-auto">
        <input class="form-check-input" type="checkbox" role="switch" id="switch-filtro-zona"/>
        <label class="form-check-label small fw-bold" for="switch-filtro-zona">Filtrar Zona</label>
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
    cont.appendChild(alertGeo);
    //Para filtrar lo recien generado y que pueda hacer algo en DOM
    var switchFiltro = document.getElementById("switch-filtro-zona");
    switchFiltro?.addEventListener("change", async (e) => {
      var target = e.target;
      var vehiculos = await persistencia.ObtenerVehiculos();

      if (target.checked) {

        var vehiculoFiltro = vehiculos.filter(v => v.sucursalId == infSuc.id);
        console.info(vehiculos);
        await renderizarTabla(vehiculoFiltro, divisaActual, tasaCambioActual);
      }
      else
        await renderizarTabla(vehiculos, divisaActual, tasaCambioActual);
    });

  } catch (er) {
    console.error("Modulo geografico cargado de manera pasiva:", er)
  }
}