//ts-check

export class FiltroServicio {
    
    GuardarFiltrosMemoria(texto, estado) {
        sessionStorage.setItem('filtro_busqueda_texto', texto);
        sessionStorage.setItem('filtro_busqueda_estado', estado);
    }

    ObtenerFiltrosMemoria() {
        return {
            texto: sessionStorage.getItem('filtro_busqueda_texto') || "",
            estado: sessionStorage.getItem('filtro_busqueda_estado') || "TODOS"
        };
    }
    
    FiltrarColeccion(inventario, texto, estadoSeleccionado) {
        const query = texto.toLowerCase().trim();
        return inventario.filter(car => {
            var marca = (car._marca || car.marca || "").toLowerCase();
            var modelo = (car._modelo || car.modelo || "").toLowerCase();
            var estado = (car._estado || car.estado || "").toUpperCase();

            var coincideTexto = marca.includes(query) || modelo.includes(query);
            var coincideEstado = estadoSeleccionado === "TODOS" || estado === estadoSeleccionado.toUpperCase();

            return coincideTexto && coincideEstado;
        });
    }
}