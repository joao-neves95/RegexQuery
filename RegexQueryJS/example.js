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

console.log( 'Hello world' );
console.log( RegexTokens.NotWord );
console.log( new RegexQuery().AnyOf$1( '#%&£§€' ).toString() );
console.log(
  new RegexQuery().ADate()
                  .BeginFollowedBy()
                    .ASpace()
                    .ANewLine()
                  .EndGroup()
                  .toString()
);
