import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatBRL, formatCEP, formatCPF, formatPhone, generatePixCode, generatePixQRCodeDataUrl, getPixQrCodeUrl } from '../utils/formatters';
import { OrderCustomer } from '../types';
import confetti from 'canvas-confetti';
import { 
  X, 
  Check, 
  CreditCard, 
  QrCode, 
  Barcode, 
  ShieldCheck, 
  Truck, 
  Copy, 
  CheckCheck, 
  ArrowRight, 
  MessageSquare,
  Sparkles,
  Lock,
  Download
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    cartSubtotal, 
    settings, 
    submitOrder,
    completedOrder,
    setCompletedOrder
  } = useStore();

  // Form State
  const [formData, setFormData] = useState<OrderCustomer>({
    name: '',
    cpf: '',
    phone: '',
    whatsapp: '',
    email: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'boleto'>('pix');
  const [installments, setInstallments] = useState(1);
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCopiedPix, setHasCopiedPix] = useState(false);
  const [hasCopiedPixKey, setHasCopiedPixKey] = useState(false);
  const [pixQrDataUrl, setPixQrDataUrl] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Dynamically generate high-res QR code whenever order is completed
  React.useEffect(() => {
    if (completedOrder?.pixCode) {
      let active = true;
      generatePixQRCodeDataUrl(completedOrder.pixCode).then((url) => {
        if (active) setPixQrDataUrl(url);
      });
      return () => {
        active = false;
      };
    } else {
      setPixQrDataUrl('');
    }
  }, [completedOrder?.pixCode]);

  if (!isCheckoutOpen && !completedOrder) return null;

  // Discounts & Calculations
  const pixDiscount = paymentMethod === 'pix' ? (cartSubtotal * 0.05) : 0;
  const shippingCost = 0; // Standard free delivery
  const finalTotal = Math.max(0, cartSubtotal - pixDiscount + shippingCost);

  // Auto-fetch CEP from ViaCEP API
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatCEP(rawVal);
    setFormData((prev) => ({ ...prev, cep: formatted }));

    const clean = rawVal.replace(/\D/g, '');
    if (clean.length === 8) {
      setIsLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || '',
          }));
        }
      } catch (err) {
        console.error('Erro ao consultar CEP:', err);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Nome completo é obrigatório';
    if (!formData.cpf.trim() || formData.cpf.replace(/\D/g, '').length < 11) errors.cpf = 'CPF válido é obrigatório para emissão da NF';
    if (!formData.whatsapp.trim()) errors.whatsapp = 'WhatsApp para contato é obrigatório';
    if (!formData.cep.trim()) errors.cep = 'CEP é obrigatório';
    if (!formData.street.trim()) errors.street = 'Endereço é obrigatório';
    if (!formData.number.trim()) errors.number = 'Número é obrigatório';
    if (!formData.city.trim()) errors.city = 'Cidade é obrigatória';

    if (paymentMethod === 'credit_card') {
      if (!cardHolder.trim()) errors.cardHolder = 'Nome impresso no cartão é obrigatório';
      if (cardNumber.replace(/\D/g, '').length < 13) errors.cardNumber = 'Número de cartão inválido';
      if (!cardExpiry.trim()) errors.cardExpiry = 'Validade obrigatória';
      if (cardCvv.length < 3) errors.cardCvv = 'CVV obrigatório';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const txId = `VDE${Date.now().toString().slice(-4)}`;
      // Always generate dynamic PIX code with the EXACT total of the order/model!
      const generatedPix = generatePixCode(
        txId,
        finalTotal,
        settings.pixKey,
        settings.tradeName || 'VAI DE ELETRICA',
        'SAO PAULO'
      );

      const newOrder = submitOrder({
        customer: formData,
        items: cart,
        subtotal: cartSubtotal,
        shippingCost,
        discount: pixDiscount,
        total: finalTotal,
        paymentMethod,
        installments: paymentMethod === 'credit_card' ? installments : undefined,
        pixCode: paymentMethod === 'pix' ? generatedPix : undefined,
      });

      // Celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#39FF14', '#ffffff', '#22c55e']
      });
    }, 900);
  };

  const copyPixCode = () => {
    if (completedOrder?.pixCode) {
      navigator.clipboard.writeText(completedOrder.pixCode);
      setHasCopiedPix(true);
      setTimeout(() => setHasCopiedPix(false), 3000);
    }
  };

  const copyPixKey = () => {
    const key = settings.pixKey || '8f0cc2dd-dac2-47e4-a824-09be9f10cd21';
    navigator.clipboard.writeText(key);
    setHasCopiedPixKey(true);
    setTimeout(() => setHasCopiedPixKey(false), 3000);
  };

  const handleDownloadQrCode = () => {
    if (!pixQrDataUrl && !completedOrder?.pixCode) return;
    const url = pixQrDataUrl || getPixQrCodeUrl(completedOrder?.pixCode || '');
    const link = document.createElement('a');
    link.href = url;
    link.download = `pix-vaideeletrica-${completedOrder?.id || 'pedido'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendOrderToWhatsApp = () => {
    if (!completedOrder) return;
    const rawPhone = settings.officialWhatsApp || '5511972040833';
    const digits = rawPhone.replace(/\D/g, '');
    const phone = digits.startsWith('55') ? digits : `55${digits}`;
    const itemsList = completedOrder.items.map((i) => `• ${i.quantity}x ${i.scooter.name}`).join('\n');
    const msg = encodeURIComponent(
      `🎉 Olá! Acabei de realizar o pedido *${completedOrder.id}* no site da Vai de Elétrica!\n\n` +
      `*Cliente:* ${completedOrder.customer.name}\n` +
      `*Valor Total:* ${formatBRL(completedOrder.total)}\n` +
      `*Forma de Pagamento:* ${completedOrder.paymentMethod.toUpperCase()}\n` +
      `*Itens:*\n${itemsList}\n\n` +
      `*Endereço de Entrega:* ${completedOrder.customer.street}, ${completedOrder.customer.number} - ${completedOrder.customer.city}/${completedOrder.customer.state}\n\n` +
      `Aguardo confirmação e prazo de despacho!`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      <div className="bg-[#121212] border border-[#2a2a2a] w-full max-w-4xl rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden relative my-6">
        
        {/* Header Bar */}
        <div className="p-6 bg-[#0d0d0d] border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#39FF14]/20 border border-[#39FF14]/40 flex items-center justify-center text-[#39FF14]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white font-heading">
                {completedOrder ? 'Pedido Confirmado com Sucesso!' : 'Finalização de Compra Segura'}
              </h2>
              <span className="text-[11px] text-[#A3A3A3]">
                Vai de Elétrica • Certificado de Segurança SSL Ativo
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsCheckoutOpen(false);
              setCompletedOrder(null);
            }}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#1a1a1a] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ORDER SUCCESS SCREEN */}
        {completedOrder ? (
          <div className="p-6 sm:p-10 space-y-6 text-center">
            
            <div className="w-20 h-20 rounded-full bg-[#39FF14]/20 border-2 border-[#39FF14] flex items-center justify-center mx-auto text-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.4)]">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-[#39FF14] font-extrabold">
                PEDIDO GERADO • CÓDIGO {completedOrder.id}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-heading mt-1">
                Parabéns, {completedOrder.customer.name.split(' ')[0]}! Sua Scooter Elétrica está a caminho!
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto mt-2">
                Enviamos os detalhes da compra e instruções para seu WhatsApp ({completedOrder.customer.whatsapp}) e e-mail.
              </p>
            </div>

            {/* PIX Payment Action Box (If PIX chosen) */}
            {completedOrder.paymentMethod === 'pix' && (
              <div className="bg-[#181818] border border-[#39FF14]/50 rounded-3xl p-6 sm:p-7 max-w-lg mx-auto text-center space-y-5 shadow-[0_10px_35px_rgba(0,0,0,0.8)] animate-in fade-in">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#39FF14]/15 border border-[#39FF14]/40 text-xs font-bold text-[#39FF14] uppercase tracking-wider">
                  <QrCode className="w-4 h-4 stroke-[2.5]" />
                  <span>PIX com Valor Exato do Modelo Escolhido</span>
                </div>

                {/* Centralized High-Quality Dynamic QR Code Box */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl inline-block shadow-[0_15px_35px_rgba(0,0,0,0.5)] border-4 border-[#39FF14]/40 relative">
                  <img
                    src={pixQrDataUrl || getPixQrCodeUrl(completedOrder.pixCode || '')}
                    onError={(e) => {
                      const img = e.currentTarget;
                      const fallback = getPixQrCodeUrl(completedOrder.pixCode || settings.pixKey || '8f0cc2dd-dac2-47e4-a824-09be9f10cd21');
                      if (img.src !== fallback) {
                        img.src = fallback;
                      }
                    }}
                    alt={`QR Code PIX oficial no valor exato de ${formatBRL(completedOrder.total)}`}
                    className="w-56 h-56 sm:w-64 sm:h-64 mx-auto object-contain block select-none rounded-xl"
                  />
                  <div className="mt-2 text-center">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block font-mono">
                      PADRÃO BR CODE • BANCO CENTRAL DO BRASIL
                    </span>
                  </div>
                </div>

                {/* Exact Model Amount Notification */}
                <div className="space-y-1.5 text-center">
                  <span className="text-[11px] text-gray-400 block uppercase font-bold tracking-wider">
                    Valor total com 5% de desconto à vista
                  </span>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-[#121212] border border-[#39FF14]/50">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#39FF14] animate-pulse"></span>
                    <strong className="text-2xl sm:text-3xl text-[#39FF14] font-mono-tech font-black tracking-tight">
                      {formatBRL(completedOrder.total)}
                    </strong>
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold max-w-sm mx-auto pt-1">
                    ✓ Ao ler o QR Code no app do seu banco, o valor de {formatBRL(completedOrder.total)} já aparece preenchido na tela automaticamente!
                  </p>
                </div>

                {/* Copy Buttons: Pix Copia e Cola, Salvar Imagem & Chave Pix */}
                <div className="space-y-2.5 pt-1">
                  {/* Button 1: Pix Copia e Cola with exact amount */}
                  {completedOrder.pixCode && (
                    <button
                      onClick={copyPixCode}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#222222] hover:bg-[#2c2c2c] text-white border border-[#39FF14]/70 hover:border-[#39FF14] text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer shadow-md active:scale-[0.99]"
                    >
                      {hasCopiedPix ? (
                        <>
                          <CheckCheck className="w-4 h-4 text-[#39FF14]" />
                          <span className="text-[#39FF14]">Código PIX Copiado! Cole no aplicativo do banco</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-[#39FF14]" />
                          <span>Copiar Código PIX (Copia e Cola com Valor)</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Button 2: Salvar Imagem do QR Code no celular */}
                  <button
                    onClick={handleDownloadQrCode}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#161616] hover:bg-[#202020] text-gray-200 hover:text-white border border-gray-700 hover:border-[#39FF14]/60 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#39FF14]" />
                    <span>Salvar Imagem do QR Code no Celular</span>
                  </button>

                  {/* Button 3: Chave Pix Direta */}
                  <button
                    onClick={copyPixKey}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#121212] hover:bg-[#1a1a1a] text-gray-400 hover:text-gray-200 border border-gray-800 hover:border-gray-700 text-[11px] font-medium flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    {hasCopiedPixKey ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-[#39FF14]" />
                        <span className="text-[#39FF14]">Chave Pix Copiada: {settings.pixKey || '8f0cc2dd-dac2-47e4-a824-09be9f10cd21'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
                        <span>Chave Pix da Loja: <strong className="text-gray-300 font-mono">{settings.pixKey || '8f0cc2dd-dac2-47e4-a824-09be9f10cd21'}</strong></span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3.5 bg-[#111111] rounded-xl border border-[#222222] text-[11px] text-gray-400 text-left space-y-1.5">
                  <div className="font-bold text-gray-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#39FF14]" />
                    <span>Como pagar no aplicativo do seu banco:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-400 leading-relaxed">
                    <li>Abra o app do seu banco (<strong>Nubank, Itaú, Bradesco, Banco do Brasil, Inter, Caixa, Santander, Mercado Pago</strong>, etc.)</li>
                    <li>Acesse a área <strong>PIX</strong> e escolha <strong>Ler QR Code</strong> (aponte a câmera) ou <strong>Pix Copia e Cola</strong></li>
                    <li>O valor de <strong>{formatBRL(completedOrder.total)}</strong> e os dados da Vai de Elétrica aparecem na hora, sem você precisar digitar nada</li>
                    <li>Confirme com a senha do banco para aprovação imediata do seu pedido!</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Order Summary Recap */}
            <div className="bg-[#181818] border border-[#262626] rounded-2xl p-5 max-w-xl mx-auto text-left space-y-3 text-xs">
              <div className="flex justify-between border-b border-[#242424] pb-2 font-bold text-white">
                <span>Resumo da Entrega</span>
                <span className="text-emerald-400">Frete Grátis com Seguro</span>
              </div>
              <div className="text-gray-400">
                <strong className="text-gray-200">Destinatário:</strong> {completedOrder.customer.name} (CPF: {completedOrder.customer.cpf})<br />
                <strong className="text-gray-200">Endereço:</strong> {completedOrder.customer.street}, {completedOrder.customer.number} {completedOrder.customer.complement || ''} - {completedOrder.customer.neighborhood}, {completedOrder.customer.city}/{completedOrder.customer.state} - CEP {completedOrder.customer.cep}
              </div>
              <div className="border-t border-[#242424] pt-2">
                <strong className="text-gray-200 block mb-1">Itens do Pedido:</strong>
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-gray-300">
                    <span>{item.quantity}x {item.scooter.name}</span>
                    <span className="font-mono-tech">{formatBRL((item.scooter.promoPrice ?? item.scooter.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-2">
              <button
                onClick={handleSendOrderToWhatsApp}
                className="w-full py-3.5 px-6 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(57,255,20,0.4)] cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Confirmar no WhatsApp Oficial</span>
              </button>

              <button
                onClick={() => {
                  setCompletedOrder(null);
                  setIsCheckoutOpen(false);
                }}
                className="w-full py-3 px-6 rounded-xl bg-[#222222] hover:bg-[#2a2a2a] text-gray-300 hover:text-white text-xs font-bold transition cursor-pointer"
              >
                Voltar à Loja
              </button>
            </div>

          </div>
        ) : (
          /* FORM CHECKOUT */
          <form onSubmit={handleCheckoutSubmit} className="p-6 sm:p-8 max-h-[82vh] overflow-y-auto space-y-8">
            
            {/* Step 1: Personal Data */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-[#222222]">
                <span className="w-6 h-6 rounded-full bg-[#39FF14] text-black text-xs font-black flex items-center justify-center">1</span>
                <span>Dados Pessoais do Comprador</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo da Silva"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  />
                  {formErrors.name && <span className="text-red-400 text-[10px] mt-0.5 block">{formErrors.name}</span>}
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">CPF (para Emissão de NF) *</label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    maxLength={14}
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                    className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  />
                  {formErrors.cpf && <span className="text-red-400 text-[10px] mt-0.5 block">{formErrors.cpf}</span>}
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">WhatsApp para Rastreio *</label>
                  <input
                    type="text"
                    required
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: formatPhone(e.target.value) })}
                    className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  />
                  {formErrors.whatsapp && <span className="text-red-400 text-[10px] mt-0.5 block">{formErrors.whatsapp}</span>}
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">E-mail para Confirmação</label>
                  <input
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address with ViaCEP */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-[#222222]">
                <span className="w-6 h-6 rounded-full bg-[#39FF14] text-black text-xs font-black flex items-center justify-center">2</span>
                <span>Endereço de Entrega da Scooter</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">
                    CEP * {isLoadingCep && <span className="text-[#39FF14] text-[10px] ml-1">(Buscando endereço...)</span>}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="00000-000"
                    maxLength={9}
                    value={formData.cep}
                    onChange={handleCepChange}
                    className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  />
                  {formErrors.cep && <span className="text-red-400 text-[10px] mt-0.5 block">{formErrors.cep}</span>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-300 mb-1 font-semibold">Logradouro / Rua / Avenida *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Av. Brasil"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">Número *</label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">Complemento</label>
                  <input
                    type="text"
                    placeholder="Apto 42, Bloco B"
                    value={formData.complement}
                    onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">Bairro</label>
                  <input
                    type="text"
                    placeholder="Centro"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">Cidade *</label>
                  <input
                    type="text"
                    required
                    placeholder="São Paulo"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">Estado (UF)</label>
                  <input
                    type="text"
                    placeholder="SP"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3.5 py-2.5 text-white focus:outline-none uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-[#222222]">
                <span className="w-6 h-6 rounded-full bg-[#39FF14] text-black text-xs font-black flex items-center justify-center">3</span>
                <span>Forma de Pagamento Segura</span>
              </div>

              {/* Payment Select Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'pix'
                      ? 'border-[#39FF14] bg-[#181818] shadow-[0_0_15px_rgba(57,255,20,0.2)]'
                      : 'border-[#262626] bg-[#121212] hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <QrCode className="w-5 h-5 text-[#39FF14]" />
                    <span className="text-[10px] font-bold bg-[#39FF14]/20 text-[#39FF14] px-2 py-0.5 rounded-full">
                      5% OFF
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">PIX Instantâneo</span>
                    <span className="text-[11px] text-gray-400">Aprovação imediata</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'credit_card'
                      ? 'border-[#39FF14] bg-[#181818] shadow-[0_0_15px_rgba(57,255,20,0.2)]'
                      : 'border-[#262626] bg-[#121212] hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <CreditCard className="w-5 h-5 text-[#39FF14]" />
                    <span className="text-[10px] text-gray-400">Até 12x</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Cartão de Crédito</span>
                    <span className="text-[11px] text-gray-400">Parcelamento sem juros</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('boleto')}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'boleto'
                      ? 'border-[#39FF14] bg-[#181818] shadow-[0_0_15px_rgba(57,255,20,0.2)]'
                      : 'border-[#262626] bg-[#121212] hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Barcode className="w-5 h-5 text-[#39FF14]" />
                    <span className="text-[10px] text-gray-400">1 a 2 dias</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Boleto Bancário</span>
                    <span className="text-[11px] text-gray-400">À vista</span>
                  </div>
                </button>
              </div>

              {/* PIX details info box if selected */}
              {paymentMethod === 'pix' && (
                <div className="bg-[#181818] p-4 sm:p-5 rounded-2xl border border-[#39FF14]/40 space-y-3 text-xs animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#242424] pb-2.5">
                    <span className="font-extrabold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#39FF14]" />
                      PIX com Valor Exato do Modelo Bloqueado
                    </span>
                    <span className="text-[10px] font-black uppercase text-[#39FF14] bg-[#39FF14]/15 px-2.5 py-1 rounded-full border border-[#39FF14]/30 w-fit">
                      5% DE DESCONTO À VISTA
                    </span>
                  </div>

                  <div className="p-3 bg-[#111111] rounded-xl border border-[#242424] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Valor total exato do seu pedido:</span>
                      <strong className="text-xl sm:text-2xl font-black text-[#39FF14] font-mono-tech block">
                        {formatBRL(finalTotal)}
                      </strong>
                    </div>
                    <div className="text-[11px] text-gray-300 sm:max-w-xs sm:text-right">
                      Ao clicar em confirmar, o <strong>QR Code oficial</strong> e o <strong>Pix Copia e Cola</strong> são gerados com este valor exato para leitura imediata no aplicativo do seu banco.
                    </div>
                  </div>
                </div>
              )}

              {/* Credit card fields if selected */}
              {paymentMethod === 'credit_card' && (
                <div className="bg-[#181818] p-5 rounded-2xl border border-[#2a2a2a] space-y-4 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between text-gray-400 border-b border-[#242424] pb-2">
                    <span>Dados do Cartão</span>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Transação Criptografada
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-gray-300 mb-1">Nome Impresso no Cartão</label>
                      <input
                        type="text"
                        placeholder="NOME COMO NO CARTAO"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-white uppercase focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-1">Número do Cartão</label>
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-white font-mono-tech focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-300 mb-1">Validade</label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-white font-mono-tech focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-1">CVV</label>
                        <input
                          type="password"
                          placeholder="123"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-white font-mono-tech focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-gray-300 mb-1 font-semibold">Número de Parcelas</label>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(Number(e.target.value))}
                        className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] text-white rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => {
                          const val = finalTotal / n;
                          return (
                            <option key={n} value={n}>
                              {n}x de {formatBRL(val)} sem juros (Total: {formatBRL(finalTotal)})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Review & Totals */}
            <div className="bg-[#0e0e0e] border border-[#222222] rounded-2xl p-5 space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider">
                Resumo Final da Compra
              </h4>

              <div className="space-y-1.5 text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono-tech text-white">{formatBRL(cartSubtotal)}</span>
                </div>
                {pixDiscount > 0 && (
                  <div className="flex justify-between text-[#39FF14]">
                    <span>Desconto Especial PIX (5%):</span>
                    <span className="font-mono-tech">-{formatBRL(pixDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-400">
                  <span>Frete Especial com Seguro:</span>
                  <span className="font-bold uppercase">Grátis</span>
                </div>
                <div className="pt-2 border-t border-[#222222] flex justify-between items-baseline font-bold text-base">
                  <span className="text-white font-heading">Total a Pagar:</span>
                  <span className="text-2xl font-black text-[#39FF14] font-heading font-mono-tech">
                    {formatBRL(finalTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(57,255,20,0.5)] transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <span>Processando seu Pedido com Segurança...</span>
              ) : (
                <>
                  <span>
                    {paymentMethod === 'pix'
                      ? `CONFIRMAR E GERAR PIX COM VALOR (${formatBRL(finalTotal)})`
                      : 'CONFIRMAR E FINALIZAR PEDIDO'}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>

          </form>
        )}

      </div>

    </div>
  );
};
