var path = require('path')
var url  = require('url')

var intl = require('./intl.json')

// Already defined footnotes
const reFootnotes = /\[\^.+?\]: /igm


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

function extractIndexes(item)
{
  return item.replace(/\.\s+/, '.')
}


function processPage(page)
{
  var options = this.config.options

  if(options.generator === 'pdf')
  {
    var language = options.language || 'en'

    // Not-image links, or links not wrapping images
    var image = '\\!\\[.*?\\]\\(.+?\\)'
    var link = '\\[(?!.*?'+image+').+?\\]\\((.+?)\\)'
    const re = new RegExp('(\\n?(?:  )*\\d+\\.\\s*|\\!|)'+link, 'igm')

    var index = getMaxFootnote(page.content) + 1

    var link
    while((link = re.exec(page.content)) !== null)
    {
      if(link[1] === '')
      {
        var linkUrl = link[2]

        // Intra-book links
        if(!url.parse(linkUrl).host)
        {
          linkUrl = decodeURI(url.resolve(page.path, linkUrl))

          // Link path
          var linkPath = linkUrl.match(/\d+\.\s+/ig)
          linkPath = linkPath.slice(0, linkPath.length-1).map(extractIndexes).join('')

          // Extract anchor
          var anchor = linkUrl.split('#')
          linkUrl = anchor.shift()
          anchor = anchor.join('#')
          if(anchor) anchor = ' > '+anchor

          // File extension
          var extension = path.extname(linkUrl)
          if(extension !== '.html' && extension !== '.md') extension = undefined

          // Create footnote
          linkUrl = intl[language].replace(/__REF__/, '*'+linkPath+path.basename(linkUrl, extension)+anchor+'*')
        }

        page.content = page.content.replace(link[0], link[0] + '[^'+index+']')
                     + '\n[^'+index+']: '+linkUrl;

        index++
      }
    }
  }

  return page;
}


module.exports =
{
  hooks:
  {
    // Before parsing markdown
    "page:before": processPage
  }
};
