/*
 * Copyright (c) 2020 João Pedro Martins Neves (SHIVAYL) - All Rights Reserved.
 *
 * RegexQuery and all its contents are licensed under the GNU General Public License v3.0
 * (GPL-3.0), located in the root folder, under the name "LICENSE.md".
 *
 */

using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;
using RegexQueryCSharp.Interfaces;
using RegexQueryCSharp.Constants;
using RegexQueryCSharp.Enums;

namespace RegexQueryCSharp
{
    public static class RegexQueryPatternExtensions
    {
        public static IRegexQuery ASpace(this IRegexQuery regexQueryBuilder)
        {
            regexQueryBuilder.Query.Append( RegexExpressions.Space );
            return regexQueryBuilder;
        }

        public static IRegexQuery ADigit(this IRegexQuery regexQueryBuilder)
        {
            regexQueryBuilder.Query.Append( RegexExpressions.Digit );
            return regexQueryBuilder;
        }

        public static IRegexQuery ADate(this IRegexQuery regexQueryBuilder)
        {
            return RegexQueryPatternExtensions.ADate( regexQueryBuilder, Separator.All );
        }

        public static IRegexQuery ADate(this IRegexQuery regexQueryBuilder, Separator separator = Separator.All)
        {
            // [0-3]?[0-9]
            regexQueryBuilder.Query.Append( RegexExpressions.ValueBetween( '0', '3' ) ).Append( '?' ).Append( RegexExpressions.ValueBetween( '0', '9' ) )
                                   // (\/|\.|-)
                                   .Append( "(" ).Append( Separators.Resolve( separator ) ).Append( ")" )
                                   // [0-3]?[0-9]
                                   .Append( RegexExpressions.ValueBetween( '0', '3' ) ).Append( '?' ).Append( RegexExpressions.ValueBetween( '0', '9' ) )
                                   // (\/|\.|-)
                                   .Append( "(" ).Append( Separators.Resolve( separator ) ).Append( ")" )
                                   // [1-9]\d{3}
                                   .Append( RegexExpressions.ValueBetween( '1', '9' ) ).Append( RegexExpressions.Digit ).Append( RegexExpressions.QuantityOfPreceding( 3 ) );

            return regexQueryBuilder;
        }
    }
}
