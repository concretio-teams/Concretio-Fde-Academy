import { useMemo, useState } from 'react';
import type { Question } from '../content/types';
import { Button, Progress, Rich } from '../ui';

export function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

/** The UI already says "Correct." in front of the explanation, so drop a leading "Correct." from the text itself. */
const plainWhy = (s: string) => s.replace(/^\s*Correct[.:,]?\s+/i, '');

interface Props {
  questions: Question[];
  mode?: 'immediate' | 'exam';
  passPct?: number;
  onFinish?: (score: number, total: number, answers: number[]) => void;
  /** The learner's last saved attempt, so coming back shows how they did instead of an empty quiz. */
  previous?: { answers?: number[]; last: number; total: number };
}

export function Quiz({ questions, mode = 'immediate', passPct = 70, onFinish, previous }: Props) {
  // Saved answers are only trusted when they still fit these questions.
  const saved = previous?.answers && previous.answers.length === questions.length && previous.answers.every((a, i) => Number.isInteger(a) && a >= 0 && a < (questions[i]?.options.length ?? 0)) ? previous.answers : null;
  const [attempt, setAttempt] = useState(0);
  const order = useMemo(() => questions.map((q) => shuffle(q.options.map((_, i) => i))), [questions, attempt]); // eslint-disable-line react-hooks/exhaustive-deps
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<(number | null)[]>(() => (saved ? [...saved] : questions.map(() => null)));
  const [locked, setLocked] = useState(false);
  const [done, setDone] = useState(!!saved);
  const [review, setReview] = useState(!!saved); // showing the saved attempt, not one just taken
  const [begun, setBegun] = useState(false);

  const total = questions.length;
  if (total === 0) return <p className="muted">No questions yet.</p>;

  const score = picked.reduce<number>((s, p, i) => s + (p === questions[i].answer ? 1 : 0), 0);

  const restart = () => {
    setAttempt((a) => a + 1); setIdx(0); setPicked(questions.map(() => null)); setLocked(false); setDone(false); setReview(false); setBegun(true);
  };

  // An attempt from before answers were saved: we know the score but not the answers, so offer a fresh go.
  if (!saved && previous && !begun && !done) {
    return (
      <div className="feedback">
        <b>Last time you scored {previous.last}/{previous.total}.</b>
        <p style={{ margin: '4px 0 8px' }}>{Math.round((previous.last / previous.total) * 100) >= passPct ? 'You passed. Take it again whenever you like.' : `Reach ${passPct}% to complete this lesson.`}</p>
        <Button variant="primary" onClick={() => setBegun(true)}>Retake quiz</Button>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="stack">
        <div className={`feedback ${pct >= passPct ? 'ok' : 'bad'}`}>
          <h3 style={{ margin: 0 }}>{review ? 'Your last attempt: ' : 'Score: '}{score}/{total} ({pct}%)</h3>
          <p style={{ margin: '4px 0 0' }}>{pct >= passPct ? 'Passed. Review anything you missed below.' : `Pass mark is ${passPct}%. Review the explanations, then retry.`}</p>
        </div>
        {questions.map((q, i) => {
          const ok = picked[i] === q.answer;
          const p = picked[i];
          return (
            <div key={q.id} className="card">
              <div className="row spread"><b>Q{i + 1}</b><span className={`badge ${ok ? 'ok' : 'warn'}`}>{ok ? 'Correct' : 'Missed'}</span></div>
              {q.scenario && <div className="scn"><Rich md={q.scenario} /></div>}
              <Rich md={q.q} />
              {!ok && p !== null && <div className="small"><b>Your answer:</b> <Rich md={q.options[p].text} /><Rich md={q.options[p].why} /></div>}
              <div className="small"><b>Correct:</b> <Rich md={q.options[q.answer].text} /><Rich md={plainWhy(q.options[q.answer].why)} /></div>
            </div>
          );
        })}
        <div><Button variant="primary" onClick={restart}>{review ? 'Retake quiz' : 'Retry quiz'}</Button></div>
      </div>
    );
  }

  const q = questions[idx];
  const sel = picked[idx];
  const reveal = mode === 'immediate' && locked;
  const pick = (orig: number) => {
    if (locked) return;
    setPicked((p) => p.map((v, i) => (i === idx ? orig : v)));
    if (mode === 'immediate') setLocked(true);
  };
  const next = () => {
    if (idx + 1 >= total) {
      setDone(true);
      onFinish?.(score, total, picked.map((p) => p ?? 0));
    } else { setIdx(idx + 1); setLocked(false); }
  };

  return (
    <div>
      <div className="row spread small muted" style={{ marginBottom: 6 }}>
        <span>Question {idx + 1} of {total}</span>
        {mode === 'immediate' && <span>Score so far: {score}</span>}
      </div>
      <Progress value={(idx / total) * 100} />
      <div className="card" style={{ marginTop: 12 }}>
        {q.scenario && <div className="scn"><Rich md={q.scenario} /></div>}
        <b><Rich md={q.q} /></b>
        {order[idx].map((orig) => {
          const o = q.options[orig];
          const cls = reveal ? (orig === q.answer ? 'right' : orig === sel ? 'wrong' : '') : orig === sel ? 'sel' : '';
          return (
            <button key={orig} className={`opt ${cls}`} onClick={() => pick(orig)} disabled={reveal}>
              <Rich md={o.text} />
              {reveal && (orig === q.answer || orig === sel) && <div className="why"><b>{orig === q.answer ? 'Correct. ' : 'Not quite. '}</b><Rich md={orig === q.answer ? plainWhy(o.why) : o.why} /></div>}
            </button>
          );
        })}
        <div className="row" style={{ marginTop: 12 }}>
          <Button variant="primary" onClick={next} disabled={sel === null}>{idx + 1 >= total ? 'Finish' : 'Next'}</Button>
          {sel === null && <span className="small muted">Pick an answer to continue</span>}
          {mode === 'exam' && idx > 0 && <Button onClick={() => { setIdx(idx - 1); }}>Back</Button>}
        </div>
      </div>
    </div>
  );
}
