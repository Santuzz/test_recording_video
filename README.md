Il server è stato fatto con node.js

Al momento il client ogni 5000 millisecondi chiede al server se è pronto per ricevere una registrazione tramite una richiesta post HTTP.

Se il server da l'ok il client crea un blob prendendo tutti i segmenti video registrati fino a quel momento (presenti nell'array chunkTmp) e li invia al server serve tramite una richiesta post HTTP.

Il server appena ricevuto il blob lo salva nel formato .webm nella cartella upload.nosync.
