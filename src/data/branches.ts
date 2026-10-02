export interface BranchContact {
  name?: string;
  title?: string;
  phone: string;
  phoneDisplay: string;
  whatsapp?: string;
}

export interface Branch {
  id: 'eryaman' | 'ostim';
  name: string;
  shortName: string;
  tag: string;
  district: string;
  city: string;
  address: string;
  addressShort: string;
  contacts: BranchContact[];
  mapQuery: string;
  mapEmbedUrl?: string;
  mapDirectUrl?: string;
  badge: string;
  features: string[];
}

export const BRANCHES: Branch[] = [
  {
    id: 'eryaman',
    name: 'Eryaman Şubesi',
    shortName: 'Eryaman',
    tag: '1. Şube',
    district: 'Etimesgut / ANKARA',
    city: 'ANKARA',
    address: 'Şeyh Şamil Mahallesi 1. TBMM Caddesi No:59/4 Eryaman Etimesgut / ANKARA',
    addressShort: 'Şeyh Şamil Mah. 1.TBMM Cad. No:59/4 Eryaman Etimesgut / ANKARA',
    contacts: [
      {
        name: 'Şube Danışma & Destek',
        title: 'Müşteri Temsilcisi',
        phone: '05459603303',
        phoneDisplay: '0545 960 33 03',
        whatsapp: '905459603303'
      }
    ],
    mapQuery: 'E-imza Ankara (Edijitalfinans)',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3056.6763032250146!2d32.63046077643676!3d39.99333858129908!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d3370c244bea15%3A0xa84251266c788ef8!2sE-imza%20Ankara%20(Edijitalfinans)!5e0!3m2!1str!2str!4v1790930280625!5m2!1str!2str',
    mapDirectUrl: 'https://maps.google.com/?cid=12124316987472023288',
    badge: '1. Şube • Etimesgut',
    features: ['15 Dakikada E-İmza Teslimatı', 'Ücretsiz Kurulum Desteği', 'Kolay Ulaşım & Otopark']
  },
  {
    id: 'ostim',
    name: 'Ostim Şubesi',
    shortName: 'Ostim',
    tag: '2. Şube',
    district: 'Yenimahalle / ANKARA',
    city: 'ANKARA',
    address: 'Ostim OSB, 100. Yıl Blv. Prestij Plaza No:55 A Blok No:20 Kat:2 Yenimahalle / ANKARA',
    addressShort: 'Ostim OSB, 100. Yıl Blv. Prestij Plaza No:55 A Blok Kat:2 Yenimahalle / ANKARA',
    contacts: [
      {
        name: 'Simanur Kaya',
        title: 'Müşteri Temsilcisi',
        phone: '05432460655',
        phoneDisplay: '0543 246 06 55',
        whatsapp: '905432460655'
      },
      {
        name: 'Cenk Gürses',
        title: 'Müşteri Temsilcisi',
        phone: '05412870655',
        phoneDisplay: '0541 287 06 55',
        whatsapp: '905412870655'
      }
    ],
    mapQuery: 'Ankara E İmza Ostim Şubesi',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3057.736063909221!2d32.74235607643588!3d39.96965338272806!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d349eff3b22c0d%3A0xd83c8ac12235d9f0!2sAnkara%20E%20%C4%B0mza%20Ostim%20%C5%9Eubesi!5e0!3m2!1str!2str!4v1790930201420!5m2!1str!2str',
    mapDirectUrl: 'https://maps.google.com/?cid=15581699960205892080',
    badge: '2. Şube • Yenimahalle',
    features: ['Prestij Plaza A Blok Kat:2', '15 Dakikada Anında Teslim', 'Merkezi Lokasyon']
  }
];
