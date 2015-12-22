var Linkedin = require('node-linkedin')(),
    _ = require('lodash'),
    util = require('./util.js');

var pickInputs = {
        'id': 'id',
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
     * Authorize module.
     *
     * @param dexter
     * @returns {*}
     */
    authModule: function (dexter) {
        var accessToken = dexter.environment('linkedin_access_token');

        if (accessToken)
            return Linkedin.init(accessToken);

        else
            return false;
    },


    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var linkedIn = this.authModule(dexter),
            inputs = util.pickStringInputs(step, pickInputs);

        if (!linkedIn)
            return this.fail('A [linkedin_access_token] environment need for this module.');

        if (!inputs.id)
            this.fail('A [id] need for this module');

        linkedIn.companies.share(inputs.id, _.omit(inputs, ['id']), function(err, data) {
            if (err)
                this.fail(err);

            else if (data.errorCode !== undefined)
                this.fail(data.message || 'Error Code'.concat(data.errorCode));

            else
                this.complete(util.pickResult(data, pickOutputs));

        }.bind(this));
    }
};
