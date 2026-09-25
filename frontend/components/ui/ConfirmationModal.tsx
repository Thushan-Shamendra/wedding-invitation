"use client";

import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  danger?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
  danger = true,
}: ConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Warning Icon */}
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
            danger
              ? "bg-rose-50 border-rose-200 text-rose-600"
              : "bg-amber-50 border-amber-200 text-amber-600"
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>

        {/* Title & Message */}
        <div>
          <h4 className="text-lg font-serif font-semibold text-[#26231F]">
            {title}
          </h4>
          <p className="text-xs sm:text-sm text-[#746E66] mt-2 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 w-full pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            isLoading={isLoading}
            loadingText="Deleting..."
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
