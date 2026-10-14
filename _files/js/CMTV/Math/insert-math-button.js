var CMTV_Math = window.CMTV_Math || {};

!function(window, document)
{
    "use strict";

    CMTV_Math.EditorDialogMath = XF.extend(XF.EditorDialog, {
        form: null,
        formHandler: null,

        _beforeShow: function (overlay)
        {
            this.ed.$el.blur();
        },

        _init: function (overlay)
        {
            this.form = document.querySelector('#editor_math_form');
            XF.on(this.form, 'submit', this.submit.bind(this));

            this.formHandler = XF.Element.getHandler(this.form, 'insert-math-form');
        },

        afterShow: function (overlay)
        {
            // The base implementation focuses the first input, which is the "type" radio
            this._afterShow(overlay);
            this.formHandler.latexInput.focus();
        },

        submit: function (e)
        {
            e.preventDefault();

            var ed = this.ed,
                overlay = this.overlay;

            var toInsert = this.formHandler.wrapMath(this.formHandler.latexInput.value.trim());

            ed.selection.restore();
            ed.undo.saveStep();
            ed.html.insert(XF.htmlspecialchars(toInsert));
            ed.undo.saveStep();
            XF.EditorHelpers.normalizeAfterInsert(ed);

            overlay.hide();
            XF.trigger(this.form, 'form:reset');
        }
    });

    // Must match the "editor_dialog" listener hint. XF 2.3 no longer strips underscores from the dialog name.
    XF.EditorHelpers.dialogs.CMTVMath = new CMTV_Math.EditorDialogMath('CMTV_Math');

    //
    // Registering "Insert math" button in Froala editor
    //

    XF.on(document, 'editor:first-start', function ()
    {
        XF.FE.DefineIcon('CMTV_Math', { NAME: 'function' });
        XF.FE.RegisterCommand('CMTV_Math', {
            title: 'CMTV_Math_insert_math',
            icon: 'CMTV_Math',
            undo: true,
            focus: true,
            callback: function ()
            {
                XF.EditorHelpers.loadDialog(this, 'CMTVMath');
            }
        });

        XF.editorStart.custom.push('CMTV_Math');
    });
}
(window, document);
