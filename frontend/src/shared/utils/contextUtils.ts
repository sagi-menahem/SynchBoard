import { createContext, useContext } from 'react';

/**
 * Generic utility to create typed React context with error handling
 */
export function createTypedContext<T>(name: string) {
  const Context = createContext<T | undefined>(undefined);
  
  const useTypedContext = (): T => {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error(`use${name} must be used within a ${name}Provider`);
    }
    return context;
  };
  
  return [Context, useTypedContext] as const;
}

/**
 * Create context with default value (no undefined check needed)
 */
export function createContextWithDefault<T>(_name: string, defaultValue: T) {
  const Context = createContext<T>(defaultValue);
  
  const useTypedContext = (): T => {
    return useContext(Context);
  };
  
  return [Context, useTypedContext] as const;
}