"use client";

import { useState } from "react";
import type { DevelopmentGoal } from "@/db/schema";
import { Button } from "./Button";
import { Drawer } from "./Drawer";
import { Modal } from "./Modal";
import { MarkdownContent } from "./MarkdownContent";
import { MarkdownEditor } from "./MarkdownEditor";
import { useToast } from "./Toast";
import { SquarePen, Trash2, Plus } from "lucide-react";

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
                <p className="text-sm text-[#6B7280] italic">
                    {readOnly
                        ? "No development goals set."
                        : "No development goals set. Add one to get started."}
                </p>
            ) : (
                <div className="space-y-3">
                    {goals.map((goal) => (
                        <div
                            key={goal.id}
                            className="border-b border-[#F3F4F6] pb-0 last:border-0"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium text-sm text-[#111827]">
                                    {goal.title}
                                </h4>
                                {!readOnly && (
                                    <div className="flex gap-0.5 flex-shrink-0">
                                        <button
                                            onClick={() => handleOpenEdit(goal)}
                                            className="p-1.5 text-[#9CA3AF] hover:text-[#4B5563] hover:bg-[#F3F4F6] rounded transition-colors"
                                            aria-label="Edit goal"
                                        >
                                            <SquarePen className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                setDeletingGoal(goal)
                                            }
                                            className="p-1.5 text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded transition-colors"
                                            aria-label="Delete goal"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {goal.description && (
                                <MarkdownContent className="mt-1 text-[#4B5563]">
                                    {goal.description}
                                </MarkdownContent>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!readOnly && (
                <>
                    <div className="border-t border-[#F3F4F6] mt-3 pt-3">
                        <button
                            onClick={handleOpenAdd}
                            className="flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
                        >
                            <Plus className="w-3 h-3" strokeWidth={2.5} />
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
                        <label className="block text-sm font-medium text-[#374151] mb-1.5">
                            Title <span className="text-[#DC2626]">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-[#111827] transition-colors"
                            placeholder="e.g., Improve communication skills"
                            maxLength={200}
                        />
                        <p
                            className={`text-xs mt-1 text-right ${
                                title.length > 200
                                    ? "text-[#DC2626]"
                                    : "text-[#6B7280]"
                            }`}
                        >
                            {title.length} / 200
                        </p>
                    </div>
                    <div className="flex-1 flex flex-col min-h-0">
                        <label className="block text-sm font-medium text-[#374151] mb-1.5 flex-shrink-0">
                            Description
                        </label>
                        <MarkdownEditor
                            value={description}
                            onChange={setDescription}
                            maxLength={2000}
                            placeholder="Add details about this goal..."
                            fillHeight
                            aiContext="development goal description"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-[#F3F4F6] flex-shrink-0">
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
                    <p className="text-sm text-[#4B5563]">
                        Are you sure you want to delete this goal? This action
                        cannot be undone.
                    </p>
                    {deletingGoal && (
                        <div className="p-3 bg-[#F9FAFB] rounded-md border border-[#F3F4F6]">
                            <p className="font-medium text-sm text-[#111827]">
                                {deletingGoal.title}
                            </p>
                            {deletingGoal.description && (
                                <p className="mt-1 text-sm text-[#4B5563] line-clamp-2">
                                    {deletingGoal.description}
                                </p>
                            )}
                        </div>
                    )}
                    <div className="flex justify-end gap-2 pt-4 border-t border-[#F3F4F6]">
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
