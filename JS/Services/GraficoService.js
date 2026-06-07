class GraficoService {

    constructor() {
        this.grafico = null;
    }

    actualizar(estados) {

        const canvas =
            document.getElementById("graficoEstados");

        if (!canvas) return;

        if (this.grafico) {
            this.grafico.destroy();
        }

        this.grafico = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: [
                    "Disponible",
                    "Vendido",
                    "Mantenimiento"
                ],
                datasets: [{
                    data: [
                        estados.disponible || 0,
                        estados.vendido || 0,
                        estados.mantenimiento || 0
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

    }

}

export default new GraficoService();