import { NextFunction, Request, Response } from 'express';
import { authService } from '../services/auth.service';

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body as { email: string; password: string };
      const result = await authService.login(email, password);
      res.json({ data: result });
    } catch (err) { next(err); }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.userId);
      res.json({ data: user });
    } catch (err) { next(err); }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { oldPassword, newPassword } = req.body as { oldPassword: string; newPassword: string };
      await authService.changePassword(req.user!.userId, oldPassword, newPassword);
      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (err) { next(err); }
  },
};
