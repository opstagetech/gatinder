export type CatSex = 'macho' | 'femea';
export type CatStatus = 'disponivel' | 'em_processo' | 'adotado';
export type CatTemperament =
  | 'brincalhao'
  | 'calmo'
  | 'carinhoso'
  | 'timido'
  | 'gosta_de_gatos'
  | 'gosta_de_caes';

export interface Cat {
  id: string;
  name: string;
  age_months: number;
  sex: CatSex;
  neutered: boolean;
  vaccinated: boolean;
  temperament: CatTemperament[];
  bio: string;
  status: CatStatus;
  photo_path: string | null;
  sort_order: number;
  adopted_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Campos que a equipe preenche no formulário */
export type CatInput = Pick<
  Cat,
  'name' | 'age_months' | 'sex' | 'neutered' | 'vaccinated' | 'temperament' | 'bio' | 'status'
>;

export interface Settings {
  id: true;
  whatsapp_number: string;
  whatsapp_message: string;
  slide_seconds: number;
  institutional_every_min: number;
  institutional_title: string;
  institutional_steps: string[];
  updated_at: string;
}

export const BIO_MAX = 120;
export const NAME_MAX = 40;
