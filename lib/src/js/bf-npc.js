(function () {
	brutusin["json-forms"].onValidationError = function (element, message) {
		element.focus();
		if (!element.className.includes("error")) {
			element.classList.add("error");
			element.parentNode.classList.add("error");
			element.parentNode.setAttribute("data-error", message);
		}
	};

	brutusin["json-forms"].onValidationSuccess = function (element) {
		if (element.className.includes("error")) {
			element.classList.remove("error");
			element.parentNode.classList.remove("error");
			element.parentNode.removeAttribute("data-error");
		}
	};
}());
