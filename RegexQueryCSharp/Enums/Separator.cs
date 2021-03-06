/*
 * Copyright (c) 2020 João Pedro Martins Neves (SHIVAYL) - All Rights Reserved.
 *
 * RegexQuery and all its contents are licensed under the GNU General Public License v3.0
 * (GPL-3.0), located in the root folder, under the name "LICENSE.md".
 *
 */

using Bridge;

namespace RegexQuery.Enums
{
    [Namespace( false )]
    [Module( ModuleType.UMD, Name = "Separator" )]
    public enum Separator
    {
        Dot,
        ForwardSlash,
        Minus,
        All
    }
}
