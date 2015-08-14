var parse = require('url').parse


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
  const re = /[^!]\[[^!].+?\]\((.+?)\)/igm

  var index = getMaxFootnote(page.content) + 1

  var link
  while((link = re.exec(page.content)) !== null)
  {
    var url = link[1]

    if(parse(url).host)
    {
      page.content = page.content.replace(link[0], link[0] + '[^'+index+']')
                   + '[^'+index+']: '+url+'\n';

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
