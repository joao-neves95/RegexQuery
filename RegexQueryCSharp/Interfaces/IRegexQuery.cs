/*
 * Copyright (c) 2020 João Pedro Martins Neves (SHIVAYL) - All Rights Reserved.
 *
 * RegexQuery and all its contents are licensed under the GNU General Public License v3.0
 * (GPL-3.0), located in the root folder, under the name "LICENSE.md".
 *
 */

using System.Text;
using Bridge;

/*
 * Resources:
 *
 * - https://regexr.com/
 *
 */

namespace RegexQuery.Interfaces
{
    [Namespace( false )]
    [Module( ModuleType.UMD, Name = "RegexQuery" )]
    public interface IRegexQuery :
        IRegexQueryActions,
        IRegexQueryTokens,
        IRegexQueryPatterns
    {
        string Query { get; }
    }
}
