var getFilename = function(file) {
	return file.substr(0, file.lastIndexOf('.'));
};

var formInit = function(project, config, buttons) {
	$("#sidenav-overlay").remove();
	$(container).html("");
	bf.render(container, config || {});
	$(".buttons").html(buttons || '<button class="btn waves-effect waves-light secondary-color-bg save" type="button"><i class="material-icons">save</i></button>');
	$(".side-nav > li").removeClass("active");
	$("#original-project, #active-project").val(project);
	$("[data-project='" + project + "']").parent().addClass("active");
	npc.material.init();
};

var preventProjectDuplicates = function(project, cb) {
	if ($("[data-project='" + project + "']").length > 0) {
		// setTimeout is used to prevent multiple prompts at once
		setTimeout(function(){
			alertify.prompt('Project exists', 'This project already exists. Please use a different name.', project, function(evt, value) {
					preventProjectDuplicates(value, cb);
				}, function() {});
			}, 1);
	} else {
		cb();
	}
};

/**
 * @npc
 **/
var npc = npc || {};

npc.dependencies = {
	hideShow: function(el) {
		var triggerField = $(el).data("schema-id");

		// Hide all children
		$("[data-showif-field*='" + triggerField + "']").closest("tr").hide();

		$("[data-showif-field*='" + triggerField + "']").each(function(){
			var parentFields = $(this).data("showif-field").toString().split(',');
			var parentValues = $(this).data("showif-value").toString().split(',');
			var show = true;

			// Loop in all parents
			for (i = 0; i < parentFields.length; i++) {
				var parentField = parentFields[i];
				var parentValue = parentValues[i];
				var parentObject = $("[data-schema-id='" + parentField + "']");
				var compareValue;

				if (parentObject.is(":checkbox")) {
					compareValue = parentObject.prop("checked");
				} else {
					compareValue = parentObject.val();
				}

				if (compareValue.toString() != parentValue.toString()) {
					show = false;
				}
			}

			if (show) {
				$(this).closest("tr").show();
			}
		});
	},

	selector: function() {
		var selector = $("[data-showif-field]")
			.map(function() {
				var arr = $(this).data("showif-field").split(",");
				var ret = [];

				for (i = 0; i < arr.length; i++) {
					ret.push('[data-schema-id="' + arr[i] + '"]');
				}

				return ret;
			}).get();

		selector = selector.filter(function(v, i) {
			return selector.indexOf(v) == i;
		}).join(",");

		return selector;
	}
};

npc.file = {
	export: function() {
		var validate = bf.validate();

		if (validate) {
			var config = bf.getData();
			var blob = new Blob([JSON.stringify(config)], {
				type: "application/json;charset=utf-8"
			});
			saveAs(blob, $("#active-project").val() + ".json");
		} else {
			alertify.warning('Please review the errors.');
		}
	},

	import: function() {
		var input, file, fr;

		if (typeof window.FileReader !== 'function') {
			console.error("The file API isn't supported on this browser yet.");
			return;
		}

		input = document.getElementById('import');

		if (!input) {
			console.error("Um, couldn't find the import element.");
		} else if (!input.files) {
			console.error("This browser doesn't seem to support the `files` property of file inputs.");
		} else if (!input.files[0]) {
			console.error("Please select a file first.");
		} else {
			file = input.files[0];
			fr = new FileReader();
			fr.onload = receivedText;
			fr.readAsText(file);
		}

		function receivedText(e) {
			lines = e.target.result;
			var project = getFilename($(".file-path").val());
			try {
				var config = JSON.parse(lines);

				if ($("[data-project='" + project + "']").length > 0) {
					alertify.prompt('Project exists.', 'This project already exists. Please rename it or delete the existing one.', project, function(evt, newProject) {
						// Ensures we are not importing a file under the same project name
						preventProjectDuplicates(newProject, function(){
							formInit(newProject, config);
						});
					}, function() {});
				} else {
					formInit(project, config);
				}
			} catch (err) {
				alertify.error('That file is not compatible with this project JSON Schema.');
			}
		}
	}
};

