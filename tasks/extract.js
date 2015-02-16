var cheerio = require('cheerio');
var po = require('pofile');
var esprima = require('esprima');

var escapeRegex = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;

var mkAttrRegex = function (startDelim, endDelim) {
    var start = startDelim.replace(escapeRegex, "\\$&");
    var end = endDelim.replace(escapeRegex, "\\$&");
    return new RegExp(start + '\\s*(\'|"|&quot;)(.*?)\\1\\s*\\|\\s*translate\\s*' + end, 'g');
};

module.exports = function (grunt) {
    grunt.registerMultiTask('nggettext_extract', 'Extract strings from views', function () {
        var options = this.options({
            startDelim: '{{',
            endDelim: '}}'
        });
        var attrRegex = mkAttrRegex(options.startDelim, options.endDelim); 
        var scala_gettext = this.data.scala_gettext || "Messages";

        this.files.forEach(function (file) {
            var failed = false;
            var catalog = new po();
            var strings = {};

            function addString(file, string, plural) {
                string = string.trim();

                if (!strings[string]) {
                    strings[string] = new po.Item();
                }

                var item = strings[string];
                item.msgid = string;
                if (item.references.indexOf(file) < 0) {
                    item.references.push(file);
                }
                if (plural && plural !== '') {
                    if (item.msgid_plural && item.msgid_plural !== plural) {
                        grunt.log.error("Incompatible plural definitions for " + string + ": " + item.msgid_plural + " / " + plural + " (in: " + (item.references.join(", ")) + ")");
                        failed = true;
                    }
                    item.msgid_plural = plural;
                    item.msgstr = ["", ""];
                }
            }

            function extractHtml(filename) {
                grunt.log.debug("Extracting " + filename);
                var src = grunt.file.read(filename);
                var $ = cheerio.load(src);

                $('*').each(function (index, n) {
                    var node, plural, str;
                    node = $(n);
                    if (typeof node.attr('translate') !== 'undefined') {
                        str = node.html();
                        plural = node.attr('translate-plural');
                        addString(filename, str, plural);
                    }
                });

                var matches;
                while (matches = attrRegex.exec(src)) {
                    addString(filename, matches[2]);
                }
            }

            function extractScala(filename) {
                var pattern = new RegExp(scala_gettext + '\\((?:"""([\\s\\S]*)"""|"((?:\\\\"|[^"])*)")', 'gm');
                var src = grunt.file.read(filename);
                var match;
                while (match = pattern.exec(src)) {
                    var txt = match[1] || match[2];
                    if (txt) {
                        addString(filename, txt);
                    }
                }
            }
            
            function walkJs(node, fn) {
                fn(node);

                for (var key in node) {
                    var obj = node[key];
                    if (typeof obj === 'object') {
                        walkJs(obj, fn);
                    }
                }
            }

            function extractJs(filename) {
                grunt.log.debug("Extracting " + filename);
                var src = grunt.file.read(filename);
                var syntax = esprima.parse(src, {
                    tolerant: true
                });

                function isCall(node) {
                    return node.type === 'CallExpression' &&
                        node.callee != null;
                }

                function isCalleeIdentifier(callee, name) {
                    return callee.type === 'Identifier' &&
                        callee.name === name;
                }

                function isCalleeMember(callee, name) {
                    return callee.type === 'MemberExpression' &&
                        callee.property.type === 'Identifier' &&
                        callee.property.name === 'gettext';
                }

                walkJs(syntax, function (node) {
                    if (
                        node !== null &&
                        isCall(node) &&
                        (
                            isCalleeIdentifier(node.callee, 'gettext') ||
                            isCalleeMember(node.callee, 'gettext') ||
                            (
                                isCall(node.callee) &&
                                isCalleeMember(node.callee.callee, 'gettext')
                            )
                        )
                    ) {
                        var str = node['arguments'][0] ? node['arguments'][0].value : null;
                        if (str) {
                            addString(filename, str);
                        }
                    }
                });
            }

            file.src.forEach(function (input) {
                if (input.match(/\.(htm(|l)|php|phtml)$/)) {
                    extractHtml(input);
                }
                if (input.match(/\.(scala(|\.html))$/)) {
                    extractScala(input);
                }
                if (input.match(/\.js$/)) {
                    extractJs(input);
                }
            });

            catalog.headers = {
                "Content-Type": "text/plain; charset=UTF-8",
                "Content-Transfer-Encoding": "8bit"
            };

            for (var key in strings) {
                catalog.items.push(strings[key]);
            }

            catalog.items.sort(function (a, b) {
                return a.msgid.localeCompare(b.msgid);
            });

            if (!failed) {
                grunt.file.write(file.dest, catalog.toString());
            }
        });
    });
};

module.exports.mkAttrRegex = mkAttrRegex;
