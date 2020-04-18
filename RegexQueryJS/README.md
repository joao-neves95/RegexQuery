# RegexQuery

Regular expressions in english.

---

### Installing

#### npm

`npm install regex-query`

#### Browser

Use the file "`dist/RegexQuery.min.js`" inside the npm package.

&nbsp;

### Example

#### CommonJS environments, that support module.exports

```js
const { RegexQuery, RegexTokens } = require( 'regex-query' );

console.log( new RegexQuery().AnyOf$1( '#%&£§€' ).toString() );

console.log(
  new RegexQuery().ADate()
                  .BeginFollowedBy()
                    .ASpace()
                    .ANewLine()
                  .EndGroup()
                  .toString()
);

console.log( RegexTokens.NotWord );

```

#### On the Browser (window)

```js
console.log( new RegexQuery().AnyOf$1( '#%&£§€' ).toString() );
console.log( RegexTokens.NotWord );
```
