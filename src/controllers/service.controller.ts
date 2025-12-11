import { Request, Response } from 'express';
import { ServiceModel } from '../models/serviceModel.js';

export class ServiceController {
  static async getServices(req: Request, res: Response) {
    try {
      const services = await ServiceModel.findAll();
      res.json({ data: services });
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo tarifas' });
    }
  }

  static async createService(req: Request, res: Response) {
    try {
      const newService = await ServiceModel.create(req.body);
      res.status(201).json({ message: 'Servicio creado', data: newService });
    } catch (error) {
      res.status(500).json({ error: 'Error creando servicio' });
    }
  }
}