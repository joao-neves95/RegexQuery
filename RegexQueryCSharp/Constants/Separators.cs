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
using RegexQueryCSharp.Interfaces;
using RegexQueryCSharp.Enums;
using System.Text.RegularExpressions;

namespace RegexQueryCSharp.Constants
{
    public static class Separators
    {
        // #regions SEPARATORS

        public const string Dot = ".";

        public const string ForwardSlash = "/";

        public const string Minus = "-";

        // #endregions SEPARATORS

        // #regions UTILITY METHODS

        public static string Resolve(Separator[] separators, bool regexEscape = true)
        {
            StringBuilder result = new StringBuilder();

            for (int i = 0; i < separators.Length; ++i)
            {
                result.Append( Separators.Resolve( separators[i], regexEscape ) );
            }

            return result.ToString();
        }

        public static string Resolve(Separator separator, bool regexEscape = true)
        {
            string result = String.Empty;

            if (separator == Separator.Dot || separator == Separator.All)
            {
                result += regexEscape ? Regex.Escape( Separators.Dot ) : Separators.Dot;
            }
            else if (separator == Separator.ForwardSlash || separator == Separator.All)
            {
                result += regexEscape ? Regex.Escape( Separators.ForwardSlash ) : Separators.ForwardSlash;
            }
            else if (separator == Separator.Minus || separator == Separator.All)
            {
                result += regexEscape ? Regex.Escape( Separators.Minus ) : Separators.Minus;
            }

            return result;
        }

        // #endregions UTILITY METHODS
    }
}
