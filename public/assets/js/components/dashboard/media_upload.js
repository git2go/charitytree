"use strict";

import React from 'react';

export function MediaUpload(props) {
    const isAdvancedUpload = function() {
        const div = document.createElement('div');
        return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div))
        && 'FormData' in window && 'FileReader' in window;
    }();

    let $form = $('.box');
    let $input = $form.find('input[type="file"]'), $label = $form.find('label');
    let showFiles = function(files) {
        $label.text(files.length > 1 ? ($input.attr('data-multiple-caption') || '').replace( '{count}', files.length ) : files[0].name);
    };

    if (isAdvancedUpload) { $form.addClass('has-advanced-upload'); }

    if (isAdvancedUpload) {
        let droppedFiles = false;

        $form.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
        })
        .on('dragover dragenter', function() {
            $form.addClass('is-dragover');
        })
        .on('dragleave dragend drop', function() {
            $form.removeClass('is-dragover');
        })
        .on('drop', function(e) {
            droppedFiles = e.originalEvent.dataTransfer.files;
            showFiles( droppedFiles );
            //   $form.trigger('submit');
        });
    }

    $input.on('change', function(e) {
        showFiles(e.target.files);
    });

    $form.on('submit', function(e) {
        e.preventDefault();
        if ($form.hasClass('is-uploading')) {
            $label.html('<span><strong>Uploading...</strong></span>');
            return false;
        }

        if (isAdvancedUpload) {
            ajaxModern(e); // ajax for modern browsers
        } else {
            nonModernAjax(); // ajax for legacy browsers
        }
    });

    const ajaxModern = function() {
        let ajaxData = new FormData($form[0]);

        if (droppedFiles) {
            $form.addClass('is-uploading').removeClass('is-error');
            $.each( droppedFiles, function(i, file) {
                ajaxData.append( $input.attr('name'), file );
                // sendFile(file);
            });
        }
        $.ajax({
            url: $form.attr('action'),
            type: $form.attr('method'),
            data: ajaxData,
            dataType: 'json',
            cache: false,
            contentType: false,
            processData: false,
            complete() {
                $form.removeClass('is-uploading');
            },
            success(response) {
                $form.addClass( response.status === 201 ? 'is-success' : 'is-error' );
                $input.val(""); //remove file from input field
                //update label
                $label.html('<strong>Choose a file</strong><span className="box__dragndrop"> or drag it here</span>')
                if ('update_db_state_prop' in props) {
                    props.update_db_state_prop(response.results);
                }
            },
            error() {
                //log error
            }
        });
    }

    const nonModernAjax = function() {
        let iframeName  = 'uploadiframe' + new Date().getTime();
        let $iframe = $('<iframe name="' + iframeName + '" style="display: none;"></iframe>');

        $('body').append($iframe);
        $form.attr('target', iframeName);

        $iframe.one('load', function() {
            var data = JSON.parse($iframe.contents().find('body' ).text());
            $form.removeClass('is-uploading')
            .addClass(data.success == true ? 'is-success' : 'is-error')
            .removeAttr('target');
            $form.removeAttr('target');
            $iframe.remove();
        });
    }

    return (
        <form className="box" method="post" action={props.action} encType="multipart/form-data">
            <button className="box__button btn blue" type="submit">Upload</button>
            <div className="box__input project-card">
                <input className="box__file" type="file" name="media" id="file" accept="image/*,video/*" data-multiple-caption="{count} files selected" multiple />
                <label htmlFor="file"><strong>Choose a file</strong><span className="box__dragndrop"> or drag it here</span></label>
                {/*For uploading media to a project*/}
                <input name="project" type="hidden" defaultValue={props.project} />
            </div>
            <div className="box__uploading">Uploading&hellip;</div>
            <div className="box__success">Done!</div>
            <div className="box__error">Error!</div>
        </form>
    );
}
