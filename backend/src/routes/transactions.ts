import { Router } from 'express';
import pool from '../config/database';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Get all transactions
router.get('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, m.name as member_name
      FROM transactions t
      LEFT JOIN members m ON t.member_id = m.id
      ORDER BY t.date DESC
    `);
    res.json({ transactions: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// Create transaction
router.post('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { member_id, type, amount, description, payment_method, received_by } = req.body;
    
    const result = await pool.query(
      `INSERT INTO transactions (member_id, type, amount, date, description, payment_method, received_by, status)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, $6, 'completed')
       RETURNING *`,
      [member_id, type, amount, description, payment_method, received_by]
    );

    res.status(201).json({ transaction: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

export default router;
