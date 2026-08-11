import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Hero3DProps {
  onAssess: () => void;
}

/**
 * Hero3D — Shahrokh next structure
 * Minimal, elegant, not verbose. Inspired by Claw3D but subtle.
 * Shows Bosporus bridge + floating home (next structure) with soft depth.
 */
const Hero3D: React.FC<Hero3DProps> = ({ onAssess }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0f172a, 6, 18);

    const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 1.2, 5.5);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    const dir = new THREE.DirectionalLight(0x38bdf8, 0.9);
    dir.position.set(4, 8, 6);
    scene.add(ambient, dir);

    // Next structure — minimal house + bridge
    const group = new THREE.Group();
    
    // House (next home in Istanbul) — simple, elegant
    const houseBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.9, 1.0),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 })
    );
    houseBase.position.set(0, 0.45, 0);
    group.add(houseBase);
    
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(0.85, 0.6, 4),
      new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.5 })
    );
    roof.position.set(0, 1.2, 0);
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    // Door
    const door = new THREE.Mesh(
      new THREE.PlaneGeometry(0.25, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    door.position.set(0, 0.3, 0.51);
    group.add(door);

    // Soft bridge hint behind
    const bridge = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 0.06, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, transparent: true, opacity: 0.6 })
    );
    bridge.position.set(0, -0.3, -0.8);
    group.add(bridge);

    scene.add(group);

    // Particles — very subtle, not too many
    const pGeo = new THREE.BufferGeometry();
    const pCount = 300;
    const pos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pos[i*3] = (Math.random()-0.5)*14;
      pos[i*3+1] = Math.random()*4;
      pos[i*3+2] = (Math.random()-0.5)*8 -1;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x7dd3fc, size: 0.02, transparent: true, opacity: 0.4 });
    const pts = new THREE.Points(pGeo, pMat);
    scene.add(pts);

    let raf = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      group.rotation.y = Math.sin(t*0.12)*0.12;
      group.position.y = Math.sin(t*0.5)*0.08;
      pts.rotation.y = t*0.01;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!canvas.parentElement) return;
      const w = canvas.parentElement.clientWidth;
      const h = canvas.parentElement.clientHeight;
      camera.aspect = w/h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener('resize', onResize);

    // Subtle scroll parallax only
    if (containerRef.current) {
      gsap.to(canvas, {
        scrollTrigger: { trigger: containerRef.current, start: 'top top', end: 'bottom top', scrub: 1 },
        y: 60,
        opacity: 0.5,
      });
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      ScrollTrigger.getAll().forEach(s=>s.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-[88vh] min-h-[520px] overflow-hidden bg-gray-950">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ width: '100%', height: '100%' }} />
      <video
        autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-soft-light"
        poster="https://images.unsplash.com/photo-1527838832700-5059252407fa?q=80&w=2000&auto=format&fit=crop"
        src="https://videos.pexels.com/video-files/4490158/4490158-uhd_2560_1440_30fps.mp4"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-gray-900/30 to-gray-900" />
      
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 text-white px-3 py-1 rounded-full text-xs mb-5">
          گروه مهاجرتی شاهرخ — ایران → استانبول
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          مسیر مهاجرتی‌ات<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">در استانبول</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-300 max-w-xl">
          اقامت قانونی — از ارزیابی تا کیملیک، شفاف و سریع. تخصص شاهرخ: ایران → ترکیه.
        </p>
        <div className="mt-7 flex gap-3">
          <button onClick={onAssess} className="px-7 py-3 bg-white text-gray-900 font-bold rounded-full shadow-lg hover:bg-gray-100 transition">
            ارزیابی رایگان
          </button>
          <a href="#services" className="px-7 py-3 bg-white/10 backdrop-blur border border-white/20 text-white font-semibold rounded-full hover:bg-white/15 transition">
            دیدن مسیرها
          </a>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
    </div>
  );
};

export default Hero3D;
