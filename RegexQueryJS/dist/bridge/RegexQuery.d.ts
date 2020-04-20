/// <reference path="./bridge.d.ts" />
/*
 * Copyright (c) 2020 João Pedro Martins Neves (SHIVAYL) - All Rights Reserved.
 *
 * RegexQuery and all its contents are licensed under the GNU General Public License v3.0
 * (GPL-3.0), located in the root folder, under the name "LICENSE.md".
 *
 */


/** @namespace RegexQuery.Constants */

/**
 * @static
 * @abstract
 * @public
 * @class RegexTokens
 */
interface RegexTokens {
}
interface RegexTokensFunc extends Function {
    prototype: RegexTokens;
    new (): RegexTokens;
    /**
     * @static
     * @public
     * @memberof RegexTokens
     * @constant
     * @default "^"
     * @type string
     */
    StartOfString: string | null;
    /**
     * @static
     * @public
     * @memberof RegexTokens
     * @constant
     * @default "$"
     * @type string
     */
    EndOfString: string | null;
    /**
     * @static
     * @public
     * @memberof RegexTokens
     * @constant
     * @default "."
     * @type string
     */
    AnyCharExceptNewLine: string | null;
    /**
     * @static
     * @public
     * @memberof RegexTokens
     * @constant
     * @default "\\w"
     * @type string
     */
    Word: string | null;
    /**
     * @static
     * @public
     * @memberof RegexTokens
     * @constant
     * @default "\\W"
     * @type string
     */
    NotWord: string | null;
    /**
     * @static
     * @public
     * @memberof RegexTokens
     * @constant
     * @default "\\d"
     * @type string
     */
    Digit: string | null;
    /**
     * @static
     * @public
     * @memberof RegexTokens
     * @constant
     * @default "\\D"
     * @type string
     */
    NotDigit: string | null;
    /**
     * @static
     * @public
     * @memberof RegexTokens
     * @constant
     * @default "\\s"
     * @type string
     */
    WhiteSpace: string | null;
    /**
     * @static
     * @public
     * @memberof RegexTokens
     * @constant
     * @default "\\S"
     * @type string
     */
    NotWhiteSpace: string | null;
    /**
     * @static
     * @public
     * @memberof RegexTokens
     * @constant
     * @default "\\t"
     * @type string
     */
    Tab: string | null;
    /**
     * @static
     * @public
     * @memberof RegexTokens
     * @constant
     * @default "\\n"
     * @type string
     */
    NewLine: string | null;
    /**
     * @static
     * @public
     * @memberof RegexTokens
     * @constant
     * @default "\\r"
     * @type string
     */
    CarriageReturn: string | null;
    /**
     * @static
     * @public
     * @memberof RegexTokens
     * @constant
     * @default "\\b"
     * @type string
     */
    WordBoundary: string | null;
    /**
     * @static
     * @public
     * @memberof RegexTokens
     * @constant
     * @default "\\B"
     * @type string
     */
    NotWordBoundary: string | null;
    /**
     * @static
     * @public
     * @memberof RegexTokens
     * @constant
     * @default "?!="
     * @type string
     */
    FollowedBy: string | null;
    /**
     * @static
     * @public
     * @memberof RegexTokens
     * @constant
     * @default "?!"
     * @type string
     */
    NotFollowedBy: string | null;
    /**
     * @static
     * @public
     * @memberof RegexTokens
     * @constant
     * @default "|"
     * @type string
     */
    Or: string | null;
    /**
     * @static
     * @this RegexTokens
     * @memberof RegexTokens
     * @param   {string}    fromChar    
     * @param   {string}    toChar
     * @return  {string}
     */
    /**
     * @static
     * @this RegexTokens
     * @memberof RegexTokens
     * @param   {number}    quantity
     * @return  {string}
     */
    /**
     * @static
     * @this RegexTokens
     * @memberof RegexTokens
     * @param   {string}    token
     * @return  {string}
     */
}
declare var RegexTokens: RegexTokensFunc;

/**
 * @static
 * @abstract
 * @public
 * @class Separators
 */
