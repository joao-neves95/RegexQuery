# RegexQuery

Regular expressions in english.

---

### Installing

`dotnet add package RegexQuery`

&nbsp;

### Example

```c
public static void Main()
{
    string regexQuery1 = new RegexQuery().ADate()
                                         .BeginFollowedBy()
                                             .ASpace()
                                             .ANewLine()
                                         .EndGroup()
                                         .ToString();
}
```

&nbsp;

### API

#### `new RegexQuery()`

````c
    // IRegexQueryActions

    string ToString();

    IRegexQuery BeginningOfString();

    IRegexQuery EndOfString();

    IRegexQuery Group( string content );

    IRegexQuery BeginGroup();

    IRegexQuery EndGroup();

    IRegexQuery AnyOf( char[] characters );

    IRegexQuery AnyOf( string characters );

    IRegexQuery NotAnyOf( char[] characters );

    IRegexQuery CharsBetween( char fromChar, char toChar );

    IRegexQuery ButOnly( uint quantity );

    IRegexQuery ButOnlyOne();

    IRegexQuery ButOnlyNoneOrOne();

    IRegexQuery ButOnlyNoneOrMore();

    IRegexQuery ButOnlyOneOrMore();

    IRegexQuery ButOnlyBetween( uint fromCount, uint toCount );

    IRegexQuery ButOnlyMoreThan( uint quantity );

    IRegexQuery Or();

    IRegexQuery FollowedBy( string content );

    IRegexQuery NotFollowedBy( string content );

    IRegexQuery BeginFollowedBy();

    IRegexQuery EndFollowedBy();

    IRegexQuery BeginNotFollowedBy();

    IRegexQuery EndNotFollowedBy();

    // IRegexQueryTokens

    IRegexQuery ASpace();

    IRegexQuery ADigit();

    IRegexQuery AWord();

    IRegexQuery NotAWord();

    IRegexQuery ANewLine();

    IRegexQuery AtStartOfString();

    IRegexQuery AtEndOfString();

    IRegexQuery ATab();

    IRegexQuery ACarriageReturn();

    IRegexQuery AWhiteSpace();

    IRegexQuery NotAWhiteSpace();

    IRegexQuery AnyCharExceptNewLine();

    IRegexQuery AWordBoundary();

    IRegexQuery NotAWordBoundary();

    // IRegexQueryPatterns

    IRegexQuery ADate();

    IRegexQuery ADate( Separator separator = Separator.All );
````

#### `RegexTokens`

(Constants)

````c
    string StartOfString;

    string EndOfString;

    string AnyCharExceptNewLine;

    string Word;

    string NotWord;

    string Digit;

    string NotDigit;

    string WhiteSpace;

    string NotWhiteSpace;

    string Tab;

    string NewLine;

    string CarriageReturn;

    string WordBoundary;

    string NotWordBoundary;

    string FollowedBy;

    string NotFollowedBy;

    string Or;
````
