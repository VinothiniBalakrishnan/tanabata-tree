const errorNotif = document.getElementById('error');
const title = document.getElementById('title');
const url = document.getElementById('url');

// Get the input box to target for timer
var textInput = document.getElementById('url');

// Init a timeout variable to be used below
var timeout = null;

// Listen for keystroke events
textInput.onkeyup = function (e) {
  // Clear the timeout if it has already been set.
  // This will prevent the previous task from executing
  // if it has been less than <MILLISECONDS>
  clearTimeout(timeout);

  // Make a new timeout set to go off in 800ms
  timeout = setTimeout( () => {
    getTitle(textInput.value);
  }, 1500);
};

function getTitle(text) {
  // make GET request to server for title
  let xml = new XMLHttpRequest();
  xml.addEventListener('load', requestListener);
  xml.open('GET', '../gettitle/?url=' + encodeURIComponent(text));
  xml.send();
  
  function requestListener() {
    let data = this.responseText;
    let response = JSON.parse(data);
    
    responseHandler(response);
  }
}

const btnRemove = document.getElementById('remove');
btnRemove.addEventListener('click', () => {
  errorNotif.style.visibility = 'hidden';
});

const btnAdd = document.getElementById('add');
btnAdd.addEventListener('click', submit);

function submit() {
  btnAdd.classList.add('is-loading');
  
  let titleContext = title.value;
  let urlContext = url.value;
  
  titleContext = titleContext.trim();
  urlContext = urlContext.trim();
  
  // error handling (checking for empty values)
  if (titleContext.length === 0 || urlContext.length === 0) {
    errorNotif.style.visibility = 'visible';
    btnAdd.classList.remove('is-loading');
    return false;
  }
  
  // making GET request
  let xml = new XMLHttpRequest();
  xml.addEventListener('load', requestListener);
  xml.open('GET', '../tanzaku' + '?title=' + titleContext + '&url=' +
           encodeURIComponent(urlContext));
  xml.send();
  
  function requestListener() {
    let data = this.responseText;
    let response = JSON.parse(data);
    
    responseHandler(response);
  }
}

function responseHandler(response) {
  const urlHelp = document.getElementById('url-help');
  
  if (response.status === 'success') {
    switch (response.message) {
      case 'tanzaku_uploaded':
        btnAdd.classList.remove('is-loading');
        // change button to direct to tanzakus list
        btnAdd.innerHTML = 'Success! Click again to view tanzakus.';
        btnAdd.removeEventListener('click', submit);
        btnAdd.addEventListener('click', viewTanzakus);
        break;
      case 'get_title':
        title.value = response.title;
        
        url.classList.remove('is-danger');
        urlHelp.style.visibility = 'hidden';
        break;
    }
  }

  if (response.status === 'failed') {
    switch (response.message) {
      case 'get_title_failed':
        title.setAttribute('placeholder', 'Invalid URL!');
        title.value = '';
        url.classList.add('is-danger');
        
        urlHelp.style.visibility = 'visible';
        urlHelp.classList.add('is-danger');
        urlHelp.innerHTML = 'Enter a valid URL.';
        break;
    }
  }
}

function viewTanzakus() {
  window.location.href = '../all/tanzakus.html#recent';
}