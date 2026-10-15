import { Router } from 'express';
import { requireGuest } from './requireGuest.js';
import { isUuid, validatePlant } from './validation.js';

const COLUMNS = 'id, owner_id, plant_name, water_every_days, created_at';

const router = Router();

router.use(requireGuest);

router.get('/', async (req, res) => {
  const { data, error } = await req.db
    .from('items')
    .select(COLUMNS)
    .eq('owner_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  res.status(200).json(data);
});

router.post('/', async (req, res) => {
  const { values, error: validationError } = validatePlant(req.body);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // Build the row explicitly; never spread req.body into the database.
  const row = {
    plant_name: values.plant_name,
    water_every_days: values.water_every_days,
    owner_id: req.user.id,
  };

  const { data, error } = await req.db.from('items').insert(row).select(COLUMNS).single();

  if (error) throw error;

  res.status(201).json(data);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  // A malformed id can't match any row, so treat it the same as a missing one.
  if (!isUuid(id)) {
    return res.status(404).json({ error: 'Plant not found' });
  }

  const { data, error } = await req.db
    .from('items')
    .delete()
    .eq('id', id)
    .eq('owner_id', req.user.id)
    .select('id');

  if (error) throw error;

  if (data.length === 0) {
    return res.status(404).json({ error: 'Plant not found' });
  }

  res.status(204).end();
});

export default router;
