// Substitua pela URL pública do seu arquivo musicas.json no R2
const JSON_URL = 'https://old-star-b1d3api-musicas.paginainsta32.workers.dev';
const audio = document.getElementById('audio-player');
const playBtn = document.getElementById('btn-play');
const playIcon = document.getElementById('play-icon');
const prevBtn = document.getElementById('btn-prev');
const nextBtn = document.getElementById('btn-next');
const trackCover = document.getElementById('track-cover');
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');
const volumeBar = document.getElementById('volume-bar');
const playlistEl = document.getElementById('playlist');

let songs = [];
let currentSongIndex = 0;
let isPlaying = false;

// Carregar catálogo de músicas do R2
async function loadSongs() {
  try {
    const response = await fetch(JSON_URL);
    songs = await response.json();

    if (songs.length > 0) {
      renderPlaylist();
      loadSong(0);
    } else {
      trackTitle.textContent = "Nenhuma música encontrada";
    }
  } catch (error) {
    console.error("Erro ao carregar o catálogo de músicas:", error);
    trackTitle.textContent = "Erro ao carregar músicas";
  }
}

// Renderizar a lista lateral
function renderPlaylist() {
  playlistEl.innerHTML = '';
  songs.forEach((song, index) => {
    const li = document.createElement('li');
    li.classList.add('playlist-item');
    if (index === currentSongIndex) li.classList.add('active');

    li.innerHTML = `
      <span class="item-title">${song.titulo}</span>
      <span class="item-artist">${song.artista}</span>
    `;

    li.addEventListener('click', () => {
      currentSongIndex = index;
      loadSong(currentSongIndex);
      playSong();
    });

    playlistEl.appendChild(li);
  });
}

// Carregar informações da música no Player
function loadSong(index) {
  const song = songs[index];
  trackTitle.textContent = song.titulo;
  trackArtist.textContent = song.artista;
  trackCover.src = song.capa || 'https://via.placeholder.com/300?text=Sem+Capa';
  audio.src = song.url;

  updateActivePlaylistItem();
}

function updateActivePlaylistItem() {
  const items = document.querySelectorAll('.playlist-item');
  items.forEach((item, index) => {
    if (index === currentSongIndex) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// Play / Pause
function playSong() {
  isPlaying = true;
  audio.play();
  playIcon.classList.remove('fa-play');
  playIcon.classList.add('fa-pause');
}

function pauseSong() {
  isPlaying = false;
  audio.pause();
  playIcon.classList.remove('fa-pause');
  playIcon.classList.add('fa-play');
}

playBtn.addEventListener('click', () => {
  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
});

// Avançar / Voltar
prevBtn.addEventListener('click', () => {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  loadSong(currentSongIndex);
  playSong();
});

nextBtn.addEventListener('click', () => {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  loadSong(currentSongIndex);
  playSong();
});

// Atualizar tempo e barra de progresso
audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressBar.value = progressPercent;

    currentTimeEl.textContent = formatTime(audio.currentTime);
    totalDurationEl.textContent = formatTime(audio.duration);
  }
});

progressBar.addEventListener('input', () => {
  const seekTime = (progressBar.value / 100) * audio.duration;
  audio.currentTime = seekTime;
});

// Controle de Volume
volumeBar.addEventListener('input', (e) => {
  audio.volume = e.target.value / 100;
});

// Avançar automaticamente ao terminar a música
audio.addEventListener('ended', () => {
  nextBtn.click();
});

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Inicializar
loadSongs();
