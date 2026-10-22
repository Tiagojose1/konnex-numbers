// src/data/pricesByCountry.ts

export interface PriceVariant {
  price: number;
}

export interface PriceEntry {
  available: number;
  price?: number;
  variants?: {
    random: PriceVariant;
    chooseDdi: PriceVariant;
  };
}

const ddiPrice = (randomPrice: number) => Math.min(300, randomPrice + 200);

export const pricesByCountry: Record<string, Record<string, PriceEntry>> = {
  // ═══════════════════════════════════════════════════════
  // 🇲🇿 MOÇAMBIQUE — base (MZN / MT)
  // ═══════════════════════════════════════════════════════
  mz: {
    whatsapp:        { available: 838547,  variants: { random: { price: 200 }, chooseDdi: { price: 300 } } },
    telegram:        { available: 1482653, price: 150 },
    facebook:        { available: 102448,  price: 150 },
    instagram:       { available: 1324981, price: 150 },
    tiktok:          { available: 786111,  price: 150 },
    snapchat:        { available: 29408,   price: 150 },
    discord:         { available: 450783,  price: 150 },
    twitter:         { available: 31148,   price: 150 },
    viber:           { available: 434267,  price: 150 },
    wechat:          { available: 108466,  price: 150 },
    line:            { available: 626935,  price: 150 },
    kakaotalk:       { available: 32710,   price: 150 },
    imo:             { available: 3118,    price: 150 },
    zalo:            { available: 306,     price: 150 },
    linkedin:        { available: 5949,    price: 150 },
    googlechat:      { available: 3727,    price: 150 },
    googlemessenger: { available: 5931,    price: 150 },
    vk:              { available: 25190,   price: 150 },
    yalla:           { available: 772,     price: 150 },
    soulapp:         { available: 100,     price: 150 },
    redbook:         { available: 26119,   price: 150 },
    tencentqq:       { available: 27824,   price: 150 },
    bigo:            { available: 3475,    price: 150 },

    wise:      { available: 100,     price: 150 },
    paypal:    { available: 1061518, price: 150 },
    coinbase:  { available: 377,     price: 150 },
    paycell:   { available: 2866,    price: 150 },
    papara:    { available: 183215,  price: 150 },

    amazon:     { available: 98103,  variants: { random: { price: 65 },  chooseDdi: { price: ddiPrice(65) } } },
    ebay:       { available: 28087,  variants: { random: { price: 70 },  chooseDdi: { price: ddiPrice(70) } } },
    shein:      { available: 100,    variants: { random: { price: 50 },  chooseDdi: { price: ddiPrice(50) } } },
    shopee:     { available: 772339, variants: { random: { price: 60 },  chooseDdi: { price: ddiPrice(60) } } },
    alibaba:    { available: 799007, variants: { random: { price: 65 },  chooseDdi: { price: ddiPrice(65) } } },
    walmart:    { available: 25200,  variants: { random: { price: 60 },  chooseDdi: { price: ddiPrice(60) } } },
    olx:        { available: 35229,  variants: { random: { price: 55 },  chooseDdi: { price: ddiPrice(55) } } },
    lidl:       { available: 100,    variants: { random: { price: 50 },  chooseDdi: { price: ddiPrice(50) } } },
    jd:         { available: 2761,   variants: { random: { price: 60 },  chooseDdi: { price: ddiPrice(60) } } },
    craigslist: { available: 1462,   variants: { random: { price: 55 },  chooseDdi: { price: ddiPrice(55) } } },
    offgamers:  { available: 1428,   variants: { random: { price: 100 }, chooseDdi: { price: ddiPrice(100) } } },
    biedronka:  { available: 100,    variants: { random: { price: 50 },  chooseDdi: { price: ddiPrice(50) } } },

    steam:    { available: 1310, variants: { random: { price: 80 }, chooseDdi: { price: ddiPrice(80) } } },
    blizzard: { available: 1615, variants: { random: { price: 70 }, chooseDdi: { price: ddiPrice(70) } } },
    ubisoft:  { available: 370,  variants: { random: { price: 70 }, chooseDdi: { price: ddiPrice(70) } } },
    nttgame:  { available: 3727, variants: { random: { price: 70 }, chooseDdi: { price: ddiPrice(70) } } },

    uber:      { available: 441431, variants: { random: { price: 60 }, chooseDdi: { price: ddiPrice(60) } } },
    bolt:      { available: 1172,   variants: { random: { price: 55 }, chooseDdi: { price: ddiPrice(55) } } },
    blablacar: { available: 100,    variants: { random: { price: 55 }, chooseDdi: { price: ddiPrice(55) } } },
    grab:      { available: 603399, variants: { random: { price: 60 }, chooseDdi: { price: ddiPrice(60) } } },
    careem:    { available: 2345,   variants: { random: { price: 70 }, chooseDdi: { price: ddiPrice(70) } } },
    didi:      { available: 2734,   variants: { random: { price: 65 }, chooseDdi: { price: ddiPrice(65) } } },

    glovo:      { available: 100,   variants: { random: { price: 50 }, chooseDdi: { price: ddiPrice(50) } } },
    burgerking: { available: 3684,  variants: { random: { price: 70 }, chooseDdi: { price: ddiPrice(70) } } },
    mcdonalds:  { available: 1147,  variants: { random: { price: 70 }, chooseDdi: { price: ddiPrice(70) } } },
    foodpanda:  { available: 2950,  variants: { random: { price: 55 }, chooseDdi: { price: ddiPrice(55) } } },
    wolt:       { available: 2501,  variants: { random: { price: 55 }, chooseDdi: { price: ddiPrice(55) } } },
    deliveroo:  { available: 81896, variants: { random: { price: 55 }, chooseDdi: { price: ddiPrice(55) } } },

    airbnb: { available: 1199, variants: { random: { price: 90 }, chooseDdi: { price: ddiPrice(90) } } },

    google:       { available: 454718,  variants: { random: { price: 65 },  chooseDdi: { price: ddiPrice(65) } } },
    microsoft:    { available: 79224,   variants: { random: { price: 60 },  chooseDdi: { price: ddiPrice(60) } } },
    apple:        { available: 1250183, variants: { random: { price: 70 },  chooseDdi: { price: ddiPrice(70) } } },
    yahoo:        { available: 1239023, variants: { random: { price: 55 },  chooseDdi: { price: ddiPrice(55) } } },
    aol:          { available: 33353,   variants: { random: { price: 60 },  chooseDdi: { price: ddiPrice(60) } } },
    mailru:       { available: 100,     variants: { random: { price: 50 },  chooseDdi: { price: ddiPrice(50) } } },
    yandex:       { available: 100,     variants: { random: { price: 50 },  chooseDdi: { price: ddiPrice(50) } } },
    baidu:        { available: 1184,    variants: { random: { price: 50 },  chooseDdi: { price: ddiPrice(50) } } },
    naver:        { available: 38649,   variants: { random: { price: 55 },  chooseDdi: { price: ddiPrice(55) } } },
    zoho:         { available: 1839,    variants: { random: { price: 100 }, chooseDdi: { price: ddiPrice(100) } } },
    spotify:      { available: 252,     variants: { random: { price: 80 },  chooseDdi: { price: ddiPrice(80) } } },
    netflix:      { available: 28380,   variants: { random: { price: 90 },  chooseDdi: { price: ddiPrice(90) } } },
    bilibili:     { available: 100,     variants: { random: { price: 50 },  chooseDdi: { price: ddiPrice(50) } } },
    openai:       { available: 27739,   variants: { random: { price: 100 }, chooseDdi: { price: ddiPrice(100) } } },
    tinder:       { available: 540012,  variants: { random: { price: 100 }, chooseDdi: { price: ddiPrice(100) } } },
    hinge:        { available: 478,     variants: { random: { price: 55 },  chooseDdi: { price: ddiPrice(55) } } },
    grindr:       { available: 28278,   variants: { random: { price: 55 },  chooseDdi: { price: ddiPrice(55) } } },
    pof:          { available: 2311,    variants: { random: { price: 50 },  chooseDdi: { price: ddiPrice(50) } } },
    skout:        { available: 3001,    variants: { random: { price: 50 },  chooseDdi: { price: ddiPrice(50) } } },
    hily:         { available: 2319,    variants: { random: { price: 60 },  chooseDdi: { price: ddiPrice(60) } } },
    coca:         { available: 196304,  variants: { random: { price: 60 },  chooseDdi: { price: ddiPrice(60) } } },
    nike:         { available: 28044,   variants: { random: { price: 80 },  chooseDdi: { price: ddiPrice(80) } } },
    ticketmaster: { available: 292200,  variants: { random: { price: 80 },  chooseDdi: { price: ddiPrice(80) } } },
    vfs:          { available: 27034,   variants: { random: { price: 70 },  chooseDdi: { price: ddiPrice(70) } } },
    iqos:         { available: 12484,   variants: { random: { price: 70 },  chooseDdi: { price: ddiPrice(70) } } },

    anyother: { available: 73936, variants: { random: { price: 65 }, chooseDdi: { price: ddiPrice(65) } } },
  },

  // ═══════════════════════════════════════════════════════
  // 🇧🇷 BRASIL — base (BRL / R$)
  // ═══════════════════════════════════════════════════════
  br: {
    whatsapp:  { available: 500000, variants: { random: { price: 15 }, chooseDdi: { price: 20 } } },
    telegram:  { available: 620000, price: 10 },
    facebook:  { available: 850000, price: 10 },
    instagram: { available: 940000, price: 10 },
    tiktok:    { available: 700000, price: 10 },
    discord:   { available: 300000, price: 10 },
    snapchat:  { available: 180000, price: 10 },
    twitter:   { available: 120000, price: 10 },
    linkedin:  { available: 40000,  price: 10 },
    wechat:    { available: 30000,  price: 10 },

    wise:     { available: 4000, price: 10 },
    paypal:   { available: 9000, price: 10 },
    coinbase: { available: 800,  price: 10 },

    amazon:     { available: 200000, variants: { random: { price: 7 }, chooseDdi: { price: 15 } } },
    aliexpress: { available: 150000, variants: { random: { price: 6 }, chooseDdi: { price: 14 } } },
    shein:      { available: 120000, variants: { random: { price: 5 }, chooseDdi: { price: 15 } } },
    ebay:       { available: 40000,  variants: { random: { price: 8 }, chooseDdi: { price: 15 } } },
    shopee:     { available: 300000, variants: { random: { price: 6 }, chooseDdi: { price: 15 } } },
    walmart:    { available: 20000,  variants: { random: { price: 7 }, chooseDdi: { price: 15 } } },
    olx:        { available: 50000,  variants: { random: { price: 6 }, chooseDdi: { price: 15 } } },

    steam:    { available: 30000, variants: { random: { price: 9 }, chooseDdi: { price: 15 } } },
    blizzard: { available: 8000,  variants: { random: { price: 8 }, chooseDdi: { price: 15 } } },
    ubisoft:  { available: 4000,  variants: { random: { price: 8 }, chooseDdi: { price: 15 } } },

    uber:      { available: 200000, variants: { random: { price: 7 }, chooseDdi: { price: 15 } } },
    bolt:      { available: 30000,  variants: { random: { price: 6 }, chooseDdi: { price: 14 } } },
    blablacar: { available: 8000,   variants: { random: { price: 7 }, chooseDdi: { price: 15 } } },
    didi:      { available: 60000,  variants: { random: { price: 7 }, chooseDdi: { price: 15 } } },

    glovo:      { available: 10000, variants: { random: { price: 6 }, chooseDdi: { price: 15 } } },
    burgerking: { available: 30000, variants: { random: { price: 7 }, chooseDdi: { price: 15 } } },
    mcdonalds:  { available: 40000, variants: { random: { price: 7 }, chooseDdi: { price: 15 } } },

    airbnb: { available: 20000, variants: { random: { price: 10 }, chooseDdi: { price: 15 } } },

    google:    { available: 300000, variants: { random: { price: 8 },  chooseDdi: { price: 15 } } },
    microsoft: { available: 100000, variants: { random: { price: 7 },  chooseDdi: { price: 15 } } },
    apple:     { available: 250000, variants: { random: { price: 9 },  chooseDdi: { price: 15 } } },
    netflix:   { available: 80000,  variants: { random: { price: 10 }, chooseDdi: { price: 15 } } },
    spotify:   { available: 60000,  variants: { random: { price: 9 },  chooseDdi: { price: 15 } } },
    openai:    { available: 40000,  variants: { random: { price: 12 }, chooseDdi: { price: 15 } } },
    tinder:    { available: 150000, variants: { random: { price: 10 }, chooseDdi: { price: 15 } } },

    anyother: { available: 500000, variants: { random: { price: 8 }, chooseDdi: { price: 15 } } },
  },

  // ═══════════════════════════════════════════════════════
  // 🇵🇹 PORTUGAL — base (EUR / €)
  // ═══════════════════════════════════════════════════════
  pt: {
    whatsapp:  { available: 300000, variants: { random: { price: 3 }, chooseDdi: { price: 4 } } },
    telegram:  { available: 180000, price: 2 },
    facebook:  { available: 420000, price: 2 },
    instagram: { available: 380000, price: 2 },
    tiktok:    { available: 250000, price: 2 },
    snapchat:  { available: 100000, price: 2 },
    linkedin:  { available: 60000,  price: 2 },

    wise:     { available: 4500, price: 2 },
    paypal:   { available: 8000, price: 2 },
    coinbase: { available: 1200, price: 2 },

    amazon:   { available: 120000, variants: { random: { price: 1.5 }, chooseDdi: { price: 4 } } },
    shein:    { available: 40000,  variants: { random: { price: 1.5 }, chooseDdi: { price: 4 } } },
    ebay:     { available: 20000,  variants: { random: { price: 1.5 }, chooseDdi: { price: 4 } } },

    steam:    { available: 15000, variants: { random: { price: 2 }, chooseDdi: { price: 4 } } },
    blizzard: { available: 5000,  variants: { random: { price: 2 }, chooseDdi: { price: 4 } } },

    uber:      { available: 120000, variants: { random: { price: 1.5 }, chooseDdi: { price: 4 } } },
    bolt:      { available: 40000,  variants: { random: { price: 1.5 }, chooseDdi: { price: 4 } } },
    blablacar: { available: 8000,   variants: { random: { price: 1.5 }, chooseDdi: { price: 4 } } },

    glovo:      { available: 50000, variants: { random: { price: 1.5 }, chooseDdi: { price: 4 } } },
    burgerking: { available: 15000, variants: { random: { price: 2 },   chooseDdi: { price: 4 } } },
    mcdonalds:  { available: 20000, variants: { random: { price: 2 },   chooseDdi: { price: 4 } } },

    airbnb: { available: 25000, variants: { random: { price: 2 }, chooseDdi: { price: 4 } } },

    google:    { available: 200000, variants: { random: { price: 2 },   chooseDdi: { price: 4 } } },
    microsoft: { available: 60000,  variants: { random: { price: 1.8 }, chooseDdi: { price: 4 } } },
    apple:     { available: 150000, variants: { random: { price: 2.2 }, chooseDdi: { price: 4 } } },
    netflix:   { available: 60000,  variants: { random: { price: 2 },   chooseDdi: { price: 4 } } },
    spotify:   { available: 50000,  variants: { random: { price: 2 },   chooseDdi: { price: 4 } } },
    openai:    { available: 30000,  variants: { random: { price: 2.5 }, chooseDdi: { price: 4 } } },
    tinder:    { available: 80000,  variants: { random: { price: 2 },   chooseDdi: { price: 4 } } },

    anyother: { available: 300000, variants: { random: { price: 2 }, chooseDdi: { price: 4 } } },
  },

  // ═══════════════════════════════════════════════════════
  // 🇿🇦 ÁFRICA DO SUL — base (ZAR / R)
  // ═══════════════════════════════════════════════════════
  za: {
    whatsapp:  { available: 400000, variants: { random: { price: 25 }, chooseDdi: { price: 45 } } },
    telegram:  { available: 150000, price: 20 },
    facebook:  { available: 300000, price: 20 },
    instagram: { available: 280000, price: 20 },
    tiktok:    { available: 200000, price: 20 },
    snapchat:  { available: 80000,  price: 20 },

    amazon:    { available: 60000, variants: { random: { price: 15 }, chooseDdi: { price: 45 } } },
    shein:     { available: 20000, variants: { random: { price: 12 }, chooseDdi: { price: 45 } } },
    takealot:  { available: 40000, variants: { random: { price: 12 }, chooseDdi: { price: 45 } } },

    uber:      { available: 100000, variants: { random: { price: 15 }, chooseDdi: { price: 45 } } },
    bolt:      { available: 50000,  variants: { random: { price: 12 }, chooseDdi: { price: 45 } } },
    mrd:       { available: 30000,  variants: { random: { price: 12 }, chooseDdi: { price: 45 } } },

    netflix:   { available: 40000, variants: { random: { price: 20 }, chooseDdi: { price: 45 } } },
    spotify:   { available: 30000, variants: { random: { price: 20 }, chooseDdi: { price: 45 } } },
    openai:    { available: 15000, variants: { random: { price: 25 }, chooseDdi: { price: 45 } } },

    anyother: { available: 200000, variants: { random: { price: 15 }, chooseDdi: { price: 45 } } },
  },

  // ═══════════════════════════════════════════════════════
  // 🇮🇳 ÍNDIA — base (INR / ₹)
  // ═══════════════════════════════════════════════════════
  in: {
    whatsapp:  { available: 900000, variants: { random: { price: 12 }, chooseDdi: { price: 30 } } },
    telegram:  { available: 500000, price: 10 },
    facebook:  { available: 800000, price: 10 },
    instagram: { available: 750000, price: 10 },
    tiktok:    { available: 400000, price: 10 },
    snapchat:  { available: 200000, price: 10 },

    amazon:    { available: 300000, variants: { random: { price: 8 }, chooseDdi: { price: 30 } } },
    flipkart:  { available: 250000, variants: { random: { price: 8 }, chooseDdi: { price: 30 } } },
    myntra:    { available: 100000, variants: { random: { price: 8 }, chooseDdi: { price: 30 } } },
    meesho:    { available: 150000, variants: { random: { price: 7 }, chooseDdi: { price: 30 } } },

    paytm:   { available: 200000, price: 10 },
    phonepe: { available: 180000, price: 10 },

    uber:    { available: 300000, variants: { random: { price: 8 }, chooseDdi: { price: 30 } } },
    ola:     { available: 250000, variants: { random: { price: 8 }, chooseDdi: { price: 30 } } },

    swiggy:  { available: 200000, variants: { random: { price: 8 }, chooseDdi: { price: 30 } } },
    zomato:  { available: 180000, variants: { random: { price: 8 }, chooseDdi: { price: 30 } } },

    netflix: { available: 100000, variants: { random: { price: 12 }, chooseDdi: { price: 30 } } },
    spotify: { available: 80000,  variants: { random: { price: 10 }, chooseDdi: { price: 30 } } },
    openai:  { available: 40000,  variants: { random: { price: 15 }, chooseDdi: { price: 30 } } },

    anyother: { available: 500000, variants: { random: { price: 10 }, chooseDdi: { price: 30 } } },
  },

  // ═══════════════════════════════════════════════════════
  // 🇺🇸 ESTADOS UNIDOS — base (USD / $)
  // ═══════════════════════════════════════════════════════
  us: {
    whatsapp:  { available: 400000, variants: { random: { price: 3 }, chooseDdi: { price: 5 } } },
    telegram:  { available: 250000, price: 2.5 },
    facebook:  { available: 500000, price: 2.5 },
    instagram: { available: 480000, price: 2.5 },
    tiktok:    { available: 300000, price: 2.5 },
    snapchat:  { available: 150000, price: 2.5 },

    wise:     { available: 20000, price: 2.5 },
    paypal:   { available: 40000, price: 2.5 },
    coinbase: { available: 5000,  price: 2.5 },

    amazon:   { available: 200000, variants: { random: { price: 2 }, chooseDdi: { price: 5 } } },
    ebay:     { available: 100000, variants: { random: { price: 2 }, chooseDdi: { price: 5 } } },
    walmart:  { available: 80000,  variants: { random: { price: 2 }, chooseDdi: { price: 5 } } },

    uber:      { available: 200000, variants: { random: { price: 2 }, chooseDdi: { price: 5 } } },
    lyft:      { available: 80000,  variants: { random: { price: 2 }, chooseDdi: { price: 5 } } },
    blablacar: { available: 20000,  variants: { random: { price: 2 }, chooseDdi: { price: 5 } } },

    airbnb: { available: 50000, variants: { random: { price: 3 }, chooseDdi: { price: 5 } } },

    google:    { available: 300000, variants: { random: { price: 2.5 }, chooseDdi: { price: 5 } } },
    microsoft: { available: 150000, variants: { random: { price: 2.5 }, chooseDdi: { price: 5 } } },
    apple:     { available: 250000, variants: { random: { price: 2.5 }, chooseDdi: { price: 5 } } },
    netflix:   { available: 80000,  variants: { random: { price: 3 },   chooseDdi: { price: 5 } } },
    spotify:   { available: 60000,  variants: { random: { price: 2.5 }, chooseDdi: { price: 5 } } },
    openai:    { available: 40000,  variants: { random: { price: 3.5 }, chooseDdi: { price: 5 } } },
    tinder:    { available: 150000, variants: { random: { price: 3 },   chooseDdi: { price: 5 } } },

    anyother: { available: 400000, variants: { random: { price: 2.5 }, chooseDdi: { price: 5 } } },
  },
};

export function getPrice(serviceId: string, countryId: string, variant: 'random' | 'chooseDdi' = 'random') {
  const entry = pricesByCountry[countryId]?.[serviceId];
  if (!entry) return null;

  if (entry.variants) {
    const v = entry.variants[variant];
    if (!v) return null;
    return { available: entry.available, price: v.price, variant };
  }

  return { available: entry.available, price: entry.price };
}

export function getServicesByCountry(countryId: string, allServices: any[]) {
  const prices = pricesByCountry[countryId] || {};
  return allServices
    .filter((s) => prices[s.id])
    .map((s) => {
      const entry = prices[s.id];
      const price = entry.variants ? entry.variants.random.price : entry.price;
      return {
        ...s,
        available: entry.available,
        price,
        hasVariants: !!entry.variants,
      };
    });
}