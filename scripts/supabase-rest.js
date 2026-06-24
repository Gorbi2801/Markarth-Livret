(function(){
  'use strict';

  const config = window.GrimoireConfig;
  async function buildHeaders(extraHeaders = {}){
    const { data } = window.GrimoireSupabase
      ? await window.GrimoireSupabase.auth.getSession()
      : { data: { session: null } };
    const token = data.session?.access_token || config.supabaseKey;
    return {
      'Content-Type': 'application/json',
      apikey: config.supabaseKey,
      Authorization: 'Bearer ' + token,
      Prefer: 'return=representation',
      ...extraHeaders,
    };
  }

  async function request(path, options = {}){
    const response = await fetch(`${config.supabaseUrl}/rest/v1/${path}`, {
      ...options,
      headers: await buildHeaders(options.headers || {}),
    });

    if(!response.ok) throw new Error(await response.text());
    return response.json();
  }

  window.GrimoireSupabaseRest = Object.freeze({
    sbGet(table, params = ''){
      return request(`${table}${params}`);
    },
    sbPost(table, body){
      return request(table, {method: 'POST', body: JSON.stringify(body)});
    },
    sbPatch(table, params, body){
      return request(`${table}${params}`, {method: 'PATCH', body: JSON.stringify(body)});
    },
    sbDelete(table, params){
      return request(`${table}${params}`, {method: 'DELETE'});
    },
  });
})();
