export class DashboardService {

    actualizarMetricas(datos) {

        document.getElementById("totalVehiculos").textContent =
            datos.totalVehiculos;

        document.getElementById("valorFlota").textContent =
            `$${datos.valorFlota.toLocaleString()}`;

        document.getElementById("disponibles").textContent =
            datos.estados.disponible || 0;

        document.getElementById("vendidos").textContent =
            datos.estados.vendido || 0;

        document.getElementById("mantenimiento").textContent =
            datos.estados.mantenimiento || 0;
    }

}

export default new DashboardService();