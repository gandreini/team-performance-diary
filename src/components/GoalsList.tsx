"use client";

import { useState } from "react";
import type { DevelopmentGoal } from "@/db/schema";
import { Button } from "./Button";
import { Drawer } from "./Drawer";
import { Modal } from "./Modal";
import { MarkdownContent } from "./MarkdownContent";
import { MarkdownEditor } from "./MarkdownEditor";
import { useToast } from "./Toast";

interface GoalsListProps {
    reportId: string;
    goals: DevelopmentGoal[];
    onUpdate: () => void;
    readOnly?: boolean;
}

export function GoalsList({
    reportId,
    goals,
    onUpdate,
    readOnly = false,
}: GoalsListProps) {
    const { showToast } = useToast();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<DevelopmentGoal | null>(
        null
    );
    const [deletingGoal, setDeletingGoal] = useState<DevelopmentGoal | null>(
        null
    );
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const resetForm = () => {
        setTitle("");
        setDescription("");
    };

    const handleOpenAdd = () => {
        resetForm();
        setIsAddModalOpen(true);
    };

    const handleOpenEdit = (goal: DevelopmentGoal) => {
        setTitle(goal.title);
        setDescription(goal.description || "");
        setEditingGoal(goal);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingGoal(null);
        resetForm();
    };

    const handleSave = async () => {
        if (!title.trim()) {
            showToast("Title is required", "error");
            return;
        }

        setSaving(true);
        try {
            if (editingGoal) {
                // Update existing goal
                const response = await fetch(`/api/goals/${editingGoal.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: title.trim(),
                        description: description.trim() || null,
                    }),
                });
                if (!response.ok) throw new Error("Failed to update goal");
                showToast("Goal updated", "success");
            } else {
                // Create new goal
                const response = await fetch(`/api/reports/${reportId}/goals`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: title.trim(),
                        description: description.trim() || null,
                    }),
                });
                if (!response.ok) throw new Error("Failed to create goal");
                showToast("Goal added", "success");
            }
            handleCloseModal();
            onUpdate();
        } catch (error) {
            showToast(
                editingGoal ? "Failed to update goal" : "Failed to create goal",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingGoal) return;

        setDeleting(true);
        try {
            const response = await fetch(`/api/goals/${deletingGoal.id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete goal");
            showToast("Goal deleted", "success");
            setDeletingGoal(null);
            onUpdate();
        } catch (error) {
            showToast("Failed to delete goal", "error");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            {goals.length === 0 ? (
                <p className="text-sm text-[#71717A] italic">
                    {readOnly
                        ? "No development goals set."
                        : "No development goals set. Add one to get started."}
                </p>
            ) : (
                <div className="space-y-3">
                    {goals.map((goal) => (
                        <div
                            key={goal.id}
                            className="border-b border-[#F4F4F5] pb-0 last:border-0"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium text-sm text-[#18181B]">
                                    {goal.title}
                                </h4>
                                {!readOnly && (
                                    <div className="flex gap-0.5 flex-shrink-0">
                                        <button
                                            onClick={() => handleOpenEdit(goal)}
                                            className="p-1.5 text-[#A1A1AA] hover:text-[#52525B] hover:bg-[#F4F4F5] rounded transition-colors"
                                            aria-label="Edit goal"
                                        >
                                            <svg
                                                className="w-3.5 h-3.5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() =>
                                                setDeletingGoal(goal)
                                            }
                                            className="p-1.5 text-[#A1A1AA] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded transition-colors"
                                            aria-label="Delete goal"
                                        >
                                            <svg
                                                className="w-3.5 h-3.5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                            {goal.description && (
                                <MarkdownContent className="mt-1 text-[#52525B]">
                                    {goal.description}
                                </MarkdownContent>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!readOnly && (
                <>
                    <div className="border-t border-[#F4F4F5] mt-3 pt-3">
                        <button
                            onClick={handleOpenAdd}
                            className="flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
                        >
                            <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            Add Goal
                        </button>
                    </div>
                </>
            )}

            {/* Add/Edit Drawer */}
            <Drawer
                isOpen={isAddModalOpen || editingGoal !== null}
                onClose={handleCloseModal}
                title={editingGoal ? "Edit Goal" : "Add Goal"}
                width="md"
            >
                <div className="flex flex-col h-full">
                    <div className="flex-shrink-0 mb-5">
                        <label className="block text-sm font-medium text-[#3F3F46] mb-1.5">
                            Title <span className="text-[#DC2626]">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-[#E4E4E7] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#18181B] focus:border-[#18181B] transition-colors"
                            placeholder="e.g., Improve communication skills"
                            maxLength={200}
                        />
                        <p
                            className={`text-xs mt-1 text-right ${
                                title.length > 200
                                    ? "text-[#DC2626]"
                                    : "text-[#71717A]"
                            }`}
                        >
                            {title.length} / 200
                        </p>
                    </div>
                    <div className="flex-1 flex flex-col min-h-0">
                        <label className="block text-sm font-medium text-[#3F3F46] mb-1.5 flex-shrink-0">
                            Description
                        </label>
                        <MarkdownEditor
                            value={description}
                            onChange={setDescription}
                            maxLength={2000}
                            placeholder="Add details about this goal..."
                            fillHeight
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-[#F4F4F5] flex-shrink-0">
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            loading={saving}
                            disabled={!title.trim()}
                        >
                            {editingGoal ? "Save Changes" : "Add Goal"}
                        </Button>
                    </div>
                </div>
            </Drawer>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deletingGoal !== null}
                onClose={() => setDeletingGoal(null)}
                title="Delete Goal"
                role="alertdialog"
            >
                <div className="space-y-4">
                    <p className="text-sm text-[#52525B]">
                        Are you sure you want to delete this goal? This action
                        cannot be undone.
                    </p>
                    {deletingGoal && (
                        <div className="p-3 bg-[#FAFAFA] rounded-md border border-[#F4F4F5]">
                            <p className="font-medium text-sm text-[#18181B]">
                                {deletingGoal.title}
                            </p>
                            {deletingGoal.description && (
                                <p className="mt-1 text-sm text-[#52525B] line-clamp-2">
                                    {deletingGoal.description}
                                </p>
                            )}
                        </div>
                    )}
                    <div className="flex justify-end gap-2 pt-4 border-t border-[#F4F4F5]">
                        <Button
                            variant="secondary"
                            onClick={() => setDeletingGoal(null)}
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
        </div>
    );
}
