//ts-check
export class Resultado {
    
    constructor(esValido = false, mensaje = {}) {
        this.esValido = esValido;
        this.mensaje = mensaje;
    }
}

