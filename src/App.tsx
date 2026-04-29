/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Utensils, 
  Gamepad2, 
  Award, 
  ChevronRight, 
  Menu, 
  X,
  ExternalLink,
  Instagram,
  Mail
} from 'lucide-react';

// --- Types ---
interface EventItem {
  time: string;
  title: string;
  description?: string;
  highlight?: boolean;
}

interface Vendor {
  name: string;
  type: string;
  items: string[];
  id: string; // Used for images and logos
}

interface Game {
  name: string;
  location: string;
  description: string;
  emoji: string;
}

// --- Data ---
const PROGRAM = {
  en: [
    { time: '16:00', title: 'Opening Ceremony', description: '開幕儀式', highlight: true },
    { time: '16:45', title: 'Market & Lucky Draw Start', description: '攤位與抽獎開始', highlight: true },
    { time: '20:50', title: 'Big Lucky Draw', description: '閉幕大抽獎', highlight: true },
    { time: '21:00', title: 'After Party', description: 'Social & Celebration', highlight: false },
  ],
  zh: [
    { time: '16:00', title: '開幕儀式', description: 'Opening Ceremony', highlight: true },
    { time: '16:45', title: '攤位與抽獎開始', description: 'Market & Lucky Draw Start', highlight: true },
    { time: '20:50', title: '閉幕大抽獎', description: 'Big Lucky Draw', highlight: true },
    { time: '21:00', title: 'After Party', description: 'Social & Celebration', highlight: false },
  ]
};

