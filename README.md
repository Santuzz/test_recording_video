Il server è stato realizzato utilizzando Node.js.

Attualmente, il client richiede al server, ogni 5000 millisecondi, se è pronto a ricevere una registrazione mediante una richiesta POST HTTP.

Se il server dà il suo consenso, il client crea un blob che include tutti i segmenti video registrati fino a quel momento (presenti nell'array chunkTmp) e lo invia nuovamente al server tramite una richiesta POST HTTP.

Appena ricevuto il blob, il server provvede a salvarlo nel formato .webm nella cartella "uploads.nosync".

Osservazioni:
- La durata del chunk non influisce in modo direttamente proporzionale alla sua dimensione (testato con 5000ms e 10000ms)
- la dimensione di un chunk va da 100Kb a 6Mb (in media direi su 1Mb)
- La dimensione arriva a 100Kb se la registrazione è completamente statica
- l'unico formato video supportato da mediaRecorder è il webm anche se si hanno a disposizione diverse codifiche

Problematiche affrontate:
- cosa inviare al server: registrazioni che iniziano e finiscono prima di essere inviate (non un'unica rregistrazione spezzettata)

Problematiche da affrontare:
- bitrete / framerate della registrazione
- merging dei vari video lato server
- dimensioni accettabili dei video -> eventuale compressione
