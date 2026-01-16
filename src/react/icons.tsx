import { cn } from "./utils.js";

/**
 * Check icon SVG (no dependencies)
 */
export const CheckIcon = () => (
  <svg
    className={"dc-check-icon"}
    viewBox="0 0 256 256"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      d="M229.66,66.34 L96,200 L34.34,138.34 L51,121.66 L96,166.69 L213,50 Z"
      stroke="currentColor"
      strokeWidth="12"
    />
  </svg>
);

/**
 * Warning icon SVG (no dependencies)
 */
export const WarningIcon = () => (
  <svg
    className="dc-status-icon"
    viewBox="0 0 256 256"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z" />
  </svg>
);

/** Spinner component for loading/pending state */
export const SpinnerIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("animate-spin", className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width="12"
    height="12"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);