interface Separators {
}
interface SeparatorsFunc extends Function {
    prototype: Separators;
    new (): Separators;
    /**
     * @static
     * @public
     * @memberof Separators
     * @constant
     * @default "."
     * @type string
     */
    Dot: string | null;
    /**
     * @static
     * @public
     * @memberof Separators
     * @constant
     * @default "/"
     * @type string
     */
    ForwardSlash: string | null;
    /**
     * @static
     * @public
     * @memberof Separators
     * @constant
     * @default "-"
     * @type string
     */
    Minus: string | null;
    /**
     * @static
     * @public
     * @this Separators
     * @memberof Separators
     * @param   {Array.<Separator>}    separators     
     * @param   {boolean}              regexEscape
     * @return  {Array.<string>}
     */
    Resolve$1(separators: Separator[] | null, regexEscape?: boolean): string[] | null;
    /**
     * @static
     * @public
     * @this Separators
     * @memberof Separators
     * @param   {Separator}    separator      
     * @param   {boolean}      regexEscape
     * @return  {string}
     */
    Resolve(separator: Separator, regexEscape?: boolean): string | null;
}
declare var Separators: SeparatorsFunc;

/** @namespace RegexQuery.Enums */

/**
 * @public
 * @class Separator
 */
enum Separator {
    Dot = 0,
    ForwardSlash = 1,
    Minus = 2,
    All = 3
}

/** @namespace RegexQuery.Interfaces */

/**
 * @abstract
 * @public
 * @class IRegexQueryPatterns
 */
interface IRegexQueryPatterns {
    /**
     * @instance
     * @abstract
     * @public
     * @this IRegexQueryPatterns
     * @memberof IRegexQueryPatterns
     * @return  {IRegexQuery}
     */
    IRegexQueryPatterns$ADate(): IRegexQuery | null;
    ADate(): IRegexQuery | null;
    /**
     * @instance
     * @abstract
     * @public
     * @this IRegexQueryPatterns
     * @memberof IRegexQueryPatterns
     * @param   {Separator}      separator
     * @return  {IRegexQuery}
     */
    IRegexQueryPatterns$ADate$1(separator?: Separator): IRegexQuery | null;
    ADate$1(separator?: Separator): IRegexQuery | null;
    /**
     * @instance
     * @abstract
     * @public
     * @this IRegexQueryPatterns
     * @memberof IRegexQueryPatterns
     * @param   {Array.<Separator>}    separator    If null, it defaults to All.
     * @return  {IRegexQuery}
     */
    IRegexQueryPatterns$ADateSeparatedBy(separator?: Separator[] | null): IRegexQuery | null;
    ADateSeparatedBy(separator?: Separator[] | null): IRegexQuery | null;
}

/**
 * @abstract
 * @public
 * @class IRegexQueryTokens
 */
