var isArray = Array.isArray
var pull = require('pull-stream')
var ref = require('ssb-ref')

module.exports = function (gossip, config, server) {
  if (config.offline) return void console.log("Running in offline mode: gossip disabled")

  // populate peertable with configured seeds (mainly used in testing)
  var seeds = config.seeds

  ;(isArray(seeds)  ? seeds : [seeds]).filter(Boolean)
  .forEach(function (addr) { gossip.add(addr, 'seed') })

  // populate peertable with pub announcements on the feed
  if(!config.gossip || config.gossip.pub !== false)
    pull(
      server.messagesByType({
        type: 'pub', live: true, keys: false
      }),
      pull.drain(function (msg) {
        if(msg.sync) return
        if(!msg.content.address) return
        if(ref.isAddress(msg.content.address))
          gossip.add(msg.content.address, 'pub')
      }, function () {
        //this can happen if the database closes
      })
    )

}

