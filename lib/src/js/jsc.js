/**
* @materialAPEX
**/
var jsc = jsc || {};

jsc.material = {
    init: function() {
        $(".button-collapse").sideNav({
            // closeOnClick: true, // waiting on to be fixed https://github.com/Dogfalo/materialize/pull/4119/files
            draggable: true
        });
        $("select").material_select();
        Materialize.updateTextFields();
        $("[data-tooltip][data-tooltip!='']").tooltip();
    }
};

jsc.get = {
    project: function(el) {
        var url = window.location.href + "project/" + $(el).data("project");
        $.get(url, function( data ) {
            if (data.success) {
                $("#configurator").html("");
                bf.render(container, data.config || {});
                $(".buttons").html(data.buttons);

                $(".side-nav > li").removeClass("active");
                $(el).parent().addClass("active");
                $("#active-project").val($(el).data("project"));
                $(".project-title").text(" - " + $(el).data("project"));
                jsc.material.init();
            } else {
                console.error(data.message);
                alertify.error('Error while loading.');
            }
        });
    }
};

jsc.post = {
    save: function() {
        var validate = bf.validate();

        if (validate) {
            var data = bf.getData();

            $.ajax({
                type: "POST",
                url: window.location.href + "save",
                data: {project: $("#active-project").val(), config: data},
                success: function(data) {
                    if (data.success) {
                        alertify.success('Project was saved successfully.');
                    } else {
                        console.error(data.message);
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
            function(){
                $.ajax({
                    type: "POST",
                    url: window.location.href + "delete",
                    data: {project: $("#active-project").val()},
                    success: function(data) {
                        if (data.success) {
                            alertify.success('Project was deleted successfully.');
                            $("#configurator").html("<h4>Select a project.</h4>");
                            $("#active-project").val("");
                            $(".project-title").text("");
                            $(".side-nav > li.active").remove();
                            $(".buttons").html("");
                        } else {
                            console.error(data.message);
                            alertify.error('Error while deleting.');
                        }
                    }
                });
            },
            function(){}
        );
    }
};

$(document).ready(function() {
    jsc.material.init();

    $(document).on('click', '.project', function(){
        jsc.get.project(this);
    });

    $(document).on('click', '.save', function(){
        jsc.post.save();
    });

    $(document).on('click', '.delete', function(){
        jsc.post.delete();
    });
});
