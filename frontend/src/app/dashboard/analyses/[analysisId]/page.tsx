// AI assistance disclosure: AI tools assisted with frontend UI implementation,
// styling, Tailwind CSS, layout, and implementation details during development.
// Exact historical line-level provenance is unavailable; see AI_ASSISTANCE.md.

"use client";

import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";

import ScoreCard from "@/components/analysis/ScoreCard";
import { useAnalysisStream } from "@/components/analysis/AnalysisStreamProvider";
import { useStoredAnalysis } from "@/hooks/useStoredAnalysis";

import type { components } from "@/types/api";

type AnalysisResult = components["schemas"]["AnalysisResultRead"];

type AnalysisSectionProps = {
  title: string;
  children: ReactNode;
};

function AnalysisSection({ title, children }: AnalysisSectionProps) {
  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
      <h2 className="mb-5 text-lg font-semibold text-white">{title}</h2>

      {children}
    </section>
  );
}

function MarkdownText({ content }: { content: string }) {
  return (
    <div className="space-y-3 text-sm leading-7 text-gray-300">
      <ReactMarkdown
        skipHtml
        components={{
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),

          p: ({ children }) => <p>{children}</p>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function ScoreSkeleton() {
  return (
    <div className="h-40 animate-pulse rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
      <div className="h-4 w-28 rounded bg-gray-800" />

      <div className="mt-5 h-9 w-16 rounded bg-gray-800" />

      <div className="mt-6 h-2 w-full rounded bg-gray-800" />
    </div>
  );
}

function TextSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 w-full rounded bg-gray-800" />
      <div className="h-4 w-11/12 rounded bg-gray-800" />
      <div className="h-4 w-4/5 rounded bg-gray-800" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-xl border border-gray-800 bg-gray-800/40 p-5"
        >
          <div className="h-4 w-full rounded bg-gray-700" />

          <div className="mt-3 h-4 w-4/5 rounded bg-gray-700" />
        </div>
      ))}
    </div>
  );
}

function FullPageSkeleton() {
  return (
    <div className="min-h-full bg-gray-950">
      <header className="border-b border-gray-800 px-8 py-6">
        <div className="mx-auto max-w-6xl">
          <div className="h-8 w-80 animate-pulse rounded bg-gray-800" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <ScoreSkeleton />
          <ScoreSkeleton />
        </div>

        <div className="h-72 animate-pulse rounded-2xl bg-gray-900" />
      </main>
    </div>
  );
}

