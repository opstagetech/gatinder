import { QRCodeSVG } from 'qrcode.react';
import type { Settings } from '../types';
import { whatsappLink } from '../lib/format';

/** Rodapé fixo da TV (260px de altura): chamada + QR code do WhatsApp. Usado na TV e na pré-visualização.
 *  Afastado das laterais e do fundo por causa dos cantos arredondados da moldura. */
export function TvFooter({ settings }: { settings: Pick<Settings, 'whatsapp_number' | 'whatsapp_message'> | null }) {
  const link = settings ? whatsappLink(settings.whatsapp_number, settings.whatsapp_message) : null;

  return (
    <div className="absolute inset-x-0 bottom-0 flex h-[260px] items-center bg-brand-gradient px-[var(--tv-safe-x)] pb-[24px] font-body text-brand-ink">
      <div className="mr-[36px] min-w-0 flex-1">
        <div className="font-display text-[64px] font-bold leading-[1.05]">Quer me adotar?</div>
        <div className="mt-[10px] text-[34px] font-bold leading-tight opacity-95">
          Fale com a equipe aqui na loja
          {link && (
            <>
              <br />
              ou aponte a câmera pro QR 👉
            </>
          )}
        </div>
      </div>

      {link && (
        <div className="shrink-0 rounded-[24px] bg-white p-[14px] shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
          <QRCodeSVG value={link} size={176} level="M" />
        </div>
      )}
    </div>
  );
}
