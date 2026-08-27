// src/components/dashboard/SideNavAnalyses.tsx

"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { useAnalysisStream } from "@/components/analysis/AnalysisStreamProvider";

import type { components } from "@/types/api";

type AnalysisListItem = components["schemas"]["AnalysisListItemRead"];

const MAX_RECENT_ANALYSES = 10;

export default function SideNavAnalyses() {
  const pathname = usePathname();

  const { analysis: liveAnalysis } = useAnalysisStream();

  const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);

  /*
   * Gespeicherte Analysen laden.
   *
   * `isStale` wird vom aufrufenden Effect übergeben,
   * damit eine veraltete Response (Effect bereits
   * erneut gelaufen oder Component unmounted) das
   * Ergebnis eines neueren Fetches nicht überschreibt.
   */
  const fetchAnalyses = useCallback(async (isStale: () => boolean) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        return;
      }

      const response = await fetch(`${apiUrl}/analyses`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        console.error("Failed to fetch analyses:", response.status);

        return;
      }

      const data = (await response.json()) as AnalysisListItem[];

      if (!isStale()) {
        setAnalyses(data);
      }
    } catch (error) {
      console.error("Failed to fetch analyses:", error);
    }
  }, []);

  /*
   * Initiale History laden.
   */
  useEffect(() => {
    let ignore = false;

    // react-hooks/set-state-in-effect can't see the `isStale`
    // guard inside fetchAnalyses, so it flags this as an
    // unguarded setState-in-effect. It isn't: the response is
    // discarded once `ignore` is true (effect re-ran, or unmount).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAnalyses(() => ignore);

    return () => {
      ignore = true;
    };
  }, [fetchAnalyses]);

  /*
   * Wenn eine Live-Analyse fertig ist
   * oder fehlschlägt, DB-State erneut laden.
   */
  useEffect(() => {
    if (
      liveAnalysis.status !== "completed" &&
      liveAnalysis.status !== "error"
    ) {
      return;
    }

    let ignore = false;

    // See the identical eslint-disable note in the effect above.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAnalyses(() => ignore);

    return () => {
      ignore = true;
    };
  }, [liveAnalysis.status, fetchAnalyses]);

  /*
   * Provider-Status auf Backend-Status mappen.
   */
  const liveStatus: AnalysisListItem["status"] | null =
    liveAnalysis.status === "completed"
      ? "completed"
      : liveAnalysis.status === "error"
        ? "failed"
        : liveAnalysis.status === "starting" ||
            liveAnalysis.status === "streaming"
          ? "processing"
          : null;

  /*
   * Aktuelle Live-Analyse in das Format
   * unserer Sidebar-Liste bringen.
   */
  const liveListItem: AnalysisListItem | null =
    liveAnalysis.id && liveStatus
      ? {
          id: liveAnalysis.id,

          title: liveAnalysis.data.title ?? "Analysis in progress",

          status: liveStatus,

          created_at: liveAnalysis.data.created_at ?? new Date().toISOString(),
        }
      : null;

  /*
   * Live-Analyse zuerst.
   *
   * Danach DB-History, wobei ein mögliches
   * Duplikat der Live-Analyse entfernt wird.
   *
   * Anschließend maximal 10 Einträge anzeigen.
   */
  const visibleAnalyses: AnalysisListItem[] = [
    ...(liveListItem ? [liveListItem] : []),

    ...analyses.filter((analysis) => analysis.id !== liveAnalysis.id),
  ].slice(0, MAX_RECENT_ANALYSES);

  return (
    <div className="mt-8">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Recent Analyses
      </h3>

      {visibleAnalyses.length === 0 ? (
        <p className="px-3 text-sm text-gray-500">No analyses yet</p>
      ) : (
        <div className="space-y-1">
          {visibleAnalyses.map((analysis) => {
            const href = `/dashboard/analyses/${analysis.id}`;

            const isActive = pathname === href;

            return (
              <Link
                key={analysis.id}
                href={href}
                title={analysis.title}
                className={clsx(
                  "group flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left transition",
                  {
                    "bg-gray-800 text-white": isActive,

                    "text-gray-400 hover:bg-gray-800/60 hover:text-white":
                      !isActive,
                  },
                )}
              >
                <div className="mt-1.5">
                  <StatusDot status={analysis.status} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{analysis.title}</p>

                  <p className="mt-0.5 text-xs text-gray-600">
                    {formatAnalysisDate(analysis.created_at)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: AnalysisListItem["status"] }) {
  if (status === "processing") {
    return (
      <span
        title="Analyzing"
        aria-label="Analysis in progress"
        className="block h-2 w-2 shrink-0 animate-pulse rounded-full bg-blue-400"
      />
    );
  }

  if (status === "completed") {
    return (
      <span
        title="Completed"
        aria-label="Analysis completed"
        className="block h-2 w-2 shrink-0 rounded-full bg-emerald-400"
      />
    );
  }

  return (
    <span
      title="Failed"
      aria-label="Analysis failed"
      className="block h-2 w-2 shrink-0 rounded-full bg-red-400"
    />
  );
}

function formatAnalysisDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const today = new Date();

  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const dateStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const differenceInDays = Math.round(
    (todayStart.getTime() - dateStart.getTime()) / 86_400_000,
  );

  if (differenceInDays === 0) {
    return "Today";
  }

  if (differenceInDays === 1) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}
