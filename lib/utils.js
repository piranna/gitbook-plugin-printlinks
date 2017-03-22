var path = require('path')
var url  = require('url')


// Already defined footnotes
const reFootnotes = /\[\^.+?\]: /igm

// Not-image links, or links not wrapping images
var image = '\\!\\[.*?\\]\\(.+?\\)'
var link = '\\[(?!.*?'+image+').+?\\]\\((.+?)\\)'
const reLinks = '(\\n?(?:  )*\\d+\\.\\s*|\\!|)'+link


function extractIndexes(item)
{
  return item.replace(/\.\s+/, '.')
}

function getFootnoteIndex(footnote)
{
  return parseInt(footnote.slice(2, footnote.length-3))
}


//
// Public API
//

function externalLinksAreReferences(book)
{
  var options = book.config.get('pluginsConfig.printlinks') || {}

  return options.externalLinksAreReferences
}

function getMaxFootnote(content)
{
  var footnotes = content.match(reFootnotes)

  if(footnotes === null) return 0

  return footnotes.map(getFootnoteIndex).sort()[footnotes.length-1]
}

function getPageLinks(page, footIndex)
{
  const re = new RegExp(reLinks, 'igm')

  var refIndex = 0

  var links     = []
  var pageLinks = []

  var link
  while((link = re.exec(page.content)) !== null)
    if(link[1] === '')  // no "prefix" (index list or image)
    {
      var url = link[2]

      if(pageLinks.indexOf(url) > -1)
        console.error(url,'already included at',page.path)
      else
        pageLinks.push(url)

      // Extract anchor
      var anchor
      if(isInternalLink(url))
      {
        if(footIndex == null) continue

        anchor = url.split('#')
        url    = anchor.shift()
        anchor = anchor.join('#')

        var index = ++footIndex
      }
      else
        var index = ++refIndex

      links.push(
      {
        index:  index,
        link:   link[0],
        url:    url,
        anchor: anchor
      })
    }

  return links
}

function isInternalLink(link)
{
  return !url.parse(typeof link.url === 'string' ? link.url : link).host
}

function prepareInternalLink(link, page, book)
{
  var linkUrl = link.url

  // Resolve link path
  linkUrl = decodeURI(url.resolve(page.path, linkUrl))
  // get linked page title & create md link
  linkedPage = book.getPageByPath(linkUrl)
  linkUrl = `[${linkedPage.level} ${linkedPage.title}](${linkUrl})`

  // File extension
  var extension = path.extname(linkUrl)
  if(extension !== '.html' && extension !== '.md') extension = undefined

  // Link path
  var linkPath = linkUrl.match(/\d+\.\s+/ig)
  if (linkPath) {
    // what is this supposed to do?!
    // THROWS "Cannot read property 'slice' of null" for empty url
    linkPath = linkPath.slice(0, linkPath.length-1)
    linkPath.map(extractIndexes).join('')
  } else {
    linkPath = ''
  }

  // Get link anchor
  var anchor = link.anchor
  if (anchor) anchor = `> ${anchor}`

  // Compose link
  link.url = `${linkPath} *${linkUrl}* ${anchor}`
}


exports.externalLinksAreReferences = externalLinksAreReferences
exports.getMaxFootnote             = getMaxFootnote
exports.getPageLinks               = getPageLinks
exports.isInternalLink             = isInternalLink
exports.prepareInternalLink        = prepareInternalLink
