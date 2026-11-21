'use client';
// PROTOTYPE (issue #9, round 2), direction D. A ring of real Housecut Cuts in three.js.
// Scroll drives the ring's rotation and the camera; the front Cut's name is reported up.

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CUTS } from '../_shared/housecutMedia';

export interface CylinderHandle { setProgress: (p: number) => void }

export default function HousecutCylinder({ onFront, handleRef }: { onFront: (i: number) => void; handleRef: React.MutableRefObject<CylinderHandle | null> }) {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mount.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    const ring = new THREE.Group();
    scene.add(ring);

    const N = CUTS.length;
    const R = 3.1;
    const W = 1.08, H = 1.92;
    const videos: HTMLVideoElement[] = [];
    const geo = new THREE.PlaneGeometry(W, H);
    // Rounded corners through an alpha map drawn once on a canvas.
    const c = document.createElement('canvas'); c.width = 108; c.height = 192;
    const g = c.getContext('2d')!; g.fillStyle = '#000'; g.fillRect(0, 0, 108, 192); g.fillStyle = '#fff';
    g.beginPath(); g.roundRect(0, 0, 108, 192, 9); g.fill();
    const alpha = new THREE.CanvasTexture(c);

    CUTS.forEach((cut, i) => {
      const v = document.createElement('video');
      Object.assign(v, { src: cut.src, muted: true, loop: true, playsInline: true, autoplay: true, crossOrigin: 'anonymous', poster: cut.poster });
      v.play().catch(() => {});
      videos.push(v);
      const tex = new THREE.VideoTexture(v);
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshBasicMaterial({ map: tex, alphaMap: alpha, transparent: true, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat);
      const a = (i / N) * Math.PI * 2;
      mesh.position.set(Math.sin(a) * R, 0, Math.cos(a) * R);
      mesh.rotation.y = a;
      ring.add(mesh);
      // A faint reflection on the "floor".
      const ref = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, alphaMap: alpha, transparent: true, opacity: 0.14, side: THREE.DoubleSide }));
      ref.position.set(mesh.position.x, -H - 0.06, mesh.position.z);
      ref.rotation.y = a; ref.scale.y = -1;
      ring.add(ref);
    });

    let progress = 0;
    let shown = -1;
    handleRef.current = { setProgress: (p) => { progress = p; } };

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(el);

    let raf = 0; let rot = 0;
    const tick = (t: number) => {
      // Ease toward the scroll target so the ring has weight.
      const target = -progress * Math.PI * 2 * 0.875;
      rot += (target - rot) * 0.08;
      ring.rotation.y = rot + Math.sin(t / 3000) * 0.02;
      const narrow = el.clientWidth < 700;
      const dist = (narrow ? 11.5 : 9.2) - progress * 2.2;
      camera.position.set(Math.sin(t / 5000) * 0.25, 0.55 + progress * 0.3, dist);
      camera.lookAt(0, -0.15, 0);
      renderer.render(scene, camera);
      const front = ((Math.round((-rot / (Math.PI * 2)) * N) % N) + N) % N;
      if (front !== shown) { shown = front; onFront(front); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      videos.forEach((v) => { v.pause(); v.src = ''; });
      renderer.dispose(); el.removeChild(renderer.domElement);
      handleRef.current = null;
    };
  }, [onFront, handleRef]);

  return <div ref={mount} style={{ position: 'absolute', inset: 0 }} aria-label="Eight real Housecut listing videos on a rotating ring" role="img" />;
}
