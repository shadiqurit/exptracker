import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator.js';

export const categoryRouter = Router();

categoryRouter.use(authenticate);

categoryRouter.get('/', CategoryController.getCategories);
categoryRouter.post('/', validate(createCategorySchema), CategoryController.createCategory);
categoryRouter.patch('/:id', validate(updateCategorySchema), CategoryController.updateCategory);
categoryRouter.delete('/:id', CategoryController.deleteCategory);
