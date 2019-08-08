import pool from '../database/db';

exports.filterTrip = async (req, res) => {
  if (!req.body.origin && !req.body.destination) {
    return res.status(400).json({
      status: 'error',
      error: 'Enter a search field',
    });
  }
  const query = 'SELECT trip_id, origin, destination, fare, trip_date from trips where origin Ilike $1 AND status=$2 OR destination ILIKE $3 AND status =$2';
  const data = [`%${req.body.origin}%`, true, `%${req.body.destination}%`];
  try {
    const { rows } = await pool.query(query, data);
    if (rows < 1) {
      return res.status(404).json({
        status: 'error',
        error: 'There are no search result for your query',
      });
    }
    return res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    return res.status(400).json({ status: 'error', error });
  }
};
