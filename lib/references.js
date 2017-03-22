var intl  = require('../intl.json')
var utils = require('./utils')

var externalLinksAreReferences = utils.externalLinksAreReferences
var getMaxFootnote             = utils.getMaxFootnote
var getPageLinks               = utils.getPageLinks
var isInternalLink             = utils.isInternalLink
var prepareInternalLink        = utils.prepareInternalLink

var pages = []

/* 3 PIPELINE process block */
function createOrderedList(link)
{
  return link.index+'. '+link.url
}

function createPageReferences(page)
{
  var level = page.level
  var title = page.title
  if(level && level != 0) title = level+' '+title

  return '### '+title+'\n' + page.links.map(createOrderedList).join('\n')
}

/* 2 PIPELINE before:page */
function filterPages(page)
{
  return page !== undefined
}

/* 1 PIPELINE init book */
function getLinks(file)
{
  const page = this.getPageByPath(file),
    links = getPageLinks(page)

  if(!links.length) return

  const { title, level } = page.progress.current
  return { title, level, links }
}

/* 2 PIPELINE before:page */
function setPages(result)
{
  pages = result.filter(filterPages).sort(sortPages)

  // Check duplicated links
  pages.forEach(function(page)
  {
    page.links.forEach(function(link)
    {
      var url   = link.url
      var level = this[url]

      if(level)
        return console.warn(url,'from',page.level,'already included at',level)

      this[url] = page.level
    }, this)
  }, {})
}

/* 2 PIPELINE before:page */
function setRef(link)
{
  var index = link.index

  if(isInternalLink(link.url))
  {
    this.content = this.content.replace(link.link, link.link + '[^'+index+']')

    prepareInternalLink(link, this)
  }
  else
    this.content = this.content.replace(link.link, link.link + '['+index+']')

  return link
}

/* 2 PIPELINE before:page */
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


//
// Public API
//

/* 1 PIPELINE init book */
function init()
{
  if(!externalLinksAreReferences(this)) return

  if(this.output.name !== 'ebook') return

  const pageLinks = Object.keys(this.navigation).map(getLinks, this)
  return setPages(pageLinks);
}

/* 3 PIPELINE process block */
function processBlock(block)
{
  var listOfReferences = pages.map(createPageReferences).join('\n\n')
  return this.renderBlock('markdown', `${block.body}\n\n${listOfReferences}`)
}

/* 2 PIPELINE before:page */
function processPage(page)
{
  var options = this.config.options

  if(this.output.name !== 'ebook') return page

  var language = intl[options.language] || intl['en']

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
