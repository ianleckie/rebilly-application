// A quick and dirty REST API server for ApplyByAPI testing

const express    = require( 'express' );
const parser     = require( 'body-parser' );
const formidable = require( 'formidable' );
const path       = require( 'path' );
const fs         = require( 'fs' );

const app = express();

const successToken = 'SUCCESS-TOKEN';

app.use( parser.json() ).post( '/gentoken', function ( request, response ) {

	let output = {};

	// if posting value is valid output the success token
	// otherwise, output the appropriate error
	if ( request.body.posting === 7 ) {

		output = { token: successToken };
	
	} else if ( request.body.posting ) {
		
		output = { error: 'bad token' };
	
	} else {
		
		output = { error: 'missing token' };
	
	}

	response.json( output );

});

app.post( '/apply', function ( request, response, next ) {

	const form = formidable({ multiples: true });

	let output = {};

	let applicationId =Math.floor( ( Math.random() * 100000 ) + 1 );

	form.parse( request, ( formError, fields, files ) => {
		
		if ( formError ) {
			
			next( formError );
			return;
		
		}

		// if the token value is valid save the request data and output a random
		// application id. otherwise, output the appropriate error
		if ( fields.token === successToken) {

			// add the application ID to the field data
			fields.applicationId = applicationId;
			
			let fieldsJSON = JSON.stringify( fields, null, 4 );

			// save request fields as a JSON file in the applications directory
			fs.writeFileSync( path.join( process.cwd(), 'applications', applicationId + '-' + fields.email + '.json' ), fieldsJSON, ( jsonError ) => {
				
				if ( jsonError ) {
					
					throw jsonError;
				
				}
			
			});

			// move the uploaded resume file to the applications directory
			fs.rename( files.resume.path, path.join( process.cwd(), 'applications', applicationId + '-' + fields.email + '-' + files.resume.name ), ( fileError ) => {
				
				if ( fileError ) {
					
					throw fileError
				
				}
			
			});

			// output random application id
			output = { applicationID: applicationId };
		
		} else if ( fields.token ) {
		
			output = { error: 'bad token' };
	
		} else {
			
			output = { error: 'missing token' };
		
		}

		response.json( output );

	});

});

const server = app.listen( 8080, console.log( 'Test server listening...' ) );