import moment from 'moment'
import axios from 'axios'
import classNames from 'classnames'
import {loadState, saveState} from './localStorage'

//Model
const wikiApi = 'https://en.wikipedia.org/w/api.php'
const wikiLink = 'https://en.wikipedia.org/wiki'
const noImage = 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Wikipedia-info.png'
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

// View
const searchForm = document.getElementById('search-form')
const searchText = document.getElementById('search')
const randomBtn = document.getElementById('random')
const results = document.getElementById('results')

const cardView = (page, html) => {
  let title = `${page.title}`
  const href = `${wikiLink}/${title.replace(/\s/g, '_')}`
  let thumb = page.thumbnail ? `${page.thumbnail.source}` : null
  let image = thumb != null ? `<img src=${thumb}>` : `<img src=${noImage}>`
  const re = /((?!\.\s|\n).)+(.)/g
  const match = html.innerText.match(re)
  let intro = match.slice(0, 2).join(' - ')
  if (intro.length > 149) {
    intro = `${intro.substring(0, 149)}...`
  }
  return (
    `<li>
       <a href="${href}" target="_blank">${image}</a>
       <div class="blurb">
         <h1 class="wiki-title">
           <span>${title}</span>
           <a class="btn btn-lg btn-success" href="${href}" target="_blank">
             <i class="fa fa-external-link aria-hidden="true""></i>
             <i class="fa fa-wikipedia-w" aria-hidden="true"></i>
           </a>
         </h1>
         <p>${intro}</p>
       </div>
     </li>`)
}

//Controller
const getQueryPages = async () => {
  const {data} = await axios.get(wikiApi, {params: queryParams(searchText.value)})
  return data.query.pages
}

const performParse = async (pageTitle) => {
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

const performSearch = async (e) => {
  e.preventDefault()
  let pagesData = await getQueryPages()
  let view = Object.keys(pagesData).map(async (key) => {
    const page = pagesData[key]
    let html = document.createElement('div')
    html.innerHTML = await performParse(page.title)
    return cardView(page, html)
  })
  let lines = await Promise.all(view)
  displayLines(lines)
  rememberSearch()
}

const viewRandomPage = () => {
  window.open('https://en.wikipedia.org/wiki/Special:Random', '_blank')
}

// initialize
const init = () => {
  searchText.value = lastSearch
  searchForm.onsubmit = performSearch
  randomBtn.onclick = viewRandomPage
}

init()
