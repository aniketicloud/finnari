import { useState } from "react"

/**
 * State interface for async operations
 */
interface AsyncState {
  /** Indicates if an async operation is in progress */
  isLoading: boolean
  /** Error message from failed operations, null if no error */
  error: string | null
}

/**
 * Return type of the useAsync hook
 */
interface UseAsyncReturn extends AsyncState {
  /** Manually set the loading state */
  setLoading: (loading: boolean) => void
  /** Manually set an error message */
  setError: (error: string | null) => void
  /** Reset both loading and error states to initial values */
  resetState: () => void
  /** Execute an async function with automatic loading and error handling */
  execute: <T>(asyncFn: () => Promise<T>) => Promise<T | undefined>
}

/**
 * Custom hook for managing async operations with loading and error states.
 * 
 * @example
 * ```tsx
 * const { isLoading, error, execute } = useAsync()
 * 
 * const handleSubmit = async (data) => {
 *   const result = await execute(async () => {
 *     return await api.submitData(data)
 *   })
 *   
 *   if (result) {
 *     // Success - result contains the return value
 *   } else {
 *     // Error - check the error state
 *   }
 * }
 * ```
 * 
 * @returns {UseAsyncReturn} Object containing loading state, error state, and control functions
 */
export function useAsync(): UseAsyncReturn {
  const [state, setState] = useState<AsyncState>({
    isLoading: false,
    error: null,
  })

  /**
   * Manually set the loading state
   * @param loading - Whether the operation is loading
   */
  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }))
  }

  /**
   * Manually set an error message
   * @param error - The error message or null to clear
   */
  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }))
  }

  /**
   * Reset both loading and error states to their initial values
   */
  const resetState = () => {
    setState({ isLoading: false, error: null })
  }

  /**
   * Execute an async function with automatic loading and error state management.
   * Sets loading to true before execution, handles errors, and returns the result.
   * 
   * @template T - The return type of the async function
   * @param asyncFn - The async function to execute
   * @returns The result of the async function on success, undefined on error
   */
  const execute = async <T,>(asyncFn: () => Promise<T>): Promise<T | undefined> => {
    // Set loading and clear any previous errors
    setState({ isLoading: true, error: null })
    
    try {
      const result = await asyncFn()
      // Success - clear loading state
      setState({ isLoading: false, error: null })
      return result
    } catch (err) {
      // Error - extract message and update state
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setState({ isLoading: false, error: errorMessage })
      return undefined
    }
  }

  return {
    isLoading: state.isLoading,
    error: state.error,
    setLoading,
    setError,
    resetState,
    execute,
  }
}
