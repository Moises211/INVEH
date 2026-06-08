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
            console.log(`ID vehiculo: ${vehiculo.id}, ${vehiculo._id}`);
            if (vehiculo.id != null) { //para los precargados
                //https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
                var indice = inventario.findIndex((/** @type {any} */ v) => v._id === vehiculo.id);
                console.log(`ID vehiculo: ${vehiculo.id}, ${vehiculo._id} | ${indice.id}, ${vehiculo._id}`)
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
            var vehiculoEliminar = inventario.filter((/** @type {any} */v) => v._id != id);
            localStorage.setItem(this.CLAVE_LOCALSTORAGE, JSON.stringify(vehiculoEliminar));

            return true;
        } catch (err) {
            console.error("Error en eliminarVehiculo:", err);
            return false;
        }
    }

    
    async ObtenerVehiculosPrecargados() {
        try {
            var r = await fetch("./data/inventario_vehiculos_precargados.json");
            if (!r.ok) throw new Error('No se pudo cargar el archivo');  
            var datos = await r.json();
                
            const listaPlana = datos.vehiculos || [];
            
            return listaPlana.map(item => {
                const nuevoVehiculo = new Vehiculo();
                nuevoVehiculo.id = item.id;
                nuevoVehiculo.marca = item.marca;
                nuevoVehiculo.modelo = item.modelo;
                nuevoVehiculo.anio = item.anio;
                nuevoVehiculo.precioUSD = item.precio; // Mapea 'precio' del JSON a 'precioUSD'
                
                
                const estadoFormateado = item.estado.charAt(0).toUpperCase() + item.estado.slice(1);
                nuevoVehiculo.estado = estadoFormateado; 
                
                nuevoVehiculo.suculsalId = item.sucursalId; 
                
                return nuevoVehiculo;
            });
    
        } catch (err) {
            console.error("Error en ObtenerVehiculosPrecargados:", err);
            return [];
        }
    }
}

export default new Persistencia();
