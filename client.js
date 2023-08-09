var videoElem;
var startElem;
var myTimer;
var bstate;
var mystatus;
var url = "http://localhost:3000";
var mime;

var displayMediaOptions = {
	video: true,
	audio: false
};

var mediaRecorder;
var blob;
var chunckTmp = [];
var timeInterval = 5000;

window.onload = function () {
	videoElem = document.getElementById("video");
	startElem = document.getElementById("start");
	mystatus = document.getElementById("mystatus");
	status_div_alert = document.getElementById("status-div-alert")

	startElem.addEventListener("click", async function (evt) {
		UpdateStatus("Connecting...", "info");

		videoElem.srcObject = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
		videoElem.style.display = "block";
		startElem.disabled = true;
		mystatus.innerText = "Recording...";
		bstate = true;

		//se il browser lo supporta viene utilizzato il codec VP9
		mime = MediaRecorder.isTypeSupported("video/webm; codecs=vp9")
			? "video/webm; codecs=vp9"
			: "video/webm"
		mediaRecorder = new MediaRecorder(videoElem.srcObject, {
			mimeType: mime
		})


		mediaRecorder.ondataavailable = handleDataAvailable;

		mediaRecorder.addEventListener('stop', function () {
			UpdateStatus("Disconnecting...", "info");
			clearInterval(myTimer);

			let urlVideo = URL.createObjectURL(blob);
			let videoComplete = document.getElementById("videoComplete");
			videoComplete.src = urlVideo;
			bstate = false;
			videoElem.srcObject = null;
			startElem.disabled = false;
			UpdateStatus("Disconnected", "info");
		});

		mediaRecorder.start();

		myTimer = setInterval(checkVideo, timeInterval);
	}, false);
}

//funzione invocata dal mediaRecorder (metodo requestData() o quando viene interrotta la condivisione schermo)
function handleDataAvailable(event) {

	console.log("handle");
	chunckTmp.push(event.data);
	blob = new Blob(chunckTmp, { type: 'video/webm' });

}

//invia al server una porzione di video
async function sendVideoChunks() {
	console.log("send video");
	mediaRecorder.requestData();
	//il primo invio non va a buon fine perchè non si aspetta che mediaRecorder.requestData() finisca la sua esecuzione, quindi il blob è vuoto
	console.log(blob);
	var formData = new FormData();
	formData.append("video", blob);
	formData.append("user_id", "{{ user.id }}");
	formData.append("exam_id", "{{ exam.id }}");

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState === 4 && this.status === 200) {
			// console.log(xhttp.responseText);
			UpdateStatus("Video successfully sent.", "ok");
		}

		if (this.readyState === 4 && this.status >= 400) {
			UpdateStatus("Error sending the video!", "error");
		}
	};

	xhttp.open("POST", url + "/proctoring/sendvideo", true);
	xhttp.setRequestHeader("X-CSRFToken", '{{ csrf_token }}');
	xhttp.send(formData);
	UpdateStatus("Video sended", "info");
}

// chiede al server se è pronto per ricevere un video
async function checkVideo() {
	console.log("checking to send a video");
	var formData = new FormData();
	formData.append("user_id", "{{ user.id }}");
	formData.append("state", bstate);
	formData.append("exam_id", "{{ exam.id }}");

	var xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function () {
		if (this.readyState === 4 && this.status === 200) {
			console.log("bstate: " + bstate);
			if (bstate === true) {
				UpdateStatus("Connected. Sharing: enabled.", "ok");
				if (xhttp.responseText === "1") {
					UpdateStatus("Sending a video...", "info");
					sendVideoChunks();
				}
			} else {
				UpdateStatus("Connected. Sharing: not enabled.", "war");
			}
		}

		if (this.status > 400) {
			UpdateStatus("Connection error with the server", "error");
		}
	};

	xhttp.open("POST", url + "/proctoring/checksend", true);
	xhttp.setRequestHeader("X-CSRFToken", '{{ csrf_token }}');

	const queryString = new URLSearchParams(formData).toString();
	console.log(queryString);

	xhttp.send(formData);
}

// aggiorna lo stato visualizzato dall'utente
function UpdateStatus(mes, state) {
	switch (state) {
		case "error":
			status_div_alert.className = "alert alert-danger";
			break;
		case "war":
			status_div_alert.className = "alert alert-warning";
			break;
		case "ok":
			status_div_alert.className = "alert alert-success";
			break;
		case "info":
			status_div_alert.className = "alert alert-info";
			break;
		case "default":
			status_div_alert.className = "alert alert-warning";
			break;
	};
	mystatus.innerText = mes;
};
//funzione usata per mostrare l'orario nella pagina web che veniva registrata
function mostraOrario() {

	var data = new Date();
	var giorno = data.getDate();
	var mese = data.getMonth() + 1;
	var anno = data.getFullYear();
	var ora = data.getHours();
	var minuti = data.getMinutes();
	var secondi = data.getSeconds();

	giorno = aggiungiZero(giorno);
	mese = aggiungiZero(mese);
	anno = aggiungiZero(anno);
	ora = aggiungiZero(ora);
	minuti = aggiungiZero(minuti);
	secondi = aggiungiZero(secondi);

	var orarioElemento = document.getElementById("orario-data");

	orarioElemento.textContent = giorno + "/" + mese + "/" + anno + " " + ora + ":" + minuti + ":" + secondi;

	setTimeout(mostraOrario, 1000);
}

function aggiungiZero(numero) {
	if (numero < 10) {
		numero = "0" + numero;
	}
	return numero;
}

mostraOrario();
