var CMTV_Math = window.CMTV_Math || {};

!function (window, document)
{
    "use strict";

    CMTV_Math.InsertMathForm = XF.Element.newHandler({
        types: null,
        latexInput: null,
        loading: null,
        previewContainer: null,
        preview: null,
        previewError: null,
        previewEmpty: null,

        state: 'empty', // States: "empty", "error", "preview"
        resetMode: false,

        _typeTimeout: null,
        _fadeOutTimeout: null,

        typeVal: function ()
        {
            return this.target.querySelector('[name="math_type"]:checked').value;
        },

        init: function ()
        {
            this.types =                this.target.querySelectorAll('[name="math_type"]');
            this.latexInput =           this.target.querySelector('[name="latex_input"]');
            this.loading =              this.target.querySelector('.preview-loading');
            this.previewContainer =     this.target.querySelector('.preview-container');
            this.preview =              this.target.querySelector('.preview');
            this.previewError =         this.target.querySelector('.error');
            this.previewEmpty =         this.target.querySelector('.empty');

            this.types.forEach(type => XF.on(type, 'change', this.onTypeChange.bind(this)));
            XF.on(this.latexInput, 'input', this.onLatexInput.bind(this));

            XF.on(this.target, 'form:reset', this.reset.bind(this));

            this.setState('empty');
        },

        onTypeChange: function ()
        {
            if (!this.resetMode)
            {
                this.updatePreview();
            }

        },

        onLatexInput: function ()
        {
            clearTimeout(this._typeTimeout);

            if (!this.resetMode)
            {
                this._typeTimeout = setTimeout(this.updatePreview.bind(this), 450);
            }
        },

        updatePreview: function ()
        {
            this.fadeOut();

            clearTimeout(this._fadeOutTimeout);
            this._typeTimeout = setTimeout(this.changePreview.bind(this), 200);
        },

        changePreview: function ()
        {
            var linput = this.latexInput.value.trim();

            if (!linput.length)
            {
                this.setState('empty');
                this.fadeIn();
                return;
            }

            // Plain text: auto-render only looks at text nodes, and the input must not be parsed as HTML
            this.preview.textContent = this.wrapMath(linput);

            this.setState('preview');

            renderMathInElement(this.preview, Object.assign({}, CMTV_MATH_RENDER_OPTIONS, { errorCallback: () => this.setState('error') }));
            this.fadeIn();
        },

        wrapMath: function (math)
        {
            let delimiters = this.getMathDelimiters(this.typeVal() !== 'inline');
            return delimiters.left + math + delimiters.right;
        },

        getMathDelimiters: function(isDisplay = true)
        {
            let left = '\\[', right = '\\]';

            if (isDisplay === false)
            {
                left = '\\('; right = '\\)';
            }

            for (let i = 0; i < CMTV_MATH_RENDER_OPTIONS.delimiters.length; i++)
            {
                let delimiterObj = CMTV_MATH_RENDER_OPTIONS.delimiters[i];

                if (delimiterObj.display === isDisplay)
                {
                    left =  delimiterObj.left;
                    right = delimiterObj.right;

                    break;
                }
            }

            return { left: left, right: right }
        },

        fadeIn: function ()
        {
            this.loading.classList.remove('showing');
            this.previewContainer.classList.add('showing');
        },

        fadeOut: function ()
        {
            this.loading.classList.add('showing');
            this.previewContainer.classList.remove('showing');
        },

        setState: function (state)
        {
            XF.display(this.preview, 'none');
            XF.display(this.previewError, 'none');
            XF.display(this.previewEmpty, 'none');

            XF.display(this.stateVar(state));

            this.state = state;
        },

        stateVar: function (state)
        {
            switch (state)
            {
                case 'empty':
                    return this.previewEmpty;
                case 'error':
                    return this.previewError;
                case 'preview':
                    return this.preview;
            }
        },

        reset: function ()
        {
            this.resetMode = true;

            this.target.querySelector('[name="math_type"][value="block"]').checked = true;
            this.latexInput.value = '';
            this.updatePreview();

            this.resetMode = false;
        }
    });

    XF.Element.register('insert-math-form', 'CMTV_Math.InsertMathForm');
}
(window, document);
