const { createClient } = require('@supabase/supabase-js');

async function main() {
  const supabaseUrl = 'https://kmqrbaammnsryxihkfqh.supabase.co';
  const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttcXJiYWFtbW5zcnl4aWhrZnFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDYyMDcwOCwiZXhwIjoyMDkwMTk2NzA4fQ.NTWEOJ58gXASIKJ2OoJmEhQSYOaEg5uM77tGZv4AE8Q';

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { data, error } = await supabase
    .rpc('get_table_schema', { table_name_input: 'user_progress' });
  
  if (error) {
    // If RPC doesn't exist, try alternative
    console.log('RPC failed, trying raw query...');
    const { data: cols, error: colError } = await supabase
      .from('user_progress')
      .select('*')
      .limit(1);
    
    if (cols && cols.length > 0) {
      console.log('Columns found:', Object.keys(cols[0]));
    } else {
       // Fallback to a query that might give us headers
       console.log('No data in table to infer headers.');
    }
  } else {
    console.log('Schema:', data);
  }
}

main();
