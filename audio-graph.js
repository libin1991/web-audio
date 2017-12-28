window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;


// window.onload = function() {
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var audio = document.getElementById('audio');

var audioContext = new AudioContext(); //创建一个音频上下文
var analyser = audioContext.createAnalyser(); //创建一个AnalyserNode，可以用来显示音频时间和频率的数据
analyser.fftSize = 2048;
var bufferLength = analyser.frequencyBinCount;

var audioSrc = audioContext.createMediaElementSource(audio); //创建一个MediaElementAudioSourceNode接口来关联HTMLMediaElement. 这可以用来播放和处理来自<video>或<audio> 元素的音频.
audioSrc.connect(analyser);
analyser.connect(audioContext.destination);

var cWidth = canvas.width, cHeight = canvas.height;
var barWidth = 10;
var gap = 2;
var barNum = Math.round(cWidth / (barWidth + gap));  //绘制多少个条形
var topArr = []; //顶部的矩形片段数组
var topStyle = '#ff0';
var topHeight = 3;

var graphMode = 'bar';
var frameValue;


visual();

function visual() {
    if (graphMode == 'bar') {
        var draw = function () {
            frameValue = window.requestAnimationFrame(draw);
            ctx.clearRect(0, 0, cWidth, cHeight);

            var array = new Uint8Array(analyser.frequencyBinCount); //一个无符号长整形(unsigned long)的值, 值为fftSize的一半. 这通常等于将要用于可视化的数据值的数量.
            analyser.getByteFrequencyData(array); //将当前频域数据拷贝进Uint8Array数组（无符号字节数组）。

            ctx.beginPath();

            for (var i = 0; i < barNum; i++) {
                var value = array[i];
                if (topArr.length < barNum) {
                    topArr.push(value)
                }

                ctx.fillStyle = topStyle;

                //当声音的幅度值小于之前存储的幅度值时，顶部的方块儿缓缓下降; 否则，重新绘制顶部方块儿，并且重置topArr的值。
                if (value < topArr[i]) {
                    ctx.fillRect(i * (barWidth + gap), cHeight - (topArr[i] -= 1) - topHeight, barWidth, topHeight);
                } else {
                    ctx.fillRect(i * (barWidth + gap), cHeight - value - topHeight, barWidth, topHeight);
                    topArr[i] = value;
                }

                var grd = ctx.createLinearGradient(i * barWidth, cHeight - value, i * barWidth, cHeight);
                grd.addColorStop(0, "yellow");
                grd.addColorStop(0.3, "rgb(255,0,0)");
                grd.addColorStop(0.5, "rgb(200,0,0)");
                grd.addColorStop(0.7, "rgb(150,20,20)");
                grd.addColorStop(1, "rgb(100,0,0)");
                ctx.fillStyle = grd;
                ctx.fillRect(i * (barWidth + gap), cHeight - value, barWidth, topArr[i]);
                ctx.fill();
            }
        }
        draw();
    }

    if (graphMode == 'wave') {
        var wave = function () {
            frameValue = window.requestAnimationFrame(wave);
            ctx.clearRect(0, 0, cWidth, cHeight);

            ctx.lineWidth = 2;
            ctx.beginPath();

            var array = new Uint8Array(analyser.frequencyBinCount); //一个无符号长整形(unsigned long)的值, 值为fftSize的一半. 这通常等于将要用于可视化的数据值的数量。
            analyser.getByteTimeDomainData(array); //将当前频域数据拷贝进Uint8Array数组（无符号字节数组）。

            var sliceWidth = cWidth * 1.0 / bufferLength;
            var x = 0;

            ctx.strokeStyle = 'rgb(180,180,0)';
            // ctx.moveTo(x, cHeight / 2);
            // ctx.lineTo(cWidth, cHeight / 2);
            //ctx.moveTo(x, cHeight / 2);

            //ctx.strokeStyle = 'rgb(255,255,255)';
            // for (var j = 0; j < barNum; j++) {
            //     var value2 = array[j];
            //     var y = value2;
            //     // if (j === 0) {
            //     //     ctx.moveTo(x, cHeight/2);
            //     // } else {
            //     //     ctx.lineTo(x, y);
            //     // }
            //     // ctx.lineTo(x, cHeight/2);
            //     // ctx.lineTo(x, y);
            //     // x += sliceWidth;
            //     // ctx.stroke();
            // }
            // ctx.lineTo(cWidth, cHeight / 2);
            // ctx.stroke();

            for (var i = 0; i < bufferLength; i++) {

                var value = array[i] / 128.0;
                var y = value * cHeight / 2;

                ctx.lineTo(x, y);
                x += sliceWidth;
            }

            //ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
        }
        wave();
    }
}
audio.play();
// }

function switchMode() {
    if (graphMode == "wave") {
        graphMode = "bar";
    } else if (graphMode == "bar") {
        graphMode = "wave";
    }
    if (frameValue) {
        window.cancelAnimationFrame(frameValue);
    }
    visual();
}

