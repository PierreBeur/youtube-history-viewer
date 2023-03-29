const watchHistory = [];

const list = document.querySelector('#list');
const listItemTemplate = document.querySelector('#list-item-template');
function updateWatchHistory(json) {
  // Add entry to watch history
  watchHistory.push(json);
  // Sort entries by dates
  watchHistory.sort((a, b) => {
    aNewestDate = new Date(a[0].time);
    aOldestDate = new Date(a[a.length - 1].time);
    bNewestDate = new Date(b[0].time);
    bOldestDate = new Date(b[b.length - 1].time);
    if (aNewestDate > bNewestDate) return -1;
    if (aNewestDate < bNewestDate) return 1;
    if (aOldestDate > bOldestDate) return -1;
    if (aOldestDate < bOldestDate) return 1;
    return 0;
  });
  // Clear list
  list.textContent = '';
  // Add entries to list
  for (const entry of watchHistory) {
    const listItem = listItemTemplate.content.cloneNode(true);
    const newestDate = new Date(entry[0].time);
    const oldestDate = new Date(entry[entry.length - 1].time);
    const newestDateString = newestDate.toDateString();
    const oldestDateString = oldestDate.toDateString();
    listItem.querySelector('.newest-date').innerText = newestDateString;
    listItem.querySelector('.oldest-date').innerText = oldestDateString;
    list.appendChild(listItem);
  }
}

function isValid(video) {
  if (video.subtitles && Array.isArray(video.subtitles) && video.subtitles.length) {
    // Valid if video has title, url, channel name and url, and time
    const hasTitle = !!(video.title);
    const hasUrl = !!(video.titleUrl);
    const hasChannel = !!(video.subtitles[0].name) && !!(video.subtitles[0].url);
    const hasTime = !!(video.time);
    return hasTitle && hasUrl && hasChannel && hasTime;
  }
  return false;
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
fileInput.addEventListener('change', () => {
  // Get array of files from file input
  const files = fileInput.files;
  console.log(files);
  // Iterate over files
  for (const file of files) {
    // Check that file is JSON
    if (!file.type || file.type != 'application/json') continue;
    console.log(file);
    // Load contents of file
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const text = reader.result;
      const json = JSON.parse(text);
      console.log(json);
      // If JSON is an array and has elements
      if (Array.isArray(json) && json.length) {
        // Filter out invalid entries
        const jsonValid = json.filter(isValid);
        // Push JSON to watch history and update list
        updateWatchHistory(jsonValid);
      }
    });
    reader.readAsText(file);
  }
  // Reset file input
  fileInput.value = '';
});
