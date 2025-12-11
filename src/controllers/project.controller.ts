import { Request, Response } from 'express';
import { ProjectModel } from '../models/projectModel.js';

export class ProjectController {
  static async getProjects(req: Request, res: Response) {
    try {
      const projects = await ProjectModel.findAll();
      res.json({ data: projects });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener proyectos' });
    }
  }

  static async createProject(req: Request, res: Response) {
    try {
      const newProject = await ProjectModel.create(req.body);
      res.status(201).json({ message: 'Proyecto añadido', data: newProject });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear proyecto' });
    }
  }
}