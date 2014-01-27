var po = require('pofile');

var isMsgDefined = function (msg) {
    return msg.msgstr.reduce(function (a, b) {
        return a || !!b;
    }, false);
};

module.exports = function (grunt) {
    grunt.registerMultiTask('nggettext_check', 'Check po files against template for completeness', function () {
        this.files.forEach(function (file) {
            var template = po.parse(grunt.file.read(file.dest));
            var msgs = template.items.map(function (msg) {
                return msg.msgid;
            });
    
            file.src.forEach(function (src) {
                var catalog = po.parse(grunt.file.read(src));
                var dict = {};
                catalog.items.forEach(function (msg) {
                    dict[msg.msgid] = msg;
                });
                msgs.forEach(function (key) {
                    if (!(key in dict && isMsgDefined(dict[key]))) {
                        grunt.log.error(src, "is missing", "\"" + key + "\"");
                    }
                });
            });
        });
    });
};