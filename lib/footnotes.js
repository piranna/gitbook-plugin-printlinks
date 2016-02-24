var path = require('path')
var url  = require('url')

var intl  = require('../intl.json')
var utils = require('./utils')

var extractIndexes = utils.extractIndexes
var getMaxFootnote = utils.getMaxFootnote
var getPageLinks   = utils.getPageLinks
var isInternalLink = utils.isInternalLink


function createFootnote(link)
{
  var index   = link.index
  var linkUrl = link.url

  var language = options.language || 'en'

  // Intra-book links
  if(isInternalLink(linkUrl))
    linkUrl = intl[language].replace(/__REF__/, '*'+linkUrl+'*')

  this.content += '\n[^'+index+']: '+linkUrl
}

function setRef(link)
{
  var index   = link.index
  var linkUrl = link.url

  this.content = this.content.replace(link.link, link.link + '[^'+index+']')

  // Intra-book links
  if(isInternalLink(linkUrl))
  {
    // Resolve link path
    linkUrl = decodeURI(url.resolve(this.path, linkUrl))

    // File extension
    var extension = path.extname(linkUrl)
    if(extension !== '.html' && extension !== '.md') extension = undefined

    // Link path
    var linkPath = linkUrl.match(/\d+\.\s+/ig)
    linkPath = linkPath.slice(0, linkPath.length-1).map(extractIndexes).join('')

    // Get link anchor
    var anchor = link.anchor
    if(anchor) anchor = ' > '+anchor

    // Compose link
    link.url = linkPath+path.basename(linkUrl, extension)+anchor
  }

  return link
}


function processPage(page)
{
  if(this.config.options.generator !== 'pdf') return page

  getPageLinks(page, getMaxFootnote(page.content)).map(setRef, page)
  .forEach(createFootnote, page)

  return page
}


exports.processPage = processPage
