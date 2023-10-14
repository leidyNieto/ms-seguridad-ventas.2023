//se crea un servicio para asi hacer un codgo reutilizable y de poco mantenimiento
//se crea un  clase  servicio  para ejecutarse dentro de un conexto de aplicacion
//este aporta a las seguridad del usuario
import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import { Creedenciales, Usuario } from '../models';
import { repository } from '@loopback/repository';
import { UsuarioRepository } from '../repositories';
const  generator = require('generate-password');
const MD5 = require("crypto-js/md5");
@injectable({scope: BindingScope.TRANSIENT})
export class SeguridadUsuarioService {
  constructor(
 @repository(UsuarioRepository)
 public repositorioUsuario: UsuarioRepository,


 ) {}

  /*
   * crear una clave aleatoria 
   *@returns cadena aleatoria de 10 caracteres
   */
  crearTextoAleatorio(n:number):string{
    //genera nuevas contraseñas
    let clave = generator.generate({
      length: n,
      numbers: true
    });
    return clave;
  }

  /**
   * cifrar una cadena con metodo md5
   * @param cadena de texto a cifrar
   * @returns cadena cifrada con md5
   */
  cifrarTexto(cadena:string):string{
    //cifra el texto
     let cadenaCifrado = MD5(cadena).toString();
     return cadenaCifrado;
  }

 /**
  * Se busca un usuario por las credenciales de su acceso
  * @param credenciales credenciales del usuario
  * @returns usuario encontrado o null
  */
 async identificarUsuario(credenciales:Creedenciales):Promise<Usuario | null>{
  let usuario = await this.repositorioUsuario.findOne({
    where:{
    correo: credenciales.correo,
    clave: credenciales.clave
    }
  });
   return usuario as Usuario;
 }
}
