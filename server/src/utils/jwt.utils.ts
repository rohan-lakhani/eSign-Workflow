import * as jwt from 'jsonwebtoken';

export function generateRoleAccessToken(
  documentId: string,
  roleNumber: number,
  secret: string,
  expiresIn: string = '7d',
): string {
  const payload = {
    documentId,
    roleNumber,
    type: 'role-access',
  };

  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyRoleAccessToken(token: string, secret: string): any {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
} 