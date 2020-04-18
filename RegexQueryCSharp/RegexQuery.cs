/*
 * Copyright (c) 2020 João Pedro Martins Neves (SHIVAYL) - All Rights Reserved.
 *
 * RegexQuery and all its contents are licensed under the GNU General Public License v3.0
 * (GPL-3.0), located in the root folder, under the name "LICENSE.md".
 *
 */

using Bridge;
using RegexQuery.Constants;
using RegexQuery.Interfaces;

//[assembly: Module( ModuleType.UMD, "RegexQuery" )]
[assembly: Module(ModuleType.UMD, true,Name ="RegexQuery")]
namespace RegexQuery
{
    [Namespace(false)]
    [Module( ModuleType.UMD, Name = "RegexQuery" )]
    // Implements IRegexQueryActions
    public partial class RegexQuery : IRegexQuery
    {
        public RegexQuery()
        {
            this.Query = string.Empty;
        }

        private bool _openedGroup;

        public string Query { get; private set; }

        public IRegexQuery BeginningOfString()
        {
            this.Query += RegexTokens.StartOfString;
            return this;
        }

        public IRegexQuery EndOfString()
        {
            this.Query += RegexTokens.EndOfString;
            return this;
        }

        public IRegexQuery Group(string content)
        {
            this.BeginGroup();
            this.Query += content;
            this.EndGroup();
            return this;
        }

        public IRegexQuery BeginGroup()
        {
            this.Query += "(";
            this._openedGroup = true;
            return this;
        }

        public IRegexQuery EndGroup()
        {
            this.Query += ")";
            this._openedGroup = false;
            return this;
        }

        public IRegexQuery AnyOf(char[] characters)
        {
            return this.AnyOf( new string( characters ) );
        }

        public IRegexQuery AnyOf(string characters)
        {
            this.Query += $"[{characters}]";
            return this;
        }

        public IRegexQuery NotAnyOf(char[] characters)
        {
            this.Query += $"[^{characters}]";
            return this;
        }

        public IRegexQuery CharsBetween(char fromChar, char toChar)
        {
            this.Query += $"[{fromChar}-{ toChar}]";
            return this;
        }

        public IRegexQuery ButOnly(uint quantity)
        {
            this.Query += $"{{{quantity}}}";
            return this;
        }

        public IRegexQuery ButOnlyOne()
        {
            this.Query += "{1}";
            return this;
        }

        public IRegexQuery ButOnlyNoneOrOne()
        {
            this.Query += "?";
            return this;
        }

        public IRegexQuery ButOnlyNoneOrMore()
        {
            this.Query += "*";
            return this;
        }

        public IRegexQuery ButOnlyOneOrMore()
        {
            this.Query += "+";
            return this;
        }

        public IRegexQuery ButOnlyBetween(uint fromCount, uint toCount)
        {
            this.Query += $"{{{fromCount},{toCount}}}";
            return this;
        }

        public IRegexQuery ButOnlyMoreThan(uint quantity)
        {
            this.Query += $"{{{quantity},}}";
            return this;
        }

        public IRegexQuery Or()
        {
            this.Query += RegexTokens.Or;
            return this;
        }

        public IRegexQuery FollowedBy(string content)
        {
            this.BeginGroup();
            this.Query += RegexTokens.FollowedBy + content;
            this.EndGroup();
            return this;
        }

        public IRegexQuery NotFollowedBy(string content)
        {
            this.BeginGroup();
            this.Query += RegexTokens.NotFollowedBy + content;
            this.EndGroup();
            return this;
        }

        public IRegexQuery BeginFollowedBy()
        {
            this.BeginGroup();
            this.Query += RegexTokens.FollowedBy;
            return this;
        }

        public IRegexQuery EndFollowedBy()
        {
            this.EndGroup();
            return this;
        }

        public IRegexQuery BeginNotFollowedBy()
        {
            this.BeginGroup();
            this.Query += RegexTokens.NotFollowedBy;
            return this;
        }

        public IRegexQuery EndNotFollowedBy()
        {
            this.EndGroup();
            return this;
        }
    }
}
