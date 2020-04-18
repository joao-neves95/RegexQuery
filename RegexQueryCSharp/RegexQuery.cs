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

namespace RegexQueryCSharp
{
    public class RegexQuery : IRegexQuery
    {
        public RegexQuery()
        {
            this.Query = new StringBuilder();
        }

        private bool _openedGroup;

        public StringBuilder Query { get; }

        public override string ToString()
        {
            return this.Query.ToString();
        }

        public IRegexQuery BeginningOfString()
        {
            this.Query.Append( RegexTokens.StartOfString );
            return this;
        }

        public IRegexQuery EndOfString()
        {
            this.Query.Append( RegexTokens.EndOfString );
            return this;
        }

        public IRegexQuery Group(string content)
        {
            this.BeginGroup();
            this.Query.Append( content );
            this.EndGroup();
            return this;
        }

        public IRegexQuery BeginGroup()
        {
            this.Query.Append( "(" );
            this._openedGroup = true;
            return this;
        }

        public IRegexQuery EndGroup()
        {
            this.Query.Append( ")" );
            this._openedGroup = false;
            return this;
        }

        public IRegexQuery AnyOf(char[] characters)
        {
            return this.AnyOf( new string( characters ) );
        }

        public IRegexQuery AnyOf(string characters)
        {
            this.Query.Append( "[" ).Append( characters ).Append( "]" );
            return this;
        }

        public IRegexQuery NotAnyOf(char[] characters)
        {
            this.Query.Append( "[^" ).Append( characters ).Append( "]" );
            return this;
        }

        public IRegexQuery CharsBetween(char fromChar, char toChar)
        {
            this.Query.Append( "[" )
                      .Append( fromChar ).Append( "-" ).Append( toChar )
                      .Append( "]" );

            return this;
        }

        public IRegexQuery ButOnly(uint quantity)
        {
            this.Query.Append( "{" ).Append( quantity ).Append( "}" );
            return this;
        }

        public IRegexQuery ButOnlyOne()
        {
            this.Query.Append( "{1}" );
            return this;
        }

        public IRegexQuery ButOnlyNoneOrOne()
        {
            this.Query.Append( "?" );
            return this;
        }

        public IRegexQuery ButOnlyNoneOrMore()
        {
            this.Query.Append( "*" );
            return this;
        }

        public IRegexQuery ButOnlyOneOrMore()
        {
            this.Query.Append( "+" );
            return this;
        }

        public IRegexQuery ButOnlyBetween(uint fromCount, uint toCount)
        {
            this.Query.Append( "{" )
                      .Append( fromCount ).Append( "," ).Append( toCount )
                      .Append( "}" );

            return this;
        }

        public IRegexQuery ButOnlyMoreThan(uint quantity)
        {
            this.Query.Append( "{" ).Append( quantity ).Append( "," ).Append( "}" );
            return this;
        }

        public IRegexQuery Or()
        {
            this.Query.Append( RegexTokens.Or );
            return this;
        }

        public IRegexQuery FollowedBy(string content)
        {
            this.BeginGroup();
            this.Query.Append( RegexTokens.FollowedBy ).Append( content );
            this.EndGroup();
            return this;
        }

        public IRegexQuery NotFollowedBy(string content)
        {
            this.BeginGroup();
            this.Query.Append( RegexTokens.NotFollowedBy ).Append( content );
            this.EndGroup();
            return this;
        }

        public IRegexQuery BeginFollowedBy()
        {
            this.BeginGroup();
            this.Query.Append( RegexTokens.FollowedBy );
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
            this.Query.Append( RegexTokens.NotFollowedBy );
            return this;
        }

        public IRegexQuery EndNotFollowedBy()
        {
            this.EndGroup();
            return this;
        }
    }
}
