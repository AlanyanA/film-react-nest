const { Client } = require('pg');
const c = new Client({ connectionString: process.env.DATABASE_URL });
(async () => {
  try {
    await c.connect();
    const res = await c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='schedules' ORDER BY ordinal_position;");
    console.log(JSON.stringify(res.rows, null, 2));
    await c.end();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
