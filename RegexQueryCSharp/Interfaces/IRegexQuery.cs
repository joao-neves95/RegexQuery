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

        /// <summary>
        ///
        /// [<char><char><char>]
        ///
        /// </summary>
        /// <param name="characters"></param>
        IRegexQuery AnyOf( char[] characters );

        IRegexQuery ValueBetween( char fromChar, char toChar );

        IRegexQuery ButOnlyOne();

        IRegexQuery ButOnly( uint quantity );

        IRegexQuery Or();

        /// <summary>
        ///
        /// ("?="<something>)
        ///
        /// </summary>
        /// <param name="str"></param>
        /// <returns></returns>
        IRegexQuery FollowedBy( string str );

        /// <summary>
        ///
        /// ("?!"<something>)
        ///
        /// </summary>
        /// <param name="str"></param>
        /// <returns></returns>
        IRegexQuery NotFollowedBy( string str );

    }
}
