'use client';

import { useState, useEffect } from 'react';
import type { DevelopmentGoal } from '@/db/schema';

interface GoalLinkSelectorProps {
  reportId: string;
  selectedGoalIds: string[];
  onChange: (goalIds: string[]) => void;
}

export function GoalLinkSelector({ reportId, selectedGoalIds, onChange }: GoalLinkSelectorProps) {
  const [goals, setGoals] = useState<DevelopmentGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGoals() {
      try {
        const response = await fetch(`/api/reports/${reportId}/goals`);
        if (response.ok) {
          const data = await response.json();
          setGoals(data.goals || []);
        }
      } catch (error) {
        console.error('Error fetching goals:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchGoals();
  }, [reportId]);

  const handleToggle = (goalId: string) => {
    if (selectedGoalIds.includes(goalId)) {
      onChange(selectedGoalIds.filter(id => id !== goalId));
    } else {
      onChange([...selectedGoalIds, goalId]);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-[#6B7280]">Loading goals...</div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="text-sm text-[#6B7280] italic">
        No development goals available. Add goals from the report page.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {goals.map((goal) => (
        <label
          key={goal.id}
          className="flex items-start gap-2 cursor-pointer group"
        >
          <input
            type="checkbox"
            checked={selectedGoalIds.includes(goal.id)}
            onChange={() => handleToggle(goal.id)}
            className="mt-0.5 w-4 h-4 rounded border-[#D1D5DB] text-[#3B82F6] focus:ring-[#BFDBFE] focus:ring-2 cursor-pointer"
          />
          <span className="text-sm text-[#374151] group-hover:text-[#111827] transition-colors">
            {goal.title}
          </span>
        </label>
      ))}
    </div>
  );
}
