// Переключение между вкладками
document.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Логика для перетаскивания файлов
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('music-file');
const uploadFileButton = document.getElementById('upload-file-button');

dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('dragover');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragover');
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        document.getElementById('upload-message').textContent = 'Файл выбран: ' + files[0].name;
    }
});

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        document.getElementById('upload-message').textContent = 'Файл выбран: ' + fileInput.files[0].name;
    }
});

uploadFileButton.addEventListener('click', () => {
    fileInput.click();
});

// Функция для сохранения данных в localStorage
function saveTracks(tracks) {
    localStorage.setItem('tracks', JSON.stringify(tracks));
}

// Функция для загрузки данных из localStorage
function loadTracks() {
    const tracks = localStorage.getItem('tracks');
    return tracks ? JSON.parse(tracks) : [];
}

// Функция для отображения треков
function renderTrack(track) {
    const musicList = document.querySelector('.music-list');
    const newMusicItem = document.createElement('div');
    newMusicItem.className = 'music-item';
    newMusicItem.setAttribute('data-title', track.title);
    newMusicItem.setAttribute('data-author', track.author);
    newMusicItem.setAttribute('data-file', track.file);
    newMusicItem.innerHTML = `
        <img src="cover1.jpg" alt="Обложка" class="music-cover">
        <div class="music-info">
            <h3>${track.title}</h3>
            <p>${track.author}</p>
            <p>${track.duration}</p>
            <p>Лайки: ${track.likes} | Дизлайки: ${track.dislikes} | Скачивания: ${track.downloads}</p>
        </div>
    `;
    musicList.appendChild(newMusicItem);
}

// Загрузка и отображение треков при загрузке страницы
window.addEventListener('load', () => {
    const tracks = loadTracks();
    tracks.forEach(track => renderTrack(track));
});

// Логика для добавления трека
document.getElementById('upload-music-button').addEventListener('click', () => {
    const file = fileInput.files[0];
    const title = document.getElementById('music-title').value;

    if (file && title) {
        const tracks = loadTracks();
        const existingTrack = tracks.find(track => track.title === title);

        if (existingTrack) {
            document.getElementById('upload-message').textContent = 'Трек с таким названием уже существует!';
        } else {
            const newTrack = {
                title,
                author: 'Неизвестный исполнитель',
                duration: '0:00',
                file: URL.createObjectURL(file),
                likes: 0,
                dislikes: 0,
                downloads: 0
            };

            tracks.push(newTrack);
            saveTracks(tracks);
            renderTrack(newTrack);
            document.getElementById('upload-message').textContent = 'Музыка добавлена!';
        }
    } else {
        document.getElementById('upload-message').textContent = 'Выберите файл и введите название!';
    }
});

// Логика для воспроизведения музыки
const audioPlayer = document.getElementById('audio-player');
let currentTrack = null;

document.addEventListener('click', (e) => {
    if (e.target.closest('.music-item')) {
        const musicItem = e.target.closest('.music-item');
        const title = musicItem.getAttribute('data-title');
        const author = musicItem.getAttribute('data-author');
        const file = musicItem.getAttribute('data-file');

        // Обновляем плашку с текущей музыкой
        document.getElementById('now-playing-title').textContent = title;
        document.getElementById('now-playing-author').textContent = author;

        // Воспроизводим трек
        audioPlayer.src = file;
        audioPlayer.play();
        currentTrack = musicItem;

        // Обновляем кнопку воспроизведения
        document.getElementById('play-pause-button').textContent = '⏸️';
    }
});

// Логика для кнопок управления плеером
document.getElementById('play-pause-button').addEventListener('click', () => {
    if (audioPlayer.paused) {
        audioPlayer.play();
        document.getElementById('play-pause-button').textContent = '⏸️';
    } else {
        audioPlayer.pause();
        document.getElementById('play-pause-button').textContent = '▶️';
    }
});

