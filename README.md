# Rally-X

Ricreazione amatoriale di Rally-X. L'app attuale è in `src/`, senza compilazione, .NET o dipendenze di gioco. I sorgenti storici alla radice sono rimasti intatti.

## Anteprima
Servire `src/` via HTTP con StaticServer.Start. Non usare file://, perché l'app usa moduli ES.

## Grafica ripristinata
- Canvas a risoluzione fissa **1280 × 960**, senza ridimensionamenti CSS o nuova cornice grafica.
- Schermata iniziale `Assets/title.png` originale.
- HUD originale a **192 × 960**, nella posizione **1088, 0**.
- Sprite originali di auto, bandiere, rocce e fumo a **64 × 64**.
- Esportazione della mappa originale `__other__/Stuff/rallyx-map.png`, **1008 × 1536**, visualizzata a 4×: celle di **96 × 96**, mondo **4032 × 6144**.
- Posizioni iniziali originali di giocatore e avversari.

La grafica usa gli asset locali, senza alterare gli originali. Il canvas conserva le dimensioni anche su schermi piccoli (può essere necessario scorrere). Le transizioni di pausa/fine livello sono semplici messaggi su canvas, non le animazioni storiche.

## Comandi
Click o Spazio per iniziare. Frecce/WASD per guidare; Ctrl/Spazio per il fumo; P per pausa/ripresa. Durante il gioco, click sul campo seleziona la direzione; click sull'HUD rilascia fumo.

Dieci bandiere per livello; bandiera S raddoppia i punti. Carburante residuo convertito in bonus. Tre vite conservate fra livelli. Record locale se localStorage disponibile.

## Interni e verifica
`World.js` ricava le strade dai colori dell'esportazione della mappa e limita gli oggetti alle celle raggiungibili. `Car.js` gestisce il movimento sulla griglia. `Game.js` carica gli asset, gestisce stati e rendering. `main.js` avvia il gioco.

Revisione statica eseguita. Collaudo browser e verifica della corrispondenza dell'esportazione PNG con la mappa Tiled ancora da effettuare. Per maggiore robustezza è pianificato l'uso diretto dei dati Tiled originali per le collisioni.
