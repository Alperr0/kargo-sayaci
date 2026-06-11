import { AuthToken } from './index';

/**
 * AuthTokenManager provides methods to manage AuthTokens.
 * Basitlik adına verileri geçici olarak hafızada tutan bir yapıya çevirdik.
 */
export class AuthTokenManager {
  private static tokens: Map<string, AuthToken> = new Map();

  static async get(authorizedAppId: string): Promise<AuthToken | undefined> {
    return this.tokens.get(authorizedAppId);
  }

  static async put(token: AuthToken): Promise<AuthToken> {
    this.tokens.set(token.authorizedAppId!, token);
    return token;
  }

  static async delete(authorizedAppId: string): Promise<void> {
    if (!this.tokens.has(authorizedAppId)) {
      throw new Error('Token not found');
    }
    this.tokens.delete(authorizedAppId);
  }

  static async list(): Promise<AuthToken[]> {
    return Array.from(this.tokens.values());
  }
}