/* ------------------------------------------------------------------ */
/*  Toki Pona word bank                                               */
/*  Each entry keeps the old keys (hanzi / pinyin) so the rest of     */
/*  your codebase stays unchanged.                                    */
/* ------------------------------------------------------------------ */
export interface Word {
  hanzi:  string;
  pinyin: string;
  en:     string;
  pos?:   string;
  example?: string;   // ← add optional fields here
  note?:    string;
}
const words: Word[] = [
  { hanzi: "toki",    pinyin: "toki",     en: "hello / speak",      pos: "greeting / verb" },
  { hanzi: "pona",    pinyin: "pona",     en: "good",               pos: "adjective" },
  { hanzi: "ike",     pinyin: "ike",      en: "bad",                pos: "adjective" },
  { hanzi: "mi",      pinyin: "mi",       en: "I / me",             pos: "pronoun" },
  { hanzi: "sina",    pinyin: "sina",     en: "you (sing.)",        pos: "pronoun" },
  { hanzi: "ona",     pinyin: "ona",      en: "he / she / it",      pos: "pronoun" },
  { hanzi: "ni",      pinyin: "ni",       en: "this / that",        pos: "demonstrative" },
  { hanzi: "kule",    pinyin: "kule",     en: "colour / paint",     pos: "noun / verb" },
  { hanzi: "loje",    pinyin: "loje",     en: "red",                pos: "colour" },
  { hanzi: "jelo",    pinyin: "jelo",     en: "yellow",             pos: "colour" },
  { hanzi: "laso",    pinyin: "laso",     en: "blue / green",       pos: "colour" },
  { hanzi: "seli",    pinyin: "seli",     en: "fire / heat",        pos: "noun" },
  { hanzi: "suno",    pinyin: "suno",     en: "sun / light",        pos: "noun" },
  { hanzi: "mun",     pinyin: "mun",      en: "moon / star",        pos: "noun" },
  { hanzi: "kili",    pinyin: "kili",     en: "fruit / vegetable",  pos: "noun" },
  { hanzi: "suwi",    pinyin: "suwi",     en: "sweet",              pos: "adjective" },
  { hanzi: "moku",    pinyin: "moku",     en: "food / eat",         pos: "noun / verb" },
  { hanzi: "kala",    pinyin: "kala",     en: "fish",               pos: "noun" },
  { hanzi: "akesi",   pinyin: "akesi",    en: "reptile / amphibian",pos: "noun" },
  { hanzi: "waso",    pinyin: "waso",     en: "bird",               pos: "noun" },
  { hanzi: "ilo",     pinyin: "ilo",      en: "tool / device",      pos: "noun" },
  { hanzi: "len",     pinyin: "len",      en: "clothing",           pos: "noun" },
  { hanzi: "mani",    pinyin: "mani",     en: "money",              pos: "noun" },
  { hanzi: "nasin",   pinyin: "nasin",    en: "road / method",      pos: "noun" },
  { hanzi: "tomo",    pinyin: "tomo",     en: "house / building",   pos: "noun" },
  { hanzi: "ma",      pinyin: "ma",       en: "land / country",     pos: "noun" },
  { hanzi: "selo",    pinyin: "selo",     en: "skin / surface",     pos: "noun" },
  { hanzi: "lawa",    pinyin: "lawa",     en: "head / lead",        pos: "noun / verb" },
  { hanzi: "pali",    pinyin: "pali",     en: "work / make",        pos: "verb / noun" },
  { hanzi: "ken",     pinyin: "ken",      en: "can / possible",     pos: "verb / adjective" },
  { hanzi: "wawa",    pinyin: "wawa",     en: "strong / energy",    pos: "adjective / noun" },
  { hanzi: "lape",    pinyin: "lape",     en: "sleep",              pos: "verb / noun" },
  { hanzi: "kute",    pinyin: "kute",     en: "listen / ear",       pos: "verb / noun" },
  { hanzi: "lukin",   pinyin: "lukin",    en: "see / eye",          pos: "verb / noun" },
  { hanzi: "pipi",    pinyin: "pipi",     en: "insect",             pos: "noun" },
  { hanzi: "sama",    pinyin: "sama",     en: "same / equal",       pos: "adjective" },
  { hanzi: "mute",    pinyin: "mute",     en: "many / very",        pos: "adjective / number" },
  { hanzi: "lili",    pinyin: "lili",     en: "small / little",     pos: "adjective" },
  { hanzi: "ante",    pinyin: "ante",     en: "other / different",  pos: "adjective" },
  { hanzi: "ala",     pinyin: "ala",      en: "no / none",          pos: "adverb / negation" },
  { hanzi: "oko",     pinyin: "oko",      en: "eye (alt word)",     pos: "noun" }
] as const;

export default words;
