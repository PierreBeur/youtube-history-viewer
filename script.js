let db;
(async () => {
  // Open database
  db = await idb.openDB('youtube-history-viewer', 1, {
    upgrade(db) {
      // Create database if does not exist
      db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
    }
  });
  updatePage();
})();

const URL_PREFIX = 'https://www.youtube.com/watch?v=';
const TITLE_PREFIX = 'Watched ';

async function parseFile(text) {
  const json = JSON.parse(text);
  // Check that JSON is an array and has elements
  if (!Array.isArray(json) || !json.length) return;
  // Parse each event in file
  const events = json.map((data) => {
    // Parse video data
    const id = data.titleUrl?.startsWith(URL_PREFIX) ? data.titleUrl?.slice(URL_PREFIX.length) : data.titleUrl;
    const title = data.title?.startsWith(TITLE_PREFIX) ? data.title?.slice(TITLE_PREFIX.length) : data.title;
    const channelName = data.subtitles?.[0]?.name;
    const channelUrl = data.subtitles?.[0]?.url;
    const time = Date.parse(data.time);
    // Add event to file
    return { id, title, channelName, channelUrl, time};
  });
  // Add file to database
  const newest = events[0].time;
  const oldest = events[events.length - 1].time;
  await db.put('files', { newest, oldest, events, raw: json });
  updatePage();
}

async function updatePage() {
  await updateList();
}

const fileList = document.querySelector('#file-list');
const fileItemTemplate = document.querySelector('#file-item-template');
async function updateList() {
  // Get and sort files
  const files = await db.getAll('files');
  files.sort((a, b) => {
    if (a.newest > b.newest) return -1;
    if (a.newest < b.newest) return 1;
    if (a.oldest > b.oldest) return -1;
    if (a.oldest < b.oldest) return 1;
    return 0;
  });
  // Clear list
  fileList.textContent = '';
  // Add files to list
  for (const file of files) {
    const fileItem = fileItemTemplate.content.firstElementChild.cloneNode(true);
    // Set dates
    const newestDate = (new Date(file.newest)).toDateString();
    const oldestDate = (new Date(file.oldest)).toDateString();
    fileItem.querySelector('.newest-date').innerText = newestDate;
    fileItem.querySelector('.oldest-date').innerText = oldestDate;
    // Set file id
    fileItem.id = `file-${file.id}`;
    // Get active file id
    const activeFileId = sessionStorage.getItem('active-file-id');
    // If this file is active or no file is active
    if ((file.id == activeFileId) || !activeFileId) {
      // Set file item as active
      fileItem.classList.add('active-file-item');
      sessionStorage.setItem('active-file-id', file.id);
    } else {
      // Otherwise set file as inactive
      fileItem.classList.remove('active-file-item');
    }
    // Set file as active on click
    fileItem.querySelector('.file-item-active').addEventListener('click', () => {
      // Set active file id
      sessionStorage.setItem('active-file-id', file.id);
      updatePage();
    });
    // Have delete button delete file on click
    const deleteButton = fileItem.querySelector('.file-item-delete');
    deleteButton.addEventListener('click', async () => {
      // Get confirmation from user
      const confirmString = `${newestDate} - ${oldestDate}\n` +
                            'Are you sure you want to permanently delete this file?';
      if (confirm(confirmString)) {
        // Delete file from database
        await db.delete('files', file.id);
        // If file is active
        if (file.id == sessionStorage.getItem('active-file-id')) {
          sessionStorage.removeItem('active-file-id');
        }
        updatePage();
      }
    });
    // Add file to list
    fileList.appendChild(fileItem);
  }
}

// Have menu button toggle menu display on click
const menu = document.querySelector('#menu');
const menuButton = document.querySelector('#menu-button');
menuButton.addEventListener('click', () => {
  if (menu.style.display === 'none') {
    menu.removeAttribute('style');
  } else {
    menu.style.display = 'none';
  }
});

// Have upload button open file upload on click
const uploadButton = document.querySelector('#upload-button');
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'application/json';
fileInput.multiple = true;
uploadButton.addEventListener('click', () => {
  fileInput.click();
});

// Load and parse files on upload
fileInput.addEventListener('change', async () => {
  // Get array of files from file input
  const files = fileInput.files;
  // Iterate over files
  for (const file of files) {
    // Check that file is JSON
    if (!file.type || file.type != 'application/json') continue;
    // Load contents of file
    const reader = new FileReader();
    await new Promise((resolve) => {
      reader.addEventListener('load', async () => {
        // Parse result text and update database
        const text = reader.result;
        await parseFile(text);
        resolve();
      });
      reader.readAsText(file);
    });
  }
  // Reset file input
  fileInput.value = '';
});
