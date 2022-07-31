I was stubborn enough to use typescript so now in order to run it after the `npm i`
it has to be used like this:

`npx ts-node cypher.ts -i <inputfile> -o <outputfile>`

eg.

npx ts-node cypher.ts -i input.txt -o encoded.txt

npx ts-node cypher.ts -i encoded.txt -o decoded.txt
