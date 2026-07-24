const JSON_URL = 'https://old-star-b1d3api-musicas.paginainsta32.workers.dev';
const LOGO_URL = 'https://pub-dd2f575cd0624a87868bdcc44b319966.r2.dev/SUA_LOGO.png'; // Coloque o link da sua logo aqui

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
const folderButtonsContainer = document.getElementById('folder-buttons');

let allSongs = [];
let filteredSongs = [];
let currentSongIndex = 0;
let isPlaying = false;
let currentFolder = 'TODAS';

trackCover.src = LOGO_URL;

// Carregar músicas da API Worker
async function loadSongs() {
  try {
    const response = await fetch(JSON_URL);
    allSongs = await response.json();
    filteredSongs = [...allSongs];

    if (allSongs.length > 0) {
      renderFolderButtons();
      renderPlaylist(filteredSongs);
      loadSong(0);
    } else {
      trackTitle.textContent = "Nenhuma música encontrada";
    }
  } catch (error) {
    console.error("Erro ao carregar músicas:", error);
    trackTitle.textContent = "Erro ao conectar com PH_MUSIC";
  }
}

// Criar botões das Pastas automaticamente
function renderFolderButtons() {
  // Extrai todas as pastas únicas presentes no R2
  const folders = ['TODAS', ...new Set(allSongs.map(song => song.pasta))];
  folderButtonsContainer.innerHTML = '';

  folders.forEach(folder => {
    const btn = document.createElement('button');
    btn.classList.add('btn-folder');
    if (folder === currentFolder) btn.classList.add('active');
    
    btn.textContent = folder === 'TODAS' ? 'Todas as Músicas' : folder;

    btn.addEventListener('click', () => {
      currentFolder = folder;
      
      // Atualiza estado visual do botão selecionado
      document.querySelectorAll('.btn-folder').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      applyFilters();
    });

    folderButtonsContainer.appendChild(btn);
  });
}

// Aplica filtros combinados (Pasta + Busca)
function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase();

  filteredSongs = allSongs.filter(song => {
    const matchFolder = (currentFolder === 'TODAS') || (song.pasta === currentFolder);
    const matchSearch = song.titulo.toLowerCase().includes(searchTerm) || 
                        song.artista.toLowerCase().includes(searchTerm);
    return matchFolder && matchSearch;
  });

  renderPlaylist(filteredSongs);
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
    
    if (allSongs[currentSongIndex] && song.id === allSongs[currentSongIndex].id) {
      li.classList.add('active');
    }

    li.innerHTML = `
      <span class="item-title">${song.titulo}</span>
      <span class="item-artist">${song.artista}</span>
    `;

    li.addEventListener('click', () => {
      const realIndex = allSongs.findIndex(s => s.id === song.id);
      if (realIndex !== -1) {
        currentSongIndex = realIndex;
        loadSong(currentSongIndex);
        playSong();
      }
    });

    playlistEl.appendChild(li);
  });
}

// Filtro de Busca
searchInput.addEventListener('input', applyFilters);

// Carregar no Player
function loadSong(index) {
  const song = allSongs[index];
  trackTitle.textContent = song.titulo;
  trackArtist.textContent = song.artista;
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
  if (isPlaying) pauseSong();
  else playSong();
});

// Avançar / Voltar dentro da lista filtrada atual
prevBtn.addEventListener('click', () => {
  if (filteredSongs.length === 0) return;
  const currentFilteredIndex = filteredSongs.findIndex(s => s.id === allSongs[currentSongIndex].id);
  const nextFilteredIndex = (currentFilteredIndex - 1 + filteredSongs.length) % filteredSongs.length;
  
  const realIndex = allSongs.findIndex(s => s.id === filteredSongs[nextFilteredIndex].id);
  currentSongIndex = realIndex;
  loadSong(currentSongIndex);
  playSong();
});

nextBtn.addEventListener('click', () => {
  if (filteredSongs.length === 0) return;
  const currentFilteredIndex = filteredSongs.findIndex(s => s.id === allSongs[currentSongIndex].id);
  const nextFilteredIndex = (currentFilteredIndex + 1) % filteredSongs.length;
  
  const realIndex = allSongs.findIndex(s => s.id === filteredSongs[nextFilteredIndex].id);
  currentSongIndex = realIndex;
  loadSong(currentSongIndex);
  playSong();
});

audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    progressBar.value = (audio.currentTime / audio.duration) * 100;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    totalDurationEl.textContent = formatTime(audio.duration);
  }
});

progressBar.addEventListener('input', () => {
  audio.currentTime = (progressBar.value / 100) * audio.duration;
});

volumeBar.addEventListener('input', (e) => {
  audio.volume = e.target.value / 100;
});

audio.addEventListener('ended', () => {
  nextBtn.click();
});

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

loadSongs();
