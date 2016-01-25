var Linkedin = require('node-linkedin')(),
    _ = require('lodash'),
    util = require('./util.js');

var pickInputs = {
        'id': { key: 'id', validate: { req: true } },
        'comment': 'comment',
        'content_title': 'content.title',
        'content_description': 'content.description',
        'content_url': 'content.submitted-url',
        'content_image_url': 'content.submitted-image-url',
        'visibility_code': 'visibility.code'
    },
    pickOutputs = {
        'updateKey': 'updateKey',
        'updateUrl': 'updateUrl'
    };

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var linkedIn = Linkedin.init(dexter.provider('linkedin').credentials('access_token')),
            inputs = util.pickStringInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);

        if (validateErrors)
            return this.fail(validateErrors);

        linkedIn.companies.share(inputs.id, _.omit(inputs, ['id']), function(err, data) {
            if (err || (data && data.errorCode !== undefined))
                this.fail(err || (data.message || 'Error Code: '.concat(data.errorCode)));
            else
                this.complete(util.pickOutputs(data, pickOutputs));

        }.bind(this));
    }
};
