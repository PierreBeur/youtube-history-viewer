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
