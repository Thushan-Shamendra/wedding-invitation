"use client";

import React, { forwardRef } from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const textareaId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-medium tracking-wide uppercase text-[#746E66]"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[#26231F] placeholder:text-[#746E66]/60 transition-all duration-200 outline-none resize-y min-h-[100px]
            ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                : "border-[#E8E3DA] hover:border-[#D8B4A0] focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20"
            }
            disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1 font-medium">
            <svg
              className="w-3.5 h-3.5 inline-block shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-[#746E66]">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
