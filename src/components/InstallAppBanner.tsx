import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";

const InstallAppBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Check if dismissed recently
    const dismissed = localStorage.getItem("install-banner-dismissed");
    if (dismissed) {
      const dismissedAt = parseInt(dismissed);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedAt < sevenDays) return;
    }

    // Detect iOS
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isiOS);

    if (isiOS) {
      setShowBanner(true);
      return;
    }

    // Android/Chrome
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("install-banner-dismissed", String(Date.now()));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-slate-900 border-t border-slate-700 shadow-2xl safe-area-bottom">
      <div className="max-w-md mx-auto flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Download className="text-white" size={20} />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">Instalar HigTec</p>
          {isIOS ? (
            <p className="text-slate-400 text-xs mt-0.5">
              Toque em <Share size={12} className="inline" /> e depois em "Adicionar à Tela de Início"
            </p>
          ) : (
            <p className="text-slate-400 text-xs mt-0.5">
              Adicione o app à sua tela inicial para acesso rápido
            </p>
          )}
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="mt-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition"
            >
              Instalar
            </button>
          )}
        </div>
        <button onClick={handleDismiss} className="text-slate-500 hover:text-white transition p-1">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default InstallAppBanner;
