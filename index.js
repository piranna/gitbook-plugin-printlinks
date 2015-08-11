function processPage(page)
{
  const re = /[^!]\[[^!][^\]]+\]\(([^\)]+)\)/igm

  var link
  while((link = re.exec(page.content)) !== null)
  {
    var url = link[1]

    console.log('url:', url)

    page.content = page.content.replace(link[0], link[0] + '[^'+link.index+']')
                 + '[^'+link.index+']: '+url+'\n';
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
