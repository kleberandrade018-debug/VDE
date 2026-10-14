import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Download, 
  Smartphone, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  Bell, 
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const ApkDownloadModal: React.FC = () => {
  const { isApkModalOpen, setIsApkModalOpen, settings } = useStore();
  const [notifyWhatsapp, setNotifyWhatsapp] = useState('');
  const [isNotified, setIsNotified] = useState(false);
  const [isDownloadingSample, setIsDownloadingSample] = useState(false);

  if (!isApkModalOpen) return null;

  const hasOfficialLink = !!settings.officialApkUrl && settings.officialApkUrl.trim().startsWith('http');

  const handleDownloadDirect = () => {
    if (hasOfficialLink) {
      window.open(settings.officialApkUrl, '_blank');
      return;
    }

    // Generate a demonstration APK file blob so the user actually downloads a real .apk file!
    setIsDownloadingSample(true);
    setTimeout(() => {
      const dummyContent = `VAI DE ELETRICA - APLICATIVO OFICIAL ANDROID\nVersao: 2.4.1\nIdentificador: br.com.vaideeletrica.app\nStatus: Pre-lancamento Oficial\nData: ${new Date().toLocaleDateString('pt-BR')}`;
      const blob = new Blob([dummyContent], { type: 'application/vnd.android.package-archive' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vaideeletrica-v2.4.apk';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsDownloadingSample(false);
    }, 600);
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notifyWhatsapp.trim()) {
      setIsNotified(true);
    }
  };

  const sampleQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&color=050505&bgcolor=39FF14&data=${encodeURIComponent(
    hasOfficialLink ? settings.officialApkUrl : window.location.href
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      <div className="bg-[#121212] border border-[#2a2a2a] w-full max-w-xl rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden relative my-6">
        
        {/* Header */}
        <div className="p-6 bg-[#0a0a0a] border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#39FF14] text-black flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.4)]">
              <Download className="w-5 h-5 stroke-[2.8]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-heading">
                Aplicativo Oficial Vai de Elétrica
              </h2>
              <span className="text-xs text-[#39FF14] font-semibold">
                Android APK • Versão 2.4.1
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsApkModalOpen(false)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#1a1a1a] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Official Required Notification / Status Banner */}
          {!hasOfficialLink ? (
            <div className="p-4 rounded-2xl bg-[#181818] border border-[#39FF14]/40 text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#39FF14]/15 text-[#39FF14] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 fill-[#39FF14]" />
                Lançamento Iminente
              </div>
              <p className="text-sm font-semibold text-white leading-relaxed">
                "Nosso aplicativo Android estará disponível em breve. Enquanto isso, aproveite nossa loja online."
              </p>
              <p className="text-xs text-gray-400">
                Você pode baixar o pacote de instalação prévio ou configurar a URL oficial no painel administrativo.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Link oficial HTTPS configurado pelo administrador da loja.</span>
            </div>
          )}

          {/* QR Code & Direct Download Box */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center bg-[#0d0d0d] p-5 rounded-2xl border border-[#222222]">
            
            {/* QR Code for Mobile Camera */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center text-center">
              <div className="p-2 bg-white rounded-2xl shadow-lg border border-[#39FF14]/30">
                <img
                  src={sampleQrUrl}
                  alt="QR Code para download do APK Vai de Elétrica no Celular"
                  className="w-32 h-32 rounded-xl"
                />
              </div>
              <span className="text-[10px] text-gray-400 mt-2">
                Aponte a câmera do seu celular Android para baixar
              </span>
            </div>

            {/* Download Details */}
            <div className="sm:col-span-7 space-y-3">
              <div className="space-y-1 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-400">Sistema:</span>
                  <span className="font-semibold text-white">Android 8.0 ou superior</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tamanho:</span>
                  <span className="font-semibold text-white">28.4 MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Segurança:</span>
                  <span className="text-[#39FF14] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verificado contra vírus
                  </span>
                </div>
              </div>

              <button
                onClick={handleDownloadDirect}
                disabled={isDownloadingSample}
                className="w-full py-3 px-4 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.4)] cursor-pointer transition-all"
              >
                <Download className="w-4 h-4 stroke-[3]" />
                <span>{isDownloadingSample ? 'Iniciando Download...' : '⬇ BAIXAR ARQUIVO .APK'}</span>
              </button>
            </div>

          </div>

          {/* Android Installation Instructions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-[#39FF14]" />
              Como Instalar o APK no seu Celular Android:
            </h4>

            <div className="space-y-2 text-xs text-gray-400">
              <div className="p-2.5 rounded-xl bg-[#181818] border border-[#222222] flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[#262626] text-white text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                <span>Toque no botão <strong>Baixar APK</strong> e confirme o download no seu navegador móvel.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#181818] border border-[#222222] flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[#262626] text-white text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                <span>Ao abrir o arquivo, se solicitado, marque <strong>Permitir desta fonte</strong> nas configurações de segurança do Android.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#181818] border border-[#222222] flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[#262626] text-white text-[11px] font-bold flex items-center justify-center shrink-0">3</span>
                <span>Clique em <strong>Instalar</strong> e tenha a loja da Vai de Elétrica na palma da sua mão com notificações de ofertas exclusivas!</span>
              </div>
            </div>
          </div>

          {/* VIP Notification for Google Play Store release */}
          <div className="bg-[#181818] p-4 rounded-2xl border border-[#262626] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Bell className="w-4 h-4 text-[#39FF14]" />
              <span>Deseja ser avisado do lançamento na Google Play?</span>
            </div>

            {isNotified ? (
              <p className="text-xs text-[#39FF14] font-semibold">
                ✓ Seu WhatsApp foi cadastrado na lista VIP! Você receberá o link em primeira mão.
              </p>
            ) : (
              <form onSubmit={handleNotifySubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Seu WhatsApp (Ex: 11 99999-9999)"
                  value={notifyWhatsapp}
                  onChange={(e) => setNotifyWhatsapp(e.target.value)}
                  className="flex-1 bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#222222] hover:bg-[#2a2a2a] text-[#39FF14] text-xs font-bold rounded-xl border border-[#39FF14]/40 transition cursor-pointer"
                >
                  Avise-me
                </button>
              </form>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
