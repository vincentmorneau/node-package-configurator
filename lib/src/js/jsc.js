var getFilename = function(file) {
	return file.substr(0, file.lastIndexOf('.'));
};

var formInit = function(project, config, buttons) {
	$("#sidenav-overlay").remove();
	$(container).html("");
	bf.render(container, config || {});
	$(".buttons").html(buttons);
	$(".side-nav > li").removeClass("active");
	$("#active-project").val(project);
	$(".project-title").text(" - " + project);
	$("[data-project='" + project + "']").parent().addClass("active");
	jsc.material.init();
};

/**
 * @jsc
 **/
var jsc = jsc || {};

jsc.dependencies = {
	hideShow: function(el) {
		if ($(el).is(":checkbox")) {
			var value = $(el).prop("checked");
		} else {
			var value = $(el).val();
		}

		$("[data-showif-field='" + $(el).data("title-name") + "']").closest("tr").hide();
		$("[data-showif-field='" + $(el).data("title-name") + "'][data-showif-value='" + value + "']").closest("tr").show();
	},

	selector: function() {
		var selector = $("[data-showif-field]")
			.map(function() {
				return '[data-title-name="' + $(this).data("showif-field") + '"]';
			}).get();

		selector = selector.filter(function(v, i) {
			return selector.indexOf(v) == i;
		}).join(",");

		return selector;
	}
};

jsc.file = {
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
				var buttons = '<button class="btn waves-effect waves-light secondary-color-bg save" type="button"><i class="material-icons">save</i></button>';
				if ($("[data-project='" + project + "']").length > 0) {
					alertify.prompt('Project exists', 'This project name already exists. Using the same name will overwrite he previous configuration. Do you wish to rename?', project, function(evt, value) {
						formInit(value, config, buttons);
					}, function() {});
				} else {
					formInit(project, config, buttons);
				}
			} catch (err) {
				alertify.error('That file is not compatible with this project JSON Schema.');
			}
		}
	}
};

jsc.material = {
	init: function() {
		$(".button-collapse").sideNav({
			// closeOnClick: true, // waiting on to be fixed https://github.com/Dogfalo/materialize/pull/4119/files
			draggable: true
		});
		$("select").material_select();
		Materialize.updateTextFields();
		$("[data-tooltip][data-tooltip!='']").tooltip();

		$(jsc.dependencies.selector()).each(function() {
			jsc.dependencies.hideShow(this);
		});
	}
};

jsc.get = {
	project: function(project) {
		var url = window.location.href + "project/" + project;
		$.get(url, function(data) {
			if (data.success) {
				formInit(project, data.config, data.buttons);
			} else {
				jsc.material.init();
			}
		});
	}
};

jsc.post = {
	save: function() {
		var validate = bf.validate();

		if (validate) {
			var config = bf.getData();
			$.ajax({
				type: "POST",
				url: window.location.href + "save",
				contentType: 'application/json',
				data: JSON.stringify({
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
						project: $("#active-project").val()
					}),
					success: function(data) {
						if (data.success) {
							alertify.success('Project was deleted successfully.');
							$(container).html("<h4>Select a project.</h4>");
							$("#active-project").val("");
							$(".project-title").text("");
							$(".side-nav").html(data.menu);
							$(".buttons").html("");
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
	jsc.get.project($("#active-project").val());

	$(document).on('click', '.project', function() {
		jsc.get.project($(this).data("project"));
	});

	$(document).on('click', '.save', function() {
		jsc.post.save();
	});

	$(document).on('click', '.delete', function() {
		jsc.post.delete();
	});

	$(document).on('click', '.export', function() {
		jsc.file.export();
	});

	$(document).on('change', '#import', function() {
		jsc.file.import();
	});

	$(document).on('change', jsc.dependencies.selector(), function() {
		jsc.dependencies.hideShow(this);
	});
});
