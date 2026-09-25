"use client";

import React, { forwardRef } from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs font-medium rounded-md gap-1.5",
      md: "px-4 py-2.5 text-sm font-medium rounded-lg gap-2",
      lg: "px-6 py-3 text-base font-medium rounded-lg gap-2.5",
    };

    const variantClasses = {
      primary:
        "bg-[#C9A96E] hover:bg-[#B89658] active:bg-[#A68345] text-white shadow-sm hover:shadow transition-all duration-200 focus:ring-2 focus:ring-[#C9A96E]/40 border border-transparent",
      secondary:
        "bg-[#F8F6F1] hover:bg-[#EFEAE1] active:bg-[#E5DECة] text-[#26231F] border border-[#E8E3DA] transition-all duration-200 focus:ring-2 focus:ring-[#C9A96E]/30",
      outline:
        "bg-transparent hover:bg-[#C9A96E]/10 active:bg-[#C9A96E]/20 text-[#8C703E] border border-[#C9A96E] transition-all duration-200 focus:ring-2 focus:ring-[#C9A96E]/30",
      ghost:
        "bg-transparent hover:bg-black/5 active:bg-black/10 text-[#746E66] hover:text-[#26231F] transition-all duration-200",
      danger:
        "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm transition-all duration-200 focus:ring-2 focus:ring-red-400/40",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center cursor-pointer select-none font-sans outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
          sizeClasses[size]
        } ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{loadingText || "Saving..."}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
