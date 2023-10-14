import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {Creedenciales, Login, Usuario} from '../models';
import {LoginRepository, UsuarioRepository} from '../repositories';
import {SeguridadUsuarioService} from '../services';
import { promises } from 'dns';

export class UsuarioController {
  //en el controlador se inyectan dependencias generadas por loopback
  constructor(
    //donde dice que se necesita un repositorio,este es de usuarioRepositori, dpnde definimos una variablede acceso publico,
    //esta para acceder a todas las acciones del crud dentro de la entidad usuario
    @repository(UsuarioRepository)
    public usuarioRepository : UsuarioRepository,
    //se invoca el servicio de seguridad para que se pueda acceder a las funciones de este
    //en este caso el de crear clave,cifrar
    @service(SeguridadUsuarioService)
    public servicioSeguridad : SeguridadUsuarioService,
    @repository(LoginRepository)
    public loginRepository : LoginRepository,
  ) {}

  //el post es para enviar un nuevo registro
  //el get es para obtener un registro
  //el patch es para actualizar un registro(es como un parque,se manda cieras propiedades y seran las unicas modificadas)
  //el delete es para eliminar un registro
  //el put es para reemplazar un registro
  @post('/usuario')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['_id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, '_id'>,
  ): Promise<Usuario> {
    //crear la clave
    let clave = this.servicioSeguridad.crearTextoAleatorio(10);
    //cifrar la clave
    let claveCifrada = this.servicioSeguridad.cifrarTexto(clave);
    //asignar la clave cifrada al usuario
    usuario.clave = claveCifrada;
    //enviar un correo electronico de notificación
    return this.usuarioRepository.create(usuario);
  }

  @get('/usuario/count')
  @response(200, {
    description: 'Usuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @get('/usuario')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuario')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuario/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, {exclude: 'where'}) filter?: FilterExcludingWhere<Usuario>
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @patch('/usuario/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  @put('/usuario/{id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.replaceById(id, usuario);
  }

  @del('/usuario/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usuarioRepository.deleteById(id);
  }


  /**
   * metodos personalizados para la API
   */

  @post('/identificar-usuario')
  @response(200, {
    description: 'Identificar Usuario por correo y clave',
    content: {'application/json': {schema: getModelSchemaRef(Creedenciales)}},
  })
  async identificarUsuario(
    @requestBody({
      content:{'application/json':{schema: getModelSchemaRef(Creedenciales)
      }
    }
    }
    )
    Creedenciales: Creedenciales,
  ):Promise<object>{

  let usuario = await this.servicioSeguridad.identificarUsuario(Creedenciales);
  // si el usuario es valido se construye es un codigo de verificación para guardarlo en la base de datos
  //lo de cogidos aleatorios esta en el servicio
  if(usuario){
  let codigo2fa = this.servicioSeguridad.crearTextoAleatorio(5);
   let login: Login = new Login();
   login.usuarioId = usuario._id!;
   login.codigo2fa = codigo2fa;
   login.estadoCodigo2fa = false;
   login.token = "";
   login.estadoToken = false;
   this.loginRepository.create(login);
   //notificar al usuario via correo
   return usuario;
     }
     return new HttpErrors[401]("Credenciales incorrectas");
  }

  
  @post('/verificar-2fa')
  @response(200, {
    description: 'validar un codigo 2fa',
    content: {'application/json': {schema: getModelSchemaRef()}},
  })
  async identificarUsuario(
    @requestBody({
      content:{'application/json':{schema: getModelSchemaRef(Creedenciales)
      }
    }
    }
    )
    Creedenciales: Creedenciales,
  ):Promise<object>{

  let usuario = await this.servicioSeguridad.identificarUsuario(Creedenciales);
  // si el usuario es valido se construye es un codigo de verificación para guardarlo en la base de datos
  //lo de cogidos aleatorios esta en el servicio
  if(usuario){
  let codigo2fa = this.servicioSeguridad.crearTextoAleatorio(5);
   let login: Login = new Login();
   login.usuarioId = usuario._id!;
   login.codigo2fa = codigo2fa;
   login.estadoCodigo2fa = false;
   login.token = "";
   login.estadoToken = false;
   this.loginRepository.create(login);
   //notificar al usuario via correo
   return usuario;
     }
     return new HttpErrors[401]("Credenciales incorrectas");
  }

}
