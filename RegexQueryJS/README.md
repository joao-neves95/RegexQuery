# RegexQuery

Regular expressions in english.

---

### Installing

#### npm

`npm install regex-query-js`

#### Browser

Use the file "`dist/RegexQuery.min.js`" inside the npm package.

&nbsp;

### Example

#### CommonJS environments, that support module.exports

```js
const { RegexQuery, RegexTokens } = require( 'regex-query' );

console.log( RegexTokens.NotWord );

const regexQuery = new RegexQuery();

console.log( regexQuery.AnyOf$1( '#%&£§€' ).toString() );
regexQuery.Clear();

console.log(
  regexQuery.ADate()
            .BeginFollowedBy()
              .ASpace()
              .ANewLine()
            .EndGroup()
            .toString()
);
regexQuery.Clear();

// Date:
const dateSeparators = regexQuery.Group(
                                   RegexTokens.Escape( "/" ) + RegexTokens.Or +
                                   RegexTokens.Escape( "." ) + RegexTokens.Or +
                                   RegexTokens.Escape( "-" )
                                 )
                                 .toString();

regexQuery.Clear();

console.log(
  regexQuery.CharsBetween( '0', '3' ).ButOnlyNoneOrOne()
            .CharsBetween( '0', '9' )
            .Content( dateSeparators )
            .CharsBetween( '0', '3' ).ButOnlyNoneOrOne()
            .CharsBetween( '0', '9' )
            .Content( dateSeparators )
            .CharsBetween( '1', '9' ).ADigit().ButOnly( 3 )
            .NotFollowedBy( RegexTokens.WhiteSpace )
            .toString()
);

```

#### On the Browser (window)

```js
console.log( new RegexQuery().AnyOf$1( '#%&£§€' ).toString() );
console.log( RegexTokens.NotWord );
```

&nbsp;

### API

#### `new RegexQuery()`

````js
    // IRegexQueryActions

    toString(): string | null;

    Clear(): IRegexQuery | null;

    BeginningOfString(): IRegexQuery | null;

    EndOfString(): IRegexQuery | null;

    Content(content: string | null): IRegexQuery | null;

    Group(content: string | null): IRegexQuery | null;

    BeginGroup(): IRegexQuery | null;

    EndGroup(): IRegexQuery | null;
        
    AnyOf$1(characters: string[] | null): IRegexQuery | null;

    AnyOf(characters: string | null): IRegexQuery | null;

    NotAnyOf(characters: string[] | null): IRegexQuery | null;

    CharsBetween(fromChar: string | null, toChar: string | null): IRegexQuery | null;

    ButOnly(quantity: number): IRegexQuery | null;

    ButOnlyOne(): IRegexQuery | null;

    ButOnlyNoneOrOne(): IRegexQuery | null;

    ButOnlyNoneOrMore(): IRegexQuery | null;

    ButOnlyOneOrMore(): IRegexQuery | null;

    ButOnlyBetween(fromCount: number, toCount: number):
    IRegexQuery | null;

    ButOnlyMoreThan(quantity: number): IRegexQuery | null;

    Or(): IRegexQuery | null;

    FollowedBy(content: string | null): IRegexQuery | null;
        
    NotFollowedBy(content: string | null): IRegexQuery | null;

    BeginFollowedBy(): IRegexQuery | null;

    EndFollowedBy(): IRegexQuery | null;

    BeginNotFollowedBy(): IRegexQuery | null;

    EndNotFollowedBy(): IRegexQuery | null;

    // IRegexQueryTokens

    ASpace(): IRegexQuery | null;

    ADigit(): IRegexQuery | null;

    AWord(): IRegexQuery | null;

    NotAWord(): IRegexQuery | null;

    ANewLine(): IRegexQuery | null;

    AtStartOfString(): IRegexQuery | null;

    AtEndOfString(): IRegexQuery | null;

    ATab(): IRegexQuery | null;

    ACarriageReturn(): IRegexQuery | null;

    AWhiteSpace(): IRegexQuery | null;

    NotAWhiteSpace(): IRegexQuery | null;

    AnyCharExceptNewLine(): IRegexQuery | null;

    AWordBoundary(): IRegexQuery | null;

    NotAWordBoundary(): IRegexQuery | null;

    // IRegexQueryPatterns

    ADate(): IRegexQuery | null;

    ADate$1(separator?: Separator): IRegexQuery | null;

    ADateSeparatedBy(separator?: Separator[] | null): IRegexQuery | null;
````

&nbsp;

#### `RegexTokens`

(Constants)

````js
    StartOfString: string | null;

    EndOfString: string | null;

    AnyCharExceptNewLine: string | null;

    Word: string | null;

    NotWord: string | null;

    Digit: string | null;

    NotDigit: string | null;

    WhiteSpace: string | null;

    NotWhiteSpace: string | null;

    Tab: string | null;

    NewLine: string | null;

    CarriageReturn: string | null;

    WordBoundary: string | null;

    NotWordBoundary: string | null;

    FollowedBy: string | null;

    NotFollowedBy: string | null;

    Or: string | null;

    Escape(token: string | null): string | null;
````
