import React, { useEffect, useState } from "react";
import { FlashCard } from "./FlashCard";
import { gradeAnswer, loadProgress, saveProgress } from "./progress";

export const LessonPractice: React.FC<{
  lesson: { id: string; title: string; vocab: any[] };
  onExit: () => void;
}> = ({ lesson, onExit }) => {
  const [db, setDb] = useState(loadProgress());
  const [queue, setQueue] = useState<string[]>(() =>
    lesson.vocab.map((w) => `${lesson.id}-${w.hanzi}`)
  );
  const [index, setIndex] = useState(0);

  useEffect(() => saveProgress(db), [db]);

  const current = lesson.vocab[index];

  const handleAnswer = (correct: boolean) => {
    const id = `${lesson.id}-${current.hanzi}`;
    gradeAnswer(db, id, correct);
    setDb({ ...db });
    if (index + 1 === lesson.vocab.length) {
      onExit();
    } else {
      setIndex((i) => i + 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <h2 className="text-3xl font-extrabold text-indigo-700">{lesson.title}</h2>
      <FlashCard word={current} onAnswer={handleAnswer} />
      <p className="text-sm text-gray-500">
        Word {index + 1} / {lesson.vocab.length}
      </p>
    </div>
  );
};
