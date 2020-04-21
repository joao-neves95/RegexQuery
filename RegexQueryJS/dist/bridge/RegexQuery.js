/*
 * Copyright (c) 2020 João Pedro Martins Neves (SHIVAYL) - All Rights Reserved.
 *
 * RegexQuery and all its contents are licensed under the GNU General Public License v3.0
 * (GPL-3.0), located in the root folder, under the name "LICENSE.md".
 *
 */
Bridge.assembly("RegexQuery", function ($asm, globals) {
    "use strict";

    (function (root, factory) {
        if (typeof define === 'function' && define.amd) {
            define("RegexQuery", factory);
        } else if (typeof module === 'object' && module.exports) {
            module.exports = factory();
        } else {
            root["RegexQuery"] = factory();
        }
    }(this, function () {
        var RegexQuery = { };
        /** @namespace RegexQuery.Constants */

        /**
         * @static
         * @abstract
         * @public
         * @class RegexQuery.RegexTokens
         */
        Bridge.define("RegexTokens", {
            $scope: RegexQuery,
            $module: "RegexQuery",
            statics: {
                fields: {
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.RegexTokens
                     * @constant
                     * @default "^"
                     * @type string
                     */
                    StartOfString: null,
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.RegexTokens
                     * @constant
                     * @default "$"
                     * @type string
                     */
                    EndOfString: null,
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.RegexTokens
                     * @constant
                     * @default "."
                     * @type string
                     */
                    AnyCharExceptNewLine: null,
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.RegexTokens
                     * @constant
                     * @default "\\w"
                     * @type string
                     */
                    Word: null,
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.RegexTokens
                     * @constant
                     * @default "\\W"
                     * @type string
                     */
                    NotWord: null,
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.RegexTokens
                     * @constant
                     * @default "\\d"
                     * @type string
                     */
                    Digit: null,
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.RegexTokens
                     * @constant
                     * @default "\\D"
                     * @type string
                     */
                    NotDigit: null,
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.RegexTokens
                     * @constant
                     * @default "\\s"
                     * @type string
                     */
                    WhiteSpace: null,
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.RegexTokens
                     * @constant
                     * @default "\\S"
                     * @type string
                     */
                    NotWhiteSpace: null,
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.RegexTokens
                     * @constant
                     * @default "\\t"
                     * @type string
                     */
                    Tab: null,
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.RegexTokens
                     * @constant
                     * @default "\\n"
                     * @type string
                     */
                    NewLine: null,
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.RegexTokens
                     * @constant
                     * @default "\\r"
                     * @type string
                     */
                    CarriageReturn: null,
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.RegexTokens
                     * @constant
                     * @default "\\b"
                     * @type string
                     */
                    WordBoundary: null,
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.RegexTokens
                     * @constant
                     * @default "\\B"
                     * @type string
                     */
                    NotWordBoundary: null,
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.RegexTokens
                     * @constant
                     * @default "?!="
                     * @type string
                     */
                    FollowedBy: null,
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.RegexTokens
                     * @constant
                     * @default "?!"
                     * @type string
                     */
                    NotFollowedBy: null,
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.RegexTokens
                     * @constant
                     * @default "|"
                     * @type string
                     */
                    Or: null
                },
                ctors: {
                    init: function () {
                        this.StartOfString = "^";
                        this.EndOfString = "$";
                        this.AnyCharExceptNewLine = ".";
                        this.Word = "\\w";
                        this.NotWord = "\\W";
                        this.Digit = "\\d";
                        this.NotDigit = "\\D";
                        this.WhiteSpace = "\\s";
                        this.NotWhiteSpace = "\\S";
                        this.Tab = "\\t";
                        this.NewLine = "\\n";
                        this.CarriageReturn = "\\r";
                        this.WordBoundary = "\\b";
                        this.NotWordBoundary = "\\B";
                        this.FollowedBy = "?!=";
                        this.NotFollowedBy = "?!";
                        this.Or = "|";
                    }
                },
                methods: {
                    /**
                     * @static
                     * @public
                     * @this RegexQuery.RegexTokens
                     * @memberof RegexQuery.RegexTokens
                     * @param   {string}    token
                     * @return  {string}
                     */
                    Escape: function (token) {
                        return "\\" + (token || "");
                    },
                    /**
                     * @static
                     * @this RegexQuery.RegexTokens
                     * @memberof RegexQuery.RegexTokens
                     * @param   {string}    fromChar    
                     * @param   {string}    toChar
                     * @return  {string}
                     */
                    CharsBetween: function (fromChar, toChar) {
                        return System.String.format("[{0}{1}{2}]", fromChar, RegexQuery.Separators.Minus, toChar);
                    },
                    /**
                     * @static
                     * @this RegexQuery.RegexTokens
                     * @memberof RegexQuery.RegexTokens
                     * @param   {number}    quantity
                     * @return  {string}
                     */
                    QuantityOfPreceding: function (quantity) {
                        return System.String.format("{{{0}}}", [quantity]);
                    },
                    /**
                     * @static
                     * @this RegexQuery.RegexTokens
                     * @memberof RegexQuery.RegexTokens
                     * @param   {number}    fromCount    
                     * @param   {number}    toCount
                     * @return  {string}
                     */
                    QuantityOfPrecedingBetween$1: function (fromCount, toCount) {
                        return RegexQuery.RegexTokens.QuantityOfPrecedingBetween(Bridge.toString(fromCount), Bridge.toString(toCount));
                    },
                    /**
                     * @static
                     * @this RegexQuery.RegexTokens
                     * @memberof RegexQuery.RegexTokens
                     * @param   {string}    fromCount    
                     * @param   {string}    toCount
                     * @return  {string}
                     */
                    QuantityOfPrecedingBetween: function (fromCount, toCount) {
                        return System.String.format("{{{0},{1}}}", fromCount, toCount);
                    }
                }
            }
        });

        /**
         * @static
         * @abstract
         * @public
         * @class RegexQuery.Separators
         */
        Bridge.define("Separators", {
            $scope: RegexQuery,
            $module: "RegexQuery",
            statics: {
                fields: {
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.Separators
                     * @constant
                     * @default "."
                     * @type string
                     */
                    Dot: null,
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.Separators
                     * @constant
                     * @default "/"
                     * @type string
                     */
                    ForwardSlash: null,
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.Separators
                     * @constant
                     * @default "-"
                     * @type string
                     */
                    Minus: null
                },
                ctors: {
                    init: function () {
                        this.Dot = ".";
                        this.ForwardSlash = "/";
                        this.Minus = "-";
                    }
                },
                methods: {
                    /**
                     * @static
                     * @public
                     * @this RegexQuery.Separators
                     * @memberof RegexQuery.Separators
                     * @param   {Array.<RegexQuery.Separator>}    separators     
                     * @param   {boolean}                         regexEscape
                     * @return  {Array.<string>}
                     */
                    Resolve$1: function (separators, regexEscape) {
                        if (regexEscape === void 0) { regexEscape = true; }
                        var result = System.Array.init(separators.length, null, System.String);

                        for (var i = 0; i < separators.length; ++i) {
                            result[i] = RegexQuery.Separators.Resolve(separators[i], regexEscape);
                        }

                        return result;
                    },
                    /**
                     * @static
                     * @public
                     * @this RegexQuery.Separators
                     * @memberof RegexQuery.Separators
                     * @param   {RegexQuery.Separator}    separator      
                     * @param   {boolean}                 regexEscape
                     * @return  {string}
                     */
                    Resolve: function (separator, regexEscape) {
                        if (regexEscape === void 0) { regexEscape = true; }
                        switch (separator) {
                            case RegexQuery.Separator.Dot: 
                                return regexEscape ? RegexQuery.RegexTokens.Escape(RegexQuery.Separators.Dot) : RegexQuery.Separators.Dot;
                            case RegexQuery.Separator.ForwardSlash: 
                                return regexEscape ? RegexQuery.RegexTokens.Escape(RegexQuery.Separators.ForwardSlash) : RegexQuery.Separators.ForwardSlash;
                            case RegexQuery.Separator.Minus: 
                                return regexEscape ? RegexQuery.RegexTokens.Escape(RegexQuery.Separators.Minus) : RegexQuery.Separators.Minus;
                            default: 
                                return "";
                        }
                    }
                }
            }
        });

        /** @namespace RegexQuery.Enums */

        /**
         * @public
         * @class RegexQuery.Separator
         */
        Bridge.define("Separator", {
            $kind: "enum",
            $scope: RegexQuery,
            $module: "RegexQuery",
            statics: {
                fields: {
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.Separator
                     * @constant
                     * @default 0
                     * @type RegexQuery.Separator
                     */
                    Dot: 0,
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.Separator
                     * @constant
                     * @default 1
                     * @type RegexQuery.Separator
                     */
                    ForwardSlash: 1,
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.Separator
                     * @constant
                     * @default 2
                     * @type RegexQuery.Separator
                     */
                    Minus: 2,
                    /**
                     * @static
                     * @public
                     * @memberof RegexQuery.Separator
                     * @constant
                     * @default 3
                     * @type RegexQuery.Separator
                     */
                    All: 3
                }
            }
        });

        /** @namespace RegexQuery */

        /**
         * @class RegexQuery.RegexQuery.Example
         */
        Bridge.define("RegexQuery.Example", {
            $scope: RegexQuery,
            $module: "RegexQuery",
            methods: {
                /**
                 * @instance
                 * @private
                 * @this RegexQuery.RegexQuery.Example
                 * @memberof RegexQuery.RegexQuery.Example
                 * @return  {void}
                 */
                Main: function () {
                    var regexQuery = new RegexQuery.RegexQuery();

                    var regexQuery1 = regexQuery.RegexQuery$IRegexQueryPatterns$ADate().RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$BeginFollowedBy().RegexQuery$IRegexQueryTokens$ASpace().RegexQuery$IRegexQueryTokens$ANewLine().RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$EndGroup().RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ToString();

                    regexQuery.RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$Clear();

                    var dateSeparators = regexQuery.RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$Group((RegexQuery.RegexTokens.Escape("/") || "") + (RegexQuery.RegexTokens.Or || "") + (RegexQuery.RegexTokens.Escape(".") || "") + (RegexQuery.RegexTokens.Or || "") + (RegexQuery.RegexTokens.Escape("-") || "")).RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ToString();
                    regexQuery.RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$Clear();

                    var regexQuery2 = regexQuery.RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$CharsBetween("0", "3").RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ButOnlyNoneOrOne().RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$CharsBetween("0", "9").RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$Content(dateSeparators).RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$CharsBetween("0", "3").RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ButOnlyNoneOrOne().RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$CharsBetween("0", "9").RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$Content(dateSeparators).RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$CharsBetween("1", "9").RegexQuery$IRegexQueryTokens$ADigit().RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ButOnly(3).RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$NotFollowedBy(RegexQuery.RegexTokens.WhiteSpace).RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ToString();
                }
            }
        });

        /** @namespace RegexQuery.Interfaces */

        /**
         * @abstract
         * @public
         * @class RegexQuery.IRegexQueryPatterns
         */
        Bridge.define("IRegexQueryPatterns", {
            $kind: "interface",
            $scope: RegexQuery,
            $module: "RegexQuery"
        });

        /**
         * @abstract
         * @public
         * @class RegexQuery.IRegexQueryTokens
         */
        Bridge.define("IRegexQueryTokens", {
            $kind: "interface",
            $scope: RegexQuery,
            $module: "RegexQuery"
        });

        /**
         * @abstract
         * @public
         * @class RegexQuery.RegexQuery.Interfaces.IRegexQueryActions
         */
        Bridge.define("RegexQuery.Interfaces.IRegexQueryActions", {
            $kind: "interface",
            $scope: RegexQuery,
            $module: "RegexQuery"
        });

        /**
         * @abstract
         * @public
         * @class RegexQuery.IRegexQuery
         * @implements  RegexQuery.RegexQuery.Interfaces.IRegexQueryActions
         * @implements  RegexQuery.IRegexQueryTokens
         * @implements  RegexQuery.IRegexQueryPatterns
         */
        Bridge.define("IRegexQuery", {
            inherits: [RegexQuery.RegexQuery.Interfaces.IRegexQueryActions,RegexQuery.IRegexQueryTokens,RegexQuery.IRegexQueryPatterns],
            $kind: "interface",
            $scope: RegexQuery,
            $module: "RegexQuery"
        });

        /**
         * @public
         * @class RegexQuery.RegexQuery
         * @implements  RegexQuery.IRegexQuery
         */
        Bridge.define("RegexQuery", {
            inherits: [RegexQuery.IRegexQuery],
            $scope: RegexQuery,
            $module: "RegexQuery",
            fields: {
                /**
                 * @instance
                 * @private
                 * @memberof RegexQuery.RegexQuery
                 * @type boolean
                 */
                _openedGroup: false,
                /**
                 * @instance
                 * @public
                 * @memberof RegexQuery.RegexQuery
                 * @function Query
                 * @type string
                 */
                Query: null
            },
            alias: [
                "Query", "RegexQuery$IRegexQuery$Query",
                "toString", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ToString",
                "Clear", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$Clear",
                "BeginningOfString", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$BeginningOfString",
                "EndOfString", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$EndOfString",
                "Content", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$Content",
                "Group", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$Group",
                "BeginGroup", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$BeginGroup",
                "EndGroup", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$EndGroup",
                "AnyOf$1", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$AnyOf$1",
                "AnyOf", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$AnyOf",
                "NotAnyOf", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$NotAnyOf",
                "CharsBetween", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$CharsBetween",
                "ButOnly", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ButOnly",
                "ButOnlyOne", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ButOnlyOne",
                "ButOnlyNoneOrOne", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ButOnlyNoneOrOne",
                "ButOnlyNoneOrMore", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ButOnlyNoneOrMore",
                "ButOnlyOneOrMore", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ButOnlyOneOrMore",
                "ButOnlyBetween", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ButOnlyBetween",
                "ButOnlyMoreThan", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ButOnlyMoreThan",
                "Or", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$Or",
                "FollowedBy", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$FollowedBy",
                "NotFollowedBy", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$NotFollowedBy",
                "BeginFollowedBy", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$BeginFollowedBy",
                "EndFollowedBy", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$EndFollowedBy",
                "BeginNotFollowedBy", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$BeginNotFollowedBy",
                "EndNotFollowedBy", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$EndNotFollowedBy",
                "ADate", "RegexQuery$IRegexQueryPatterns$ADate",
                "ADate$1", "RegexQuery$IRegexQueryPatterns$ADate$1",
                "ADateSeparatedBy", "RegexQuery$IRegexQueryPatterns$ADateSeparatedBy",
                "ASpace", "RegexQuery$IRegexQueryTokens$ASpace",
                "ADigit", "RegexQuery$IRegexQueryTokens$ADigit",
                "AWord", "RegexQuery$IRegexQueryTokens$AWord",
                "NotAWord", "RegexQuery$IRegexQueryTokens$NotAWord",
                "ANewLine", "RegexQuery$IRegexQueryTokens$ANewLine",
                "AtStartOfString", "RegexQuery$IRegexQueryTokens$AtStartOfString",
                "AtEndOfString", "RegexQuery$IRegexQueryTokens$AtEndOfString",
                "ATab", "RegexQuery$IRegexQueryTokens$ATab",
                "ACarriageReturn", "RegexQuery$IRegexQueryTokens$ACarriageReturn",
                "AWhiteSpace", "RegexQuery$IRegexQueryTokens$AWhiteSpace",
                "NotAWhiteSpace", "RegexQuery$IRegexQueryTokens$NotAWhiteSpace",
                "AnyCharExceptNewLine", "RegexQuery$IRegexQueryTokens$AnyCharExceptNewLine",
                "AWordBoundary", "RegexQuery$IRegexQueryTokens$AWordBoundary",
                "NotAWordBoundary", "RegexQuery$IRegexQueryTokens$NotAWordBoundary"
            ],
            ctors: {
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {void}
                 */
                ctor: function () {
                    this.$initialize();
                    this.Query = "";
                }
            },
            methods: {
                /**
                 * @instance
                 * @public
                 * @override
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {string}
                 */
                toString: function () {
                    return this.Query;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                Clear: function () {
                    this.Query = "";
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                BeginningOfString: function () {
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.StartOfString || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                EndOfString: function () {
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.EndOfString || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @param   {string}                    content
                 * @return  {RegexQuery.IRegexQuery}
                 */
                Content: function (content) {
                    this.Query = (this.Query || "") + (content || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @param   {string}                    content
                 * @return  {RegexQuery.IRegexQuery}
                 */
                Group: function (content) {
                    this.BeginGroup();
                    this.Query = (this.Query || "") + (Bridge.toString(content) || "");
                    this.EndGroup();
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                BeginGroup: function () {
                    this.Query = (this.Query || "") + "(";
                    this._openedGroup = true;
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                EndGroup: function () {
                    this.Query = (this.Query || "") + ")";
                    this._openedGroup = false;
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @param   {Array.<string>}            characters
                 * @return  {RegexQuery.IRegexQuery}
                 */
                AnyOf$1: function (characters) {
                     let joinedCharacters = '';

                    for (let i = 0; i < characters.length; ++i)
                    {
                        joinedCharacters += characters[i];
                    }

                    return this.AnyOf(joinedCharacters);
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @param   {string}                    characters
                 * @return  {RegexQuery.IRegexQuery}
                 */
                AnyOf: function (characters) {
                    this.Query = (this.Query || "") + (System.String.format("[{0}]", [characters]) || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @param   {Array.<string>}            characters
                 * @return  {RegexQuery.IRegexQuery}
                 */
                NotAnyOf: function (characters) {
                    this.Query = (this.Query || "") + (System.String.format.apply(System.String, ["[^{0}]"].concat(characters)) || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @param   {string}                    fromChar    
                 * @param   {string}                    toChar
                 * @return  {RegexQuery.IRegexQuery}
                 */
                CharsBetween: function (fromChar, toChar) {
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.CharsBetween(fromChar, toChar) || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @param   {number}                    quantity
                 * @return  {RegexQuery.IRegexQuery}
                 */
                ButOnly: function (quantity) {
                    this.Query = (this.Query || "") + (System.String.format("{{{0}}}", [quantity]) || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                ButOnlyOne: function () {
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.QuantityOfPreceding(1) || "");
                    ;
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                ButOnlyNoneOrOne: function () {
                    this.Query = (this.Query || "") + "?";
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                ButOnlyNoneOrMore: function () {
                    this.Query = (this.Query || "") + "*";
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                ButOnlyOneOrMore: function () {
                    this.Query = (this.Query || "") + "+";
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @param   {number}                    fromCount    
                 * @param   {number}                    toCount
                 * @return  {RegexQuery.IRegexQuery}
                 */
                ButOnlyBetween: function (fromCount, toCount) {
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.QuantityOfPrecedingBetween$1(fromCount, toCount) || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @param   {number}                    quantity
                 * @return  {RegexQuery.IRegexQuery}
                 */
                ButOnlyMoreThan: function (quantity) {
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.QuantityOfPrecedingBetween(Bridge.toString(quantity), "") || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                Or: function () {
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.Or || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @param   {string}                    content
                 * @return  {RegexQuery.IRegexQuery}
                 */
                FollowedBy: function (content) {
                    this.BeginGroup();
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.FollowedBy || "") + (content || "");
                    this.EndGroup();
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @param   {string}                    content
                 * @return  {RegexQuery.IRegexQuery}
                 */
                NotFollowedBy: function (content) {
                    this.BeginGroup();
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.NotFollowedBy || "") + (content || "");
                    this.EndGroup();
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                BeginFollowedBy: function () {
                    this.BeginGroup();
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.FollowedBy || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                EndFollowedBy: function () {
                    this.EndGroup();
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                BeginNotFollowedBy: function () {
                    this.BeginGroup();
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.NotFollowedBy || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                EndNotFollowedBy: function () {
                    this.EndGroup();
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                ADate: function () {
                    return this.ADateSeparatedBy();
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @param   {RegexQuery.Separator}      separator
                 * @return  {RegexQuery.IRegexQuery}
                 */
                ADate$1: function (separator) {
                    if (separator === void 0) { separator = 3; }
                    if (separator === RegexQuery.Separator.All) {
                        return this.ADateSeparatedBy();
                    } else {
                        return this.ADateSeparatedBy(System.Array.init([separator], RegexQuery.Separator));
                    }
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @param   {Array.<RegexQuery.Separator>}    separator
                 * @return  {RegexQuery.IRegexQuery}
                 */
                ADateSeparatedBy: function (separator) {
                    if (separator === void 0) { separator = null; }
                    separator = separator == null ? System.Array.init([RegexQuery.Separator.ForwardSlash, RegexQuery.Separator.Dot, RegexQuery.Separator.Minus], RegexQuery.Separator) : separator;

                    var separators = RegexQuery.Separators.Resolve$1(separator).join(RegexQuery.RegexTokens.Or);

                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.CharsBetween("0", "3") || "") + String.fromCharCode(63) + (RegexQuery.RegexTokens.CharsBetween("0", "9") || "") + "(" + (separators || "") + String.fromCharCode(41) + (RegexQuery.RegexTokens.CharsBetween("0", "3") || "") + String.fromCharCode(63) + (RegexQuery.RegexTokens.CharsBetween("0", "9") || "") + "(" + (separators || "") + String.fromCharCode(41) + (RegexQuery.RegexTokens.CharsBetween("1", "9") || "") + (RegexQuery.RegexTokens.Digit || "") + (RegexQuery.RegexTokens.QuantityOfPreceding(3) || "");

                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                ASpace: function () {
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.WhiteSpace || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                ADigit: function () {
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.Digit || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                AWord: function () {
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.Word || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                NotAWord: function () {
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.NotWord || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                ANewLine: function () {
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.NewLine || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                AtStartOfString: function () {
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.StartOfString || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                AtEndOfString: function () {
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.EndOfString || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                ATab: function () {
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.Tab || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                ACarriageReturn: function () {
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.CarriageReturn || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                AWhiteSpace: function () {
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.WhiteSpace || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                NotAWhiteSpace: function () {
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.NotWhiteSpace || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                AnyCharExceptNewLine: function () {
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.AnyCharExceptNewLine || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                AWordBoundary: function () {
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.WordBoundary || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @return  {RegexQuery.IRegexQuery}
                 */
                NotAWordBoundary: function () {
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.NotWordBoundary || "");
                    return this;
                }
            }
        });
        Bridge.init();
        return RegexQuery;
    }));

});
