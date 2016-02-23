var path = require('path')
var url  = require('url')

var intl  = require('../intl.json')
var utils = require('./utils')

var getMaxFootnote     = utils.getMaxFootnote
var getPageLinks       = utils.getPageLinks
var isInternalLink     = utils.isInternalLink
var linksAreReferences = utils.linksAreReferences


function createFootnote(link)
{
  var index   = link.index
  var linkUrl = link.url

  // Intra-book links
  if(isInternalLink(linkUrl))
    linkUrl = intl[language].replace(/__REF__/, '*'+linkUrl+'*')

  this.content += '\n[^'+index+']: '+linkUrl
}

function extractIndexes(item)
{
  return item.replace(/\.\s+/, '.')
}


function processPage(page)
{
  var options = this.config.options

  if(options.generator !== 'pdf') return page


  var language = options.language || 'en'

  getPageLinks(page, getMaxFootnote(page.content))
  .map(function(link)
  {
    var index   = link.index
    var linkUrl = link.url

    page.content = page.content.replace(link.link, link.link + '[^'+index+']')

    // Intra-book links
    if(isInternalLink(linkUrl))
    {
      // Resolve link path
      linkUrl = decodeURI(url.resolve(page.path, linkUrl))

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
  })
  .forEach(createFootnote, page)

  return page
}


exports.processPage = processPage
