import {Model, model, property} from '@loopback/repository';

@model()
export class Creedenciales extends Model {
  @property({
    type: 'string',
    required: true,
  })
  correo: string;

  @property({
    type: 'string',
    required: true,
  })
  clave: string;


  constructor(data?: Partial<Creedenciales>) {
    super(data);
  }
}

export interface CreedencialesRelations {
  // describe navigational properties here
}

export type CreedencialesWithRelations = Creedenciales & CreedencialesRelations;
