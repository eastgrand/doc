// Temporary compatibility shim for missing/react-mismatched @types in triage
// Purpose: provide minimal declarations for named React exports used across the codebase.
// This is intentionally permissive and reversible. Remove when proper @types/react is installed or upgraded.

declare module 'react' {
  // Basic node type for JSX children
  export type ReactNode = any;

  // Minimal hooks we use in the codebase
  export function createContext<T = any>(defaultValue?: T): any;
  export function useContext<T = any>(context: any): T;
  export function useEffect(effect: (...args: any[]) => any, deps?: any[]): void;
  export function useState<T = any>(initial?: T | (() => T)): [T, (v: T | ((prev: T) => T)) => void];
  export function useRef<T = any>(initial?: T): { current: T };
  export function useMemo<T>(fn: () => T, deps?: any[]): T;
  export function useCallback<T extends (...args: any[]) => any>(fn: T, deps?: any[]): T;

  // Next.js / React 18 helpers sometimes used
  export const cache: any;

  // Default export (React namespace)
  const React: any;
  export default React;
}

// Allow JSX style tags like <style jsx>{...}</style>
declare namespace JSX {
  interface IntrinsicElements {
    // allow any element for triage
    [elemName: string]: any;
  }
}
