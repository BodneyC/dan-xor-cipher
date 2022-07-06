#! usr/bin/env node
import fs from 'fs';
const args = require('minimist')(process.argv.slice(2));
function main() {
	let input = fs.readFileSync(`${args.i}`, 'utf8');
	let cypher = fs.readFileSync('cypher.txt', 'utf-8');
	let cypherLength = cypher.length;
	let result = '';
	for (let i = 0; i < input.length; i++) {
		let temp = input[i].charCodeAt(0) ^ cypher[i % cypherLength].charCodeAt(0);
		result += String.fromCharCode(temp);
		// 	// console.log(String.fromCharCode(temp));
	}
	// // fs.writeFileSync('encoded.txt', result, 'utf8');
	fs.writeFileSync(`${args.o}`, result, 'utf8');
	// console.log(args);
	// switch(){
	// 	console.error('Output file not specified.');
	// 	process.exit(1);
	// }
}
main();
