const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://npbjbcmtekhkyfrebced.supabase.co',
  'sb_publishable_34je3kkqBSSKzMz1YXxtXw_ZiEAJvEg'
);

async function test() {
  console.log('Testing connection and insert...');
  
  const { data, error } = await supabase
    .from('invoices')
    .insert([{
      number: 'TEST-001',
      issue_date: new Date().toISOString(),
      due_date: new Date().toISOString(),
      status: 'Brouillon'
    }])
    .select();
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success:', data);
  }
}

test();
