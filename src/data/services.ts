// src/data/services.ts

export interface Service {
  id: string;
  name: string;
  category: string;
  logo: string;
}

const service = (
  id: string,
  name: string,
  category: string,
  logoId = id,
): Service => ({
  id,
  name,
  category,
  logo: `https://cdn.simpleicons.org/${logoId}`,
});

export const services: Service[] = [
  // ─── REDES SOCIAIS E MENSAGENS ───
  service('whatsapp', 'WhatsApp', 'social'),
  service('telegram', 'Telegram', 'social'),
  service('facebook', 'Facebook', 'social'),
  service('instagram', 'Instagram', 'social'),
  service('tiktok', 'TikTok', 'social'),
  service('discord', 'Discord', 'social'),
  service('snapchat', 'Snapchat', 'social'),
  service('twitter', 'X (Twitter)', 'social', 'x'),
  service('viber', 'Viber', 'social'),
  service('wechat', 'WeChat', 'social'),
  service('line', 'LINE', 'social'),
  service('kakaotalk', 'KakaoTalk', 'social'),
  service('imo', 'imo', 'social'),
  service('zalo', 'Zalo', 'social'),
  service('linkedin', 'LinkedIn', 'social'),
  service('googlechat', 'Google Chat', 'social'),
  service('googlemessenger', 'Google Messenger', 'social'),
  service('vk', 'VK', 'social'),
  service('yalla', 'Yalla', 'social'),
  service('soulapp', 'Soul App', 'social'),
  service('redbook', 'RED / Xiaohongshu', 'social'),
  service('tencentqq', 'Tencent QQ', 'social'),
  service('bigo', 'BIGO LIVE', 'social'),

  // ─── TECNOLOGIA E CONTAS ───
  service('google', 'Google / Gmail / YouTube', 'technology'),
  service('microsoft', 'Microsoft', 'technology'),
  service('apple', 'Apple', 'technology'),
  service('yahoo', 'Yahoo', 'technology'),
  service('aol', 'AOL', 'technology'),
  service('mailru', 'Mail.ru', 'technology', 'maildotru'),
  service('yandex', 'Yandex', 'technology'),
  service('baidu', 'Baidu', 'technology'),
  service('naver', 'NAVER', 'technology'),
  service('zoho', 'Zoho', 'technology'),
  service('openai', 'OpenAI / ChatGPT', 'technology'),

  // ─── BANCOS E FINANÇAS (LOCAIS E GLOBAIS) ───
  // Globais
  service('wise', 'Wise', 'finance'),
  service('paypal', 'PayPal', 'finance'),
  service('coinbase', 'Coinbase', 'finance'),
  
  // Brasil
  service('nubank', 'Nubank', 'bank'),
  service('itau', 'Itaú Unibanco', 'bank'),
  service('bradesco', 'Bradesco', 'bank'),
  service('bancodobrasil', 'Banco do Brasil', 'bank'),
  service('caixa', 'Caixa Econômica', 'bank'),
  service('santander_br', 'Santander Brasil', 'bank', 'santander'),
  service('inter', 'Banco Inter', 'bank'),
  service('c6bank', 'C6 Bank', 'bank'),
  service('picpay', 'PicPay', 'bank'),
  service('pagbank', 'PagBank', 'bank'),
  service('mercadopago', 'Mercado Pago', 'bank'),

  // Moçambique
  service('bci', 'BCI', 'bank'),
  service('bim', 'BIM', 'bank'),
  service('millenniumbim', 'Millennium bim', 'bank'),
  service('standardbank_mz', 'Standard Bank', 'bank', 'standardbank'),
  service('absa_mz', 'Absa', 'bank', 'absa'),
  service('bancounico', 'Banco Único', 'bank'),
  service('moza', 'Moza Banco', 'bank'),

  // Portugal
  service('millenniumbcp', 'Millennium BCP', 'bank'),
  service('novobanco', 'Novo Banco', 'bank'),
  service('cgd', 'Caixa Geral de Depósitos', 'bank'),
  service('revolut', 'Revolut', 'bank'),

  // África do Sul (Novos)
  service('capitec', 'Capitec Bank', 'bank'),
  service('fnb', 'FNB', 'bank'),
  service('nedbank', 'Nedbank', 'bank'),

  // Estados Unidos (Novos)
  service('chase', 'Chase', 'bank'),
  service('bankofamerica', 'Bank of America', 'bank'),
  service('wellsfargo', 'Wells Fargo', 'bank'),
  service('citi', 'Citi', 'bank'),

  // Índia (Novos)
  service('hdfc', 'HDFC Bank', 'bank'),
  service('icici', 'ICICI Bank', 'bank'),
  service('sbi', 'State Bank of India', 'bank'),

  // Angola (Novos)
  service('bai', 'BAI', 'bank'),
  service('bfa', 'BFA', 'bank'),
  service('bic_ao', 'BIC Angola', 'bank'),

  // Nigéria (Novos)
  service('accessbank', 'Access Bank', 'bank'),
  service('gtbank', 'GTBank', 'bank'),
  service('zenithbank', 'Zenith Bank', 'bank'),

  // Reino Unido (Novos)
  service('barclays', 'Barclays', 'bank'),
  service('hsbc', 'HSBC', 'bank'),
  service('lloyds', 'Lloyds Bank', 'bank'),
  service('monzo', 'Monzo', 'bank'),

  // ─── COMPRAS ───
  service('amazon', 'Amazon', 'shopping'),
  service('aliexpress', 'AliExpress', 'shopping'),
  service('shein', 'SHEIN', 'shopping'),
  service('ebay', 'eBay', 'shopping'),
  service('shopee', 'Shopee', 'shopping'),
  service('walmart', 'Walmart', 'shopping'),
  service('olx', 'OLX', 'shopping'),
  service('alibaba', 'Alibaba / Alipay', 'shopping', 'alibabadotcom'),
  service('jd', 'JD.com', 'shopping'),
  service('flipkart', 'Flipkart', 'shopping'),

  // ─── JOGOS ───
  service('steam', 'Steam', 'games'),
  service('roblox', 'Roblox', 'games'),
  service('twitch', 'Twitch', 'games'),
  service('blizzard', 'Blizzard', 'games'),

  // ─── TRANSPORTE ───
  service('uber', 'Uber', 'transport'),
  service('bolt', 'Bolt', 'transport'),
  service('blablacar', 'BlaBlaCar', 'transport'),
  service('didi', 'DiDi', 'transport'),
  service('lyft', 'Lyft', 'transport'),
  service('ola', 'Ola', 'transport'),

  // ─── ENTREGAS E RESTAURAÇÃO ───
  service('glovo', 'Glovo', 'delivery'),
  service('ubereats', 'Uber Eats', 'delivery'),
  service('foodpanda', 'foodpanda', 'delivery'),
  service('mcdonalds', "McDonald's", 'delivery'),
  service('burgerking', 'Burger King', 'delivery'),
  service('ifood', 'iFood', 'delivery'),
  service('swiggy', 'Swiggy', 'delivery'),
  service('zomato', 'Zomato', 'delivery'),

  // ─── VIAGENS ───
  service('airbnb', 'Airbnb', 'travel'),
  service('booking', 'Booking.com', 'travel', 'bookingdotcom'),

  // ─── ENTRETENIMENTO ───
  service('netflix', 'Netflix', 'entertainment'),
  service('spotify', 'Spotify', 'entertainment'),

  // ─── ENCONTROS ───
  service('tinder', 'Tinder', 'dating'),
  service('badoo', 'Badoo', 'dating'),
  service('hinge', 'Hinge', 'dating'),

  // ─── OUTROS E "QUALQUER SERVIÇO" ───
  service('nike', 'Nike', 'other'),
  service('cocacola', 'Coca-Cola', 'other'),
  
  // 🌟 A OPÇÃO MÁGICA DE PESQUISA (Tem de ser o último)
  { id: 'anyother', name: 'Qualquer Serviço (Pesquisar)', category: 'other', logo: 'https://cdn.simpleicons.org/amp' },
];

export const categories = [
  { id: 'all', label: 'Todos os serviços' },
  { id: 'social', label: 'Redes sociais' },
  { id: 'bank', label: 'Bancos' },
  { id: 'finance', label: 'Finanças' },
  { id: 'shopping', label: 'Compras' },
  { id: 'games', label: 'Jogos' },
  { id: 'transport', label: 'Transporte' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'travel', label: 'Viagens' },
  { id: 'other', label: 'Outros' },
];

export function getService(id: string): Service | undefined {
  return services.find((item) => item.id === id);
}