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

  // Obtener todos los posts (Público - solo publicados)
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

  // Obtener todos los posts para admin (incluye drafts y archived)
  static async getPostsAdmin(req: Request, res: Response) {
    try {
      const limit = Number(req.query.limit) || 50;
      const offset = Number(req.query.offset) || 0;

      const posts = await PostModel.findAllAdmin(limit, offset);

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

  // Actualizar un post existente
  static async updatePost(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const updateData: Partial<IPost> = req.body;

      // Verificar que el post existe
      const existingPost = await PostModel.findBySlug(slug);
      if (!existingPost) {
        return res.status(404).json({ message: 'Post no encontrado' });
      }

      const updatedPost = await PostModel.update(slug, updateData);

      res.json({
        message: 'Post actualizado exitosamente',
        data: updatedPost
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error interno al actualizar el post' });
    }
  }

  // Eliminar un post
  static async deletePost(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      // Verificar que el post existe
      const existingPost = await PostModel.findBySlug(slug);
      if (!existingPost) {
        return res.status(404).json({ message: 'Post no encontrado' });
      }

      const deleted = await PostModel.delete(slug);

      if (deleted) {
        res.json({ message: 'Post eliminado exitosamente' });
      } else {
        res.status(500).json({ error: 'Error al eliminar el post' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error interno al eliminar el post' });
    }
  }
}