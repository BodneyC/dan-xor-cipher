#! usr/bin/env node
/*
 * The shebang should always be the top line, hence my comment coming here
 *
 * The sheband specifies an interpreter for the file so that you don't have
 *  to invoke the command explicitly to run the file, so instead of: 
 *  `usr/bin/env node cypher.ts` you could just run `./cypher.ts`
 *
 * This brings up a couple of issues, firstly, you can't run this file with
 *  `node`, `node` can only run JS file directly
 *
 * Secondly, there's no leading `/`, so it will try to run: `./usr/bin/env`
 *  instead of `/usr/bin/env`... and unless you're in the root directory you
 *  won't have much look
 *
 * You could have gone with: 
 *
 *  `#!/usr/bin/env ts-node`
 *
 *  which can take TS files, but this assumes your users have `ts-node`
 *  installed globally
 *
 * Alternatively:
 *
 *  `#!/usr/bin/env -S npx ts-node`
 *
 *  or similar
 */

/*
 * The change here is fairly subtle and links in with one of your dependencies:
 *  `@types/node` - if your look at `./node_modules/@types/node/fs.d.ts` at the
 *  type definition of the fs module, you'll see no default export and instead a
 *  whole load of things being exported
 *
 * Ergo, you want to import all of them (*) as some idenitifier ('fs'); the
 *  alternative is to import only the functions you want, i.e.
 *
 * ```js
 * import { readFileSync, writeFileSync } from 'fs';
 * ```
 *
 *  and do away with the `fs` identifier all together
 */
import * as fs from 'fs';
const args = require('minimist')(process.argv.slice(2));

