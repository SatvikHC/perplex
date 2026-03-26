import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Fire particle class
class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = this.canvas.height + 10;
    this.size = Math.random() * 4 + 2;
    this.speedY = Math.random() * 3 + 2;
    this.speedX = (Math.random() - 0.5) * 2;
    this.life = 1;
    this.decay = Math.random() * 0.02 + 0.01;
    this.hue = Math.random() * 30 + 15; // Orange-ish hues
  }

  update() {
    this.y -= this.speedY;
    this.x += this.speedX;
    this.life -= this.decay;
    this.size *= 0.99;

    if (this.life <= 0 || this.y < -10) {
      this.reset();
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function FireParticles() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    particlesRef.current = [];
    for (let i = 0; i < 80; i++) {
      particlesRef.current.push(new Particle(canvas));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });

      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
    />
  );
}

// Animated counter
export function AnimatedCounter({ value, duration = 2000, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    const startValue = 0;
    const endValue = value;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(startValue + (endValue - startValue) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// Glitch text effect
export function GlitchText({ children, className = '' }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.span
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={isHovered ? 'glitch-text' : ''}>{children}</span>
    </motion.span>
  );
}

// Live ticker
export function LiveTicker({ items }) {
  return (
    <div className="ticker-wrapper bg-black/50 border-y border-white/10 py-3 overflow-hidden">
      <div className="ticker-content">
        {[...items, ...items].map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4 mx-8 whitespace-nowrap"
          >
            <span className="live-dot" />
            <span className="text-[#FF6B00] font-['Rajdhani'] font-bold">{item.title}</span>
            <span className="text-[#A1A1AA]">{item.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Countdown timer
export function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-4">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="text-center">
          <motion.div
            key={value}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl md:text-5xl font-['Rajdhani'] font-bold text-[#FF6B00]"
          >
            {String(value).padStart(2, '0')}
          </motion.div>
          <div className="text-xs uppercase tracking-wider text-[#A1A1AA]">{unit}</div>
        </div>
      ))}
    </div>
  );
}

// Loading spinner
export function LoadingSpinner({ size = 'md' }) {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className={`${sizes[size]} border-[#FF6B00] border-t-transparent rounded-full animate-spin`} />
  );
}

// Skeleton loader
export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded ${className}`} />;
}

// Page transition wrapper
export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// Modal - Centered + Draggable
export function Modal({ isOpen, onClose, title, children, maxWidth = '32rem' }) {
  const dragRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);

  // Reset position when modal opens
  useEffect(() => {
    if (isOpen) {
      setPos({ x: 0, y: 0 });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleMouseDown = (e) => {
    setDragging(true);
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  const handleMouseMove = (e) => {
    if (!dragging || !dragStart.current) return;
    setPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const handleMouseUp = () => { setDragging(false); dragStart.current = null; };

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    setDragging(true);
    dragStart.current = { x: t.clientX - pos.x, y: t.clientY - pos.y };
  };

  const handleTouchMove = (e) => {
    if (!dragging || !dragStart.current) return;
    const t = e.touches[0];
    setPos({ x: t.clientX - dragStart.current.x, y: t.clientY - dragStart.current.y });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[998]"
            onClick={onClose}
          />

          {/* Modal — perfectly centered, draggable */}
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            <motion.div
              ref={dragRef}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                maxWidth,
                width: '90vw',
                maxHeight: '88vh',
                cursor: dragging ? 'grabbing' : 'auto',
              }}
              className="pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="rounded-xl overflow-hidden shadow-2xl border border-white/10"
                style={{ background: '#181818', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
              >
                {/* Drag Handle Header */}
                {title && (
                  <div
                    className="px-6 py-4 border-b border-white/10 flex items-center justify-between flex-shrink-0"
                    style={{ cursor: 'grab', userSelect: 'none', background: '#1F1F1F' }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                  >
                    <h3 className="text-xl font-['Rajdhani'] font-bold text-white">{title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[#52525B] text-xs hidden sm:block">drag to move</span>
                      <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#A1A1AA] hover:text-white transition-colors text-lg leading-none"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto flex-1">
                  {children}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Badge component
export function Badge({ variant = 'default', children, className = '' }) {
  const variants = {
    default: 'bg-[#52525B]',
    primary: 'bg-[#FF6B00]',
    secondary: 'bg-[#FFD700] text-black',
    success: 'bg-green-500',
    danger: 'bg-[#FF1A1A]',
    warning: 'bg-yellow-500 text-black',
  };

  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}