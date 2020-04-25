/*
 * Copyright (c) 2020 João Pedro Martins Neves (SHIVAYL) - All Rights Reserved.
 *
 * RegexQuery and all its contents are licensed under the GNU General Public License v3.0
 * (GPL-3.0), located in the root folder, under the name "LICENSE.md".
 *
 */

'use strict';

//require( './dist/bridge/bridge' );
//const { RegexQuery, RegexTokens } = require( './dist/bridge/RegexQuery' );
const { RegexQuery, RegexTokens } = require( './index' ); // same as `require('RegexQuery')`
const regexQuery = new RegexQuery();

console.log( 'Hello world' );

console.log( RegexTokens.NotWord );

console.log( regexQuery.AnyOf$1( '#%&£§€' ).toString() );
regexQuery.Clear();

console.log(
  regexQuery.ADate()
            .BeginFollowedBy()
              .ASpace()
              .ANewLine()
            .EndGroup()
            .toString()
);
regexQuery.Clear();

// Date:
const dateSeparators = regexQuery.Group(
                                   RegexTokens.Escape( "/" ) + RegexTokens.Or +
                                   RegexTokens.Escape( "." ) + RegexTokens.Or +
                                   RegexTokens.Escape( "-" )
                                 )
                                 .toString();

regexQuery.Clear();

console.log(
  regexQuery.CharsBetween( '0', '3' ).ButOnlyNoneOrOne()
            .CharsBetween( '0', '9' )
            .Content( dateSeparators )
            .CharsBetween( '0', '3' ).ButOnlyNoneOrOne()
            .CharsBetween( '0', '9' )
            .Content( dateSeparators )
            .CharsBetween( '1', '9' ).ADigit().ButOnly( 3 )
            .NotFollowedBy( RegexTokens.WhiteSpace )
            .toString()
);
