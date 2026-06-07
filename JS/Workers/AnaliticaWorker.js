self.onmessage = function (e) {

    const inventario = e.data || [];

    const totalVehiculos = inventario.length;

    const valorFlota = inventario.reduce((suma, vehiculo) => {
        return suma + parseFloat(vehiculo.precioUSD || 0);
    }, 0);

    const estados = {
        Disponible: 0,
        Vendido: 0,
        Mantenimiento: 0
    };

    const sucursales = {
        "suc-santa-ana": 0,
        "suc-san-salvador": 0,
        "suc-san-miguel": 0
    };

    inventario.forEach(vehiculo => {

        if (estados[vehiculo.estado] !== undefined) {
            estados[vehiculo.estado]++;
        }

        if (sucursales[vehiculo.sucursalId] !== undefined) {
            sucursales[vehiculo.sucursalId]++;
        }

    });

    self.postMessage({
        totalVehiculos,
        valorFlota,
        estados,
        sucursales
    });

};