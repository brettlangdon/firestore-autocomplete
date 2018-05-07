#!/usr/bin/env python
import json
import re

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

cred = credentials.Certificate('service.json')
firebase_admin.initialize_app(cred)
db = firestore.client()
moviesRef = db.collection('movies')


def get_terms(title):
    title = title.strip().lower()
    title = re.sub(r'[^\w]', ' ', title)
    title = re.sub(r'\s+', ' ', title)
    parts = title.split(' ')

    terms = dict()
    for part in parts:
        part = part.strip()
        if not part or len(part) < 2:
            continue

        for i in range(2, len(part) + 1):
            terms[part[:i]] = True
    return terms


def main():
    with open('./imdb-top-250.json') as fp:
        movies = json.load(fp)

    for movie in movies:
        # Convert `imdb_position` to an `int`
        movie['imdb_position'] = int(movie['imdb_position'])

        # Add our autocomplete terms
        movie['terms'] = get_terms(movie['title'])

        print('Uploading:', movie['title'], '-', movie['imdb_position'], '-', set(movie['terms'].keys()))

        # Create the new document
        moviesRef.document().set(movie)


if __name__ == '__main__':
    main()
