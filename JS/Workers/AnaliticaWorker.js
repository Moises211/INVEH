self.onmessage = function (e) {

    const inventario = e.data || [];

    const totalVehiculos = inventario.length;

    const valorFlota = inventario.reduce((suma, vehiculo) => {

        const precio = parseFloat(
            vehiculo.precioUSD ??
            vehiculo.precio ??
            0
        );

        return suma + precio;

    }, 0);

    const estados = {
        disponible: 0,
        vendido: 0,
        mantenimiento: 0
    };

    const sucursales = {
        "suc-santa-ana": 0,
        "suc-san-salvador": 0,
        "suc-san-miguel": 0
    };

    inventario.forEach(vehiculo => {

        const estado =
            String(vehiculo.estado || "")
                .toLowerCase();

        if (estados[estado] !== undefined) {
            estados[estado]++;
        }

        if (
            vehiculo.sucursalId &&
            sucursales[vehiculo.sucursalId] !== undefined
        ) {
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