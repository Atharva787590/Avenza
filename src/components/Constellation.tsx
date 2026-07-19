"use client";

import React, { useEffect, useRef, useState } from "react";

interface Point3D {
  x: number;
  y: number;
  z: number;
  radius: number;
  isCity?: boolean;
  cityName?: string;
  builders?: number;
  projects?: number;
}

export function Constellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Interactive tooltips
  const [activeCity, setActiveCity] = useState<Point3D | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let points: Point3D[] = [];
    const sphereRadius = 160;
    const perspective = 300;
    
    // Rotation angles
    let angleX = 0.2;
    let angleY = 0;
    
    // Mouse drag state
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    // Check for prefers-reduced-motion
    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Define Indian Tech Hub nodes with custom coordinates on a sphere of radius 1
    // spherical coordinates: theta (longitude, -PI to PI), phi (latitude, -PI/2 to PI/2)
    const citiesData = [
      { name: "Bengaluru", theta: 0.1, phi: -0.4, builders: 184, projects: 42 },
      { name: "Mumbai", theta: -0.4, phi: -0.2, builders: 125, projects: 29 },
      { name: "Delhi NCR", theta: -0.2, phi: 0.3, builders: 142, projects: 31 },
      { name: "Hyderabad", theta: 0.05, phi: -0.15, builders: 98, projects: 22 },
      { name: "Pune", theta: -0.35, phi: -0.28, builders: 84, projects: 18 },
      { name: "Chennai", theta: 0.25, phi: -0.45, builders: 92, projects: 20 },
      { name: "Kolkata", theta: 0.6, phi: 0.05, builders: 76, projects: 15 }
    ];

    const resizeCanvas = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
        canvas.height = canvas.parentElement.clientHeight || 650;
      }
    };

    const initPoints = () => {
      points = [];
      
      // 1. Generate generic sphere background particles
      const particleCount = 180;
      for (let i = 0; i < particleCount; i++) {
        // Distribute uniformly on sphere surface (Archimedes' theorem)
        const z = (Math.random() * 2) - 1;
        const phi = Math.acos(z);
        const theta = Math.random() * 2 * Math.PI;

        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.sin(phi) * Math.sin(theta);

        points.push({
          x: x * sphereRadius,
          y: y * sphereRadius,
          z: z * sphereRadius,
          radius: Math.random() * 1.5 + 0.8
        });
      }

      // 2. Generate premium city nodes
      citiesData.forEach((city) => {
        // Convert spherical coordinates to Cartesian coordinates
        const x = Math.cos(city.phi) * Math.sin(city.theta);
        const y = Math.sin(city.phi);
        const z = Math.cos(city.phi) * Math.cos(city.theta);

        points.push({
          x: x * sphereRadius,
          y: y * sphereRadius,
          z: z * sphereRadius,
          radius: 4,
          isCity: true,
          cityName: city.name,
          builders: city.builders,
          projects: city.projects
        });
      });
    };

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Auto rotation if not dragging and motion is preferred
      if (!isDragging && !prefersReducedMotion) {
        angleY += 0.0025;
      }

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      // Render grid connections between neighboring background points (constellation effect)
      // Only project and connect points with positive Z coordinates (front-facing hemisphere) to look clean
      const projected: { sx: number; sy: number; sz: number; pt: Point3D }[] = [];

      points.forEach((pt) => {
        // Rotate around Y axis (horizontal)
        const x1 = pt.x * cosY - pt.z * sinY;
        const z1 = pt.x * sinY + pt.z * cosY;

        // Rotate around X axis (tilt)
        const y2 = pt.y * cosX - z1 * sinX;
        const z2 = pt.y * sinX + z1 * cosX;

        // Perspective projection
        const scale = perspective / (perspective + z2);
        const sx = centerX + x1 * scale;
        const sy = centerY + y2 * scale;

        projected.push({ sx, sy, sz: z2, pt });
      });

      // Sort projected points by depth so rear points are drawn behind front points
      projected.sort((a, b) => b.sz - a.sz);

      // Draw faint connections for front-facing hemisphere points to avoid visual clutter
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        if (p1.sz > 60) continue; // Skip rear points

        let connectionsCount = 0;
        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          if (p2.sz > 60) continue;

          const dx = p1.sx - p2.sx;
          const dy = p1.sy - p2.sy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 75) {
            connectionsCount++;
            const alpha = (1 - dist / 75) * 0.06;
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            ctx.strokeStyle = p1.pt.isCity || p2.pt.isCity 
              ? `rgba(102, 227, 196, ${alpha * 1.5})` 
              : `rgba(79, 93, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }

          if (connectionsCount > 3) break; // Limit density
        }
      }

      // Draw Point Nodes
      projected.forEach((p) => {
        const pt = p.pt;
        // Fade nodes based on depth (rear particles are dimmer)
        const depthAlpha = Math.max(0.1, 1 - (p.sz + sphereRadius) / (2 * sphereRadius));
        
        if (pt.isCity) {
          const isHovered = activeCity?.cityName === pt.cityName;
          
          // Draw outer pulse
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, pt.radius + (isHovered ? 6 : 3), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(102, 227, 196, ${0.15 * depthAlpha})`;
          ctx.fill();

          // Draw city center node
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, pt.radius, 0, Math.PI * 2);
          ctx.fillStyle = isHovered 
            ? "#FFFFFF" 
            : `rgba(102, 227, 196, ${0.85 * depthAlpha})`;
          ctx.fill();

          // Draw city name text
          ctx.font = "600 10px var(--font-sans), system-ui, sans-serif";
          ctx.fillStyle = isHovered 
            ? "#66E3C4" 
            : `rgba(246, 244, 249, ${0.6 * depthAlpha})`;
          ctx.textAlign = "center";
          ctx.fillText(pt.cityName || "", p.sx, p.sy - (pt.radius + 8));
        } else {
          // Draw background particle
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, pt.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(79, 93, 255, ${0.45 * depthAlpha})`;
          ctx.fill();
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    resizeCanvas();
    initPoints();
    window.addEventListener("resize", () => {
      resizeCanvas();
      initPoints();
    });

    draw();

    // Mouse drag handlers to rotate globe manually
    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        angleY += deltaX * 0.005;
        angleX += deltaY * 0.005;

        // Constraint tilt rotation to avoid upside-down projection bugs
        angleX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, angleX));

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }

      // Check for hover detection over city nodes
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      let foundHover: Point3D | null = null;

      for (const pt of points) {
        if (!pt.isCity) continue;

        // Recalculate Cartesian projection for this pt
        const x1 = pt.x * cosY - pt.z * sinY;
        const z1 = pt.x * sinY + pt.z * cosY;
        const y2 = pt.y * cosX - z1 * sinX;
        const z2 = pt.y * sinX + z1 * cosX;

        // Skip rear hemisphere check
        if (z2 > 40) continue;

        const scale = perspective / (perspective + z2);
        const sx = centerX + x1 * scale;
        const sy = centerY + y2 * scale;

        const dist = Math.sqrt((mouseX - sx) ** 2 + (mouseY - sy) ** 2);
        if (dist < 15) {
          foundHover = pt;
          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top - 70 });
          break;
        }
      }

      setActiveCity(foundHover);
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
      if (canvas) {
        canvas.removeEventListener("mousedown", handleMouseDown);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeCity]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-auto select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* 3D City Tooltip Container */}
      {activeCity && (
        <div
          className="absolute z-50 bg-deepslate/90 border border-mint/40 rounded-xl px-4 py-2 text-left pointer-events-none shadow-xl shadow-ink/80 backdrop-blur-md transition-all duration-100 flex flex-col gap-0.5"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: "translateX(-50%)",
            width: "180px",
          }}
        >
          <div className="text-xs font-bold text-white tracking-wide border-b border-border/40 pb-1 mb-1 flex items-center justify-between">
            <span>{activeCity.cityName} Hub</span>
            <span className="h-2 w-2 rounded-full bg-mint animate-pulse" />
          </div>
          <div className="text-[11px] text-muted-foreground flex justify-between">
            <span>Active Builders:</span>
            <span className="text-mint font-semibold">{activeCity.builders}</span>
          </div>
          <div className="text-[11px] text-muted-foreground flex justify-between">
            <span>Launched Projects:</span>
            <span className="text-white font-semibold">{activeCity.projects}</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-6 right-6 bg-deepslate/35 border border-border/30 rounded-lg px-3 py-1.5 text-[10px] text-muted-foreground font-mono backdrop-blur-sm hidden sm:block">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-mint" />
          <span>Interactive Builder Hubs (Drag to Spin)</span>
        </div>
      </div>
    </div>
  );
}
