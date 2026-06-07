//ts-check
import persistencia from './Controller/Persistencia.js';
import { ValidarEntrada } from './Controller/ValidarEntrada.js'
import { Vehiculo } from './dto/Vehiculo.js'
import dashboardService from './Services/DashboardService.js';
import graficoService from './Services/GraficoService.js';
import exportacionService from './Services/ExportacionService.js';

const validador = new ValidarEntrada();
const formuVeh = document.getElementById("formulario-vehiculo");
const workerAnalitica = new Worker(
  './JS/Workers/AnaliticaWorker.js'
);

let inventarioActual = [];

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

  const inventario =
    await persistencia.ObtenerVehiculos();

  inventarioActual =
    inventario;

  console.log("Inventario cargado");

  renderizarTabla(
    inventarioActual
  );

  aplicarFiltros();

  workerAnalitica.postMessage(
    inventario
  );

}

workerAnalitica.onmessage = (evento) => {

  const datos = evento.data;

  console.log("Analítica recibida:", datos);

  dashboardService.actualizarMetricas(datos);

  graficoService.actualizar(
    datos.estados
  );

};

document.addEventListener("DOMContentLoaded", () => {

  if (formuVeh) {
    formuVeh.addEventListener("submit", enviarFormulario);
  }

  const btnExportar =
    document.getElementById("btnExportarCSV");

  if (btnExportar) {

    btnExportar.addEventListener(
      "click",
      () => {

        exportacionService.exportarCSV(
          inventarioActual
        );

      }
    );

  }

  const txtBusqueda =
    document.getElementById("txtBusqueda");

  if (txtBusqueda) {

    txtBusqueda.addEventListener(
      "input",
      aplicarFiltros
    );

  }

  const filtroEstado =
    document.getElementById("filtroEstado");

  if (filtroEstado) {

    filtroEstado.addEventListener(
      "change",
      aplicarFiltros
    );

  }

  document.getElementById("txtBusqueda").value =
    sessionStorage.getItem("busquedaVehiculo") || "";

  document.getElementById("filtroEstado").value =
    sessionStorage.getItem("estadoVehiculo") || "";

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
  console.log("Vehículo a guardar:", vehiculo);

  if (await persistencia.GuardarVehiculo(vehiculo)) {

    formuVeh.reset();

    document.getElementById("imput-id").value = "";

    const inventarioActualizado =
      await persistencia.ObtenerVehiculos();

    inventarioActual =
      inventarioActualizado;

    renderizarTabla(
      inventarioActual
    );

    workerAnalitica.postMessage(
      inventarioActual
    );

    alert("Vehiculo guardado");

  } else {
    mostrarMsgErr("Error crítico: No se pudo escribir en el almacenamiento del navegador.");
  }
}

function renderizarTabla(vehiculos) {

  const tbody =
    document.getElementById("tablaVehiculos");

  if (!tbody) return;

  tbody.innerHTML = "";

  vehiculos.forEach(v => {

    tbody.innerHTML += `
      <tr>
        <td>${v.marca ?? v._marca}</td>
        <td>${v.modelo ?? v._modelo}</td>
        <td>${v.anio ?? v._anio}</td>

        <td>
        $${Number(
      v.precioUSD ??
      v._precioUSD ??
      v.precio ??
      0
    ).toLocaleString()}
        </td>

        <td>${v.estado ?? v._estado}</td>

        <td>
        ${v.sucursalId ??
      v._sucursalId ??
      v._suculsalId}
        </td>
      </tr>
    `;

  });

}

function aplicarFiltros() {

  const textoBusqueda =
    document.getElementById("txtBusqueda")
      .value
      .toLowerCase();

  const estadoSeleccionado =
    document.getElementById("filtroEstado")
      .value;

  sessionStorage.setItem(
    "busquedaVehiculo",
    textoBusqueda
  );

  sessionStorage.setItem(
    "estadoVehiculo",
    estadoSeleccionado
  );

  const filtrados =
    inventarioActual.filter(v => {

      const marca =
        String(v.marca ?? v._marca ?? "")
          .toLowerCase();

      const modelo =
        String(v.modelo ?? v._modelo ?? "")
          .toLowerCase();

      const estado =
        String(v.estado ?? v._estado ?? "");

      const coincideBusqueda =
        marca.includes(textoBusqueda) ||
        modelo.includes(textoBusqueda);

      const coincideEstado =
        estadoSeleccionado === "" ||
        estado === estadoSeleccionado;

      return (
        coincideBusqueda &&
        coincideEstado
      );

    });

  renderizarTabla(
    filtrados
  );

}

async function limpiarInvalidos() {
  var invalidados = document.querySelectorAll('.is-invalid');
  for (let index = 0; index < invalidados.length; index++) {
    const element = invalidados[index];
    element.classList.remove('is-invalid');
  }
}