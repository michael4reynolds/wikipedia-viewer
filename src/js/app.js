import moment from 'moment'
import axios from 'axios'
import classNames from 'classnames'
import {loadState, saveState} from './localStorage'

// View
const searchForm = document.getElementById('search-form')
const searchText = document.getElementById('search')
const randomBtn = document.getElementById('random')
const results = document.getElementById('results')

const cardView = (page, header) => {
  let title = `${page.title}`
  let link = `${wikiLink}/${title.replace(/\s/g, '_')}`
  let thumb = page.thumbnail ? `${page.thumbnail.source}` : null
  let image = thumb != null ? `<img src=${thumb}>` : null
  return `<li>${header}${'\n'}${image}${'\n'}<a href="${link}" target="_blank">${title}</a></li>`
}

//Model
const wikiApi = 'https://en.wikipedia.org/w/api.php'
const wikiLink = 'https://en.wikipedia.org/wiki'
let persistedState = loadState() || {}
let lastSearch = persistedState.lastSearch || ''

const queryParams = (text) => ({
  action: "query",
  prop: "pageimages|extracts",
  generator: "search",
  gsrsearch: text,
  gsrlimit: "10",
  pilimit: "max",
  pithumbsize: 300,
  exsentences: "1",
  format: "json",
  origin: "*"
})

const parseParams = (title) => ({
  action: "parse",
  page: title,
  section: 0,
  format: "json",
  origin: "*"
})

//Controller
async function getQueryPages() {
  const {data} = await axios.get(wikiApi, {params: queryParams(searchText.value)})
  return data.query.pages
}

async function performParse(pageTitle) {
  const {data} = await axios.get(wikiApi, {params: parseParams(pageTitle)})
  return data.parse.text["*"]
}

const displayLines = (view) => {
  results.innerHTML = view.join('')
}

const rememberSearch = () => {
  persistedState.lastSearch = searchText.value
  saveState(persistedState)
}

async function performSearch(e) {
  e.preventDefault()
  let pagesData = await getQueryPages()
  let view = Object.keys(pagesData).map(async(key) => {
    const page = pagesData[key]
    let header = await performParse(page.title)
    return cardView(page, header)
  })
  let lines = await Promise.all(view)
  displayLines(lines)
  rememberSearch()
}

const viewRandomPage = () => {
  window.open('https://en.wikipedia.org/wiki/Special:Random', '_blank')
}

searchText.value = lastSearch
searchForm.onsubmit = performSearch
randomBtn.onclick = viewRandomPage
