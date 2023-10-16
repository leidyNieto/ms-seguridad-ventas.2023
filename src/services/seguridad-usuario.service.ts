//se crea un servicio para asi hacer un codgo reutilizable y de poco mantenimiento
//se crea un  clase  servicio  para ejecutarse dentro de un conexto de aplicacion
//este aporta a las seguridad del usuario
import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import { Creedenciales, FactorDeAutentificacionPorCodigo, Login, Usuario } from '../models';
import { repository } from '@loopback/repository';
import { LoginRepository, UsuarioRepository } from '../repositories';
import { configuracionSeguridaad } from '../config/seguridad.config';
const  generator = require('generate-password');
const MD5 = require("crypto-js/md5");
const jwt = require('jsonwebtoken');
@injectable({scope: BindingScope.TRANSIENT})
export class SeguridadUsuarioService {
  constructor(
 @repository(UsuarioRepository)
 public repositorioUsuario: UsuarioRepository,
 @repository(LoginRepository)
 public repositorioLogin: LoginRepository,
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

/**
 *  valida el codigo 2fa de un usuario
 * @param credenciales credenciales del usuario con el codio 2fa
 * @returns el registro de login o null
 */

 async validarCodigo2fa(credenciales:FactorDeAutentificacionPorCodigo):Promise<Usuario | null>{
 let login = await this.repositorioLogin.findOne({
   where:{
      usuarioId:credenciales.usuarioId,
      codigo2fa : credenciales.codigo2fa,
      estadoCodigo2fa : false,

   }
 })
 if(login){
     let usuario = await this.repositorioUsuario.findById(credenciales.usuarioId)
     return usuario;
 } return null;
 }

/**
 * se usa la libreria jsonwebtoken para crear un token
 * 
 * @param usuario información del usuario
 * @returns token de seguridad
 */
crearToken(usuario:Usuario): string{
  let datos ={
    name: `${usuario.primerNombre} ${usuario.segundoNombre} ${usuario.primerApellido} ${usuario.segundoApellido}`,
    role: usuario.rolId,
    email: usuario.correo
  }
  let token = jwt.sign(datos, configuracionSeguridaad.claveJWT);
  return token;
 }

}
