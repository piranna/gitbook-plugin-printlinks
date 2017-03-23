var intl  = require('../intl.json')
var utils = require('./utils')

var getMaxFootnote      = utils.getMaxFootnote
var getPageLinks        = utils.getPageLinks
var isInternalLink      = utils.isInternalLink
var prepareInternalLink = utils.prepareInternalLink


function setRef(link)
{
  this.content = this.content.replace(link.link, link.link + '[^'+link.index+']')

  // Intra-book links
  if(isInternalLink(link.url)) prepareInternalLink(link, this)

  return link
}


//
// Public API
//

function processPage(page)
{
  if(this.output.name !== 'ebook') return page

  var i10nPrefix = intl[this.config.get('language')] || intl['en']

  getPageLinks(page, getMaxFootnote(page.content))
  .map(setRef, page)
  .forEach(function createFootnote(link)
  {
    var linkUrl = link.url

      // Intra-book links
      if(isInternalLink(linkUrl))
        linkUrl = i10nPrefix.replace(/__REF__/, '*'+linkUrl+'*')

      page.content += '\n[^'+link.index+']: '+linkUrl
    })

  return page
}


exports.processPage = processPage
