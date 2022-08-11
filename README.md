I was stubborn enough to use typescript so now in order to run it after the `npm i`
it has to be used like this:

`npx ts-node cypher.ts -i <inputfile> -o <outputfile>`

eg.

npx ts-node cypher.ts -i input.txt -o encoded.txt

npx ts-node cypher.ts -i encoded.txt -o decoded.txt

## Ben's Notes

### Typescript

The general Typescript workflow is to use `tsc` provided by the dependency `typescript` (in `./node_modules/.bin/tsc`) to transpile your TS files into JS files which can then be ran by `node` - this is particularly relevant when targeting a browser

An alternative workflow, useful for scripts like this one, is to use something like `ts-node` to perform an in-memory JIT compilation to JS which can then be executed

There seems to be a mix of both in this project, this is fine but there are a couple notes to be made on their use:

1. `typescript` is never used, the TS file isn't transpiled to JS in your script or in the examples in this readme
2. `ts-node` is never used, by using `npx` you have no need to include `ts-node` in your dependencies, `npx` will download and run it

### Scripts

You may want a few supporting scripts for the benefit of your users; commands in your readme is great, but those commands in a script in your `package.json` is better, and kinda expected considering the general Node workflow

An initial comment on the `scripts` section would be to remove the default `test` one (or write tests... but who can be bothered to do that), it serves no real purpose

#### Typescript Workflow

Usually, you would have (at least) two supporting scripts in your `package.json`, one to build to a directory and one to run the transpiled file, e.g.

```json
"build": "tsc --build",
"start": "node {file}"
```

Obviously replacing `{file}` with the relevant file output by `build`

There's lots of ways to arrange this too, you could:

- Have `build` output to a directory and keep you workspace clean as your project grows
- Have a `build:watch` of some sort to watch for writes to the files and automatically recompile mimicking the hotloading commonplace to LISPs
- Put a `build` in `start` to make sure that `start` always starts the latest version
- Etc.

#### Ts-node Workflow

This one is straight forward, one script:

```json
"start": "ts-node {file}"
```

Obviously replacing `{file}` with the relevant TS file

This will try to use the project-local installation of `ts-node`, i.e. the one in your `package.json`

### Dependencies

As mentioned, `typescript` is used to compile your file(s), as such it is only used during the development and packaging of your software, ergo it *should be* a development dependency, e.g.

```sh
npm i -D typescript
```

Though, as you never package this with the modules, it's kinda irrelevant...

Similarly, `ts-node` isn't part of your application, just something you use to interact with your script(s), it is therefore also a development dependency

## Tabs vs. Spaces

Not to spark controversy but I kinda prefer tabs - I can have my editor show tabs as 2, 4, 8, or whatever other number of spaces I wish while the characters in the file remain the same, but my editor will only ever show *n* spaces as *n* spaces, purely in terms of low-efforts: tabs are better

However, the world generally disagrees, particularly in hip, trendy languages like JS/TS, spaces are preferred and usually 2 spaces are preferred

For solo project, do whatever you want, but from a "working with others" perspectives, using a standard like Prettier, perhaps with some project-specific options changes stored in your VCS is the best approach

<!-- markdownlint-disable-file MD013 -->
