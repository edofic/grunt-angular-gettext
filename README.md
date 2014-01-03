# grunt-angular-play-gettext

> Tasks for extracting/compiling angular-gettext strings.

Used in combination with [`angular-gettext`](https://github.com/rubenv/angular-gettext).

[![Build Status](https://travis-ci.org/edofic/grunt-angular-play-gettext.png?branch=master)](https://travis-ci.org/edofic/grunt-angular-play-gettext)

Check the website for usage instructions: [http://angular-gettext.rocketeer.be/](http://angular-gettext.rocketeer.be/).

This fork also supports extraction from Scala and PlayFramework2 templates and can compile to Java properties files suitable for Play i18n. Thus supporting internationalization of Angular and Play using same po files.

Example `Gruntfile.coffee`

    module.exports = (grunt) ->
      
      # Project configuration.
      grunt.initConfig
        pkg: grunt.file.readJSON("package.json")
        nggettext_extract:
          pot:
            files:
              "po/template.pot": ["app/views/*.html", "app/views/*/*.html", "app/views/*/*/*.html"]

        nggettext_compile:
          all:
            files:
              "public/javascripts/translations.js": ["po/*.po"]
              "conf/messages.nl": ["po/nl.po"]

      grunt.loadNpmTasks "grunt-angular-gettext"


## License 

    (The MIT License)

    Copyright (C) 2013 by Ruben Vermeersch <ruben@savanne.be>

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
