import { useState, useEffect, useRef } from 'react';

// Custom hook for mouse position
const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const update = ev => setMousePosition({ x: ev.clientX, y: ev.clientY });
    window.addEventListener('mousemove', update);
    return () => window.removeEventListener('mousemove', update);
  }, []);
  return mousePosition;
};

// Intersection observer hook
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsIntersecting(true); observer.unobserve(entry.target); }
    }, { threshold: 0.1, ...options });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, isIntersecting];
};

const lerp = (start, end, factor) => start + (end - start) * factor;
// Custom cursor component
const CustomCursor = () => {
  const mouse = useMousePosition();
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseOver = (e) => {
      if (e.target.tagName.toLowerCase() === 'a' || e.target.tagName.toLowerCase() === 'button' ||
          e.target.closest('button') || e.target.closest('a')) {
        setIsHovering(true);
      } else { setIsHovering(false); }
    };
    window.addEventListener('mouseover', handleMouseOver);
    return () => window.removeEventListener('mouseover', handleMouseOver);
  }, []);

  useEffect(() => {
    if (dotRef.current && ringRef.current) {
      dotRef.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
      const ringX = parseFloat(ringRef.current.getAttribute('data-x')) || mouse.x;
      const ringY = parseFloat(ringRef.current.getAttribute('data-y')) || mouse.y;
      const nextX = lerp(ringX, mouse.x - 16, 0.15);
      const nextY = lerp(ringY, mouse.y - 16, 0.15);
      ringRef.current.setAttribute('data-x', nextX);
      ringRef.current.setAttribute('data-y', nextY);
      ringRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0) scale(${isHovering ? 1.5 : 1})`;
      ringRef.current.style.borderColor = isHovering ? '#E8342E' : 'rgba(255,255,255,0.2)';
      ringRef.current.style.background = isHovering ? 'rgba(232, 52, 46, 0.1)' : 'transparent';
    }
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden mix-blend-difference">
      <div ref={dotRef} className="absolute top-0 left-0 w-2 h-2 bg-white rounded-full -ml-1 -mt-1 transition-transform duration-75" />
      <div ref={ringRef} className="absolute top-0 left-0 w-8 h-8 border border-white/20 rounded-full transition-all duration-300 ease-out" />
    </div>
  );
};
// Typewriter placeholder
const TypewriterPlaceholder = ({ text }) => {
  const [placeholder, setPlaceholder] = useState('');
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setPlaceholder(text.slice(0, i));
      i++;
      if (i > text.length) i = 0;
    }, 150);
    return () => clearInterval(interval);
  }, [text]);
  return placeholder;
};

// Ambient background
const AmbientBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" style={{background:'rgba(232,52,46,0.10)'}} />
    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] mix-blend-screen animate-pulse-slow" style={{background:'rgba(43,127,212,0.10)',animationDelay:'2s'}} />
    <div className="absolute inset-0 opacity-20" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)',backgroundSize:'4rem 4rem',WebkitMaskImage:'radial-gradient(ellipse 60% 50% at 50% 50%,#000 70%,transparent 100%)'}} />
  </div>
);
// Interactive rain canvas
const InteractiveRain = () => {
  const canvasRef = useRef(null);
  const mouse = useMousePosition();
  const mouseRef = useRef(mouse);
  useEffect(() => { mouseRef.current = mouse; }, [mouse]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    resize();
    const drops = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      length: Math.random() * 20 + 10,
      speed: Math.random() * 8 + 4,
      opacity: Math.random() * 0.15 + 0.05,
      color: Math.random() > 0.5 ? '#2B7FD4' : '#E8342E'
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      drops.forEach(drop => {
        const dx = mx - drop.x;
        const dy = my - drop.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          drop.x -= (dx / dist) * force * 5;
        }
        drop.x += Math.sin(drop.y * 0.01) * 0.5;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + 1, drop.y + drop.length);
        const grad = ctx.createLinearGradient(drop.x, drop.y, drop.x, drop.y + drop.length);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, drop.color);
        ctx.strokeStyle = grad;
        ctx.globalAlpha = drop.opacity;
        ctx.lineWidth = 1;
        ctx.stroke();
        drop.y += drop.speed;
        if (drop.y > canvas.height) { drop.y = -drop.length; drop.x = Math.random() * canvas.width; }
      });
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1] opacity-60" />;
};
// FadeUp animation wrapper
const FadeUp = ({ children, delay = 0, className = '' }) => {
  const [ref, isVisible] = useIntersectionObserver();
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// Scramble text effect
const ScrambleText = ({ text, delay = 0, className = '' }) => {
  const [displayText, setDisplayText] = useState(text);
  const [ref, isVisible] = useIntersectionObserver();
  const chars = '!<>-_\\/[]{}—=+*^?#________';
  useEffect(() => {
    if (!isVisible) return;
    let iteration = 0;
    let timeoutId;
    const scramble = () => {
      setDisplayText(text.split('').map((letter, index) => {
        if (index < iteration) return text[index];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(''));
      if (iteration >= text.length) { setDisplayText(text); return; }
      iteration += 1 / 3;
      timeoutId = setTimeout(scramble, 30);
    };
    const initialDelay = setTimeout(scramble, delay);
    return () => { clearTimeout(initialDelay); clearTimeout(timeoutId); };
  }, [isVisible, text, delay]);
  return <span ref={ref} className={className}>{displayText}</span>;
};

// Magnetic button wrapper
const MagneticButton = ({ children, className = '', onClick }) => {
  const btnRef = useRef(null);
  const handleMouseMove = (e) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btnRef.current.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  };
  const handleMouseLeave = () => {
    if (!btnRef.current) return;
    btnRef.current.style.transform = 'translate(0px, 0px)';
  };
  return (
    <div ref={btnRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      className={`relative transition-transform duration-300 ease-out hover:duration-75 ${className}`}>
      {children}
    </div>
  );
};
// Number counter animation
const NumberCounter = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [ref, isVisible] = useIntersectionObserver();
  useEffect(() => {
    if (!isVisible) return;
    let startTime;
    const animateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percent = Math.min(progress / duration, 1);
      const ease = percent === 1 ? 1 : 1 - Math.pow(2, -10 * percent);
      const isFloat = target.toString().includes('.');
      const currentVal = isFloat ? (target * ease).toFixed(1) : Math.floor(target * ease);
      setCount(currentVal);
      if (progress < duration) { requestAnimationFrame(animateCount); } else { setCount(target); }
    };
    requestAnimationFrame(animateCount);
  }, [isVisible, target, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
};

// Pill icon SVG
const PillIcon = ({ size = 28, animated = false }) => (
  <svg width={size} height={size * 0.48} viewBox="0 0 100 48" className={`overflow-visible ${animated ? 'animate-pulse' : ''}`}>
    <rect x="2" y="4" width="96" height="40" rx="20" fill="none" stroke="rgba(232,52,46,0.6)" strokeWidth="2.5" style={{filter:'drop-shadow(0 0 8px rgba(232,52,46,0.5))'}}/>
    <rect x="14" y="14" width="20" height="20" rx="10" fill="#E8342E" />
    <rect x="40" y="14" width="20" height="20" rx="10" fill="#E8342E" />
    <rect x="66" y="14" width="20" height="20" rx="10" fill="#2B7FD4" />
  </svg>
);
// Tilt hero pill with 3D effect
const TiltHeroPill = () => {
  const containerRef = useRef(null);
  const innerRef = useRef(null);
  const mouse = useMousePosition();

  useEffect(() => {
    if (!containerRef.current || !innerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dist = Math.sqrt(Math.pow(mouse.x - centerX, 2) + Math.pow(mouse.y - centerY, 2));
    if (dist < 600) {
      const x = (mouse.x - centerX) / (rect.width / 2);
      const y = (mouse.y - centerY) / (rect.height / 2);
      innerRef.current.style.transform = `perspective(1000px) rotateY(${x * 15}deg) rotateX(${-y * 15}deg) translateZ(20px)`;
    } else {
      innerRef.current.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
    }
  }, [mouse]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center p-20">
      <div ref={innerRef} className="relative transition-transform duration-300 ease-out will-change-transform z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] rounded-[100px] border border-blue-500/20 bg-blue-500/5 blur-xl -z-20 animate-spin" style={{animationDuration:'8s'}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[175px] rounded-[100px] border border-red-500/30 -z-10 transform -rotate-6 animate-pulse" />
        <svg width="300" height="144" viewBox="0 0 100 48" style={{filter:'drop-shadow(0 20px 40px rgba(0,0,0,0.8))'}}>
          <defs>
            <linearGradient id="gradRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff5e57" />
              <stop offset="100%" stopColor="#8B1A15" />
            </linearGradient>
            <linearGradient id="gradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5CB8FF" />
              <stop offset="100%" stopColor="#0F3A6B" />
            </linearGradient>
          </defs>
          <rect x="2" y="4" width="96" height="40" rx="20" fill="rgba(26,26,36,0.6)" stroke="url(#gradRed)" strokeWidth="1"/>
          <g style={{filter:'drop-shadow(0 0 8px rgba(232,52,46,0.8))'}}>
            <rect x="14" y="14" width="20" height="20" rx="10" fill="url(#gradRed)" />
            <text x="24" y="27" fill="#fff" fontFamily="Space Grotesk, sans-serif" fontSize="11" fontWeight="700" textAnchor="middle">A</text>
          </g>
          <g style={{filter:'drop-shadow(0 0 8px rgba(232,52,46,0.8))'}}>
            <rect x="40" y="14" width="20" height="20" rx="10" fill="url(#gradRed)" />
            <text x="50" y="27" fill="#fff" fontFamily="Space Grotesk, sans-serif" fontSize="11" fontWeight="700" textAnchor="middle">G</text>
          </g>
          <g style={{filter:'drop-shadow(0 0 8px rgba(43,127,212,0.8))'}}>
            <rect x="66" y="14" width="20" height="20" rx="10" fill="url(#gradBlue)" />
            <text x="76" y="27" fill="#fff" fontFamily="Space Grotesk, sans-serif" fontSize="11" fontWeight="700" textAnchor="middle">I</text>
          </g>
        </svg>
        {Array.from({length: 4}).map((_, i) => (
          <div key={i} className={`absolute w-4 h-4 ${
            i===0?'-top-4 -left-4 border-t-2 border-l-2 border-red-500/60':
            i===1?'-top-4 -right-4 border-t-2 border-r-2 border-red-500/60':
            i===2?'-bottom-4 -left-4 border-b-2 border-l-2 border-blue-500/60':
            '-bottom-4 -right-4 border-b-2 border-r-2 border-blue-500/60'
          }`} />
        ))}
      </div>
    </div>
  );
};
// Terminal component
const Terminal = () => {
  const [lines, setLines] = useState([]);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5 });
  const sequence = [
    { text: '$ agi status', color: 'text-zinc-500', delay: 500 },
    { text: '> Companion active. Ambient mode: ON', color: 'text-blue-400', delay: 800 },
    { text: '> Neural mesh: 12 services connected', color: 'text-blue-400', delay: 200 },
    { text: '$ agi predict --context=today', color: 'text-zinc-500', delay: 1000 },
    { text: '! Alert: Gap identified at 14:00. Optimal for physical training.', color: 'text-red-400', delay: 800 },
    { text: '> Action taken: Dinner reservation moved indoors.', color: 'text-green-400', delay: 600 },
    { text: '$ agi mesh --visualize', color: 'text-zinc-500', delay: 1200 },
  ];
  useEffect(() => {
    if (!isVisible) return;
    let currentDelay = 0;
    let timeouts = [];
    sequence.forEach((line) => {
      currentDelay += line.delay;
      const timeout = setTimeout(() => { setLines(prev => [...prev, line]); }, currentDelay);
      timeouts.push(timeout);
    });
    return () => timeouts.forEach(clearTimeout);
  }, [isVisible]);

  return (
    <div ref={ref} className="rounded-xl overflow-hidden border" style={{background:'linear-gradient(145deg,rgba(30,30,35,0.4) 0%,rgba(10,10,12,0.8) 100%)',backdropFilter:'blur(20px)',borderColor:'#1f1f26',boxShadow:'0 0 40px rgba(43,127,212,0.1)'}}>
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{background:'#0a0a0c',borderColor:'#1f1f26'}}>
        <div className="w-3 h-3 rounded-full bg-red-500" style={{boxShadow:'0 0 8px #E8342E'}} />
        <div className="w-3 h-3 rounded-full" style={{background:'#f5a623'}} />
        <div className="w-3 h-3 rounded-full" style={{background:'#7ed321'}} />
        <span className="ml-4 font-mono text-[10px] text-zinc-500 tracking-[0.2em]">AGI_OS_KERNEL_V9.2.1</span>
      </div>
      <div className="p-6 font-mono text-sm leading-loose h-[360px] overflow-hidden relative" style={{background:'rgba(5,5,5,0.8)'}}>
        <div className="relative z-20 flex flex-col gap-1">
          {lines.map((line, i) => (
            <div key={i} className={`${line.color}`} style={{animation:'fadeIn 0.2s ease-out'}}>{line.text}</div>
          ))}
          {isVisible && (
            <div className="mt-2">
              <span className="inline-block w-2 h-4 bg-blue-400 align-middle ml-1" style={{animation:'blink 1s step-end infinite'}} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// Spotlight feature card
const SpotlightFeatureCard = ({ f }) => {
  const cardRef = useRef(null);
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };
  const colorHex = f.isRed ? '#E8342E' : '#2B7FD4';

  return (
    <div ref={cardRef} onMouseMove={handleMouseMove}
      className="rounded-2xl p-8 relative overflow-hidden group border transition-all duration-500 hover:border-white/20"
      style={{background:'rgba(17,17,21,0.6)',backdropFilter:'blur(12px)',borderColor:'#1f1f26'}}
    >
      <div className={`absolute -inset-1 rounded-2xl blur-2xl opacity-0 group-hover:opacity-10 transition duration-500`} style={{background:colorHex}} />
      <div className="absolute left-0 top-0 bottom-0 w-[2px] opacity-40 group-hover:opacity-100 transition-opacity duration-500" style={{background:colorHex,boxShadow:`0 0 10px ${colorHex}`}} />
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <span className="font-mono text-xs tracking-widest px-2 py-1 rounded border" style={{color:colorHex,background:'rgba(0,0,0,0.4)',borderColor:'rgba(255,255,255,0.05)'}}>{f.tag}</span>
          <h3 className="font-sans text-2xl font-bold text-zinc-100 group-hover:text-white transition-colors">{f.title}</h3>
        </div>
        <p className="font-mono text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-300 transition-colors">{f.desc}</p>
      </div>
    </div>
  );
};

const FEATURES = [
  { tag: '01', title: 'Psychic Sync', desc: 'Learns your patterns before you notice them yourself. Not prediction — premonition. AGI Labs adapts in real-time.', isRed: true },
  { tag: '02', title: 'Night Vision', desc: "Works when you can't. Monitors, organizes, prepares — while you sleep, AGI doesn't.", isRed: true },
  { tag: '03', title: 'Neural Mesh', desc: 'Connects your apps, your data, your life into one coherent intelligence layer. One mind, infinite reach.', isRed: false },
  { tag: '04', title: 'Zero Trace', desc: 'End-to-end encrypted. On-device processing. Your thoughts stay yours. Period. No cloud. No leaks.', isRed: false },
];
// Main landing page component
export default function AGILabsLanding() {
  const [joined, setJoined] = useState(false);
  const [email, setEmail] = useState('');
  const [typedPlaceholder, setTypedPlaceholder] = useState('');

  useEffect(() => {
    const text = 'Enter your commlink ID...';
    let i = 0;
    const interval = setInterval(() => {
      setTypedPlaceholder(text.slice(0, i));
      i++;
      if (i > text.length) i = 0;
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen text-zinc-100 font-sans overflow-x-hidden pb-20" style={{background:'#050505',cursor:'none'}}>
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.035]" style={{backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}} />
      <CustomCursor />
      <AmbientBackground />
      <InteractiveRain />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5" style={{background:'rgba(17,17,21,0.6)',backdropFilter:'blur(12px)'}}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <PillIcon size={36} animated={true} />
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight group-hover:text-white transition-colors">AGI</span>
              <span className="font-mono text-[9px] tracking-[0.3em] font-bold" style={{color:'#E8342E'}}>LABS</span>
            </div>
          </a>
          <div className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-widest text-zinc-500">
            <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#terminal" className="hover:text-white transition-colors">Terminal</a>
            <a href="#protocol" className="hover:text-white transition-colors">Protocol</a>
            <div className="w-[1px] h-4 bg-zinc-800" />
            <MagneticButton>
              <button className="font-mono text-green-400 tracking-widest flex items-center p-2 border-none bg-transparent hover:bg-green-400 hover:text-black transition-all duration-200">
                &gt; REQUEST_ACCESS_ <span className="inline-block w-2 h-4 bg-green-400 align-middle ml-1" style={{animation:'blink 1s step-end infinite'}} />
              </button>
            </MagneticButton>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32">
        {/* Hero section */}
        <section className="min-h-[90vh] flex items-center max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
            <div className="space-y-8">
              <FadeUp delay={100}>
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border font-mono text-[10px] uppercase tracking-widest" style={{borderColor:'rgba(232,52,46,0.3)',background:'rgba(232,52,46,0.05)',color:'#E8342E',boxShadow:'0 0 15px rgba(232,52,46,0.15)'}}>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  Recruiting Test Pilots
                </div>
              </FadeUp>
              <FadeUp delay={200}>
                <h1 className="text-6xl lg:text-8xl font-bold leading-[0.9] tracking-tighter" style={{fontFamily:"'Space Grotesk', sans-serif"}}>
                  <ScrambleText text="YOUR" delay={500} /><br />
                  <ScrambleText text="INTELLIGENCE," delay={800} /><br />
                  <span style={{background:'linear-gradient(to right,#E8342E,#ff7e67)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',filter:'drop-shadow(0 0 20px rgba(232,52,46,0.3))'}}>
                    <ScrambleText text="AMPLIFIED." delay={1100} />
                  </span>
                </h1>
              </FadeUp>
              <FadeUp delay={400}>
                <p className="font-mono text-sm lg:text-base leading-relaxed text-zinc-500 max-w-md">
                  AGI Labs builds AI companions that don't wait for commands — they anticipate.
                  Born from the streets of Neo-Tokyo. Forged for the ones who move fast.
                </p>
              </FadeUp>
              <FadeUp delay={600}>
                {!joined ? (
                  <div className="flex max-w-md">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={typedPlaceholder}
                      className="w-full border-r-0 px-6 py-4 font-mono text-sm text-white focus:outline-none transition-colors"
                      style={{background:'#0a0a0c',border:'1px solid #1f1f26',borderRight:'none'}}
                    />
                    <button
                      onClick={() => email && setJoined(true)}
                      className="px-8 font-mono text-sm font-bold uppercase tracking-widest min-w-[180px] transition-all duration-200 hover:bg-red-600 hover:text-black"
                      style={{background:'transparent',border:'1px solid #E8342E',color:'#E8342E'}}
                    >
                      &gt; EXEC INIT --pilot
                    </button>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-4 px-6 py-4 rounded" style={{border:'1px solid rgba(43,127,212,0.4)',background:'rgba(43,127,212,0.1)',color:'#2B7FD4',boxShadow:'0 0 20px rgba(43,127,212,0.2)'}}>
                    <span className="font-bold animate-pulse" style={{fontFamily:"'Space Grotesk',sans-serif"}}>/_</span>
                    <span className="font-mono text-sm">Coordinates received. Stand by.</span>
                  </div>
                )}
              </FadeUp>
            </div>
            <FadeUp delay={800} className="h-[500px] lg:h-[700px]">
              <TiltHeroPill />
            </FadeUp>
          </div>
        </section>

        {/* Stats bar */}
        <FadeUp>
          <div className="max-w-7xl mx-auto px-6 border-y" style={{borderColor:'#1f1f26',background:'rgba(17,17,21,0.3)',backdropFilter:'blur(12px)'}}>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0" style={{borderColor:'#1f1f26'}}>
              {[
                { val: 0.3, suffix: 's', label: 'Response Latency', color: '#E8342E' },
                { val: 256, suffix: '-bit', label: 'Quantum Encryption', color: '#ffffff' },
                { val: 99.9, suffix: '%', label: 'Uptime Reliability', color: '#2B7FD4' },
                { val: 100, suffix: '%', label: 'Local Processing', color: '#ffffff' },
              ].map((s, i) => (
                <div key={i} className="p-8 text-center group hover:bg-white/[0.02] transition-colors">
                  <div className="text-4xl lg:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform" style={{color:s.color,fontFamily:"'Space Grotesk',sans-serif",filter:'drop-shadow(0 0 10px currentColor)'}}>
                    <NumberCounter target={s.val} suffix={s.suffix} />
                  </div>
                  <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* Features section */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-32">
          <FadeUp className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] w-12" style={{background:'#E8342E'}} />
              <span className="font-mono text-xs uppercase tracking-[0.3em]" style={{color:'#E8342E'}}>Capabilities</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-bold tracking-tight" style={{fontFamily:"'Space Grotesk',sans-serif"}}>
              Built different.<br />
              <span className="text-zinc-500">Runs <ScrambleText text="different." delay={300} /></span>
            </h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <FadeUp key={i} delay={i * 150}>
                <SpotlightFeatureCard f={f} />
              </FadeUp>
            ))}
          </div>
        </section>

        {/* Terminal section */}
        <section id="terminal" className="max-w-5xl mx-auto px-6 py-32">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/3 w-full">
              <FadeUp>
                <h2 className="text-4xl font-bold mb-6" style={{fontFamily:"'Space Grotesk',sans-serif"}}>Total visibility. <br/><span style={{color:'#2B7FD4'}}>Zero abstraction.</span></h2>
                <p className="font-mono text-sm text-zinc-500 leading-relaxed mb-8">
                  For those who demand control. AGI Labs provides a raw terminal interface to monitor the neural mesh in real-time.
                </p>
                <button className="font-mono text-xs uppercase tracking-widest p-3 transition-all duration-200 hover:bg-green-400 hover:text-black"
                  style={{background:'transparent',border:'1px solid #4ade80',color:'#4ade80'}}>
                  &gt; VIEW DOCS --mesh
                </button>
              </FadeUp>
            </div>
            <div className="lg:w-2/3 w-full relative">
              <div className="absolute -inset-4 blur-2xl opacity-50 -z-10 animate-pulse" style={{background:'linear-gradient(to right,rgba(43,127,212,0.2),rgba(147,51,234,0.2))'}} />
              <FadeUp delay={200}>
                <Terminal />
              </FadeUp>
            </div>
          </div>
        </section>

        {/* Protocol section */}
        <section id="protocol" className="max-w-7xl mx-auto px-6 py-32">
          <FadeUp className="mb-20 text-center">
            <span className="font-mono text-xs uppercase tracking-[0.3em] block mb-4" style={{color:'#2B7FD4'}}>Core Protocol</span>
            <h2 className="text-5xl lg:text-6xl font-bold" style={{fontFamily:"'Space Grotesk',sans-serif"}}>Three pills. One mind.</h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { pill: 'A', isRed: true, title: 'Absorb', desc: 'Ingests your digital life patterns.', delay: 0 },
              { pill: 'G', isRed: true, title: 'Generate', desc: 'Builds a living real-time model.', delay: 200 },
              { pill: 'I', isRed: false, title: 'Intervene', desc: 'Acts when the moment is right.', delay: 400 },
            ].map((step, i) => (
              <FadeUp key={i} delay={step.delay}>
                <div className="p-8 border-l-4 transition-all" style={{
                  background:'linear-gradient(145deg,rgba(30,30,35,0.4) 0%,rgba(10,10,12,0.8) 100%)',
                  backdropFilter:'blur(20px)',
                  border:'1px solid #1f1f26',
                  borderLeft:`4px solid ${step.isRed ? '#E8342E' : '#2B7FD4'}`
                }}>
                  <div className="w-12 h-12 flex items-center justify-center mb-8" style={{border:'1px solid rgba(255,255,255,0.1)',background:'#050505'}}>
                    <span className="text-2xl font-bold" style={{fontFamily:"'Space Grotesk',sans-serif",color:step.isRed?'#E8342E':'#2B7FD4'}}>{step.pill}</span>
                  </div>
                  <div className="font-mono text-[10px] text-zinc-600 tracking-widest mb-3">PHASE 0{i+1}</div>
                  <h3 className="text-2xl font-bold mb-4" style={{fontFamily:"'Space Grotesk',sans-serif"}}>{step.title}</h3>
                  <p className="font-mono text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* CTA section */}
        <section className="py-32 relative border-t overflow-hidden" style={{borderColor:'#1f1f26'}}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <FadeUp>
              <div className="flex justify-center mb-10">
                <PillIcon size={80} animated={true} />
              </div>
              <h2 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6" style={{fontFamily:"'Space Grotesk',sans-serif"}}>
                The future doesn't wait.
              </h2>
              <p className="font-mono text-lg text-zinc-500 mb-12">Neither should you.</p>
              <MagneticButton className="inline-block">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-12 py-5 font-mono font-bold text-xl uppercase tracking-tighter transition-all duration-200 hover:bg-green-400 hover:text-black"
                  style={{background:'transparent',border:'1px solid #4ade80',color:'#4ade80'}}
                >
                  &gt; RUN sequence.agi
                </button>
              </MagneticButton>
            </FadeUp>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t" style={{borderColor:'rgba(255,255,255,0.05)',background:'#050505'}}>
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <PillIcon size={20} />
            <span className="font-mono text-[10px] text-zinc-500 tracking-[0.2em] uppercase">AGI LABS / 2026 / NEO-TOKYO</span>
          </div>
          <div className="flex gap-8 font-mono text-[10px] uppercase tracking-widest">
            {['Manifesto', 'Privacy', 'Terms', 'Status'].map(l => (
              <a key={l} href="#" className="text-zinc-500 hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        * { cursor: none !important; }
      `}</style>
    </div>
  );
}
