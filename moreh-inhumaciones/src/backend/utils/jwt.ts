import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET ?? 'moreh_jwt_secret_cambiar_en_produccion';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '8h';

export interface JwtPayload {
  userId: number;
  email: string;
  roleId: number;
  branchId: number | null;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}
