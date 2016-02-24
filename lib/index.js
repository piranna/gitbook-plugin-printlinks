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
    printlinks:
    {
      process: processBlock
    }
  },

  hooks:
  {
    // Before book pages has been converted to html
    init: init,

    // Before parsing markdown
    'page:before': processPage
  }
}