interface IRegexQueryTokens {
    /**
     * @instance
     * @abstract
     * @public
     * @this IRegexQueryTokens
     * @memberof IRegexQueryTokens
     * @return  {IRegexQuery}
     */
    IRegexQueryTokens$ASpace(): IRegexQuery | null;
    ASpace(): IRegexQuery | null;
    /**
     * @instance
     * @abstract
     * @public
     * @this IRegexQueryTokens
     * @memberof IRegexQueryTokens
     * @return  {IRegexQuery}
     */
    IRegexQueryTokens$ADigit(): IRegexQuery | null;
    ADigit(): IRegexQuery | null;
    /**
     * @instance
     * @abstract
     * @public
     * @this IRegexQueryTokens
     * @memberof IRegexQueryTokens
     * @return  {IRegexQuery}
     */
    IRegexQueryTokens$AWord(): IRegexQuery | null;
    AWord(): IRegexQuery | null;
    /**
     * @instance
     * @abstract
     * @public
     * @this IRegexQueryTokens
     * @memberof IRegexQueryTokens
     * @return  {IRegexQuery}
     */
    IRegexQueryTokens$NotAWord(): IRegexQuery | null;
    NotAWord(): IRegexQuery | null;
    /**
     * @instance
     * @abstract
     * @public
     * @this IRegexQueryTokens
     * @memberof IRegexQueryTokens
     * @return  {IRegexQuery}
     */
    IRegexQueryTokens$ANewLine(): IRegexQuery | null;
    ANewLine(): IRegexQuery | null;
    /**
     * @instance
     * @abstract
     * @public
     * @this IRegexQueryTokens
     * @memberof IRegexQueryTokens
     * @return  {IRegexQuery}
     */
    IRegexQueryTokens$AtStartOfString(): IRegexQuery | null;
    AtStartOfString(): IRegexQuery | null;
    /**
     * @instance
     * @abstract
     * @public
     * @this IRegexQueryTokens
     * @memberof IRegexQueryTokens
     * @return  {IRegexQuery}
     */
    IRegexQueryTokens$AtEndOfString(): IRegexQuery | null;
    AtEndOfString(): IRegexQuery | null;
    /**
     * @instance
     * @abstract
     * @public
     * @this IRegexQueryTokens
     * @memberof IRegexQueryTokens
     * @return  {IRegexQuery}
     */
    IRegexQueryTokens$ATab(): IRegexQuery | null;
    ATab(): IRegexQuery | null;
    /**
     * @instance
     * @abstract
     * @public
     * @this IRegexQueryTokens
     * @memberof IRegexQueryTokens
     * @return  {IRegexQuery}
     */
    IRegexQueryTokens$ACarriageReturn(): IRegexQuery | null;
    ACarriageReturn(): IRegexQuery | null;
    /**
     * @instance
     * @abstract
     * @public
     * @this IRegexQueryTokens
     * @memberof IRegexQueryTokens
     * @return  {IRegexQuery}
     */
    IRegexQueryTokens$AWhiteSpace(): IRegexQuery | null;
    AWhiteSpace(): IRegexQuery | null;
    /**
     * @instance
     * @abstract
     * @public
     * @this IRegexQueryTokens
     * @memberof IRegexQueryTokens
     * @return  {IRegexQuery}
     */
    IRegexQueryTokens$NotAWhiteSpace(): IRegexQuery | null;
    NotAWhiteSpace(): IRegexQuery | null;
    /**
     * @instance
     * @abstract
     * @public
     * @this IRegexQueryTokens
     * @memberof IRegexQueryTokens
     * @return  {IRegexQuery}
     */
    IRegexQueryTokens$AnyCharExceptNewLine(): IRegexQuery | null;
    AnyCharExceptNewLine(): IRegexQuery | null;
    /**
     * @instance
     * @abstract
     * @public
     * @this IRegexQueryTokens
     * @memberof IRegexQueryTokens
     * @return  {IRegexQuery}
     */
    IRegexQueryTokens$AWordBoundary(): IRegexQuery | null;
    AWordBoundary(): IRegexQuery | null;
    /**
     * @instance
     * @abstract
     * @public
     * @this IRegexQueryTokens
     * @memberof IRegexQueryTokens
     * @return  {IRegexQuery}
     */
    IRegexQueryTokens$NotAWordBoundary(): IRegexQuery | null;
    NotAWordBoundary(): IRegexQuery | null;
}

/**
 * @abstract
 * @public
 * @class IRegexQuery
 * @implements  RegexQuery.Interfaces.IRegexQueryActions
 * @implements  IRegexQueryTokens
 * @implements  IRegexQueryPatterns
 */
interface IRegexQuery extends RegexQuery.Interfaces.IRegexQueryActions,IRegexQueryTokens,IRegexQueryPatterns {
}

/** @namespace RegexQuery */

/**
 * @public
 * @class RegexQuery
 * @implements  IRegexQuery
 */
