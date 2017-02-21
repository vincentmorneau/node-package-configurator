// Wrap an HTMLElement around each element in an HTMLElement array.
HTMLElement.prototype.wrap = function(elms) {
    // Convert `elms` to an array, if necessary.
    if (!elms.length) elms = [elms];

    // Loops backwards to prevent having to clone the wrapper on the
    // first element (see `child` below).
    for (var i = elms.length - 1; i >= 0; i--) {
        var child = (i > 0) ? this.cloneNode(true) : this;
        var el    = elms[i];

        // Cache the current parent and sibling.
        var parent  = el.parentNode;
        var sibling = el.nextSibling;

        // Wrap the element (is automatically removed from its current
        // parent).
        child.appendChild(el);

        // If the element had a sibling, insert the wrapper before
        // the sibling to maintain the HTML structure; otherwise, just
        // append it to the parent.
        if (sibling) {
            parent.insertBefore(child, sibling);
        } else {
            parent.appendChild(child);
        }
    }
};

(function() {
    var BrutusinForms = brutusin["json-forms"];

    // Buttons
    BrutusinForms.addDecorator(function(element, schema) {
        if (element.tagName) {
            var tagName = element.tagName.toLowerCase();
            if (tagName === "button") {
                var className = element.className;

                if (className === "remove") {
                    element.className += " secondary-color-bg";
                } else {
                    element.className += " primary-color-bg";
                }

                element.className += " btn";
            }
        }
    });

    // Select
    BrutusinForms.addDecorator(function(element, schema) {
        if (element.tagName) {
            var tagName = element.tagName.toLowerCase();
            if (tagName === "select") {
                $(element).material_select();
            }
        }
    });

    // Inputs
    BrutusinForms.addDecorator(function(element, schema) {
        if (element.tagName) {
            var tagName = element.tagName.toLowerCase();
            if (tagName === "input") {
                var inputContainer = document.createElement('div');
                inputContainer.className = "input-container";
                inputContainer.wrap(element);
            }
        }
    });

    // Checkbox and radio
    BrutusinForms.addDecorator(function(element, schema) {
        if (element.type === "checkbox" || element.type === "radio") {
            if (!element.id) {
                element.id = Materialize.guid();
            }

            if (!element.nextElementSibling) {
                var label = document.createElement("label");
                label.setAttribute("for", element.id);
                element.parentNode.appendChild(label);
            }
        }
    });

    // Labels
    BrutusinForms.addDecorator(function(element, schema) {
        if (element.tagName) {
            var tagName = element.tagName.toLowerCase();
            if (tagName === "label") {
                if (element.title) {
                    var icon = document.createElement("i");
                    icon.className = "material-icons tooltipped";
                    icon.setAttribute("data-position", "top");
                    icon.setAttribute("data-tooltip", element.title);
                    icon.innerHTML = "help";
                    var parent = element.parentNode;
                    parent.insertBefore(icon, parent.firstChild);
                    element.removeAttribute("title");
                }
            }
        }
    });

    // Collapsibles
    BrutusinForms.addDecorator(function(element, schema) {
        if (element.tagName) {
            var tagName = element.tagName.toLowerCase();

            if (tagName === "table" && element.className == "object") {
                var parentNode = element.parentNode.parentNode;
                if (parentNode.tagName.toLowerCase() === "tr") {
                    parentNode.className += " collapsible";
                    parentNode.setAttribute("data-collapsible", "expandable");

                    for (var i = 0; i < parentNode.children.length; i++)
                        if (parentNode.children[i].className === "prop-name") {
                            parentNode.children[i].className += " collapsible-header secondary-color-text";
                        } else if (parentNode.children[i].className === "prop-value") {
                            parentNode.children[i].className += " collapsible-body";
                        }
                }
            }
        }
    });
}());
