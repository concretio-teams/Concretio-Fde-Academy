import type { Assignment, Concept, Exercise, FinalAssessment, Lesson, Module, Resource } from './types';

type ModFile = { module?: Module; concepts?: Concept[] };
const modFiles = import.meta.glob('./modules/*.ts', { eager: true }) as Record<string, ModFile>;
const finFiles = import.meta.glob('./final.ts', { eager: true }) as Record<string, { final?: FinalAssessment }>;
const resFiles = import.meta.glob('./resources.ts', { eager: true }) as Record<string, { resources?: Resource[] }>;

export const modules: Module[] = Object.values(modFiles)
  .map((m) => m.module)
  .filter((m): m is Module => !!m)
  .sort((a, b) => a.number - b.number);

export const conceptMap: Record<string, Concept> = {};
for (const f of Object.values(modFiles)) for (const c of f.concepts ?? []) conceptMap[c.id] = c;

export const conceptList: Concept[] = Object.values(conceptMap).sort((a, b) => a.name.localeCompare(b.name));

export const resourcesForLesson = (lessonId: string): Resource[] => resources.filter((r) => r.lessons?.includes(lessonId));

export { finalSalesforce } from './finalSalesforce';
export const finalAssessment: FinalAssessment | null = Object.values(finFiles)[0]?.final ?? null;
export const resources: Resource[] = Object.values(resFiles)[0]?.resources ?? [];

export const allLessons: { lesson: Lesson; module: Module; index: number }[] = [];
export const allAssignments: { assignment: Assignment; module: Module }[] = [];
export const allExercises: { exercise: Exercise; lesson: Lesson; module: Module }[] = [];

for (const module of modules) {
  module.lessons.forEach((lesson, index) => {
    allLessons.push({ lesson, module, index });
    for (const b of lesson.blocks) if (b.type === 'exercise') allExercises.push({ exercise: b.exercise, lesson, module });
  });
  for (const assignment of module.assignments) allAssignments.push({ assignment, module });
}

export const lessonById = (id: string) => allLessons.find((l) => l.lesson.id === id);
export const moduleById = (id: string) => modules.find((m) => m.id === id);
export const assignmentById = (id: string) => allAssignments.find((a) => a.assignment.id === id);

export function nextLessonAfter(id?: string) {
  if (!id) return allLessons[0];
  const i = allLessons.findIndex((l) => l.lesson.id === id);
  return allLessons[i + 1];
}
