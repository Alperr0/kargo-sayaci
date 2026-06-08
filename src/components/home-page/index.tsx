import React, { useState, useCallback, useEffect } from 'react';
import { CheckCircle2, Save, Power, Truck, Type, Palette, Moon, Sun, Sparkles } from 'lucide-react';

interface HomePageProps {
  token: string | null;
  storeName?: string;
}

type BarSkin = 'flat' | 'striped' | 'animated' | 'neon';

const HomePage: React.FC<HomePageProps> = ({ token, storeName }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Core configuration states
  const [isActive, setIsActive] = useState<boolean>(true);
  const [freeShippingLimit, setFreeShippingLimit] = useState<number>(1000);
  const [barMessage, setBarMessage] = useState<string>("🎉 {kalan} TL daha alışveriş yapın, kargo bedava gelsin!");
  const [successMessage, setSuccessMessage] = useState<string>("🥳 Tebrikler! Ücretsiz kargoya hak kazandınız!");
  
  // Design and styling states
  const [bgColor, setBgColor] = useState<string>("#1e3a8a"); 
  const [textColor, setTextColor] = useState<string>("#ffffff"); 
  const [progressColor, setProgressColor] = useState<string>("#3b82f6"); 
  const [barSkin, setBarSkin] = useState<BarSkin>('animated');

  // UI status states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Fetch settings from database via API when component mounts
  useEffect(() => {
    if (!token) return;

    const loadSettings = async () => {
      try {
        const response = await fetch(`/api/cargo-bar?authorizedAppId=${token}`);
        const result = await response.json();

        if (result.success && result.data) {
          const settings = result.data;
          setIsActive(settings.isActive);
          setFreeShippingLimit(settings.freeShippingLimit);
          setBarMessage(settings.barMessage);
          setSuccessMessage(settings.successMessage);
          setBgColor(settings.bgColor);
          setTextColor(settings.textColor);
          setProgressColor(settings.progressColor);
          setBarSkin(settings.barSkin as BarSkin);
        }
      } catch (error) {
        console.error('Failed to load cargo bar settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [token]);

  // Handle form submit and persist data to database
  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/cargo-bar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorizedAppId: token,
          isActive,
          freeShippingLimit,
          barMessage,
          successMessage,
          bgColor,
          textColor,
          progressColor,
          barSkin,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save cargo bar settings:', error);
    } finally {
      setIsSaving(false);
    }
  }, [token, isActive, freeShippingLimit, barMessage, successMessage, bgColor, textColor, progressColor, barSkin]);

  if (!token) {
    return (
      <div className="max-w-[1200px] mx-auto p-6 bg-zinc-950 text-white min-h-[100vh]">
        <div className="text-center p-20 bg-zinc-900 rounded-xl border border-dashed border-zinc-800">
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-zinc-400">Please authenticate to manage webhooks.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`max-w-[1200px] mx-auto p-6 min-h-[100vh] flex items-center justify-center ${isDarkMode ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Dynamic theme configurations
  const themeBg = isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900';
  const cardBg = isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200';
  const inputBg = isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900';
  const titleText = isDarkMode ? 'text-white' : 'text-zinc-900';
  const labelText = isDarkMode ? 'text-zinc-300' : 'text-zinc-700';

  return (
    <div className={`max-w-[1200px] mx-auto p-6 min-h-[100vh] transition-colors duration-300 ${themeBg}`}>
      
      {/* Embedded style configurations for advanced bar customization */}
      <style>{`
        @keyframes move-stripes {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }
        .skin-striped {
          background-image: linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent);
          background-size: 40px 40px;
        }
        .skin-animated {
          background-image: linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent);
          background-size: 40px 40px;
          animation: move-stripes 1s linear infinite;
        }
        .skin-neon {
          box-shadow: 0 0 12px var(--neon-color), 0 0 4px var(--neon-color);
        }
      `}</style>

      {/* Header Layout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-5 mb-6 gap-4">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight flex items-center gap-2 ${titleText}`}>
            <Truck className="text-blue-500 w-8 h-8" /> Kargo Barı Yönetimi
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            <span className={`font-semibold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{storeName}</span> mağazanızın kargo barını özelleştirin.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
              isDarkMode ? 'bg-zinc-800 border-zinc-700 text-amber-400 hover:bg-zinc-700' : 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
              isActive 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20' 
                : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200'
            }`}
          >
            <Power className="w-4 h-4" />
            {isActive ? 'Uygulama Aktif' : 'Uygulama Pasif'}
          </button>
        </div>
      </div>

      {/* Form Configuration Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          {/* Main Panel Configuration Inputs */}
          <div className={`p-6 rounded-xl border shadow-sm space-y-6 ${cardBg}`}>
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-zinc-800/20 pb-3">
              <Type className="w-5 h-5 text-blue-500" /> Temel Ayarlar ve Metinler
            </h2>
            
            <div className="flex flex-col gap-2">
              <label className={`text-sm font-semibold ${labelText}`}>Ücretsiz Kargo Limiti (TL)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-zinc-500 font-bold">₺</span>
                <input
                  type="number"
                  value={freeShippingLimit}
                  onChange={(e) => setFreeShippingLimit(Number(e.target.value))}
                  className={`w-full pl-8 pr-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm ${inputBg}`}
                  placeholder="Örn: 1000"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className={`text-sm font-semibold ${labelText}`}>Sepet Barı Mesajı</label>
              <input
                type="text"
                value={barMessage}
                onChange={(e) => setBarMessage(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm ${inputBg}`}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={`text-sm font-semibold ${labelText}`}>Hedefe Ulaşıldığında Görünecek Mesaj</label>
              <input
                type="text"
                value={successMessage}
                onChange={(e) => setSuccessMessage(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm ${inputBg}`}
                required
              />
            </div>
          </div>

          {/* Color & Texture Configurations */}
          <div className={`p-6 rounded-xl border shadow-sm space-y-6 ${cardBg}`}>
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-zinc-800/20 pb-3">
              <Palette className="w-5 h-5 text-blue-500" /> Renk ve Tasarım Kombinasyonları
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className={`text-sm font-semibold ${labelText}`}>Bar Arka Planı</label>
                <div className={`flex items-center gap-2 border rounded-lg p-2 shadow-sm ${inputBg}`}>
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent" />
                  <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full text-xs font-mono uppercase bg-transparent focus:outline-none" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className={`text-sm font-semibold ${labelText}`}>Yazı Rengi</label>
                <div className={`flex items-center gap-2 border rounded-lg p-2 shadow-sm ${inputBg}`}>
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent" />
                  <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full text-xs font-mono uppercase bg-transparent focus:outline-none" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className={`text-sm font-semibold ${labelText}`}>Yüklenme Çubuğu</label>
                <div className={`flex items-center gap-2 border rounded-lg p-2 shadow-sm ${inputBg}`}>
                  <input type="color" value={progressColor} onChange={(e) => setProgressColor(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent" />
                  <input type="text" value={progressColor} onChange={(e) => setProgressColor(e.target.value)} className="w-full text-xs font-mono uppercase bg-transparent focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <label className={`text-sm font-semibold flex items-center gap-1.5 ${labelText}`}>
                <Sparkles className="w-4 h-4 text-amber-400" /> Çubuk Kaplaması
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['flat', 'striped', 'animated', 'neon'] as BarSkin[]).map((skin) => (
                  <button
                    key={skin}
                    type="button"
                    onClick={() => setBarSkin(skin)}
                    className={`p-3 rounded-xl border font-medium text-xs capitalize transition-all cursor-pointer text-center ${
                      barSkin === skin
                        ? 'bg-blue-600/10 border-blue-500 text-blue-500 shadow-sm'
                        : isDarkMode ? 'bg-zinc-800/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {skin === 'flat' && 'Düz (Klasik)'}
                    {skin === 'striped' && 'Çizgili (Grafik)'}
                    {skin === 'animated' && 'Hareketli Dalga'}
                    {skin === 'neon' && 'Neon Işıltısı ✨'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Persistent Action Layout */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-md shadow-blue-600/10 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>

            {saveSuccess && (
              <div className="flex items-center gap-1.5 text-emerald-500 font-semibold animate-fade-in text-sm">
                <CheckCircle2 className="w-4 h-4" /> Bütün ayarlar ve tasarım tercihleri başarıyla kaydedildi!
              </div>
            )}
          </div>
        </div>

        {/* Real-time Dynamic Simulation Preview Panel */}
        <div className="space-y-6">
          <div className={`p-6 rounded-xl border shadow-sm h-full space-y-6 ${cardBg}`}>
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-zinc-800/20 pb-3">
              <Palette className="w-5 h-5 text-blue-500" /> Canlı Önizleme
            </h2>
            
            <p className="text-xs text-zinc-400">Müşterilerinizin sitenin en üstünde göreceği kargo barının canlı simülasyonu:</p>

            <div className={`w-full border rounded-lg p-4 bg-zinc-950 border-zinc-800 space-y-4 transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}>
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex justify-between">
                <span>Durum: {isActive ? 'Aktif' : 'Gizli'}</span>
                <span>Sepet: ₺400.00</span>
              </div>
              
              <div 
                style={{ backgroundColor: bgColor, color: textColor }}
                className="text-center py-2.5 px-3 rounded-md text-sm font-bold shadow-sm transition-all duration-300"
              >
                {freeShippingLimit - 400 > 0 
                  ? barMessage.replace("{kalan}", String(freeShippingLimit - 400))
                  : successMessage
                }
              </div>

              <div className="w-full bg-zinc-800 rounded-full h-3.5 overflow-hidden shadow-inner relative">
                <div 
                  style={{ 
                    width: `${Math.min((400 / freeShippingLimit) * 100, 100)}%`,
                    backgroundColor: progressColor,
                    ['--neon-color' as any]: progressColor 
                  }}
                  className={`h-full transition-all duration-500 rounded-full ${
                    barSkin === 'striped' ? 'skin-striped' : ''
                  } ${
                    barSkin === 'animated' ? 'skin-animated' : ''
                  } ${
                    barSkin === 'neon' ? 'skin-neon' : ''
                  }`}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-zinc-500 font-bold">
                <span>₺0</span>
                <span>Hedef: ₺{freeShippingLimit}</span>
              </div>
            </div>
            
            {!isActive && (
              <p className="text-xs text-amber-500 bg-amber-950/20 border border-amber-900/40 p-3 rounded-lg font-medium">
                ⚠️ Uygulama pasif modda olduğu için kargo barı vitrinde müşterilere gösterilmeyecektir.
              </p>
            )}
          </div>
        </div>

      </form>
    </div>
  );
};

export default HomePage;