import { Router } from 'express';
import pool from '../config/database';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all members (Admin only)
router.get('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, name, email, phone, address, join_date, 
        account_status, total_contributions, active_loan_id, 
        last_loan_paid_date, created_at, updated_at
      FROM members
      ORDER BY created_at DESC
    `);

    res.json({ members: result.rows });
  } catch (error: any) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to get members' });
  }
});

// Get single member
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Members can only view their own profile unless admin
    if (req.user!.role !== 'admin') {
      const memberCheck = await pool.query(
        'SELECT user_id FROM members WHERE id = $1',
        [id]
      );
      
      if (memberCheck.rows.length === 0 || memberCheck.rows[0].user_id !== req.user!.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const result = await pool.query('SELECT * FROM members WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ member: result.rows[0] });
  } catch (error: any) {
    console.error('Get member error:', error);
    res.status(500).json({ error: 'Failed to get member' });
  }
});

// Create member (Admin only)
router.post('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, email, phone, address, join_date } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const result = await pool.query(
      `INSERT INTO members (name, email, phone, address, join_date, account_status)
       VALUES ($1, $2, $3, $4, $5, 'Active')
       RETURNING *`,
      [name, email, phone, address, join_date || new Date()]
    );

    res.status(201).json({ 
      message: 'Member created successfully',
      member: result.rows[0] 
    });
  } catch (error: any) {
    console.error('Create member error:', error);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// Update member (Admin or own profile)
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, account_status } = req.body;

    // Check permissions
    if (req.user!.role !== 'admin') {
      const memberCheck = await pool.query(
        'SELECT user_id FROM members WHERE id = $1',
        [id]
      );
      
      if (memberCheck.rows.length === 0 || memberCheck.rows[0].user_id !== req.user!.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const result = await pool.query(
      `UPDATE members 
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           address = COALESCE($4, address),
           account_status = COALESCE($5, account_status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [name, email, phone, address, account_status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ 
      message: 'Member updated successfully',
      member: result.rows[0] 
    });
  } catch (error: any) {
    console.error('Update member error:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// Delete member (Admin only)
router.delete('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM members WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ message: 'Member deleted successfully' });
  } catch (error: any) {
    console.error('Delete member error:', error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

export default router;
