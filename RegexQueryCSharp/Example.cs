/*
 * Copyright (c) 2020 João Pedro Martins Neves (SHIVAYL) - All Rights Reserved.
 *
 * RegexQuery and all its contents are licensed under the GNU General Public License v3.0
 * (GPL-3.0), located in the root folder, under the name "LICENSE.md".
 *
 */

using RegexQuery.Interfaces;
using RegexQuery.Constants;

namespace RegexQuery
{
    internal class Example
    {
        private void Main()
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
                                              ).ToString();
            regexQuery.Clear();

            string regexQuery2 = regexQuery.CharsBetween( "0", "3" ).ButOnlyNoneOrOne()
                                           .CharsBetween( "0", "9" )
                                           .Content( dateSeparators )
                                           .CharsBetween( "0", "3" ).ButOnlyNoneOrOne()
                                           .CharsBetween( "0", "9" )
                                           .Content( dateSeparators )
                                           .CharsBetween( "1", "9" ).ADigit().ButOnly( 3 )
                                           .ToString();
        }
    }
}
