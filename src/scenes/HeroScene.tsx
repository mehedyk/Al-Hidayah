import { useEffect, useRef, useState } from 'preact/hooks';
import { useApp } from '../lib/app-context';

export function HeroScene() {
  const host = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);
  const { settings } = useApp();

  useEffect(() => {
    const element = host.current;
    if (
      !element ||
      settings.reducedMotion ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      navigator.maxTouchPoints > 0 ||
      (navigator.hardwareConcurrency ?? 4) <= 4
    )
      return;
    let frame = 0;
    let disposed = false;
    let cleanup = () => {};

    void import('three')
      .then((THREE) => {
        if (disposed || !host.current) return;
        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: 'low-power',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);
        host.current.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
        camera.position.z = 7;
        const group = new THREE.Group();
        const materials: InstanceType<typeof THREE.LineBasicMaterial>[] = [];
        const geometries: InstanceType<typeof THREE.BufferGeometry>[] = [];

        for (let layer = 0; layer < 3; layer += 1) {
          const points: InstanceType<typeof THREE.Vector3>[] = [];
          for (let index = 0; index < 16; index += 1) {
            const angle = (index / 16) * Math.PI * 2;
            const radius = index % 2 === 0 ? 2.1 : 0.9;
            points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
          }
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({
            color: 0xe2b857,
            transparent: true,
            opacity: 0.12 - layer * 0.025,
          });
          const line = new THREE.LineLoop(geometry, material);
          line.rotation.z = layer * 0.2;
          line.position.z = -layer * 0.5;
          group.add(line);
          geometries.push(geometry);
          materials.push(material);
        }

        group.position.x = 2.6;
        scene.add(group);
        let pointerX = 0;
        let pointerY = 0;
        const onPointer = (event: PointerEvent) => {
          pointerX = (event.clientX / window.innerWidth - 0.5) * 0.12;
          pointerY = (event.clientY / window.innerHeight - 0.5) * 0.08;
        };
        const resize = () => {
          const { clientWidth, clientHeight } = element;
          renderer.setSize(clientWidth, clientHeight, false);
          camera.aspect = clientWidth / Math.max(clientHeight, 1);
          camera.updateProjectionMatrix();
        };
        const animate = () => {
          group.rotation.z += 0.00035;
          group.rotation.y += (pointerX - group.rotation.y) * 0.02;
          group.rotation.x += (-pointerY - group.rotation.x) * 0.02;
          renderer.render(scene, camera);
          frame = requestAnimationFrame(animate);
        };
        window.addEventListener('pointermove', onPointer, { passive: true });
        window.addEventListener('resize', resize);
        resize();
        animate();
        cleanup = () => {
          window.removeEventListener('pointermove', onPointer);
          window.removeEventListener('resize', resize);
          geometries.forEach((geometry) => geometry.dispose());
          materials.forEach((material) => material.dispose());
          renderer.dispose();
          renderer.domElement.remove();
        };
      })
      .catch(() => {
        if (!disposed) setFallback(true);
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cleanup();
    };
  }, [settings.reducedMotion]);

  return <div class="hero-scene" ref={host} data-fallback={fallback} aria-hidden="true" />;
}
