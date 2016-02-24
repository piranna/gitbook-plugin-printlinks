var path = require('path')
var url  = require('url')

var intl  = require('../intl.json')
var utils = require('./utils')

var externalLinksAreReferences = utils.externalLinksAreReferences
var extractIndexes             = utils.extractIndexes
var getMaxFootnote             = utils.getMaxFootnote
var getPageLinks               = utils.getPageLinks
var isInternalLink             = utils.isInternalLink


var pages = []


function filterPages(page)
{
  return page !== undefined
}

function getLinks(file)
{
  return this.parsePage(file).then(function(page)
  {
    var links = getPageLinks(page)
    if(!links.length) return

    var current = page.progress.current

    var result =
    {
      title: current.title,
      level: current.level,
      links: links
    }

    return result
  })
}

function setPages(result)
{
  pages = result.filter(filterPages).sort(sortPages)
}

function setRef(link)
{
  var index   = link.index
  var linkUrl = link.url

  if(isInternalLink(linkUrl))
  {
    this.content = this.content.replace(link.link, link.link + '[^'+index+']')

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
  else
    this.content = this.content.replace(link.link, link.link + '['+index+']')

  return link
}

function sortPages(a, b)
{
  a = a.level.split('.')
  b = b.level.split('.')

  while(a[0] != null && b[0] != null)
  {
    var result = a.shift() - b.shift()
    if(result) return result
  }

  return a.length - b.length
}


function init()
{
  if(!externalLinksAreReferences(this)) return

  if(this.config.options.generator !== 'pdf') return


  return Promise.all(Object.keys(this.navigation).map(getLinks, this))
  .then(setPages)
}

function processBlock()
{
  var book = this.book

  var language = book.config.options.language || 'en'

  var block = pages.map(function(page)
  {
    var level = page.level
    var title = page.title
    if(level && level != 0) title = level+' '+title

    return '### '+title+'\n' + page.links.map(function(link)
    {
      var linkUrl = link.url

      // Intra-book links
      if(isInternalLink(linkUrl))
      {
        // Get link anchor
        var anchor = link.anchor
        if(anchor) anchor = ' > '+anchor

//        // Compose link
//        linkUrl = linkPath+path.basename(linkUrl, extension)+anchor

        linkUrl = intl[language].replace(/__REF__/, '*'+linkUrl+'*')
      }

      return link.index+'. '+linkUrl
    }).join('\n')
  }).join('\n\n')

  var options =
  {
    path: this.ctx.file.path,
    type: 'markdown'
  }

  return book.formatString('markdown', block)
}

function processPage(page)
{
  var options = this.config.options

  if(options.generator !== 'pdf') return page

  var language = intl[options.language || 'en']

  getPageLinks(page, getMaxFootnote(page.content))
  .map(setRef, page)
  .filter(isInternalLink)
  .forEach(function createFootnote(link)
  {
    var linkUrl = language.replace(/__REF__/, '*'+link.url+'*')

    page.content += '\n[^'+link.index+']: '+linkUrl
  })

  return page
}


exports.init         = init
exports.processBlock = processBlock
exports.processPage  = processPage
