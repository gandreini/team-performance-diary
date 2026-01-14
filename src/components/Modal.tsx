'use client';

import { ReactNode, useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  role?: 'dialog' | 'alertdialog';
}

export function Modal({ isOpen, onClose, title, children, role = 'dialog' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto"
      aria-labelledby="modal-title"
      role={role}
      aria-modal="true"
    >
      <div className="flex min-h-screen items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          ref={modalRef}
          className="relative w-full sm:max-w-md transform rounded-t-lg sm:rounded-lg bg-white shadow-lg border border-[#E4E4E7] transition-all max-h-[90vh] sm:max-h-[85vh] flex flex-col"
          tabIndex={-1}
        >
          <div className="px-5 py-4 border-b border-[#F4F4F5] flex-shrink-0">
            <h2 id="modal-title" className="text-base font-semibold text-[#18181B] tracking-tight">
              {title}
            </h2>
          </div>
          <div className="px-5 py-4 overflow-y-auto flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
