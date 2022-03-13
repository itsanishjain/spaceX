

const IMAGE_URL = (model.IMAGE_URL);
console.log(IMAGE_URL);

const POSE_URL = (model.POSE_URL);

const AUDIO_URL = (model.AUDIO_URL);

// Declare the variables
let modelimage, webcamimage, imagelabelContainer, maxPredictionsimage;
let modelpose, webcampose, ctx, poselabelContainer, maxPredictionspose;


//basically turn on cam


   

    async function predict() {
        // Prediction #1: run input through posenet
        // estimatePose can take in an image, video or canvas html element
        const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
        // Prediction 2: run input through teachable machine classification model
        const prediction = await model.predict(posenetOutput);

        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction =
                prediction[i].className + ": " + prediction[i].probability.toFixed(2);
            labelContainer.childNodes[i].innerHTML = classPrediction;
        }

    
       
    }

   

// for audio model
async function createModel() {
    const checkpointURL = AUDIO_URL + "model.json"; // model topology
    const metadataURL = AUDIO_URL + "metadata.json"; // model metadata

    const recognizer = speechCommands.create(
        "BROWSER_FFT", // fourier transform type, not useful to change
        undefined, // speech commands vocabulary feature, not useful for your models
        checkpointURL,
        metadataURL
    );

    // check that model and metadata are loaded via HTTPS requests.
    await recognizer.ensureModelLoaded();

    return recognizer;
}

// Declare the arrays for storing dynamic data
window.audio_array1 = []; window.audio_array2 = [];
window.pose1arr = []; window.pose2arr = []; window.pose3arr = [];window.pose4arr = [];
window.image1arr = []; window.image2arr = [];
window.sumimagearr1=0;window.sumimagearr2=0;
window.sumposearr1=0; window.sumposearr2=0; window.sumposearr3=0; window.sumposearr4=0;
window.sumaudioarr1=0;window.sumaudioarr2=0;
window.audiogr = []; window.posegr = []; window.imagegr = [];

//wpm counter
function countWpm() {
   str = document.getElementById("result").textContent; 
   wordcount = str.trim().split(/\s+/).length;
   finalwordcount = wordcount*6;
   console.log(wordcount*6); 
   document.getElementById("wpmdisplay").textContent = 'Your WPM is ' + finalwordcount;
   
   document.getElementById("result").textContent = '';
}
//-------------------------------start transcript feature -----------------------
 window.addEventListener("DOMContentLoaded", () => {
        const button = document.getElementById("transcript");
        const result = document.getElementById("result");
        const main = document.getElementsByTagName("main")[0];
        let listening = false;
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        if (typeof SpeechRecognition !== "undefined") {
          const recognition = new SpeechRecognition();

          const stop = () => {
            main.classList.remove("speaking");
            recognition.stop();
            button.textContent = "Start listening";
            clearInterval(countWpm);
          };

          const start = () => {
            main.classList.add("speaking");
            recognition.start();
            button.textContent = "Stop listening";
            setInterval(countWpm, 10000);
          };

          const onResult = event => {
            result.innerHTML = "";
            for (const res of event.results) {
              const text = document.createTextNode(res[0].transcript);
              const p = document.createElement("p");
              p.id = 'speechResult'
              if (res.isFinal) {
                p.classList.add("final");
              }
              p.appendChild(text);
              result.appendChild(p);
            }
          };
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.addEventListener("result", onResult);
          button.addEventListener("click", event => {
            listening ? stop() : start();
            listening = !listening;
          });
        } else {
          button.remove();
          const message = document.getElementById("message");
          message.removeAttribute("hidden");
          message.setAttribute("aria-hidden", "false");
        }
      });



