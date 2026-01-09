import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind CSS class merging.
 *
 * This utility merges Tailwind classes intelligently, ensuring that
 * conflicting classes are resolved correctly (last one wins).
 *
 * @example
 * ```tsx
 * cn("px-2 py-1", "px-4") // => "py-1 px-4"
 * cn("text-red-500", condition && "text-blue-500") // conditional classes
 * ```
 *
 * @param inputs - Class names to combine
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
