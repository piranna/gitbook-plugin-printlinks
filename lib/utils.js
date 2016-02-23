var parse = require('url').parse


// Already defined footnotes
const reFootnotes = /\[\^.+?\]: /igm

// Not-image links, or links not wrapping images
var image = '\\!\\[.*?\\]\\(.+?\\)'
var link = '\\[(?!.*?'+image+').+?\\]\\((.+?)\\)'
const reLinks = '(\\n?(?:  )*\\d+\\.\\s*|\\!|)'+link


function getFootnoteIndex(footnote)
{
  return parseInt(footnote.slice(2, footnote.length-3))
}

function getMaxFootnote(content)
{
  var footnotes = content.match(reFootnotes)

  if(footnotes === null) return 0

  return footnotes.map(getFootnoteIndex).sort()[footnotes.length-1]
}

function getPageLinks(page, index)
{
  index = index || 0

  var links = []

  const re = new RegExp(reLinks, 'igm')

  var link
  while((link = re.exec(page.content)) !== null)
    if(link[1] === '')  // no "prefix" (index list or image)
    {
      var url = link[2]

      // Extract anchor
      var anchor
      if(isInternalLink(url))
      {
        anchor = url.split('#')
        url    = anchor.shift()
        anchor = anchor.join('#')
      }

      links.push(
      {
        index:  ++index,
        link:   link[0],
        url:    url,
        anchor: anchor
      })
    }

  return links
}

function isInternalLink(url)
{
  return !parse(url).host
}

function linksAreReferences(book)
{
  var options = book.options.pluginsConfig['printlinks'] || {}

  return options.linksAreReferences
}


exports.getMaxFootnote     = getMaxFootnote
exports.getPageLinks       = getPageLinks
exports.isInternalLink     = isInternalLink
exports.linksAreReferences = linksAreReferences
