assert = require 'assert'
po = require 'pofile'
fs = require 'fs'

describe 'Extract: Scala', -> 
    it "Extracts strings from Scala sources", (done) ->
        file = 'tmp/test14.pot'
        assert fs.existsSync(file)

        po.load file, (err, catalog) ->
            assert.equal(err, null)
            items = catalog.items
            assert.equal items.length, 1
            assert.equal items[0].msgid, "msg with some quotes \\\""
            done()

    it "Extracts strings from Scala Play templates", (done) ->
        file = 'tmp/test15.pot'
        assert fs.existsSync(file)

        po.load file, (err, catalog) ->
            assert.equal(err, null)
            items = catalog.items
            assert.equal items.length, 1
            assert.equal items[0].msgid, "Hello \\\"world\\\""
            done()
