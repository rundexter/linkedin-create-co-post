var Linkedin = require('node-linkedin')(),
    _ = require('lodash'),
    q = require('q'),
    util = require('./util.js');


module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var company_id   = step.input( 'id' ).first();
        var comment      = step.input( 'company' ).toArray();
        var title        = step.input( 'title' ).toArray();
        var description  = step.input( 'description' ).toArray();
        var url          = step.input( 'url' ).toArray();
        var image_url    = step.input( 'image_url' ).toArray();
        var visibility   = step.input( 'visibility_code' ).toArray();


        var linkedIn = Linkedin.init(dexter.provider('linkedin').credentials('access_token')),
            inputs = util.pickStringInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);

        if (validateErrors)
            return this.fail(validateErrors);

        self.log( 'token = ' + dexter.provider('linkedin').credentials('access_token'));

        var posts = [ ];

        _.zipWith( comment, title, description, url, image_url, visibility, function( c, t, d, u, iu, v ) {
            return { comment: c, title: t, description: d, url: u, image_url: ui, visibility: v
        } } ).forEach( function( item ) {
            var deferred = q.defer();
            linkedIn.companies.share( company_id, item, function( err, data ) {
                if ( err ) return deferred.reject( error );
                return deferred.resolve( data )
            } );
        } );

        posts.push( deferred.promise );

        var self = this;
        q.all( posts )
            .then( function( res ) { return self.complete( res ) } )
            .fail( function( err ) { return self.fail( err ) } );
    }
};
