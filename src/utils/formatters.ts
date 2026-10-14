export function formatBRL(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateInstallment(amount: number, installments: number = 12): { count: number; value: string; total: string } {
  const value = amount / installments;
  return {
    count: installments,
    value: formatBRL(value),
    total: formatBRL(amount),
  };
}

export function calculateDiscountPercent(original: number, promo: number): number {
  if (!original || !promo || original <= promo) return 0;
  return Math.round(((original - promo) / original) * 100);
}

export function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

// Format EMVCo TLV (Tag-Length-Value) field
function formatEMV(id: string, value: string): string {
  const len = String(value.length).padStart(2, '0');
  return `${id}${len}${value}`;
}

// Official CRC-16/CCITT-FALSE calculation for Brazilian Pix (polynomial 0x1021, init 0xFFFF)
export function calculatePixCRC16(payload: string): string {
  const polynomial = 0x1021;
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Generates an official Banco Central do Brasil (BCB) Pix BR Code payload.
 * When scanned or read by ANY Brazilian banking app (Nubank, Itaú, Bradesco, BB, Santander, Inter, etc.),
 * the bank immediately recognizes the recipient and automatically fills in the EXACT AMOUNT of the order/model!
 */
export function generatePixCode(
  orderId: string,
  amount: number,
  pixKey?: string,
  merchantName?: string,
  merchantCity?: string
): string {
  const key = (pixKey || '8f0cc2dd-dac2-47e4-a824-09be9f10cd21').trim();
  
  // Tag 00: Format Indicator
  const tag00 = formatEMV('00', '01');

  // Tag 26: Merchant Account Information - Pix
  const sub00 = formatEMV('00', 'br.gov.bcb.pix');
  const sub01 = formatEMV('01', key);
  const tag26 = formatEMV('26', sub00 + sub01);

  // Tag 52: Merchant Category Code (0000 = padrão)
  const tag52 = formatEMV('52', '0000');

  // Tag 53: Transaction Currency (986 = Real brasileiro)
  const tag53 = formatEMV('53', '986');

  // Tag 54: Transaction Amount (VALOR EXATO DA COMPRA/MODELO!)
  let tag54 = '';
  if (amount && amount > 0) {
    const formattedAmount = Number(amount).toFixed(2);
    tag54 = formatEMV('54', formattedAmount);
  }

  // Tag 58: Country Code
  const tag58 = formatEMV('58', 'BR');

  // Tag 59: Merchant Name (Máx 25 chars, sem acentos)
  const rawName = merchantName || 'VAI DE ELETRICA';
  const cleanName = rawName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim()
    .slice(0, 25) || 'VAI DE ELETRICA';
  const tag59 = formatEMV('59', cleanName.toUpperCase());

  // Tag 60: Merchant City (Máx 15 chars, sem acentos)
  const rawCity = merchantCity || 'SAO PAULO';
  const cleanCity = rawCity
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim()
    .slice(0, 15) || 'SAO PAULO';
  const tag60 = formatEMV('60', cleanCity.toUpperCase());

  // Tag 62: Additional Data Field (TxID do Pedido)
  const cleanTxId = (orderId || '***').replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***';
  const sub05 = formatEMV('05', cleanTxId);
  const tag62 = formatEMV('62', sub05);

  // Tag 63: CRC16
  const payloadToSign = `${tag00}${tag26}${tag52}${tag53}${tag54}${tag58}${tag59}${tag60}${tag62}6304`;
  const checksum = calculatePixCRC16(payloadToSign);

  return `${payloadToSign}${checksum}`;
}

/**
 * Generates an ultra-crisp, instant client-side QR Code Data URL (PNG base64)
 * with the exact Pix payload.
 */
export async function generatePixQRCodeDataUrl(pixCode: string): Promise<string> {
  try {
    const QRCode = (await import('qrcode')).default;
    return await QRCode.toDataURL(pixCode, {
      width: 400,
      margin: 1,
      color: {
        dark: '#050505',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Falha ao gerar QR Code localmente via canvas/qrcode:', err);
    return getPixQrCodeUrl(pixCode);
  }
}

export function getPixQrCodeUrl(pixCode: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=10&color=050505&bgcolor=ffffff&data=${encodeURIComponent(pixCode)}`;
}
