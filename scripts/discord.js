(function(){
  'use strict';

  async function sendDiscordNotification(action,payload={}){
    if(!window.GrimoireSupabase)return;
    try{
      const { error } = await window.GrimoireSupabase.functions.invoke('discord-notify',{
        body:{action,payload},
      });
      if(error)throw error;
    }catch(error){
      console.warn('[Discord] Notification non envoyée.', error);
    }
  }

  window.sendDiscordNotification=sendDiscordNotification;
})();
