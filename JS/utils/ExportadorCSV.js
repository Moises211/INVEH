//ts-check

export class ExportadorCSV {
    
    static ExportarA_CSV(inventario) {
        if (!inventario || inventario.length === 0) {
            throw new Error("No hay registros en el inventario para poder exportar.");
        }

        let contenidoCsv = "ID;Marca;Modelo;Anio;Precio_USD;Estado;ID_Sucursal\n";

        inventario.forEach(car => {
            var id = car._id || car.id || "";
            var marca = car._marca || car.marca || "";
            var modelo = car._modelo || car.modelo || "";
            var anio = car._anio || car.anio || "";
            var precio = car._precioUSD || car.precioUSD || car.precio || 0;
            var estado = car._estado || car.estado || "";
            var sucursal = car.sucursalId || car._sucursalId || "";

            contenidoCsv += `"${id}";"${marca}";"${modelo}";${anio};${precio};"${estado}";"${sucursal}"\n`;
        });

        const blobCsv = new Blob([contenidoCsv], { type: 'text/csv;charset=utf-8;' });
        const urlDescarga = URL.createObjectURL(blobCsv);

        var enlaceTemporal = document.createElement("a");
        enlaceTemporal.href = urlDescarga;
        enlaceTemporal.setAttribute("download", `Inventario_Vehiculos_${new Date().toISOString().slice(0,10)}.csv`);
        enlaceTemporal.style.visibility = 'hidden';
        
        document.body.appendChild(enlaceTemporal);
        enlaceTemporal.click();
        document.body.removeChild(enlaceTemporal);
    }
}