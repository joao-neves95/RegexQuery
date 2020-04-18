/*
 * Copyright (c) 2020 João Pedro Martins Neves (SHIVAYL) - All Rights Reserved.
 *
 * RegexQuery and all its contents are licensed under the GNU General Public License v3.0
 * (GPL-3.0), located in the root folder, under the name "LICENSE.md".
 *
 */

using Bridge;

namespace RegexQuery.Constants
{
    [Namespace( false )]
    [Module( ModuleType.UMD, Name = "RegexTokens" )]
    public static class RegexTokens
    {
        #region PUBLIC PROPERTIES

        public const string StartOfString = "^";

        public const string EndOfString = "$";

        public const string AnyCharExceptNewLine = ".";

        public const string Word = @"\w";

        public const string NotWord = @"\W";

        public const string Digit = @"\d";

        public const string NotDigit = @"\D";

        public const string WhiteSpace = @"\s";

        public const string NotWhiteSpace = @"\S";

        public const string Tab = @"\t";

        public const string NewLine = @"\t";

        public const string CarriageReturn = @"\r";

        public const string WordBoundary = @"\b";

        public const string NotWordBoundary = @"\B";

        public const string FollowedBy = "!=";

        public const string NotFollowedBy = "?!";

        public const string Or = "|";

        #endregion PUBLIC PROPERTIES

        #region PRIVATE METHODS

        internal static string CharsBetween(char fromChar, char toChar)
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
