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
