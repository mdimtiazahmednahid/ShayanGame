export type SceneEffectType =
  | 'slither'
  | 'rain'
  | 'hop'
  | 'swim'
  | 'fly'
  | 'bounce'
  | 'sparkle'
  | 'sail'
  | 'burst';

export interface LessonItem {
  id: string;
  symbol: string;
  sign?: string; // e.g. কার চিহ্ন (া, ি, ী...)
  title: string;
  subtitle: string;
  translation: string; // Cross-language bridge (English for Bangla, Bangla for English)
  emoji: string;
  effectType: SceneEffectType;
  effectEmoji?: string;
  speechText: string;
  lang: 'en-US' | 'bn-BD';
}

export interface MathQuizItem {
  id: string;
  questionBn: string;
  questionEn: string;
  visual: string;
  options: { labelBn: string; labelEn: string; value: number }[];
  answer: number;
  praiseBn: string;
  praiseEn: string;
}

export const ABC_LESSONS: LessonItem[] = [
  { id: 'a', symbol: 'A', title: 'A for Apple', subtitle: 'A - a', translation: '🇧🇩 বাংলা: আপেল (Apel)', emoji: '🍎', effectType: 'rain', speechText: 'A is for Apple!', lang: 'en-US' },
  { id: 'b', symbol: 'B', title: 'B for Ball', subtitle: 'B - b', translation: '🇧🇩 বাংলা: বল (Ball)', emoji: '⚽', effectType: 'bounce', speechText: 'B is for Ball!', lang: 'en-US' },
  { id: 'c', symbol: 'C', title: 'C for Cat', subtitle: 'C - c', translation: '🇧🇩 বাংলা: বিড়াল (Biral)', emoji: '🐱', effectType: 'hop', speechText: 'C is for Cat!', lang: 'en-US' },
  { id: 'd', symbol: 'D', title: 'D for Dog', subtitle: 'D - d', translation: '🇧🇩 বাংলা: কুকুর (Kukur)', emoji: '🐶', effectType: 'hop', speechText: 'D is for Dog!', lang: 'en-US' },
  { id: 'e', symbol: 'E', title: 'E for Elephant', subtitle: 'E - e', translation: '🇧🇩 বাংলা: হাতি (Hati)', emoji: '🐘', effectType: 'slither', speechText: 'E is for Elephant!', lang: 'en-US' },
  { id: 'f', symbol: 'F', title: 'F for Fish', subtitle: 'F - f', translation: '🇧🇩 বাংলা: মাছ (Mach)', emoji: '🐟', effectType: 'swim', speechText: 'F is for Fish!', lang: 'en-US' },
  { id: 'g', symbol: 'G', title: 'G for Grapes', subtitle: 'G - g', translation: '🇧🇩 বাংলা: আঙুর (Angur)', emoji: '🍇', effectType: 'rain', speechText: 'G is for Grapes!', lang: 'en-US' },
  { id: 'h', symbol: 'H', title: 'H for House', subtitle: 'H - h', translation: '🇧🇩 বাংলা: বাড়ি (Bari)', emoji: '🏠', effectType: 'burst', speechText: 'H is for House!', lang: 'en-US' },
  { id: 'i', symbol: 'I', title: 'I for Ice Cream', subtitle: 'I - i', translation: '🇧🇩 বাংলা: আইসক্রিম', emoji: '🍦', effectType: 'rain', speechText: 'I is for Ice Cream!', lang: 'en-US' },
  { id: 'l', symbol: 'L', title: 'L for Lion', subtitle: 'L - l', translation: '🇧🇩 বাংলা: সিংহ (Singho)', emoji: '🦁', effectType: 'hop', speechText: 'L is for Lion!', lang: 'en-US' },
  { id: 'm', symbol: 'M', title: 'M for Mango', subtitle: 'M - m', translation: '🇧🇩 বাংলা: আম (Aam)', emoji: '🥭', effectType: 'rain', speechText: 'M is for Mango!', lang: 'en-US' },
  { id: 's', symbol: 'S', title: 'S for Sun', subtitle: 'S - s', translation: '🇧🇩 বাংলা: সূর্য (Surjo)', emoji: '☀️', effectType: 'sparkle', speechText: 'S is for Sun!', lang: 'en-US' },
];

