/**
 * Single source of truth for site photography.
 *
 * These pictures were supplied by the client and live in /public/images/site (originals in
 * /public/images/supplied). They are ILLUSTRATIVE: none of them shows a Konsadem project, and
 * wherever one sits beside a named project the UI labels it "Illustrative image".
 * To swap a picture, point `src` at another file in /public.
 */
export type Photo = { id?: string; src?: string; alt: string; by?: string; pos?: string };

const P = (file: string, alt: string, pos?: string): Photo => ({ src: `/images/site/${file}.jpg`, alt, pos });

const pics = {
  rig: P('drilling-rig', 'A driller operating a borehole rig as water sprays from the casing'),
  highway: P('highway-port', 'Engineers reviewing drawings beside a highway viaduct under construction near a port'),
  marine: P('marine-concrete', 'Concrete piers and breakwater works under construction at sea'),
  rebar: P('coastal-rebar', 'Workers fixing steel reinforcement on a coastal construction site'),
  crew: P('drilling-crew', 'A drilling crew member in high-visibility clothing beside a rig', 'center 25%'),
  drawings: P('engineers-drawings', 'Three engineers studying drawings on a site table'),
  trench: P('utility-trench', 'Pipes and ducts laid in an open utility trench'),
  plant: P('treatment-plant', 'An engineer with a tablet inspecting aeration tanks at a water treatment plant'),
  blockwork: P('blockwork', 'Masons laying blockwork on a building site'),
};

export const media = {
  heroWater: pics.plant, heroDam: pics.rig, heroRoads: pics.highway, heroCity: pics.rebar,
  svcWater: pics.rig, svcDams: pics.marine, svcRoads: pics.highway, svcStructures: pics.blockwork, svcEnvironment: pics.rebar,
  svcMechanical: pics.trench, svcSupervision: pics.drawings, svcStudies: pics.crew, svcDigital: pics.plant,
  projLagosWater: pics.trench, projSewerage: pics.plant, projIrrigation: pics.marine, projChannel: pics.highway, projWaste: pics.rebar,
  field: pics.crew, cta: pics.highway, culture: pics.drawings,
  pageAbout: pics.drawings, pageServices: pics.trench, pageProjects: pics.highway, pageTeam: pics.rebar, pageWhy: pics.marine,
  pageContact: pics.plant, pageCareers: pics.blockwork, pageInsights: pics.rig, pageProject: pics.marine,
} satisfies Record<string, Photo>;

export type MediaKey = keyof typeof media;
export const gallery: Photo[] = [pics.rig, pics.highway, pics.crew, pics.plant, pics.marine, pics.blockwork, pics.trench, pics.rebar, pics.drawings];

export function photoUrl(p: Photo, w = 1600, q = 72) {
  if (p.src) return p.src;
  return `https://images.unsplash.com/${p.id}?auto=format&fit=crop&w=${w}&q=${q}`;
}
export function photoSrcSet(p: Photo, widths = [640, 1024, 1600, 2400]) {
  if (p.src) return undefined;
  return widths.map((w) => `${photoUrl(p, w)} ${w}w`).join(', ');
}

export const serviceMedia: Photo[] = [
  media.svcWater, media.svcDams, media.svcRoads, media.svcStructures, media.svcEnvironment,
  media.svcMechanical, media.svcSupervision, media.svcStudies, media.svcDigital,
];