// Load the image model and setup the webcam
async function init() {

	//turn on camera
	var video = document.querySelector("#videoElement");

            if (navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: true })
                    .then(function (stream) {
                        video.srcObject = stream;
                    })
                    .catch(function (err0r) {
                        console.log("Something went wrong!");
                    });
            }
	
    // Changing the button text
    document.querySelector("#record-btn").innerHTML = "Starting the magic...";
	    document.querySelector("#stop-record-btn").style.display = "flex";
    
    // Changing final report visibility
    document.querySelector("#speech-final-rep").style.display = "none";

    const modelURLimage = IMAGE_URL + "model.json";
    const metadataURLimage = IMAGE_URL + "metadata.json";

    const modelURLpose = POSE_URL + "model.json";
    const metadataURLpose = POSE_URL + "metadata.json";

    // load the model and metadata
    modelimage = await tmImage.load(modelURLimage, metadataURLimage);
    maxPredictionsimage = modelimage.getTotalClasses();
    // load the model and metadata
    modelpose = await tmPose.load(modelURLpose, metadataURLpose);
    maxPredictionspose = modelpose.getTotalClasses();

    // Convenience function to setup a webcam
    const height = 350;
    const width = 350;
    const flip = true; // whether to flip the webcam
        
    webcamimage = new tmImage.Webcam(width, height, flip); // width, height, flip
    webcampose = new tmPose.Webcam(width, height, flip); // width, height, flip

    // Change button text
    document.querySelector("#record-btn").innerHTML = "Loading the model...";

    await webcampose.setup(); // request access to the webcam
    //await webcamimage.setup();
    await webcampose.play();
    //await webcamimage.play();
    window.requestAnimationFrame(loop);

    // Change button text
    document.querySelector("#record-btn").innerHTML = "Please be patient...";

    // append elements to the DOM
    const canvas = document.getElementById("canvas");
    
    canvas.width = width; canvas.height = height;
    ctx = canvas.getContext("2d");
        
    poselabelContainer = document.getElementById("pose_label-container");
    for (let i = 0; i < maxPredictionspose; i++) { // and class labels
        poselabelContainer.appendChild(document.createElement("div"));
    }

    imagelabelContainer = document.getElementById("image_label-container");
    for (let i = 0; i < maxPredictionsimage; i++) { // and class labels
        imagelabelContainer.appendChild(document.createElement("div"));
    }

    // audio recogniser
    window.recognizer = await createModel();
    const classLabels = recognizer.wordLabels(); // get class labels
    const audiolabelContainer = document.getElementById("audio_label-container");
    for (let i = 0; i < classLabels.length; i++) {
        audiolabelContainer.appendChild(document.createElement("div"));
    }

	recognizer.listen(result => {
        // declare the arrays empty
        const scores = result.scores; // probability of prediction for each class
        // render the probability scores per class
        for (let i = 0; i < classLabels.length; i++) {
            const classPrediction = classLabels[i] + ": " + result.scores[i].toFixed(2)*100 + "%";
            audiolabelContainer.childNodes[i].innerHTML = classPrediction;
        }
			
		// Store data in arrays
        audio_array1.push(result.scores[0].toFixed(2)*100);
        audio_array2.push(result.scores[1].toFixed(2)*100);
        
        // Store audio graph data
        audiogr.push(Math.round(100 - ((result.scores[0].toFixed(2)*100) + (result.scores[1].toFixed(2)*100))));
        
        // Store array sum
    	sumaudioarr1 += result.scores[0].toFixed(2)*100;
        sumaudioarr2 += result.scores[1].toFixed(2)*100;
    }, {
            includeSpectrogram: true, // in case listen should return result.spectrogram
            probabilityThreshold: 0.75,
            invokeCallbackOnNoiseAndUnknown: true,
            overlapFactor: 0.50 // probably want between 0.5 and 0.75. More info in README
        });

    // Change Button text
    document.querySelector("#record-btn").innerHTML = "Recording...";
    document.querySelector("#speech-report").style.display = "block";
    //document.querySelector("#record-btn").style.float = "none";
	 document.querySelector("#transcript").style.display = "block";

    
	
	// Recording start time
	window.starttime = Date.now();
}

