import { NextResponse } from 'next/server';

// İkas'ın dükkan verilerini tutacağı Metafields yapısı
export async function POST(request: Request) {
  const body = await request.json();
  
  // Burada gelen veriyi alıp ikas'ın API'sine göndereceğiz
  // Yarın bu kısmın içine ikas'ın kendi "admin-api-client" kütüphanesini bağlayacağız
  console.log("Dükkandan gelen yeni ayarlar:", body);

  return NextResponse.json({ success: true, message: "Ayarlar başarıyla ikas'a gönderildi!" });
}

export async function GET() {
  // Burası da dükkanın kayıtlı verilerini ikas'tan okuyacak
  return NextResponse.json({ 
    isActive: true, 
    limit: 1000, 
    message: "Ücretsiz kargo için kalan tutar..." 
  });
}