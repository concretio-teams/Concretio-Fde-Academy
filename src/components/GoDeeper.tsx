import { lessonById, resourcesForLesson } from '../content';
import type { Resource } from '../content/types';
import { href } from '../lib/router';
import { Badge } from '../ui';

export function ResourceItem({ r, first, showLessons }: { r: Resource; first?: boolean; showLessons?: boolean }) {
  return (
    <div className="resitem">
      <a href={r.url} target="_blank" rel="noreferrer" className="reslink">
      <div className="row spread">
        <b>{r.title.replace(/ \((official docs|official Anthropic docs|Anthropic Academy course|Anthropic, YouTube|Anthropic research)\)$/, '')}</b>
        <span className="row" style={{ gap: 6 }}>
          {first && <Badge tone="ok">Best first step</Badge>}
          <Badge tone="accent">{r.type}</Badge>
          <span className="small muted">{r.minutes} min</span>
        </span>
      </div>
      <div className="small muted">{r.learn}</div>
      </a>
      {showLessons && r.lessons && r.lessons.length > 0 && (
        <div className="small" style={{ marginTop: 6 }}>
          <span className="muted">Helps with: </span>
          {r.lessons.map((id, i) => <span key={id}>{i > 0 && ', '}<a href={href('lesson', id)}>{lessonById(id)?.lesson.title ?? id}</a></span>)}
        </div>
      )}
    </div>
  );
}

/** Optional extras for one lesson: things to watch or do first, then things to read. Links open in a new tab. */
export function GoDeeper({ lessonId }: { lessonId: string }) {
  const list = resourcesForLesson(lessonId);
  if (list.length === 0) return null;
  const watch = list.filter((r) => r.type === 'Video' || r.type === 'Course');
  const read = list.filter((r) => r.type === 'Docs' || r.type === 'Guide');
  const best = watch[0] ?? read[0];
  return (
    <div className="block" id="go-deeper">
      <h2>Go deeper</h2>
      <p className="muted small">Optional. You can finish the lesson without these. If you want more, start with the one marked best first step.</p>
      <div className="grid c2" style={{ alignItems: 'start' }}>
        {watch.length > 0 && (
          <div className="stack" style={{ gap: 8 }}>
            <div className="kicker">Watch or take a course</div>
            {watch.map((r) => <ResourceItem key={r.id} r={r} first={r === best} />)}
          </div>
        )}
        {read.length > 0 && (
          <div className="stack" style={{ gap: 8 }}>
            <div className="kicker">Read</div>
            {read.map((r) => <ResourceItem key={r.id} r={r} first={r === best} />)}
          </div>
        )}
      </div>
    </div>
  );
}
