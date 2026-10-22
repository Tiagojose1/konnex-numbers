// src/data/services.ts

export interface Service {
  id: string;
  name: string;
  category: string;
  logo: string;
}

export const services: Service[] = [
  // ─── Redes sociais / comunicação ───
  { id: 'whatsapp',     name: 'WhatsApp',              category: 'social',    logo: '/logos/whatsapp.svg' },
  { id: 'telegram',     name: 'Telegram',              category: 'social',    logo: '/logos/telegram.svg' },
  { id: 'facebook',     name: 'Facebook',              category: 'social',    logo: '/logos/facebook.svg' },
  { id: 'instagram',    name: 'Instagram & Threads',   category: 'social',    logo: '/logos/instagram.svg' },
  { id: 'tiktok',       name: 'TikTok / Douyin',       category: 'social',    logo: '/logos/tiktok.svg' },
  { id: 'discord',      name: 'Discord',               category: 'social',    logo: '/logos/discord.svg' },
  { id: 'snapchat',     name: 'Snapchat',              category: 'social',    logo: '/logos/snapchat.svg' },
  { id: 'viber',        name: 'Viber',                 category: 'social',    logo: '/logos/viber.svg' },
  { id: 'wechat',       name: 'WeChat',                category: 'social',    logo: '/logos/wechat.svg' },
  { id: 'line',         name: 'LINE Messenger',        category: 'social',    logo: '/logos/line.svg' },
  { id: 'kakaotalk',    name: 'KakaoTalk',             category: 'social',    logo: '/logos/kakaotalk.svg' },
  { id: 'imo',          name: 'imo',                   category: 'social',    logo: '/logos/imo.svg' },
  { id: 'zalo',         name: 'Zalo',                  category: 'social',    logo: '/logos/zalo.svg' },
  { id: 'linkedin',     name: 'LinkedIn',              category: 'social',    logo: '/logos/linkedin.svg' },
  { id: 'twitter',      name: 'Twitter / X',           category: 'social',    logo: '/logos/twitter.svg' },
  { id: 'googlechat',   name: 'Google Chat',           category: 'social',    logo: '/logos/googlechat.svg' },

  // ─── Google / Microsoft / Apple ───
  { id: 'google',       name: 'Google / YouTube / Gmail', category: 'other',  logo: '/logos/google.svg' },
  { id: 'microsoft',    name: 'Microsoft',             category: 'other',     logo: '/logos/microsoft.svg' },
  { id: 'apple',        name: 'Apple',                 category: 'other',     logo: '/logos/apple.svg' },

  // ─── Bancos / Finanças ───
  { id: 'nubank',       name: 'Nubank',                category: 'bank',      logo: '/logos/nubank.svg' },
  { id: 'itau',         name: 'Itaú Unibanco',         category: 'bank',      logo: '/logos/itau.svg' },
  { id: 'bradesco',     name: 'Bradesco',              category: 'bank',      logo: '/logos/bradesco.svg' },
  { id: 'bancodobrasil',name: 'Banco do Brasil',       category: 'bank',      logo: '/logos/bancodobrasil.svg' },
  { id: 'caixa',        name: 'Caixa Econômica',       category: 'bank',      logo: '/logos/caixa.svg' },
  { id: 'santander_br', name: 'Santander Brasil',      category: 'bank',      logo: '/logos/santander.svg' },
  { id: 'inter',        name: 'Banco Inter',           category: 'bank',      logo: '/logos/inter.svg' },
  { id: 'c6bank',       name: 'C6 Bank',               category: 'bank',      logo: '/logos/c6bank.svg' },
  { id: 'picpay',       name: 'PicPay',                category: 'bank',      logo: '/logos/picpay.svg' },
  { id: 'pagbank',      name: 'PagBank',               category: 'bank',      logo: '/logos/pagbank.svg' },
  { id: 'mercadopago',  name: 'Mercado Pago',          category: 'bank',      logo: '/logos/mercadopago.svg' },
  { id: 'bci',          name: 'BCI',                   category: 'bank',      logo: '/logos/bci.svg' },
  { id: 'bim',          name: 'BIM',                   category: 'bank',      logo: '/logos/bim.svg' },
  { id: 'millenniumbim',name: 'Millennium bim',        category: 'bank',      logo: '/logos/millenniumbim.svg' },
  { id: 'standardbank_mz', name: 'Standard Bank',      category: 'bank',      logo: '/logos/standardbank.svg' },
  { id: 'absa_mz',      name: 'Absa',                  category: 'bank',      logo: '/logos/absa.svg' },
  { id: 'bancounico',   name: 'Banco Único',           category: 'bank',      logo: '/logos/bancounico.svg' },
  { id: 'moza',         name: 'Moza Banco',            category: 'bank',      logo: '/logos/moza.svg' },
  { id: 'millenniumbcp',name: 'Millennium BCP',        category: 'bank',      logo: '/logos/millenniumbcp.svg' },
  { id: 'novobanco',    name: 'Novo Banco',            category: 'bank',      logo: '/logos/novobanco.svg' },
  { id: 'cgd',          name: 'Caixa Geral de Depósitos', category: 'bank',   logo: '/logos/cgd.svg' },
  { id: 'revolut',      name: 'Revolut',               category: 'bank',      logo: '/logos/revolut.svg' },
  { id: 'wise',         name: 'Wise',                  category: 'bank',      logo: '/logos/wise.svg' },
  { id: 'paypal',       name: 'PayPal',                category: 'finance',   logo: '/logos/paypal.svg' },

  // ─── Compras ───
  { id: 'amazon',       name: 'Amazon',                category: 'shopping',  logo: '/logos/amazon.svg' },
  { id: 'aliexpress',   name: 'AliExpress',            category: 'shopping',  logo: '/logos/aliexpress.svg' },
  { id: 'shein',        name: 'Shein',                 category: 'shopping',  logo: '/logos/shein.svg' },
  { id: 'ebay',         name: 'eBay',                  category: 'shopping',  logo: '/logos/ebay.svg' },
  { id: 'shopee',       name: 'Shopee',                category: 'shopping',  logo: '/logos/shopee.svg' },
  { id: 'walmart',      name: 'Walmart',               category: 'shopping',  logo: '/logos/walmart.svg' },
  { id: 'olx',          name: 'OLX',                   category: 'shopping',  logo: '/logos/olx.svg' },
  { id: 'alibaba',      name: 'Alipay / Alibaba / 1688', category: 'shopping', logo: '/logos/alibaba.svg' },
  { id: 'jd',           name: 'JD.com',                category: 'shopping',  logo: '/logos/jd.svg' },

  // ─── Jogos ───
  { id: 'steam',        name: 'Steam',                 category: 'games',     logo: '/logos/steam.svg' },
  { id: 'roblox',       name: 'Roblox',                category: 'games',     logo: '/logos/roblox.svg' },
  { id: 'twitch',       name: 'Twitch',                category: 'games',     logo: '/logos/twitch.svg' },
  { id: 'blizzard',     name: 'Blizzard',              category: 'games',     logo: '/logos/blizzard.svg' },
  { id: 'ubisoft',      name: 'Ubisoft',               category: 'games',     logo: '/logos/ubisoft.svg' },
  { id: 'nttgame',      name: 'NTTGame',               category: 'games',     logo: '/logos/nttgame.svg' },

  // ─── Transporte ───
  { id: 'uber',         name: 'Uber',                  category: 'transport', logo: '/logos/uber.svg' },
  { id: 'bolt',         name: 'Bolt',                  category: 'transport', logo: '/logos/bolt.svg' },
  { id: 'blablacar',    name: 'BlaBlaCar',             category: 'transport', logo: '/logos/blablacar.svg' },
  { id: 'grab',         name: 'Grab',                  category: 'transport', logo: '/logos/grab.svg' },
  { id: 'didi',         name: 'DiDi',                  category: 'transport', logo: '/logos/didi.svg' },
  { id: 'careem',       name: 'Careem',                category: 'transport', logo: '/logos/careem.svg' },

  // ─── Delivery ───
  { id: 'glovo',        name: 'Glovo',                 category: 'delivery',  logo: '/logos/glovo.svg' },
  { id: 'ubereats',     name: 'Uber Eats',             category: 'delivery',  logo: '/logos/ubereats.svg' },
  { id: 'foodpanda',    name: 'Foodpanda',             category: 'delivery',  logo: '/logos/foodpanda.svg' },
  { id: 'mcdonalds',    name: "McDonald's",            category: 'delivery',  logo: '/logos/mcdonalds.svg' },
  { id: 'burgerking',   name: 'Burger King',           category: 'delivery',  logo: '/logos/burgerking.svg' },
  { id: 'wolt',         name: 'Wolt',                  category: 'delivery',  logo: '/logos/wolt.svg' },
  { id: 'deliveroo',    name: 'Deliveroo',             category: 'delivery',  logo: '/logos/deliveroo.svg' },
  { id: 'ifood',        name: 'iFood',                 category: 'delivery',  logo: '/logos/ifood.svg' },

  // ─── Viagens ───
  { id: 'airbnb',       name: 'Airbnb',                category: 'travel',    logo: '/logos/airbnb.svg' },
  { id: 'booking',      name: 'Booking',               category: 'travel',    logo: '/logos/booking.svg' },

  // ─── Entretenimento ───
  { id: 'netflix',      name: 'Netflix',               category: 'other',     logo: '/logos/netflix.svg' },
  { id: 'spotify',      name: 'Spotify',               category: 'other',     logo: '/logos/spotify.svg' },
  { id: 'openai',       name: 'OpenAI / ChatGPT',      category: 'other',     logo: '/logos/openai.svg' },

  // ─── Datas / encontros ───
  { id: 'tinder',       name: 'Tinder',                category: 'other',     logo: '/logos/tinder.svg' },
  { id: 'badoo',        name: 'Badoo',                 category: 'other',     logo: '/logos/badoo.svg' },
  { id: 'hinge',        name: 'Hinge',                 category: 'other',     logo: '/logos/hinge.svg' },
  { id: 'grindr',       name: 'Grindr',                category: 'other',     logo: '/logos/grindr.svg' },
  { id: 'pof',          name: 'POF',                   category: 'other',     logo: '/logos/pof.svg' },
  { id: 'skout',        name: 'Skout',                 category: 'other',     logo: '/logos/skout.svg' },
  { id: 'hily',         name: 'Hily',                  category: 'other',     logo: '/logos/hily.svg' },
];

export const categories = [
  { id: 'all',       label: 'Todos' },
  { id: 'social',    label: 'Redes sociais' },
  { id: 'bank',      label: 'Bancos' },
  { id: 'shopping',  label: 'Compras' },
  { id: 'finance',   label: 'Financeiro' },
  { id: 'games',     label: 'Jogos' },
  { id: 'transport', label: 'Transporte' },
  { id: 'delivery',  label: 'Delivery' },
  { id: 'travel',    label: 'Viagens' },
];

export function getService(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}