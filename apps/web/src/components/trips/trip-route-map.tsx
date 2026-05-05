'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useId, useMemo } from 'react';
import { Plane } from 'lucide-react';

type LatLng = { lat: number; lng: number };

const MAP = {
  eyebrow: 'Route preview',
  privacy: 'Pins are approximate (~5 km cells) for privacy.',
  distance: (km: number) => `~${Math.round(km)} km great-circle`,
} as const;

function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(Math.min(1, h)));
}

function padBounds(a: LatLng, b: LatLng, pad = 0.14) {
  let minLat = Math.min(a.lat, b.lat);
  let maxLat = Math.max(a.lat, b.lat);
  let minLng = Math.min(a.lng, b.lng);
  let maxLng = Math.max(a.lng, b.lng);
  const dLat = Math.max(maxLat - minLat, 0.35);
  const dLng = Math.max(maxLng - minLng, 0.35);
  minLat -= dLat * pad;
  maxLat += dLat * pad;
  minLng -= dLng * pad;
  maxLng += dLng * pad;
  return { minLat, maxLat, minLng, maxLng };
}

function project(p: LatLng, b: ReturnType<typeof padBounds>, w: number, h: number) {
  const x = ((p.lng - b.minLng) / (b.maxLng - b.minLng || 1)) * w;
  const y = h - ((p.lat - b.minLat) / (b.maxLat - b.minLat || 1)) * h;
  return { x, y };
}

function quadPoint(
  t: number,
  p0: { x: number; y: number },
  c: { x: number; y: number },
  p1: { x: number; y: number },
) {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * c.x + t * t * p1.x,
    y: u * u * p0.y + 2 * u * t * c.y + t * t * p1.y,
  };
}

export interface TripRouteMapProps {
  origin: LatLng;
  destination: LatLng;
  originCity: string;
  destinationCity: string;
  originEmoji?: string;
  destinationEmoji?: string;
}

const W = 1000;
const H = 420;

/**
 * Flights / ride-share style corridor map using jittered public points only (no map tiles).
 */
export function TripRouteMap({
  origin,
  destination,
  originCity,
  destinationCity,
  originEmoji = '📍',
  destinationEmoji = '📍',
}: TripRouteMapProps) {
  const reduceMotion = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const gradId = `trip-route-grad-${uid}`;
  const glowId = `trip-glow-${uid}`;

  const { pathD, plane, distKm, foreignOrigin, foreignDest, bearingDeg } = useMemo(() => {
    const b = padBounds(origin, destination);
    const o = project(origin, b, W, H);
    const d = project(destination, b, W, H);
    const mx = (o.x + d.x) / 2;
    const my = (o.y + d.y) / 2;
    const dx = d.x - o.x;
    const dy = d.y - o.y;
    const len = Math.hypot(dx, dy) || 1;
    const bulge = Math.min(140, len * 0.42);
    const cx = mx + (-dy / len) * bulge;
    const cy = my + (dx / len) * bulge;
    const dPath = `M ${o.x.toFixed(1)} ${o.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${d.x.toFixed(1)} ${d.y.toFixed(1)}`;
    const planePos = quadPoint(0.52, o, { x: cx, y: cy }, d);
    const bearingDeg = (Math.atan2(d.y - o.y, d.x - o.x) * 180) / Math.PI;
    return {
      pathD: dPath,
      plane: planePos,
      distKm: haversineKm(origin, destination),
      foreignOrigin: { x: o.x, y: o.y },
      foreignDest: { x: d.x, y: d.y },
      bearingDeg,
    };
  }, [origin, destination]);

  return (
    <section
      className="border-ink/8 from-porcelain relative mt-10 overflow-hidden rounded-3xl border bg-gradient-to-br via-white to-amber-50/50 shadow-[0_24px_80px_-24px_rgba(26,22,18,0.28)] ring-1 ring-black/5"
      aria-label={MAP.eyebrow}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.4]" aria-hidden>
        <div
          className="h-full w-full"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(26,22,18,0.07) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
      </div>

      <div className="relative px-5 pt-5 pb-5 sm:px-8 sm:pt-6">
        <div className="text-ink/55 flex flex-wrap items-center justify-between gap-2 text-[10px] font-medium tracking-[0.22em] uppercase">
          <span>{MAP.eyebrow}</span>
          <span className="text-ink/40 font-normal tracking-normal normal-case">
            {MAP.distance(distKm)}
          </span>
        </div>
        <p className="text-ink/45 mt-1 text-xs font-normal tracking-normal normal-case">
          {MAP.privacy}
        </p>

        <div className="relative mt-4 aspect-[21/9] min-h-[200px] w-full sm:min-h-[240px]">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-full w-full overflow-visible"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-hidden
          >
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
                <stop offset="45%" stopColor="#d97706" stopOpacity="1" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
              </linearGradient>
              <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              d={pathD}
              fill="none"
              stroke="rgba(26,22,18,0.06)"
              strokeWidth={16}
              strokeLinecap="round"
            />

            <motion.path
              d={pathD}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={4.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              filter={`url(#${glowId})`}
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0.35 }}
              animate={reduceMotion ? false : { pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
            />

            <foreignObject
              x={foreignOrigin.x - 72}
              y={foreignOrigin.y - 52}
              width="144"
              height="104"
            >
              <div className="flex h-full flex-col items-center justify-end pb-1">
                <div className="border-ink/8 text-ink flex items-center gap-2 rounded-2xl border bg-white/95 px-3 py-2 text-left shadow-lg ring-1 ring-white/80 backdrop-blur-sm">
                  <span className="text-2xl leading-none">{originEmoji}</span>
                  <span className="text-ink max-w-[5.5rem] truncate text-xs leading-tight font-semibold">
                    {originCity}
                  </span>
                </div>
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_0_6px_rgba(245,158,11,0.25)] ring-2 ring-white" />
              </div>
            </foreignObject>

            <foreignObject x={foreignDest.x - 72} y={foreignDest.y - 52} width="144" height="104">
              <div className="flex h-full flex-col items-center justify-end pb-1">
                <div className="border-ink/8 text-ink flex items-center gap-2 rounded-2xl border bg-white/95 px-3 py-2 text-left shadow-lg ring-1 ring-white/80 backdrop-blur-sm">
                  <span className="text-2xl leading-none">{destinationEmoji}</span>
                  <span className="text-ink max-w-[5.5rem] truncate text-xs leading-tight font-semibold">
                    {destinationCity}
                  </span>
                </div>
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-amber-600 shadow-[0_0_0_6px_rgba(217,119,6,0.28)] ring-2 ring-white" />
              </div>
            </foreignObject>

            <g transform={`translate(${plane.x},${plane.y}) rotate(${bearingDeg})`}>
              {reduceMotion ? (
                <circle r={28} fill="white" fillOpacity={0.92} />
              ) : (
                <motion.circle
                  r={28}
                  fill="white"
                  fillOpacity={0.92}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.75, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              <g transform="translate(-14, -14)">
                <Plane className="h-7 w-7 text-amber-600" strokeWidth={2} aria-hidden />
              </g>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
