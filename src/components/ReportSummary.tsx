"use client";

import { useState, useEffect, useCallback } from "react";
import { MarkdownContent } from "./MarkdownContent";
import { useToast } from "./Toast";

interface ReportSummaryProps {
    reportId: string;
    cycleId: string;
    hasEntries: boolean;
}

export function ReportSummary({
    reportId,
    cycleId,
    hasEntries,
}: ReportSummaryProps) {
    const { showToast } = useToast();
    const [summary, setSummary] = useState<string | null>(null);
    const [generatedAt, setGeneratedAt] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    const fetchSummary = useCallback(async () => {
        try {
            const response = await fetch(
                `/api/reports/${reportId}/summary?cycle_id=${cycleId}`
            );
            if (response.ok) {
                const data = await response.json();
                if (data.summary) {
                    setSummary(data.summary.content);
                    setGeneratedAt(data.summary.generatedAt);
                    setIsExpanded(true);
                }
            }
        } catch (error) {
            console.error("Error fetching summary:", error);
        } finally {
            setFetching(false);
        }
    }, [reportId, cycleId]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `/api/reports/${reportId}/summary`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cycle_id: cycleId }),
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to generate summary");
            }

            const data = await response.json();
            setSummary(data.summary.content);
            setGeneratedAt(data.summary.generatedAt);
            setIsExpanded(true);
            showToast("Summary generated", "success");
        } catch (error) {
            showToast(
                error instanceof Error
                    ? error.message
                    : "Failed to generate summary",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    if (fetching) {
        return (
            <div className="bg-white rounded-md border border-[#E5E7EB] mb-6 min-[1080px]:mb-4">
                <div className="px-4 py-3">
                    <div className="h-5 w-32 bg-[#F3F4F6] rounded animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-md border border-[#E5E7EB] mb-6 min-[1080px]:mb-4">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#F9FAFB] transition-colors rounded-md"
            >
                <div className="flex items-center gap-2">
                    <svg
                        className="w-4 h-4 text-[#7C3AED]"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                        />
                    </svg>
                    <h2 className="text-md font-semibold text-[#111827] tracking-tight">
                        AI Summary
                    </h2>
                </div>
                <svg
                    className={`w-4 h-4 text-[#6B7280] transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isExpanded && (
                <div className="px-4 pt-2 pb-4">
                    {summary ? (
                        <div>
                            <MarkdownContent className="text-[#4B5563]">
                                {summary}
                            </MarkdownContent>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F3F4F6]">
                                <p className="text-xs text-[#9CA3AF]">
                                    Generated {generatedAt ? formatDate(generatedAt) : ""}
                                </p>
                                <button
                                    type="button"
                                    onClick={handleGenerate}
                                    disabled={loading || !hasEntries}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-[#7C3AED] hover:text-[#6D28D9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? (
                                        <svg
                                            className="animate-spin w-3 h-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                            />
                                        </svg>
                                    )}
                                    Refresh
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-sm text-[#6B7280] mb-3">
                                {hasEntries
                                    ? "Generate an AI-powered summary of all entries and goals for this cycle."
                                    : "Add entries to generate an AI summary."}
                            </p>
                            <button
                                type="button"
                                onClick={handleGenerate}
                                disabled={loading || !hasEntries}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <>
                                        <svg
                                            className="animate-spin w-3.5 h-3.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                                            />
                                        </svg>
                                        Generate Summary
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
