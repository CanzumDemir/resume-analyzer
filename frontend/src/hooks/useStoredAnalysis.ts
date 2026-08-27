"use client";

import { useEffect, useState } from "react";

import type { components } from "@/types/api";

type AnalysisDetail =
  components["schemas"]["AnalysisDetailRead"];

type UseStoredAnalysisOptions = {
  analysisId: string;
  enabled?: boolean;
  pollIntervalMs?: number;
};

type UseStoredAnalysisResult = {
  detail: AnalysisDetail | null;
  loading: boolean;
  error: string | null;
};

export function useStoredAnalysis({
  analysisId,
  enabled = true,
  pollIntervalMs = 2000,
}: UseStoredAnalysisOptions): UseStoredAnalysisResult {
  const [detail, setDetail] =
    useState<AnalysisDetail | null>(null);

  const [loading, setLoading] =
    useState(enabled);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setDetail(null);
      setLoading(false);
      setError(null);

      return;
    }

    const controller =
      new AbortController();

    let timeoutId:
      | ReturnType<typeof setTimeout>
      | null = null;

    let cancelled = false;

    const fetchAnalysis = async (
      initialRequest: boolean
    ) => {
      try {
        if (initialRequest) {
          setLoading(true);
        }

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          throw new Error(
            "API URL is not configured."
          );
        }

        const response = await fetch(
          `${apiUrl}/analyses/${encodeURIComponent(
            analysisId
          )}`,
          {
            credentials: "include",

            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (response.status === 401) {
          throw new Error(
            "Your session has expired."
          );
        }

        if (response.status === 404) {
          throw new Error(
            "Analysis not found."
          );
        }

        if (!response.ok) {
          throw new Error(
            `Backend returned status ${response.status}.`
          );
        }

        const data =
          (await response.json()) as AnalysisDetail;

        if (cancelled) {
          return;
        }

        setDetail(data);
        setError(null);

        /*
         * Solange die Analyse noch läuft,
         * fragen wir das Backend erneut.
         *
         * completed / failed:
         * kein weiterer Request.
         */
        if (data.status === "processing") {
          timeoutId = setTimeout(() => {
            void fetchAnalysis(false);
          }, pollIntervalMs);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Failed to load analysis:",
          error
        );

        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Could not load analysis."
          );
        }
      } finally {
        if (
          initialRequest &&
          !cancelled
        ) {
          setLoading(false);
        }
      }
    };

    void fetchAnalysis(true);

    /*
     * Cleanup:
     *
     * Wenn die Route gewechselt oder
     * die Component zerstört wird,
     * brechen wir Fetch + Polling ab.
     */
    return () => {
      cancelled = true;

      controller.abort();

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [
    analysisId,
    enabled,
    pollIntervalMs,
  ]);

  /*
   * Verhindert, dass beim schnellen Wechsel
   * zwischen zwei Analysen kurz Daten der
   * vorherigen Analyse angezeigt werden.
   */
  const currentDetail =
    detail?.id === analysisId
      ? detail
      : null;

  return {
    detail: currentDetail,
    loading,
    error,
  };
}