async function loop() {
    webcampose.update(); // update the webcam frame
    webcamimage.update();
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    const { pose, posenetOutput } = await modelpose.estimatePose(webcampose.canvas);

    const predictionpose = await modelpose.predict(posenetOutput);
    // predict can take in an image, video or canvas html element
    const predictionimage = await modelimage.predict(webcampose.canvas);

    // Image model texts
    imagelabelContainer.childNodes[0].innerHTML = "Assisted" + ": " + predictionimage[0].probability.toFixed(2)*100 + "%";
    imagelabelContainer.childNodes[0].style.color = "#ee0a0a";
    imagelabelContainer.childNodes[1].innerHTML = "Unassisted" + ": " + predictionimage[1].probability.toFixed(2)*100 + "%";
    imagelabelContainer.childNodes[1].style.color = "#0dd840";

    // Store image data in array
    image1arr.push(predictionimage[0].probability.toFixed(2)*100);
    image2arr.push(predictionimage[1].probability.toFixed(2)*100);
    
    // Store image graph data
    imagegr.push(Math.round(predictionimage[1].probability.toFixed(2)*100));
    
    // Store data array sum
    sumimagearr1 += predictionimage[0].probability.toFixed(2)*100;
    sumimagearr2 += predictionimage[1].probability.toFixed(2)*100
    
    // Pose model texts        
    poselabelContainer.childNodes[0].innerHTML = predictionpose[0].className + ": " + predictionpose[0].probability.toFixed(2)*100 + "%";
    poselabelContainer.childNodes[0].style.color = "#0dd840"; //good posture
    poselabelContainer.childNodes[1].innerHTML = predictionpose[1].className + ": " + predictionpose[1].probability.toFixed(2)*100 + "%";
    poselabelContainer.childNodes[1].style.color = "#ee0a0a"; //bad eye contact
    poselabelContainer.childNodes[2].innerHTML = predictionpose[2].className + ": " + predictionpose[2].probability.toFixed(2)*100 + "%";
    poselabelContainer.childNodes[2].style.color = "#ee0a0a"; //bad posture
  
    
    // Store pose data in array
    pose1arr.push(predictionpose[0].probability.toFixed(2)*100);
    pose2arr.push(predictionpose[1].probability.toFixed(2)*100);
    pose3arr.push(predictionpose[2].probability.toFixed(2)*100);
    
    // Store pose graph data
    posegr.push(Math.round((predictionpose[0].probability.toFixed(2)*100) - ((predictionpose[2].probability.toFixed(2)*100)+(predictionpose[2].probability.toFixed(2)*100))));
    
    // Store data sum
    sumposearr1 += predictionpose[0].probability.toFixed(2)*100;
    sumposearr2 += predictionpose[1].probability.toFixed(2)*100;
    sumposearr3 += predictionpose[2].probability.toFixed(2)*100;

    
}
  


async function initstop()
{
	await webcampose.stop();
	recognizer.stopListening();
	endtime = Date.now();
	timeslot = (endtime - starttime)/1000;
	if(timeslot < 60)
	{
		window.timeprint = timeslot + " seconds";
	}
	else
	{
		minutes = Math.floor(timeslot/60);
		seconds = Math.floor(timeslot - minutes * 60);
		window.timeprint = minutes + " minutes and " + seconds + " seconds";
	}
    sumaudioarr1 /= audio_array1.length;
    sumaudioarr2 /= audio_array2.length;
    sumimagearr1 /= image1arr.length;
    sumimagearr2 /= image2arr.length;
    sumposearr1 /= pose1arr.length;
    sumposearr2 /= pose2arr.length;
    sumposearr3 /= pose3arr.length;

	//stop camera
	var video = document.querySelector("#videoElement");
	var stream = video.srcObject;
  	var tracks = stream.getTracks();

  for (var i = 0; i < tracks.length; i++) {
    var track = tracks[i];
    track.stop();
  }

  video.srcObject = null;

    window.posesc = Math.round(sumposearr1- (sumposearr2+sumposearr3+sumposearr4));
    window.audiosc = Math.round(100 - (sumaudioarr1+sumaudioarr2)/2);
    window.imagesc = Math.round(sumimagearr1 - sumimagearr2);
   
    document.querySelector("#speech-report-div").style.display = "none";
    document.querySelector("#pose-rep").innerHTML = posesc + "% near perfect";
    document.querySelector("#audio-rep").innerHTML = audiosc + "% confident voice";
    document.querySelector("#image-rep").innerHTML = imagesc + "% assisted";
    document.querySelector("#time-rep").innerHTML = timeprint;
    
	speechgraph(window.posesc,window.audiosc,window.imagesc,window.timeprint);
	document.querySelector("#speech-final-rep").style.display = "block";
    document.querySelector("#stop-record-btn").style.display = "none";
}

