var footnotes          = require('./footnotes')
var linksAreReferences = require('./utils').linksAreReferences
var references         = require('./references')

var init         = references.init
var processBlock = references.processBlock


function processPage(page)
{
  var func = linksAreReferences(this)
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
