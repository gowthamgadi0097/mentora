"use client";

type Props = {
  index: number;
  question: string;
  options: string[];
  selected: number;
  onSelect: (i: number) => void;
  /** After submission: the right answer and explanation */
  result?: { answerIndex: number; explanation: string };
};

export default function QuizCard({ index, question, options, selected, onSelect, result }: Props) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="mb-3 text-sm font-semibold">
        <span className="gradient-text mr-2 font-display text-lg">{index + 1}.</span>
        {question}
      </p>

      <div className="space-y-2">
        {options.map((opt, i) => {
          const isChosen = selected === i;
          const isAnswer = result?.answerIndex === i;
          const state = result
            ? isAnswer
              ? "border-green-500/70 bg-green-500/15"
              : isChosen
              ? "border-red-500/70 bg-red-500/15"
              : "border-border/50 opacity-70"
            : isChosen
            ? "border-primary bg-primary/15"
            : "border-border/60 hover:border-primary/60 hover:bg-surface";

          return (
            <button
              key={i}
              type="button"
              disabled={!!result}
              onClick={() => onSelect(i)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition ${state}`}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border/70 text-xs">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {result?.explanation && (
        <p className="mt-3 rounded-xl bg-bg/40 p-3 text-xs leading-relaxed text-muted">
          <strong className="text-text">Why: </strong>
          {result.explanation}
        </p>
      )}
    </div>
  );
}
