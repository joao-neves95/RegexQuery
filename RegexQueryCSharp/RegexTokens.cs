/*
 * Copyright (c) 2020 João Pedro Martins Neves (SHIVAYL) - All Rights Reserved.
 *
 * RegexQuery and all its contents are licensed under the GNU General Public License v3.0
 * (GPL-3.0), located in the root folder, under the name "LICENSE.md".
 *
 */

using RegexQueryCSharp.Constants;

using System;

namespace RegexQueryCSharp
{
    public static class RegexTokens
    {
        #region PUBLIC PROPERTIES

        public static string StartOfString => "^";

        public static string EndOfString => "$";

        public static string AnyCharExceptNewLine => ".";

        public static string Word => @"\w";

        public static string NotWord => @"\W";

        public static string Digit => @"\d";

        public static string NotDigit => @"\D";

        public static string WhiteSpace => @"\s";

        public static string NotWhiteSpace => @"\S";

        public static string Tab => @"\t";

        public static string NewLine => @"\t";

        public static string CarriageReturn => @"\r";

        public static string WordBoundary => @"\b";

        public static string NotWordBoundary => @"\B";

        public static string FollowedBy => "!=";

        public static string NotFollowedBy => "?!";

        public static string Or => "|";

        #endregion PUBLIC PROPERTIES

        #region PRIVATE METHODS

        internal static string ValueBetween(char fromChar, char toChar)
        {
            return $"[{fromChar}{Separators.ForwardSlash}{toChar}]";
        }

        internal static string QuantityOfPreceding(uint quantity)
        {
            return $"{{{quantity}}}";
        }

        #endregion PRIVATE METHODS
    }
}
