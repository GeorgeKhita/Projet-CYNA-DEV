import { useState } from 'react';
import { Shield, Laptop, Globe, Pencil, Plus } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: typeof Shield;
  productCount: number;
  visible: boolean;
}

const initialCategories: Category[] = [
  { id: 'soc', name: 'SOC', description: 'Security Operations Center — Surveillance et détection des menaces en temps réel', color: '#00B4D8', icon: Shield, productCount: 2, visible: true },
  { id: 'edr', name: 'EDR', description: 'Endpoint Detection & Response — Protection avancée des postes de travail', color: '#8B5CF6', icon: Laptop, productCount: 2, visible: true },
  { id: 'xdr', name: 'XDR', description: 'Extended Detection & Response — Vision unifiée et corrélation des menaces', color: '#10B981', icon: Globe, productCount: 2, visible: true },
];

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [editing, setEditing] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState('');

  const startEdit = (cat: Category) => {
    setEditing(cat.id);
    setEditDesc(cat.description);
  };

  const saveEdit = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, description: editDesc } : c))
    );
    setEditing(null);
  };

  const toggleVisible = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Catégories SaaS</h1>
          <p className="text-gray-400">Gestion des catégories de produits</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors opacity-50 cursor-not-allowed" disabled title="Bientôt disponible">
          <Plus className="w-5 h-5" />
          Nouvelle catégorie
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              className={`bg-gradient-to-br from-white/5 to-white/[0.02] border rounded-xl p-6 transition-all ${
                cat.visible ? 'border-white/10' : 'border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-start gap-6">
                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${cat.color}20`, border: `1px solid ${cat.color}40` }}
                >
                  <Icon className="w-8 h-8" style={{ color: cat.color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-white">{cat.name}</h3>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}40` }}
                    >
                      {cat.productCount} produit{cat.productCount > 1 ? 's' : ''}
                    </span>
                    {!cat.visible && (
                      <span className="px-3 py-1 bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 rounded-full text-xs font-semibold">
                        Masquée
                      </span>
                    )}
                  </div>

                  {editing === cat.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] resize-none text-sm"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => saveEdit(cat.id)}
                          className="px-5 py-2 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors text-sm"
                        >
                          Enregistrer
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="px-5 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/10 transition-colors text-sm"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm leading-relaxed">{cat.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => startEdit(cat)}
                    className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-[#00B4D8]/20 hover:border-[#00B4D8]/40 transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-gray-300" />
                  </button>
                  <button
                    onClick={() => toggleVisible(cat.id)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors border text-xs font-bold ${
                      cat.visible
                        ? 'bg-[#10B981]/10 border-[#10B981]/30 hover:bg-[#10B981]/20 text-[#10B981]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400'
                    }`}
                    title={cat.visible ? 'Masquer' : 'Afficher'}
                  >
                    {cat.visible ? '👁' : '🚫'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
