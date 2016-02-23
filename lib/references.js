var intl  = require('../intl.json')
var utils = require('./utils')

var getMaxFootnote     = utils.getMaxFootnote
var getPageLinks       = utils.getPageLinks
var isInternalLink     = utils.isInternalLink
var linksAreReferences = utils.linksAreReferences


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
  if(!linksAreReferences(this)) return

  if(this.config.options.generator !== 'pdf') return


  var book = this

  return Promise.all(Object.keys(book.navigation).map(getLinks, book))
  .then(setPages)
}

function processBlock()
{
  var book = this.book

  var language = book.config.options.language || 'en'

  var block = pages.map(function(page)
  {
    return '### '+page.level+' '+page.title+'\n' + page.links.map(function(link)
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

  return book.formatString('markdown', block).then(function(result)
  {
    console.log(result)
    return result
  })
  // return book.template.renderString(block, this.ctx, options)
  // .then(function(result)
  // {
  //   console.log(result)
  //   return result
  // })
}

function setRef(link)
{
  this.content = this.content.replace(link.link, link.link + '['+link.index+']')
}

function processPage(page)
{
  if(this.config.options.generator !== 'pdf') return page

  getPageLinks(page, getMaxFootnote(page.content)).forEach(setRef, page)

  return page
}


exports.init         = init
exports.processBlock = processBlock
exports.processPage  = processPage
