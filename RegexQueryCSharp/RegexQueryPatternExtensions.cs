/*
 * Copyright (c) 2020 João Pedro Martins Neves (SHIVAYL) - All Rights Reserved.
 *
 * RegexQuery and all its contents are licensed under the GNU General Public License v3.0
 * (GPL-3.0), located in the root folder, under the name "LICENSE.md".
 *
 */

using RegexQuery.Interfaces;
using RegexQuery.Constants;
using RegexQuery.Enums;

/*
namespace RegexQuery
{
    public static class RegexQueryPatternExtensions
    {
        public static IRegexQuery ADate(this IRegexQuery regexQueryBuilder)
        {
            return RegexQueryPatternExtensions.ADate( regexQueryBuilder, Separator.All );
        }

        public static IRegexQuery ADate(this IRegexQuery regexQueryBuilder, Separator separator = Separator.All)
        {
                                   // [0-3]?[0-9]
            regexQueryBuilder.Query.Append( RegexTokens.ValueBetween( '0', '3' ) ).Append( '?' ).Append( RegexTokens.ValueBetween( '0', '9' ) )
                                   // (\/|\.|-)
                                   .Append( "(" ).Append( Separators.Resolve( separator ) ).Append( ")" )
                                   // [0-3]?[0-9]
                                   .Append( RegexTokens.ValueBetween( '0', '3' ) ).Append( '?' ).Append( RegexTokens.ValueBetween( '0', '9' ) )
                                   // (\/|\.|-)
                                   .Append( "(" ).Append( Separators.Resolve( separator ) ).Append( ")" )
                                   // [1-9]\d{3}
                                   .Append( RegexTokens.ValueBetween( '1', '9' ) ).Append( RegexTokens.Digit ).Append( RegexTokens.QuantityOfPreceding( 3 ) );

            return regexQueryBuilder;
        }
    }
}
