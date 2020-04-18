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
using RegexQuery.Interfaces;

namespace RegexQuery
{
    internal class Example
    {
        private void Main()
        {
            string regexQuery1 = new RegexQuery().ADate()
                                                 .BeginFollowedBy().ANewLine().EndGroup()
                                                 .ToString();
        }
    }
}
