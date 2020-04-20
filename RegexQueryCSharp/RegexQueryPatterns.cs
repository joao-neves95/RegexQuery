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

namespace RegexQuery
{
    // Implements IRegexQueryPatterns
    public partial class RegexQuery
    {
        public IRegexQuery ADate()
        {
            return this.ADateSeparatedBy();
        }

        public IRegexQuery ADate(Separator separator = Separator.All)
        {
            if (separator == Separator.All)
            {
                return this.ADateSeparatedBy();
            }
            else
            {
                return this.ADateSeparatedBy( new Separator[] { separator } );
            }
        }

        public IRegexQuery ADateSeparatedBy(Separator[] separator = null)
        {
            separator = separator == null ? new Separator[] { Separator.ForwardSlash, Separator.Dot, Separator.Minus } :
                                            separator;

            string separators = Separators.Resolve( separator );

                          // [0-3]?[0-9]
            this.Query += RegexTokens.CharsBetween( "0", "3" ) + '?' + RegexTokens.CharsBetween( "0", "9" ) +
                          // (\/|\.|-)
                          "(" + separators + ')' +
                          // [0-3]?[0-9]
                          RegexTokens.CharsBetween( "0", "3" ) + '?' + RegexTokens.CharsBetween( "0", "9" ) +
                          // (\/|\.|-)
                          "(" + separators + ')' +
                          // [1-9]\d{3}
                          RegexTokens.CharsBetween( "1", "9" ) + RegexTokens.Digit + RegexTokens.QuantityOfPreceding( 3 );

            return this;
        }
    }
}
