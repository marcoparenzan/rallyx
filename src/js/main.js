import { Game } from './Game.js';
document.addEventListener('DOMContentLoaded',async()=>{try{await Game.load();}catch(error){document.getElementById('status').classList.remove('sr-only');document.getElementById('status').textContent=error.message;console.error(error);}});
