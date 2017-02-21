import moment from 'moment'
import axios from 'axios'
import classNames from 'classnames'
import {loadState, saveState} from './localStorage'

const wikiLink = 'https://en.wikipedia.org/wiki'
let persistedState = loadState() || {}
let lastSearch = persistedState.lastSearch || ''

const searchForm = document.getElementById('search-form')
const searchText = document.getElementById('search')
const randomBtn = document.getElementById('random')

const performSearch = (e) => {
  e.preventDefault()
  axios.get('https://en.wikipedia.org/w/api.php', {
    params: {
      action: "query",
      prop: "pageimages|extracts",
      generator: "search",
      gsrsearch: searchText.value,
      gsrlimit: "10",
      pilimit: "max",
      exsentences: "1",
      format: "json",
      origin: "*"
    }
  })
    .then((result) => {
      let pages = result.data.query.pages
      let keyView = Object.keys(pages).map((key) => {
        let title = `${pages[key].title}`
        let link = `${wikiLink}/${title.replace(/\s/g, '_')}`
        return `<li><a href="${link}" target="_blank">${title}</a></li>`
      })
      document.getElementById('result').innerHTML = keyView.join('')
      persistedState.lastSearch = searchText.value
      saveState(persistedState)
    })
    .catch(err => {
      console.log(err)
    })
}

const viewRandomPage = () => {
  window.open('https://en.wikipedia.org/wiki/Special:Random', '_blank')
}

searchText.value = lastSearch
searchForm.onsubmit =  performSearch
randomBtn.onclick = viewRandomPage


