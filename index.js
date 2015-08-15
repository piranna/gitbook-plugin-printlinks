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


function processPage(page)
{
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
      page.content = page.content.replace(link[0], link[0] + '[^'+index+']')
                   + '\n[^'+index+']: '+link[2];

      index++
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
