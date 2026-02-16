"use client";

import { useState, useEffect } from "react";
import { MarkdownContent } from "./MarkdownContent";
import { EntryBadge } from "./EntryBadge";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { useToast } from "./Toast";
import { Loader2, SquarePen, Trash2 } from "lucide-react";
import type { Entry, DevelopmentGoal } from "@/db";

interface EntryCardProps {
    entry: Entry;
    onEdit: () => void;
    onDelete: () => void;
    readOnly?: boolean;
    refreshKey?: number;
}

export function EntryCard({
    entry,
    onEdit,
    onDelete,
    readOnly = false,
    refreshKey = 0,
}: EntryCardProps) {
    const { showToast } = useToast();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isOptimisticallyDeleted, setIsOptimisticallyDeleted] =
        useState(false);
    const [feedbackGiven, setFeedbackGiven] = useState(
        entry.feedbackGiven ?? false
    );
    const [updatingFeedbackGiven, setUpdatingFeedbackGiven] = useState(false);
    const [linkedGoals, setLinkedGoals] = useState<DevelopmentGoal[]>([]);

    // Fetch linked goals
    useEffect(() => {
        async function fetchLinkedGoals() {
            try {
                const response = await fetch(`/api/entries/${entry.id}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.linkedGoalIds && data.linkedGoalIds.length > 0) {
                        // Fetch full goal details
                        const reportId = entry.reportId;
                        const goalsResponse = await fetch(
                            `/api/reports/${reportId}/goals`
                        );
                        if (goalsResponse.ok) {
                            const goalsData = await goalsResponse.json();
                            const linked = goalsData.goals.filter(
                                (g: DevelopmentGoal) =>
                                    data.linkedGoalIds.includes(g.id)
                            );
                            setLinkedGoals(linked);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching linked goals:", error);
            }
        }
        fetchLinkedGoals();
    }, [entry.id, entry.reportId, refreshKey]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const handleDelete = async () => {
        // Optimistic UI: immediately close modal and hide the card
        setIsDeleteModalOpen(false);
        setIsOptimisticallyDeleted(true);

        try {
            const response = await fetch(`/api/entries/${entry.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete entry");
            }

            showToast("Entry deleted", "success");
            onDelete();
        } catch (error) {
            // Restore the card on failure
            setIsOptimisticallyDeleted(false);
            showToast("Failed to delete entry. Please try again.", "error");
        }
    };

    const handleFeedbackGivenChange = async (checked: boolean) => {
        const previousValue = feedbackGiven;
        setFeedbackGiven(checked);
        setUpdatingFeedbackGiven(true);

        try {
            const response = await fetch(`/api/entries/${entry.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ feedback_given: checked }),
            });

            if (!response.ok) {
                throw new Error("Failed to update");
            }
        } catch (error) {
            setFeedbackGiven(previousValue);
            showToast("Failed to update. Please try again.", "error");
        } finally {
            setUpdatingFeedbackGiven(false);
        }
    };

    const renderContent = () => {
        switch (entry.entryType) {
            case "feedback":
                return (
                    <div className="space-y-3">
                        <div>
                            <span className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                                Situation
                            </span>
                            <p className="text-sm text-[#374151] mt-0.5">
                                {entry.situation}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                                Behavior
                            </span>
                            <p className="text-sm text-[#374151] mt-0.5">
                                {entry.behavior}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                                Impact
                            </span>
                            <p className="text-sm text-[#374151] mt-0.5">
                                {entry.impact}
                            </p>
                        </div>
                        {entry.notes && (
                            <div>
                                <span className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                                    Notes
                                </span>
                                <MarkdownContent className="mt-0.5 text-[#374151]">
                                    {entry.notes}
                                </MarkdownContent>
                            </div>
                        )}
                    </div>
                );

            case "kudos":
                return (
                    <div className="space-y-2">
                        {entry.link && (
                            <div>
                                <a
                                    href={entry.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline text-sm break-all"
                                >
                                    {entry.link}
                                </a>
                            </div>
                        )}
                        <MarkdownContent className="text-[#374151]">
                            {entry.notes || ""}
                        </MarkdownContent>
                    </div>
                );

            case "third_party_feedback":
                return (
                    <div className="space-y-2">
                        <p className="text-sm text-[#6B7280]">
                            From:{" "}
                            <span className="font-medium text-[#111827]">
                                {entry.providerName}
                            </span>
                        </p>
                        <MarkdownContent className="text-[#374151]">
                            {entry.notes || ""}
                        </MarkdownContent>
                    </div>
                );

            case "accomplishment":
                return (
                    <div className="space-y-2">
                        {entry.title && (
                            <h3 className="text-sm font-medium text-[#111827]">
                                {entry.title}
                            </h3>
                        )}
                        <MarkdownContent className="text-[#374151]">
                            {entry.notes || ""}
                        </MarkdownContent>
                    </div>
                );

            default:
                return (
                    <MarkdownContent className="text-[#374151]">
                        {entry.notes || ""}
                    </MarkdownContent>
                );
        }
    };

    // Hide the card when optimistically deleted
    if (isOptimisticallyDeleted) {
        return null;
    }

    return (
        <>
            <div className="bg-white rounded-md border border-[#E5E7EB] p-4 pb-3">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <EntryBadge
                            entryType={entry.entryType}
                            feedbackType={entry.feedbackType}
                        />
                        <span className="text-xs text-[#6B7280]">
                            {formatDate(entry.createdAt)} at{" "}
                            {formatTime(entry.createdAt)}
                        </span>
                        {entry.entryType === "feedback" && !readOnly && (
                            <label className="flex items-center gap-1.5 ml-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={feedbackGiven}
                                    onChange={(e) =>
                                        handleFeedbackGivenChange(
                                            e.target.checked
                                        )
                                    }
                                    disabled={updatingFeedbackGiven}
                                    className="w-4 h-4 rounded border-[#D1D5DB] text-[#16A34A] focus:ring-[#BBF7D0] focus:ring-2 cursor-pointer disabled:opacity-50"
                                />
                                <span className="text-xs text-[#6B7280] flex items-center gap-1">
                                    Given
                                    {updatingFeedbackGiven && (
                                        <Loader2 className="w-3 h-3 animate-spin text-[#9CA3AF]" />
                                    )}
                                </span>
                            </label>
                        )}
                    </div>
                    {!readOnly && (
                        <div className="flex gap-0.5">
                            <button
                                onClick={onEdit}
                                className="p-2 text-[#9CA3AF] hover:text-[#4B5563] hover:bg-[#F3F4F6] rounded transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                                aria-label="Edit entry"
                            >
                                <SquarePen className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="p-2 text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                                aria-label="Delete entry"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
                {renderContent()}
                {linkedGoals.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#F3F4F6]">
                        <div className="flex flex-wrap gap-1.5">
                            {linkedGoals.map((goal) => (
                                <span
                                    key={goal.id}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]"
                                    title={goal.description || undefined}
                                >
                                    {goal.title}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Entry"
                role="alertdialog"
            >
                <div className="space-y-4">
                    <p className="text-sm text-[#4B5563]">
                        Are you sure you want to delete this entry? This action
                        cannot be undone.
                    </p>
                    <div className="p-3 bg-[#F9FAFB] rounded-md border border-[#F3F4F6]">
                        <EntryBadge
                            entryType={entry.entryType}
                            feedbackType={entry.feedbackType}
                        />
                        <p className="mt-2 text-sm text-[#4B5563] line-clamp-2">
                            {entry.notes || entry.situation || ""}
                        </p>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t border-[#F3F4F6]">
                        <Button
                            variant="secondary"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            loading={deleting}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
