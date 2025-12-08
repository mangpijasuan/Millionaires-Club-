import { Router } from 'express';
import pool from '../config/database';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Get all loans
router.get('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(`
      SELECT l.*, 
        b.name as borrower_name,
        c.name as cosigner_name
      FROM loans l
      LEFT JOIN members b ON l.borrower_id = b.id
      LEFT JOIN members c ON l.cosigner_id = c.id
      ORDER BY l.created_at DESC
    `);
    res.json({ loans: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get loans' });
  }
});

// Create loan
router.post('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { borrower_id, cosigner_id, original_amount, term_months, start_date } = req.body;
    
    const result = await pool.query(
      `INSERT INTO loans (borrower_id, cosigner_id, original_amount, remaining_balance, term_months, status, start_date, next_payment_due)
       VALUES ($1, $2, $3, $3, $4, 'ACTIVE', $5, $5 + INTERVAL '1 month')
       RETURNING *`,
      [borrower_id, cosigner_id, original_amount, term_months, start_date || new Date()]
    );

    res.status(201).json({ loan: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create loan' });
  }
});

// Record loan payment
router.post('/:id/repay', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { amount, payment_method, received_by } = req.body;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get loan
      const loanResult = await client.query('SELECT * FROM loans WHERE id = $1', [id]);
      if (loanResult.rows.length === 0) {
        throw new Error('Loan not found');
      }

      const loan = loanResult.rows[0];
      const newBalance = loan.remaining_balance - amount;

      // Update loan
      await client.query(
        `UPDATE loans 
         SET remaining_balance = $1, 
             status = CASE WHEN $1 <= 0 THEN 'PAID' ELSE status END,
             next_payment_due = CASE WHEN $1 > 0 THEN next_payment_due + INTERVAL '1 month' ELSE next_payment_due END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [newBalance, id]
      );

      // Create transaction
      await client.query(
        `INSERT INTO transactions (member_id, loan_id, type, amount, date, description, payment_method, received_by, status)
         VALUES ($1, $2, 'LOAN_REPAYMENT', $3, CURRENT_TIMESTAMP, 'Loan Repayment', $4, $5, 'completed')`,
        [loan.borrower_id, id, amount, payment_method, received_by]
      );

      await client.query('COMMIT');
      
      res.json({ message: 'Payment recorded successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

export default router;
