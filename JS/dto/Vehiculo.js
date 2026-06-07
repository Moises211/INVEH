//@ts-check
export class Vehiculo{
    constructor(){
        /** @type {string | null} */
        this._id = null;
        this._marca = "";
        this._modelo = "";
        this._anio = 0;
        this._precioUSD = 0.00;
        this._estado = "";
        this._suculsalId = "";        
    }
    //Gets
    get id() {return this._id;}
    get marca() {return this._marca;}
    get modelo() {return this._modelo;}
    get anio() {return this._anio;}
    get precioUSD() {return this._precioUSD;}
    get estado() {return this._estado;}
    get suculsalId() {return this._suculsalId}
    //Sets
    set id(valor) {this._id = valor;}
    set marca(valor) {this._marca = valor;}
    set modelo(valor) {this._modelo = valor;}
    set anio(valor) {this._anio = valor;}
    set precioUSD(valor) {this._precioUSD = valor;}
    set estado(valor) {this._estado = valor;}
    set suculsalId(valor) {this._suculsalId = valor;}
    
}