export const BANGLA_LESSONS: LessonItem[] = [
  // স্বরবর্ণ (11 vowels + signs)
  { id: 'bn-o', symbol: 'অ', title: 'অ-তে অজগর', subtitle: 'স্বরবর্ণ', translation: '🇬🇧 English: Python (Ojogor)', emoji: '🐍', effectType: 'slither', speechText: 'অ-তে অজগর! অজগর ওই আসছে তেড়ে।', lang: 'bn-BD' },
  { id: 'bn-aa', symbol: 'আ', sign: 'া', title: 'আ-তে আম (া)', subtitle: 'আ-কার চিহ্ন: া', translation: '🇬🇧 English: Mango (Aam)', emoji: '🥭', effectType: 'rain', speechText: 'আ-তে আম! আর আ-কার চিহ্ন হলো এই রকম।', lang: 'bn-BD' },
  { id: 'bn-i', symbol: 'ই', sign: 'ি', title: 'ই-তে ইলিশ (ি)', subtitle: 'হ্রস্ব ই-কার: ি', translation: '🇬🇧 English: Hilsa Fish (Ilish)', emoji: '🐟', effectType: 'swim', speechText: 'ই-তে ইলিশ! ইলিশ আমাদের জাতীয় মাছ।', lang: 'bn-BD' },
  { id: 'bn-ii', symbol: 'ঈ', sign: 'ী', title: 'ঈ-তে ঈগল (ী)', subtitle: 'দীর্ঘ ঈ-কার: ী', translation: '🇬🇧 English: Eagle (Igol)', emoji: '🦅', effectType: 'fly', speechText: 'ঈ-তে ঈগল! ঈগল পাখি আকাশে ওড়ে।', lang: 'bn-BD' },
  { id: 'bn-u', symbol: 'উ', sign: 'ু', title: 'উ-তে উট (ু)', subtitle: 'হ্রস্ব উ-কার: ু', translation: '🇬🇧 English: Camel (Uut)', emoji: '🐪', effectType: 'slither', speechText: 'উ-তে উট! উট চলে মরুর বুকে।', lang: 'bn-BD' },
  { id: 'bn-uu', symbol: 'ঊ', sign: 'ূ', title: 'ঊ-তে ঊষা (ূ)', subtitle: 'দীর্ঘ ঊ-কার: ূ', translation: '🇬🇧 English: Dawn / Sunrise (Usha)', emoji: '🌅', effectType: 'sparkle', speechText: 'ঊ-তে ঊষা! ভোরের মিষ্টি আলো ঊষা।', lang: 'bn-BD' },
  { id: 'bn-ri', symbol: 'ঋ', sign: 'ৃ', title: 'ঋ-তে ঋতু (ৃ)', subtitle: 'ঋ-কার চিহ্ন: ৃ', translation: '🇬🇧 English: Season (Ritu)', emoji: '🌦️', effectType: 'rain', speechText: 'ঋ-তে ঋতু! বাংলাদেশে ছয়টি ঋতু আছে।', lang: 'bn-BD' },
  { id: 'bn-e', symbol: 'এ', sign: 'ে', title: 'এ-তে একতারা (ে)', subtitle: 'এ-কার চিহ্ন: ে', translation: '🇬🇧 English: Ektara (Music)', emoji: '🪕', effectType: 'sparkle', speechText: 'এ-তে একতারা! একতারা বাজে সুন্দর সুরে।', lang: 'bn-BD' },
  { id: 'bn-oi', symbol: 'ঐ', sign: 'ৈ', title: 'ঐ-তে ঐরাবত (ৈ)', subtitle: 'ঐ-কার চিহ্ন: ৈ', translation: '🇬🇧 English: Elephant (Oirabot)', emoji: '🐘', effectType: 'slither', speechText: 'ঐ-তে ঐরাবত! ঐরাবত মানে বড় হাতি।', lang: 'bn-BD' },
  { id: 'bn-o2', symbol: 'ও', sign: 'ো', title: 'ও-তে ওলকপি (ো)', subtitle: 'ও-কার চিহ্ন: ো', translation: '🇬🇧 English: Kohlrabi / Veggie', emoji: '🥬', effectType: 'rain', speechText: 'ও-তে ওলকপি! সবুজ তাজা ওলকপি।', lang: 'bn-BD' },
  { id: 'bn-ou', symbol: 'ঔ', sign: 'ৌ', title: 'ঔ-তে ঔষধ (ৌ)', subtitle: 'ঔ-কার চিহ্ন: ৌ', translation: '🇬🇧 English: Medicine (Oushodh)', emoji: '💊', effectType: 'burst', speechText: 'ঔ-তে ঔষধ! অসুখ হলে ঔষধ খাই।', lang: 'bn-BD' },

  // ব্যঞ্জনবর্ণ (Consonants)
  { id: 'bn-ka', symbol: 'ক', title: 'ক-তে কলা', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Banana (Kola)', emoji: '🍌', effectType: 'rain', speechText: 'ক-তে কলা! হলুদ পাকা কলা।', lang: 'bn-BD' },
  { id: 'bn-kha', symbol: 'খ', title: 'খ-তে খরগোশ', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Rabbit (Khorgosh)', emoji: '🐰', effectType: 'hop', speechText: 'খ-তে খরগোশ! ছোট্ট সাদা খরগোশ।', lang: 'bn-BD' },
  { id: 'bn-ga', symbol: 'গ', title: 'গ-তে গরু', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Cow (Goru)', emoji: '🐄', effectType: 'slither', speechText: 'গ-তে গরু! গরু আমাদের দুধ দেয়।', lang: 'bn-BD' },
  { id: 'bn-gha', symbol: 'ঘ', title: 'ঘ-তে ঘড়ি', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Clock (Ghori)', emoji: '⏰', effectType: 'bounce', speechText: 'ঘ-তে ঘড়ি! ঘড়ি আমাদের সময় বলে।', lang: 'bn-BD' },
  { id: 'bn-umo', symbol: 'ঙ', title: 'ঙ-তে ব্যাঙ', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Frog (Bang)', emoji: '🐸', effectType: 'hop', speechText: 'ঙ-তে ব্যাঙ! ব্যাঙ ডাকে ঘ্যাঙর ঘ্যাঙ।', lang: 'bn-BD' },
  { id: 'bn-ca', symbol: 'চ', title: 'চ-তে চাঁদ', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Moon (Chand)', emoji: '🌙', effectType: 'sparkle', speechText: 'চ-তে চাঁদ! রাতের আকাশে মিষ্টি চাঁদ।', lang: 'bn-BD' },
  { id: 'bn-cha', symbol: 'ছ', title: 'ছ-তে ছাতা', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Umbrella (Chata)', emoji: '☂️', effectType: 'fly', speechText: 'ছ-তে ছাতা! বৃষ্টি এলে ছাতা ধরি।', lang: 'bn-BD' },
  { id: 'bn-ja', symbol: 'জ', title: 'জ-তে জাহাজ', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Ship (Jahaj)', emoji: '🚢', effectType: 'sail', speechText: 'জ-তে জাহাজ! সাগরে ভাসে বড় জাহাজ।', lang: 'bn-BD' },
  { id: 'bn-jha', symbol: 'ঝ', title: 'ঝ-তে ঝুড়ি', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Basket (Jhuri)', emoji: '🧺', effectType: 'burst', speechText: 'ঝ-তে ঝুড়ি! ঝুড়িতে আছে তাজা ফল।', lang: 'bn-BD' },
  { id: 'bn-ta', symbol: 'ট', title: 'ট-তে টিয়া', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Parrot (Tiya)', emoji: '🦜', effectType: 'fly', speechText: 'ট-তে টিয়া! সবুজ রঙের টিয়া পাখি।', lang: 'bn-BD' },
  { id: 'bn-tha', symbol: 'ঠ', title: 'ঠ-তে ঠোঁট', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Lips (Thot)', emoji: '👄', effectType: 'burst', speechText: 'ঠ-তে ঠোঁট! হাসি মুখে মিষ্টি ঠোঁট।', lang: 'bn-BD' },
  { id: 'bn-da', symbol: 'ড', title: 'ড-তে ডিম', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Egg (Dim)', emoji: '🥚', effectType: 'bounce', speechText: 'ড-তে ডিম! ডিম খেলে শরীর ভালো থাকে।', lang: 'bn-BD' },
  { id: 'bn-dha', symbol: 'ঢ', title: 'ঢ-তে ঢোল', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Drum (Dhol)', emoji: '🥁', effectType: 'bounce', speechText: 'ঢ-তে ঢোল! ঢোল বাজে ডুম ডুম।', lang: 'bn-BD' },
  { id: 'bn-to', symbol: 'ত', title: 'ত-তে তারা', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Star (Tara)', emoji: '⭐', effectType: 'sparkle', speechText: 'ত-তে তারা! আকাশে জ্বলে অনেক তারা।', lang: 'bn-BD' },
  { id: 'bn-tho', symbol: 'থ', title: 'থ-তে থালা', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Plate (Thala)', emoji: '🍽️', effectType: 'burst', speechText: 'থ-তে থালা! থালায় সাজিয়ে খাবার খাই।', lang: 'bn-BD' },
  { id: 'bn-do', symbol: 'দ', title: 'দ-তে দোয়েল', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Magpie Robin (Doyel)', emoji: '🐦', effectType: 'fly', speechText: 'দ-তে দোয়েল! দোয়েল আমাদের জাতীয় পাখি।', lang: 'bn-BD' },
  { id: 'bn-dho', symbol: 'ধ', title: 'ধ-তে ধান', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Paddy / Rice (Dhan)', emoji: '🌾', effectType: 'rain', speechText: 'ধ-তে ধান! সোনালি ধান থেকে চাল হয়।', lang: 'bn-BD' },
  { id: 'bn-no', symbol: 'ন', title: 'ন-তে নৌকা', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Boat (Nouka)', emoji: '⛵', effectType: 'sail', speechText: 'ন-তে নৌকা! নদীতে চলে পালতোলা নৌকা।', lang: 'bn-BD' },
  { id: 'bn-pa', symbol: 'প', title: 'প-তে পাখি', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Bird (Pakhi)', emoji: '🐤', effectType: 'fly', speechText: 'প-তে পাখি! পাখি গায় মিষ্টি গান।', lang: 'bn-BD' },
  { id: 'bn-pha', symbol: 'ফ', title: 'ফ-তে ফুল', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Flower (Ful)', emoji: '🌸', effectType: 'rain', speechText: 'ফ-তে ফুল! বাগানে ফুটেছে রঙিন ফুল।', lang: 'bn-BD' },
  { id: 'bn-ba', symbol: 'ব', title: 'ব-তে বই', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Book (Boi)', emoji: '📖', effectType: 'sparkle', speechText: 'ব-তে বই! বই পড়ে আমরা অনেক কিছু শিখি।', lang: 'bn-BD' },
  { id: 'bn-bha', symbol: 'ভ', title: 'ভ-তে ভাল্লুক', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Bear (Bhalluk)', emoji: '🐻', effectType: 'hop', speechText: 'ভ-তে ভাল্লুক! আদুরে ছোট্ট ভাল্লুক।', lang: 'bn-BD' },
  { id: 'bn-ma', symbol: 'ম', title: 'ম-তে মাছ', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Fish (Mach)', emoji: '🐠', effectType: 'swim', speechText: 'ম-তে মাছ! পানিতে সাঁতার কাটে মাছ।', lang: 'bn-BD' },
  { id: 'bn-ra', symbol: 'র', title: 'র-তে রাজহাঁস', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Swan (Rajhash)', emoji: '🦢', effectType: 'swim', speechText: 'র-তে রাজহাঁস! সাদা সুন্দর রাজহাঁস।', lang: 'bn-BD' },
  { id: 'bn-la', symbol: 'ল', title: 'ল-তে লেবু', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Lemon (Lebu)', emoji: '🍋', effectType: 'rain', speechText: 'ল-তে লেবু! টক মিষ্টি তাজা লেবু।', lang: 'bn-BD' },
  { id: 'bn-sha', symbol: 'শ', title: 'শ-তে শাপলা', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Water Lily (Shapla)', emoji: '🪷', effectType: 'swim', speechText: 'শ-তে শাপলা! শাপলা আমাদের জাতীয় ফুল।', lang: 'bn-BD' },
  { id: 'bn-sa', symbol: 'স', title: 'স-তে সূর্য', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Sun (Surjo)', emoji: '☀️', effectType: 'sparkle', speechText: 'স-তে সূর্য! সূর্য আমাদের আলো দেয়।', lang: 'bn-BD' },
  { id: 'bn-ha', symbol: 'হ', title: 'হ-তে হাতি', subtitle: 'ব্যঞ্জনবর্ণ', translation: '🇬🇧 English: Elephant (Hati)', emoji: '🐘', effectType: 'slither', speechText: 'হ-তে হাতি! হাতির আছে লম্বা শুঁড়।', lang: 'bn-BD' },
];

export const ENGLISH_COMPANION: LessonItem[] = [
  { id: 'hi', symbol: '👋', title: 'Hello Friend!', subtitle: 'Greeting', translation: '🇧🇩 বাংলা: হ্যালো বন্ধু!', emoji: '😄', effectType: 'sparkle', speechText: 'Hi there! I am Shayan, your best friend! Let us play and learn together!', lang: 'en-US' },
  { id: 'how', symbol: '💬', title: 'How are you?', subtitle: 'Daily English', translation: '🇧🇩 বাংলা: তুমি কেমন আছো?', emoji: '🌟', effectType: 'sparkle', speechText: 'How are you today? I am super happy to see you!', lang: 'en-US' },
  { id: 'count', symbol: '123', title: 'Count 1 to 5', subtitle: 'Numbers', translation: '🇧🇩 বাংলা: ১, ২, ৩, ৪, ৫ গুনো', emoji: '🖐️', effectType: 'bounce', speechText: 'Count with me! One, two, three, four, five! Yay!', lang: 'en-US' },
  { id: 'colors', symbol: '🎨', title: 'Rainbow Colors', subtitle: 'Red, Blue, Yellow', translation: '🇧🇩 বাংলা: রংধনুর রঙ', emoji: '🌈', effectType: 'sparkle', speechText: 'Look at the rainbow! Red, yellow, green, and blue!', lang: 'en-US' },
  { id: 'good', symbol: '🏆', title: 'You Are Awesome!', subtitle: 'Encouragement', translation: '🇧🇩 বাংলা: তুমি অনেক দারুণ!', emoji: '🎉', effectType: 'burst', speechText: 'You are so smart and awesome! Give me a high five!', lang: 'en-US' },
  { id: 'bn-hi-comp', symbol: '🇧🇩', title: 'হ্যালো বন্ধু!', subtitle: 'Bangla Greeting', translation: '🇬🇧 English: Hello Friend! How are you?', emoji: '💖', effectType: 'sparkle', speechText: 'হ্যালো বন্ধু! কেমন আছো? আমি শায়ান! চলো একসাথে খেলি আর শিখি!', lang: 'bn-BD' },
  { id: 'shape-circle', symbol: '⭕', title: 'বৃত্ত (Circle)', subtitle: 'গোল আকৃতি', translation: '🇬🇧 English: Round Circle', emoji: '🌕', effectType: 'bounce', speechText: 'এটা হলো বৃত্ত! চাঁদ আর বলের মতো গোল!', lang: 'bn-BD' },
  { id: 'shape-star', symbol: '⭐', title: 'তারা (Star)', subtitle: 'আকাশের তারা', translation: '🇬🇧 English: Twinkling Star', emoji: '🌟', effectType: 'sparkle', speechText: 'এটা হলো তারা! রাতের আকাশে ঝিকিমিকি করে!', lang: 'bn-BD' },
  { id: 'color-red', symbol: '🔴', title: 'লাল (Red)', subtitle: 'রঙ চেনা', translation: '🇬🇧 English: Red Color (Apple)', emoji: '🍎', effectType: 'rain', speechText: 'এটা হলো লাল রঙ! পাকা আপেলের মতো সুন্দর লাল!', lang: 'bn-BD' },
  { id: 'color-green', symbol: '🟢', title: 'সবুজ (Green)', subtitle: 'রঙ চেনা', translation: '🇬🇧 English: Green Color (Leaf)', emoji: '🌿', effectType: 'rain', speechText: 'এটা হলো সবুজ রঙ! গাছের পাতার মতো সবুজ!', lang: 'bn-BD' },
  { id: 'habit-brush', symbol: '🪥', title: 'দাঁত ব্রাশ করো', subtitle: 'ভালো অভ্যাস', translation: '🇬🇧 English: Brush your teeth!', emoji: '😁', effectType: 'sparkle', speechText: 'প্রতিদিন সকালে আর রাতে দাঁত ব্রাশ করলে দাঁত ঝকঝকে থাকে!', lang: 'bn-BD' },
];

export const MATH_LESSONS_BN: LessonItem[] = [
  { id: 'm-bn-1', symbol: '১', title: '১ (এক)', subtitle: 'সংখ্যা গণনা', translation: '🇬🇧 English: 1 (One Apple)', emoji: '🍎', effectType: 'rain', effectEmoji: '🍎', speechText: 'এটা হলো এক! এখানে একটি আপেল আছে।', lang: 'bn-BD' },
  { id: 'm-bn-2', symbol: '২', title: '২ (দুই)', subtitle: 'সংখ্যা গণনা', translation: '🇬🇧 English: 2 (Two Apples)', emoji: '🍎🍎', effectType: 'rain', effectEmoji: '🍎', speechText: 'এটা হলো দুই! এক, দুই — দুটি আপেল!', lang: 'bn-BD' },
  { id: 'm-bn-3', symbol: '৩', title: '৩ (তিন)', subtitle: 'সংখ্যা গণনা', translation: '🇬🇧 English: 3 (Three Stars)', emoji: '⭐⭐⭐', effectType: 'sparkle', effectEmoji: '⭐', speechText: 'এটা হলো তিন! এক, দুই, তিন — তিনটি তারা!', lang: 'bn-BD' },
  { id: 'm-bn-4', symbol: '৪', title: '৪ (চার)', subtitle: 'সংখ্যা গণনা', translation: '🇬🇧 English: 4 (Four Bananas)', emoji: '🍌🍌🍌🍌', effectType: 'rain', effectEmoji: '🍌', speechText: 'এটা হলো চার! এক, দুই, তিন, চার — চারটি কলা!', lang: 'bn-BD' },
  { id: 'm-bn-5', symbol: '৫', title: '৫ (পাঁচ)', subtitle: 'সংখ্যা গণনা', translation: '🇬🇧 English: 5 (Five Fingers)', emoji: '🖐️', effectType: 'burst', effectEmoji: '🖐️', speechText: 'এটা হলো পাঁচ! আমাদের এক হাতে পাঁচটি আঙুল আছে!', lang: 'bn-BD' },
  { id: 'm-bn-add1', symbol: '১+১=২', title: 'যোগ: ১ + ১ = ২', subtitle: 'সহজ যোগ', translation: '🇬🇧 English: 1 + 1 = 2 (Addition)', emoji: '🍓+🍓', effectType: 'rain', effectEmoji: '🍓', speechText: 'চলো যোগ শিখি! একটি স্ট্রবেরি আর একটি স্ট্রবেরি মিলে হয় দুটি স্ট্রবেরি! এক যোগ এক সমান দুই।', lang: 'bn-BD' },
  { id: 'm-bn-add2', symbol: '২+১=৩', title: 'যোগ: ২ + ১ = ৩', subtitle: 'সহজ যোগ', translation: '🇬🇧 English: 2 + 1 = 3 (Addition)', emoji: '⚽⚽+⚽', effectType: 'bounce', effectEmoji: '⚽', speechText: 'দুইটি বল আর একটি বল যোগ করলে হয় তিনটি বল! দুই যোগ এক সমান তিন।', lang: 'bn-BD' },
  { id: 'm-bn-sub1', symbol: '৩-১=২', title: 'বিয়োগ: ৩ - ১ = ২', subtitle: 'সহজ বিয়োগ', translation: '🇬🇧 English: 3 - 1 = 2 (Subtraction)', emoji: '🍪🍪🍪', effectType: 'rain', effectEmoji: '🍪', speechText: 'এবার বিয়োগ শিখি! তোমার কাছে তিনটি বিস্কুট ছিল, একটি খেয়ে ফেললে থাকে দুটি! তিন বিয়োগ এক সমান দুই।', lang: 'bn-BD' },
];

export const MATH_LESSONS_EN: LessonItem[] = [
  { id: 'm-en-1', symbol: '1', title: '1 (One)', subtitle: 'Counting', translation: '🇧🇩 বাংলা: ১ (একটি আপেল)', emoji: '🍎', effectType: 'rain', effectEmoji: '🍎', speechText: 'This is one! One red apple!', lang: 'en-US' },
  { id: 'm-en-2', symbol: '2', title: '2 (Two)', subtitle: 'Counting', translation: '🇧🇩 বাংলা: ২ (দুটি আপেল)', emoji: '🍎🍎', effectType: 'rain', effectEmoji: '🍎', speechText: 'This is two! One, two apples!', lang: 'en-US' },
  { id: 'm-en-3', symbol: '3', title: '3 (Three)', subtitle: 'Counting', translation: '🇧🇩 বাংলা: ৩ (তিনটি তারা)', emoji: '⭐⭐⭐', effectType: 'sparkle', effectEmoji: '⭐', speechText: 'This is three! One, two, three bright stars!', lang: 'en-US' },
  { id: 'm-en-4', symbol: '4', title: '4 (Four)', subtitle: 'Counting', translation: '🇧🇩 বাংলা: ৪ (চারটি কলা)', emoji: '🍌🍌🍌🍌', effectType: 'rain', effectEmoji: '🍌', speechText: 'This is four! Four yellow bananas!', lang: 'en-US' },
  { id: 'm-en-5', symbol: '5', title: '5 (Five)', subtitle: 'Counting', translation: '🇧🇩 বাংলা: ৫ (পাঁচটি আঙুল)', emoji: '🖐️', effectType: 'burst', effectEmoji: '🖐️', speechText: 'This is five! Five fingers on one hand!', lang: 'en-US' },
  { id: 'm-en-add1', symbol: '1+1=2', title: 'Add: 1 + 1 = 2', subtitle: 'Addition', translation: '🇧🇩 বাংলা: ১ + ১ = ২ (যোগ)', emoji: '🍓+🍓', effectType: 'rain', effectEmoji: '🍓', speechText: 'One plus one equals two!', lang: 'en-US' },
  { id: 'm-en-add2', symbol: '2+1=3', title: 'Add: 2 + 1 = 3', subtitle: 'Addition', translation: '🇧🇩 বাংলা: ২ + ১ = ৩ (যোগ)', emoji: '⚽⚽+⚽', effectType: 'bounce', effectEmoji: '⚽', speechText: 'Two plus one equals three!', lang: 'en-US' },
  { id: 'm-en-sub1', symbol: '3-1=2', title: 'Sub: 3 - 1 = 2', subtitle: 'Subtraction', translation: '🇧🇩 বাংলা: ৩ - ১ = ২ (বিয়োগ)', emoji: '🍪🍪🍪', effectType: 'rain', effectEmoji: '🍪', speechText: 'Three minus one equals two!', lang: 'en-US' },
];

export const MATH_QUIZZES: MathQuizItem[] = [
  {
    id: 'q1',
    questionBn: 'বলো তো, ১ আর ১ যোগ করলে কত হয়?',
    questionEn: 'What is 1 plus 1?',
    visual: '🍎 + 🍎 = ?',
    options: [
      { labelBn: '১', labelEn: '1', value: 1 },
      { labelBn: '২', labelEn: '2', value: 2 },
      { labelBn: '৩', labelEn: '3', value: 3 },
    ],
    answer: 2,
    praiseBn: 'দারুণ! একদম ঠিক হয়েছে! ১ আর ১ মিলে ২ হয়!',
    praiseEn: 'Awesome! 1 plus 1 is 2!',
  },
  {
    id: 'q2',
    questionBn: 'বলো তো, ২ আর ১ যোগ করলে কত হয়?',
    questionEn: 'What is 2 plus 1?',
    visual: '⚽⚽ + ⚽ = ?',
    options: [
      { labelBn: '২', labelEn: '2', value: 2 },
      { labelBn: '৩', labelEn: '3', value: 3 },
      { labelBn: '৪', labelEn: '4', value: 4 },
    ],
    answer: 3,
    praiseBn: 'বাহ! তুমি খুব বুদ্ধিমান! ২ আর ১ মিলে ৩ হয়!',
    praiseEn: 'Yay! 2 plus 1 is 3!',
  },
  {
    id: 'q3',
    questionBn: '৩টি বিস্কুট থেকে ১টি খেলে কয়টি থাকে?',
    questionEn: 'If you eat 1 from 3 cookies, how many are left?',
    visual: '🍪🍪🍪 − 🍪 = ?',
    options: [
      { labelBn: '১', labelEn: '1', value: 1 },
      { labelBn: '২', labelEn: '2', value: 2 },
      { labelBn: '৪', labelEn: '4', value: 4 },
    ],
    answer: 2,
    praiseBn: 'শাবাশ বন্ধু! ৩ থেকে ১ বাদ দিলে ২ থাকে!',
    praiseEn: 'Great job! 3 minus 1 is 2!',
  },
];
