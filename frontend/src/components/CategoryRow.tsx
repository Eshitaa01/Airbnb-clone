"use client";

import {
  Home, Building2, Warehouse, TreePine, Mountain, Waves, Castle, Tent, Sailboat, Building,
} from "lucide-react";

export const CATEGORIES: { label: string; value: string; icon: React.ElementType }[] = [
  { label: "Apartments", value: "Apartment", icon: Building2 },
  { label: "Houses", value: "House", icon: Home },
  { label: "Villas", value: "Villa", icon: Castle },
  { label: "Lofts", value: "Loft", icon: Warehouse },
  { label: "Cabins", value: "Cabin", icon: TreePine },
  { label: "Chalets", value: "Chalet", icon: Mountain },
  { label: "Beachfront", value: "Bungalow", icon: Waves },
  { label: "Houseboats", value: "Houseboat", icon: Sailboat },
  { label: "Domes", value: "Dome", icon: Tent },
  { label: "Penthouses", value: "Penthouse", icon: Building },
];

export default function CategoryRow({
  active,
  onChange,
}: {
  active: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-4 border-b border-line">
      {CATEGORIES.map((c) => {
        const Icon = c.icon;
        const isActive = active === c.value;
        return (
          <button
            key={c.value}
            onClick={() => onChange(isActive ? null : c.value)}
            className={`flex flex-col items-center gap-1.5 shrink-0 pb-2 border-b-2 transition-colors ${
              isActive ? "border-ink text-ink" : "border-transparent text-hint hover:text-ink hover:border-hint"
            }`}
          >
            <Icon size={20} strokeWidth={1.5} />
            <span className="text-xs font-medium whitespace-nowrap">{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}
