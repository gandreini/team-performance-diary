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
      <div className="text-sm text-[#71717A]">Loading goals...</div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="text-sm text-[#71717A] italic">
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
            className="mt-0.5 w-4 h-4 rounded border-[#D4D4D8] text-[#7C3AED] focus:ring-[#DDD6FE] focus:ring-2 cursor-pointer"
          />
          <span className="text-sm text-[#3F3F46] group-hover:text-[#18181B] transition-colors">
            {goal.title}
          </span>
        </label>
      ))}
    </div>
  );
}
