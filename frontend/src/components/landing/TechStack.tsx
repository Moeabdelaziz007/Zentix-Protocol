import { GlassCard } from './GlassCard';

const technologies = [
  { name: 'React 19', category: 'Frontend', color: '#00D9FF' },
  { name: 'TypeScript', category: 'Language', color: '#B47EFF' },
  { name: 'Tailwind v4', category: 'Styling', color: '#10B981' },
  { name: 'Shadcn UI', category: 'Components', color: '#00D9FF' },
  { name: 'Three.js', category: '3D Graphics', color: '#B47EFF' },
  { name: 'Recharts', category: 'Visualization', color: '#10B981' },
  { name: 'Blockchain', category: 'Infrastructure', color: '#00D9FF' },
];

export function TechStack() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Technology <span className="bg-gradient-to-r from-[#00D9FF] to-[#B47EFF] bg-clip-text text-transparent">Stack</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Built with cutting-edge technologies for maximum performance
          </p>
        </div>

        {/* Asymmetric Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {technologies.map((tech, index) => (
            <GlassCard
              key={tech.name}
              hover={true}
              className={`group ${index === 0 ? 'md:col-span-2' : ''} ${index === technologies.length - 1 ? 'lg:col-span-2' : ''}`}
            >
              <div className="flex flex-col items-center text-center">
                <div 
                  className="text-4xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${tech.color}, ${tech.color}80)`,
                  }}
                >
                  {tech.name}
                </div>
                <div className="text-sm text-gray-400">{tech.category}</div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}