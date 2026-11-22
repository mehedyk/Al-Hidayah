/**
 * Interface language. The scripture is never translated here: Arabic, English and Bangla
 * renderings come only from the frozen sources. This file only covers the app's own buttons,
 * labels and headings. Modes: English, Bangla, or both together ("Home · হোম").
 */
import type { UiLanguage } from './types';

const dictionary = {
  'nav.home': ['Home', 'হোম'],
  'nav.quran': ['Qur’an', 'কুরআন'],
  'nav.favorites': ['Favorites', 'প্রিয়'],
  'nav.settings': ['Settings', 'সেটিংস'],
  'card.today': ['Today’s reminder', 'আজকের স্মরণিকা'],
  'card.new': ['Get New Reminder', 'নতুন স্মরণিকা'],
  'card.loading': ['Loading…', 'লোড হচ্ছে…'],
  'card.save': ['Save', 'সংরক্ষণ'],
  'card.saved': ['Saved', 'সংরক্ষিত'],
  'card.share': ['Share', 'শেয়ার'],
  'card.reader': ['Open in the Qur’an reader', 'কুরআন পাঠে খুলুন'],
  'card.context': ['Read in context', 'প্রসঙ্গসহ পড়ুন'],
  'title.quran': ['From the Qur’an', 'কুরআন থেকে'],
  'title.hadith': ['From the Hadith', 'হাদিস থেকে'],
  'title.categories': ['Guidance by theme', 'বিষয়ভিত্তিক দিকনির্দেশনা'],
  'title.daily': ['Daily Reminder', 'দৈনিক স্মরণিকা'],
  'title.prayer': ['Prayer Times', 'নামাজের সময়'],
  'title.favorites': ['Favorites', 'প্রিয় তালিকা'],
  'title.about': ['About Al-Hidayah', 'আল-হিদায়াহ সম্পর্কে'],
  'title.settings': ['Settings', 'সেটিংস'],
  'reader.surah': ['Choose a surah', 'সূরা নির্বাচন করুন'],
  'reader.juz': ['Juz (part)', 'পারা'],
  'reader.prev': ['Previous', 'আগের'],
  'reader.next': ['Next', 'পরের'],
  'reader.go': ['Go', 'যান'],
  'reader.continue': ['Continue', 'চালিয়ে যান'],
  'reader.search': ['Search all 6,236 verses…', 'সব ৬,২৩৬ আয়াতে খুঁজুন…'],
  'reader.listen': ['Listen', 'শুনুন'],
  'reader.playSurah': ['Play surah', 'পুরো সূরা শুনুন'],
  'hadi.nudge': ['Want to read it more comfortably?', 'আরও আরামে পড়তে চান?'],
  'hadi.cta': ['Open in Hadi', 'হাদি-তে পড়ুন'],
  'player.pause': ['Pause', 'বিরতি'],
  'player.play': ['Play', 'চালান'],
  'player.stop': ['Stop', 'বন্ধ'],
  'sound.title': ['Calm sounds', 'প্রশান্তির শব্দ'],
  'sound.open': ['Calm sounds mixer', 'শব্দ মিক্সার'],
  'share.title': ['Share this reminder', 'এই স্মরণিকা শেয়ার করুন'],
  'nf.eyebrow': ['404', '৪০৪'],
  'nf.title': ['This page doesn’t exist.', 'এই পাতাটি নেই।'],
  'nf.body': ['The reminder you are looking for may have moved.', 'আপনি যে স্মরণিকা খুঁজছেন তা হয়তো সরে গেছে।'],
  'nf.home': ['Return home', 'হোমে ফিরুন'],
  'nf.quran': ['Browse the Qur’an', 'কুরআন দেখুন'],
  'nf.ambience': [
    'Nature ambience: birds, a light breeze and flowing water.',
    'প্রকৃতির শব্দ: পাখির ডাক, হালকা বাতাস ও বয়ে চলা জল।',
  ],
  'nf.play': ['Play ambience', 'শব্দ চালান'],
  'nf.pause': ['Mute ambience', 'শব্দ বন্ধ করুন'],
  'nf.mixnote': [
    'Your calm-sounds mix stays muted on this page so this ambience plays on its own. It returns when you leave.',
    'এই পাতায় আপনার শান্তির শব্দের মিক্স বন্ধ থাকে, যাতে এই শব্দটি আলাদাভাবে শোনা যায়। পাতা ছেড়ে গেলে তা ফিরে আসবে।',
  ],
  'dev.title': ['A note from the developer', 'ডেভেলপারের পক্ষ থেকে একটি কথা'],
  'dev.body': [
    'I built Al-Hidayah on my own, in my own time, because I wanted a calm and honest place for the Qur’an online. I am currently looking for work: a full-time role, an internship, or paid project work in web development. If you or your team could use someone who takes the details seriously, I would be glad to hear from you.',
    'আমি আল-হিদায়াহ নিজের উদ্যোগে, নিজের সময়ে তৈরি করেছি, কারণ অনলাইনে কুরআনের জন্য একটি শান্ত ও নির্ভরযোগ্য জায়গা চেয়েছিলাম। আমি এখন কাজ খুঁজছি: ওয়েব ডেভেলপমেন্টে পূর্ণকালীন চাকরি, ইন্টার্নশিপ বা বেতনভুক্ত প্রজেক্টের কাজ। আপনার বা আপনার দলের যদি এমন কাউকে দরকার হয় যে খুঁটিনাটিকে গুরুত্ব দেয়, তাহলে যোগাযোগ করলে আমি খুশি হব।',
  ],
  'dev.short': [
    'The developer is open to work: full-time, internship or paid projects.',
    'ডেভেলপার কাজের জন্য প্রস্তুত: পূর্ণকালীন, ইন্টার্নশিপ বা বেতনভুক্ত প্রজেক্ট।',
  ],
  'dev.cta': ['Get in touch on GitHub', 'GitHub-এ যোগাযোগ করুন'],
  'lang.button': ['Language', 'ভাষা'],
  'settings.language': ['Interface language', 'ইন্টারফেসের ভাষা'],
} as const satisfies Record<string, readonly [string, string]>;

export type TextKey = keyof typeof dictionary;

export function translate(key: TextKey, mode: UiLanguage): string {
  const [en, bn] = dictionary[key];
  if (mode === 'bn') return bn;
  if (mode === 'both') return `${en} · ${bn}`;
  return en;
}
