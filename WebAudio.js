var audioCtx = new(window.AudioContext || window.webkitAudioContext)();
var analyser = audioCtx.createAnalyser();

analyser.fftSize = 2048;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);
// console.log('dataArray Before', dataArray);
analyser.getByteTimeDomainData(dataArray);
// console.log('dataArray After', dataArray);

var canvas = document.getElementById('canvas');
var canvasCtx = canvas.getContext('2d');
var WIDTH = canvas.width;
var HEIGHT = canvas.height;

var source, stream, drawVisual;

var analyser = audioCtx.createAnalyser();
analyser.minDecibels = -90;
analyser.maxDecibels = -10;
analyser.smoothingTimeConstant = 0.85;

var distortion = audioCtx.createWaveShaper();
var gainNode = audioCtx.createGain();
var biquadFilter = audioCtx.createBiquadFilter();
var convolver = audioCtx.createConvolver();
var graphMode = 'bar';

navigator.getUserMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);

if (navigator.getUserMedia) {
    navigator.getUserMedia({
        audio: true
    }, function(stream){
        source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.connect(distortion);
        distortion.connect(biquadFilter);
        biquadFilter.connect(convolver);
        convolver.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        visualize();
        voiceChange();
    }, function(err){
        console.log('The following error occured: ' + err.name);
    })
}
// draw an oscilloscope of the current audio source

function visualize() {
    
    if (graphMode == 'wave') {
        analyser.fftSize = 2048;
        var bufferLength = analyser.fftSize;
        var dataArray = new Uint8Array(bufferLength);

        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

        var draw = function () {

            drawVisual = requestAnimationFrame(draw);

            analyser.getByteTimeDomainData(dataArray);

            console.log('dataArray', dataArray);

            canvasCtx.fillStyle = 'rgb(200, 200, 200)';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

            canvasCtx.beginPath();

            var sliceWidth = WIDTH * 1.0 / bufferLength;
            var x = 0;

            for (var i = 0; i < bufferLength; i++) {

                var v = dataArray[i] / 128.0;
                var y = v * HEIGHT / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
        };
        draw();
    } else if (graphMode == 'bar'){
        analyser.fftSize = 256;
        var bufferLengthAlt = analyser.frequencyBinCount;
        var dataArrayAlt = new Uint8Array(bufferLengthAlt);

        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

        var drawAlt = function () {
            drawVisual = requestAnimationFrame(drawAlt);

            analyser.getByteFrequencyData(dataArrayAlt);

            canvasCtx.fillStyle = 'rgb(0, 0, 0)';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            var barWidth = (WIDTH / bufferLengthAlt) * 2.5;
            var barHeight;
            var x = 0;

            for (var i = 0; i < bufferLengthAlt; i++) {
                barHeight = dataArrayAlt[i];

                canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
                canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

                x += barWidth + 1;
            }
        };

        drawAlt();
    }
}

function voiceChange() {

    distortion.oversample = '4x';
    biquadFilter.gain.value = 0;
    convolver.buffer = undefined;

    biquadFilter.type = "lowshelf";
    biquadFilter.frequency.value = 10000;
    biquadFilter.gain.value = 25;
}

function switchMode() {
    if (graphMode == "wave") {
        graphMode = "bar";
    } else if (graphMode == "bar") {
         graphMode = "wave";
    }
    console.log('graphMode', graphMode);
    if (drawVisual) {
        window.cancelAnimationFrame(drawVisual);
    }
    visualize();
}

