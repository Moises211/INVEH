//ts-check

export class AnaliticaService {
    
    constructor(callbackOnMessage) {
        const workerScript = `
            self.onmessage = function(e) {
                const inventario = e.data || [];
                const totalVehiculos = inventario.length;

                const valorFlota = inventario.reduce((sum, car) => {
                    const precio = car._precioUSD || car.precioUSD || car.precio || 0;
                    return sum + parseFloat(precio);
                }, 0);

                const estados = { Disponible: 0, Vendido: 0, Reservado: 0 };
                const sucursales = { "suc-santa-ana": 0, "suc-san-salvador": 0, "suc-san-miguel": 0 };

                inventario.forEach(car => {
                    const estadoRaw = car._estado || car.estado || "";
                    let estado = estadoRaw.charAt(0).toUpperCase() + estadoRaw.slice(1).toLowerCase();
                    if (estado === "Mantenimiento") estado = "Reservado"; 

                    const sucId = car.sucursalId || car._sucursalId;

                    if (estados[estado] !== undefined) estados[estado]++;
                    if (sucursales[sucId] !== undefined) sucursales[sucId]++;
                });

                self.postMessage({ totalVehiculos, valorFlota, estados, sucursales });
            }
        `;

        var blob = new Blob([workerScript], { type: 'application/javascript' });
        this.analiticaWorker = new Worker(URL.createObjectURL(blob));
        
        this.analiticaWorker.onmessage = (e) => {
            callbackOnMessage(e.data);
        };
    }
    
    EjecutarProcesamientoAnalitico(inventario) {
        this.analiticaWorker.postMessage(inventario);
    }
}