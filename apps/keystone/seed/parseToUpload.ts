import mime from 'mime';
import fs from 'fs';
// import fsc from 'fs-capacitor';
import path from 'path';
import Upload from 'graphql-upload/Upload.js';

export const prepareToUpload = (_filePath: string) => {
	const filePath = path.resolve(_filePath);
	const upload = new Upload();
	// const capacitor = new WriteStream();
	// const fileIdkMan = fs.createReadStream(filePath);
	// capacitor.pipe(fileIdkMan);
	upload.file = {
		// @ts-ignore
		createReadStream: () => fs.createReadStream(filePath),
		filename: path.basename(filePath),
		// @ts-ignore
		mimetype: mime.getType(filePath),
		encoding: 'utf-8',
		// capacitor: new fsc.WriteStream(),
	};
	return upload;
};