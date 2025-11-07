export function FloatingOrbs() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Primary orb - Indigo */}
      <div 
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
        }}
      />
      
      {/* Secondary orb - Cyan */}
      <div 
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-20 animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, transparent 70%)',
          animationDelay: '2s',
        }}
      />
      
      {/* Tertiary orb - Purple */}
      <div 
        className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] rounded-full blur-3xl opacity-20 animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
          animationDelay: '4s',
        }}
      />
      
      {/* Accent orb - Pink */}
      <div 
        className="absolute bottom-1/3 right-1/3 w-[350px] h-[350px] rounded-full blur-3xl opacity-15 animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
          animationDelay: '6s',
        }}
      />
    </div>
  );
}