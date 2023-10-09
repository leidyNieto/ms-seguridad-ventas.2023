//se crea un servicio para asi hacer un codgo reutilizable y de poco mantenimiento
//se crea un  clase  servicio  para ejecutarse dentro de un conexto de aplicacion
//este aporta a las seguridad del usuario
import { /* inject, */ BindingScope, injectable} from '@loopback/core';
const  generator = require('generate-password');
const MD5 = require("crypto-js/md5");
@injectable({scope: BindingScope.TRANSIENT})
export class SeguridadUsuarioService {
  constructor(/* Add @inject to inject parameters */) {}

  /*
   * Add service methods here
   */

  crearClave():string{
    //genera nuevas contraseñas
    let clave = generator.generate({
      length: 10,
      numbers: true
    });
    return clave;
  }
  cifrarTexto(cadena:string):string{
    //cifra el texto
     let cadenaCifrado = MD5(cadena).toString();
     return cadenaCifrado;
  }
}
