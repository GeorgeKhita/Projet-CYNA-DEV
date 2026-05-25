import { useState } from 'react';
import { ChevronUp, ChevronDown, Eye, EyeOff, ToggleLeft, ToggleRight, Image } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  accentColor: string;
  order: number;
  active: boolean;
}

const initialSlides: Slide[] = [
  {
    id: 1,
    title: 'Protection SOC de nouvelle génération',
    subtitle: 'Surveillance 24/7 de vos infrastructures par des experts certifiés. Détection et réponse aux incidents en temps réel.',
    accentColor: '#00B4D8',
    order: 1,
    active: true,
  },
  {
    id: 2,
    title: 'EDR Enterprise — Endpoint Défense Totale',
    subtitle: 'Protégez chaque endpoint de votre organisation avec une détection comportementale alimentée par l\'IA.',
    accentColor: '#8B5CF6',
    order: 2,
    active: true,
  },
  {
    id: 3,
    title: 'XDR Suite — Visibilité Unifiée',
    subtitle: 'Consolidez votre sécurité avec une plateforme XDR qui corrèle les données de tous vos outils de sécurité.',
    accentColor: '#10B981',
    order: 3,
    active: true,
  },
];

export function AdminCarouselPage() {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [previewSlide, setPreviewSlide] = useState<Slide | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const sorted = [...slides].sort((a, b) => a.order - b.order);

  const toggleActive = (id: number) => {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  };

  const moveUp = (id: number) => {
    setSlides((prev) => {
      const sortedList = [...prev].sort((a, b) => a.order - b.order);
      const idx = sortedList.findIndex((s) => s.id === id);
      if (idx === 0) return prev;
      const newList = [...sortedList];
      const tmp = newList[idx].order;
      newList[idx] = { ...newList[idx], order: newList[idx - 1].order };
      newList[idx - 1] = { ...newList[idx - 1], order: tmp };
      return newList;
    });
  };

  const moveDown = (id: number) => {
    setSlides((prev) => {
      const sortedList = [...prev].sort((a, b) => a.order - b.order);
      const idx = sortedList.findIndex((s) => s.id === id);
      if (idx === sortedList.length - 1) return prev;
      const newList = [...sortedList];
      const tmp = newList[idx].order;
      newList[idx] = { ...newList[idx], order: newList[idx + 1].order };
      newList[idx + 1] = { ...newList[idx + 1], order: tmp };
      return newList;
    });
  };

  const updateField = (id: number, field: keyof Slide, value: string | boolean | number) => {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Carrousel Homepage</h1>
          <p className="text-gray-400">Gérez les {slides.length} slides du carrousel de la page d'accueil</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#00B4D8]/10 border border-[#00B4D8]/30 rounded-lg">
          <Image className="w-5 h-5 text-[#00B4D8]" />
          <span className="text-[#00B4D8] font-medium text-sm">{slides.filter((s) => s.active).length} slides actifs</span>
        </div>
      </div>

      {/* Slides List */}
      <div className="space-y-4">
        {sorted.map((slide, index) => (
          <div
            key={slide.id}
            className={`bg-gradient-to-br from-white/5 to-white/[0.02] border rounded-xl overflow-hidden transition-all ${
              slide.active ? 'border-white/10' : 'border-white/5 opacity-60'
            }`}
          >
            {/* Slide Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-4">
                {/* Order indicator */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: `${slide.accentColor}20`, border: `1px solid ${slide.accentColor}40`, color: slide.accentColor }}
                >
                  {slide.order}
                </div>
                <div>
                  <div className="text-white font-semibold">{slide.title}</div>
                  <div className="text-gray-400 text-sm mt-0.5 truncate max-w-md">{slide.subtitle}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                {/* Move buttons */}
                <button
                  onClick={() => moveUp(slide.id)}
                  disabled={index === 0}
                  className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronUp className="w-4 h-4 text-gray-300" />
                </button>
                <button
                  onClick={() => moveDown(slide.id)}
                  disabled={index === sorted.length - 1}
                  className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="w-4 h-4 text-gray-300" />
                </button>

                {/* Preview button */}
                <button
                  onClick={() => setPreviewSlide(previewSlide?.id === slide.id ? null : slide)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-[#8B5CF6]/20 hover:border-[#8B5CF6]/40 hover:text-[#8B5CF6] transition-all text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  Aperçu
                </button>

                {/* Toggle active */}
                <button onClick={() => toggleActive(slide.id)} className="transition-colors">
                  {slide.active ? (
                    <ToggleRight className="w-7 h-7 text-[#10B981]" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-gray-600" />
                  )}
                </button>

                {/* Edit toggle */}
                <button
                  onClick={() => setEditingId(editingId === slide.id ? null : slide.id)}
                  className="px-3 py-2 bg-[#00B4D8]/10 border border-[#00B4D8]/30 text-[#00B4D8] rounded-lg hover:bg-[#00B4D8]/20 transition-colors text-sm font-medium"
                >
                  {editingId === slide.id ? 'Fermer' : 'Modifier'}
                </button>
              </div>
            </div>

            {/* Mini Preview */}
            {previewSlide?.id === slide.id && (
              <div
                className="mx-6 my-4 rounded-xl p-8 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, #0A1628 0%, ${slide.accentColor}15 100%)`, border: `1px solid ${slide.accentColor}30` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <EyeOff className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-500 text-xs uppercase font-semibold tracking-wider">Aperçu du slide</span>
                </div>
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ color: slide.accentColor }}
                >
                  {slide.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed max-w-xl">{slide.subtitle}</p>
                <button
                  className="mt-4 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  style={{ backgroundColor: slide.accentColor, color: '#0A1628' }}
                >
                  Découvrir →
                </button>
                {/* Decorative circle */}
                <div
                  className="absolute right-8 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full opacity-10"
                  style={{ backgroundColor: slide.accentColor }}
                />
              </div>
            )}

            {/* Edit Form */}
            {editingId === slide.id && (
              <div className="px-6 py-5 space-y-4 bg-white/[0.02]">
                <div>
                  <label className="block text-white font-medium mb-1 text-sm">Titre</label>
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => updateField(slide.id, 'title', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-1 text-sm">Sous-titre</label>
                  <textarea
                    value={slide.subtitle}
                    onChange={(e) => updateField(slide.id, 'subtitle', e.target.value)}
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] text-sm resize-none"
                  />
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <label className="block text-white font-medium mb-1 text-sm">Couleur d'accentuation</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={slide.accentColor}
                        onChange={(e) => updateField(slide.id, 'accentColor', e.target.value)}
                        className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                      />
                      <span className="text-gray-400 text-sm font-mono">{slide.accentColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-1 text-sm">Couleurs rapides</label>
                    <div className="flex items-center gap-2">
                      {['#00B4D8', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => updateField(slide.id, 'accentColor', color)}
                          className="w-7 h-7 rounded-full border-2 transition-all"
                          style={{
                            backgroundColor: color,
                            borderColor: slide.accentColor === color ? 'white' : 'transparent',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors">
          Enregistrer les modifications
        </button>
      </div>
    </div>
  );
}
