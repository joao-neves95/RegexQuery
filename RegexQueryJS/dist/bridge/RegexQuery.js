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
            $metadata : function () { return {"att":1048961,"a":2,"s":true,"m":[{"a":4,"n":"CharsBetween","is":true,"t":8,"pi":[{"n":"fromChar","pt":System.Char,"ps":0},{"n":"toChar","pt":System.Char,"ps":1}],"sn":"CharsBetween","rt":System.String,"p":[System.Char,System.Char]},{"a":4,"n":"QuantityOfPreceding","is":true,"t":8,"pi":[{"n":"quantity","pt":System.UInt32,"ps":0}],"sn":"QuantityOfPreceding","rt":System.String,"p":[System.UInt32]},{"a":2,"n":"AnyCharExceptNewLine","is":true,"t":4,"rt":System.String,"sn":"AnyCharExceptNewLine"},{"a":2,"n":"CarriageReturn","is":true,"t":4,"rt":System.String,"sn":"CarriageReturn"},{"a":2,"n":"Digit","is":true,"t":4,"rt":System.String,"sn":"Digit"},{"a":2,"n":"EndOfString","is":true,"t":4,"rt":System.String,"sn":"EndOfString"},{"a":2,"n":"FollowedBy","is":true,"t":4,"rt":System.String,"sn":"FollowedBy"},{"a":2,"n":"NewLine","is":true,"t":4,"rt":System.String,"sn":"NewLine"},{"a":2,"n":"NotDigit","is":true,"t":4,"rt":System.String,"sn":"NotDigit"},{"a":2,"n":"NotFollowedBy","is":true,"t":4,"rt":System.String,"sn":"NotFollowedBy"},{"a":2,"n":"NotWhiteSpace","is":true,"t":4,"rt":System.String,"sn":"NotWhiteSpace"},{"a":2,"n":"NotWord","is":true,"t":4,"rt":System.String,"sn":"NotWord"},{"a":2,"n":"NotWordBoundary","is":true,"t":4,"rt":System.String,"sn":"NotWordBoundary"},{"a":2,"n":"Or","is":true,"t":4,"rt":System.String,"sn":"Or"},{"a":2,"n":"StartOfString","is":true,"t":4,"rt":System.String,"sn":"StartOfString"},{"a":2,"n":"Tab","is":true,"t":4,"rt":System.String,"sn":"Tab"},{"a":2,"n":"WhiteSpace","is":true,"t":4,"rt":System.String,"sn":"WhiteSpace"},{"a":2,"n":"Word","is":true,"t":4,"rt":System.String,"sn":"Word"},{"a":2,"n":"WordBoundary","is":true,"t":4,"rt":System.String,"sn":"WordBoundary"}]}; },
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
                     * @default "\\t"
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
                     * @default "!="
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
                        this.NewLine = "\\t";
                        this.CarriageReturn = "\\r";
                        this.WordBoundary = "\\b";
                        this.NotWordBoundary = "\\B";
                        this.FollowedBy = "!=";
                        this.NotFollowedBy = "?!";
                        this.Or = "|";
                    }
                },
                methods: {
                    /**
                     * @static
                     * @this RegexQuery.RegexTokens
                     * @memberof RegexQuery.RegexTokens
                     * @param   {number}    fromChar    
                     * @param   {number}    toChar
                     * @return  {string}
                     */
                    CharsBetween: function (fromChar, toChar) {
                        return System.String.format("[{0}{1}{2}]", Bridge.box(fromChar, System.Char, String.fromCharCode, System.Char.getHashCode), RegexQuery.Separators.ForwardSlash, Bridge.box(toChar, System.Char, String.fromCharCode, System.Char.getHashCode));
                    },
                    /**
                     * @static
                     * @this RegexQuery.RegexTokens
                     * @memberof RegexQuery.RegexTokens
                     * @param   {number}    quantity
                     * @return  {string}
                     */
                    QuantityOfPreceding: function (quantity) {
                        return System.String.format("{{{0}}}", [Bridge.box(quantity, System.UInt32)]);
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
            $metadata : function () { return {"att":1048961,"a":2,"s":true,"m":[{"a":2,"n":"Resolve","is":true,"t":8,"pi":[{"n":"separator","pt":RegexQuery.Separator,"ps":0},{"n":"regexEscape","dv":true,"o":true,"pt":System.Boolean,"ps":1}],"sn":"Resolve","rt":System.String,"p":[RegexQuery.Separator,System.Boolean]},{"a":2,"n":"Resolve","is":true,"t":8,"pi":[{"n":"separators","pt":System.Array.type(RegexQuery.Separator),"ps":0},{"n":"regexEscape","dv":true,"o":true,"pt":System.Boolean,"ps":1}],"sn":"Resolve$1","rt":System.String,"p":[System.Array.type(RegexQuery.Separator),System.Boolean]},{"a":2,"n":"Dot","is":true,"t":4,"rt":System.String,"sn":"Dot"},{"a":2,"n":"ForwardSlash","is":true,"t":4,"rt":System.String,"sn":"ForwardSlash"},{"a":2,"n":"Minus","is":true,"t":4,"rt":System.String,"sn":"Minus"}]}; },
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
                     * @return  {string}
                     */
                    Resolve$1: function (separators, regexEscape) {
                        if (regexEscape === void 0) { regexEscape = true; }
                        var result = new System.Text.StringBuilder();

                        for (var i = 0; i < separators.length; i = (i + 1) | 0) {
                            result.append(RegexQuery.Separators.Resolve(separators[System.Array.index(i, separators)], regexEscape));
                        }

                        return result.toString();
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
                        var result = "";

                        if (separator === RegexQuery.Separator.Dot || separator === RegexQuery.Separator.All) {
                            result = (result || "") + ((regexEscape ? System.Text.RegularExpressions.Regex.escape(RegexQuery.Separators.Dot) : RegexQuery.Separators.Dot) || "");
                        } else if (separator === RegexQuery.Separator.ForwardSlash || separator === RegexQuery.Separator.All) {
                            result = (result || "") + ((regexEscape ? System.Text.RegularExpressions.Regex.escape(RegexQuery.Separators.ForwardSlash) : RegexQuery.Separators.ForwardSlash) || "");
                        } else if (separator === RegexQuery.Separator.Minus || separator === RegexQuery.Separator.All) {
                            result = (result || "") + ((regexEscape ? System.Text.RegularExpressions.Regex.escape(RegexQuery.Separators.Minus) : RegexQuery.Separators.Minus) || "");
                        }

                        return result;
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
            $metadata : function () { return {"att":257,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"All","is":true,"t":4,"rt":RegexQuery.Separator,"sn":"All","box":function ($v) { return Bridge.box($v, RegexQuery.Separator, System.Enum.toStringFn(RegexQuery.Separator));}},{"a":2,"n":"Dot","is":true,"t":4,"rt":RegexQuery.Separator,"sn":"Dot","box":function ($v) { return Bridge.box($v, RegexQuery.Separator, System.Enum.toStringFn(RegexQuery.Separator));}},{"a":2,"n":"ForwardSlash","is":true,"t":4,"rt":RegexQuery.Separator,"sn":"ForwardSlash","box":function ($v) { return Bridge.box($v, RegexQuery.Separator, System.Enum.toStringFn(RegexQuery.Separator));}},{"a":2,"n":"Minus","is":true,"t":4,"rt":RegexQuery.Separator,"sn":"Minus","box":function ($v) { return Bridge.box($v, RegexQuery.Separator, System.Enum.toStringFn(RegexQuery.Separator));}}]}; },
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
            $metadata : function () { return {"att":1048576,"a":4,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"Main","t":8,"sn":"Main","rt":System.Void}]}; },
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
                    var regexQuery1 = new RegexQuery.RegexQuery().ADate().RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$BeginFollowedBy().RegexQuery$IRegexQueryTokens$ASpace().RegexQuery$IRegexQueryTokens$ANewLine().RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$EndGroup().RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ToString();
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
            $metadata : function () { return {"att":161,"a":2,"m":[{"ab":true,"a":2,"n":"ADate","t":8,"sn":"RegexQuery$IRegexQueryPatterns$ADate","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"ADate","t":8,"pi":[{"n":"separator","dv":3,"o":true,"pt":RegexQuery.Separator,"ps":0}],"sn":"RegexQuery$IRegexQueryPatterns$ADate$1","rt":RegexQuery.IRegexQuery,"p":[RegexQuery.Separator]}]}; },
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
            $metadata : function () { return {"att":161,"a":2,"m":[{"ab":true,"a":2,"n":"ACarriageReturn","t":8,"sn":"RegexQuery$IRegexQueryTokens$ACarriageReturn","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"ADigit","t":8,"sn":"RegexQuery$IRegexQueryTokens$ADigit","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"ANewLine","t":8,"sn":"RegexQuery$IRegexQueryTokens$ANewLine","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"ASpace","t":8,"sn":"RegexQuery$IRegexQueryTokens$ASpace","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"ATab","t":8,"sn":"RegexQuery$IRegexQueryTokens$ATab","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"AWhiteSpace","t":8,"sn":"RegexQuery$IRegexQueryTokens$AWhiteSpace","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"AWord","t":8,"sn":"RegexQuery$IRegexQueryTokens$AWord","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"AWordBoundary","t":8,"sn":"RegexQuery$IRegexQueryTokens$AWordBoundary","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"AnyCharExceptNewLine","t":8,"sn":"RegexQuery$IRegexQueryTokens$AnyCharExceptNewLine","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"AtEndOfString","t":8,"sn":"RegexQuery$IRegexQueryTokens$AtEndOfString","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"AtStartOfString","t":8,"sn":"RegexQuery$IRegexQueryTokens$AtStartOfString","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"NotAWhiteSpace","t":8,"sn":"RegexQuery$IRegexQueryTokens$NotAWhiteSpace","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"NotAWord","t":8,"sn":"RegexQuery$IRegexQueryTokens$NotAWord","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"NotAWordBoundary","t":8,"sn":"RegexQuery$IRegexQueryTokens$NotAWordBoundary","rt":RegexQuery.IRegexQuery}]}; },
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
            $metadata : function () { return {"att":161,"a":2,"m":[{"ab":true,"a":2,"n":"AnyOf","t":8,"pi":[{"n":"characters","pt":System.Array.type(System.Char),"ps":0}],"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$AnyOf","rt":RegexQuery.IRegexQuery,"p":[System.Array.type(System.Char)]},{"ab":true,"a":2,"n":"AnyOf","t":8,"pi":[{"n":"characters","pt":System.String,"ps":0}],"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$AnyOf$1","rt":RegexQuery.IRegexQuery,"p":[System.String]},{"ab":true,"a":2,"n":"BeginFollowedBy","t":8,"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$BeginFollowedBy","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"BeginGroup","t":8,"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$BeginGroup","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"BeginNotFollowedBy","t":8,"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$BeginNotFollowedBy","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"BeginningOfString","t":8,"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$BeginningOfString","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"ButOnly","t":8,"pi":[{"n":"quantity","pt":System.UInt32,"ps":0}],"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ButOnly","rt":RegexQuery.IRegexQuery,"p":[System.UInt32]},{"ab":true,"a":2,"n":"ButOnlyBetween","t":8,"pi":[{"n":"fromCount","pt":System.UInt32,"ps":0},{"n":"toCount","pt":System.UInt32,"ps":1}],"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ButOnlyBetween","rt":RegexQuery.IRegexQuery,"p":[System.UInt32,System.UInt32]},{"ab":true,"a":2,"n":"ButOnlyMoreThan","t":8,"pi":[{"n":"quantity","pt":System.UInt32,"ps":0}],"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ButOnlyMoreThan","rt":RegexQuery.IRegexQuery,"p":[System.UInt32]},{"ab":true,"a":2,"n":"ButOnlyNoneOrMore","t":8,"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ButOnlyNoneOrMore","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"ButOnlyNoneOrOne","t":8,"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ButOnlyNoneOrOne","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"ButOnlyOne","t":8,"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ButOnlyOne","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"ButOnlyOneOrMore","t":8,"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ButOnlyOneOrMore","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"CharsBetween","t":8,"pi":[{"n":"fromChar","pt":System.Char,"ps":0},{"n":"toChar","pt":System.Char,"ps":1}],"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$CharsBetween","rt":RegexQuery.IRegexQuery,"p":[System.Char,System.Char]},{"ab":true,"a":2,"n":"EndFollowedBy","t":8,"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$EndFollowedBy","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"EndGroup","t":8,"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$EndGroup","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"EndNotFollowedBy","t":8,"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$EndNotFollowedBy","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"EndOfString","t":8,"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$EndOfString","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"FollowedBy","t":8,"pi":[{"n":"content","pt":System.String,"ps":0}],"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$FollowedBy","rt":RegexQuery.IRegexQuery,"p":[System.String]},{"ab":true,"a":2,"n":"Group","t":8,"pi":[{"n":"content","pt":System.String,"ps":0}],"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$Group","rt":RegexQuery.IRegexQuery,"p":[System.String]},{"ab":true,"a":2,"n":"NotAnyOf","t":8,"pi":[{"n":"characters","pt":System.Array.type(System.Char),"ps":0}],"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$NotAnyOf","rt":RegexQuery.IRegexQuery,"p":[System.Array.type(System.Char)]},{"ab":true,"a":2,"n":"NotFollowedBy","t":8,"pi":[{"n":"content","pt":System.String,"ps":0}],"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$NotFollowedBy","rt":RegexQuery.IRegexQuery,"p":[System.String]},{"ab":true,"a":2,"n":"Or","t":8,"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$Or","rt":RegexQuery.IRegexQuery},{"ab":true,"a":2,"n":"ToString","t":8,"sn":"RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$ToString","rt":System.String}]}; },
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
            $metadata : function () { return {"att":161,"a":2,"m":[{"ab":true,"a":2,"n":"Query","t":16,"rt":System.String,"g":{"ab":true,"a":2,"n":"get_Query","t":8,"rt":System.String,"fg":"RegexQuery$IRegexQuery$Query"},"fn":"RegexQuery$IRegexQuery$Query"},{"a":1,"backing":true,"n":"<Query>k__BackingField","t":4,"rt":System.String,"sn":"RegexQuery$IRegexQuery$Query"}]}; },
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
            $metadata : function () { return {"att":1048577,"a":2,"m":[{"a":2,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"ACarriageReturn","t":8,"sn":"ACarriageReturn","rt":RegexQuery.IRegexQuery},{"a":2,"n":"ADate","t":8,"sn":"ADate","rt":RegexQuery.IRegexQuery},{"a":2,"n":"ADate","t":8,"pi":[{"n":"separator","dv":3,"o":true,"pt":RegexQuery.Separator,"ps":0}],"sn":"ADate$1","rt":RegexQuery.IRegexQuery,"p":[RegexQuery.Separator]},{"a":2,"n":"ADigit","t":8,"sn":"ADigit","rt":RegexQuery.IRegexQuery},{"a":2,"n":"ANewLine","t":8,"sn":"ANewLine","rt":RegexQuery.IRegexQuery},{"a":2,"n":"ASpace","t":8,"sn":"ASpace","rt":RegexQuery.IRegexQuery},{"a":2,"n":"ATab","t":8,"sn":"ATab","rt":RegexQuery.IRegexQuery},{"a":2,"n":"AWhiteSpace","t":8,"sn":"AWhiteSpace","rt":RegexQuery.IRegexQuery},{"a":2,"n":"AWord","t":8,"sn":"AWord","rt":RegexQuery.IRegexQuery},{"a":2,"n":"AWordBoundary","t":8,"sn":"AWordBoundary","rt":RegexQuery.IRegexQuery},{"a":2,"n":"AnyCharExceptNewLine","t":8,"sn":"AnyCharExceptNewLine","rt":RegexQuery.IRegexQuery},{"a":2,"n":"AnyOf","t":8,"pi":[{"n":"characters","pt":System.Array.type(System.Char),"ps":0}],"sn":"AnyOf","rt":RegexQuery.IRegexQuery,"p":[System.Array.type(System.Char)]},{"a":2,"n":"AnyOf","t":8,"pi":[{"n":"characters","pt":System.String,"ps":0}],"sn":"AnyOf$1","rt":RegexQuery.IRegexQuery,"p":[System.String]},{"a":2,"n":"AtEndOfString","t":8,"sn":"AtEndOfString","rt":RegexQuery.IRegexQuery},{"a":2,"n":"AtStartOfString","t":8,"sn":"AtStartOfString","rt":RegexQuery.IRegexQuery},{"a":2,"n":"BeginFollowedBy","t":8,"sn":"BeginFollowedBy","rt":RegexQuery.IRegexQuery},{"a":2,"n":"BeginGroup","t":8,"sn":"BeginGroup","rt":RegexQuery.IRegexQuery},{"a":2,"n":"BeginNotFollowedBy","t":8,"sn":"BeginNotFollowedBy","rt":RegexQuery.IRegexQuery},{"a":2,"n":"BeginningOfString","t":8,"sn":"BeginningOfString","rt":RegexQuery.IRegexQuery},{"a":2,"n":"ButOnly","t":8,"pi":[{"n":"quantity","pt":System.UInt32,"ps":0}],"sn":"ButOnly","rt":RegexQuery.IRegexQuery,"p":[System.UInt32]},{"a":2,"n":"ButOnlyBetween","t":8,"pi":[{"n":"fromCount","pt":System.UInt32,"ps":0},{"n":"toCount","pt":System.UInt32,"ps":1}],"sn":"ButOnlyBetween","rt":RegexQuery.IRegexQuery,"p":[System.UInt32,System.UInt32]},{"a":2,"n":"ButOnlyMoreThan","t":8,"pi":[{"n":"quantity","pt":System.UInt32,"ps":0}],"sn":"ButOnlyMoreThan","rt":RegexQuery.IRegexQuery,"p":[System.UInt32]},{"a":2,"n":"ButOnlyNoneOrMore","t":8,"sn":"ButOnlyNoneOrMore","rt":RegexQuery.IRegexQuery},{"a":2,"n":"ButOnlyNoneOrOne","t":8,"sn":"ButOnlyNoneOrOne","rt":RegexQuery.IRegexQuery},{"a":2,"n":"ButOnlyOne","t":8,"sn":"ButOnlyOne","rt":RegexQuery.IRegexQuery},{"a":2,"n":"ButOnlyOneOrMore","t":8,"sn":"ButOnlyOneOrMore","rt":RegexQuery.IRegexQuery},{"a":2,"n":"CharsBetween","t":8,"pi":[{"n":"fromChar","pt":System.Char,"ps":0},{"n":"toChar","pt":System.Char,"ps":1}],"sn":"CharsBetween","rt":RegexQuery.IRegexQuery,"p":[System.Char,System.Char]},{"a":2,"n":"EndFollowedBy","t":8,"sn":"EndFollowedBy","rt":RegexQuery.IRegexQuery},{"a":2,"n":"EndGroup","t":8,"sn":"EndGroup","rt":RegexQuery.IRegexQuery},{"a":2,"n":"EndNotFollowedBy","t":8,"sn":"EndNotFollowedBy","rt":RegexQuery.IRegexQuery},{"a":2,"n":"EndOfString","t":8,"sn":"EndOfString","rt":RegexQuery.IRegexQuery},{"a":2,"n":"FollowedBy","t":8,"pi":[{"n":"content","pt":System.String,"ps":0}],"sn":"FollowedBy","rt":RegexQuery.IRegexQuery,"p":[System.String]},{"a":2,"n":"Group","t":8,"pi":[{"n":"content","pt":System.String,"ps":0}],"sn":"Group","rt":RegexQuery.IRegexQuery,"p":[System.String]},{"a":2,"n":"NotAWhiteSpace","t":8,"sn":"NotAWhiteSpace","rt":RegexQuery.IRegexQuery},{"a":2,"n":"NotAWord","t":8,"sn":"NotAWord","rt":RegexQuery.IRegexQuery},{"a":2,"n":"NotAWordBoundary","t":8,"sn":"NotAWordBoundary","rt":RegexQuery.IRegexQuery},{"a":2,"n":"NotAnyOf","t":8,"pi":[{"n":"characters","pt":System.Array.type(System.Char),"ps":0}],"sn":"NotAnyOf","rt":RegexQuery.IRegexQuery,"p":[System.Array.type(System.Char)]},{"a":2,"n":"NotFollowedBy","t":8,"pi":[{"n":"content","pt":System.String,"ps":0}],"sn":"NotFollowedBy","rt":RegexQuery.IRegexQuery,"p":[System.String]},{"a":2,"n":"Or","t":8,"sn":"Or","rt":RegexQuery.IRegexQuery},{"ov":true,"a":2,"n":"ToString","t":8,"sn":"toString","rt":System.String},{"a":2,"n":"Query","t":16,"rt":System.String,"g":{"a":2,"n":"get_Query","t":8,"rt":System.String,"fg":"Query"},"s":{"a":1,"n":"set_Query","t":8,"p":[System.String],"rt":System.Void,"fs":"Query"},"fn":"Query"},{"a":1,"n":"_openedGroup","t":4,"rt":System.Boolean,"sn":"_openedGroup","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"backing":true,"n":"<Query>k__BackingField","t":4,"rt":System.String,"sn":"Query"}]}; },
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
                "BeginningOfString", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$BeginningOfString",
                "EndOfString", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$EndOfString",
                "Group", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$Group",
                "BeginGroup", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$BeginGroup",
                "EndGroup", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$EndGroup",
                "AnyOf", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$AnyOf",
                "AnyOf$1", "RegexQuery$RegexQuery$Interfaces$IRegexQueryActions$AnyOf$1",
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
                Group: function (content) {
                    this.BeginGroup();
                    this.Query = (this.Query || "") + (content || "");
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
                 * @param   {Array.<number>}            characters
                 * @return  {RegexQuery.IRegexQuery}
                 */
                AnyOf: function (characters) {
                    return this.AnyOf$1(System.String.fromCharArray(characters));
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @param   {string}                    characters
                 * @return  {RegexQuery.IRegexQuery}
                 */
                AnyOf$1: function (characters) {
                    this.Query = (this.Query || "") + (System.String.format("[{0}]", [characters]) || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @param   {Array.<number>}            characters
                 * @return  {RegexQuery.IRegexQuery}
                 */
                NotAnyOf: function (characters) {
                    this.Query = (this.Query || "") + (System.String.format("[^{0}]", [characters]) || "");
                    return this;
                },
                /**
                 * @instance
                 * @public
                 * @this RegexQuery.RegexQuery
                 * @memberof RegexQuery.RegexQuery
                 * @param   {number}                    fromChar    
                 * @param   {number}                    toChar
                 * @return  {RegexQuery.IRegexQuery}
                 */
                CharsBetween: function (fromChar, toChar) {
                    this.Query = (this.Query || "") + (System.String.format("[{0}-{1}]", Bridge.box(fromChar, System.Char, String.fromCharCode, System.Char.getHashCode), Bridge.box(toChar, System.Char, String.fromCharCode, System.Char.getHashCode)) || "");
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
                    this.Query = (this.Query || "") + (System.String.format("{{{0}}}", [Bridge.box(quantity, System.UInt32)]) || "");
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
                    this.Query = (this.Query || "") + "{1}";
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
                    this.Query = (this.Query || "") + (System.String.format("{{{0},{1}}}", Bridge.box(fromCount, System.UInt32), Bridge.box(toCount, System.UInt32)) || "");
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
                    this.Query = (this.Query || "") + (System.String.format("{{{0},}}", [Bridge.box(quantity, System.UInt32)]) || "");
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
                    return this.ADate$1(RegexQuery.Separator.All);
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
                    this.Query = (this.Query || "") + (RegexQuery.RegexTokens.CharsBetween(48, 51) || "") + String.fromCharCode(63) + (RegexQuery.RegexTokens.CharsBetween(48, 57) || "") + "(" + (RegexQuery.Separators.Resolve(separator) || "") + ")" + (RegexQuery.RegexTokens.CharsBetween(48, 51) || "") + String.fromCharCode(63) + (RegexQuery.RegexTokens.CharsBetween(48, 57) || "") + "(" + (RegexQuery.Separators.Resolve(separator) || "") + ")" + (RegexQuery.RegexTokens.CharsBetween(49, 57) || "") + (RegexQuery.RegexTokens.Digit || "") + (RegexQuery.RegexTokens.QuantityOfPreceding(3) || "");

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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJSZWdleFF1ZXJ5LmpzIiwKICAic291cmNlUm9vdCI6ICIiLAogICJzb3VyY2VzIjogWyJDb25zdGFudHMvUmVnZXhUb2tlbnMuY3MiLCJDb25zdGFudHMvU2VwYXJhdG9ycy5jcyIsIkV4YW1wbGUuY3MiLCJSZWdleFF1ZXJ5LmNzIiwiUmVnZXhRdWVyeVBhdHRlcm5zLmNzIiwiUmVnZXhRdWVyeVRva2Vucy5jcyJdLAogICJuYW1lcyI6IFsiIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0Q0F3RDRDQSxVQUFlQTt3QkFFL0NBLE9BQU9BLG9DQUE0QkEsaUZBQVNBLG9DQUF3QkE7Ozs7Ozs7OzttREFHN0JBO3dCQUV2Q0EsT0FBT0EsaUNBQXdCQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3lDQy9CTkEsWUFBd0JBOzt3QkFFakRBLGFBQXVCQSxJQUFJQTs7d0JBRTNCQSxLQUFLQSxXQUFXQSxJQUFJQSxtQkFBcUJBOzRCQUVyQ0EsY0FBZUEsOEJBQW9CQSw4QkFBV0EsR0FBWEEsY0FBZUE7Ozt3QkFHdERBLE9BQU9BOzs7Ozs7Ozs7Ozt1Q0FHa0JBLFdBQXFCQTs7d0JBRTlDQSxhQUFnQkE7O3dCQUVoQkEsSUFBSUEsY0FBYUEsNEJBQWlCQSxjQUFhQTs0QkFFM0NBLDJCQUFVQSxlQUFjQSw0Q0FBY0EsNkJBQW1CQTsrQkFFeERBLElBQUlBLGNBQWFBLHFDQUEwQkEsY0FBYUE7NEJBRXpEQSwyQkFBVUEsZUFBY0EsNENBQWNBLHNDQUE0QkE7K0JBRWpFQSxJQUFJQSxjQUFhQSw4QkFBbUJBLGNBQWFBOzRCQUVsREEsMkJBQVVBLGVBQWNBLDRDQUFjQSwrQkFBcUJBOzs7d0JBRy9EQSxPQUFPQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JDMUNQQSxrQkFBcUJBLElBQUlBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQ0V6QkEsYUFBYUE7Ozs7Ozs7Ozs7Ozs7b0JBU2JBLE9BQU9BOzs7Ozs7Ozs7O29CQUtQQSxtQ0FBY0E7b0JBQ2RBLE9BQU9BOzs7Ozs7Ozs7O29CQUtQQSxtQ0FBY0E7b0JBQ2RBLE9BQU9BOzs7Ozs7Ozs7O2lDQUdjQTtvQkFFckJBO29CQUNBQSxtQ0FBY0E7b0JBQ2RBO29CQUNBQSxPQUFPQTs7Ozs7Ozs7OztvQkFLUEE7b0JBQ0FBO29CQUNBQSxPQUFPQTs7Ozs7Ozs7OztvQkFLUEE7b0JBQ0FBO29CQUNBQSxPQUFPQTs7Ozs7Ozs7OztpQ0FHY0E7b0JBRXJCQSxPQUFPQSxhQUFZQSw0QkFBWUE7Ozs7Ozs7Ozs7bUNBR1ZBO29CQUVyQkEsbUNBQWNBLCtCQUFzQkE7b0JBQ3BDQSxPQUFPQTs7Ozs7Ozs7OztvQ0FHaUJBO29CQUV4QkEsbUNBQWNBLGdDQUF1QkE7b0JBQ3JDQSxPQUFPQTs7Ozs7Ozs7Ozs7d0NBR3FCQSxVQUFlQTtvQkFFM0NBLG1DQUFjQSxrQ0FBMEJBLGlGQUFTQTtvQkFDakRBLE9BQU9BOzs7Ozs7Ozs7O21DQUdnQkE7b0JBRXZCQSxtQ0FBY0EsaUNBQXdCQTtvQkFDdENBLE9BQU9BOzs7Ozs7Ozs7O29CQUtQQTtvQkFDQUEsT0FBT0E7Ozs7Ozs7Ozs7b0JBS1BBO29CQUNBQSxPQUFPQTs7Ozs7Ozs7OztvQkFLUEE7b0JBQ0FBLE9BQU9BOzs7Ozs7Ozs7O29CQUtQQTtvQkFDQUEsT0FBT0E7Ozs7Ozs7Ozs7OzBDQUd1QkEsV0FBZ0JBO29CQUU5Q0EsbUNBQWNBLG9DQUE0QkEsc0NBQVVBO29CQUNwREEsT0FBT0E7Ozs7Ozs7Ozs7MkNBR3dCQTtvQkFFL0JBLG1DQUFjQSxrQ0FBeUJBO29CQUN2Q0EsT0FBT0E7Ozs7Ozs7Ozs7b0JBS1BBLG1DQUFjQTtvQkFDZEEsT0FBT0E7Ozs7Ozs7Ozs7c0NBR21CQTtvQkFFMUJBO29CQUNBQSxrQ0FBY0EsNkNBQXlCQTtvQkFDdkNBO29CQUNBQSxPQUFPQTs7Ozs7Ozs7Ozt5Q0FHc0JBO29CQUU3QkE7b0JBQ0FBLGtDQUFjQSxnREFBNEJBO29CQUMxQ0E7b0JBQ0FBLE9BQU9BOzs7Ozs7Ozs7O29CQUtQQTtvQkFDQUEsbUNBQWNBO29CQUNkQSxPQUFPQTs7Ozs7Ozs7OztvQkFLUEE7b0JBQ0FBLE9BQU9BOzs7Ozs7Ozs7O29CQUtQQTtvQkFDQUEsbUNBQWNBO29CQUNkQSxPQUFPQTs7Ozs7Ozs7OztvQkFLUEE7b0JBQ0FBLE9BQU9BOzs7Ozs7Ozs7O29CQ3JKUEEsT0FBT0EsYUFBWUE7Ozs7Ozs7Ozs7bUNBR0VBOztvQkFHckJBLGtDQUFjQSxpRkFBNkNBLDREQUV2Q0EsOEJBQW9CQSwyQkFFMUJBLGdGQUE2Q0EsNERBRXZDQSw4QkFBb0JBLDJCQUUxQkEsc0RBQXVDQSx1Q0FBb0JBOztvQkFFekVBLE9BQU9BOzs7Ozs7Ozs7O29CQ3pCUEEsbUNBQWNBO29CQUNkQSxPQUFPQTs7Ozs7Ozs7OztvQkFLUEEsbUNBQWNBO29CQUNkQSxPQUFPQTs7Ozs7Ozs7OztvQkFLUEEsbUNBQWNBO29CQUNkQSxPQUFPQTs7Ozs7Ozs7OztvQkFLUEEsbUNBQWNBO29CQUNkQSxPQUFPQTs7Ozs7Ozs7OztvQkFLUEEsbUNBQWNBO29CQUNkQSxPQUFPQTs7Ozs7Ozs7OztvQkFLUEEsbUNBQWNBO29CQUNkQSxPQUFPQTs7Ozs7Ozs7OztvQkFLUEEsbUNBQWNBO29CQUNkQSxPQUFPQTs7Ozs7Ozs7OztvQkFLUEEsbUNBQWNBO29CQUNkQSxPQUFPQTs7Ozs7Ozs7OztvQkFLUEEsbUNBQWNBO29CQUNkQSxPQUFPQTs7Ozs7Ozs7OztvQkFLUEEsbUNBQWNBO29CQUNkQSxPQUFPQTs7Ozs7Ozs7OztvQkFLUEEsbUNBQWNBO29CQUNkQSxPQUFPQTs7Ozs7Ozs7OztvQkFJUEEsbUNBQWNBO29CQUNkQSxPQUFPQTs7Ozs7Ozs7OztvQkFLUEEsbUNBQWNBO29CQUNkQSxPQUFPQTs7Ozs7Ozs7OztvQkFLUEEsbUNBQWNBO29CQUNkQSxPQUFPQSIsCiAgInNvdXJjZXNDb250ZW50IjogWyIvKlxuICogQ29weXJpZ2h0IChjKSAyMDIwIEpvw6NvIFBlZHJvIE1hcnRpbnMgTmV2ZXMgKFNISVZBWUwpIC0gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBSZWdleFF1ZXJ5IGFuZCBhbGwgaXRzIGNvbnRlbnRzIGFyZSBsaWNlbnNlZCB1bmRlciB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdjMuMFxuICogKEdQTC0zLjApLCBsb2NhdGVkIGluIHRoZSByb290IGZvbGRlciwgdW5kZXIgdGhlIG5hbWUgXCJMSUNFTlNFLm1kXCIuXG4gKlxuICovXG5cbnVzaW5nIEJyaWRnZTtcblxubmFtZXNwYWNlIFJlZ2V4UXVlcnkuQ29uc3RhbnRzXG57XG4gICAgW05hbWVzcGFjZSggZmFsc2UgKV1cbiAgICBbTW9kdWxlKCBNb2R1bGVUeXBlLlVNRCwgTmFtZSA9IFwiUmVnZXhUb2tlbnNcIiApXVxuICAgIHB1YmxpYyBzdGF0aWMgY2xhc3MgUmVnZXhUb2tlbnNcbiAgICB7XG4gICAgICAgICNyZWdpb24gUFVCTElDIFBST1BFUlRJRVNcblxuICAgICAgICBwdWJsaWMgY29uc3Qgc3RyaW5nIFN0YXJ0T2ZTdHJpbmcgPSBcIl5cIjtcblxuICAgICAgICBwdWJsaWMgY29uc3Qgc3RyaW5nIEVuZE9mU3RyaW5nID0gXCIkXCI7XG5cbiAgICAgICAgcHVibGljIGNvbnN0IHN0cmluZyBBbnlDaGFyRXhjZXB0TmV3TGluZSA9IFwiLlwiO1xuXG4gICAgICAgIHB1YmxpYyBjb25zdCBzdHJpbmcgV29yZCA9IEBcIlxcd1wiO1xuXG4gICAgICAgIHB1YmxpYyBjb25zdCBzdHJpbmcgTm90V29yZCA9IEBcIlxcV1wiO1xuXG4gICAgICAgIHB1YmxpYyBjb25zdCBzdHJpbmcgRGlnaXQgPSBAXCJcXGRcIjtcblxuICAgICAgICBwdWJsaWMgY29uc3Qgc3RyaW5nIE5vdERpZ2l0ID0gQFwiXFxEXCI7XG5cbiAgICAgICAgcHVibGljIGNvbnN0IHN0cmluZyBXaGl0ZVNwYWNlID0gQFwiXFxzXCI7XG5cbiAgICAgICAgcHVibGljIGNvbnN0IHN0cmluZyBOb3RXaGl0ZVNwYWNlID0gQFwiXFxTXCI7XG5cbiAgICAgICAgcHVibGljIGNvbnN0IHN0cmluZyBUYWIgPSBAXCJcXHRcIjtcblxuICAgICAgICBwdWJsaWMgY29uc3Qgc3RyaW5nIE5ld0xpbmUgPSBAXCJcXHRcIjtcblxuICAgICAgICBwdWJsaWMgY29uc3Qgc3RyaW5nIENhcnJpYWdlUmV0dXJuID0gQFwiXFxyXCI7XG5cbiAgICAgICAgcHVibGljIGNvbnN0IHN0cmluZyBXb3JkQm91bmRhcnkgPSBAXCJcXGJcIjtcblxuICAgICAgICBwdWJsaWMgY29uc3Qgc3RyaW5nIE5vdFdvcmRCb3VuZGFyeSA9IEBcIlxcQlwiO1xuXG4gICAgICAgIHB1YmxpYyBjb25zdCBzdHJpbmcgRm9sbG93ZWRCeSA9IFwiIT1cIjtcblxuICAgICAgICBwdWJsaWMgY29uc3Qgc3RyaW5nIE5vdEZvbGxvd2VkQnkgPSBcIj8hXCI7XG5cbiAgICAgICAgcHVibGljIGNvbnN0IHN0cmluZyBPciA9IFwifFwiO1xuXG4gICAgICAgICNlbmRyZWdpb24gUFVCTElDIFBST1BFUlRJRVNcblxuICAgICAgICAjcmVnaW9uIFBSSVZBVEUgTUVUSE9EU1xuXG4gICAgICAgIGludGVybmFsIHN0YXRpYyBzdHJpbmcgQ2hhcnNCZXR3ZWVuKGNoYXIgZnJvbUNoYXIsIGNoYXIgdG9DaGFyKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gc3RyaW5nLkZvcm1hdChcIlt7MH17MX17Mn1dXCIsZnJvbUNoYXIsU2VwYXJhdG9ycy5Gb3J3YXJkU2xhc2gsdG9DaGFyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGludGVybmFsIHN0YXRpYyBzdHJpbmcgUXVhbnRpdHlPZlByZWNlZGluZyh1aW50IHF1YW50aXR5KVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gc3RyaW5nLkZvcm1hdChcInt7ezB9fX1cIixxdWFudGl0eSk7XG4gICAgICAgIH1cblxuICAgICAgICAjZW5kcmVnaW9uIFBSSVZBVEUgTUVUSE9EU1xuICAgIH1cbn1cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjAgSm/Do28gUGVkcm8gTWFydGlucyBOZXZlcyAoU0hJVkFZTCkgLSBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFJlZ2V4UXVlcnkgYW5kIGFsbCBpdHMgY29udGVudHMgYXJlIGxpY2Vuc2VkIHVuZGVyIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2My4wXG4gKiAoR1BMLTMuMCksIGxvY2F0ZWQgaW4gdGhlIHJvb3QgZm9sZGVyLCB1bmRlciB0aGUgbmFtZSBcIkxJQ0VOU0UubWRcIi5cbiAqXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLlRleHQ7XG51c2luZyBTeXN0ZW0uVGV4dC5SZWd1bGFyRXhwcmVzc2lvbnM7XG51c2luZyBCcmlkZ2U7XG51c2luZyBSZWdleFF1ZXJ5LkVudW1zO1xuXG5uYW1lc3BhY2UgUmVnZXhRdWVyeS5Db25zdGFudHNcbntcbiAgICBbTmFtZXNwYWNlKCBmYWxzZSApXVxuICAgIFtNb2R1bGUoIE1vZHVsZVR5cGUuVU1ELCBOYW1lID0gXCJTZXBhcmF0b3JzXCIgKV1cbiAgICBwdWJsaWMgc3RhdGljIGNsYXNzIFNlcGFyYXRvcnNcbiAgICB7XG4gICAgICAgIC8vICNyZWdpb25zIFNFUEFSQVRPUlNcblxuICAgICAgICBwdWJsaWMgY29uc3Qgc3RyaW5nIERvdCA9IFwiLlwiO1xuXG4gICAgICAgIHB1YmxpYyBjb25zdCBzdHJpbmcgRm9yd2FyZFNsYXNoID0gXCIvXCI7XG5cbiAgICAgICAgcHVibGljIGNvbnN0IHN0cmluZyBNaW51cyA9IFwiLVwiO1xuXG4gICAgICAgIC8vICNlbmRyZWdpb25zIFNFUEFSQVRPUlNcblxuICAgICAgICAvLyAjcmVnaW9ucyBVVElMSVRZIE1FVEhPRFNcblxuICAgICAgICBwdWJsaWMgc3RhdGljIHN0cmluZyBSZXNvbHZlKFNlcGFyYXRvcltdIHNlcGFyYXRvcnMsIGJvb2wgcmVnZXhFc2NhcGUgPSB0cnVlKVxuICAgICAgICB7XG4gICAgICAgICAgICBTdHJpbmdCdWlsZGVyIHJlc3VsdCA9IG5ldyBTdHJpbmdCdWlsZGVyKCk7XG5cbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgc2VwYXJhdG9ycy5MZW5ndGg7ICsraSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuQXBwZW5kKCBTZXBhcmF0b3JzLlJlc29sdmUoIHNlcGFyYXRvcnNbaV0sIHJlZ2V4RXNjYXBlICkgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5Ub1N0cmluZygpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBzdHJpbmcgUmVzb2x2ZShTZXBhcmF0b3Igc2VwYXJhdG9yLCBib29sIHJlZ2V4RXNjYXBlID0gdHJ1ZSlcbiAgICAgICAge1xuICAgICAgICAgICAgc3RyaW5nIHJlc3VsdCA9IFN0cmluZy5FbXB0eTtcblxuICAgICAgICAgICAgaWYgKHNlcGFyYXRvciA9PSBTZXBhcmF0b3IuRG90IHx8IHNlcGFyYXRvciA9PSBTZXBhcmF0b3IuQWxsKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJlc3VsdCArPSByZWdleEVzY2FwZSA/IFJlZ2V4LkVzY2FwZSggU2VwYXJhdG9ycy5Eb3QgKSA6IFNlcGFyYXRvcnMuRG90O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2VwYXJhdG9yID09IFNlcGFyYXRvci5Gb3J3YXJkU2xhc2ggfHwgc2VwYXJhdG9yID09IFNlcGFyYXRvci5BbGwpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHJlZ2V4RXNjYXBlID8gUmVnZXguRXNjYXBlKCBTZXBhcmF0b3JzLkZvcndhcmRTbGFzaCApIDogU2VwYXJhdG9ycy5Gb3J3YXJkU2xhc2g7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzZXBhcmF0b3IgPT0gU2VwYXJhdG9yLk1pbnVzIHx8IHNlcGFyYXRvciA9PSBTZXBhcmF0b3IuQWxsKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJlc3VsdCArPSByZWdleEVzY2FwZSA/IFJlZ2V4LkVzY2FwZSggU2VwYXJhdG9ycy5NaW51cyApIDogU2VwYXJhdG9ycy5NaW51cztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vICNlbmRyZWdpb25zIFVUSUxJVFkgTUVUSE9EU1xuICAgIH1cbn1cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjAgSm/Do28gUGVkcm8gTWFydGlucyBOZXZlcyAoU0hJVkFZTCkgLSBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFJlZ2V4UXVlcnkgYW5kIGFsbCBpdHMgY29udGVudHMgYXJlIGxpY2Vuc2VkIHVuZGVyIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2My4wXG4gKiAoR1BMLTMuMCksIGxvY2F0ZWQgaW4gdGhlIHJvb3QgZm9sZGVyLCB1bmRlciB0aGUgbmFtZSBcIkxJQ0VOU0UubWRcIi5cbiAqXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcbnVzaW5nIFJlZ2V4UXVlcnkuSW50ZXJmYWNlcztcblxubmFtZXNwYWNlIFJlZ2V4UXVlcnlcbntcbiAgICBpbnRlcm5hbCBjbGFzcyBFeGFtcGxlXG4gICAge1xuICAgICAgICBwcml2YXRlIHZvaWQgTWFpbigpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHN0cmluZyByZWdleFF1ZXJ5MSA9IG5ldyBSZWdleFF1ZXJ5KCkuQURhdGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5CZWdpbkZvbGxvd2VkQnkoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuQVNwYWNlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLkFOZXdMaW5lKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuRW5kR3JvdXAoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5Ub1N0cmluZygpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAyMCBKb8OjbyBQZWRybyBNYXJ0aW5zIE5ldmVzIChTSElWQVlMKSAtIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogUmVnZXhRdWVyeSBhbmQgYWxsIGl0cyBjb250ZW50cyBhcmUgbGljZW5zZWQgdW5kZXIgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHYzLjBcbiAqIChHUEwtMy4wKSwgbG9jYXRlZCBpbiB0aGUgcm9vdCBmb2xkZXIsIHVuZGVyIHRoZSBuYW1lIFwiTElDRU5TRS5tZFwiLlxuICpcbiAqL1xuXG51c2luZyBCcmlkZ2U7XG51c2luZyBSZWdleFF1ZXJ5LkNvbnN0YW50cztcbnVzaW5nIFJlZ2V4UXVlcnkuSW50ZXJmYWNlcztcblxuW2Fzc2VtYmx5OiBNb2R1bGUoTW9kdWxlVHlwZS5VTUQsIHRydWUsTmFtZSA9XCJSZWdleFF1ZXJ5XCIpXVxubmFtZXNwYWNlIFJlZ2V4UXVlcnlcbntcbiAgICBbTmFtZXNwYWNlKGZhbHNlKV1cbiAgICAvLyBJbXBsZW1lbnRzIElSZWdleFF1ZXJ5QWN0aW9uc1xuICAgIHB1YmxpYyBwYXJ0aWFsIGNsYXNzIFJlZ2V4UXVlcnkgOiBJUmVnZXhRdWVyeVxuICAgIHtcbiAgICAgICAgcHVibGljIFJlZ2V4UXVlcnkoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLlF1ZXJ5ID0gc3RyaW5nLkVtcHR5O1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBib29sIF9vcGVuZWRHcm91cDtcblxuICAgICAgICBwdWJsaWMgc3RyaW5nIFF1ZXJ5IHsgZ2V0OyBwcml2YXRlIHNldDsgfVxuXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gUXVlcnk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgSVJlZ2V4UXVlcnkgQmVnaW5uaW5nT2ZTdHJpbmcoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLlF1ZXJ5ICs9IFJlZ2V4VG9rZW5zLlN0YXJ0T2ZTdHJpbmc7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBJUmVnZXhRdWVyeSBFbmRPZlN0cmluZygpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuUXVlcnkgKz0gUmVnZXhUb2tlbnMuRW5kT2ZTdHJpbmc7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBJUmVnZXhRdWVyeSBHcm91cChzdHJpbmcgY29udGVudClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5CZWdpbkdyb3VwKCk7XG4gICAgICAgICAgICB0aGlzLlF1ZXJ5ICs9IGNvbnRlbnQ7XG4gICAgICAgICAgICB0aGlzLkVuZEdyb3VwKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBJUmVnZXhRdWVyeSBCZWdpbkdyb3VwKClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5RdWVyeSArPSBcIihcIjtcbiAgICAgICAgICAgIHRoaXMuX29wZW5lZEdyb3VwID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIElSZWdleFF1ZXJ5IEVuZEdyb3VwKClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5RdWVyeSArPSBcIilcIjtcbiAgICAgICAgICAgIHRoaXMuX29wZW5lZEdyb3VwID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBJUmVnZXhRdWVyeSBBbnlPZihjaGFyW10gY2hhcmFjdGVycylcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuQW55T2YoIG5ldyBzdHJpbmcoIGNoYXJhY3RlcnMgKSApO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIElSZWdleFF1ZXJ5IEFueU9mKHN0cmluZyBjaGFyYWN0ZXJzKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLlF1ZXJ5ICs9IHN0cmluZy5Gb3JtYXQoXCJbezB9XVwiLGNoYXJhY3RlcnMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgSVJlZ2V4UXVlcnkgTm90QW55T2YoY2hhcltdIGNoYXJhY3RlcnMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuUXVlcnkgKz0gc3RyaW5nLkZvcm1hdChcIlteezB9XVwiLGNoYXJhY3RlcnMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgSVJlZ2V4UXVlcnkgQ2hhcnNCZXR3ZWVuKGNoYXIgZnJvbUNoYXIsIGNoYXIgdG9DaGFyKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLlF1ZXJ5ICs9IHN0cmluZy5Gb3JtYXQoXCJbezB9LXsxfV1cIixmcm9tQ2hhcix0b0NoYXIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgSVJlZ2V4UXVlcnkgQnV0T25seSh1aW50IHF1YW50aXR5KVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLlF1ZXJ5ICs9IHN0cmluZy5Gb3JtYXQoXCJ7e3swfX19XCIscXVhbnRpdHkpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgSVJlZ2V4UXVlcnkgQnV0T25seU9uZSgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuUXVlcnkgKz0gXCJ7MX1cIjtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIElSZWdleFF1ZXJ5IEJ1dE9ubHlOb25lT3JPbmUoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLlF1ZXJ5ICs9IFwiP1wiO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgSVJlZ2V4UXVlcnkgQnV0T25seU5vbmVPck1vcmUoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLlF1ZXJ5ICs9IFwiKlwiO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgSVJlZ2V4UXVlcnkgQnV0T25seU9uZU9yTW9yZSgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuUXVlcnkgKz0gXCIrXCI7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBJUmVnZXhRdWVyeSBCdXRPbmx5QmV0d2Vlbih1aW50IGZyb21Db3VudCwgdWludCB0b0NvdW50KVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLlF1ZXJ5ICs9IHN0cmluZy5Gb3JtYXQoXCJ7e3swfSx7MX19fVwiLGZyb21Db3VudCx0b0NvdW50KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIElSZWdleFF1ZXJ5IEJ1dE9ubHlNb3JlVGhhbih1aW50IHF1YW50aXR5KVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLlF1ZXJ5ICs9IHN0cmluZy5Gb3JtYXQoXCJ7e3swfSx9fVwiLHF1YW50aXR5KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIElSZWdleFF1ZXJ5IE9yKClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5RdWVyeSArPSBSZWdleFRva2Vucy5PcjtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIElSZWdleFF1ZXJ5IEZvbGxvd2VkQnkoc3RyaW5nIGNvbnRlbnQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuQmVnaW5Hcm91cCgpO1xuICAgICAgICAgICAgdGhpcy5RdWVyeSArPSBSZWdleFRva2Vucy5Gb2xsb3dlZEJ5ICsgY29udGVudDtcbiAgICAgICAgICAgIHRoaXMuRW5kR3JvdXAoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIElSZWdleFF1ZXJ5IE5vdEZvbGxvd2VkQnkoc3RyaW5nIGNvbnRlbnQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuQmVnaW5Hcm91cCgpO1xuICAgICAgICAgICAgdGhpcy5RdWVyeSArPSBSZWdleFRva2Vucy5Ob3RGb2xsb3dlZEJ5ICsgY29udGVudDtcbiAgICAgICAgICAgIHRoaXMuRW5kR3JvdXAoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIElSZWdleFF1ZXJ5IEJlZ2luRm9sbG93ZWRCeSgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuQmVnaW5Hcm91cCgpO1xuICAgICAgICAgICAgdGhpcy5RdWVyeSArPSBSZWdleFRva2Vucy5Gb2xsb3dlZEJ5O1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgSVJlZ2V4UXVlcnkgRW5kRm9sbG93ZWRCeSgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuRW5kR3JvdXAoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIElSZWdleFF1ZXJ5IEJlZ2luTm90Rm9sbG93ZWRCeSgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuQmVnaW5Hcm91cCgpO1xuICAgICAgICAgICAgdGhpcy5RdWVyeSArPSBSZWdleFRva2Vucy5Ob3RGb2xsb3dlZEJ5O1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgSVJlZ2V4UXVlcnkgRW5kTm90Rm9sbG93ZWRCeSgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuRW5kR3JvdXAoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAyMCBKb8OjbyBQZWRybyBNYXJ0aW5zIE5ldmVzIChTSElWQVlMKSAtIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogUmVnZXhRdWVyeSBhbmQgYWxsIGl0cyBjb250ZW50cyBhcmUgbGljZW5zZWQgdW5kZXIgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHYzLjBcbiAqIChHUEwtMy4wKSwgbG9jYXRlZCBpbiB0aGUgcm9vdCBmb2xkZXIsIHVuZGVyIHRoZSBuYW1lIFwiTElDRU5TRS5tZFwiLlxuICpcbiAqL1xuXG51c2luZyBCcmlkZ2U7XG51c2luZyBSZWdleFF1ZXJ5LkludGVyZmFjZXM7XG51c2luZyBSZWdleFF1ZXJ5LkNvbnN0YW50cztcbnVzaW5nIFJlZ2V4UXVlcnkuRW51bXM7XG5cbi8qXG4gKiBSZXNvdXJjZXM6XG4gKlxuICogLSBodHRwczovL2RvY3MubWljcm9zb2Z0LmNvbS9lbi11cy9kb3RuZXQvYXBpL3N5c3RlbS50ZXh0LnJlZ3VsYXJleHByZXNzaW9ucy5yZWdleD92aWV3PW5ldHN0YW5kYXJkLTIuMVxuICogLSBodHRwczovL2dpdGh1Yi5jb20vamVmZnJleXNoZW4xOS9SZWdFeC1TbmlwcGV0c1xuICpcbiAqL1xuXG5uYW1lc3BhY2UgUmVnZXhRdWVyeVxue1xuICAgIC8vIEltcGxlbWVudHMgSVJlZ2V4UXVlcnlQYXR0ZXJuc1xuICAgIHB1YmxpYyBwYXJ0aWFsIGNsYXNzIFJlZ2V4UXVlcnlcbiAgICB7XG4gICAgICAgIHB1YmxpYyBJUmVnZXhRdWVyeSBBRGF0ZSgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkFEYXRlKCBTZXBhcmF0b3IuQWxsICk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgSVJlZ2V4UXVlcnkgQURhdGUoU2VwYXJhdG9yIHNlcGFyYXRvciA9IFNlcGFyYXRvci5BbGwpXG4gICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gWzAtM10/WzAtOV1cbiAgICAgICAgICAgIHRoaXMuUXVlcnkgKz0gUmVnZXhUb2tlbnMuQ2hhcnNCZXR3ZWVuKCAnMCcsICczJyApICsgJz8nICsgUmVnZXhUb2tlbnMuQ2hhcnNCZXR3ZWVuKCAnMCcsICc5JyApICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gKFxcL3xcXC58LSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCIoXCIgKyBTZXBhcmF0b3JzLlJlc29sdmUoIHNlcGFyYXRvciApICsgXCIpXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBbMC0zXT9bMC05XVxuICAgICAgICAgICAgICAgICAgICAgICAgICBSZWdleFRva2Vucy5DaGFyc0JldHdlZW4oICcwJywgJzMnICkgKyAnPycgKyBSZWdleFRva2Vucy5DaGFyc0JldHdlZW4oICcwJywgJzknICkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAoXFwvfFxcLnwtKVxuICAgICAgICAgICAgICAgICAgICAgICAgICBcIihcIiArIFNlcGFyYXRvcnMuUmVzb2x2ZSggc2VwYXJhdG9yICkgKyBcIilcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFsxLTldXFxkezN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFJlZ2V4VG9rZW5zLkNoYXJzQmV0d2VlbiggJzEnLCAnOScgKSArIFJlZ2V4VG9rZW5zLkRpZ2l0ICsgUmVnZXhUb2tlbnMuUXVhbnRpdHlPZlByZWNlZGluZyggMyApO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjAgSm/Do28gUGVkcm8gTWFydGlucyBOZXZlcyAoU0hJVkFZTCkgLSBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFJlZ2V4UXVlcnkgYW5kIGFsbCBpdHMgY29udGVudHMgYXJlIGxpY2Vuc2VkIHVuZGVyIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2My4wXG4gKiAoR1BMLTMuMCksIGxvY2F0ZWQgaW4gdGhlIHJvb3QgZm9sZGVyLCB1bmRlciB0aGUgbmFtZSBcIkxJQ0VOU0UubWRcIi5cbiAqXG4gKi9cblxudXNpbmcgQnJpZGdlO1xudXNpbmcgUmVnZXhRdWVyeS5JbnRlcmZhY2VzO1xudXNpbmcgUmVnZXhRdWVyeS5Db25zdGFudHM7XG5cbm5hbWVzcGFjZSBSZWdleFF1ZXJ5XG57XG4gICAgLy8gSW1wbGVtZW50cyBJUmVnZXhRdWVyeVRva2Vuc1xuICAgIHB1YmxpYyBwYXJ0aWFsIGNsYXNzIFJlZ2V4UXVlcnlcbiAgICB7XG4gICAgICAgIHB1YmxpYyBJUmVnZXhRdWVyeSBBU3BhY2UoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLlF1ZXJ5ICs9IFJlZ2V4VG9rZW5zLldoaXRlU3BhY2U7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBJUmVnZXhRdWVyeSBBRGlnaXQoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLlF1ZXJ5ICs9IFJlZ2V4VG9rZW5zLkRpZ2l0O1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgSVJlZ2V4UXVlcnkgQVdvcmQoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLlF1ZXJ5ICs9IFJlZ2V4VG9rZW5zLldvcmQ7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBJUmVnZXhRdWVyeSBOb3RBV29yZCgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuUXVlcnkgKz0gUmVnZXhUb2tlbnMuTm90V29yZDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIElSZWdleFF1ZXJ5IEFOZXdMaW5lKClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5RdWVyeSArPSBSZWdleFRva2Vucy5OZXdMaW5lO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgSVJlZ2V4UXVlcnkgQXRTdGFydE9mU3RyaW5nKClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5RdWVyeSArPSBSZWdleFRva2Vucy5TdGFydE9mU3RyaW5nO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgSVJlZ2V4UXVlcnkgQXRFbmRPZlN0cmluZygpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuUXVlcnkgKz0gUmVnZXhUb2tlbnMuRW5kT2ZTdHJpbmc7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBJUmVnZXhRdWVyeSBBVGFiKClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5RdWVyeSArPSBSZWdleFRva2Vucy5UYWI7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBJUmVnZXhRdWVyeSBBQ2FycmlhZ2VSZXR1cm4oKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLlF1ZXJ5ICs9IFJlZ2V4VG9rZW5zLkNhcnJpYWdlUmV0dXJuO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgSVJlZ2V4UXVlcnkgQVdoaXRlU3BhY2UoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLlF1ZXJ5ICs9IFJlZ2V4VG9rZW5zLldoaXRlU3BhY2U7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBJUmVnZXhRdWVyeSBOb3RBV2hpdGVTcGFjZSgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuUXVlcnkgKz0gUmVnZXhUb2tlbnMuTm90V2hpdGVTcGFjZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBJUmVnZXhRdWVyeSBBbnlDaGFyRXhjZXB0TmV3TGluZSgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuUXVlcnkgKz0gUmVnZXhUb2tlbnMuQW55Q2hhckV4Y2VwdE5ld0xpbmU7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBJUmVnZXhRdWVyeSBBV29yZEJvdW5kYXJ5KClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5RdWVyeSArPSBSZWdleFRva2Vucy5Xb3JkQm91bmRhcnk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBJUmVnZXhRdWVyeSBOb3RBV29yZEJvdW5kYXJ5KClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5RdWVyeSArPSBSZWdleFRva2Vucy5Ob3RXb3JkQm91bmRhcnk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdCn0K
