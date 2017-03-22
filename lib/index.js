var externalLinksAreReferences = require('./utils').externalLinksAreReferences
var footnotes                  = require('./footnotes')
var references                 = require('./references')

var init         = references.init
var processBlock = references.processBlock


function processPage(page)
{
  var func = externalLinksAreReferences(this)
           ? references.processPage
           : footnotes.processPage

  return func.call(this, page)
}


module.exports =
{
  blocks:
  {
    // will contain an aggregated list of all external links sorted by page
    // user must place it somewhere in the book
    printlinks:
    {
      // before parsing HTML
      process: processBlock
    }
  },

  hooks:
  {
    // called after book is parsed, but not converted
    // called for each language book!
    init: init,

    // Before parsing markdown
    'page:before': processPage
  }
}
