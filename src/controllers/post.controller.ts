import { Request, Response } from 'express';
import { PostModel } from '../models/postModel.js';
import { IPost } from '../types/blog.js';

export class PostController {

  // Crear un nuevo Post
  // Usamos 'static' para no tener que instanciar la clase
  static async createPost(req: Request, res: Response) {
    try {
      // TypeScript nos ayuda a saber qué esperar en el body
      // Ojo: En un futuro aquí validaremos que req.body tenga la forma correcta (Zod/Joi)
      const postData: IPost = req.body; 
      
      const newPost = await PostModel.create(postData);
      
      res.status(201).json({
        message: 'Post creado exitosamente',
        data: newPost
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error interno al crear el post' });
    }
  }

  // Obtener todos los posts (Público)
  static async getPosts(req: Request, res: Response) {
    try {
      // Leemos query params para paginación (ej: ?limit=5&offset=0)
      const limit = Number(req.query.limit) || 10;
      const offset = Number(req.query.offset) || 0;

      const posts = await PostModel.findAll(limit, offset);
      
      res.json({ data: posts });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los posts' });
    }
  }

  // Obtener un post por su URL (Slug)
  static async getPostBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const post = await PostModel.findBySlug(slug);

      if (!post) {
        return res.status(404).json({ message: 'Post no encontrado' });
      }

      res.json({ data: post });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al buscar el post' });
    }
  }
}