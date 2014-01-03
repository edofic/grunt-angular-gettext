var po = require('pofile');

var template = function (module, body) {
    return "angular.module(\"" + module + "\").run(['gettextCatalog', function (gettextCatalog) {\n" + body + "\n}]);";
};

var langTemplate = function (language, strings) {
    return "    gettextCatalog.setStrings('" + language + "', " + (JSON.stringify(strings)) + ");\n";
};

var processJs = function (grunt, file, options) { 
    var body = '';
    
    file.src.forEach(function (input) {
        var data = grunt.file.read(input);
        var catalog = po.parse(data);

        if (!catalog.headers.Language) {
            throw new Error('No Language header found!');
        }

        var strings = {};
        for (var i = 0; i < catalog.items.length; i++) {
            var item = catalog.items[i];
            strings[item.msgid] = item.msgstr.length === 1 ? item.msgstr[0] : item.msgstr;
        }

        body += langTemplate(catalog.headers.Language, strings);
    });
    
    grunt.file.write(file.dest, template(options.module, body));
};

var propertiesEscapeKey = function (key) {
    return key.replace(/[ \\=]/g, function (c) {
        return "\\" + c;
    });
};

var processProperties = function (grunt, file) {
    var items = {};
    
    file.src.forEach(function (input) {
        var data = grunt.file.read(input);
        var catalog = po.parse(data);

        if (!catalog.headers.Language) {
            throw new Error('No Language header found!');
        }

        for (var i = 0; i < catalog.items.length; i++) {
            var item = catalog.items[i];
            var string = item.msgstr.length === 1 ? item.msgstr[0] : item.msgstr;
            if (string && !items[item.msgid]) {
                items[item.msgid] = {
                    "references": item.references,
                    "string": string
                };
            }
        }
    });

    var body = '';
    for (var id in items) {
        var item = items[id];
        for (var i = 0; i < item.references.length; i++) {
            body += "# " + item.references[i];
        }
        body += "\n";
        body += propertiesEscapeKey(id) + "=" + item.string + "\n";
        body += "\n";
    }
    console.log(body);
    grunt.file.write(file.dest, body);    
};

module.exports = function (grunt) {
    grunt.registerMultiTask('nggettext_compile', 'Compile strings from .po files', function () {
        var options = this.options({
            module: 'gettext'
        });

        this.files.forEach(function (file) {
            var dest = file.dest; 
            if (dest.match(/\.js$/)) {
                processJs(grunt, file, options);
            } else if (dest.match(/messages(\.[^\.]*)?/)) {
                processProperties(grunt, file);
            } else {
                throw new Error("Unknown file type required!");
            }
        });
    });
};
