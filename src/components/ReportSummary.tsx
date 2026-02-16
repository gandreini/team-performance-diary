"use client";

import { useState, useEffect, useCallback } from "react";
import { MarkdownContent } from "./MarkdownContent";
import { useToast } from "./Toast";
import { Sparkles, ChevronDown, Loader2 } from "lucide-react";

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
        <div className={`bg-white rounded-md border border-[#E5E7EB] mb-6 min-[1080px]:mb-4 ${loading ? 'ai-loading-border' : ''}`}>
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#F9FAFB] transition-colors rounded-md"
            >
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#3B82F6]" />
                    <h2 className="text-md font-semibold text-[#111827] tracking-tight">
                        AI Summary
                    </h2>
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-[#6B7280] transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                    }`}
                />
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
                                    className="inline-flex items-center gap-1 text-xs font-medium text-[#3B82F6] hover:text-[#2563EB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin w-3 h-3" />
                                    ) : (
                                        <Sparkles className="w-3 h-3" />
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
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin w-3.5 h-3.5" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-3.5 h-3.5" />
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
