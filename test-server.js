// A quick and dirty REST API server for ApplyByAPI testing

// modules
const express    = require( 'express' );
const parser     = require( 'body-parser' );
const formidable = require( 'formidable' );
const path       = require( 'path' );
const fs         = require( 'fs' );

// variables
const port            = 8080;
const successToken    = 'SUCCESS-TOKEN';
const badToken        = 'Bad token';
const missingToken    = 'Missing token';
const applicationsDir = 'applications';

const app = express();

app.use( parser.json() ).post( '/gentoken', ( request, response ) => {

	let output = {};

	// if posting value is valid, output the success token
	if ( request.body.posting === 7 ) {

		output = { token: successToken };
	
	} else if ( request.body.posting ) {
		
		output = { error: badToken };
	
	} else {
		
		output = { error: missingToken };
	
	}

	response.json( output );

});

app.post( '/apply', ( request, response, next ) => {

	let output = {};
	
	const form = formidable({ multiples: true });
	
	const applicationId = Math.floor( ( Math.random() * 100000 ) + 1 );

	form.parse( request, ( formError, fields, files ) => {
		
		if ( formError ) {
			
			next( formError );
			return;		
		
		}

		// if the token value is valid, save the request data and output a random application id
		if ( fields.token === successToken) {

			// add the application ID to the field data
			fields.applicationId = applicationId;
			
			const fieldsJSON = JSON.stringify( fields, null, 4 );
			const fieldsFile = applicationId + '-' + fields.email + '.json';
			const resumeFile = applicationId + '-' + fields.email + '-' + files.resume.name;

			// save request fields as a JSON file in the applications directory
			fs.writeFileSync( path.join( process.cwd(), applicationsDir, fieldsFile ), fieldsJSON, ( fileError ) => {
				
				if ( fileError ) throw fileError;		
			
			});

			// move the uploaded resume file to the applications directory
			fs.rename( files.resume.path, path.join( process.cwd(), applicationsDir, resumeFile ), ( resumeError ) => {				
				
				if ( resumeError ) throw resumeError;
			
			});

			output = { applicationID: applicationId };
		
		} else if ( fields.token ) {
		
			output = { error: badToken };
	
		} else {
			
			output = { error: missingToken };
		
		}

		response.json( output );

	});

});

const server = app.listen( port, console.log( 'Test server listening...' ) );