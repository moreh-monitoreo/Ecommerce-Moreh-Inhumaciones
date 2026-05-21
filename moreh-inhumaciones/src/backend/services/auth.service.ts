import { User, Role, Permission } from '../models';
import { comparePassword, hashPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { HttpError } from '../utils/HttpError';

export const authService = {
  async login(email: string, password: string) {
    const user = await User.findOne({
      where: { email: email.toLowerCase(), activo: true },
      include: [{ model: Role, as: 'role', include: [{ model: Permission, as: 'permissions' }] }],
    });
    if (!user) throw new HttpError(401, 'Unauthorized', 'Credenciales inválidas');
    const ok = await comparePassword(password, user.password_hash);
    if (!ok) throw new HttpError(401, 'Unauthorized', 'Credenciales inválidas');
    await user.update({ ultimo_acceso: new Date() });
    const token = signToken({ userId: user.id!, email: user.email, roleId: user.role_id, branchId: user.branch_id });
    const { password_hash, ...safe } = user.toJSON() as Record<string, unknown>;
    void password_hash;
    return { token, user: safe };
  },

  async getMe(userId: number) {
    const user = await User.findByPk(userId, {
      include: [{ model: Role, as: 'role', include: [{ model: Permission, as: 'permissions' }] }],
      attributes: { exclude: ['password_hash'] },
    });
    if (!user) throw HttpError.notFound('Usuario no encontrado');
    return user;
  },

  async changePassword(userId: number, oldPass: string, newPass: string) {
    const user = await User.findByPk(userId);
    if (!user) throw HttpError.notFound('Usuario no encontrado');
    const ok = await comparePassword(oldPass, user.password_hash);
    if (!ok) throw HttpError.badRequest('Contraseña actual incorrecta');
    await user.update({ password_hash: await hashPassword(newPass) });
  },
};
