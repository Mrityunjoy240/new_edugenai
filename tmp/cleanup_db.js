const { createClient } = require('@supabase/supabase-js');

async function main() {
  const supabaseUrl = 'https://kmqrbaammnsryxihkfqh.supabase.co';
  const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttcXJiYWFtbW5zcnl4aWhrZnFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDYyMDcwOCwiZXhwIjoyMDkwMTk2NzA4fQ.NTWEOJ58gXASIKJ2OoJmEhQSYOaEg5uM77tGZv4AE8Q';

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const courseId = 'd0dc5d6d-14fd-4964-84e7-16c0f81d6cac';

  console.log(`Cleaning up data for courseId: ${courseId}`);

  // Delete from notes
  const { data: notesData, error: notesError } = await supabase
    .from('notes')
    .delete()
    .eq('course_id', courseId);

  if (notesError) {
    console.error('Error deleting notes:', notesError);
  } else {
    console.log('Successfully deleted notes');
  }

  // Delete from sources
  const { data: sourcesData, error: sourcesError } = await supabase
    .from('sources')
    .delete()
    .eq('course_id', courseId);

  if (sourcesError) {
    console.error('Error deleting sources:', sourcesError);
  } else {
    console.log('Successfully deleted sources');
  }
}

main().catch(console.error);