npc.material = {
	init: function() {
		$(".button-collapse").sideNav({
			draggable: true
		});
		$("select").material_select();
		Materialize.updateTextFields();
		$("[data-tooltip][data-tooltip!='']").tooltip();

		$(npc.dependencies.selector()).each(function() {
			npc.dependencies.hideShow(this);
		});
	}
};

npc.get = {
	new: function(project) {
		formInit(project);
	},

	project: function(project) {
		var url = window.location.href + "project/" + project;
		$.get(url, function(data) {
			if (data.success) {
				formInit(project, data.config, data.buttons);
			} else {
				npc.material.init();
			}
		});
	}
};

npc.post = {
	save: function() {
		var validate = bf.validate();

		if ($("#active-project").val() == "") {
			alertify.warning('Project name is required.');
			$("#active-project").focus();
		}

		if (validate && $("#active-project").val() != "") {
			var config = bf.getData();
			$.ajax({
				type: "POST",
				url: window.location.href + "save",
				contentType: 'application/json',
				data: JSON.stringify({
					originalProject: $("#original-project").val(),
					project: $("#active-project").val(),
					config: config
				}),
				success: function(data) {
					if (data.success) {
						alertify.success('Project was saved successfully.');
						$(".buttons").html(data.buttons);
						$(".side-nav").html(data.menu);
					} else {
						alertify.error('Error while saving.');
					}
				}
			});
		} else {
			alertify.warning('Please review the errors.');
		}
	},

	delete: function() {
		alertify.confirm(
			'Confirmation',
			'Delete this project?',
			function() {
				$.ajax({
					type: "POST",
					url: window.location.href + "delete",
					contentType: 'application/json',
					data: JSON.stringify({
						originalProject: $("#original-project").val(),
						project: $("#active-project").val()
					}),
					success: function(data) {
						if (data.success) {
							alertify.success('Project was deleted successfully.');
							$(".side-nav").html(data.menu);
							formInit("");
						} else {
							alertify.error('Error while deleting.');
						}
					}
				});
			},
			function() {}
		);
	}
};

$(document).ready(function() {
	// Initialize Dropdowns
	npc.material.init();

	// Initial load for the chosen project
	if ($("#active-project").val() !== "") {
		npc.get.project($("#active-project").val());
	}

	// Event when switching projects
	$(document).on('click', '.project', function() {
		npc.get.project($(this).data("project"));
	});

	// Event when creating a new project from scratch
	$(document).on('click', '.create', function() {
		alertify.prompt('New project', 'Enter the name for your new project.', $("#active-project").val(), function(evt, project) {
			// Ensures we are not importing a file under the same project name
			preventProjectDuplicates(project, function(){
				npc.get.new(project);
			});
		}, function() {});
	});

	// Event when creating a new project from scratch
	$(document).on('blur', '#active-project', function() {
		if ($("#original-project").val() != $("#active-project").val()) {
			if ($("[data-project='" + $("#active-project").val() + "']").length > 0) {
				alertify.prompt('Project name conflict', 'Another project uses this name. Please choose a unique name or delete the existing one.', $("#active-project").val(), function(evt, value) {
					// Ensures we are not importing a file under the same project name
					preventProjectDuplicates(value, function(){});
				}, function() {
					$("#active-project").val("");
				});
			}
		}
	});


	// Event when saving a project
	$(document).on('click', '.save', function() {
		npc.post.save();
	});

	// Event when deleting a project
	$(document).on('click', '.delete', function() {
		npc.post.delete();
	});

	// Event when exporting a project
	$(document).on('click', '.export', function() {
		npc.file.export();
	});

	// Event when importing a project
	$(document).on('change', '#import', function() {
		npc.file.import();
	});

	// Event to deal with dependent fields (hide and show)
	$(document).on('change', npc.dependencies.selector(), function() {
		npc.dependencies.hideShow(this);
	});
});