const VENDORS: ({ en: Vendor, zh: Vendor })[] = [
  { 
    en: { name: 'Ms. Brenda', type: 'Salty & Sweet', items: ['Taiwanese Stir-fried Vermicelli', 'Assorted Braised Platters', 'Zongzi (Rice Dumplings)', 'Cau-A-Kue', 'Hakka Vegetable Buns', 'Handmade Taiwanese Bread', 'Handmade Fruit Tea'], id: 'ms_brenda' },
    zh: { name: 'Ms. Brenda', type: 'Salty & Sweet', items: ['台式米粉炒', '台式綜合滷味', '肉粽', '草仔粿', '客家菜包', '手工台式麵包', '手工水果茶'], id: 'ms_brenda' }
  },
  { 
    en: { name: 'Chow It Out', type: 'Desserts & Soup', items: ['Mango Matcha Panna Cotta', 'Caramel Custard Puffs', 'Tieguanyin Cake Roll', 'Basque Cheesecake', 'Ancient Brown Sugar Sweet Soup', 'Medicinal Pork Rib Soup'], id: 'chow_it_out' },
    zh: { name: 'Chow It Out', type: 'Desserts & Soup', items: ['芒果抹茶素奶酪', '焦糖卡士達泡芙', '鐵觀音奶凍捲', '巴斯克起司蛋糕', '古早味黑糖甜湯', '藥燉排骨'], id: 'chow_it_out' }
  },
  { 
    en: { name: '9ijs', type: 'Shaved Ice', items: ['Snow Ice (Strawberry, Mango, Red Bean, Peanut)', 'Sijichun Tea'], id: '9ijs' },
    zh: { name: '9ijs', type: 'Shaved Ice', items: ['雪花冰 (草莓・芒果・紅豆・花生)', '四季春茶'], id: '9ijs' }
  },
  { 
    en: { name: 'K\'s FAN', type: 'Rice & Drinks', items: ['Classic Taiwanese Oil Rice', 'Traditional Tainan Sticky Rice', 'Sesame Oil Mushroom Rice', 'Taro Ball Jelly', 'Plum Green Tea', 'Cold Brew Tea'], id: 'ks_fan' },
    zh: { name: 'K\'s FAN', type: 'Rice & Drinks', items: ['經典台式油飯', '傳統台南米糕', '麻油杏鮑菇飯', '芋圓仙草凍', '梅子綠茶', '冷泡茶'], id: 'ks_fan' }
  },
  { 
    en: { name: 'Veggie Garden', type: 'Vegetarian', items: ['Vegetarian Chicken Cutlet', 'Onigiri (Kimchi/Tuna/Ham & Corn)', 'Tieguanyin Soft Serve', 'Winter Melon Tea', 'Taiwanese Cold Brew Tea'], id: 'veggie_garden' },
    zh: { name: 'Veggie Garden', type: 'Vegetarian', items: ['素雞排', '御飯糰 (泡菜/鮪魚/火腿玉米)', '鐵觀音霜淇淋', '冬瓜茶', '台灣冷泡茶'], id: 'veggie_garden' }
  },
  { 
    en: { name: 'V-Kitchen', type: 'Taiwanese Snacks', items: ['Taiwanese Meatballs (Ba-wan)'], id: 'v_kitchen' },
    zh: { name: 'V 記美食', type: 'Taiwanese Snacks', items: ['台式肉圓'], id: 'v_kitchen' }
  },
  { 
    en: { name: 'Machi Machi', type: 'Beverages', items: ['Bubble Tea', 'Sun Moon Lake Black Tea + Kanten', 'Orange Green Tea + Coconut Jelly'], id: 'machi_machi' },
    zh: { name: 'Machi Machi', type: 'Beverages', items: ['珍珠奶茶 Bubble Tea', '日月潭紅茶 + 寒天', '柳橙綠茶 + 椰果'], id: 'machi_machi' }
  },
  { 
    en: { name: 'Mei\'s Kitchen', type: 'Gua Bao & Veg', items: ['Classic Gua Bao', 'Vegetarian Gua Bao', 'Tempeh Gua Bao', 'Taiwanese Veggie Noodle Soup', 'Tea Eggs', 'Pineapple Cakes'], id: 'meis_kitchen' },
    zh: { name: 'Mei\'s Kitchen', type: 'Gua Bao & Veg', items: ['花生滷蛋刈包', '糖醋素雞刈包', '天貝刈包', '台式素湯麵', '茶葉蛋', '鳳梨酥'], id: 'meis_kitchen' }
  },
  { 
    en: { name: 'Little Book Project', type: 'Creative Selection', items: ['Little Book Project', 'Taiwanese Creative Design Items'], id: 'little_book' },
    zh: { name: '小冊選書', type: 'Creative Selection', items: ['Little Book Project', '台灣文創設計商品'], id: 'little_book' }
  },
  { 
    en: { name: 'Bao & Bowl', type: 'Mains', items: ['Handmade Braised Pork Gua Bao', 'Handmade Tofu Gua Bao', 'Hand-cut Braised Pork Rice', 'Taiwanese Cold Noodles', 'Taiwanese Grilled Sausage'], id: 'bao_bowl' },
    zh: { name: 'Bao & Bowl', type: 'Mains', items: ['手工爌肉刈包', '手工滷豆腐刈包', '手切滷肉飯', '台式涼麵', '台式烤香腸'] , id: 'bao_bowl'}
  },
  { 
    en: { name: 'Cha Bar', type: 'Tea Specialties', items: ['Specialty Taiwanese Tea', 'Taiwanese Cold Brew Tea'], id: 'cha_bar' },
    zh: { name: 'Cha Bar — 呷吧', type: 'Tea Specialties', items: ['特色台灣茶飲', '台灣冷泡茶'], id: 'cha_bar' }
  },
  { 
    en: { name: 'Design Studio Samaya', type: 'Design & Craft', items: ['Taiwan Style Design Postcards', 'Cultural Creative Merch', 'Art Selection'], id: 'samaya' },
    zh: { name: 'Design Studio Samaya', type: 'Design & Craft', items: ['台味設計明信片', '文化創意週邊', '藝術選品'], id: 'samaya' }
  },
  { 
    en: { name: 'DTSO', type: 'Official Booth', items: ['Tote Bag', 'Postcards', 'Taiwan Beer', 'HeySong Sarsaparilla', 'Barley Black Tea', 'Tea Eggs', 'Taiwanese Snack Gift Pack'], id: 'dtso' },
    zh: { name: 'DTSO 學生會', type: 'Official Booth', items: ['帆布袋', '明信片', '台灣啤酒', '黑松沙士', '麥香紅茶', '茶葉蛋', '台灣零食禮包'], id: 'dtso' }
  },
];

