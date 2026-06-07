//@ts-check

class Persistencia {
    CLAVE_LOCALSTORAGE = 'inventario_vehiculos';

    async ObtenerVehiculos() {
        try {
            const datosJson = localStorage.getItem(this.CLAVE_LOCALSTORAGE);
            var vehiculos = await this.ObtenerVehiculosPrecargados();
            if (!datosJson) {
                localStorage.setItem(this.CLAVE_LOCALSTORAGE, JSON.stringify(vehiculos));
                return vehiculos;
            }
            return JSON.parse(datosJson);
        } catch (err) {
            console.error("Error en obtenerVehiculos:", err);
            return [];
        }
    }

    /**
     * @param {any} vehiculo
     */
    async GuardarVehiculo(vehiculo) {
        try {
            var inventario = await this.ObtenerVehiculos();

            if (vehiculo.id != null) { //para los precargados
                //https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
                var indice = inventario.findIndex((/** @type {any} */ v) => v.id === vehiculo.id);
                if (indice != -1) {
                    inventario[indice] = vehiculo;
                }
            } else {
                //Si el vehiculo es nuevo
                vehiculo.id = `auto-${Date.now()}`
                inventario.push(vehiculo);
            }
            localStorage.setItem(this.CLAVE_LOCALSTORAGE, JSON.stringify(inventario));
            return true;
        } catch (err) {
            console.error("Error en guardarVehiculo:", err);
            return false;
        }
    }

    /**
     * @param {any} id
     */
    async EliminarVehiculo(id) {
        try {
            var inventario = await this.ObtenerVehiculos();
            var vehiculoEliminar = inventario.filter((/** @type {any} */v) => v.id != id);
            localStorage.setItem(this.CLAVE_LOCALSTORAGE, JSON.stringify(vehiculoEliminar));

            return true;
        } catch (err) {
            console.error("Error en eliminarVehiculo:", err);
            return false;
        }
    }

    async ObtenerVehiculosPrecargados() {
        try {
            
            var r = await fetch("../JS/data/inventario_vehiculos_precargados.json");
            if (!r.ok) throw new Error('No se pudo cargar el archivo');  
            var datos = await r.json();
            
            return datos.vehiculos;
        } catch (err){
            console.error("Error en ObtenerVehiculosPrecargados:", err);
            return [];
        }
    }
}

export default new Persistencia();