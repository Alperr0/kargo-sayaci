import { PrismaClient } from '@prisma/client';

// Geliştirme ortamında sürekli yeni bağlantı açılmasını engelleyen global yapı
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export class AuthTokenManager {
  // Veritabanından mağazanın token'ını çeker
  static async getToken(storeId: string): Promise<string | null> {
    try {
      const record = await prisma.storeToken.findUnique({
        where: { storeId },
      });
      return record?.token || null;
    } catch (error) {
      console.error('Token çekilirken hata oluştu:', error);
      return null;
    }
  }

  // Yeni gelen token'ı veritabanına kaydeder veya günceller
  static async setToken(storeId: string, token: string): Promise<void> {
    try {
      await prisma.storeToken.upsert({
        where: { storeId },
        update: { token },
        create: { storeId, token },
      });
    } catch (error) {
      console.error('Token kaydedilirken hata oluştu:', error);
    }
  }
}
