import moment from 'moment'
import axios from 'axios'
import classNames from 'classnames'
import {loadState, saveState} from './localStorage'

const maxHours = {oneDay: 8, fiveDay: 40}
let persistedState = loadState() || {}
let units = persistedState.units || 'imperial'
let criteria = persistedState.criteria || {zip: '11226,us'}
let forecastHours = persistedState.forecastHours || maxHours.oneDay
let weatherData = {}
let weatherList = []

const btnLocation = document.getElementById('js-geolocation')
const todaysDate = document.getElementById('todays-date')
const weatherIcon = document.querySelector('.weather-icon')
const nowTemp = document.getElementById('now-temp')
const currentTown = document.getElementById('current-town')
const currentDesc = document.getElementById('current-desc')
const tempUnitSelector = document.getElementById('units')
const fTempSpan = document.querySelector('.fahrenheit')
const cTempSpan = document.querySelector('.celsius')
const humidity = document.getElementById('humidity')
const windDeg = document.querySelector('.wi-wind')
const direction = document.getElementById('direction')
const windSpeed = document.getElementById('windSpeed')
const cloudiness = document.getElementById('cloudiness')
const oneDayTab = document.getElementById('24hr')
const fivedayTab = document.getElementById('5day')

const degreesToCardinal = (degrees) => {
  const cardinals = ['North', 'Northeast', 'East', 'Southeast',
    'South', 'Southwest', 'West', 'Northwest', 'North']
  return cardinals[Math.round((degrees % 360) / 45)]
}

const titleCase = str => (str.toLowerCase().split(' ').map(
  word => word.replace(word[0], word[0].toUpperCase())).join(' '))

const dayOrNight = icon => icon.endsWith('n') ? 'night' : 'day'

const getTime = () => {
  todaysDate.innerText = moment().format('LL')
}

const displayLocationButton = () => {
  btnLocation.className = classNames({hide: !('geolocation' in navigator)})
}

const displayWeather = () => {
  const {main, name, weather, wind, clouds} = weatherData
  nowTemp.innerHTML = `${Math.round(main.temp)}&deg;`
  weatherIcon.className = classNames('weather-icon', 'degrees', 'wi',
    `wi-owm-${dayOrNight(weather[0].icon)}-${weather[0].id}`)
  currentTown.innerText = `${name}`
  currentDesc.innerText = `${weather[0].description}`
  humidity.innerText = `${main.humidity}%`
  const deg = Math.round(wind.deg)
  windDeg.className = classNames('wi', 'wi-wind', `towards-${deg}-deg`)
  direction.innerText = degreesToCardinal(deg)
  const rateLabel = units === 'imperial' ? 'mph' : 'm/s'
  windSpeed.innerText = `${Math.round(wind.speed)} ${rateLabel}`
  cloudiness.innerText = `${clouds.all}%`
}

const displayList = () => {
  const list = weatherList.slice(0, forecastHours)
  const timeFormat = forecastHours === maxHours.fiveDay ? 'ddd ha' : 'h:mma'
  document.querySelector('.timespans').innerHTML = list.map(hour => (
    `<span>${moment.unix(hour.dt).format(timeFormat)}</span>
         <span>
           <i class="wi wi-owm-${dayOrNight(hour.weather[0].icon)}-${hour.weather[0].id}"></i>
           ${titleCase(hour.weather[0].description)}
         </span>
         <span>${Math.round(hour.main.temp)}</span>`
  )).join('')
}

const getParams = () => {
  return {
    ...criteria,
    APPID: '303a7ac58669ef387ce34e65f2f9cbba',
    units,
  }
}

const getWeather = () => {
  axios.get('http://api.openweathermap.org/data/2.5/weather', {
    params: getParams(),
  })
    .then((response) => {
      const {main, name, weather, wind, clouds} = response.data
      weatherData = {main, name, weather, wind, clouds}
      displayWeather()
    })
    .catch((error) => {
      console.error(error)
    })
}

const getForecast = () => {
  axios.get('http://api.openweathermap.org/data/2.5/forecast', {
    params: getParams(),
  })
    .then((response) => {
      weatherList = response.data.list
      displayList()
    })
    .catch((error) => {
      console.error(error)
    })
}

const styleUnits = () => {
  const fahrenheit = units === 'imperial'
  fTempSpan.className = classNames('fahrenheit', {selected: fahrenheit})
  cTempSpan.className = classNames('celsius', {selected: !fahrenheit})
}

const styleForecastHeadings = () => {
  const oneDay = forecastHours === maxHours.oneDay
  oneDayTab.className = classNames({selected: oneDay})
  fivedayTab.className = classNames({selected: !oneDay})
}

const setState = () => {
  persistedState = {units, forecastHours, criteria}
  saveState(persistedState)
}

const useLocation = () => {
  navigator.geolocation.getCurrentPosition((position) => {
    criteria = {lat: position.coords.latitude, lon: position.coords.longitude}
    setState()
    getWeather(criteria)
  })
}

const changeUnits = () => {
  units = units === 'metric' || units === undefined ? 'imperial' : 'metric'
  getWeather()
  getForecast()
  styleUnits()
  setState()
}

const dayForecast = (max) => {
  forecastHours = max
  styleForecastHeadings()
  displayWeather()
  displayList()
  setState()
}

btnLocation.onclick = useLocation
tempUnitSelector.onclick = changeUnits
oneDayTab.onclick = () => dayForecast(maxHours.oneDay)
fivedayTab.onclick = () => dayForecast(maxHours.fiveDay)
displayLocationButton()
setState()
getTime()
styleUnits()
styleForecastHeadings()
getWeather()
getForecast()
