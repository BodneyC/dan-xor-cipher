#! usr/bin/env node
import fs from 'fs';
const args = require('minimist')(process.argv.slice(2));

function main() {
	const input = fs.readFileSync(`${args.i}`, 'utf8');
	const cypher = fs.readFileSync('cypher.txt', 'utf-8');
	const cypherLength = cypher.length;
	let result = '';
	for (let i = 0; i < input.length; i++) {
		let temp = input[i].charCodeAt(0) ^ cypher[i % cypherLength].charCodeAt(0);
		result += String.fromCharCode(temp);
	}
	fs.writeFileSync(`${args.o}`, result, 'utf8');
}
main();
