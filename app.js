const JSON_URL = 'https://old-star-b1d3api-musicas.paginainsta32.workers.dev';

// COLOQUE O LINK DA SUA LOGO AQUI:
const LOGO_URL = 'https://pub-dd2f575cd0624a87868bdcc44b319966.r2.dev/SUA_LOGO.png';

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
const searchInput = document.getElementById('search-input');

let songs = [];
let filteredSongs = [];
let currentSongIndex = 0;
let isPlaying = false;

// Configura a capa inicial com a logo
trackCover.src = LOGO_URL;

// Carregar músicas da Worker
async function loadSongs() {
  try {
    const response = await fetch(JSON_URL);
    songs = await response.json();
    filteredSongs = [...songs];

    if (songs.length > 0) {
      renderPlaylist(filteredSongs);
      loadSong(0);
    } else {
      trackTitle.textContent = "Nenhuma música encontrada";
    }
  } catch (error) {
    console.error("Erro ao carregar do Cloudflare Worker:", error);
    trackTitle.textContent = "Erro ao conectar com PH_MUSIC";
  }
}

// Renderizar a Playlist
function renderPlaylist(playlistArray) {
  playlistEl.innerHTML = '';
  
  if (playlistArray.length === 0) {
    playlistEl.innerHTML = '<li style="color: #777; font-size: 0.85rem; padding: 10px;">Nenhuma música encontrada</li>';
    return;
  }

  playlistArray.forEach((song) => {
    const li = document.createElement('li');
    li.classList.add('playlist-item');
    
    if (songs[currentSongIndex] && song.id === songs[currentSongIndex].id) {
      li.classList.add('active');
    }

    li.innerHTML = `
      <span class="item-title">${song.titulo}</span>
      <span class="item-artist">${song.artista}</span>
    `;

    li.addEventListener('click', () => {
      const realIndex = songs.findIndex(s => s.id === song.id);
      if (realIndex !== -1) {
        currentSongIndex = realIndex;
        loadSong(currentSongIndex);
        playSong();
      }
    });

    playlistEl.appendChild(li);
  });
}

// Filtro de Busca em tempo real
searchInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  filteredSongs = songs.filter(song => 
    song.titulo.toLowerCase().includes(searchTerm) || 
    song.artista.toLowerCase().includes(searchTerm)
  );
  renderPlaylist(filteredSongs);
});

// Carregar informações no Player
function loadSong(index) {
  const song = songs[index];
  trackTitle.textContent = song.titulo;
  trackArtist.textContent = song.artista;
  
  // Força a capa a usar sempre a sua Logo
  trackCover.src = LOGO_URL;
  
  audio.src = song.url;

  renderPlaylist(filteredSongs);
}

// Controles Play/Pause
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

// Navegação Próxima / Anterior
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

// Progresso do Áudio
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

// Autoplay para a próxima música
audio.addEventListener('ended', () => {
  nextBtn.click();
});

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Inicializa
loadSongs();
