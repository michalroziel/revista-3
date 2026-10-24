// Shared by the /map page's build-time render and its browser script, so the
// still globe and the one people turn are drawn the same way.
import { geoDistance, geoGraticule, geoInterpolate, geoOrthographic, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import land110m from 'world-atlas/land-110m.json';

export type LngLat = [number, number];

export const SIZE = 1000;
const RADIUS = 480;
export const MIN_ZOOM = 1;
// beyond this the world outline (kept coarse so it turns smoothly) looks blocky
export const MAX_ZOOM = 3;

// The view before anyone turns it: the Atlantic, with Europe, South America
// and the Antarctic Peninsula all on the visible side.
export const HOME: LngLat = [-30, -5];

const topology = land110m as unknown as Topology<{ land: GeometryCollection }>;
export const land = feature(topology, topology.objects.land);
export const graticule = geoGraticule().step([30, 30])();
export const sphere = { type: 'Sphere' } as const;

export function projection(center: LngLat, zoom = 1) {
  return geoOrthographic()
    .translate([SIZE / 2, SIZE / 2])
    .scale(RADIUS * zoom)
    .rotate([-center[0], -center[1]])
    .clipAngle(90)
    .precision(1);
}

// whole units are under a pixel at any size the globe is shown, and keep the
// per-frame path short enough to redraw smoothly on phones
export function pathFor(center: LngLat, zoom = 1) {
  return geoPath(projection(center, zoom)).digits(0);
}

/** Whether a point is on the side of the globe facing the viewer. */
export function facing(center: LngLat, point: LngLat) {
  return geoDistance(center, point) < Math.PI / 2 - 0.02;
}

/** The point a fraction `t` of the way along a route of waypoints, measured by distance. */
export function alongRoute(route: LngLat[], t: number): LngLat {
  const legs = route.slice(1).map((point, i) => geoDistance(route[i], point));
  let remaining = Math.max(0, Math.min(1, t)) * legs.reduce((a, b) => a + b, 0);
  for (let i = 0; i < legs.length; i++) {
    if (remaining <= legs[i] || i === legs.length - 1) {
      return geoInterpolate(route[i], route[i + 1])(legs[i] ? Math.min(1, remaining / legs[i]) : 1);
    }
    remaining -= legs[i];
  }
  return route[route.length - 1];
}
