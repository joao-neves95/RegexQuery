/*
 * Copyright (c) 2020 João Pedro Martins Neves (SHIVAYL) - All Rights Reserved.
 *
 * RegexQuery and all its contents are licensed under the GNU General Public License v3.0
 * (GPL-3.0), located in the root folder, under the name "LICENSE.md".
 *
 */

using Bridge;
using RegexQuery.Interfaces;
using RegexQuery.Constants;

namespace RegexQuery
{
    // Implements IRegexQueryTokens
    public partial class RegexQuery
    {
        public IRegexQuery ASpace()
        {
            this.Query += RegexTokens.WhiteSpace;
            return this;
        }

        public IRegexQuery ADigit()
        {
            this.Query += RegexTokens.Digit;
            return this;
        }

        public IRegexQuery AWord()
        {
            this.Query += RegexTokens.Word;
            return this;
        }

        public IRegexQuery NotAWord()
        {
            this.Query += RegexTokens.NotWord;
            return this;
        }

        public IRegexQuery ANewLine()
        {
            this.Query += RegexTokens.NewLine;
            return this;
        }

        public IRegexQuery AtStartOfString()
        {
            this.Query += RegexTokens.StartOfString;
            return this;
        }

        public IRegexQuery AtEndOfString()
        {
            this.Query += RegexTokens.EndOfString;
            return this;
        }

        public IRegexQuery ATab()
        {
            this.Query += RegexTokens.Tab;
            return this;
        }

        public IRegexQuery ACarriageReturn()
        {
            this.Query += RegexTokens.CarriageReturn;
            return this;
        }

        public IRegexQuery AWhiteSpace()
        {
            this.Query += RegexTokens.WhiteSpace;
            return this;
        }

        public IRegexQuery NotAWhiteSpace()
        {
            this.Query += RegexTokens.NotWhiteSpace;
            return this;
        }
        public IRegexQuery AnyCharExceptNewLine()
        {
            this.Query += RegexTokens.AnyCharExceptNewLine;
            return this;
        }

        public IRegexQuery AWordBoundary()
        {
            this.Query += RegexTokens.WordBoundary;
            return this;
        }

        public IRegexQuery NotAWordBoundary()
        {
            this.Query += RegexTokens.NotWordBoundary;
            return this;
        }
    }
}
