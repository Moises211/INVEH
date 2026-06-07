export class LocalizacionServicio {
    constructor() {
        this.SUCURSALES = [
            { id: "suc-santa-ana", nombre: "Sucursal Santa Ana", lat: 13.9942, lon: -89.5597 },
            { id: "suc-san-salvador", nombre: "Sucursal San Salvador", lat: 13.6929, lon: -89.2182 },
            { id: "suc-san-miguel", nombre: "Sucursal San Miguel", lat: 13.4833, lon: -88.1833 }
        ];
    }

    async CalcularSedeMasCercana() {
        return new Promise((resolver, reject) => {
            if (!navigator.geolocation) {
                reject("Los servicios de geolocalizacion no son soportados por este navegador");
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    var latUser = position.coords.latitude;
                    var lonUser = position.coords.longitude;

                    var sucursalMasCercana = null;
                    var distanciaMinima = Infinity;

                    var todasLasDistancias = {};

                    this.SUCURSALES.forEach(s => {
                        var distan = this._haversine(latUser, lonUser, s.lat, s.lon);

                        todasLasDistancias[s.id] = distan;
                        if (distan < distanciaMinima) {
                            distanciaMinima = distan;
                            sucursalMasCercana = s;
                        }
                    });

                    if(sucursalMasCercana){
                        sessionStorage.setItem('sucursal_cercana_id', sucursalMasCercana.id);
                        resolver({sucursal:sucursalMasCercana, 
                            distancia: distanciaMinima, 
                            distanciasCompletas:todasLasDistancias});
                    }else{
                        reject("No se encontro ninguna surcusal cercana");
                    }
                },
                (error) => {
                    reject(`Sin Permiso octorgado o error de lectura GPS: ${error.message}`)
                }
            );
        });
    }
    //Algoritmo matemático Haversine para geolocalizacion https://en.wikipedia.org/wiki/Haversine_formula
    _haversine(lat1, lon1, lat2, lon2){
        var RadioTierra = 6371;
        var dLat = (lat2-lat1) * Math.PI/180;
        var dLon = (lon2-lon1) * Math.PI/180;

        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);

        var c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return RadioTierra * c;
    }
}