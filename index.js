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

        var linkedIn = Linkedin.init(dexter.provider('linkedin').credentials('access_token'));

        var posts = [ ];
        var self = this;

        description.forEach( function( desc, idx ) {
            var deferred = q.defer();
            var share = {
                comment: comment[ idx ] || null,
                content: {
                    title: title[ idx ] || null,
                    description: desc,
                    'submitted-url': url[ idx ] || null,
                    'submitted-image-url': image_url[ idx ] || null,
                },
                visibility: {
                    code: visibility[ idx ] || 'anyone'
                }
            };

            linkedIn.companies.share( company_id, share, function( err, data ) {
                if ( err || (data && data.errorCode !== undefined) )
                    return deferred.reject( err || (data.message || 'Error Code: '.concat(data.errorCode)));

                return deferred.resolve( data )
            } );

            posts.push( deferred.promise );
        } );

        q.all( posts )
            .then( function( res ) { return self.complete( res ) } )
            .fail( function( err ) { return self.fail( err ) } );
    }
};
