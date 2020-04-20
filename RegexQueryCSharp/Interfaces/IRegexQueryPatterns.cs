/*
 * Copyright (c) 2020 João Pedro Martins Neves (SHIVAYL) - All Rights Reserved.
 *
 * RegexQuery and all its contents are licensed under the GNU General Public License v3.0
 * (GPL-3.0), located in the root folder, under the name "LICENSE.md".
 *
 */

using Bridge;
using RegexQuery.Enums;

namespace RegexQuery.Interfaces
{
    [Namespace( false )]
    [Module( ModuleType.UMD, Name = "RegexQuery" )]
    public interface IRegexQueryPatterns
    {
        IRegexQuery ADate();

        IRegexQuery ADate( Separator separator = Separator.All );

        /// <summary>
        /// </summary>
        /// <param name="separator"> If null, it defaults to All. </param>
        /// <returns></returns>
        IRegexQuery ADateSeparatedBy( Separator[] separator = null );
    }
}
