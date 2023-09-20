const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const app = express();
const port = 3000;

var files = [];
var progressive=0;

app.use(cors());
app.use(express.json());

//funzione per dare al video il nome dell'orario a cui è stato salvato
function formatTime() {
	const date = new Date();
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();

	const formattedHours = hours.toString().padStart(2, "0");
	const formattedMinutes = minutes.toString().padStart(2, "0");
	const formattedSeconds = seconds.toString().padStart(2, "0");
	progressive ++;

	return `${formattedHours}${formattedMinutes}${formattedSeconds}_${progressive}`;
}

// Configurazione di Multer per gestire il salvataggio dei file video
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Cartella di destinazione (assicurati che esista)
    cb(null, "uploads.nosync/");
  },
  filename: (req, file, cb) => {
    // Genera un nome unico per ogni file caricato
    const filename = formatTime();
    cb(null, filename + ".webm");
  },
});

const upload = multer({ storage });

// Endpoint per la ricezione dei video
app.post("/proctoring/sendvideo", upload.array("blob", 100), (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) {
    console.log("Nessun file video ricevuto");
    return res.status(400).json({ error: "Nessun file video ricevuto" });
  }

  console.log(`${files.length} video ricevuti`);
  return res.status(200).json({ message: "Video ricevuti con successo" });
});


// Middleware per gestire FormData nell'endpoint /proctoring/checksend
app.use("/proctoring/checksend", upload.none());

// Endpoint per verificare se inviare un video
app.post("/proctoring/checksend", (req, res) => {
	const user_id = req.body.user_id;
	const state = req.body.state;
	const exam_id = req.body.exam_id;
	if (state === "true") {
		console.log("200 ok");
		return res.status(200).send("1");
	} else {
		console.log("200 not ok");
		return res.status(200).send("0");
	}
});

// Avvio del server
app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});
