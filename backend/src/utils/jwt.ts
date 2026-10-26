import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { JwtUserPayload } from '../types/index.js';

export function signAccessToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as any,
  });
}

export function signRefreshToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as any,
  });
}

export function verifyAccessToken(token: string): JwtUserPayload {
  return jwt.verify(token, config.jwt.accessSecret) as JwtUserPayload;
}

export function verifyRefreshToken(token: string): JwtUserPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtUserPayload;
}
