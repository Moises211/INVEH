export class ExportacionService {

    exportarCSV(inventario) {

        console.log("Botón exportar presionado");
        console.log(inventario);

        if (!inventario || !inventario.length) {
            alert("No hay vehículos para exportar");
            return;
        }

        const encabezados = [
            "ID",
            "Marca",
            "Modelo",
            "Año",
            "Precio",
            "Estado",
            "Sucursal"
        ];

        const filas = inventario.map(v => [
            v.id,
            v.marca,
            v.modelo,
            v.anio,
            v.precioUSD ?? v.precio,
            v.estado,
            v.sucursalId
        ]);

        const csv = [
            encabezados.join(","),
            ...filas.map(fila => fila.join(","))
        ].join("\n");

        const blob = new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );

        const url =
            window.URL.createObjectURL(blob);

        const enlace =
            document.createElement("a");

        enlace.style.display = "none";
        enlace.href = url;
        enlace.download =
            "inventario_vehiculos.csv";

        document.body.appendChild(enlace);

        enlace.click();

        document.body.removeChild(enlace);

        window.URL.revokeObjectURL(url);

        console.log("CSV generado correctamente");
    }

}

export default new ExportacionService();