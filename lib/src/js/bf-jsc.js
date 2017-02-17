(function () {
    brutusin["json-forms"].onValidationError = function (element, message) {
        element.focus();
        if (!element.className.includes(" error")) {
            element.className += " error";
            element.parentNode.className += " error";
            element.parentNode.setAttribute("data-error", message);
        }
    };

    brutusin["json-forms"].onValidationSuccess = function (element) {
        if (element.className.includes(" error")) {
            element.className = element.className.replace(" error", "");
            element.parentNode.className = element.className.replace(" error", "");
            element.parentNode.removeAttribute("data-error");
        }
    };
}());