const GAMES = {
  en: [
    { name: 'Sandbag Toss', location: 'Outdoor', description: 'Traditional Night Market Classic: Knock down can towers with sandbags.', emoji: '' },
    { name: 'Ring Toss', location: 'Outdoor', description: 'Night Market Essential: A traditional game testing your steadiness.', emoji: '' },
    { name: 'Bottle Fishing', location: 'Outdoor', description: 'The ultimate challenge of balance and patience.', emoji: '' },
    { name: 'Marbles', location: 'Indoor 1F', description: 'Retro wooden marble machines, reliving childhood memories.', emoji: '' },
    { name: 'Culture Match', location: 'Indoor 1F', description: 'Fun cultural knowledge competition to win small gifts.', emoji: '' },
    { name: 'Calligraphy', location: 'Indoor 2F', description: 'Write with brush and ink, experience the beauty of traditional writing.', emoji: '' },
  ],
  zh: [
    { name: '沙包丟鋁罐', location: '戶外區', description: '傳統夜市經典遊戲：用沙包擊倒鋁罐塔', emoji: '' },
    { name: '套圈圈', location: '戶外區', description: '夜市必備：考驗手感的傳統童玩', emoji: '' },
    { name: '撈酒瓶', location: '戶外區', description: '平衡與耐心的終極挑戰', emoji: '' },
    { name: '打彈珠', location: '室內一樓', description: '復古木製彈珠台，帶你重溫兒時記憶', emoji: '' },
    { name: '文化黑白配', location: '室內一樓', description: '文化知識趣味競賽，贏得精美小禮', emoji: '' },
    { name: '書法體驗', location: '室內二樓', description: '親手揮毫，體驗傳統筆墨之美', emoji: '' },
  ]
};

// --- Components ---

