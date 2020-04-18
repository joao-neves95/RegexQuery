/*
 * Copyright (c) 2020 João Pedro Martins Neves (SHIVAYL) - All Rights Reserved.
 *
 * RegexQuery and all its contents are licensed under the GNU General Public License v3.0
 * (GPL-3.0), located in the root folder, under the name "LICENSE.md".
 *
 */

using Bridge;

namespace RegexQuery.Interfaces
{
    [Namespace( false )]
    [Module( ModuleType.UMD, Name = "RegexQuery" )]
    public interface IRegexQueryTokens
    {
        IRegexQuery ASpace();

        IRegexQuery ADigit();

        IRegexQuery AWord();

        IRegexQuery NotAWord();

        IRegexQuery ANewLine();

        IRegexQuery AtStartOfString();

        IRegexQuery AtEndOfString();

        IRegexQuery ATab();

        IRegexQuery ACarriageReturn();

        IRegexQuery AWhiteSpace();

        IRegexQuery NotAWhiteSpace();

        IRegexQuery AnyCharExceptNewLine();

        IRegexQuery AWordBoundary();

        IRegexQuery NotAWordBoundary();
    }
}
