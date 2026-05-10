const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

const LOCAL_IMAGES: [string, string][] = [
  ['tranquil',         '/cafes img/Tranquil book and coffee.png'],
  ['aha cafe',         '/cafes img/Aha caffe Ton Duc Thang.jpg'],
  ['all day coffee',   '/cafes img/All day Coffee.png'],
  ['phuc long',        '/cafes img/PhucLong.png'],
  ['cong ca phe',      '/cafes img/Cong Trang Tien.png'],
  ['trang tien',       '/cafes img/Cong Trang Tien.png'],
  ['neocafe',          '/cafes img/Neo Caffe.jpg'],
  ['the coffee house', '/cafes img/The coffee house lab.png'],
  ['note coffee',      '/cafes img/The Note cafe.png'],
  ['note cafe',        '/cafes img/The Note cafe.png'],
  ['hiden gem',        '/cafes img/Hiden gem work spot.png'],
  ['work flow',        '/cafes img/Work flow place.png'],
];

/** Returns the best local image for a cafe, falling back to API avatar or placeholder */
export function resolveCafeImage(name: string, avatar?: string | null): string {
  const n = normalize(name);
  for (const [kw, path] of LOCAL_IMAGES) {
    if (n.includes(normalize(kw))) return encodeURI(path);
  }
  return avatar ?? '/images/hero-cafe.png';
}
