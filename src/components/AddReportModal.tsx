'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useToast } from './Toast';

interface AddReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddReportModal({ isOpen, onClose, onSuccess }: AddReportModalProps) {
  const { showToast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [developmentGoals, setDevelopmentGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFirstName('');
      setLastName('');
      setDevelopmentGoals('');
      setErrors({});
      setHasChanges(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setHasChanges(firstName.trim() !== '' || lastName.trim() !== '' || developmentGoals.trim() !== '');
  }, [firstName, lastName, developmentGoals]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedFirst) {
      newErrors.firstName = 'First name is required';
    } else if (trimmedFirst.length > 50) {
      newErrors.firstName = 'First name must be between 1 and 50 characters';
    }

    if (!trimmedLast) {
      newErrors.lastName = 'Last name is required';
    } else if (trimmedLast.length > 50) {
      newErrors.lastName = 'Last name must be between 1 and 50 characters';
    }

    if (developmentGoals.length > 5000) {
      newErrors.developmentGoals = 'Development goals must be at most 5000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to discard them?');
      if (!confirmed) return;
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          development_goals: developmentGoals || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create report');
      }

      showToast('Report added successfully', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isValid = firstName.trim().length >= 1 && firstName.trim().length <= 50 &&
    lastName.trim().length >= 1 && lastName.trim().length <= 50 &&
    developmentGoals.length <= 5000;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Report">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-[#3F3F46] mb-1.5">
            First name
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DDD6FE] transition-colors placeholder:text-[#A1A1AA] ${
              errors.firstName ? 'border-[#DC2626] focus:border-[#DC2626]' : 'border-[#E4E4E7] focus:border-[#8B5CF6]'
            }`}
            placeholder="Enter first name"
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-[#DC2626]">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-[#3F3F46] mb-1.5">
            Last name
          </label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DDD6FE] transition-colors placeholder:text-[#A1A1AA] ${
              errors.lastName ? 'border-[#DC2626] focus:border-[#DC2626]' : 'border-[#E4E4E7] focus:border-[#8B5CF6]'
            }`}
            placeholder="Enter last name"
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-[#DC2626]">{errors.lastName}</p>
          )}
        </div>

        <div>
          <label htmlFor="developmentGoals" className="block text-sm font-medium text-[#3F3F46] mb-1.5">
            Development goals (optional)
          </label>
          <textarea
            id="developmentGoals"
            value={developmentGoals}
            onChange={(e) => setDevelopmentGoals(e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DDD6FE] transition-colors placeholder:text-[#A1A1AA] resize-none ${
              errors.developmentGoals ? 'border-[#DC2626] focus:border-[#DC2626]' : 'border-[#E4E4E7] focus:border-[#8B5CF6]'
            }`}
            placeholder="Enter development goals (markdown supported)"
          />
          <div className="flex justify-between mt-1">
            {errors.developmentGoals && (
              <p className="text-xs text-[#DC2626]">{errors.developmentGoals}</p>
            )}
            <p className={`text-xs ml-auto ${developmentGoals.length > 5000 ? 'text-[#DC2626]' : 'text-[#71717A]'}`}>
              {developmentGoals.length} / 5000
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#F4F4F5]">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!isValid}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
