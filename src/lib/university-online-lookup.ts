/**
 * Live lookup of published university information (Wikidata + Wikipedia).
 * Used by the Admin 'Add University' form for universities outside the curated dataset.
 */
const UA = 'RedDragonStudy/1.0 (https://red-dragon-study.vercel.app; admin university lookup)';
const CHINA_QID = 'Q148';
const MUNICIPALITIES = ['Beijing', 'Shanghai', 'Tianjin', 'Chongqing'];

async function fetchJson(url: string, timeoutMs = 6000): Promise<any | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: ctrl.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function claimIds(entity: any, prop: string): string[] {
  return (entity?.claims?.[prop] || [])
    .map((c: any) => c?.mainsnak?.datavalue?.value?.id)
    .filter(Boolean);
}

async function getEntities(ids: string[]): Promise<Record<string, any>> {
  if (!ids.length) return {};
  const data = await fetchJson(
    `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids.join('|')}&props=labels|claims|sitelinks|descriptions&languages=en|ar|zh&format=json&origin=*`
  );
  return data?.entities || {};
}

function stripCity(label: string) {
  return label.replace(/\s+(City|Municipality|Province|Prefecture)$/i, '').trim();
}

/** Live lookup of published information (Wikidata + Wikipedia) for universities not in the curated dataset. */
export async function lookupUniversityOnline(name: string) {
  const search = await fetchJson(
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(name)}&language=en&uselang=en&type=item&limit=7&format=json&origin=*`
  );
  const hits: any[] = search?.search || [];
  const candidate =
    hits.find((h) => /universit|college|institute|academy/i.test(h.description || '') && /china|chinese|beijing|shanghai|province|city/i.test(h.description || '')) ||
    hits.find((h) => /universit|college|institute/i.test(h.description || ''));
  if (!candidate) return null;

  const entities = await getEntities([candidate.id]);
  const uni = entities[candidate.id];
  if (!uni) return null;

  const countries = claimIds(uni, 'P17');
  if (countries.length && !countries.includes(CHINA_QID)) return null; // only mainland China universities

  // Walk "located in the administrative territorial entity" (P131) up to China.
  const chain: Array<{ id: string; en: string; ar?: string; zh?: string }> = [];
  let next = claimIds(uni, 'P131')[0];
  for (let i = 0; i < 6 && next && next !== CHINA_QID; i++) {
    const ents = await getEntities([next]);
    const e = ents[next];
    if (!e) break;
    chain.push({ id: next, en: e.labels?.en?.value || '', ar: e.labels?.ar?.value, zh: e.labels?.zh?.value });
    next = claimIds(e, 'P131')[0];
  }

  let city: string | null = null;
  let cityAr: string | null = null;
  let province: string | null = null;
  let provinceAr: string | null = null;
  if (chain.length) {
    const top = chain[chain.length - 1];
    province = stripCity(top.en);
    provinceAr = top.ar ? stripCity(top.ar) : null;
    if (MUNICIPALITIES.includes(province)) {
      city = province;
      cityAr = provinceAr;
    } else {
      const cityNode =
        [...chain].reverse().slice(1).find((c) => !/district|county|town|subdistrict|new area/i.test(c.en)) ||
        chain[chain.length - 2] ||
        null;
      if (cityNode) {
        city = stripCity(cityNode.en);
        cityAr = cityNode.ar ? stripCity(cityNode.ar) : null;
      }
    }
  }

  // Wikipedia summaries (published information)
  const enTitle = uni.sitelinks?.enwiki?.title;
  const arTitle = uni.sitelinks?.arwiki?.title;
  const [enSum, arSum] = await Promise.all([
    enTitle ? fetchJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(enTitle)}`) : null,
    arTitle ? fetchJson(`https://ar.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(arTitle)}`) : null,
  ]);

  return {
    nameEn: uni.labels?.en?.value || name,
    nameAr: uni.labels?.ar?.value || null,
    nameZh: uni.labels?.zh?.value || null,
    city,
    cityAr,
    province,
    provinceAr,
    descriptionEn: enSum?.extract || null,
    descriptionAr: arSum?.extract || null,
    sourceUrl: enSum?.content_urls?.desktop?.page || `https://www.wikidata.org/wiki/${candidate.id}`,
  };
}


