const subtitleText = document.getElementById('subtitleText');
const subtitleFileInput = document.getElementById('subtitleFile');
const playButton = document.getElementById('playButton');
const seekBar = document.getElementById('seekBar');
const currentTimeDisplay = document.getElementById('currentTime');
const fullscreenButton = document.getElementById('fullscreenButton');
const seekAdd = document.getElementById('seekButtonAdd');
const seekSubtract = document.getElementById('seekButtonSubtract');

let subtitles = [];
let currentSubtitleIndex = 0;
let isPlaying = false;
let currentTime = 0;
let timerId;

subtitleFileInput.addEventListener('change', handleFileSelect);
playButton.addEventListener('click', play);
seekBar.addEventListener('input', seek);
fullscreenButton.addEventListener('click', toggleFullscreen);
seekButtonAdd.addEventListener('click', () => {
  console.log("CLICKKK!")
  currentTime += 10000;
})
seekButtonSubtract.addEventListener('click', () => {
  console.log("CLICKKK!")
  currentTime -= 10000;
});

document.addEventListener("fullscreenchange", (event) => {
  fullscreen = !fullscreen;
  if(fullscreen){
    fullscreenButton.style.visibility = 'hidden';
  }
  else{
    fullscreenButton.style.visibility = 'visible';
  }

});

let fullscreen = false;
var noSleep = new NoSleep();
function toggleFullscreen() {
  const container = document.querySelector('.container');
  if(!fullscreen){
    noSleep.enable();
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.mozRequestFullScreen) {
      container.mozRequestFullScreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    } else if (container.msRequestFullscreen) {
      container.msRequestFullscreen();
    }
    fullscreenButton.style.visibility = 'hidden';
  }
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    parseSubtitle(e.target.result);
  };
  reader.readAsText(file);
}

function parseSubtitle(data) {
  subtitles = [];
  const lines = data.split(/\r?\n/);
  let index = 0;

  while (index < lines.length) {
    if (lines[index].trim() === '') {
      index++;
      continue;
    }

    const id = parseInt(lines[index++]);
    const timeString = lines[index++];
    let text = '';

    // Concatenate multiline text
    while (lines[index] && lines[index].trim() !== '') {
      text += lines[index++] + ' ';
    }

    index++; // Skip the empty line after the text

    const [startTime, endTime] = timeString.split(' --> ').map(parseTime);
    subtitles.push({ id, startTime, endTime, text });
  }

  seekBar.max = subtitles[subtitles.length - 1].endTime;
  subtitleFileInput.style.display = 'none';
  currentTime = subtitles[0].startTime;
  updateTime();
}

function parseTime(timeString) {
  const parts = timeString.split(':');
  const lastPart = parts[2].split(',');

  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  const seconds = parseInt(lastPart[0]);
  const milliseconds = parseInt(lastPart[1]);

  return hours * 3600000 + minutes * 60000 + seconds * 1000 + milliseconds;
}

function play() {
  if (isPlaying){
    isPlaying = false;
    playButton.className = 'play-button'
    clearInterval(timerId);
  }
  else{
    playButton.className = 'pause-button'
    isPlaying = true;
    timerId = setInterval(updateTime, 100);
  }
}


function updateTime() {
  currentTime += 100; // Simulate 100ms of video playback time
  currentTimeDisplay.textContent = formatTime(currentTime);

  const subtitle = subtitles.find(sub => currentTime >= sub.startTime && currentTime < sub.endTime);
  if (subtitle) {
    subtitleText.innerHTML = subtitle.text;
  } else {
    subtitleText.innerHTML = '';
  }

  // Update seek bar position
  seekBar.value = currentTime;
}

function formatTime(time) {
  const milliseconds = time % 1000;
  time = (time - milliseconds) / 1000;
  const seconds = time % 60;
  time = (time - seconds) / 60;
  const minutes = time % 60;
  const hours = (time - minutes) / 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function seek() {
  currentTime = parseFloat(seekBar.value);
  currentTimeDisplay.textContent = formatTime(currentTime);
}

const requestWakeLock = async () => {
  try {
    const wakeLock = await navigator.wakeLock.request("screen");
    console.log("GOT WAKE LOCK?", wakeLock)
  } catch (err) {
    // The wake lock request fails - usually system-related, such as low battery.

    console.log(`${err.name}, ${err.message}`);
  }
};
requestWakeLock()
