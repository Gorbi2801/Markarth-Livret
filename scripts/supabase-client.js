(function(){
  'use strict';

  const config = window.GrimoireConfig;
  window.GrimoireSupabase = window.supabase.createClient(
    config.supabaseUrl,
    config.supabaseKey
  );
})();
