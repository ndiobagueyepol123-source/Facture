const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://npbjbcmtekhkyfrebced.supabase.co',
  'sb_publishable_34je3kkqBSSKzMz1YXxtXw_ZiEAJvEg'
);

async function testSignup() {
  const dummyEmail = 'test_' + Date.now() + '@example.com';
  console.log('Tentative d\'inscription avec:', dummyEmail);
  
  const { data, error } = await supabase.auth.signUp({
    email: dummyEmail,
    password: 'password123',
  });

  if (error) {
    console.error('Erreur:', error.message);
  } else {
    console.log('Session renvoyée ?', !!data.session);
    console.log('User confirmé ?', data.user?.email_confirmed_at ? 'Oui' : 'Non');
    if (!data.session) {
      console.log('=> ATTENTION: La confirmation par email est toujours ACTIVÉE sur Supabase !');
    } else {
      console.log('=> SUCCÈS: La confirmation par email est bien désactivée !');
    }
  }
}

testSignup();
