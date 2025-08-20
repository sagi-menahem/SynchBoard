import logger from 'utils/logger';

interface PendingTransaction<TPayload = unknown> {
  payload: TPayload;
  timestamp: number;
  status: 'sending' | 'processing' | 'failed' | 'confirmed';
  timeoutId?: number;
  onSuccess?: (payload: TPayload, transactionId: string) => void;
  onFailure?: (error: Error, payload: TPayload, transactionId: string) => void;
}

/**
 * Centralized Transaction Service
 * 
 * Solves the multiple hook instances problem by providing a single source of truth
 * for all WebSocket transactions (chat messages, board actions, etc.)
 */
class TransactionService {
  private static instance: TransactionService;
  private transactions = new Map<string, PendingTransaction>();

  private constructor() {
    logger.debug('[TRANSACTION] 🏭 Centralized TransactionService initialized');
  }

  static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  /**
   * Create a new transaction with timeout
   */
  createTransaction<TPayload>(
    transactionId: string,
    payload: TPayload,
    timeoutMs = 10000,
    onSuccess?: (payload: TPayload, transactionId: string) => void,
    onFailure?: (error: Error, payload: TPayload, transactionId: string) => void,
  ): void {
    logger.debug(`[TRANSACTION] 🏭 CENTRALIZED creating transaction: ${transactionId}`);
    
    // Set up timeout
    const timeoutId = setTimeout(() => {
      logger.debug(`[TRANSACTION] 🏭 ⏰ Centralized timeout triggered for: ${transactionId}`);
      this.handleTimeout(transactionId);
    }, timeoutMs);

    // Store transaction
    this.transactions.set(transactionId, {
      payload,
      timestamp: Date.now(),
      status: 'sending',
      timeoutId,
      onSuccess,
      onFailure,
    });

    logger.debug(`[TRANSACTION] 🏭 Transaction created with timeoutId: ${timeoutId}. Total transactions: ${this.transactions.size}`);
  }

  /**
   * Update transaction status
   */
  updateTransactionStatus(transactionId: string, status: 'sending' | 'processing' | 'failed' | 'confirmed'): void {
    const transaction = this.transactions.get(transactionId);
    if (transaction) {
      this.transactions.set(transactionId, { ...transaction, status });
      logger.debug(`[TRANSACTION] 🏭 Updated ${transactionId} status to: ${status}`);
    }
  }

  /**
   * Commit a transaction (mark as successful)
   */
  commitTransaction(transactionId: string): boolean {
    logger.debug(`[TRANSACTION] 🏭 CENTRALIZED committing transaction: ${transactionId}`);
    
    const transaction = this.transactions.get(transactionId);
    if (transaction) {
      logger.debug(`[TRANSACTION] 🏭 Found transaction with status: ${transaction.status} and timeoutId: ${transaction.timeoutId}`);
      
      // CRITICAL: Cancel timeout immediately
      if (transaction.timeoutId) {
        logger.debug(`[TRANSACTION] 🏭 ✅ CANCELLING centralized timeout ${transaction.timeoutId} for: ${transactionId}`);
        clearTimeout(transaction.timeoutId);
      }
      
      // Call success callback
      if (transaction.status !== 'confirmed' && transaction.onSuccess) {
        logger.debug(`[TRANSACTION] 🏭 Calling onSuccess for: ${transactionId}`);
        transaction.onSuccess(transaction.payload, transactionId);
      }
      
      // Remove transaction
      this.transactions.delete(transactionId);
      logger.debug(`[TRANSACTION] 🏭 ✅ Successfully committed and removed: ${transactionId}. Remaining: ${this.transactions.size}`);
      return true;
    } else {
      logger.debug(`[TRANSACTION] 🏭 Transaction ${transactionId} not found - may have been committed already`);
      return false;
    }
  }

  /**
   * Handle transaction timeout
   */
  private handleTimeout(transactionId: string): void {
    const transaction = this.transactions.get(transactionId);
    if (transaction && transaction.status === 'processing') {
      logger.warn(`[TRANSACTION] 🏭 ❌ CENTRALIZED timeout - genuine failure for: ${transactionId}`);
      
      // Mark as failed
      this.transactions.set(transactionId, { 
        ...transaction, 
        status: 'failed',
        timeoutId: undefined,
      });
      
      // Call failure callback
      if (transaction.onFailure) {
        const timeoutError = new Error('Transaction timed out after 10 seconds');
        transaction.onFailure(timeoutError, transaction.payload, transactionId);
      }
    } else if (!transaction) {
      logger.debug(`[TRANSACTION] 🏭 ✅ Timeout fired but transaction ${transactionId} was already committed - no error needed`);
    } else {
      logger.debug(`[TRANSACTION] 🏭 Timeout fired but transaction ${transactionId} has status ${transaction.status} - no error needed`);
    }
  }

  /**
   * Check if transaction exists and is pending
   */
  isPending(transactionId: string): boolean {
    return this.transactions.has(transactionId);
  }

  /**
   * Get transaction status
   */
  getTransactionStatus(transactionId: string): 'sending' | 'processing' | 'failed' | 'confirmed' | null {
    const transaction = this.transactions.get(transactionId);
    return transaction ? transaction.status : null;
  }

  /**
   * Get number of pending transactions
   */
  getPendingCount(): number {
    return this.transactions.size;
  }

  /**
   * Get all pending transaction IDs
   */
  getPendingTransactionIds(): string[] {
    return Array.from(this.transactions.keys());
  }

  /**
   * Clear all transactions (for connection failures)
   */
  clearAllTransactions(): void {
    logger.debug(`[TRANSACTION] 🏭 Clearing all ${this.transactions.size} transactions`);
    
    // Clear all timeouts
    for (const transaction of this.transactions.values()) {
      if (transaction.timeoutId) {
        clearTimeout(transaction.timeoutId);
      }
    }
    
    this.transactions.clear();
  }
}

// Export singleton instance
export const transactionService = TransactionService.getInstance();
export default transactionService;