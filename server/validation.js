// Keep these in sync with client/src/validation.js and the table's CHECK constraints.
export const PLANT_NAME_MAX = 100;
export const WATER_DAYS_MIN = 1;
export const WATER_DAYS_MAX = 60;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Returns { values } on success or { error } with a message for the client.
export function validatePlant(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object' };
  }

  const { plant_name, water_every_days } = body;

  if (typeof plant_name !== 'string') {
    return { error: 'plant_name is required and must be a string' };
  }

  const name = plant_name.trim();

  if (!name) {
    return { error: 'plant_name must not be blank' };
  }
  if (name.length > PLANT_NAME_MAX) {
    return { error: `plant_name must be at most ${PLANT_NAME_MAX} characters` };
  }

  if (!Number.isInteger(water_every_days)) {
    return { error: 'water_every_days is required and must be a whole number' };
  }
  if (water_every_days < WATER_DAYS_MIN || water_every_days > WATER_DAYS_MAX) {
    return {
      error: `water_every_days must be between ${WATER_DAYS_MIN} and ${WATER_DAYS_MAX}`,
    };
  }

  return { values: { plant_name: name, water_every_days } };
}

export function isUuid(value) {
  return UUID_PATTERN.test(value);
}