document.getElementById('next-button').addEventListener('click', () => {
    if (currentTrack) {
        const nextTrack = currentTrack.nextElementSibling;
        if (nextTrack && nextTrack.classList.contains('music-item')) {
            nextTrack.click();
        }
    }
});

document.getElementById('prev-button').addEventListener('click', () => {
    if (currentTrack) {
        const prevTrack = currentTrack.previousElementSibling;
        if (prevTrack && prevTrack.classList.contains('music-item')) {
            prevTrack.click();
        }
    }
});

// Обновление прогресс-бара и времени
audioPlayer.addEventListener('timeupdate', () => {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    document.querySelector('.progress').style.width = `${progress}%`;

    // Обновляем время
    const currentTime = formatTime(audioPlayer.currentTime);
    const duration = formatTime(audioPlayer.duration);
    document.getElementById('now-playing-time').textContent = `${currentTime} / ${duration}`;
});

// Форматирование времени (минуты:секунды)
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Логика для меню (три точки)
const menuButton = document.querySelector('.menu-button');
const menuOptions = document.querySelector('.menu-options');

menuButton.addEventListener('click', (e) => {
    e.stopPropagation();
    menuOptions.style.display = menuOptions.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', () => {
    menuOptions.style.display = 'none';
});

// Логика для лайков, дизлайков и скачивания
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('like-button')) {
        const tracks = loadTracks();
        const track = tracks.find(track => track.title === currentTrack.getAttribute('data-title'));
        if (track) {
            track.likes += 1;
            saveTracks(tracks);
            currentTrack.querySelector('.music-info p').textContent = `Лайки: ${track.likes} | Дизлайки: ${track.dislikes} | Скачивания: ${track.downloads}`;
        }
    }

    if (e.target.classList.contains('dislike-button')) {
        const tracks = loadTracks();
        const track = tracks.find(track => track.title === currentTrack.getAttribute('data-title'));
        if (track) {
            track.dislikes += 1;
            saveTracks(tracks);
            currentTrack.querySelector('.music-info p').textContent = `Лайки: ${track.likes} | Дизлайки: ${track.dislikes} | Скачивания: ${track.downloads}`;
        }
    }

    if (e.target.classList.contains('download-button')) {
        const tracks = loadTracks();
        const track = tracks.find(track => track.title === currentTrack.getAttribute('data-title'));
        if (track) {
            track.downloads += 1;
            saveTracks(tracks);
            currentTrack.querySelector('.music-info p').textContent = `Лайки: ${track.likes} | Дизлайки: ${track.dislikes} | Скачивания: ${track.downloads}`;

            // Создаем ссылку для скачивания
            const link = document.createElement('a');
            link.href = track.file;
            link.download = `${track.title}.mp3`;
            link.click();
        }
    }
});

// Логика для поиска
document.getElementById('searchButton').addEventListener('click', () => {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const musicItems = document.querySelectorAll('.music-item');

    musicItems.forEach(item => {
        const title = item.getAttribute('data-title').toLowerCase();
        if (title.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
});

// Логика для создания плейлиста
document.getElementById('createPlaylistButton').addEventListener('click', () => {
    document.getElementById('createPlaylistModal').style.display = 'flex';
});

document.getElementById('closePlaylistModal').addEventListener('click', () => {
    document.getElementById('createPlaylistModal').style.display = 'none';
});

document.getElementById('savePlaylistButton').addEventListener('click', () => {
    const playlistName = document.getElementById('playlistName').value;
    if (playlistName) {
        const playlistList = document.querySelector('.playlist-list');
        const newPlaylist = document.createElement('div');
        newPlaylist.className = 'playlist-item';
        newPlaylist.innerHTML = `
            <h3>${playlistName}</h3>
            <p><span class="track-count">0</span> треков</p>
            <div class="playlist-tracks"></div>
        `;
        playlistList.appendChild(newPlaylist);
        document.getElementById('createPlaylistModal').style.display = 'none';
    }
});