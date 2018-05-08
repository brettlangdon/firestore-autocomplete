// Initialize Firebase
var config = {
  apiKey: "AIzaSyBfECPzG1IA8g1otya4h5wMeYtK2L1AyEk",
  authDomain: "autocomplete-8edab.firebaseapp.com",
  databaseURL: "https://autocomplete-8edab.firebaseio.com",
  projectId: "autocomplete-8edab",
  storageBucket: "",
  messagingSenderId: "797593136449"
};
firebase.initializeApp(config);
var db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });

var searchTimeout = null;
var resultsElm = document.getElementById('results');

function runQuery (query) {
  var input = document.querySelector('input');
  input.parentElement.classList.add('is-loading');
  results.innerHTML = '<tr><td colspan="3"><div class="loader has-text-centered"></div></td></tr>';
  query
    .get()
    .then(function (docs) {
      if (docs.empty) {
        results.innerHTML = '<tr><td colspan="3" class="notification">No results found for query "' + queryString + '"</td></tr>';
        return;
      }

      // Collect the data of our documents into an array
      var data = [];
      for (var i = 0; i < docs.size; i += 1) {
        var doc = docs.docs[i];
        data.push(doc.data());
      }

      // Sort our array by my popular movie first
      data.sort(function (a, b) {
        if (a.imdb_position < b.imdb_position) return -1;
        if (a.imdb_position > b.imdb_position) return 1;
        return 0;
      });

      // Render our results
      results.innerHTML = '';
      for (var i = 0; i < data.length; i += 1) {
        var doc = data[i];
        tr = document.createElement('tr');
        var td = document.createElement('td');
        td.innerText = doc.imdb_position;
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = doc.title;
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = doc.released;
        tr.appendChild(td);

        results.appendChild(tr);
      }
    })
    .finally(function () {
      input.parentElement.classList.remove('is-loading');
    });
}

document.querySelector('input').addEventListener('keyup', function (evt) {
  var elm = evt.target;
  var queryString = elm.value.trim();
  if (queryString.length < 2) {
    results.innerHTML = '';
    return;
  }
  queryString = queryString.toLowerCase();

  var query = db.collection('movies');
  var parts = queryString.split(' ');
  var valid = false;
  for (var i = 0; i < parts.length; i += 1) {
    var part = parts[i].trim();
    if (part.length < 2) {
      continue;
    }

    valid = true;
    query = query.where('terms.' + part, '==', true);
  }

  if (!valid) {
    results.innerHTML = '';
    return;
  }

  // Use `setTimeout` to debounce our api calls
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(function () {
    runQuery(query);
  }, 300);
});

// Run initial query to load some data
var top20 = db.collection('movies').orderBy('imdb_position', 'asc').limit(20);
runQuery(top20);