export default function AnalysisPage() {
  const { analysisId } = useParams<{
    analysisId: string;
  }>();

  const { analysis: streamAnalysis } = useAnalysisStream();

  const isLiveAnalysis = streamAnalysis.id === analysisId;

  // Falls back to polling the stored analysis whenever this page
  // isn't the one currently being streamed (reload, direct link, etc.).
  const {
    detail: storedAnalysis,
    loading: storedLoading,
    error: storedError,
  } = useStoredAnalysis({
    analysisId,
    enabled: !isLiveAnalysis,
    pollIntervalMs: 2000,
  });

  // The rendered UI doesn't need to know whether the data came from
  // the live stream or from the database — just which one is current.
  const analysis: Partial<AnalysisResult> | null = isLiveAnalysis
    ? streamAnalysis.data
    : (storedAnalysis?.result ?? null);

  const status = isLiveAnalysis
    ? streamAnalysis.status
    : (storedAnalysis?.status ?? null);

  const isProcessing =
    status === "starting" || status === "streaming" || status === "processing";

  const isCompleted = status === "completed";

  const isFailed = status === "error" || status === "failed";

  if (!isLiveAnalysis && storedError) {
    return (
      <div className="flex min-h-full items-center justify-center bg-gray-950 p-8">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <h1 className="text-lg font-semibold text-red-300">
            Analysis could not be loaded
          </h1>

          <p className="mt-2 text-sm text-gray-400">{storedError}</p>
        </div>
      </div>
    );
  }

  if (!isLiveAnalysis && isFailed) {
    return (
      <div className="flex min-h-full items-center justify-center bg-gray-950 p-8">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <h1 className="text-lg font-semibold text-red-300">
            Analysis failed
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-400">
            This analysis could not be completed. Please start a new analysis.
          </p>
        </div>
      </div>
    );
  }

  if (!isLiveAnalysis && storedLoading && !storedAnalysis) {
    return <FullPageSkeleton />;
  }

  return (
    <div className="min-h-full bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 px-6 py-6 backdrop-blur-xl md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 flex items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Resume Analysis
            </p>

            {isProcessing && (
              <span className="flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs text-blue-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                Analyzing
              </span>
            )}

            {isCompleted && (
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">
                Completed
              </span>
            )}
          </div>

          {analysis?.title ? (
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              {analysis.title}
            </h1>
          ) : (
            <div className="h-9 w-80 animate-pulse rounded-lg bg-gray-800" />
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-6 md:p-8">
        {/* Live Stream Error */}
        {isLiveAnalysis && streamAnalysis.status === "error" && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-300">
            {streamAnalysis.error ?? "Analysis failed."}
          </div>
        )}

        {/* Main Scores */}
        <div className="grid gap-4 md:grid-cols-2">
          {analysis?.overall_score !== undefined ? (
            <ScoreCard title="Overall Score" score={analysis.overall_score} />
          ) : (
            <ScoreSkeleton />
          )}

          {analysis?.ats_score !== undefined ? (
            <ScoreCard title="ATS Score" score={analysis.ats_score} />
          ) : (
            <ScoreSkeleton />
          )}
        </div>

        {/* Section Scores */}
        <AnalysisSection title="Section Scores">
          {analysis?.section_scores ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <ScoreCard
                title="Experience Match"
                score={analysis.section_scores.experience_match}
              />

              <ScoreCard
                title="Hard Skills"
                score={analysis.section_scores.hard_skills_match}
              />

              <ScoreCard
                title="Education & Certifications"
                score={analysis.section_scores.education_and_certifications}
              />

              <ScoreCard
                title="Achievements & Impact"
                score={analysis.section_scores.achievements_and_impact}
              />

              <ScoreCard
                title="Resume Quality"
                score={analysis.section_scores.resume_quality}
              />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({
                length: 5,
              }).map((_, index) => (
                <ScoreSkeleton key={index} />
              ))}
            </div>
          )}
        </AnalysisSection>

        {/* Summary */}
        <AnalysisSection title="Summary">
          {analysis?.summary ? (
            <MarkdownText content={analysis.summary} />
          ) : (
            <TextSkeleton />
          )}
        </AnalysisSection>

        {/* Strengths */}
        <AnalysisSection title="Strengths">
          {analysis?.strengths ? (
            analysis.strengths.length > 0 ? (
              <ul className="space-y-3">
                {analysis.strengths.map((strength, index) => (
                  <li
                    key={index}
                    className="rounded-xl border border-gray-800 bg-gray-800/40 p-5"
                  >
                    <div className="flex gap-4">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />

                      <div className="min-w-0 flex-1">
                        <MarkdownText content={strength} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No strengths returned.</p>
            )
          ) : (
            <ListSkeleton />
          )}
        </AnalysisSection>

        {/* Improvements */}
        <AnalysisSection title="Room for Improvement">
          {analysis?.room_for_improvement ? (
            analysis.room_for_improvement.length > 0 ? (
              <ul className="space-y-3">
                {analysis.room_for_improvement.map((item, index) => (
                  <li
                    key={index}
                    className="rounded-xl border border-gray-800 bg-gray-800/40 p-5"
                  >
                    <div className="flex gap-4">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-400" />

                      <div className="min-w-0 flex-1">
                        <MarkdownText content={item} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                No major improvements identified.
              </p>
            )
          ) : (
            <ListSkeleton />
          )}
        </AnalysisSection>

        {/* Missing Keywords */}
        <AnalysisSection title="Missing Keywords">
          {analysis?.missing_keywords ? (
            analysis.missing_keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysis.missing_keywords.map((keyword, index) => (
                  <span
                    key={`${keyword}-${index}`}
                    className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-sm text-amber-200"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No important keywords are missing.
              </p>
            )
          ) : (
            <TextSkeleton />
          )}
        </AnalysisSection>

        {/* Recommendations */}
        <AnalysisSection title="Recommendations">
          {analysis?.recommendations_for_action ? (
            analysis.recommendations_for_action.length > 0 ? (
              <ol className="space-y-3">
                {analysis.recommendations_for_action.map(
                  (recommendation, index) => (
                    <li
                      key={index}
                      className="rounded-xl border border-gray-800 bg-gray-800/40 p-5"
                    >
                      <div className="flex gap-4">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-400">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <MarkdownText content={recommendation} />
                        </div>
                      </div>
                    </li>
                  ),
                )}
              </ol>
            ) : (
              <p className="text-sm text-gray-500">
                No additional recommendations.
              </p>
            )
          ) : (
            <ListSkeleton />
          )}
        </AnalysisSection>
      </main>
    </div>
  );
}
