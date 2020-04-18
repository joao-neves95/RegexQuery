/*
 * Copyright (c) 2020 João Pedro Martins Neves (SHIVAYL) - All Rights Reserved.
 *
 * RegexQuery and all its contents are licensed under the GNU General Public License v3.0
 * (GPL-3.0), located in the root folder, under the name "LICENSE.md".
 *
 */

using System.Text;

/*
 * Resources:
 *
 * - https://regexr.com/
 *
 */

namespace RegexQueryCSharp.Interfaces
{
    public interface IRegexQuery
    {
        StringBuilder Query { get; }

        string ToString();

        /// <summary>
        ///
        /// A string beginning with ("^").
        ///
        /// </summary>
        /// <returns></returns>
        IRegexQuery BeginningOfString();

        IRegexQuery EndOfString();

        IRegexQuery Group( string content );

        IRegexQuery BeginGroup();

        IRegexQuery EndGroup();

        /// <summary>
        ///
        /// [<chars>]
        ///
        /// </summary>
        /// <param name="characters"></param>
        IRegexQuery AnyOf( char[] characters );

        IRegexQuery AnyOf( string characters );

        /// <summary>
        ///
        /// [^<chars>]
        ///
        /// </summary>
        /// <param name="characters"></param>
        /// <returns></returns>
        IRegexQuery NotAnyOf( char[] characters );

        IRegexQuery CharsBetween( char fromChar, char toChar );

        IRegexQuery ButOnly( uint quantity );

        IRegexQuery ButOnlyOne();

        IRegexQuery ButOnlyNoneOrOne();

        IRegexQuery ButOnlyNoneOrMore();

        IRegexQuery ButOnlyOneOrMore();

        IRegexQuery ButOnlyBetween( uint fromCount, uint toCount );

        IRegexQuery ButOnlyMoreThan( uint quantity );

        IRegexQuery Or();

        /// <summary>
        ///
        /// ("?="<something>)
        ///
        /// </summary>
        /// <param name="str"></param>
        /// <returns></returns>
        IRegexQuery FollowedBy( string content );

        /// <summary>
        ///
        /// ("?!"<something>)
        ///
        /// </summary>
        /// <param name="str"></param>
        /// <returns></returns>
        IRegexQuery NotFollowedBy( string content );

        IRegexQuery BeginFollowedBy();

        IRegexQuery EndFollowedBy();

        IRegexQuery BeginNotFollowedBy();

        IRegexQuery EndNotFollowedBy();
    }
}
