import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BIO_MAX, NAME_MAX, type Cat, type CatInput, type CatStatus } from '../types';
import { deleteCat, friendlyError, getCat, removePhoto, saveCat, uploadPhoto } from '../lib/api';
import { STATUS_LABEL, TEMPERAMENT_EMOJI, TEMPERAMENTS, temperamentLabel } from '../lib/format';
import { cropRect, cropToCard, DEFAULT_FRAMING, loadImage, type Framing } from '../lib/cropImage';
import { photoUrl } from '../lib/supabase';
import { CameraIcon, CheckIcon, EyeIcon } from '../components/icons';
import { Button, ErrorBox, Field, inputClass, PageHeader, Segmented, Spinner, YesNo } from './ui';
import { Preview } from './Preview';

type AgeUnit = 'meses' | 'anos';

const EMPTY: CatInput = {
  name: '',
  age_months: 3,
  sex: 'macho',
  neutered: false,
  vaccinated: false,
  temperament: [],
  bio: '',
  status: 'disponivel',
};

export function CatForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [original, setOriginal] = useState<Cat | null>(null);
  const [form, setForm] = useState<CatInput>(EMPTY);
  const [ageValue, setAgeValue] = useState('3');
  const [ageUnit, setAgeUnit] = useState<AgeUnit>('meses');

  // foto nova escolhida agora (ainda não enviada)
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [framing, setFraming] = useState<Framing>(DEFAULT_FRAMING);
  const [adjusting, setAdjusting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(!isNew);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ photo: string | null } | null>(null);

  useEffect(() => {
    if (!id) return;
    getCat(id).then(
      (cat) => {
        setOriginal(cat);
        setForm({
          name: cat.name,
          age_months: cat.age_months,
          sex: cat.sex,
          neutered: cat.neutered,
          vaccinated: cat.vaccinated,
          temperament: cat.temperament,
          bio: cat.bio,
          status: cat.status,
        });
        // só mostra em "anos" se for ano cheio, pra não perder meses sem querer
        if (cat.age_months >= 12 && cat.age_months % 12 === 0) {
          setAgeUnit('anos');
          setAgeValue(String(cat.age_months / 12));
        } else {
          setAgeUnit('meses');
          setAgeValue(String(cat.age_months));
        }
        setLoading(false);
      },
      (e) => {
        setError(friendlyError(e));
        setLoading(false);
      },
    );
  }, [id]);

  // idade em meses a partir do campo
  useEffect(() => {
    const n = Math.max(0, Math.floor(Number(ageValue) || 0));
    setForm((f) => ({ ...f, age_months: ageUnit === 'anos' ? n * 12 : n }));
  }, [ageValue, ageUnit]);

  const set = <K extends keyof CatInput>(k: K, v: CatInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const savedPhoto = photoUrl(original?.photo_path);
  const hasPhoto = Boolean(img || savedPhoto);

  async function pickFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      const image = await loadImage(file);
      setImg(image);
      setFraming(DEFAULT_FRAMING);
      setAdjusting(false);
    } catch (e) {
      setError(friendlyError(e));
    }
  }

  function validate(): string | null {
    if (!form.name.trim()) return 'Preencha o nome do gato.';
    if (ageValue.trim() === '' || Number(ageValue) < 0) return 'Preencha a idade aproximada.';
    if (form.age_months > 300) return 'A idade parece alta demais. Confira.';
    if (form.status === 'disponivel' && !hasPhoto) return 'Para aparecer na TV, o gato precisa de uma foto.';
    return null;
  }

  async function openPreview() {
    setError(null);
    let photo = savedPhoto;
    if (img) {
      setBusy('Preparando…');
      try {
        photo = URL.createObjectURL(await cropToCard(img, framing));
      } catch (e) {
        setError(friendlyError(e));
      }
      setBusy(null);
    }
    setPreview({ photo });
  }

  function closePreview() {
    if (preview?.photo?.startsWith('blob:')) URL.revokeObjectURL(preview.photo);
    setPreview(null);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setError(null);
    let uploaded: string | null = null;
    try {
      let photo_path = original?.photo_path ?? null;
      if (img) {
        setBusy('Enviando foto…');
        uploaded = await uploadPhoto(await cropToCard(img, framing));
        photo_path = uploaded;
      }
      setBusy('Salvando…');
      await saveCat(id ?? null, { ...form, name: form.name.trim(), bio: form.bio.trim(), photo_path });
      if (uploaded && original?.photo_path) await removePhoto(original.photo_path);
      navigate('/admin', { replace: true });
    } catch (err) {
      if (uploaded) await removePhoto(uploaded);
      setError(friendlyError(err));
      setBusy(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function remove() {
    if (!original) return;
    if (!window.confirm(`Apagar ${original.name} de vez? Isso não tem volta.\n\nSe ele foi adotado, prefira mudar o status para "Adotado".`)) return;
    setBusy('Apagando…');
    try {
      await deleteCat(original);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(friendlyError(err));
      setBusy(null);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="min-h-[100dvh] pb-36">
      <PageHeader title={isNew ? 'Novo gato' : form.name || 'Editar gato'} back="/admin" />

      <form id="cat-form" onSubmit={submit} className="mx-auto max-w-2xl space-y-7 px-4 pt-5">
        {error && <ErrorBox>{error}</ErrorBox>}

        {/* FOTO */}
        <section>
          <span className="mb-2 block text-base font-extrabold">Foto principal</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              pickFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative aspect-[4/5] w-[46%] max-w-[240px] shrink-0 overflow-hidden rounded-3xl bg-surface ring-2 ring-line"
            >
              {img ? (
                <CroppedPreview img={img} framing={framing} />
              ) : savedPhoto ? (
                <img src={savedPhoto} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 p-3 text-muted">
                  <CameraIcon className="h-12 w-12" />
                  <span className="text-center font-bold">Toque para tirar ou escolher foto</span>
                </div>
              )}
            </button>
            <div className="flex flex-1 flex-col justify-center gap-3 text-sm text-muted">
              <p>A foto é cortada sozinha no formato do card da TV.</p>
              {hasPhoto && (
                <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
                  Trocar foto
                </Button>
              )}
              {img && (
                <Button type="button" variant="secondary" onClick={() => setAdjusting((a) => !a)}>
                  {adjusting ? 'Pronto' : 'Ajustar corte'}
                </Button>
              )}
            </div>
          </div>
          {img && adjusting && <FramingControls img={img} framing={framing} onChange={setFraming} />}
        </section>

        <Field label="Nome" hint={`${form.name.length}/${NAME_MAX}`}>
          <input
            value={form.name}
            maxLength={NAME_MAX}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Ex.: Mingau"
            autoCapitalize="words"
            className={inputClass}
          />
        </Field>

        <div>
          <span className="mb-2 block text-base font-extrabold">Idade aproximada</span>
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={ageUnit === 'anos' ? 25 : 300}
              value={ageValue}
              onChange={(e) => setAgeValue(e.target.value)}
              className={`${inputClass} w-28 text-center`}
            />
            <div className="flex-1">
              <Segmented
                value={ageUnit}
                onChange={setAgeUnit}
                options={[
                  { value: 'meses', label: 'meses' },
                  { value: 'anos', label: 'anos' },
                ]}
              />
            </div>
          </div>
        </div>

        <div>
          <span className="mb-2 block text-base font-extrabold">Sexo</span>
          <Segmented
            value={form.sex}
            onChange={(v) => set('sex', v)}
            options={[
              { value: 'macho', label: '♂ Macho' },
              { value: 'femea', label: '♀ Fêmea' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
          <div>
            <span className="mb-2 block text-base font-extrabold">{form.sex === 'femea' ? 'Castrada?' : 'Castrado?'}</span>
            <YesNo value={form.neutered} onChange={(v) => set('neutered', v)} />
          </div>
          <div>
            <span className="mb-2 block text-base font-extrabold">{form.sex === 'femea' ? 'Vacinada?' : 'Vacinado?'}</span>
            <YesNo value={form.vaccinated} onChange={(v) => set('vaccinated', v)} />
          </div>
        </div>

        <div>
          <span className="mb-2 block text-base font-extrabold">Temperamento</span>
          <span className="mb-3 block text-sm text-muted">Toque em quantos quiser.</span>
          <div className="flex flex-wrap gap-2">
            {TEMPERAMENTS.map((t) => {
              const on = form.temperament.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    set('temperament', on ? form.temperament.filter((x) => x !== t) : [...form.temperament, t])
                  }
                  className={`flex min-h-[52px] items-center gap-2 rounded-full px-4 text-base font-extrabold ring-2 transition ${
                    on ? 'bg-brand text-brand-ink ring-brand' : 'bg-surface ring-line'
                  }`}
                >
                  {on ? <CheckIcon className="h-5 w-5" /> : <span>{TEMPERAMENT_EMOJI[t]}</span>}
                  {temperamentLabel(t, form.sex)}
                </button>
              );
            })}
          </div>
        </div>

        <Field
          label="Bio (frase curta)"
          hint={
            <span className={form.bio.length >= BIO_MAX ? 'font-bold text-brand' : ''}>
              {form.bio.length}/{BIO_MAX} letras
            </span>
          }
        >
          <textarea
            value={form.bio}
            maxLength={BIO_MAX}
            rows={3}
            onChange={(e) => set('bio', e.target.value.replace(/\n/g, ' '))}
            placeholder="Ex.: Adoro um colo e uma janela com sol. Procuro alguém pra ronronar junto!"
            className={`${inputClass} resize-none`}
          />
        </Field>

        <div>
          <span className="mb-2 block text-base font-extrabold">Status</span>
          <StatusPicker value={form.status} onChange={(v) => set('status', v)} />
          <span className="mt-2 block text-sm text-muted">Só os gatos “Disponível” aparecem na TV.</span>
        </div>

        {!isNew && (
          <div className="border-t border-line pt-6">
            <Button type="button" variant="danger" className="w-full" onClick={remove} disabled={!!busy}>
              Apagar gato
            </Button>
          </div>
        )}
      </form>

      {/* Barra fixa com as ações principais */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-3">
          <Button type="button" variant="secondary" className="flex-1 whitespace-nowrap px-3" onClick={openPreview} disabled={!!busy}>
            <EyeIcon className="hidden h-6 w-6 min-[420px]:block" /> Pré-visualizar
          </Button>
          <Button type="submit" form="cat-form" className="flex-1" disabled={!!busy}>
            {busy ?? 'Salvar'}
          </Button>
        </div>
      </div>

      {preview && <Preview cat={form} photo={preview.photo} onClose={closePreview} />}
    </div>
  );
}

function StatusPicker({ value, onChange }: { value: CatStatus; onChange: (v: CatStatus) => void }) {
  const opts: { v: CatStatus; cls: string }[] = [
    { v: 'disponivel', cls: 'bg-ok text-white ring-ok' },
    { v: 'em_processo', cls: 'bg-warn text-white ring-warn' },
    { v: 'adotado', cls: 'bg-ink text-white ring-ink' },
  ];
  return (
    <div className="flex flex-col gap-2">
      {opts.map(({ v, cls }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`flex min-h-[56px] items-center gap-3 rounded-2xl px-4 text-left text-lg font-extrabold ring-2 ${
            value === v ? cls : 'bg-surface ring-line'
          }`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
              value === v ? 'border-white bg-white/25' : 'border-line'
            }`}
          >
            {value === v && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
          </span>
          {STATUS_LABEL[v]}
        </button>
      ))}
    </div>
  );
}

/** Mostra o corte ao vivo só com CSS (sem gerar arquivo a cada mexida) */
function CroppedPreview({ img, framing }: { img: HTMLImageElement; framing: Framing }) {
  const style = useMemo(() => {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const { sx, sy, cw, ch } = cropRect(w, h, framing);
    return {
      width: `${(w / cw) * 100}%`,
      height: `${(h / ch) * 100}%`,
      left: `${(-sx / cw) * 100}%`,
      top: `${(-sy / ch) * 100}%`,
    };
  }, [img, framing]);
  return <img src={img.src} alt="" className="absolute max-w-none" style={style} />;
}

function FramingControls({
  img,
  framing,
  onChange,
}: {
  img: HTMLImageElement;
  framing: Framing;
  onChange: (f: Framing) => void;
}) {
  const wide = img.naturalWidth / img.naturalHeight > 0.8;
  const showX = wide || framing.zoom > 1;
  const showY = !wide || framing.zoom > 1;
  const slider = 'h-10 w-full accent-[rgb(var(--brand))]';
  return (
    <div className="mt-4 space-y-3 rounded-3xl bg-surface p-4 ring-2 ring-line">
      <label className="block font-bold">
        Zoom
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={framing.zoom}
          onChange={(e) => onChange({ ...framing, zoom: Number(e.target.value) })}
          className={slider}
        />
      </label>
      {showX && (
        <label className="block font-bold">
          Esquerda ↔ Direita
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={framing.x}
            onChange={(e) => onChange({ ...framing, x: Number(e.target.value) })}
            className={slider}
          />
        </label>
      )}
      {showY && (
        <label className="block font-bold">
          Cima ↕ Baixo
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={framing.y}
            onChange={(e) => onChange({ ...framing, y: Number(e.target.value) })}
            className={slider}
          />
        </label>
      )}
      <Button type="button" variant="ghost" className="w-full" onClick={() => onChange(DEFAULT_FRAMING)}>
        Voltar ao corte automático
      </Button>
    </div>
  );
}
