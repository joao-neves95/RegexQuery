/*
 * Copyright (c) 2020 João Pedro Martins Neves (SHIVAYL) - All Rights Reserved.
 *
 * RegexQuery and all its contents are licensed under the GNU General Public License v3.0
 * (GPL-3.0), located in the root folder, under the name "LICENSE.md".
 *
 */

using RegexQueryCSharp.Constants;

namespace RegexQueryCSharp
{
    public static class RegexExpressions
    {
        #region PUBLIC EXPRESSIONS

        public static string Digit => @"\d";

        public static string Space => @"\s";

        #endregion PUBLIC EXPRESSIONS

        #region PRIVATE EXPRESSIONS

        internal static string ValueBetween(char fromChar, char toChar)
        {
            return $"[{fromChar}{Separators.ForwardSlash}{toChar}]";
        }

        internal static string QuantityOfPreceding(uint quantity)
        {
            return $"{{{quantity}}}";
        }

        #endregion PRIVATE EXPRESSIONS
    }
}
