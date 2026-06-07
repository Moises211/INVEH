//ts-check

export class CalculoDivisaService {    

    async ObtenerTasasDivisa(){
        try{
            var res = await fetch('https://api.frankfurter.dev/v1/latest?from=USD&to=EUR,JPY')
            if(!res.ok)
                throw new Error("Respuesta de API (frankfurter v1) inválida o fuera de servicio")
            var datos = await res.json();
            return datos.rates;
        }catch(error){
            console.warn('Fallo en la API Frankfurter v2. A', error);
            //RETURN DE CAMBIO HARCODEADO A LA FECHA DE 06-06-26
            return {EUR: 0.93, JPY:159.86}
        }
    }
}