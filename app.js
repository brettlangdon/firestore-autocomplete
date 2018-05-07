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
    elm.parentElement.classList.add('is-loading');
    query
      .get()
      .then(function (docs) {
        if (docs.empty) {
          results.innerHTML = '<div class="notification is-danger">No results found for query "' + queryString + '"</div>';
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
        // Table
        var table = document.createElement('table');
        table.classList.add('table');
        table.classList.add('is-striped');

        // Heading row
        var thead = document.createElement('thead');
        table.appendChild(thead);
        var tr = document.createElement('tr');
        thead.appendChild(tr);

        var th = document.createElement('th');
        th.innerText = 'Position';
        thead.appendChild(th);
        th = document.createElement('th');
        th.innerText = 'Title';
        thead.appendChild(th);
        th = document.createElement('th');
        th.innerText = 'Released';
        thead.appendChild(th);

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

          table.appendChild(tr);
        }

        results.innerHTML = '';
        results.appendChild(table);
      })
      .finally(function () {
        elm.parentElement.classList.remove('is-loading');
      });
  }, 300);
});
