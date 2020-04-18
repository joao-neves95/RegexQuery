using System;
using System.Collections.Generic;
using System.Text;

namespace RegexQuery.Interfaces
{
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
