/* Flat word bank – add as many as you like */
const words = [
    { hanzi: "你好",   pinyin: "nǐ hǎo",   en: "hello", pos: "greeting" },
    { hanzi: "谢谢",   pinyin: "xièxie",   en: "thank you", pos: "verb" },
    { hanzi: "是",     pinyin: "shì",      en: "to be", pos: "verb (copula)" },
    { hanzi: "再见",   pinyin: "zàijiàn",  en: "good-bye", pos: "farewell" },
    { hanzi: "米饭",   pinyin: "mǐfàn",    en: "rice", pos: "noun" },
    { hanzi: "面条",   pinyin: "miàntiáo", en: "noodles", pos: "noun" },
    { hanzi: "水",     pinyin: "shuǐ",     en: "water", pos: "noun" },
    { hanzi: "茶",     pinyin: "chá",      en: "tea", pos: "noun" },
    { hanzi: "火车",   pinyin: "huǒchē",   en: "train", pos: "noun" },
    { hanzi: "飞机",   pinyin: "fēijī",    en: "airplane", pos: "noun" },
    /* …keep appending … */
  ] as const;
  
  export type Word = (typeof words)[number];
  export default words;
  