//ts-check
import { Resultado } from '../dto/Resultado.js'
export class ValidarEntrada {

    async ValidarDatosVehiculos(vehiculo) {
        var anioInt;
        var precioFloact;
        var errores = {};
        var anioAct = new Date().getFullYear() + 1;
        var esValido = true;

        if (vehiculo.marca == null || vehiculo.marca.trim() == "") {
            esValido = false
            errores.marca = "La marca del vehículo es obligatoria.";
            console.log("La marca del vehículo es obligatoria.");
        }

        if (vehiculo.modelo == null || vehiculo.modelo.trim() == "") {
            esValido = false
            errores.modelo = "El modelo del vehiculo es obligatorio";
            console.log("El modelo del vehiculo es obligatorio");
        }

        if (anioInt = parseInt(vehiculo.anio, 10)) {
            if (isNaN(anioInt) || anioInt < 1920 || anioInt > anioAct) {
                esValido = false
                errores.anio = `El año debe ser un número entero entre 1920 y ${anioAct}.`;
                console.log(anioAct);
                console.log("El año debe ser un número entero entre 1920 y ${anioAct}.");
            }
        }

        if(precioFloact = parseFloat(vehiculo.precioUSD)){
            if(isNaN(precioFloact) || precioFloact < 0){
                esValido = false, errores.precioUSD = "El precio debe ser un número mayor a 0 USD.";
                console.log("El precio debe ser un número mayor a 0 USD.");
            }
        }
        console.log("Es valido? ", esValido)
        return new Resultado(esValido, errores);
    }
}

