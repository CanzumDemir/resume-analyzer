"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import type { components } from "@/types/api";

type AnalysisResult = components["schemas"]["AnalysisResultRead"];

type AnalysisDetail = components["schemas"]["AnalysisDetailRead"];

type AnalysisStreamStatus =
  "idle" | "starting" | "streaming" | "completed" | "error";

export type StreamingAnalysis = {
  id: string | null;
  status: AnalysisStreamStatus;
  data: Partial<AnalysisResult>;
  error: string | null;
};

type StartAnalysisInput = {
  resume: File;
  jobDescription: string;
  aiModel: string;
};

type AnalysisStreamContextValue = {
  analysis: StreamingAnalysis;
  startAnalysis: (input: StartAnalysisInput) => Promise<void>;
};

const initialState: StreamingAnalysis = {
  id: null,
  status: "idle",
  data: {},
  error: null,
};

const AnalysisStreamContext = createContext<AnalysisStreamContextValue | null>(
  null,
);

export function AnalysisStreamProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [analysis, setAnalysis] = useState<StreamingAnalysis>(initialState);

  const abortControllerRef = useRef<AbortController | null>(null);

  /*
   * Wird nach dem "done"-Event aufgerufen.
   *
   * Der Stream-State ist für die Live-UI.
   * Die Datenbank ist danach unsere endgültige Wahrheit.
   */
  const fetchFinalAnalysis = useCallback(
    async (analysisId: string): Promise<AnalysisResult> => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured.");
      }

      const response = await fetch(
        `${apiUrl}/analyses/${encodeURIComponent(analysisId)}`,
        {
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(`Could not load final analysis (${response.status}).`);
      }

      const detail = (await response.json()) as AnalysisDetail;

      if (detail.status !== "completed") {
        throw new Error(`Analysis is not completed yet (${detail.status}).`);
      }

      if (!detail.result) {
        throw new Error("Completed analysis does not contain a result.");
      }

      return detail.result;
    },
    [],
  );

  const startAnalysis = useCallback(
    async ({ resume, jobDescription, aiModel }: StartAnalysisInput) => {
      /*
       * Vorerst nur eine laufende Analyse gleichzeitig.
       */
      if (analysis.status === "starting" || analysis.status === "streaming") {
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        setAnalysis({
          ...initialState,
          status: "error",
          error: "NEXT_PUBLIC_API_URL is not configured.",
        });

        return;
      }

      const controller = new AbortController();

      abortControllerRef.current = controller;

      setAnalysis({
        id: null,
        status: "starting",
        data: {},
        error: null,
      });

      try {
        const formData = new FormData();

        formData.append("resume", resume);

        formData.append("job_description", jobDescription);

        formData.append("ai_model", aiModel);

        const response = await fetch(`${apiUrl}/stream_analyze_resume`, {
          method: "POST",

          credentials: "include",

          body: formData,

          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();

          throw new Error(`Analyze failed (${response.status}): ${errorText}`);
        }

        if (!response.body) {
          throw new Error("Backend response does not contain a stream.");
        }

        const reader = response.body.getReader();

        const decoder = new TextDecoder();

        let buffer = "";

        /*
         * Lokale Variable ist wichtig:
         * React-State Updates sind asynchron.
         */
        let currentAnalysisId: string | null = null;

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, {
            stream: true,
          });

          /*
           * Ein SSE-Event endet mit einer Leerzeile.
           */
          const eventBlocks = buffer.split("\n\n");

          /*
           * Letzter Block kann noch
           * unvollständig sein.
           */
          buffer = eventBlocks.pop() ?? "";

          for (const eventBlock of eventBlocks) {
            if (!eventBlock.trim()) {
              continue;
            }

            /*
             * Unterstützt auch mehrere data:-Zeilen,
             * falls wir später das SSE-Format erweitern.
             */
            const dataLines = eventBlock
              .split("\n")
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.slice("data:".length).trimStart());

            if (dataLines.length === 0) {
              continue;
            }

            const jsonText = dataLines.join("\n");

            const event = JSON.parse(jsonText);

            console.log("Analysis stream event:", event);

            switch (event.type) {
              /*
               * Das MUSS das erste Backend-Event sein.
               */
              case "analysis_created": {
                const id = event.value?.analysis_id;

                if (typeof id !== "string" || !id) {
                  throw new Error("Backend returned an invalid analysis ID.");
                }

                currentAnalysisId = id;

                setAnalysis((previous) => ({
                  ...previous,
                  id,
                  status: "streaming",
                }));

                /*
                 * Hier navigieren wir SOFORT.
                 * Nicht erst nach dem Stream.
                 */
                router.push(`/dashboard/analyses/${id}`);

                break;
              }

              case "title": {
                setAnalysis((previous) => ({
                  ...previous,
                  data: {
                    ...previous.data,
                    title: event.value,
                  },
                }));

                break;
              }

              case "overall_score": {
                setAnalysis((previous) => ({
                  ...previous,
                  data: {
                    ...previous.data,
                    overall_score: event.value,
                  },
                }));

                break;
              }

              case "ats_score": {
                setAnalysis((previous) => ({
                  ...previous,
                  data: {
                    ...previous.data,
                    ats_score: event.value,
                  },
                }));

                break;
              }

              case "section_scores": {
                setAnalysis((previous) => ({
                  ...previous,
                  data: {
                    ...previous.data,
                    section_scores: event.value,
                  },
                }));

                break;
              }

              case "summary": {
                setAnalysis((previous) => ({
                  ...previous,
                  data: {
                    ...previous.data,
                    summary: event.value,
                  },
                }));

                break;
              }

              case "strengths": {
                setAnalysis((previous) => ({
                  ...previous,
                  data: {
                    ...previous.data,
                    strengths: event.value,
                  },
                }));

                break;
              }

              case "room_for_improvement": {
                setAnalysis((previous) => ({
                  ...previous,
                  data: {
                    ...previous.data,
                    room_for_improvement: event.value,
                  },
                }));

                break;
              }

              case "missing_keywords": {
                setAnalysis((previous) => ({
                  ...previous,
                  data: {
                    ...previous.data,
                    missing_keywords: event.value,
                  },
                }));

                break;
              }

              case "recommendations_for_action": {
                setAnalysis((previous) => ({
                  ...previous,
                  data: {
                    ...previous.data,
                    recommendations_for_action: event.value,
                  },
                }));

                break;
              }

              case "done": {
                /*
                 * Backend hat zu diesem Zeitpunkt
                 * AnalysisResult committed.
                 */
                if (!currentAnalysisId) {
                  throw new Error("Analysis completed without an ID.");
                }

                const finalResult = await fetchFinalAnalysis(currentAnalysisId);

                setAnalysis({
                  id: currentAnalysisId,
                  status: "completed",
                  data: finalResult,
                  error: null,
                });

                break;
              }

              case "error": {
                throw new Error(
                  typeof event.value === "string"
                    ? event.value
                    : "Analysis failed.",
                );
              }

              default: {
                console.warn("Unknown analysis event:", event);
              }
            }
          }
        }

        if (!currentAnalysisId) {
          throw new Error("Backend did not return an analysis ID.");
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Analysis stream failed:", error);

        setAnalysis((previous) => ({
          ...previous,
          status: "error",
          error: error instanceof Error ? error.message : "Analysis failed.",
        }));
      } finally {
        abortControllerRef.current = null;
      }
    },
    [analysis.status, fetchFinalAnalysis, router],
  );

  /*
   * Wenn das komplette Dashboard
   * verlassen wird, Request schließen.
   */
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return (
    <AnalysisStreamContext.Provider
      value={{
        analysis,
        startAnalysis,
      }}
    >
      {children}
    </AnalysisStreamContext.Provider>
  );
}

export function useAnalysisStream() {
  const context = useContext(AnalysisStreamContext);

  if (!context) {
    throw new Error(
      "useAnalysisStream must be used inside AnalysisStreamProvider.",
    );
  }

  return context;
}
