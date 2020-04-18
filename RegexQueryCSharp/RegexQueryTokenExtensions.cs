using RegexQuery.Interfaces;

namespace RegexQuery
{
    public static class RegexQueryTokenExtensions
    {
        public static IRegexQuery ASpace(this IRegexQuery regexQueryBuilder)
        {
            regexQueryBuilder.Query.Append( RegexTokens.WhiteSpace );
            return regexQueryBuilder;
        }

        public static IRegexQuery ADigit(this IRegexQuery regexQueryBuilder)
        {
            regexQueryBuilder.Query.Append( RegexTokens.Digit );
            return regexQueryBuilder;
        }

        public static IRegexQuery AWord(this IRegexQuery regexQueryBuilder)
        {
            regexQueryBuilder.Query.Append( RegexTokens.Word );
            return regexQueryBuilder;
        }

        public static IRegexQuery NotAWord(this IRegexQuery regexQueryBuilder)
        {
            regexQueryBuilder.Query.Append( RegexTokens.NotWord );
            return regexQueryBuilder;
        }

        public static IRegexQuery ANewLine(this IRegexQuery regexQueryBuilder)
        {
            regexQueryBuilder.Query.Append( RegexTokens.NewLine );
            return regexQueryBuilder;
        }

        public static IRegexQuery AtStartOfString(this IRegexQuery regexQueryBuilder)
        {
            regexQueryBuilder.Query.Append( RegexTokens.StartOfString );
            return regexQueryBuilder;
        }

        public static IRegexQuery AtEndOfString(this IRegexQuery regexQueryBuilder)
        {
            regexQueryBuilder.Query.Append( RegexTokens.EndOfString );
            return regexQueryBuilder;
        }

        public static IRegexQuery ATab(this IRegexQuery regexQueryBuilder)
        {
            regexQueryBuilder.Query.Append( RegexTokens.Tab );
            return regexQueryBuilder;
        }

        public static IRegexQuery ACarriageReturn(this IRegexQuery regexQueryBuilder)
        {
            regexQueryBuilder.Query.Append( RegexTokens.CarriageReturn );
            return regexQueryBuilder;
        }

        public static IRegexQuery AWhiteSpace(this IRegexQuery regexQueryBuilder)
        {
            regexQueryBuilder.Query.Append( RegexTokens.WhiteSpace );
            return regexQueryBuilder;
        }

        public static IRegexQuery NotAWhiteSpace(this IRegexQuery regexQueryBuilder)
        {
            regexQueryBuilder.Query.Append( RegexTokens.NotWhiteSpace );
            return regexQueryBuilder;
        }
        public static IRegexQuery AnyCharExceptNewLine(this IRegexQuery regexQueryBuilder)
        {
            regexQueryBuilder.Query.Append( RegexTokens.AnyCharExceptNewLine );
            return regexQueryBuilder;
        }

        public static IRegexQuery AWordBoundary(this IRegexQuery regexQueryBuilder)
        {
            regexQueryBuilder.Query.Append( RegexTokens.WordBoundary );
            return regexQueryBuilder;
        }

        public static IRegexQuery NotAWordBoundary(this IRegexQuery regexQueryBuilder)
        {
            regexQueryBuilder.Query.Append( RegexTokens.NotWordBoundary );
            return regexQueryBuilder;
        }
    }
}
