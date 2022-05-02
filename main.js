'use strict';
// apikey=b24412a9

const getS = (selector, i = 0) => document.querySelectorAll(selector)[i];
const form = document.forms[0];
const modalDefault = getS('.modal').innerHTML;
let action = 'search';
let movieList = [];
let searchWord = '';
let modalEvent;
let page = 1;
let maxPage = 0;


getS('.search__btn').addEventListener('click', () => {
  if (form[0].value) {
    searchWord = form[0].value;
    action = 'search';
    resetData();
    getData();
  }
})
window.addEventListener('keydown', e => {
  if (e.key === 'Enter' && form[0].value) {
    e.preventDefault();
    searchWord = form[0].value;
    action = 'search';
    resetData();
    getData();
  }
})

getS('.show-more').addEventListener('click', () => {
  action = 'showMore';
  getData();
})

const resetData = () => {
  page = 1;
  maxPage = 0;
  getS('.show-more').classList.add('hide');
}

const getData = async () => {
  getS('.list-loader').classList.remove('hide');
  try {
    const responce = await fetch(`https://omdbapi.com/?s=${searchWord}&page=${page}&apikey=b24412a9`);
    const data = await responce.json();

    if (data.Error) {
      throw new Error(data.Error);
    }
    if (parseInt(data.totalResults) > 10) {
      if (maxPage === 0) {
        maxPage = Math.ceil(parseInt(data.totalResults) / 10);
        getS('.show-more').classList.remove('hide');
        page++;
      }
      else if (maxPage - page > 1) {
        getS('.show-more').classList.remove('hide');
        page++;
      }
      else {
        resetData();
      }
    }

    movieList = await data.Search;
    getS('.list-loader').classList.add('hide');
    showMovie();
  } catch (err) {
    let errMsg;
    switch (err.message) {
      case 'Too many results.':
        errMsg = 'Too many results.';
        break;
      case 'Movie not found!':
        errMsg = 'Movies and products not found!';
        break;
      default:
        errMsg = 'Something went wrong.';
    }
    getS('.movie-list').innerHTML = '';
    const h1 = document.createElement('h1');
    h1.innerText = errMsg;
    getS('.movie-list').appendChild(h1);
    getS('.list-loader').classList.add('hide');
    getS('.show-more').classList.add('hide');
    console.log(err);
  }
}

//show product cards by search
const showMovie = () => {
  if (action === 'search') getS('.movie-list').innerHTML = '';
  for (const movie of movieList) {
    movie.Poster = movie.Poster === 'N/A' ? 'no-image.png' : movie.Poster;

    const li = document.createElement('LI');
    const poster = `<picture class="movie__poster"><img scr="" alt="${movie.Title}"></picture>`;
    const title = movie.Title.length <= 33
      ? `<p class='movie__title'>${movie.Title}</p>`
      : `<p class='movie__title'>${movie.Title.slice(0, 30)}...</p>`;
    const type = `<p class="movie__type">${movie.Type}</p>`;
    const year = `<p class="movie__type">${movie.Year}</p>`;
    const btn = `<input id="${movie.imdbID}" type="button" value="More details" class="movie__btn btn">`;
    const liElements = poster + title + type + year + btn;

    li.classList.add('movie');
    li.innerHTML = liElements;
    li.firstChild.firstChild.setAttribute('src', movie.Poster);
    getS('.movie-list').appendChild(li);
  }
};

// showing the product info modal
getS('.movie-list').addEventListener('click', e => {
  if (e.target.nodeName === 'INPUT') showModal(e);
})

const showModal = e => {
  const movieID = e.target.attributes.id.value;
  movieInfo(movieID);
  getS('.container').classList.add('gray');
  getS('.modal').classList.remove('hide');
  document.body.style.overflow = 'hidden';
  setTimeout(() => modalEvent = getS('.gray').addEventListener('click', hideModal), 1000)
}

const hideModal = () => {
  getS('.gray').removeEventListener('click', hideModal);
  getS('.container').classList.remove('gray');
  getS('.modal').classList.add('hide');
  document.body.style = '';
  setInterval(() => { }, 500, getS('.modal').innerHTML = modalDefault);
}

//show more info about a product
const movieInfo = async id => {
  getS('.modal__loader').classList.remove('hide');
  try {
    const responce = await fetch(`https://omdbapi.com/?i=${id}&apikey=b24412a9&plot=full`);
    const data = await responce.json();
    const showInfo = (...arg) => {
      for (const elem of arg) {
        getS(`.about__${elem}`)
          .innerHTML = data[elem.toUpperCase().slice(0, 1) + elem.slice(1, elem.length)];
        if (data.Poster !== 'N/A')
          getS('.modal__poster').innerHTML = `<img src="${data.Poster}" alt="${data.Title}">`;
        else
          getS('.modal__poster').innerHTML = `<img src="no-image.png" alt="${data.Title}">`;
      }
    }
    const showRating = () => {
      const ratingList = data.Ratings;
      for (const elem of ratingList) {
        let li = document.createElement('LI');
        li.innerHTML = elem.Source + ' ' + elem.Value;
        getS('.about__ratings').appendChild(li);
      }
    }
    getS('.modal__loader').classList.add('hide');

    showInfo('title', 'rated', 'year', 'genre', 'plot', 'writer', 'director', 'actors', 'boxOffice', 'awards');
    showRating();
  } catch (err) {
    console.log(err);
  }
}
