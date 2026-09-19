import Link from 'next/link';
import type { CurriculumLesson } from '@/lib/curriculum/types';
import { getAllCurriculumLessons } from '@/lib/curriculum/curriculum-data';

interface LessonSEOContentProps {
  lesson: CurriculumLesson;
  siteUrl: string;
}

/**
 * LessonSEOContent — Visible SEO content for each lesson page.
 * This is NOT hidden text; users and Google both see it.
 * Includes: lesson overview, skills, breadcrumb, prev/next navigation.
 */
export function LessonSEOContent({ lesson, siteUrl }: LessonSEOContentProps) {
  const allLessons = getAllCurriculumLessons();
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const difficultyLabel = (d: number) => {
    if (d <= 2) return { label: 'সহজ', color: 'text-green-400' };
    if (d <= 5) return { label: 'মধ্যম', color: 'text-yellow-400' };
    if (d <= 8) return { label: 'কঠিন', color: 'text-orange-400' };
    return { label: 'বিশেষজ্ঞ', color: 'text-red-400' };
  };

  const diff = difficultyLabel(lesson.difficulty);

  // BreadcrumbList JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'হোম', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'পাঠ', item: `${siteUrl}/learn` },
      {
        '@type': 'ListItem',
        position: 3,
        name: lesson.moduleTitle,
        item: `${siteUrl}/learn`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: lesson.title,
        item: `${siteUrl}/lesson/${lesson.id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="text-sm text-blue-300 mb-6">
        <Link href="/" className="hover:text-white transition-colors">হোম</Link>
        <span className="mx-2">›</span>
        <Link href="/learn" className="hover:text-white transition-colors">পাঠ</Link>
        <span className="mx-2">›</span>
        <Link href="/bangla-typing-course" className="hover:text-white transition-colors">
          Level {lesson.level}
        </Link>
        <span className="mx-2">›</span>
        <span className="text-white">{lesson.title}</span>
      </nav>

      {/* Lesson Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-blue-400 text-xs font-mono bg-blue-400/10 px-2 py-1 rounded">
            Level {lesson.level}
          </span>
          <span className="text-slate-400 text-xs">{lesson.moduleTitle}</span>
          <span className={`text-xs ${diff.color}`}>{diff.label}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{lesson.title}</h1>
        {lesson.subtitle && (
          <p className="text-blue-200 text-lg mb-3">{lesson.subtitle}</p>
        )}
        <p className="text-slate-300 leading-relaxed max-w-2xl">{lesson.description}</p>
      </div>

      {/* Lesson Meta */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
          <div className="text-2xl font-bold text-blue-400">{lesson.estimatedMinutes}</div>
          <div className="text-slate-400 text-sm">মিনিট</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
          <div className="text-2xl font-bold text-purple-400">{lesson.sections.length}</div>
          <div className="text-slate-400 text-sm">section</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
          <div className={`text-2xl font-bold ${diff.color}`}>{lesson.difficulty}/10</div>
          <div className="text-slate-400 text-sm">কঠিনতা</div>
        </div>
      </div>

      {/* What You Will Learn */}
      {lesson.skills.length > 0 && (
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
          <h2 className="text-xl font-bold mb-4">এই পাঠে কী শিখবেন</h2>
          <div className="flex flex-wrap gap-2">
            {lesson.skills.map((skill) => (
              <span
                key={skill}
                className="bg-blue-500/10 border border-blue-500/20 text-blue-200 rounded-lg px-3 py-1.5 text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sections Overview */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
        <h2 className="text-xl font-bold mb-4">পাঠের ধাপগুলো</h2>
        <div className="space-y-3">
          {lesson.sections.map((section, i) => (
            <div key={section.id} className="flex items-start gap-3">
              <span className="text-blue-400 font-mono text-sm shrink-0 mt-0.5">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <div className="font-medium text-sm">{section.title}</div>
                {section.instruction && (
                  <div className="text-slate-400 text-xs mt-0.5">{section.instruction}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev/Next Navigation */}
      <div className="flex gap-4 mt-8">
        {prevLesson ? (
          <Link
            href={`/lesson/${prevLesson.id}`}
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 flex-1 transition-colors"
          >
            <div className="text-slate-400 text-xs mb-1">← আগের পাঠ</div>
            <div className="font-semibold text-sm">{prevLesson.title}</div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {nextLesson ? (
          <Link
            href={`/lesson/${nextLesson.id}`}
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 flex-1 transition-colors text-right"
          >
            <div className="text-slate-400 text-xs mb-1">পরের পাঠ →</div>
            <div className="font-semibold text-sm">{nextLesson.title}</div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </>
  );
}
