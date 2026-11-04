import type { CatSex, CatStatus, CatTemperament } from '../types';

/** 4 → "4 meses", 1 → "1 mês", 24 → "2 anos", 30 → "2 anos" */
export function formatAge(months: number): string {
  if (months < 12) return months <= 1 ? '1 mês' : `${months} meses`;
  const years = Math.floor(months / 12);
  return years === 1 ? '1 ano' : `${years} anos`;
}

export const SEX_LABEL: Record<CatSex, string> = {
  macho: 'Macho',
  femea: 'Fêmea',
};

export const STATUS_LABEL: Record<CatStatus, string> = {
  disponivel: 'Disponível',
  em_processo: 'Em processo de adoção',
  adotado: 'Adotado',
};

export const STATUS_SHORT: Record<CatStatus, string> = {
  disponivel: 'Disponível',
  em_processo: 'Em processo',
  adotado: 'Adotado',
};

export const TEMPERAMENT_LABEL: Record<CatTemperament, string> = {
  brincalhao: 'Brincalhão',
  calmo: 'Calmo',
  carinhoso: 'Carinhoso',
  timido: 'Tímido',
  gosta_de_gatos: 'Se dá bem com gatos',
  gosta_de_caes: 'Se dá bem com cães',
};

export const TEMPERAMENT_EMOJI: Record<CatTemperament, string> = {
  brincalhao: '🧶',
  calmo: '😌',
  carinhoso: '🥰',
  timido: '🙈',
  gosta_de_gatos: '🐈',
  gosta_de_caes: '🐕',
};

export const TEMPERAMENTS = Object.keys(TEMPERAMENT_LABEL) as CatTemperament[];

/** Ajusta rótulo para fêmea: "Brincalhona", "Carinhosa"... */
export function temperamentLabel(t: CatTemperament, sex: CatSex): string {
  if (sex === 'femea') {
    const f: Partial<Record<CatTemperament, string>> = {
      brincalhao: 'Brincalhona',
      calmo: 'Calma',
      carinhoso: 'Carinhosa',
      timido: 'Tímida',
    };
    return f[t] ?? TEMPERAMENT_LABEL[t];
  }
  return TEMPERAMENT_LABEL[t];
}

/** Link do WhatsApp com a mensagem pronta (para o QR code) */
export function whatsappLink(number: string, message: string): string | null {
  const digits = number.replace(/\D/g, '');
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
