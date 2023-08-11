const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const app = express();
const port = 3000;

var files = [];

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

	return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
}

// Configurazione di Multer per gestire il salvataggio dei file video
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		//Alla cartella di destinazione ho dovuto aggiungere ".sync" altrimenti tutti i video mi venivano salvati nel cloud intasandolo
		cb(null, "uploads.nosync/");
	},
	filename: (req, file, cb) => {
		const filename = formatTime();
		cb(null, filename + ".webm");
	},
});

const upload = multer({ storage });

// Endpoint per la ricezione dei video
app.post("/proctoring/sendvideo", upload.single("video"), (req, res) => {
	const file = req.file;
	if (!file) {
		console.log("errore nella ricezione video")
		return res.status(400).json({ error: "No video file received" });
	}
	console.log("video ricevuto")
	return res.status(200).json({ message: "Video successfully received" });
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
