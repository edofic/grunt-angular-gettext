angular.module("myApp").controller("helloController", function (gettext) {
    var myString = gettext("Hello");
    gettext(); // Should be ignored.
    this.gettext = gettext;
    var anotherString = this.gettext("Universe");
    this.gettext = function() { return gettext; };
    var anotherString = this.gettext()("World");
});