function main() {
  /*
   * First comment would be on input validation, whether you're making a CLI
   *  tool, some REST API, a website, whatever: if a user inputs data, they will
   *  almost certainly input the wrong data
   *
   * It is therefore your job as the programmer to specifically define what
   *  those inputs may look like and reject those inputs that don't look
   *  right, otherwise things might fail in surprising ways
   *
   * Here, if I don't specify a `-i` flag, the program tries to read
   *  `undefined` giving a huge programmer-y error - that could be confusing and
   *  more importantly, doesn't tell me what I did wrong
   *
   * Ideally, you'd check if the input has been given and is the correct type,
   *  if not give an error
   *
   * Then, you'd check if the file exists, not immediately try to read it, if
   *  not then give an error
   *
   * If you wanted to cover all bases, you could check the permission the
   *  effective user has over the file, i.e. can they see that it exists... but
   *  not read it?
   *
   * --------------------------------------------------------------------------
   *
   * Secondly, is the thing we already discussed, what if my `-i` was a 512GB
   *  drive, what does `readFileSync` do with that?
   *
   * This is why the streaming approach is often better when dealing with files
   *  out of your control (so, I suppose this is just user-input validation
   *  again)
   *
   * You could use `.open` or `.openSync` to get a handle to the file - the
   *  mode given would also provide your "can read" check, and then
   *  `.readSync` to fetch a byte at a time (as a number)
   *
   *  ```js
   *  // Stolen from: https://stackoverflow.com/q/15808151
   *  fs.open(args.i, 'r', (err, fd) => {
   *     var buffer = Buffer.alloc(1);
   *     while (true) {   
   *       var num = fs.readSync(fd, buffer, 0, 1, null);
   *       if (num === 0) break;
   *       // Do something with buffer
   *     }
   *  })
   *  ```
   *
   * --------------------------------------------------------------------------
   *
   * Thirdly is a small one with big consequences:
   *
   * ```js
   * `${var}`
   * ```
   *
   * is somewhat equivalent to
   *
   * ```js
   * var
   * ```
   *
   * The only benefit would be a string conversion, however in this case it
   *  would convert a potential `undefined` value to the string: "undefined" and
   *  so this line might try to open a file named "undefined"
   *
   * --------------------------------------------------------------------------
   *
   * Fourthly, and this is for both of these `readFileSync` lines, you want the
   *  binary values, not utf8 string - if you omit this argument, you get a
   *  `Buffer` object with the numeric ("bniary") values:
   *
   * """
   * If the encoding option is specified then this function returns a string.
   *  Otherwise it returns a buffer.
   * """
   * https://nodejs.org/api/fs.html#fsreadfilesyncpath-options
   */
	const input = fs.readFileSync(`${args.i}`, 'utf8');
  /*
   * This one really is just pickiness... first is the swap from `'utf8'` to
   *  `'utf-8'`, not really important
   *
   * The other is the naming of the file `cypher.txt` for the key - I would try
   *  to name things exactly what they are, particularly in this context where
   *  "cipher text" is a common phrase but does not refer to the key
   */
	const cypher = fs.readFileSync('cypher.txt', 'utf-8');
  /*
   * This is something that lots of folks do, the idea being that if you're using
   *  `cypher.length` in every iteration of the loop, then surely it will take
   *  some time to compute and that time will add up, better compute it once
   *  and just use that value
   *
   * To that I would respond: https://stackoverflow.com/a/32850687
   *
   * Atop the fact that `.length` is a property which requires no calculation,
   *  it is also reflective of the *current* state of the array - in some
   *  shared memory situation (not that this is one but still) you might have
   *  one thread running something similar to this and another thread changes
   *  the length of `cypher`...
   *
   * Well if we use the real `cypher.length`, we get the updated value, in this
   *  pre-computed way, we get the old value and possibly read out of bounds
   */
	const cypherLength = cypher.length;
  /*
   * This is a stylistic one, some people prefer traditional C-style loops and
   *  using mutable "result" variables and building the results in them through
   *  the loop
   *
   * Others prefer the more "functional" approach with one operation, a
   *  map-reduce in this case (well, map-join), yielding a single value that
   *  from that line on, is immutable - no one can accidently change that
   *  value, it is `const`ant, e.g:
   *
   *  ```js
   *  const result = input.split('').map((temp, i) => { ... }).join('')
   *  ```
   */
	let result = '';
	for (let i = 0; i < input.length; i++) {
    /*
     * `temp` means very little, `encodedChar`, `char`, or even `c` means more
     */
		let temp = input[i].charCodeAt(0) ^ 
    /*
     * Two things here:
     *
     * 1. `charCodeAt` and `charAt` take an index, so you could have used simply:
     *
     *    ```js
     *    cypher.charCodeAt(i % cypherLength)
     *    ```
     *
     * 2. This `charCodeAt` method is called for every byte in the file,
     *     repeatedly for the same 
     *
     *    ```js
     *    const key = cypher.split('').map(e => e.charCodeAt());
     *    ```
     *
     *    Then you could use `key[i % key.length]`
     */
      cypher[i % cypherLength].charCodeAt(0);
    /*
     * `String.fromCharCode(...)` is a takes any number of numbers as arguments
     *  and converts all of them to one long string
     *
     * Therefore, instead of calling this static method in every iteration of the
     *  loop, you could have just appended `temp` to the array and after the loop
     *  used `String.fromCharCode(...result)` which would *spread* the array into
     *  arguments and returned a string
     *
     * For example try in a REPL:
     *
     * ```js
     * String.fromCharCode(...[
     *   98, 105, 103,  32, 111, 108, 100,  32, 112, 111, 111, 112, 101, 114, 115
     * ])
     * ```
     */
		result += String.fromCharCode(temp);
	}
  /*
   * This is another point about input validation, say my `-i` flag was a file
   *  that 5GB, so something that will fit in memory ignoring that other 
   *  concern, but something that will take a while to complete
   *
   * I sit here for two minutes while your program encrypts my file, only for
   *  it to finish and give me an error because I didn't give a `-o` or my
   *  `-o` value isn't writable by me
   *
   * The process exits and all that work is lost or, in my case, I ended up with
   *  a file named `undefined` which I couldn't figure out for five minutes
   */
	fs.writeFileSync(`${args.o}`, result, 'utf8');
}

/*
 * I would argue the purpose of having a `main` and not just running the
 * contents of `main` - I can think of a few possible reasons to do this that
 * might require a few extra changes, let's take a look:
 *
 * 1. This logic may be imported (required) by another module at some point
 *
 *    In regular JS you might wrap your call to `main` in some `if` which checks
 *     if the file was imported or ran directly:
 *
 *     ```js
 *     if (process.require === module) {
 *       main()
 *     }
 *     ```
 *
 *     however, this doesn't really exist in Typescript as Typescript isn't
 *     primarily intended to be ran as a script
 *
 *    An alternative would be to extract this logic to another file, so that
 *     would be your `lib.ts` which is imported by this file, your `main.ts`, for
 *     Typescript, I'd probably take this approach
 *
 * 2. There is some functionality of the language or product of your code which
 *     would not work nicely as top-level logic
 *
 *    One example here would be using `await` to await asynchronous calls in JS,
 *     this used to be disallowed unless inside a function - however, since 
 *     Node 14.something, these were allowed in modules. In Typescript-land,
 *     this is equivalent to setting your target to es2017 (es8) in
 *     `tsconfig.json`
 *
 * You aren't doing these so again, I would question it's purpose/benefit
 */
main()
