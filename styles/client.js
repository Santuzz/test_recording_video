var videoElem;
var startElem;

var canvas;
var myTimer;
var bstate;
var mystatus;
var sharing;
var status_div_alert;
var url=" http://localhost:3000"
//var url = "http://127.0.0.1:8000";

var bEnabled = true;

var displayMediaOptions = {
    video: true,
    audio: false
};

var mime;
var mediaRecorder;
var blob;
var chunks = [];
var bitrate = 1000000;
var timeInterval = 5000;

window.onload = function () {
    videoElem = document.getElementById("video");
    startElem = document.getElementById("start");
    canvas = document.getElementById("canvas");
    mystatus = document.getElementById("mystatus");
    sharing = document.getElementById("sharing");

    status_div_alert = document.getElementById("status-div-alert")

    videoElem.style.display = "none";
    canvas.style.display = "none";
    bstate = false;
    startElem.disabled = false;

    UpdateStatus("Waiting", "info");

    startElem.addEventListener("click", async function (evt) {
        UpdateStatus("Connecting...", "info");

        try {
            videoElem.srcObject = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
            //videoElem.style.display = "block";
            startElem.disabled = true;
            //UpdateStatus("Recording...", "info");
            dumpOptionsInfo();
            bstate = true;
        } catch (err) {
            console.error("Error: " + err);
        }

        mediaCreate();
        //myTimer = setInterval(checkVideo, timeInterval);
        myTimer = setInterval(StopAndStart, timeInterval);
    }, false);
}

function dumpOptionsInfo() {
    const videoTrack = videoElem.srcObject.getVideoTracks()[0];

    console.info("Track settings:");
    console.info(JSON.stringify(videoTrack.getSettings(), null, 2));
    console.info("Track constraints:");
    console.info(JSON.stringify(videoTrack.getConstraints(), null, 2));

    console.log(videoTrack.getSettings().width);
}

function mediaCreate() {
    //se il browser lo supporta viene utilizzato il codec VP9
    /*mime = MediaRecorder.isTypeSupported("video/webm; codecs=vp9")
        ? "video/webm; codecs=vp9"
        : "video/webm"*/
    mime = "video/webm";

    mediaRecorder = new MediaRecorder(videoElem.srcObject, {
        mimeType: mime, videoBitsPerSecond: bitrate
    })
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.addEventListener('stop', function () {
        checkVideo();
    });

    mediaRecorder.start();
}

//Quando viene interrotta la condivisione schermo o quando viene stoppata la registrazione attuale per iniziarre quella nuova,
// viene invoca questa funzione che semplicemente aggiunge la porzione di video registrata al buffer locale
function handleDataAvailable(event) {
    chunks.push(event.data);
}

function StopAndStart() {
    mediaRecorder.stop();
    try {
        mediaCreate();

    } catch (e) {
        UpdateStatus("Disconnecting...", "info");
        clearInterval(myTimer);

        bstate = false;
        videoElem.srcObject = null;
        startElem.disabled = false;
        UpdateStatus("Disconnected", "info");
    }
}

// chiede al server se è pronto per ricevere un video
async function checkVideo() {
    console.log("checking to send a video");
    let formData = new FormData();
    formData.append("user_id", "{{ user.id }}");
    formData.append("state", bstate);
    formData.append("exam_id", "{{ exam.id }}");

    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
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
    xhttp.send(formData);
}


//invia al server una porzione di video.
// La funzione viene chiamata interativamente da sè stessa finchè il buffer non si svuota
async function sendVideoChunks() {

    let chunk = [];
    chunk.push(chunks[0])

    blob = new Blob(chunk, {type: "video/webm"});
    console.log(blob)
    var ctx = canvas.getContext('2d');
    ctx.drawImage(videoElem, 0, 0, canvas.width, canvas.height);
    var dataURI = canvas.toDataURL('image/jpeg', 0.8);

    var formData = new FormData();
    formData.append("image64", dataURI);
    formData.append("blob", blob);
    formData.append("user_id", "{{ user.id }}");
    formData.append("exam_id", "{{ exam.id }}");

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            UpdateStatus("Video successfully sent.", "ok");
            chunks.shift();
            console.log(`lunghezza chunk: ${chunks.length}`)
            if (chunks.length > 0) {
                sendVideoChunks();
            }
        }

        if (this.readyState === 4 && this.status >= 400) {
            UpdateStatus("Error sending the video!", "error");
        }
    };

    xhttp.open("POST", url + "/proctoring/sendvideo", true);
    xhttp.setRequestHeader("X-CSRFToken", '{{ csrf_token }}');
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
    }
    mystatus.innerText = mes;
}
