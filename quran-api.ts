export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
}

export interface AyahWithTranslation {
  numberInSurah: number;
  arabic: string;
  translation: string;
  audioUrl: string;
}

export interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: AyahWithTranslation[];
}

export interface SearchResult {
  number: number;
  text: string;
  surah: { number: number; name: string; englishName: string };
  numberInSurah: number;
}

const BASE_URL = "https://api.alquran.cloud/v1";

export async function getSurahList(): Promise<Surah[]> {
  const res = await fetch(`${BASE_URL}/surah`);
  const data = await res.json() as { data: Surah[] };
  return data.data;
}

export async function getSurahDetail(number: number): Promise<SurahDetail> {
  const res = await fetch(`${BASE_URL}/surah/${number}/editions/quran-uthmani,id.indonesian`);
  const data = await res.json() as { data: Array<{ number: number; name: string; englishName: string; englishNameTranslation: string; numberOfAyahs: number; revelationType: string; ayahs: Ayah[] }> };
  
  const arabicSurah = data.data[0];
  const translationSurah = data.data[1];
  
  const ayahs: AyahWithTranslation[] = arabicSurah.ayahs.map((ayah, i) => ({
    numberInSurah: ayah.numberInSurah,
    arabic: ayah.text,
    translation: translationSurah.ayahs[i]?.text ?? "",
    audioUrl: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`,
  }));

  return {
    number: arabicSurah.number,
    name: arabicSurah.name,
    englishName: arabicSurah.englishName,
    englishNameTranslation: arabicSurah.englishNameTranslation,
    numberOfAyahs: arabicSurah.numberOfAyahs,
    revelationType: arabicSurah.revelationType,
    ayahs,
  };
}

export async function searchQuran(keyword: string): Promise<SearchResult[]> {
  const res = await fetch(`${BASE_URL}/search/${encodeURIComponent(keyword)}/all/id.indonesian`);
  const data = await res.json() as { data: { matches: SearchResult[] } };
  return data.data?.matches ?? [];
}

export function getAudioUrl(globalAyahNumber: number): string {
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalAyahNumber}.mp3`;
}

export const SURAH_LIST_STATIC: Surah[] = Array.from({ length: 114 }, (_, i) => ({
  number: i + 1,
  name: "",
  englishName: "",
  englishNameTranslation: "",
  numberOfAyahs: 0,
  revelationType: "Meccan",
}));

export const JUZ_DATA = Array.from({ length: 30 }, (_, i) => ({
  number: i + 1,
  name: `Juz ${i + 1}`,
  startSurah: [2, 2, 2, 3, 4, 4, 5, 6, 7, 8, 9, 11, 12, 15, 17, 18, 21, 23, 25, 27, 29, 33, 36, 39, 41, 46, 51, 58, 67, 78][i],
  startAyah: [1, 142, 253, 93, 24, 148, 111, 88, 88, 1, 6, 6, 53, 1, 1, 51, 1, 1, 21, 56, 31, 31, 28, 32, 47, 27, 31, 1, 1, 1][i],
}));

export const RANDOM_QUOTES = [
  { arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "Sesungguhnya bersama kesulitan ada kemudahan.", surah: "Al-Inshirah 94:6" },
  { arabic: "وَعَسَى أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ", translation: "Boleh jadi kamu membenci sesuatu, padahal itu amat baik bagimu.", surah: "Al-Baqarah 2:216" },
  { arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", translation: "Cukuplah Allah menjadi penolong kami dan Allah adalah sebaik-baik pelindung.", surah: "Ali Imran 3:173" },
  { arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا", translation: "Dan katakanlah: Ya Tuhanku, tambahkanlah kepadaku ilmu pengetahuan.", surah: "Taha 20:114" },
  { arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ", translation: "Maka ingatlah kepada-Ku, Aku pun akan ingat kepadamu.", surah: "Al-Baqarah 2:152" },
  { arabic: "وَبَشِّرِ الصَّابِرِينَ", translation: "Dan berikanlah kabar gembira kepada orang-orang yang sabar.", surah: "Al-Baqarah 2:155" },
  { arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", translation: "Sesungguhnya Allah beserta orang-orang yang sabar.", surah: "Al-Baqarah 2:153" },
  { arabic: "وَتَوَكَّلْ عَلَى اللَّهِ ۚ وَكَفَىٰ بِاللَّهِ وَكِيلًا", translation: "Dan bertawakallah kepada Allah. Dan cukuplah Allah sebagai pelindung.", surah: "Al-Ahzab 33:3" },
];