interface RegexQuery extends IRegexQuery {
    /**
     * @instance
     * @public
     * @memberof RegexQuery
     * @function Query
     * @type string
     */
    Query: string | null;
    /**
     * @instance
     * @public
     * @override
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {string}
     */
    toString(): string | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    BeginningOfString(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    EndOfString(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @param   {string}         content
     * @return  {IRegexQuery}
     */
    Group(content: string | null): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    BeginGroup(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    EndGroup(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @param   {Array.<number>}    characters
     * @return  {IRegexQuery}
     */
    AnyOf(characters: number[] | null): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @param   {string}         characters
     * @return  {IRegexQuery}
     */
    AnyOf$1(characters: string | null): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @param   {Array.<number>}    characters
     * @return  {IRegexQuery}
     */
    NotAnyOf(characters: number[] | null): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @param   {number}         fromChar    
     * @param   {number}         toChar
     * @return  {IRegexQuery}
     */
    CharsBetween(fromChar: number, toChar: number): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @param   {number}         quantity
     * @return  {IRegexQuery}
     */
    ButOnly(quantity: number): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    ButOnlyOne(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    ButOnlyNoneOrOne(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    ButOnlyNoneOrMore(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    ButOnlyOneOrMore(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @param   {number}         fromCount    
     * @param   {number}         toCount
     * @return  {IRegexQuery}
     */
    ButOnlyBetween(fromCount: number, toCount: number): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @param   {number}         quantity
     * @return  {IRegexQuery}
     */
    ButOnlyMoreThan(quantity: number): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    Or(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @param   {string}         content
     * @return  {IRegexQuery}
     */
    FollowedBy(content: string | null): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @param   {string}         content
     * @return  {IRegexQuery}
     */
    NotFollowedBy(content: string | null): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    BeginFollowedBy(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    EndFollowedBy(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    BeginNotFollowedBy(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    EndNotFollowedBy(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    ADate(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @param   {Separator}      separator
     * @return  {IRegexQuery}
     */
    ADate$1(separator?: Separator): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @param   {Array.<Separator>}    separator
     * @return  {IRegexQuery}
     */
    ADateSeparatedBy(separator?: Separator[] | null): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    ASpace(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    ADigit(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    AWord(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    NotAWord(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    ANewLine(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    AtStartOfString(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    AtEndOfString(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    ATab(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    ACarriageReturn(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    AWhiteSpace(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    NotAWhiteSpace(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    AnyCharExceptNewLine(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    AWordBoundary(): IRegexQuery | null;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {IRegexQuery}
     */
    NotAWordBoundary(): IRegexQuery | null;
}
interface RegexQueryFunc extends Function {
    prototype: RegexQuery;
    /**
     * @instance
     * @public
     * @this RegexQuery
     * @memberof RegexQuery
     * @return  {void}
     */
    new (): RegexQuery;
}
declare var RegexQuery: RegexQueryFunc;

/**
 * @class RegexQuery.Example
 */
interface Example {
    /**
     * @instance
     * @private
     * @this RegexQuery.Example
     * @memberof RegexQuery.Example
     * @return  {void}
     */
}
interface ExampleFunc extends Function {
    prototype: Example;
    new (): Example;
}
var Example: ExampleFunc;

}

declare namespace RegexQuery.Interfaces {
    /**
     * @abstract
     * @public
     * @class RegexQuery.Interfaces.IRegexQueryActions
     */
    interface IRegexQueryActions {
        /**
         * @instance
         * @abstract
         * @public
         * @this RegexQuery.Interfaces.IRegexQueryActions
         * @memberof RegexQuery.Interfaces.IRegexQueryActions
         * @return  {string}
         */
        RegexQuery$Interfaces$IRegexQueryActions$ToString(): string | null;
        ToString(): string | null;
        /**
         * A string beginning with ("^").
         *
         * @instance
         * @abstract
         * @public
         * @this RegexQuery.Interfaces.IRegexQueryActions
         * @memberof RegexQuery.Interfaces.IRegexQueryActions
         * @return  {IRegexQuery}
         */
        RegexQuery$Interfaces$IRegexQueryActions$BeginningOfString(): IRegexQuery | null;
        BeginningOfString(): IRegexQuery | null;
        /**
         * @instance
         * @abstract
         * @public
         * @this RegexQuery.Interfaces.IRegexQueryActions
         * @memberof RegexQuery.Interfaces.IRegexQueryActions
         * @return  {IRegexQuery}
         */
        RegexQuery$Interfaces$IRegexQueryActions$EndOfString(): IRegexQuery | null;
        EndOfString(): IRegexQuery | null;
        /**
         * @instance
         * @abstract
         * @public
         * @this RegexQuery.Interfaces.IRegexQueryActions
         * @memberof RegexQuery.Interfaces.IRegexQueryActions
         * @param   {string}         content
         * @return  {IRegexQuery}
         */
        RegexQuery$Interfaces$IRegexQueryActions$Group(content: string | null): IRegexQuery | null;
        Group(content: string | null): IRegexQuery | null;
        /**
         * @instance
         * @abstract
         * @public
         * @this RegexQuery.Interfaces.IRegexQueryActions
         * @memberof RegexQuery.Interfaces.IRegexQueryActions
         * @return  {IRegexQuery}
         */
        RegexQuery$Interfaces$IRegexQueryActions$BeginGroup(): IRegexQuery | null;
        BeginGroup(): IRegexQuery | null;
        /**
         * @instance
         * @abstract
         * @public
         * @this RegexQuery.Interfaces.IRegexQueryActions
         * @memberof RegexQuery.Interfaces.IRegexQueryActions
         * @return  {IRegexQuery}
         */
        RegexQuery$Interfaces$IRegexQueryActions$EndGroup(): IRegexQuery | null;
        EndGroup(): IRegexQuery | null;
        
        RegexQuery$Interfaces$IRegexQueryActions$AnyOf(characters: number[] | null): IRegexQuery | null;
        AnyOf(characters: number[] | null): IRegexQuery | null;
        /**
         * @instance
         * @abstract
         * @public
         * @this RegexQuery.Interfaces.IRegexQueryActions
         * @memberof RegexQuery.Interfaces.IRegexQueryActions
         * @param   {string}         characters
         * @return  {IRegexQuery}
         */
        RegexQuery$Interfaces$IRegexQueryActions$AnyOf$1(characters: string | null): IRegexQuery | null;
        AnyOf$1(characters: string | null): IRegexQuery | null;
        
        RegexQuery$Interfaces$IRegexQueryActions$NotAnyOf(characters: number[] | null): IRegexQuery | null;
        NotAnyOf(characters: number[] | null): IRegexQuery | null;
        /**
         * @instance
         * @abstract
         * @public
         * @this RegexQuery.Interfaces.IRegexQueryActions
         * @memberof RegexQuery.Interfaces.IRegexQueryActions
         * @param   {number}         fromChar    
         * @param   {number}         toChar
         * @return  {IRegexQuery}
         */
        RegexQuery$Interfaces$IRegexQueryActions$CharsBetween(fromChar: number, toChar: number): IRegexQuery | null;
        CharsBetween(fromChar: number, toChar: number): IRegexQuery | null;
        /**
         * @instance
         * @abstract
         * @public
         * @this RegexQuery.Interfaces.IRegexQueryActions
         * @memberof RegexQuery.Interfaces.IRegexQueryActions
         * @param   {number}         quantity
         * @return  {IRegexQuery}
         */
        RegexQuery$Interfaces$IRegexQueryActions$ButOnly(quantity: number): IRegexQuery | null;
        ButOnly(quantity: number): IRegexQuery | null;
        /**
         * @instance
         * @abstract
         * @public
         * @this RegexQuery.Interfaces.IRegexQueryActions
         * @memberof RegexQuery.Interfaces.IRegexQueryActions
         * @return  {IRegexQuery}
         */
        RegexQuery$Interfaces$IRegexQueryActions$ButOnlyOne(): IRegexQuery | null;
        ButOnlyOne(): IRegexQuery | null;
        /**
         * @instance
         * @abstract
         * @public
         * @this RegexQuery.Interfaces.IRegexQueryActions
         * @memberof RegexQuery.Interfaces.IRegexQueryActions
         * @return  {IRegexQuery}
         */
        RegexQuery$Interfaces$IRegexQueryActions$ButOnlyNoneOrOne(): IRegexQuery | null;
        ButOnlyNoneOrOne(): IRegexQuery | null;
        /**
         * @instance
         * @abstract
         * @public
         * @this RegexQuery.Interfaces.IRegexQueryActions
         * @memberof RegexQuery.Interfaces.IRegexQueryActions
         * @return  {IRegexQuery}
         */
        RegexQuery$Interfaces$IRegexQueryActions$ButOnlyNoneOrMore(): IRegexQuery | null;
        ButOnlyNoneOrMore(): IRegexQuery | null;
        /**
         * @instance
         * @abstract
         * @public
         * @this RegexQuery.Interfaces.IRegexQueryActions
         * @memberof RegexQuery.Interfaces.IRegexQueryActions
         * @return  {IRegexQuery}
         */
        RegexQuery$Interfaces$IRegexQueryActions$ButOnlyOneOrMore(): IRegexQuery | null;
        ButOnlyOneOrMore(): IRegexQuery | null;
        /**
         * @instance
         * @abstract
         * @public
         * @this RegexQuery.Interfaces.IRegexQueryActions
         * @memberof RegexQuery.Interfaces.IRegexQueryActions
         * @param   {number}         fromCount    
         * @param   {number}         toCount
         * @return  {IRegexQuery}
         */
        RegexQuery$Interfaces$IRegexQueryActions$ButOnlyBetween(fromCount: number, toCount: number): IRegexQuery | null;
        ButOnlyBetween(fromCount: number, toCount: number): IRegexQuery | null;
        /**
         * @instance
         * @abstract
         * @public
         * @this RegexQuery.Interfaces.IRegexQueryActions
         * @memberof RegexQuery.Interfaces.IRegexQueryActions
         * @param   {number}         quantity
         * @return  {IRegexQuery}
         */
        RegexQuery$Interfaces$IRegexQueryActions$ButOnlyMoreThan(quantity: number): IRegexQuery | null;
        ButOnlyMoreThan(quantity: number): IRegexQuery | null;
        /**
         * @instance
         * @abstract
         * @public
         * @this RegexQuery.Interfaces.IRegexQueryActions
         * @memberof RegexQuery.Interfaces.IRegexQueryActions
         * @return  {IRegexQuery}
         */
        RegexQuery$Interfaces$IRegexQueryActions$Or(): IRegexQuery | null;
        Or(): IRegexQuery | null;
        
        RegexQuery$Interfaces$IRegexQueryActions$FollowedBy(content: string | null): IRegexQuery | null;
        FollowedBy(content: string | null): IRegexQuery | null;
        
        RegexQuery$Interfaces$IRegexQueryActions$NotFollowedBy(content: string | null): IRegexQuery | null;
        NotFollowedBy(content: string | null): IRegexQuery | null;
        /**
         * @instance
         * @abstract
         * @public
         * @this RegexQuery.Interfaces.IRegexQueryActions
         * @memberof RegexQuery.Interfaces.IRegexQueryActions
         * @return  {IRegexQuery}
         */
        RegexQuery$Interfaces$IRegexQueryActions$BeginFollowedBy(): IRegexQuery | null;
        BeginFollowedBy(): IRegexQuery | null;
        /**
         * @instance
         * @abstract
         * @public
         * @this RegexQuery.Interfaces.IRegexQueryActions
         * @memberof RegexQuery.Interfaces.IRegexQueryActions
         * @return  {IRegexQuery}
         */
        RegexQuery$Interfaces$IRegexQueryActions$EndFollowedBy(): IRegexQuery | null;
        EndFollowedBy(): IRegexQuery | null;
        /**
         * @instance
         * @abstract
         * @public
         * @this RegexQuery.Interfaces.IRegexQueryActions
         * @memberof RegexQuery.Interfaces.IRegexQueryActions
         * @return  {IRegexQuery}
         */
        RegexQuery$Interfaces$IRegexQueryActions$BeginNotFollowedBy(): IRegexQuery | null;
        BeginNotFollowedBy(): IRegexQuery | null;
        /**
         * @instance
         * @abstract
         * @public
         * @this RegexQuery.Interfaces.IRegexQueryActions
         * @memberof RegexQuery.Interfaces.IRegexQueryActions
         * @return  {IRegexQuery}
         */
        RegexQuery$Interfaces$IRegexQueryActions$EndNotFollowedBy(): IRegexQuery | null;
        EndNotFollowedBy(): IRegexQuery | null;
    }
}
