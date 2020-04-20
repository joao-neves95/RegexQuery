/*
 * Copyright (c) 2020 João Pedro Martins Neves (SHIVAYL) - All Rights Reserved.
 *
 * RegexQuery and all its contents are licensed under the GNU General Public License v3.0
 * (GPL-3.0), located in the root folder, under the name "LICENSE.md".
 *
 */

using System;
using System.Text;
using System.Text.RegularExpressions;
using Bridge;
using RegexQuery.Enums;

namespace RegexQuery.Constants
{
    [Namespace( false )]
    [Module( ModuleType.UMD, Name = "Separators" )]
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
            switch (separator)
            {
                case Separator.Dot:
                    return regexEscape ? Regex.Escape( Separators.Dot ) : Separators.Dot;
                case Separator.ForwardSlash:
                    return regexEscape ? Regex.Escape( Separators.ForwardSlash ) : Separators.ForwardSlash;
                case Separator.Minus:
                    return regexEscape ? Regex.Escape( Separators.Minus ) : Separators.Minus;
                default:
                    return String.Empty;
            }
        }

        // #endregions UTILITY METHODS
    }
}
