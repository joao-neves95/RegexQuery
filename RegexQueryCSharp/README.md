# RegexQuery

Regular expressions in english.

---

### Installing

[nugget](https://www.nuget.org/packages/RegexQuery)

`dotnet add package RegexQuery`

&nbsp;

### Example

```c
public static void Main()
{
    IRegexQuery regexQuery = new RegexQuery();

    string regexQuery1 = regexQuery.ADate()
                                   .BeginFollowedBy()
                                       .ASpace()
                                       .ANewLine()
                                   .EndGroup()
                                   .ToString();

    regexQuery.Clear();

    // Date:
    string dateSeparators = regexQuery.Group(
                                          RegexTokens.Escape( "/" ) + RegexTokens.Or +
                                          RegexTokens.Escape( "." ) + RegexTokens.Or +
                                          RegexTokens.Escape( "-" )
                                      )
                                      .ToString();
    regexQuery.Clear();

    string regexQuery2 = regexQuery.CharsBetween( "0", "3" ).ButOnlyNoneOrOne()
                                   .CharsBetween( "0", "9" )
                                   .Content( dateSeparators )
                                   .CharsBetween( "0", "3" ).ButOnlyNoneOrOne()
                                   .CharsBetween( "0", "9" )
                                   .Content( dateSeparators )
                                   .CharsBetween( "1", "9" ).ADigit().ButOnly( 3 )
                                   .NotFollowedBy( RegexTokens.WhiteSpace )
                                   .ToString();
}
```

&nbsp;

### API

#### `new RegexQuery()`

````c
    // IRegexQueryActions

    string ToString();

    IRegexQuery Clear();

    IRegexQuery BeginningOfString();

    IRegexQuery EndOfString();

    IRegexQuery Content( string content );

    IRegexQuery Group( string content );

    IRegexQuery BeginGroup();

    IRegexQuery EndGroup();

    IRegexQuery AnyOf( string[] characters );

    IRegexQuery AnyOf( string characters );

    IRegexQuery NotAnyOf( string[] characters );

    IRegexQuery CharsBetween( string fromChar, string toChar );

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

    IRegexQuery ADateSeparatedBy( Separator[] separator = null );
````

#### `RegexTokens`

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

    string Escape( string token );
````
