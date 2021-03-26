import React from 'react'
import $ from 'jquery' 

const oneYear = 1000 * 3600 * 24 * 365
// to avoid adding moment to package dependencies: a short custom function
// that formats the given string (eg "2017-05-23 21:07:06") as month & day
// (eg 'May 23')
export function formatAsMonthDay(dateTimeString) {
  // if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  if (isNaN(date)) return '' // eslint-disable-line no-restricted-globals
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  // if the date is older than one year, show the year
  const yearString = new Date() - date > oneYear ? `, ${date.getFullYear()}` : ''
  return `${monthNames[date.getMonth()]} ${date.getDate()}${yearString}`
}

/**
 * @param {String} html Includes html tags
 * @param {Object} options
 * @returns {String} Text w/o tags
 */
export function stripHtmlTags(html, options = { excludeUserMentions: true }) {
  let preparedHtml = html
  console.log('stripHtml', preparedHtml)
  // a small hack: if we want to preserve the user mentions,
  // we replace the < and > signs with triple-curly-brackets,
  // then we change them back after the tags have been removed
  if (options.excludeUserMentions) {
    // callback to use in replacing the tag signs
    const protectorCb = match => match.replace(/</g, '{{{').replace(/>/g, '}}}')
    preparedHtml = preparedHtml
      .replace(/<(img|br).*?\/>/g, protectorCb)
      .replace(/<(\/)?(a|ul|ol|li|p|strong|em)( .*?)?>/g, protectorCb)
  }
  const taggedHtml = preparedHtml
    .replace(/<\/?[^>]+(>+|$)/g, '') // remove tags
    .replace(/{{{/g, '<')
    .replace(/}}}/g, '>')
  const finalHtml = fixYoutubeLinks(taggedHtml)
  return <span dangerouslySetInnerHTML={{ __html: finalHtml }} />
}
/**
 * @param {String} str A text containing spaces and special chars
 * @returns {String} Lower-case version of the text with the special chars stripped
 * and spaces, dashes and underlines replaced with `-`
 */
export function toDashedLowercase(str) {
  return str
    .replace(/[\s_-]+/g, '-')
    .toLowerCase()
    .replace(/[^a-z-]/g, '')
}

export const getUserUrl = name => `/profile/${encodeURIComponent(name)}`

// Truncate text if longer, add ellipsis at the end
export function truncateText(text, length) {
  if (text.length <= length) {
    return text
  }
  return `${text.substr(0, length)}...`
}

var mymatch
function fixYoutubeLinks(html) {
  const ytregex = /(href=)"([^"]*(youtube\.com|youtu.be)[^"]*)"/gm
  console.log(html, 'fixYoutubeLinks')
  const matches = html.match(ytregex)
  // `<p>youtube link: <a href="https://www.youtube.com/watch?v=ITfmq24gvc8"></a></p> <p>youtube link: <a href="https://www.youtube.com/watch?v=ITfmq24gvc8"></a></p> <p>regular link: <a href="https://forum.dynamitecircle.com/categories/activity" rel="nofollow">https://forum.dynamitecircle.com/categories/activity</a></p>`
  mymatch = matches
  console.log(matches.groups)
  if (matches) return youtubeAtagText(html, matches)
  else return html
}

function youtubeAtagText(html, matches){
  const atagregex = /(>\s?<\/a>)/g
  let count = 0
  const fixedHtml = html.replace(atagregex, function($0) {
    if (count === matches.length) count = 0
    len = matches[count].length
    let strippedMatch = matches[count++].slice(5, len - 1) 
    return '>' + strippedMatch + '</a>'
  })
  // console.log(html, 'youtubeAtagText')
  // console.log(fixedHtml, 'youtubeAtagText')
  return fixedHtml
}