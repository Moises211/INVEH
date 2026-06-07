//ts-check
import persistencia from './Controller/Persistencia.js';
import {ValidarEntrada} from './Controller/ValidarEntrada.js'
import {Vehiculo} from './dto/Vehiculo.js'

const validador = new ValidarEntrada();
const formuVeh = document.getElementById("formulario-vehiculo");

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
    await persistencia.ObtenerVehiculos();
    console.log("Inventario cargado");
}

document.addEventListener("DOMContentLoaded", () => {
    
    
    if (formuVeh) {
        formuVeh.addEventListener("submit", enviarFormulario);
    }    
    cargarDataInicial();
});

//en evento se esperar el submit del formulario, es decir el boton send
async function  enviarFormulario(evento) {
    var vehiculo = new Vehiculo();
    
    evento.preventDefault(); //Evitamos en navegadores que el evento de recarga se active.
    limpiarInvalidos();

    vehiculo.id =  document.getElementById("imput-id").value || null;
    vehiculo.marca = document.getElementById("imput-marca").value;
    vehiculo.modelo = document.getElementById("imput-modelo").value;
    vehiculo.anio = document.getElementById("imput-anio").value;
    vehiculo.precioUSD = document.getElementById("imput-precio").value;
    vehiculo.estado = document.getElementById("imput-estado").value;
    vehiculo.sucursalId = document.getElementById("imput-suculsal").value;
    
    var validacion = await validador.ValidarDatosVehiculos(vehiculo);
    console.log("valido es: ",  validacion.esValido);
    if(validacion == null){
      
    }
    if(!validacion.esValido){
      console.log(`Valido: ${validacion}`);
      for (const element in validacion.mensaje) {
        var atributo = document.getElementById(`imput-${element}`);
        console.log(`Valido: ${validacion.esValido}, mensaje ${element}`);
        if(atributo){
          atributo.classList.add("is-invalid");

          var feedback =  atributo.nextElementSibling;
          if(feedback && feedback.classList.contains('invalid-feedback')){
            feedback.innerHTML = validacion.mensaje[element]
          }
        }
      }
      mostrarMsgErr("Por favor, corrige las entradas inválidas en el formulario.");
      return;
    }

    vehiculo.anio = parseInt(vehiculo.anio, 10);
    vehiculo.precioUSD = parseFloat(vehiculo.precioUSD);

    if(await persistencia.GuardarVehiculo(vehiculo)){
      formuVeh.reset();
      document.getElementById("imput-id").value = "";
      alert("Vehiculo guardado");
    }else{
      mostrarMsgErr("Error crítico: No se pudo escribir en el almacenamiento del navegador.");
    }
}

async function limpiarInvalidos() {
  var invalidados =  document.querySelectorAll('.is-invalid');
  for (let index = 0; index < invalidados.length; index++) {
    const element = invalidados[index];
    element.classList.remove('is-invalid');
  }
}