const VendorModal = ({ vendor, onClose, lang }: { vendor: Vendor, onClose: () => void, lang: 'en' | 'zh' }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-ink/80 backdrop-blur-sm"
    onClick={onClose}
  >
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-brand-cream border editorial-divider max-w-4xl w-full flex flex-col md:flex-row relative overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
      <button onClick={onClose} className="absolute top-6 right-6 z-10 hover:text-brand-accent transition-colors bg-brand-cream/50 p-2 rounded-full backdrop-blur-sm">
        <X size={20} />
      </button>
      
      {/* Left: Text Content */}
      <div className="flex-1 p-12">
        <span className="label-xs text-brand-accent mb-4 block uppercase flex items-center gap-2">
          <Award size={10} /> {vendor.type}
        </span>
        <h3 className="font-serif text-4xl font-black mb-8">{vendor.name}</h3>
        <div className="space-y-4">
          <p className="label-xs opacity-40 mb-2">{lang === 'en' ? 'Selected Items' : '販售項目'}</p>
          <ul className="space-y-3 prose font-display">
            {vendor.items.map((item, i) => (
              <li key={i} className="font-serif text-lg border-b editorial-divider pb-2 flex justify-between items-center group">
                <span className="opacity-90">{item}</span>
                <div className="h-px w-0 bg-brand-accent group-hover:w-8 transition-all duration-500" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right: Photo Space */}
      <div className="w-full md:w-2/5 bg-brand-ink/5 flex items-center justify-center border-l editorial-divider min-h-[300px]">
        <img 
          src={`${import.meta.env.BASE_URL}photos/vendors/${vendor.id}.png`} 
          alt={vendor.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x800?text=Photo+Coming+Soon';
          }}
        />
      </div>
    </motion.div>
  </motion.div>
);

const Navbar = ({ lang, setLang }: { lang: 'en' | 'zh', setLang: (l: 'en' | 'zh') => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: lang === 'en' ? 'About' : '關於活動', href: '#about' },
    { name: lang === 'en' ? 'Programme' : '活動細流', href: '#schedule' },
    { name: lang === 'en' ? 'Vendors' : '攤販遊戲', href: '#vendors' },
    { name: lang === 'en' ? 'Sponsors' : '贊助夥伴', href: '#sponsors' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b editorial-divider ${scrolled ? 'bg-brand-cream/90 backdrop-blur-md py-4' : 'bg-transparent py-8'}`}>
      <div className="px-12 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/dtso.png`} alt="DTSO" className="h-10 w-10 object-contain" />
          <a href="#" className="label-xs not-italic tracking-widest">
            TAIWAN CULTURE NIGHT <span className="opacity-40 ml-2">DELFT</span>
          </a>
        </div>
        
        {/* Top Right: Actions Group */}
        <div className="flex items-center gap-6">
          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-[10px] uppercase tracking-widest font-bold hover:text-brand-accent transition-colors"
              >
                {link.name}
              </a>
            ))}
            <a href="#location" className="text-[10px] uppercase tracking-widest font-bold bg-brand-accent text-brand-cream px-4 py-1.5 hover:bg-brand-ink transition-colors">
              {lang === 'en' ? 'Location' : '活動地點'}
            </a>
          </div>

          {/* Language Toggle (Show opposite) */}
          <button 
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            className="text-[10px] bg-brand-ink text-brand-cream px-3 py-1.5 uppercase tracking-widest font-bold border border-brand-ink hover:bg-brand-cream hover:text-brand-ink transition-all"
          >
            {lang === 'en' ? 'ZH' : 'EN'}
          </button>

          <button className="text-brand-ink md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-brand-cream border-t border-brand-ink/10 flex flex-col items-center py-12 space-y-8 md:hidden shadow-xl"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className="font-serif text-2xl"
              >
                {link.name}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ lang }: { lang: 'en' | 'zh' }) => {
  return (
    <section className="relative min-h-[85vh] grid grid-cols-12 border-b editorial-divider">
      {/* Left Column: Title & Intro */}
      <div className="col-span-12 lg:col-span-5 p-12 border-r editorial-divider flex flex-col justify-between pt-32">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <span className="label-xs text-gray-400 mb-6 block uppercase">Delft / 2026</span>
          <h1 className="text-[120px] leading-[0.9] font-serif font-black mb-10 -ml-1 not-italic">
            台灣<br />之夜
          </h1>
          <p className="text-lg leading-[1.8] text-brand-ink/80 font-light max-w-sm mb-12">
            {lang === 'en' 
              ? 'A curated evening celebrating the vibrant heritage and modern innovation of Taiwan. Experience authentic flavors, soundscapes, and design in the heart of Delft.'
              : '一場集結台灣豐富文化與現代創意的盛會。在台夫特市中心，與我們一同體驗最在地的人情味、美食與設計。'
            }
          </p>
          
          <div className="flex flex-col space-y-6 pt-4">
             <div className="flex items-center space-x-3 text-sm uppercase tracking-[0.2em] font-bold text-brand-accent">
               <Calendar size={18} />
               <span>{lang === 'en' ? 'Saturday, May 09, 2026' : '2026年5月9日 (六)'}</span>
             </div>
             <div className="flex items-center space-x-3 text-sm uppercase tracking-[0.2em] font-bold text-brand-accent">
               <Clock size={18} />
               <span>16:00 – 21:00</span>
             </div>
          </div>
        </motion.div>

        <div className="mt-20">
          <h3 className="label-xs mb-6 opacity-30 uppercase tracking-widest">{lang === 'en' ? 'Support' : '支持單位'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="border editorial-divider p-4 text-[10px] uppercase font-bold tracking-tight grayscale opacity-70 flex items-center justify-center text-center">Cultural Division</div>
            <div className="border editorial-divider p-4 text-[10px] uppercase font-bold tracking-tight grayscale opacity-70 flex items-center justify-center text-center">Education Division</div>
          </div>
        </div>
      </div>

      {/* Right Column: Hero Visual Overlay */}
      <div className="col-span-12 lg:col-span-7 relative overflow-hidden bg-brand-ink/60 pt-32 lg:pt-0 backdrop-blur-[2px]">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/20 via-brand-ink/90 to-black z-10" />
        {/* Placeholder for Main Visual Background */}
        <div className="absolute inset-0 opacity-60 mix-blend-overlay">
           <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-accent/40 via-transparent to-transparent" />
        </div>
        
        <div className="relative z-20 h-full flex flex-col justify-center items-center p-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
          >
            <h2 className="text-brand-cream/20 font-serif text-[15vw] font-black leading-none select-none">TAIWAN</h2>
            <div className="mt-[-5vw]">
               <span className="text-brand-cream font-sans text-xs uppercase tracking-[1em] opacity-80">Culture Night</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const SectionHeading = ({ zh, en, number }: { zh: string, en: string, number: string }) => (
  <div className="flex flex-col mb-16 relative">
    <div className="flex items-baseline space-x-4">
      <span className="font-display text-6xl font-light text-brand-accent opacity-20">{number}</span>
      <h2 className="font-serif text-4xl md:text-5xl font-bold">{en}</h2>
    </div>
    <span className="font-sans text-[11px] uppercase tracking-[0.4em] text-brand-accent ml-20">{zh}</span>
    <div className="h-1 w-12 bg-brand-accent mt-4 ml-20" />
  </div>
);

export default function App() {
  const [lang, setLang] = useState<'en' | 'zh'>('en');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const { scrollY } = useScroll();
  
  // Parallax transforms
  const bgY1 = useTransform(scrollY, [0, 5000], [0, -200]);
  const bgY2 = useTransform(scrollY, [0, 5000], [200, 0]);

  return (
    <div className="relative text-brand-ink min-h-screen flex flex-col editorial-thick-border box-border overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-[-10] pointer-events-none bg-brand-cream" />
      <div className="fixed inset-0 z-[-5] pointer-events-none overflow-hidden opacity-40">
        <div className="absolute inset-0 bg-brand-accent/5 z-0" />
        <motion.div style={{ y: bgY1 }} className="absolute top-0 left-0 w-full h-[150vh]">
          <img src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/bg_street.png`} alt="BG 1" className="w-full h-full object-cover opacity-20" />
        </motion.div>
        <motion.div style={{ y: bgY2 }} className="absolute bottom-[-50vh] left-0 w-full h-[150vh]">
          <img src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/bg_lanterns.png`} alt="BG 2" className="w-full h-full object-cover opacity-20" />
        </motion.div>
      </div>

      <div className="relative z-10">
        <AnimatePresence>
        {selectedVendor && (
          <VendorModal 
            vendor={selectedVendor} 
            onClose={() => setSelectedVendor(null)} 
            lang={lang}
          />
        )}
      </AnimatePresence>
      <Navbar lang={lang} setLang={setLang} />
      <Hero lang={lang} />

      {/* About Section */}
      <section id="about" className="grid grid-cols-12 border-b editorial-divider backdrop-blur-sm bg-brand-cream/60">
        <div className="col-span-12 lg:col-span-5 p-12 border-r editorial-divider flex flex-col justify-center">
            <h3 className="font-serif text-5xl leading-[1.3] mb-12 not-italic">
              {lang === 'en' ? <>Showcasing Taiwan<br />to the World from Delft</> : <>讓世界在<br />台夫特看見台灣</>}
            </h3>
            <div className="space-y-6 font-light leading-[1.8] text-base text-brand-ink/80 opacity-80">
              <p>
                {lang === 'en' 
                  ? 'Taiwan Culture Night is our flagship annual event, bringing the warmth of the Formosan spirit to the heart of Delft.'
                  : '台夫特台灣之夜是我們年度的旗艦活動，將福爾摩沙的溫暖帶到台夫特的心臟地帶。'
                }
              </p>
              <p>
                {lang === 'en'
                  ? 'Join us for a sensory journey blending street food, traditional arts, and contemporary community connection.'
                  : '這是一場結合街頭美食、傳統藝術與當代社群交流的感官之旅。'
                }
              </p>
            </div>
        </div>
        <div className="col-span-12 lg:col-span-7 bg-white/40 p-12 flex flex-col justify-center relative overflow-hidden group">
           <div className="label-xs mb-10 opacity-30">{lang === 'en' ? 'Estimated Attendance' : '預計參與'}</div>
           <div className="grid grid-cols-2 gap-12 relative z-10">
              <div>
                <span className="block text-7xl font-serif mb-2 tracking-tighter text-brand-accent">500<sup>+</sup></span>
                <span className="label-xs opacity-50">{lang === 'en' ? 'Guests' : '預計嘉賓'}</span>
              </div>
              <div>
                <span className="block text-7xl font-serif mb-2 tracking-tighter text-brand-accent">13</span>
                <span className="label-xs opacity-50">{lang === 'en' ? 'Vendors' : '參與攤位'}</span>
              </div>
           </div>
           {/* Decorative shape */}
           <div className="absolute top-1/2 right-0 translate-x-1/4 -translate-y-1/2 text-[30vw] font-serif font-black opacity-[0.03] select-none pointer-events-none">
             島
           </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="py-32 bg-brand-ink/95 text-brand-cream overflow-hidden backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <SectionHeading zh="活動細流" en="Programme" number="01" />
          
          <div className="space-y-0">
            {PROGRAM[lang].map((item, idx) => (
              <motion.div 
                key={idx}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row items-start md:items-center py-8 border-b border-brand-cream/10 group ${item.highlight ? 'bg-brand-cream/5 -mx-6 px-6' : ''}`}
              >
                <div className="w-32 mb-2 md:mb-0">
                  <span className="font-display text-2xl font-light text-brand-accent/60 group-hover:text-brand-accent transition-colors">{item.time}</span>
                </div>
                <div className="flex-1">
                  <h4 className={`text-xl font-serif ${item.highlight ? 'text-brand-accent' : ''}`}>{item.title}</h4>
                  {item.description && <p className="text-sm opacity-60 font-light mt-1 uppercase tracking-widest">{item.description}</p>}
                </div>
                <div className="hidden md:block">
                  <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all text-brand-accent" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="vendors" className="grid grid-cols-12 border-b editorial-divider bg-white/40 backdrop-blur-sm text-brand-ink">
        {/* Market column */}
        <div className="col-span-12 lg:col-span-5 p-12 border-r editorial-divider bg-white/60">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-4xl font-serif">{lang === 'en' ? 'Main Market' : '美食市集'}</h2>
          </div>
          <div className="space-y-4">
            {VENDORS.map((v, i) => (
              <button 
                key={i} 
                onClick={() => setSelectedVendor(v[lang])}
                className="group w-full text-left border-b editorial-divider pb-4 last:border-0 outline-none"
              >
                <div className="flex-1 flex justify-between items-baseline">
                  <h5 className="font-serif text-xl group-hover:text-brand-accent transition-colors font-bold uppercase">{v[lang].name}</h5>
                  <div className="flex items-center gap-4">
                    <img 
                      src={`${import.meta.env.BASE_URL}logos/vendors/${v[lang].id}.png`} 
                      alt="" 
                      className="w-10 h-10 object-contain transition-all"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-30 group-hover:opacity-100 transition-opacity underline decoration-brand-accent decoration-2 underline-offset-4">{lang === 'en' ? 'Detail +' : '詳情 +'}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Culture column */}
        <div className="col-span-12 lg:col-span-7 p-12 flex flex-col bg-brand-cream/40">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-4xl font-serif">{lang === 'en' ? 'Cultural Experience' : '文化體驗'}</h2>
          </div>
          <div className="flex flex-col space-y-12">
            {GAMES[lang].map((game, i) => (
              <div key={i} className="flex gap-10 items-start group">
                <div className="w-16 h-16 bg-brand-ink/5 flex items-center justify-center font-display text-lg font-bold opacity-30 group-hover:bg-brand-accent group-hover:text-white group-hover:opacity-100 transition-all shrink-0">
                  0{i + 1}
                </div>
                <div>
                  <h5 className="font-serif text-3xl leading-tight mb-2 font-bold group-hover:text-brand-accent transition-colors">{game.name}</h5>
                  <p className="text-xs uppercase tracking-widest text-brand-accent font-bold mb-4">{game.location}</p>
                  <p className="text-sm opacity-60 font-light leading-relaxed max-w-lg">{game.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section id="sponsors" className="py-32 bg-white/40 backdrop-blur-sm border-b editorial-divider">
        <div className="container mx-auto px-6">
          <SectionHeading zh="贊助夥伴" en="Sponsors" number="03" />
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 items-start">
             {[
               { id: 'office', zh: '駐荷蘭台北代表處', en: 'Taipei Representative Office in the Netherlands' },
               { id: 'moe', zh: '台灣教育部', en: 'Education Division, Ministry of Education' },
               { id: 'tba', zh: '荷蘭台灣商會', en: 'Taiwan Business Association in the Netherlands' },
               { id: 'school', zh: '荷蘭台北學校', en: 'Taipei School in the Netherlands' },
               { id: 'typin', zh: '荷蘭台灣專業青年會', en: 'Taiwanese Junior Chamber Professionals Netherlands' }
             ].map(sponsor => (
               <div key={sponsor.id} className="flex flex-col items-center text-center group">
                 <div className="h-24 w-full flex items-center justify-center mb-6 transition-all duration-500">
                    <img 
                      src={`${import.meta.env.BASE_URL}logos/sponsors/${sponsor.id}.png`} 
                      alt={sponsor.zh}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                 </div>
                 <span className="font-serif text-lg leading-snug opacity-80 group-hover:opacity-100 transition-opacity">
                   {lang === 'zh' ? sponsor.zh : sponsor.en}
                 </span>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-32 bg-white/40 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <SectionHeading zh="活動地點" en="Venue & Location" number="04" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="bg-brand-cream/80 backdrop-blur-sm p-12 space-y-6 text-brand-ink">
                <div>
                  <h4 className="font-serif text-2xl mb-2">DUWO Common Room</h4>
                  <p className="opacity-70 font-light italic text-sm">Professor Schermerhornstraat 4, 2628 PZ Delft</p>
                </div>
                <div className="h-px w-full bg-brand-ink/10" />
                <div className="space-y-4 text-sm font-light leading-relaxed">
                  <p>
                    <strong>{lang === 'en' ? 'By Bike:' : '騎自行車：'}</strong> 
                    {lang === 'en' ? ' Only 5 minutes from TU Delft Library. Ample bike parking available.' : ' 距離 TU Delft 圖書館僅 5 分鐘路程。會場前方提供充足的自行車停放空間。'}
                  </p>
                  <p>
                    <strong>{lang === 'en' ? 'Public Transport:' : '大眾運輸：'}</strong> 
                    {lang === 'en' ? ' Take Bus 69 or 174 to status "Delft University", then a 5-minute walk.' : ' 搭乘 69 或 174 路巴士在 Delft University 站下車，步行約 5 分鐘即可抵達。'}
                  </p>
                </div>
                <a 
                  href="https://maps.app.goo.gl/EtGejgC8LLHAf4439" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-3 bg-brand-ink text-brand-cream px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-brand-accent transition-colors"
                >
                  <MapPin size={16} />
                  <span>{lang === 'en' ? 'Open in Google Maps' : '在 Google 地圖中開啟'}</span>
                </a>
              </div>
            </div>
            
            <div className="aspect-video w-full grayscale contrast-125 opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700 bg-brand-ink/5 overflow-hidden backdrop-blur-sm border border-brand-ink/10">
               <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2454.862343213192!2d4.3734000769399895!3d51.998000474681765!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c5b5be13c2b44b%3A0x8ac7c5b1307b2756!2sProfessor%20Schermerhornstraat%204%2C%202628%20PZ%20Delft!5e0!3m2!1sen!2snl!4v1714345000000!5m2!1sen!2snl" 
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
               />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col md:flex-row items-center justify-between px-12 bg-brand-ink/95 text-brand-cream py-10 md:h-24 md:py-0 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <img src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/dtso.png`} alt="DTSO" className="h-12 w-12 object-contain brightness-0 invert opacity-60" />
          <div className="label-xs opacity-60">Venue: DUWO Common Room, Delft</div>
        </div>
        <div className="label-xs flex gap-8 mt-4 md:mt-0">
          <a href="https://www.instagram.com/dtso_delft/" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity uppercase font-bold tracking-widest flex items-center gap-2">
            <Instagram size={12} /> Instagram
          </a>
          <a href="mailto:dtso.delft@gmail.com" className="hover:opacity-50 transition-opacity uppercase font-bold tracking-widest flex items-center gap-2">
            <Mail size={12} /> Email
          </a>
        </div>
        <div className="label-xs opacity-40 mt-4 md:mt-0">© 2026 DTSO Delft Taiwan Student Association</div>
      </footer>
      </div>
    </div>
  );
}
