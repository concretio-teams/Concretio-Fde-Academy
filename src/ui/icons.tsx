// Small stroke icon set, one consistent style. Drawn on a 24px grid, colored by the surrounding text color.
const PATHS: Record<string, string> = {
  flag: 'M5 21V4 M5 4h11l-2 4 2 4H5',
  grid: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z',
  route: 'M5 5h9a3.5 3.5 0 0 1 0 7h-4a3.5 3.5 0 0 0 0 7h9',
  play: 'M8 5.5v13l10.5-6.5z',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9.6 9.4a2.6 2.6 0 1 1 3.6 2.4c-.8.4-1.2 1-1.2 1.8 M12 17h.01',
  pencil: 'M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z M14.5 6.5l3 3',
  book: 'M6 4h10a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2z M6 18a2 2 0 0 1 2-2h10',
  list: 'M5 6h14 M5 12h14 M5 18h9',
  award: 'M12 14a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11z M8.8 13.2L7.5 21l4.5-2.5 4.5 2.5-1.3-7.8',
  chart: 'M5 20v-6 M12 20V5 M19 20V10',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M20 20l-4-4',
  chevronsLeft: 'M12 7l-5 5 5 5 M19 7l-5 5 5 5',
  chevronsRight: 'M5 7l5 5-5 5 M12 7l5 5-5 5',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  keyboard: 'M3 6h18v12H3z M7 10h.01 M11 10h.01 M15 10h.01 M7 14h10',
  login: 'M10 17l5-5-5-5 M15 12H4 M14 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  menu: 'M4 7h16 M4 12h16 M4 17h16',
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
