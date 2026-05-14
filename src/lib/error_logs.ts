import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export type ErrorType = 'transaction_failure' | 'auth_error' | 'validation_error' | 'system_error';

interface LogData {
  type: ErrorType;
  message: string;
  code?: string;
  context?: string; // e.g. "FuelPayment.tsx"
  userId?: string;
  metadata?: any;
}

/**
 * Logs an error to the 'error_logs' collection in Firestore for auditing.
 */
export async function logError({ type, message, code, context, userId, metadata }: LogData) {
  try {
    await addDoc(collection(db, "error_logs"), {
      type,
      message,
      code,
      context,
      userId,
      metadata,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    console.error(`[${type}] ${message}`, { context, code, metadata });
  } catch (err) {
    // Fallback if Firestore logging itself fails
    console.error("CRITICAL: Failed to log error to Firestore:", err);
    console.error(`Original Error: [${type}] ${message}`, { context, code, metadata });
  }
}
