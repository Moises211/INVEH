//@ts-check


/* global Chart */


/**
 * Variable global del gráfico
 * @type {any}
 */
let graficoEstados = null;


/*
========================
 CONTROL DE VISTAS SPA
========================
*/

/**
 * Cambia entre vistas de la SPA
 * @param {string} vistaSeleccionada
 */

export function mostrarVista(vistaSeleccionada){

    const vistas = document.querySelectorAll( "section" );

    vistas.forEach(

        /**
         * @param {HTMLElement} vista
         */
        vista => {

            vista.style.display =
                "none";

        }

    );



    const vistaActiva = document.getElementById( vistaSeleccionada );

    if(vistaActiva){

        vistaActiva.style.display =
            "block";

    }

}

/*
=====================
 RENDERIZADO TABLA
=====================
*/

/**
 * Renderiza la tabla del inventario
 *
 * @param {Array<any>} vehiculos
 * @param {string} divisaActiva
 * @param {number} tasaConversion
 */

export function renderizarTabla(
    vehiculos,
    divisaActiva = "USD",
    tasaConversion = 1
){

const tabla = document.getElementById( "tabla-vehiculos-body");

if(!tabla){

    return;

}


tabla.innerHTML = "";


if(vehiculos.length === 0){

tabla.innerHTML = `

<tr>

<td colspan="6"
class="text-center">

No existen vehículos

</td>

</tr>

`;

return;

}


vehiculos.forEach(

/**
 * @param {any} vehiculo
 */

vehiculo => {


let estadoClase = "";


switch(vehiculo.estado){

case "Disponible":

estadoClase =
"bg-success";

break;

case "Vendido":

estadoClase =
"bg-danger";

break;

case "Mantenimiento":

estadoClase = "bg-warning text-dark";

break;

default:

estadoClase = "bg-secondary";

}


let precio =

Number(
vehiculo.precioUSD
)
*
tasaConversion;


let simbolo = "$";

if(divisaActiva === "EUR"){

simbolo="€";

}


if(divisaActiva === "MXN"){

simbolo="$MXN";

}

tabla.innerHTML += `

<tr>

<td>${vehiculo.marca}</td>

<td>${vehiculo.modelo}</td>

<td>${vehiculo.anio}</td>

<td>

${simbolo}
${precio.toFixed(2)}

</td>

<td>

<span class="badge ${estadoClase}">

${vehiculo.estado}

</span>

</td>

<td class="text-end">

<button 
class="btn btn-warning btn-sm me-1"
onclick="editarVehiculo('${vehiculo.id}')">

<i class="bi bi-pencil-square"></i>

Editar

</button>

<button 
class="btn btn-danger btn-sm"
onclick="eliminarVehiculo('${vehiculo.id}')">

<i class="bi bi-trash"></i>

Eliminar

</button>

</td>

</tr>

`;

}

);


}

/*
===============
 CHART JS
===============
*/

/**
 * Crear gráfico de estados
 *
 * @param {{
 * Disponible:number,
 * Vendido:number,
 * Mantenimiento:number
 * }} datosMetricas
 */


export function inicializarOGraficar( datosMetricas ){

const canvas = document.getElementById( "graficoEstados" );


if(!canvas){

return;

}

if(graficoEstados){

graficoEstados.destroy();

}

graficoEstados = new Chart( canvas,{ type:"doughnut", data:{

labels:[

"Disponible",

"Vendido",

"Mantenimiento"

],

datasets:[{

data:[

datosMetricas.Disponible,

datosMetricas.Vendido,

datosMetricas.Mantenimiento ] 
} ]

}

}

);

}

/*
=============
 DASHBOARD
=============
*/


/**
 * Actualiza tarjetas del dashboard
 *
 * @param {Array<any>} vehiculos
 */

export function actualizarMetricas( vehiculos ){

const total = document.getElementById( "metrica-total" );

const valor = document.getElementById( "metrica-valor" );

if(total){ total.innerHTML = String( vehiculos.length );

}

if(valor){

const suma = vehiculos.reduce(
    (
    /** @type {number} */
    acumulador,

    /** @type {any} */
    auto
    )=>{
    return acumulador + Number(auto.precioUSD);
    },
    0
    );
    valor.innerHTML = "$" + suma.toFixed(2);

    }

}