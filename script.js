document.addEventListener('DOMContentLoaded', function() {
      // Основные элементы
      const audioPlayer = document.getElementById('audio-player');
      const playBtn = document.getElementById('play-btn');
      const prevBtn = document.getElementById('prev-btn');
      const nextBtn = document.getElementById('next-btn');
      const shuffleBtn = document.getElementById('shuffle-btn');
      const repeatBtn = document.getElementById('repeat-btn');
      const progressBar = document.getElementById('progress-bar');
      const progressBarContainer = document.getElementById('progress-bar-container');
      const currentTimeEl = document.getElementById('current-time');
      const durationEl = document.getElementById('duration');
      const volumeBar = document.getElementById('volume-bar');
      const songList = document.getElementById('song-list');
      const songTitle = document.getElementById('song-title');
      const songArtist = document.getElementById('song-artist');
      const coverArt = document.getElementById('cover-art');
      const libraryList = document.getElementById('library-list');
      const playlistsList = document.getElementById('playlists-list');
      const historyList = document.getElementById('history-list');
  
      // Элементы вкладок
      const tabBtns = document.querySelectorAll('.tab-btn');
      const tabContents = document.querySelectorAll('.tab-content');
  
      // Элементы библиотеки
      const dropArea = document.getElementById('drop-area');
      const fileUpload = document.getElementById('file-upload');
      const folderUpload = document.getElementById('folder-upload');
      const selectFilesBtn = document.getElementById('select-files-btn');
      const importFolderBtn = document.getElementById('import-folder-btn');
      const librarySearch = document.getElementById('library-search');
      const sortBy = document.getElementById('sort-by');
  
      // Элементы плейлистов
      const newPlaylistName = document.getElementById('new-playlist-name');
      const createPlaylistBtn = document.getElementById('create-playlist-btn');
      const exportPlaylistsBtn = document.getElementById('export-playlists-btn');
      const importPlaylistsBtn = document.getElementById('import-playlists-btn');
      const playlistsImportFile = document.getElementById('playlists-import-file');
  
      // Элементы истории
      const clearHistoryBtn = document.getElementById('clear-history-btn');
      const exportHistoryBtn = document.getElementById('export-history-btn');
  
      // Админские элементы
      const adminCodeInput = document.getElementById('admin-code');
      const adminModeBtn = document.getElementById('admin-mode-btn');
  
      // Модальные окна
      const playlistModal = document.getElementById('playlist-modal');
      const metadataModal = document.getElementById('metadata-modal');
      const closeModalBtns = document.querySelectorAll('.close-modal');
      const addToFavoritesBtn = document.getElementById('add-to-favorites');
      const modalPlaylistsList = document.getElementById('modal-playlists-list');
      const newPlaylistModalInput = document.getElementById('new-playlist-modal');
      const createPlaylistModalBtn = document.getElementById('create-playlist-modal-btn');
      const editTitleInput = document.getElementById('edit-title');
      const editArtistInput = document.getElementById('edit-artist');
      const editAlbumInput = document.getElementById('edit-album');
      const editYearInput = document.getElementById('edit-year');
      const editCoverInput = document.getElementById('edit-cover');
      const coverPreview = document.getElementById('cover-preview');
      const saveMetadataBtn = document.getElementById('save-metadata-btn');
      const cancelMetadataBtn = document.getElementById('cancel-metadata-btn');
  
      // Плашка воспроизведения
      const npPlayBtn = document.getElementById('np-play-btn');
      const npNextBtn = document.getElementById('np-next-btn');
      const nowPlayingTitle = document.getElementById('now-playing-title');
      const nowPlayingArtist = document.getElementById('now-playing-artist');
      const nowPlayingCover = document.getElementById('now-playing-cover');
  
      // Состояние приложения
      let songs = []; // Все песни в библиотеке
      let currentPlaylist = []; // Текущий плейлист (индексы песен из songs)
      let currentSongIndex = 0; // Индекс текущей песни в currentPlaylist
      let isPlaying = false;
      let isShuffle = false;
      let isRepeat = false;
      let playlists = {}; // Объект плейлистов {name: [songIndexes]}
      let history = []; // История прослушивания
      let draggedSongIndex = null;
      let currentSongForPlaylist = null;
      let currentSongForMetadata = null;
      let isAdminMode = false;
      const ADMIN_PHRASE = "Admins1234567890";
      let sessionStartTime = Date.now();
  
      // Инициализация приложения
      function init() {
          // Проверяем, есть ли плейлист "Любимые треки"
          if (!playlists['Любимые треки']) {
              playlists['Любимые треки'] = [];
          }
          
          loadData();
          setupEventListeners();
          
          if (currentPlaylist.length > 0) {
              loadSong(currentSongIndex);
          }
          
          // Запускаем таймер времени на сайте
          setInterval(updateSessionTime, 1000);
          
          // Инициализируем Service Worker для уведомлений
          initServiceWorker();
      }
  
      // Загрузка данных из localStorage
      function loadData() {
          const savedSongs = localStorage.getItem('songs');
          if (savedSongs) {
              songs = JSON.parse(savedSongs);
          }
          
          const savedPlaylist = localStorage.getItem('currentPlaylist');
          if (savedPlaylist) {
              currentPlaylist = JSON.parse(savedPlaylist);
          } else if (songs.length > 0) {
              // Если нет сохраненного плейлиста, но есть песни, создаем плейлист со всеми песнями
              currentPlaylist = songs.map((_, index) => index);
          }
          
          const savedPlaylists = localStorage.getItem('playlists');
          if (savedPlaylists) {
              playlists = JSON.parse(savedPlaylists);
          }
          
          const savedHistory = localStorage.getItem('history');
          if (savedHistory) {
              history = JSON.parse(savedHistory);
          }
          
          renderLibrary();
          renderPlaylists();
          renderHistory();
          renderCurrentPlaylist();
      }
  
      // Сохранение данных в localStorage
      function saveData() {
          localStorage.setItem('songs', JSON.stringify(songs));
          localStorage.setItem('currentPlaylist', JSON.stringify(currentPlaylist));
          localStorage.setItem('playlists', JSON.stringify(playlists));
          localStorage.setItem('history', JSON.stringify(history));
      }
  
      // Настройка обработчиков событий
      function setupEventListeners() {
          // Управление плеером
          playBtn.addEventListener('click', togglePlay);
          prevBtn.addEventListener('click', prevSong);
          nextBtn.addEventListener('click', nextSong);
          shuffleBtn.addEventListener('click', toggleShuffle);
          repeatBtn.addEventListener('click', toggleRepeat);
          
          audioPlayer.addEventListener('timeupdate', updateProgressBar);
          audioPlayer.addEventListener('ended', handleSongEnd);
          audioPlayer.addEventListener('loadedmetadata', updateDuration);
          
          progressBarContainer.addEventListener('click', setProgress);
          volumeBar.addEventListener('input', setVolume);
          
          // Управление текущим плейлистом
          document.getElementById('clear-playlist-btn').addEventListener('click', clearCurrentPlaylist);
          document.getElementById('save-playlist-btn').addEventListener('click', saveCurrentPlaylist);
          
          // Библиотека
          dropArea.addEventListener('dragover', handleDragOver);
          dropArea.addEventListener('dragleave', handleDragLeave);
          dropArea.addEventListener('drop', handleDrop);
          selectFilesBtn.addEventListener('click', () => fileUpload.click());
          fileUpload.addEventListener('change', handleFileUpload);
          importFolderBtn.addEventListener('click', () => folderUpload.click());
          folderUpload.addEventListener('change', handleFolderUpload);
          librarySearch.addEventListener('input', filterLibrary);
          sortBy.addEventListener('change', sortLibrary);
          
          // Плейлисты
          createPlaylistBtn.addEventListener('click', createPlaylist);
          exportPlaylistsBtn.addEventListener('click', exportPlaylists);
          importPlaylistsBtn.addEventListener('click', () => playlistsImportFile.click());
          playlistsImportFile.addEventListener('change', importPlaylists);
          
          // История
          clearHistoryBtn.addEventListener('click', clearHistory);
          exportHistoryBtn.addEventListener('click', exportHistory);
          
          // Перетаскивание в плейлисте
          songList.addEventListener('dragstart', handleDragStart);
          songList.addEventListener('dragover', handleDragOverSong);
          songList.addEventListener('drop', handleDropSong);
          songList.addEventListener('dragend', handleDragEnd);
          
          // Админские функции
          adminModeBtn.addEventListener('click', toggleAdminMode);
          
          // Модальные окна
          closeModalBtns.forEach(btn => btn.addEventListener('click', closeAllModals));
          addToFavoritesBtn.addEventListener('click', () => addToPlaylist('Любимые треки', currentSongForPlaylist));
          createPlaylistModalBtn.addEventListener('click', createPlaylistAndAdd);
          
          // Метаданные
          editCoverInput.addEventListener('change', previewCover);
          saveMetadataBtn.addEventListener('click', saveMetadata);
          cancelMetadataBtn.addEventListener('click', closeAllModals);
          
          // Клик вне модального окна
          window.addEventListener('click', (e) => {
              if (e.target.classList.contains('modal')) {
                  closeAllModals();
              }
          });
          
          // Плашка воспроизведения
          npPlayBtn.addEventListener('click', togglePlay);
          npNextBtn.addEventListener('click', nextSong);
          
          // Поиск
          document.getElementById('search-btn').addEventListener('click', searchTracks);
          document.getElementById('search-input').addEventListener('keyup', function(e) {
              if (e.key === 'Enter') searchTracks();
              
              // Проверка на админскую фразу
              if (this.value.includes(ADMIN_PHRASE)) {
                  activateAdminMode();
                  this.value = '';
              }
          });
          
          // Вкладки
          tabBtns.forEach(btn => {
              btn.addEventListener('click', switchTab);
          });
      }
  
      // Инициализация Service Worker
      function initServiceWorker() {
          if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('sw.js')
                  .then(registration => {
                      console.log('ServiceWorker registered');
                  })
                  .catch(err => {
                      console.log('ServiceWorker registration failed: ', err);
                  });
          }
      }
  
      /* ==================== ФУНКЦИИ ПЛЕЕРА ==================== */
  
      // Воспроизведение/пауза
      function togglePlay() {
          if (currentPlaylist.length === 0) {
              showNotification('Нет песен для воспроизведения', 'error');
              return;
          }
          
          if (isPlaying) {
              audioPlayer.pause();
              isPlaying = false;
              playBtn.innerHTML = '<i class="fas fa-play"></i>';
              npPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
          } else {
              audioPlayer.play()
                  .then(() => {
                      isPlaying = true;
                      playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                      npPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
                      
                      // Добавление в историю
                      addToHistory(currentSongIndex);
                      
                      // Уведомление
                      const song = songs[currentPlaylist[currentSongIndex]];
                      showNotification(`Сейчас играет: ${song.title} - ${song.artist}`);
                      
                      // Обновление плашки воспроизведения
                      updateNowPlayingBar();
                  })
                  .catch(error => {
                      showNotification('Ошибка воспроизведения: ' + error.message, 'error');
                  });
          }
          
          updatePlayingClass();
      }
  
      // Загрузка песни
      function loadSong(index) {
          if (currentPlaylist.length === 0) {
              resetPlayer();
              return;
          }
          
          // Проверяем, что индекс в допустимых пределах
          if (index < 0) index = 0;
          if (index >= currentPlaylist.length) index = currentPlaylist.length - 1;
          
          const songIndex = currentPlaylist[index];
          const song = songs[songIndex];
          
          if (!song) {
              showNotification('Ошибка загрузки трека', 'error');
              return;
          }
          
          audioPlayer.src = song.url;
          songTitle.textContent = song.title;
          songArtist.textContent = song.artist;
          coverArt.src = song.cover || 'https://via.placeholder.com/300/333/fff?text=No+Cover';
          
          // Обновляем плашку воспроизведения
          updateNowPlayingBar();
          
          if (isPlaying) {
              audioPlayer.play()
                  .then(() => {
                      addToHistory(index);
                  })
                  .catch(error => {
                      showNotification('Ошибка воспроизведения: ' + error.message, 'error');
                      isPlaying = false;
                      playBtn.innerHTML = '<i class="fas fa-play"></i>';
                      npPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
                  });
          }
          
          updatePlayingClass();
      }
  
      // Обновление плашки воспроизведения
      function updateNowPlayingBar() {
          if (currentPlaylist.length === 0 || currentSongIndex === null) {
              nowPlayingTitle.textContent = 'Название трека';
              nowPlayingArtist.textContent = 'Исполнитель';
              nowPlayingCover.src = 'https://via.placeholder.com/50/333/fff?text=No+Cover';
              return;
          }
          
          const song = songs[currentPlaylist[currentSongIndex]];
          nowPlayingTitle.textContent = song.title;
          nowPlayingArtist.textContent = song.artist;
          nowPlayingCover.src = song.cover || 'https://via.placeholder.com/50/333/fff?text=No+Cover';
          
          // Обновляем иконку кнопки play/pause
          npPlayBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
      }
  
      // Обновление класса playing для текущей песни
      function updatePlayingClass() {
          const listItems = songList.querySelectorAll('li');
          listItems.forEach((item, index) => {
              if (index === currentSongIndex && isPlaying) {
                  item.classList.add('playing');
              } else {
                  item.classList.remove('playing');
              }
          });
      }
  
      // Следующая песня
      function nextSong() {
          if (currentPlaylist.length === 0) return;
          
          if (isShuffle) {
              currentSongIndex = getRandomSongIndex();
          } else {
              currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
          }
          
          loadSong(currentSongIndex);
      }
  
      // Предыдущая песня
      function prevSong() {
          if (currentPlaylist.length === 0) return;
          
          if (audioPlayer.currentTime > 3) {
              // Если песня играет больше 3 секунд, просто перематываем в начало
              audioPlayer.currentTime = 0;
              return;
          }
          
          if (isShuffle) {
              currentSongIndex = getRandomSongIndex();
          } else {
              currentSongIndex = (currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
          }
          
          loadSong(currentSongIndex);
      }
  
      // Обработка окончания песни
      function handleSongEnd() {
          if (isRepeat) {
              audioPlayer.currentTime = 0;
              audioPlayer.play();
          } else {
              nextSong();
          }
      }
  
      // Переключение режима повтора
      function toggleRepeat() {
          isRepeat = !isRepeat;
          repeatBtn.style.color = isRepeat ? 'var(--primary-color)' : 'var(--text-color)';
          showNotification(isRepeat ? 'Режим повтора включен' : 'Режим повтора выключен');
      }
  
      // Переключение режима случайного воспроизведения
      function toggleShuffle() {
          isShuffle = !isShuffle;
          shuffleBtn.style.color = isShuffle ? 'var(--primary-color)' : 'var(--text-color)';
          showNotification(isShuffle ? 'Случайное воспроизведение включено' : 'Случайное воспроизведение выключено');
      }
  
      // Получение случайного индекса песни
      function getRandomSongIndex() {
          if (currentPlaylist.length <= 1) return 0;
          
          let newIndex;
          do {
              newIndex = Math.floor(Math.random() * currentPlaylist.length);
          } while (newIndex === currentSongIndex);
          
          return newIndex;
      }
  
      // Обновление прогресс-бара
      function updateProgressBar() {
          const { currentTime, duration } = audioPlayer;
          const progressPercent = (currentTime / duration) * 100;
          progressBar.style.width = `${progressPercent}%`;
          currentTimeEl.textContent = formatTime(currentTime);
      }
  
      // Обновление длительности
      function updateDuration() {
          durationEl.textContent = formatTime(audioPlayer.duration);
      }
  
      // Форматирование времени
      function formatTime(seconds) {
          if (isNaN(seconds)) return "0:00";
          
          const minutes = Math.floor(seconds / 60);
          const secs = Math.floor(seconds % 60);
          return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
      }
  
      // Установка прогресса
      function setProgress(e) {
          const width = this.clientWidth;
          const clickX = e.offsetX;
          const duration = audioPlayer.duration;
          audioPlayer.currentTime = (clickX / width) * duration;
      }
  
      // Установка громкости
      function setVolume() {
          audioPlayer.volume = this.value;
      }
  
      // Воспроизведение песни по индексу
      function playSong(index) {
          if (index === currentSongIndex && isPlaying) {
              togglePlay();
          } else {
              currentSongIndex = index;
              loadSong(currentSongIndex);
              if (!isPlaying) {
                  togglePlay();
              }
          }
      }
  
      // Сброс плеера
      function resetPlayer() {
          audioPlayer.src = '';
          songTitle.textContent = 'Название трека';
          songArtist.textContent = 'Исполнитель';
          coverArt.src = 'https://via.placeholder.com/300/333/fff?text=No+Cover';
          isPlaying = false;
          playBtn.innerHTML = '<i class="fas fa-play"></i>';
          npPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
          currentSongIndex = 0;
          progressBar.style.width = '0%';
          currentTimeEl.textContent = '0:00';
          durationEl.textContent = '0:00';
          updateNowPlayingBar();
      }
  
      /* ==================== ТЕКУЩИЙ ПЛЕЙЛИСТ ==================== */
  
      // Отрисовка текущего плейлиста
      function renderCurrentPlaylist() {
          songList.innerHTML = '';
          
          if (currentPlaylist.length === 0) {
              songList.innerHTML = '<li class="empty-message">Плейлист пуст. Добавьте треки из библиотеки.</li>';
              return;
          }
          
          currentPlaylist.forEach((songIndex, index) => {
              const song = songs[songIndex];
              if (!song) return;
              
              const li = document.createElement('li');
              li.draggable = true;
              li.dataset.index = index;
              
              if (index === currentSongIndex && isPlaying) {
                  li.classList.add('playing');
              }
              
              // Проверяем, есть ли трек в "Любимых"
              const isLiked = playlists['Любимые треки']?.includes(songIndex);
              
              li.innerHTML = `
                  <div class="song-info-small">
                      <div class="song-title">${song.title}</div>
                      <div class="song-artist">${song.artist}</div>
                  </div>
                  <div class="song-actions">
                      <button class="like-btn ${isLiked ? 'liked' : ''}" data-index="${index}" title="${isLiked ? 'Убрать из любимых' : 'Добавить в любимые'}">
                          <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                      </button>
                      <button class="add-to-playlist-btn" data-index="${index}" title="Добавить в плейлист">
                          <i class="fas fa-plus"></i>
                      </button>
                      <button class="remove-btn" data-index="${index}" title="Удалить из плейлиста">
                          <i class="fas fa-times"></i>
                      </button>
                  </div>
              `;
              
              li.addEventListener('click', (e) => {
                  if (!e.target.closest('.song-actions')) {
                      playSong(index);
                  }
              });
              
              // Обработчики для кнопок
              li.querySelector('.like-btn').addEventListener('click', (e) => {
                  e.stopPropagation();
                  toggleFavorite(songIndex, index);
              });
              
              li.querySelector('.add-to-playlist-btn').addEventListener('click', (e) => {
                  e.stopPropagation();
                  showPlaylistModal(songIndex);
              });
              
              li.querySelector('.remove-btn').addEventListener('click', (e) => {
                  e.stopPropagation();
                  removeFromCurrentPlaylist(index);
              });
              
              songList.appendChild(li);
          });
      }
  
      // Добавление/удаление из любимых
      function toggleFavorite(songIndex, playlistIndex) {
          const favorites = playlists['Любимые треки'] || [];
          const isLiked = favorites.includes(songIndex);
          
          if (isLiked) {
              playlists['Любимые треки'] = favorites.filter(i => i !== songIndex);
              showNotification('Трек удален из любимых');
          } else {
              playlists['Любимые треки'].push(songIndex);
              showNotification('Трек добавлен в любимые');
          }
          
          saveData();
          
          // Обновляем кнопку в текущем плейлисте
          const likeBtn = songList.querySelector(`li[data-index="${playlistIndex}"] .like-btn`);
          if (likeBtn) {
              likeBtn.classList.toggle('liked');
              likeBtn.innerHTML = `<i class="${!isLiked ? 'fas' : 'far'} fa-heart"></i>`;
              likeBtn.title = !isLiked ? 'Убрать из любимых' : 'Добавить в любимые';
          }
          
          // Обновляем кнопку в библиотеке
          const libraryLikeBtn = libraryList.querySelector(`li[data-index="${songIndex}"] .like-btn`);
          if (libraryLikeBtn) {
              libraryLikeBtn.classList.toggle('liked');
              libraryLikeBtn.innerHTML = `<i class="${!isLiked ? 'fas' : 'far'} fa-heart"></i>`;
              libraryLikeBtn.title = !isLiked ? 'Убрать из любимых' : 'Добавить в любимые';
          }
      }
  
      // Удаление из текущего плейлиста
      function removeFromCurrentPlaylist(index) {
          if (currentPlaylist.length === 0) return;
          
          // Если удаляем текущую песню
          if (index === currentSongIndex) {
              if (isPlaying) {
                  audioPlayer.pause();
                  isPlaying = false;
                  playBtn.innerHTML = '<i class="fas fa-play"></i>';
                  npPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
              }
              
              // Если это последняя песня в плейлисте
              if (currentPlaylist.length === 1) {
                  currentPlaylist.splice(index, 1);
                  resetPlayer();
              } else {
                  // Если удаляем не последнюю песню
                  currentPlaylist.splice(index, 1);
                  if (currentSongIndex >= currentPlaylist.length) {
                      currentSongIndex = currentPlaylist.length - 1;
                  }
                  loadSong(currentSongIndex);
              }
          } else {
              // Если удаляем не текущую песню
              currentPlaylist.splice(index, 1);
              if (index < currentSongIndex) {
                  currentSongIndex--;
              }
          }
          
          saveData();
          renderCurrentPlaylist();
          showNotification('Трек удален из плейлиста');
      }
  
      // Очистка текущего плейлиста
      function clearCurrentPlaylist() {
          if (currentPlaylist.length === 0) return;
          
          if (confirm('Очистить текущий плейлист?')) {
              currentPlaylist = [];
              currentSongIndex = 0;
              saveData();
              resetPlayer();
              renderCurrentPlaylist();
              showNotification('Плейлист очищен');
          }
      }
  
      // Сохранение текущего плейлиста
      function saveCurrentPlaylist() {
          if (currentPlaylist.length === 0) {
              showNotification('Плейлист пуст', 'error');
              return;
          }
          
          const name = prompt('Введите название плейлиста:');
          if (!name) return;
          
          if (playlists[name]) {
              if (!confirm(`Плейлист "${name}" уже существует. Заменить?`)) return;
          }
          
          playlists[name] = [...currentPlaylist];
          saveData();
          renderPlaylists();
          showNotification(`Плейлист "${name}" сохранен`);
      }
  
      /* ==================== БИБЛИОТЕКА ==================== */
  
      // Отрисовка библиотеки
      function renderLibrary() {
          libraryList.innerHTML = '';
          
          if (songs.length === 0) {
              libraryList.innerHTML = '<li class="empty-message">Библиотека пуста. Добавьте треки.</li>';
              return;
          }
          
          songs.forEach((song, index) => {
              const li = document.createElement('li');
              li.dataset.index = index;
              
              // Проверяем, есть ли трек в "Любимых"
              const isLiked = playlists['Любимые треки']?.includes(index);
              
              li.innerHTML = `
                  <div class="library-song-info">
                      <img src="${song.cover || 'https://via.placeholder.com/40/333/fff?text=No+Cover'}" alt="Обложка" class="library-song-cover">
                      <div class="library-song-details">
                          <div class="library-song-title">${song.title}</div>
                          <div class="library-song-artist">${song.artist}</div>
                      </div>
                  </div>
                  <div class="library-song-actions">
                      <button class="like-btn ${isLiked ? 'liked' : ''}" data-index="${index}" title="${isLiked ? 'Убрать из любимых' : 'Добавить в любимые'}">
                          <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                      </button>
                      <button class="add-to-playlist-btn" data-index="${index}" title="Добавить в плейлист">
                          <i class="fas fa-plus"></i>
                      </button>
                      <button class="play-btn" data-index="${index}" title="Воспроизвести">
                          <i class="fas fa-play"></i>
                      </button>
                      <button class="edit-btn admin-only" data-index="${index}" title="Редактировать">
                          <i class="fas fa-edit"></i>
                      </button>
                      <button class="delete-btn admin-only" data-index="${index}" title="Удалить">
                          <i class="fas fa-trash"></i>
                      </button>
                  </div>
              `;
              
              // Обработчики для кнопок
              li.querySelector('.like-btn').addEventListener('click', (e) => {
                  e.stopPropagation();
                  toggleFavorite(index);
              });
              
              li.querySelector('.add-to-playlist-btn').addEventListener('click', (e) => {
                  e.stopPropagation();
                  showPlaylistModal(index);
              });
              
              li.querySelector('.play-btn').addEventListener('click', (e) => {
                  e.stopPropagation();
                  playFromLibrary(index);
              });
              
              li.querySelector('.edit-btn')?.addEventListener('click', (e) => {
                  e.stopPropagation();
                  showMetadataModal(index);
              });
              
              li.querySelector('.delete-btn')?.addEventListener('click', (e) => {
                  e.stopPropagation();
                  deleteSong(index);
              });
              
              libraryList.appendChild(li);
          });
      }
  
      // Воспроизведение из библиотеки
      function playFromLibrary(index) {
          // Проверяем, есть ли уже эта песня в текущем плейлисте
          const existingIndex = currentPlaylist.findIndex(i => i === index);
          
          if (existingIndex >= 0) {
              // Если песня уже в плейлисте, просто переключаемся на нее
              currentSongIndex = existingIndex;
          } else {
              // Если песни нет в плейлисте, добавляем ее и делаем текущей
              currentPlaylist.push(index);
              currentSongIndex = currentPlaylist.length - 1;
              saveData();
              renderCurrentPlaylist();
          }
          
          loadSong(currentSongIndex);
          if (!isPlaying) {
              togglePlay();
          }
          
          // Переключаемся на вкладку плеера
          document.querySelector('.tab-btn[data-tab="player"]').click();
      }
  
      // Обработка перетаскивания файлов
      function handleDragOver(e) {
          e.preventDefault();
          e.stopPropagation();
          dropArea.classList.add('highlight');
      }
  
      function handleDragLeave(e) {
          e.preventDefault();
          e.stopPropagation();
          dropArea.classList.remove('highlight');
      }
  
      function handleDrop(e) {
          e.preventDefault();
          e.stopPropagation();
          dropArea.classList.remove('highlight');
          
          const files = e.dataTransfer.files;
          handleFiles(files);
      }
  
      function handleFileUpload(e) {
          const files = e.target.files;
          handleFiles(files);
          e.target.value = ''; // Сбрасываем значение input
      }
  
      function handleFolderUpload(e) {
          const files = e.target.files;
          if (files.length > 0) {
              handleFiles(files, true); // true - это папка
              e.target.value = ''; // Сбрасываем значение input
          }
      }
  
      // Обработка загруженных файлов
      function handleFiles(files, isFolder = false) {
          if (!files || files.length === 0) return;
          
          let filesProcessed = 0;
          const totalFiles = files.length;
          
          showNotification(`Обработка ${totalFiles} файлов...`);
          
          // Создаем временный массив для новых песен
          const newSongs = [];
          
          Array.from(files).forEach((file, i) => {
              if (!file.type.startsWith('audio/')) {
                  filesProcessed++;
                  if (filesProcessed === totalFiles) {
                      finalizeImport(newSongs);
                  }
                  return;
              }
              
              const reader = new FileReader();
              
              reader.onload = function(e) {
                  const url = URL.createObjectURL(file);
                  const fileName = file.name.replace(/\.[^/.]+$/, "");
                  
                  // Пытаемся извлечь метаданные из имени файла
                  let title, artist;
                  if (fileName.includes(' - ')) {
                      [artist, title] = fileName.split(' - ');
                  } else {
                      title = fileName;
                      artist = 'Неизвестный исполнитель';
                  }
                  
                  const song = {
                      title: title.substring(0, 100),
                      artist: artist.substring(0, 100),
                      album: '',
                      year: '',
                      url: url,
                      cover: 'https://via.placeholder.com/300/333/fff?text=No+Cover',
                      file: file.name,
                      dateAdded: new Date().toISOString()
                  };
                  
                  newSongs.push(song);
                  filesProcessed++;
                  
                  if (filesProcessed === totalFiles) {
                      finalizeImport(newSongs);
                  }
              };
              
              reader.onerror = function() {
                  filesProcessed++;
                  if (filesProcessed === totalFiles) {
                      finalizeImport(newSongs);
                  }
              };
              
              reader.readAsArrayBuffer(file);
          });
      }
  
      // Завершение импорта файлов
      function finalizeImport(newSongs) {
          if (newSongs.length === 0) {
              showNotification('Не найдено аудиофайлов', 'error');
              return;
          }
          
          // Добавляем новые песни в библиотеку
          songs.push(...newSongs);
          saveData();
          
          // Если текущий плейлист пуст, добавляем все новые песни в него
          if (currentPlaylist.length === 0) {
              newSongs.forEach((_, index) => {
                  currentPlaylist.push(songs.length - newSongs.length + index);
              });
              saveData();
          }
          
          renderLibrary();
          renderCurrentPlaylist();
          
          showNotification(`Добавлено ${newSongs.length} треков`, 'success');
          
          // Переключаемся на вкладку библиотеки
          document.querySelector('.tab-btn[data-tab="library"]').click();
      }
  
      // Фильтрация библиотеки
      function filterLibrary() {
          const searchTerm = librarySearch.value.toLowerCase();
          const items = libraryList.querySelectorAll('li');
          
          items.forEach(item => {
              const title = item.querySelector('.library-song-title').textContent.toLowerCase();
              const artist = item.querySelector('.library-song-artist').textContent.toLowerCase();
              
              if (title.includes(searchTerm) || artist.includes(searchTerm)) {
                  item.style.display = 'flex';
              } else {
                  item.style.display = 'none';
              }
          });
      }
  
      // Сортировка библиотеки
      function sortLibrary() {
          const sortByValue = sortBy.value;
          
          switch (sortByValue) {
              case 'title':
                  songs.sort((a, b) => a.title.localeCompare(b.title));
                  break;
              case 'artist':
                  songs.sort((a, b) => a.artist.localeCompare(b.artist));
                  break;
              case 'date':
                  songs.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                  break;
          }
          
          saveData();
          renderLibrary();
      }
  
      // Удаление песни
      function deleteSong(index) {
          if (!isAdminMode) return;
          
          if (confirm('Удалить этот трек из библиотеки?')) {
              // Удаляем трек из всех плейлистов
              for (const playlist in playlists) {
                  playlists[playlist] = playlists[playlist]
                      .filter(i => i !== index)
                      .map(i => i > index ? i - 1 : i);
              }
              
              // Удаляем трек из текущего плейлиста
              currentPlaylist = currentPlaylist
                  .filter(i => i !== index)
                  .map(i => i > index ? i - 1 : i);
              
              // Обновляем текущий индекс
              if (currentSongIndex !== null) {
                  const songIndexInPlaylist = currentPlaylist.indexOf(index);
                  if (songIndexInPlaylist >= 0) {
                      if (songIndexInPlaylist === currentSongIndex) {
                          // Если удаляем текущую песню
                          if (isPlaying) {
                              audioPlayer.pause();
                              isPlaying = false;
                              playBtn.innerHTML = '<i class="fas fa-play"></i>';
                              npPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
                          }
                          
                          if (currentPlaylist.length === 0) {
                              currentSongIndex = 0;
                              resetPlayer();
                          } else {
                              currentSongIndex = songIndexInPlaylist < currentPlaylist.length ? songIndexInPlaylist : currentPlaylist.length - 1;
                              loadSong(currentSongIndex);
                          }
                      } else if (songIndexInPlaylist < currentSongIndex) {
                          currentSongIndex--;
                      }
                  }
              }
              
              // Удаляем сам трек
              songs.splice(index, 1);
              saveData();
              
              renderLibrary();
              renderCurrentPlaylist();
              renderPlaylists();
              
              showNotification('Трек удален', 'success');
          }
      }
  
      /* ==================== ПЛЕЙЛИСТЫ ==================== */
  
      // Отрисовка плейлистов
      function renderPlaylists() {
          playlistsList.innerHTML = '';
          
          if (Object.keys(playlists).length === 0) {
              playlistsList.innerHTML = '<li class="empty-message">Нет плейлистов</li>';
              return;
          }
          
          for (const [name, songIndexes] of Object.entries(playlists)) {
              const li = document.createElement('li');
              
              li.innerHTML = `
                  <div class="playlist-info">
                      <div class="playlist-name">${name}</div>
                      <div class="playlist-count">${songIndexes.length} треков</div>
                  </div>
                  <div class="playlist-buttons">
                      <button class="play-btn" data-name="${name}" title="Воспроизвести">
                          <i class="fas fa-play"></i>
                      </button>
                      <button class="edit-btn admin-only" data-name="${name}" title="Редактировать">
                          <i class="fas fa-edit"></i>
                      </button>
                      <button class="delete-btn admin-only" data-name="${name}" title="Удалить">
                          <i class="fas fa-trash"></i>
                      </button>
                  </div>
              `;
              
              // Обработчики для кнопок
              li.querySelector('.play-btn').addEventListener('click', (e) => {
                  e.stopPropagation();
                  playPlaylist(name);
              });
              
              li.querySelector('.edit-btn')?.addEventListener('click', (e) => {
                  e.stopPropagation();
                  editPlaylist(name);
              });
              
              li.querySelector('.delete-btn')?.addEventListener('click', (e) => {
                  e.stopPropagation();
                  deletePlaylist(name);
              });
              
              playlistsList.appendChild(li);
          }
      }
  
      // Воспроизведение плейлиста
      function playPlaylist(name) {
          const songIndexes = playlists[name];
          if (!songIndexes || songIndexes.length === 0) {
              showNotification('Плейлист пуст', 'error');
              return;
          }
          
          // Устанавливаем новый текущий плейлист
          currentPlaylist = [...songIndexes];
          currentSongIndex = 0;
          saveData();
          
          // Загружаем и воспроизводим первую песню
          loadSong(currentSongIndex);
          if (!isPlaying) {
              togglePlay();
          }
          
          renderCurrentPlaylist();
          
          // Переключаемся на вкладку плеера
          document.querySelector('.tab-btn[data-tab="player"]').click();
          
          showNotification(`Плейлист "${name}" загружен`);
      }
  
      // Создание плейлиста
      function createPlaylist() {
          const name = newPlaylistName.value.trim();
          if (!name) {
              showNotification('Введите название плейлиста', 'error');
              return;
          }
          
          if (playlists[name]) {
              showNotification('Плейлист с таким именем уже существует', 'error');
              return;
          }
          
          playlists[name] = [];
          newPlaylistName.value = '';
          saveData();
          renderPlaylists();
          
          showNotification(`Плейлист "${name}" создан`, 'success');
      }
  
      // Редактирование плейлиста
      function editPlaylist(oldName) {
          const newName = prompt('Введите новое название плейлиста:', oldName);
          if (!newName || newName === oldName) return;
          
          if (playlists[newName]) {
              showNotification('Плейлист с таким именем уже существует', 'error');
              return;
          }
          
          playlists[newName] = playlists[oldName];
          delete playlists[oldName];
          saveData();
          renderPlaylists();
          
          showNotification(`Плейлист переименован в "${newName}"`, 'success');
      }
  
      // Удаление плейлиста
      function deletePlaylist(name) {
          if (!isAdminMode) return;
          
          if (!confirm(`Удалить плейлист "${name}"?`)) return;
          
          delete playlists[name];
          saveData();
          renderPlaylists();
          
          showNotification(`Плейлист "${name}" удален`, 'success');
      }
  
      // Экспорт плейлистов
      function exportPlaylists() {
          const data = JSON.stringify(playlists, null, 2);
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.href = url;
          a.download = 'playlists.json';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          setTimeout(() => URL.revokeObjectURL(url), 100);
          
          showNotification('Плейлисты экспортированы', 'success');
      }
  
      // Импорт плейлистов
      function importPlaylists(e) {
          const file = e.target.files[0];
          if (!file) return;
          
          const reader = new FileReader();
          
          reader.onload = function(e) {
              try {
                  const importedPlaylists = JSON.parse(e.target.result);
                  
                  if (typeof importedPlaylists !== 'object' || importedPlaylists === null) {
                      throw new Error('Неверный формат файла');
                  }
                  
                  // Проверяем, есть ли конфликты имен
                  const conflictingNames = Object.keys(importedPlaylists).filter(name => playlists[name]);
                  
                  if (conflictingNames.length > 0) {
                      if (!confirm(`Плейлисты с именами: ${conflictingNames.join(', ')} уже существуют. Заменить?`)) {
                          return;
                      }
                  }
                  
                  // Добавляем или заменяем плейлисты
                  Object.assign(playlists, importedPlaylists);
                  saveData();
                  renderPlaylists();
                  
                  showNotification(`Импортировано ${Object.keys(importedPlaylists).length} плейлистов`, 'success');
              } catch (error) {
                  showNotification('Ошибка при импорте плейлистов: ' + error.message, 'error');
              }
          };
          
          reader.onerror = function() {
              showNotification('Ошибка при чтении файла', 'error');
          };
          
          reader.readAsText(file);
          e.target.value = ''; // Сбрасываем значение input
      }
  
      /* ==================== ИСТОРИЯ ==================== */
  
      // Отрисовка истории
      function renderHistory() {
          historyList.innerHTML = '';
          
          if (history.length === 0) {
              historyList.innerHTML = '<li class="empty-message">История прослушивания пуста</li>';
              return;
          }
          
          history.forEach((item, i) => {
              const songIndex = item.songIndex;
              const song = songs[songIndex];
              if (!song) return;
              
              const date = new Date(item.timestamp);
              const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateString = date.toLocaleDateString();
              
              const li = document.createElement('li');
              li.innerHTML = `
                  <div class="history-item-info">
                      <div class="history-time">${dateString} ${timeString}</div>
                      <div class="history-song">${song.title} - ${song.artist}</div>
                  </div>
                  <button class="history-play-btn" data-index="${songIndex}" title="Воспроизвести">
                      <i class="fas fa-play"></i>
                  </button>
              `;
              
              li.querySelector('.history-play-btn').addEventListener('click', (e) => {
                  e.stopPropagation();
                  playFromHistory(songIndex);
              });
              
              historyList.appendChild(li);
          });
      }
  
      // Воспроизведение из истории
      function playFromHistory(songIndex) {
          // Проверяем, есть ли песня в текущем плейлисте
          const existingIndex = currentPlaylist.findIndex(i => i === songIndex);
          
          if (existingIndex >= 0) {
              // Если песня уже в плейлисте, просто переключаемся на нее
              currentSongIndex = existingIndex;
          } else {
              // Если песни нет в плейлисте, добавляем ее и делаем текущей
              currentPlaylist.push(songIndex);
              currentSongIndex = currentPlaylist.length - 1;
              saveData();
              renderCurrentPlaylist();
          }
          
          loadSong(currentSongIndex);
          if (!isPlaying) {
              togglePlay();
          }
          
          // Переключаемся на вкладку плеера
          document.querySelector('.tab-btn[data-tab="player"]').click();
      }
  
      // Добавление в историю
      function addToHistory(index) {
          if (index === null || index === undefined || !currentPlaylist[index]) return;
          
          const songIndex = currentPlaylist[index];
          const historyItem = {
              songIndex: songIndex,
              timestamp: new Date().toISOString()
          };
          
          // Удаляем старые записи об этой песне, чтобы избежать дублирования
          history = history.filter(item => item.songIndex !== songIndex);
          
          // Добавляем новую запись в начало
          history.unshift(historyItem);
          
          // Ограничиваем историю 100 записями
          if (history.length > 100) {
              history.pop();
          }
          
          saveData();
          
          // Обновляем отображение истории, если открыта соответствующая вкладка
          if (document.querySelector('.tab-btn[data-tab="history"]').classList.contains('active')) {
              renderHistory();
          }
      }
  
      // Очистка истории
      function clearHistory() {
          if (history.length === 0) return;
          
          if (confirm('Очистить историю прослушивания?')) {
              history = [];
              saveData();
              renderHistory();
              
              showNotification('История очищена', 'success');
          }
      }
  
      // Экспорт истории
      function exportHistory() {
          if (history.length === 0) {
              showNotification('История пуста', 'error');
              return;
          }
          
          // Формируем данные для экспорта
          const exportData = history.map(item => {
              const song = songs[item.songIndex];
              return {
                  title: song?.title || 'Неизвестный трек',
                  artist: song?.artist || 'Неизвестный исполнитель',
                  timestamp: item.timestamp
              };
          });
          
          const data = JSON.stringify(exportData, null, 2);
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.href = url;
          a.download = 'history.json';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          setTimeout(() => URL.revokeObjectURL(url), 100);
          
          showNotification('История экспортирована', 'success');
      }
  
      /* ==================== МОДАЛЬНЫЕ ОКНА ==================== */
  
      // Показать модальное окно для добавления в плейлист
      function showPlaylistModal(index) {
          currentSongForPlaylist = index;
          playlistModal.style.display = 'block';
          renderModalPlaylists();
      }
  
      // Показать модальное окно редактирования метаданных
      function showMetadataModal(index) {
          if (!isAdminMode) return;
          
          currentSongForMetadata = index;
          const song = songs[index];
          
          editTitleInput.value = song.title;
          editArtistInput.value = song.artist;
          editAlbumInput.value = song.album || '';
          editYearInput.value = song.year || '';
          
          // Очищаем превью обложки
          coverPreview.innerHTML = '';
          if (song.cover && !song.cover.startsWith('https://via.placeholder.com')) {
              const img = document.createElement('img');
              img.src = song.cover;
              coverPreview.appendChild(img);
          }
          
          metadataModal.style.display = 'block';
      }
  
      // Закрыть все модальные окна
      function closeAllModals() {
          playlistModal.style.display = 'none';
          metadataModal.style.display = 'none';
          currentSongForPlaylist = null;
          currentSongForMetadata = null;
      }
  
      // Отрисовка плейлистов в модальном окне
      function renderModalPlaylists() {
          modalPlaylistsList.innerHTML = '';
          
          for (const name in playlists) {
              if (name === 'Любимые треки') continue;
              
              const li = document.createElement('li');
              li.textContent = `${name} (${playlists[name].length})`;
              li.addEventListener('click', () => {
                  addToPlaylist(name, currentSongForPlaylist);
                  closeAllModals();
              });
              modalPlaylistsList.appendChild(li);
          }
      }
  
      // Добавление трека в плейлист
      function addToPlaylist(playlistName, songIndex) {
          if (!playlists[playlistName].includes(songIndex)) {
              playlists[playlistName].push(songIndex);
              saveData();
              
              // Обновляем отображение плейлистов, если открыта соответствующая вкладка
              if (document.querySelector('.tab-btn[data-tab="playlists"]').classList.contains('active')) {
                  renderPlaylists();
              }
              
              showNotification(`Трек добавлен в плейлист "${playlistName}"`, 'success');
          } else {
              showNotification(`Этот трек уже в плейлисте "${playlistName}"`);
          }
      }
  
      // Создание плейлиста и добавление трека
      function createPlaylistAndAdd() {
          const name = newPlaylistModalInput.value.trim();
          if (!name) {
              showNotification('Введите название плейлиста', 'error');
              return;
          }
          
          if (playlists[name]) {
              showNotification('Плейлист с таким именем уже существует', 'error');
              return;
          }
          
          playlists[name] = [currentSongForPlaylist];
          newPlaylistModalInput.value = '';
          saveData();
          
          renderPlaylists();
          renderModalPlaylists();
          
          closeAllModals();
          
          showNotification(`Создан плейлист "${name}" и добавлен текущий трек`, 'success');
      }
  
      // Превью обложки
      function previewCover(e) {
          const file = e.target.files[0];
          if (!file || !file.type.startsWith('image/')) return;
          
          const reader = new FileReader();
          
          reader.onload = function(e) {
              coverPreview.innerHTML = '';
              const img = document.createElement('img');
              img.src = e.target.result;
              coverPreview.appendChild(img);
          };
          
          reader.readAsDataURL(file);
      }
  
      // Сохранение метаданных
      function saveMetadata() {
          if (currentSongForMetadata === null) return;
          
          const song = songs[currentSongForMetadata];
          
          song.title = editTitleInput.value.trim() || song.title;
          song.artist = editArtistInput.value.trim() || song.artist;
          song.album = editAlbumInput.value.trim();
          song.year = editYearInput.value.trim();
          
          // Обновляем обложку, если выбрана новая
          const file = editCoverInput.files[0];
          if (file && file.type.startsWith('image/')) {
              const reader = new FileReader();
              
              reader.onload = function(e) {
                  song.cover = e.target.result;
                  finalizeMetadataUpdate();
              };
              
              reader.readAsDataURL(file);
          } else {
              finalizeMetadataUpdate();
          }
      }
  
      // Завершение обновления метаданных
      function finalizeMetadataUpdate() {
          saveData();
          
          // Обновляем отображение во всех разделах
          renderLibrary();
          renderCurrentPlaylist();
          renderPlaylists();
          renderHistory();
          
          // Если это текущая песня, обновляем информацию в плеере
          if (currentSongIndex !== null && currentPlaylist[currentSongIndex] === currentSongForMetadata) {
              const song = songs[currentSongForMetadata];
              songTitle.textContent = song.title;
              songArtist.textContent = song.artist;
              coverArt.src = song.cover || 'https://via.placeholder.com/300/333/fff?text=No+Cover';
              updateNowPlayingBar();
          }
          
          closeAllModals();
          showNotification('Метаданные сохранены', 'success');
      }
  
      /* ==================== ПЕРЕТАСКИВАНИЕ ==================== */
  
      function handleDragStart(e) {
          draggedSongIndex = parseInt(e.target.closest('li').dataset.index);
          e.dataTransfer.effectAllowed = 'move';
          e.target.style.opacity = '0.4';
      }
  
      function handleDragOverSong(e) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          
          const li = e.target.closest('li');
          if (li && li !== draggedSongIndex) {
              const rect = li.getBoundingClientRect();
              const midpoint = rect.top + rect.height / 2;
              
              if (e.clientY < midpoint) {
                  li.style.borderTop = '2px solid var(--primary-color)';
                  li.style.borderBottom = 'none';
              } else {
                  li.style.borderBottom = '2px solid var(--primary-color)';
                  li.style.borderTop = 'none';
              }
          }
      }
  
      function handleDropSong(e) {
          e.preventDefault();
          
          const targetLi = e.target.closest('li');
          if (!targetLi) return;
          
          const targetIndex = parseInt(targetLi.dataset.index);
          if (draggedSongIndex === targetIndex) return;
          
          const rect = targetLi.getBoundingClientRect();
          const midpoint = rect.top + rect.height / 2;
          const newIndex = e.clientY < midpoint ? targetIndex : targetIndex + 1;
          
          // Перемещаем песню
          const movedSong = currentPlaylist.splice(draggedSongIndex, 1)[0];
          currentPlaylist.splice(newIndex > draggedSongIndex ? newIndex - 1 : newIndex, 0, movedSong);
          
          // Обновляем текущий индекс, если нужно
          if (currentSongIndex === draggedSongIndex) {
              currentSongIndex = newIndex > draggedSongIndex ? newIndex - 1 : newIndex;
          } else if (currentSongIndex >= newIndex && currentSongIndex < draggedSongIndex) {
              currentSongIndex++;
          } else if (currentSongIndex <= newIndex && currentSongIndex > draggedSongIndex) {
              currentSongIndex--;
          }
          
          saveData();
          renderCurrentPlaylist();
      }
  
      function handleDragEnd(e) {
          // Сбрасываем стили
          document.querySelectorAll('#song-list li').forEach(li => {
              li.style.borderTop = 'none';
              li.style.borderBottom = 'none';
              li.style.opacity = '1';
          });
      }
  
      /* ==================== АДМИНСКИЕ ФУНКЦИИ ==================== */
  
      // Активация режима администратора
      function activateAdminMode() {
          isAdminMode = true;
          document.body.classList.add('admin-mode');
          document.querySelector('.admin-tools').classList.add('active');
          adminModeBtn.textContent = 'Обычный режим';
          
          // Показываем значок администратора
          const badge = document.createElement('div');
          badge.className = 'admin-badge';
          badge.innerHTML = '<i class="fas fa-user-shield"></i> Администратор';
          document.body.appendChild(badge);
          
          showNotification('Режим администратора активирован', 'success');
      }
  
      // Переключение режима администратора
      function toggleAdminMode() {
          if (adminCodeInput.value === ADMIN_PHRASE) {
              isAdminMode = !isAdminMode;
              document.body.classList.toggle('admin-mode', isAdminMode);
              document.querySelector('.admin-tools').classList.toggle('active', isAdminMode);
              adminModeBtn.textContent = isAdminMode ? 'Обычный режим' : 'Режим админа';
              adminCodeInput.value = '';
              
              if (isAdminMode) {
                  // Показываем значок администратора, если его нет
                  if (!document.querySelector('.admin-badge')) {
                      const badge = document.createElement('div');
                      badge.className = 'admin-badge';
                      badge.innerHTML = '<i class="fas fa-user-shield"></i> Администратор';
                      document.body.appendChild(badge);
                  }
                  
                  showNotification('Режим администратора активирован', 'success');
              } else {
                  showNotification('Режим администратора деактивирован', 'success');
              }
          } else {
              showNotification('Неверный код администратора!', 'error');
          }
      }
  
      /* ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==================== */
  
      // Показать уведомление
      function showNotification(message, type = '') {
          // Удаляем предыдущее уведомление, если оно есть
          const existingNotification = document.querySelector('.notification');
          if (existingNotification) {
              existingNotification.remove();
          }
          
          const notification = document.createElement('div');
          notification.className = `notification ${type}`;
          notification.innerHTML = `
              <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
              ${message}
          `;
          
          document.body.appendChild(notification);
          
          setTimeout(() => {
              notification.classList.add('fade-out');
              setTimeout(() => notification.remove(), 500);
          }, 3000);
      }
  
      // Обновление времени сессии
      function updateSessionTime() {
          const now = Date.now();
          const diff = now - sessionStartTime;
          const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
          const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
          
          document.getElementById('time-spent').textContent = `${hours}:${minutes}:${seconds}`;
      }
  
      // Переключение вкладок
      function switchTab(e) {
          const tabId = this.getAttribute('data-tab');
          
          // Удаляем активный класс у всех кнопок и контента
          tabBtns.forEach(btn => btn.classList.remove('active'));
          tabContents.forEach(content => content.classList.remove('active'));
          
          // Добавляем активный класс текущей кнопке и контенту
          this.classList.add('active');
          document.getElementById(tabId).classList.add('active');
      }
  
      // Поиск треков
      function searchTracks() {
          const searchTerm = searchInput.value.toLowerCase().trim();
          
          if (!searchTerm) {
              renderCurrentPlaylist();
              return;
          }
          
          const filteredSongs = songs.filter(song => 
              song.title.toLowerCase().includes(searchTerm) || 
              song.artist.toLowerCase().includes(searchTerm)
          );
          
          // Временно заменяем currentPlaylist на отфильтрованные песни
          const originalPlaylist = currentPlaylist;
          currentPlaylist = filteredSongs.map((_, index) => index);
          
          renderCurrentPlaylist();
          
          // Восстанавливаем оригинальный плейлист
          currentPlaylist = originalPlaylist;
      }
  
      // Инициализация приложения
      init();
  });