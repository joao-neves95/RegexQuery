/*
 * Copyright (c) 2020 João Pedro Martins Neves (SHIVAYL) - All Rights Reserved.
 *
 * RegexQuery and all its contents are licensed under the GNU General Public License v3.0
 * (GPL-3.0), located in the root folder, under the name "LICENSE.md".
 *
 */

using Bridge;
using RegexQuery.Interfaces;
using RegexQuery.Constants;
using RegexQuery.Enums;

namespace RegexQuery
{
    // Implements IRegexQueryPatterns
    public partial class RegexQuery
    {
        public IRegexQuery ADate()
        {
            return this.ADate( Separator.All );
        }

        public IRegexQuery ADate(Separator separator = Separator.All)
        {
                          // [0-3]?[0-9]
            this.Query += RegexTokens.CharsBetween( '0', '3' ) + '?' + RegexTokens.CharsBetween( '0', '9' ) +
                          // (\/|\.|-)
                          "(" + Separators.Resolve( separator ) + ")" +
                          // [0-3]?[0-9]
                          RegexTokens.CharsBetween( '0', '3' ) + '?' + RegexTokens.CharsBetween( '0', '9' ) +
                          // (\/|\.|-)
                          "(" + Separators.Resolve( separator ) + ")" +
                          // [1-9]\d{3}
                          RegexTokens.CharsBetween( '1', '9' ) + RegexTokens.Digit + RegexTokens.QuantityOfPreceding( 3 );

            return this;
        }
    }
}
