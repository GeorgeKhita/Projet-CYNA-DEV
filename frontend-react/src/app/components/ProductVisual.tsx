import { Shield, Laptop, Globe } from 'lucide-react';

const ICONS: Record<string, any> = { SOC: Shield, EDR: Laptop, XDR: Globe };

interface Props {
  category: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProductVisual({ category, color, size = 'md' }: Props) {
  const Icon = ICONS[category] ?? Shield;

  const dims = {
    sm: { outer: 'w-16 h-16', icon: 'w-8 h-8' },
    md: { outer: 'w-28 h-28', icon: 'w-14 h-14' },
    lg: { outer: 'w-48 h-48', icon: 'w-24 h-24' },
  }[size];

  return (
    <div className="w-full h-full flex items-center justify-center"
      style={{ background: `radial-gradient(circle at 50% 40%, ${color}18, transparent 70%)` }}>
      <div className={`${dims.outer} rounded-2xl flex items-center justify-center shadow-lg`}
        style={{
          background: `linear-gradient(135deg, ${color}dd, ${color}88)`,
          boxShadow: `0 20px 40px -10px ${color}50`,
        }}>
        <Icon className={dims.icon} style={{ color: '#fff' }} />
      </div>
    </div>
  );
}
