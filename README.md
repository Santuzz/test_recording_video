Il server è stato realizzato utilizzando Node.js.

Attualmente, il client richiede al server, ogni 5000 millisecondi, se è pronto a ricevere una registrazione mediante una richiesta POST HTTP.

Se il server dà il suo consenso, il client crea un blob che include tutti i segmenti video registrati fino a quel momento (presenti nell'array chunkTmp) e lo invia nuovamente al server tramite una richiesta POST HTTP.

Appena ricevuto il blob, il server provvede a salvarlo nel formato .webm nella cartella "uploads.nosync".