// plotting the graph and making the speech report
// credit: Taught to me by Swatilekha Roy

	var posex = []; var audiox = []; var imagex = [];
	for(i=0; i<posegr.length; i++)
	{
		posex.push(i);
	}
	for(i=0; i<audiogr.length; i++)
	{
		audiox.push(i);
	}
	for(i=0; i<imagegr.length; i++)
	{
		imagex.push(i);
	}
	$('#speech-report-btn').click(function () {
	var posture = {
		 x: posex,
		 y: posegr,
		 mode: 'lines+markers',
		 name: 'Posture'
	};

	var voice = {
		 x: audiox,
		 y: audiogr,
		 mode: 'lines+markers',
		 name: 'Voice Modulation'
	};
		
	var help = {
		 x: imagex,
		 y: imagegr,
		 mode: 'markers',
		 name: 'External Aid'
	}

	var data = [posture, voice, help];
		
		var img_jpg= d3.select('#jpg-export');
		var layout = {
			title : "Speech Report Graph",
			xaxis: {
		    	title: 'Duration'
			},
			yaxis: {
		    	title: 'Speech Parameters'
			}
		};

		// Plotting the Graph
		Plotly.newPlot(
		  'graph-div',
		   data,
		   layout)
		
		// static image in png format
		.then(
		    function(gd)
		     {
		      Plotly.toImage(gd,{height:300,width:700})
		         .then(
		             function(gr_url)
			         {
			             img_jpg.attr("src", gr_url);
			             report(gr_url);
			         }
		         )
		    });
	
		function report(gr_url)
		{
			doc.setFont("times", "bold");
			
			doc.setFontSize(39);
			doc.text("Your Speech Report", 105, 25, null, null, "center");
			
			doc.setFont("times", "normal");
			doc.setFontSize(18);
			doc.text("here is a report of an analysis of your speaking skills that\n"+
			"you conducted on our web platform:", 20, 40);
			
			doc.setFontSize(16);
			doc.setFont("helvetica", "bold");
			doc.text("Posture Feedback: ", 20, 60);
			doc.setFont("helvetica", "normal");
			posestr = posesc.toString();
			doc.text(posestr, 75, 60);
			doc.text(" % near perfect", 82, 60);
			doc.setFont("helvetica", "bold");
			doc.text("Voice Feedback: ", 20, 70);
			doc.setFont("helvetica", "normal");
			audiostr = audiosc.toString();
			doc.text(audiostr, 68, 70);
			doc.text(" % confident voice", 75, 70);
			doc.setFont("helvetica", "bold");
			doc.text("Fly Solo Feedback: ", 20, 80);
			doc.setFont("helvetica", "normal");
			imagestr = imagesc.toString();
			doc.text(imagestr, 76, 80);
			doc.text(" % unassisted.", 83, 80);
			
			doc.setFont("helvetica", "bold");
			doc.text("Total Speech Duration: ", 20, 100);
			doc.setFont("helvetica", "normal");
			timesc = timeprint.toString();
			doc.text(timesc, 85, 100);

		
			 
			
			doc.addImage(gr_url, "png", 15, 130);
			
		
			doc.save('speech-report.pdf');
		}
	});
}