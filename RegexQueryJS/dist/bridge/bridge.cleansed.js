/**
 * @version   : 17.10.1 - Bridge.NET
 * @author    : Object.NET, Inc. http://bridge.net/
 * @copyright : Copyright 2008-2019 Object.NET, Inc. http://object.net/
 * @license   : See license.txt and https://github.com/bridgedotnet/Bridge/blob/master/LICENSE.md
 *
 * Most of the code has been deleted.
 * Bridge.NET does not provide any modularity on the construction of this file.
 * All the code gets dumped here.
 * We are talking about 2mb of code.
 */

// @source Init.js

( function ( globals ) {
  "use strict";

  if ( typeof module !== "undefined" && module.exports ) {
    globals = global;
  }

  // @source Core.js

  var core = {
    global: globals,

    isNode: Object.prototype.toString.call( typeof process !== "undefined" ? process : 0 ) === "[object process]",

    emptyFn: function () { },

    identity: function ( x ) {
      return x;
    },

    Deconstruct: function ( obj ) {
      var args = Array.prototype.slice.call( arguments, 1 );

      for ( var i = 0; i < args.length; i++ ) {
        args[i].v = i == 7 ? obj["Rest"] : obj["Item" + ( i + 1 )];
      }
    },

    toString: function ( instance ) {
      if ( instance == null ) {
        throw new System.ArgumentNullException();
      }

      var guardItem = Bridge.$toStringGuard[Bridge.$toStringGuard.length - 1];

      if ( instance.toString === Object.prototype.toString || guardItem && guardItem === instance ) {
        return Bridge.Reflection.getTypeFullName( instance );
      }

      Bridge.$toStringGuard.push( instance );

      var result = instance.toString();

      Bridge.$toStringGuard.pop();

      return result;
    },

    geti: function ( scope, name1, name2 ) {
      if ( scope[name1] !== undefined ) {
        return name1;
      }

      if ( name2 && scope[name2] != undefined ) {
        return name2;
      }

      var name = name2 || name1;
      var idx = name.lastIndexOf( "$" );

      if ( /\$\d+$/g.test( name ) ) {
        idx = name.lastIndexOf( "$", idx - 1 );
      }

      return name.substr( idx + 1 );
    },

    box: function ( v, T, toStr, hashCode ) {
      if ( v && v.$boxed ) {
        return v;
      }

      if ( v == null ) {
        return v;
      }

      if ( v.$clone ) {
        v = v.$clone();
      }

      return {
        $boxed: true,
        fn: {
          toString: toStr,
          getHashCode: hashCode
        },
        v: v,
        type: T,
        constructor: T,
        getHashCode: function () {
          return this.fn.getHashCode ? this.fn.getHashCode( this.v ) : Bridge.getHashCode( this.v );
        },
        equals: function ( o ) {
          if ( this === o ) {
            return true;
          }

          var eq = this.equals;
          this.equals = null;
          var r = Bridge.equals( this.v, o );
          this.equals = eq;

          return r;
        },
        valueOf: function () {
          return this.v;
        },
        toString: function () {
          return this.fn.toString ? this.fn.toString( this.v ) : this.v.toString();
        }
      };
    },

    unbox: function ( o, noclone ) {
      var T;

      if ( noclone && Bridge.isFunction( noclone ) ) {
        T = noclone;
        noclone = false;
      }

      if ( o && o.$boxed ) {
        var v = o.v,
          t = o.type;

        if ( T && T.$nullable ) {
          T = T.$nullableType;
        }

        if ( T && T.$kind === "enum" ) {
          T = System.Enum.getUnderlyingType( T );
        }

        if ( t.$nullable ) {
          t = t.$nullableType;
        }

        if ( t.$kind === "enum" ) {
          t = System.Enum.getUnderlyingType( t );
        }

        if ( T && T !== t && !Bridge.isObject( T ) ) {
          throw new System.InvalidCastException.$ctor1( "Specified cast is not valid." );
        }

        if ( !noclone && v && v.$clone ) {
          v = v.$clone();
        }

        return v;
      }

      if ( Bridge.isArray( o ) ) {
        for ( var i = 0; i < o.length; i++ ) {
          var item = o[i];

          if ( item && item.$boxed ) {
            item = item.v;

            if ( item.$clone ) {
              item = item.$clone();
            }
          } else if ( !noclone && item && item.$clone ) {
            item = item.$clone();
          }

          o[i] = item;
        }
      }

      if ( o && !noclone && o.$clone ) {
        o = o.$clone();
      }

      return o;
    },

    virtualc: function ( name ) {
      return Bridge.virtual( name, true );
    },

    virtual: function ( name, isClass ) {
      var type = Bridge.unroll( name );

      if ( !type || !Bridge.isFunction( type ) ) {
        var old = Bridge.Class.staticInitAllow;
        type = isClass ? Bridge.define( name ) : Bridge.definei( name );
        Bridge.Class.staticInitAllow = true;

        if ( type.$staticInit ) {
          type.$staticInit();
        }

        Bridge.Class.staticInitAllow = old;
      }

      return type;
    },

    safe: function ( fn ) {
      try {
        return fn();
      } catch ( ex ) {
      }

      return false;
    },

    literal: function ( type, obj ) {
      obj.$getType = function () { return type; };

      return obj;
    },

    isJSObject: function ( value ) {
      return Object.prototype.toString.call( value ) === "[object Object]";
    },

    isPlainObject: function ( obj ) {
      if ( typeof obj == "object" && obj !== null ) {
        if ( typeof Object.getPrototypeOf == "function" ) {
          var proto = Object.getPrototypeOf( obj );

          return proto === Object.prototype || proto === null;
        }

        return Object.prototype.toString.call( obj ) === "[object Object]";
      }

      return false;
    },

    toPlain: function ( o ) {
      if ( !o || Bridge.isPlainObject( o ) || typeof o != "object" ) {
        return o;
      }

      if ( typeof o.toJSON == "function" ) {
        return o.toJSON();
      }

      if ( Bridge.isArray( o ) ) {
        var arr = [];

        for ( var i = 0; i < o.length; i++ ) {
          arr.push( Bridge.toPlain( o[i] ) );
        }

        return arr;
      }

      var newo = {},
        m;

      for ( var key in o ) {
        m = o[key];

        if ( !Bridge.isFunction( m ) ) {
          newo[key] = m;
        }
      }

      return newo;
    },

    ref: function ( o, n ) {
      if ( Bridge.isArray( n ) ) {
        n = System.Array.toIndex( o, n );
      }

      var proxy = {};

      Object.defineProperty( proxy, "v", {
        get: function () {
          if ( n == null ) {
            return o;
          }

          return o[n];
        },

        set: function ( value ) {
          if ( n == null ) {
            if ( value && value.$clone ) {
              value.$clone( o );
            } else {
              o = value;
            }
          }

          o[n] = value;
        }
      } );

      return proxy;
    },

    ensureBaseProperty: function ( scope, name, alias ) {
      var scopeType = Bridge.getType( scope ),
        descriptors = scopeType.$descriptors || [];

      scope.$propMap = scope.$propMap || {};

      if ( scope.$propMap[name] ) {
        return scope;
      }

      if ( ( !scopeType.$descriptors || scopeType.$descriptors.length === 0 ) && alias ) {
        var aliasCfg = {},
          aliasName = "$" + alias + "$" + name;

        aliasCfg.get = function () {
          return scope[name];
        };

        aliasCfg.set = function ( value ) {
          scope[name] = value;
        };

        Bridge.property( scope, aliasName, aliasCfg, false, scopeType, true );
      }
      else {
        for ( var j = 0; j < descriptors.length; j++ ) {
          var d = descriptors[j];

          if ( d.name === name ) {
            var aliasCfg = {},
              aliasName = "$" + Bridge.getTypeAlias( d.cls ) + "$" + name;

            if ( d.get ) {
              aliasCfg.get = d.get;
            }

            if ( d.set ) {
              aliasCfg.set = d.set;
            }

            Bridge.property( scope, aliasName, aliasCfg, false, scopeType, true );
          }
        }
      }

      scope.$propMap[name] = true;

      return scope;
    },

    property: function ( scope, name, v, statics, cls, alias ) {
      var cfg = {
        enumerable: alias ? false : true,
        configurable: true
      };

      if ( v && v.get ) {
        cfg.get = v.get;
      }

      if ( v && v.set ) {
        cfg.set = v.set;
      }

      if ( !v || !( v.get || v.set ) ) {
        var backingField = Bridge.getTypeAlias( cls ) + "$" + name;

        cls.$init = cls.$init || {};

        if ( statics ) {
          cls.$init[backingField] = v;
        }

        ( function ( cfg, scope, backingField, v ) {
          cfg.get = function () {
            var o = this.$init[backingField];

            return o === undefined ? v : o;
          };

          cfg.set = function ( value ) {
            this.$init[backingField] = value;
          };
        } )( cfg, scope, backingField, v );
      }

      Object.defineProperty( scope, name, cfg );

      return cfg;
    },

    event: function ( scope, name, v, statics ) {
      scope[name] = v;

      var rs = name.charAt( 0 ) === "$",
        cap = rs ? name.slice( 1 ) : name,
        addName = "add" + cap,
        removeName = "remove" + cap,
        lastSep = name.lastIndexOf( "$" ),
        endsNum = lastSep > 0 && ( ( name.length - lastSep - 1 ) > 0 ) && !isNaN( parseInt( name.substr( lastSep + 1 ) ) );

      if ( endsNum ) {
        lastSep = name.substring( 0, lastSep - 1 ).lastIndexOf( "$" );
      }

      if ( lastSep > 0 && lastSep !== ( name.length - 1 ) ) {
        addName = name.substring( 0, lastSep ) + "add" + name.substr( lastSep + 1 );
        removeName = name.substring( 0, lastSep ) + "remove" + name.substr( lastSep + 1 );
      }

      scope[addName] = ( function ( name, scope, statics ) {
        return statics ? function ( value ) {
          scope[name] = Bridge.fn.combine( scope[name], value );
        } : function ( value ) {
          this[name] = Bridge.fn.combine( this[name], value );
        };
      } )( name, scope, statics );

      scope[removeName] = ( function ( name, scope, statics ) {
        return statics ? function ( value ) {
          scope[name] = Bridge.fn.remove( scope[name], value );
        } : function ( value ) {
          this[name] = Bridge.fn.remove( this[name], value );
        };
      } )( name, scope, statics );
    },

    createInstance: function ( type, nonPublic, args ) {
      if ( Bridge.isArray( nonPublic ) ) {
        args = nonPublic;
        nonPublic = false;
      }

      if ( type === System.Decimal ) {
        return System.Decimal.Zero;
      }

      if ( type === System.Int64 ) {
        return System.Int64.Zero;
      }

      if ( type === System.UInt64 ) {
        return System.UInt64.Zero;
      }

      if ( type === System.Double ||
        type === System.Single ||
        type === System.Byte ||
        type === System.SByte ||
        type === System.Int16 ||
        type === System.UInt16 ||
        type === System.Int32 ||
        type === System.UInt32 ||
        type === Bridge.Int ) {
        return 0;
      }

      if ( typeof ( type.createInstance ) === "function" ) {
        return type.createInstance();
      } else if ( typeof ( type.getDefaultValue ) === "function" ) {
        return type.getDefaultValue();
      } else if ( type === Boolean || type === System.Boolean ) {
        return false;
      } else if ( type === System.DateTime ) {
        return System.DateTime.getDefaultValue();
      } else if ( type === Date ) {
        return new Date();
      } else if ( type === Number ) {
        return 0;
      } else if ( type === String || type === System.String ) {
        return "";
      } else if ( type && type.$literal ) {
        return type.ctor();
      } else if ( args && args.length > 0 ) {
        return Bridge.Reflection.applyConstructor( type, args );
      }

      if ( type.$kind === 'interface' ) {
        throw new System.MissingMethodException.$ctor1( 'Default constructor not found for type ' + Bridge.getTypeName( type ) );
      }

      var ctors = Bridge.Reflection.getMembers( type, 1, 54 );

      if ( ctors.length > 0 ) {
        var pctors = ctors.filter( function ( c ) { return !c.isSynthetic && !c.sm; } );

        for ( var idx = 0; idx < pctors.length; idx++ ) {
          var c = pctors[idx],
            isDefault = ( c.pi || [] ).length === 0;

          if ( isDefault ) {
            if ( nonPublic || c.a === 2 ) {
              return Bridge.Reflection.invokeCI( c, [] );
            }
            throw new System.MissingMethodException.$ctor1( 'Default constructor not found for type ' + Bridge.getTypeName( type ) );
          }
        }

        if ( type.$$name && !( ctors.length == 1 && ctors[0].isSynthetic ) ) {
          throw new System.MissingMethodException.$ctor1( 'Default constructor not found for type ' + Bridge.getTypeName( type ) );
        }
      }

      return new type();
    },

    clone: function ( obj ) {
      if ( obj == null ) {
        return obj;
      }

      if ( Bridge.isArray( obj ) ) {
        return System.Array.clone( obj );
      }

      if ( Bridge.isString( obj ) ) {
        return obj;
      }

      var name;

      if ( Bridge.isFunction( Bridge.getProperty( obj, name = "System$ICloneable$clone" ) ) ) {
        return obj[name]();
      }

      if ( Bridge.is( obj, System.ICloneable ) ) {
        return obj.clone();
      }

      if ( Bridge.isFunction( obj.$clone ) ) {
        return obj.$clone();
      }

      return null;
    },

    copy: function ( to, from, keys, toIf ) {
      if ( typeof keys === "string" ) {
        keys = keys.split( /[,;\s]+/ );
      }

      for ( var name, i = 0, n = keys ? keys.length : 0; i < n; i++ ) {
        name = keys[i];

        if ( toIf !== true || to[name] == undefined ) {
          if ( Bridge.is( from[name], System.ICloneable ) ) {
            to[name] = Bridge.clone( from[name] );
          } else {
            to[name] = from[name];
          }
        }
      }

      return to;
    },

    get: function ( t ) {
      if ( t && t.$staticInit !== null ) {
        t.$staticInit();
      }

      return t;
    },

    ns: function ( ns, scope ) {
      var nsParts = ns.split( "." ),
        i = 0;

      if ( !scope ) {
        scope = Bridge.global;
      }

      for ( i = 0; i < nsParts.length; i++ ) {
        if ( typeof scope[nsParts[i]] === "undefined" ) {
          scope[nsParts[i]] = {};
        }

        scope = scope[nsParts[i]];
      }

      return scope;
    },

    ready: function ( fn, scope ) {
      var delayfn = function () {
        if ( scope ) {
          fn.apply( scope );
        } else {
          fn();
        }
      };

      if ( typeof Bridge.global.jQuery !== "undefined" ) {
        Bridge.global.jQuery( delayfn );
      } else {
        if ( typeof Bridge.global.document === "undefined" ||
          Bridge.global.document.readyState === "complete" ||
          Bridge.global.document.readyState === "loaded" ||
          Bridge.global.document.readyState === "interactive" ) {
          delayfn();
        } else {
          Bridge.on( "DOMContentLoaded", Bridge.global.document, delayfn );
        }
      }
    },

    on: function ( event, elem, fn, scope ) {
      var listenHandler = function ( e ) {
        var ret = fn.apply( scope || this, arguments );

        if ( ret === false ) {
          e.stopPropagation();
          e.preventDefault();
        }

        return ( ret );
      };

      var attachHandler = function () {
        var ret = fn.call( scope || elem, Bridge.global.event );

        if ( ret === false ) {
          Bridge.global.event.returnValue = false;
          Bridge.global.event.cancelBubble = true;
        }

        return ( ret );
      };

      if ( elem.addEventListener ) {
        elem.addEventListener( event, listenHandler, false );
      } else {
        elem.attachEvent( "on" + event, attachHandler );
      }
    },

    addHash: function ( v, r, m ) {
      if ( isNaN( r ) ) {
        r = 17;
      }

      if ( isNaN( m ) ) {
        m = 23;
      }

      if ( Bridge.isArray( v ) ) {
        for ( var i = 0; i < v.length; i++ ) {
          r = r + ( ( r * m | 0 ) + ( v[i] == null ? 0 : Bridge.getHashCode( v[i] ) ) ) | 0;
        }

        return r;
      }

      return r = r + ( ( r * m | 0 ) + ( v == null ? 0 : Bridge.getHashCode( v ) ) ) | 0;
    },

    getHashCode: function ( value, safe, deep ) {
      // In CLR: mutable object should keep on returning same value
      // Bridge.NET goals: make it deterministic (to make testing easier) without breaking CLR contracts
      //     for value types it returns deterministic values (f.e. for int 3 it returns 3)
      //     for reference types it returns random value

      if ( value && value.$boxed && value.type.getHashCode ) {
        return value.type.getHashCode( Bridge.unbox( value, true ) );
      }

      value = Bridge.unbox( value, true );

      if ( Bridge.isEmpty( value, true ) ) {
        if ( safe ) {
          return 0;
        }

        throw new System.InvalidOperationException.$ctor1( "HashCode cannot be calculated for empty value" );
      }

      if ( value.getHashCode && Bridge.isFunction( value.getHashCode ) && !value.__insideHashCode && value.getHashCode.length === 0 ) {
        value.__insideHashCode = true;
        var r = value.getHashCode();

        delete value.__insideHashCode;

        return r;
      }

      if ( Bridge.isBoolean( value ) ) {
        return value ? 1 : 0;
      }

      if ( Bridge.isDate( value ) ) {
        var val = value.ticks !== undefined ? value.ticks : System.DateTime.getTicks( value );

        return val.toNumber() & 0xFFFFFFFF;
      }

      if ( value === Number.POSITIVE_INFINITY ) {
        return 0x7FF00000;
      }

      if ( value === Number.NEGATIVE_INFINITY ) {
        return 0xFFF00000;
      }

      if ( Bridge.isNumber( value ) ) {
        if ( Math.floor( value ) === value ) {
          return value;
        }

        value = value.toExponential();
      }

      if ( Bridge.isString( value ) ) {
        if ( Math.imul ) {
          for ( var i = 0, h = 0; i < value.length; i++ )
            h = Math.imul( 31, h ) + value.charCodeAt( i ) | 0;
          return h;
        } else {
          var h = 0, l = value.length, i = 0;
          if ( l > 0 )
            while ( i < l )
              h = ( h << 5 ) - h + value.charCodeAt( i++ ) | 0;
          return h;
        }
      }

      if ( value.$$hashCode ) {
        return value.$$hashCode;
      }

      if ( deep !== false && value.hasOwnProperty( "Item1" ) && Bridge.isPlainObject( value ) ) {
        deep = true;
      }

      if ( deep && typeof value == "object" ) {
        var result = 0,
          temp;

        for ( var property in value ) {
          if ( value.hasOwnProperty( property ) ) {
            temp = Bridge.isEmpty( value[property], true ) ? 0 : Bridge.getHashCode( value[property] );
            result = 29 * result + temp;
          }
        }

        if ( result !== 0 ) {
          value.$$hashCode = result;

          return result;
        }
      }

      value.$$hashCode = ( Math.random() * 0x100000000 ) | 0;

      return value.$$hashCode;
    },

    getDefaultValue: function ( type ) {
      if ( type == null ) {
        throw new System.ArgumentNullException.$ctor1( "type" );
      } else if ( ( type.getDefaultValue ) && type.getDefaultValue.length === 0 ) {
        return type.getDefaultValue();
      } else if ( Bridge.Reflection.isEnum( type ) ) {
        return System.Enum.parse( type, 0 );
      } else if ( type === Boolean || type === System.Boolean ) {
        return false;
      } else if ( type === System.DateTime ) {
        return System.DateTime.getDefaultValue();
      } else if ( type === Date ) {
        return new Date();
      } else if ( type === Number ) {
        return 0;
      }

      return null;
    },

    $$aliasCache: [],

    getTypeAlias: function ( obj ) {
      if ( obj.$$alias ) {
        return obj.$$alias;
      }

      var type = ( obj.$$name || typeof obj === "function" ) ? obj : Bridge.getType( obj ),
        alias;

      if ( type.$$alias ) {
        return type.$$alias;
      }

      alias = Bridge.$$aliasCache[type];
      if ( alias ) {
        return alias;
      }

      if ( type.$isArray ) {
        var elementName = Bridge.getTypeAlias( type.$elementType );
        alias = elementName + "$Array" + ( type.$rank > 1 ? ( "$" + type.$rank ) : "" );

        if ( type.$$name ) {
          type.$$alias = alias;
        } else {
          Bridge.$$aliasCache[type] = alias;
        }

        return alias;
      }

      var name = obj.$$name || Bridge.getTypeName( obj );

      if ( type.$typeArguments && !type.$isGenericTypeDefinition ) {
        name = type.$genericTypeDefinition.$$name;

        for ( var i = 0; i < type.$typeArguments.length; i++ ) {
          var ta = type.$typeArguments[i];
          name += "$" + Bridge.getTypeAlias( ta );
        }
      }

      alias = name.replace( /[\.\(\)\,\+]/g, "$" );

      if ( type.$module ) {
        alias = type.$module + "$" + alias;
      }

      if ( type.$$name ) {
        type.$$alias = alias;
      } else {
        Bridge.$$aliasCache[type] = alias;
      }

      return alias;
    },

    getTypeName: function ( obj ) {
      return Bridge.Reflection.getTypeFullName( obj );
    },

    hasValue: function ( obj ) {
      return Bridge.unbox( obj, true ) != null;
    },

    hasValue$1: function () {
      if ( arguments.length === 0 ) {
        return false;
      }

      var i = 0;

      for ( i; i < arguments.length; i++ ) {
        if ( Bridge.unbox( arguments[i], true ) == null ) {
          return false;
        }
      }

      return true;
    },

    isObject: function ( type ) {
      return type === Object || type === System.Object;
    },

    is: function ( obj, type, ignoreFn, allowNull ) {
      if ( obj == null ) {
        return !!allowNull;
      }

      if ( type === System.Object ) {
        type = Object;
      }

      var tt = typeof type;

      if ( tt === "boolean" ) {
        return type;
      }

      if ( obj.$boxed ) {
        if ( obj.type.$kind === "enum" && ( obj.type.prototype.$utype === type || type === System.Enum || type === System.IFormattable || type === System.IComparable ) ) {
          return true;
        } else if ( !Bridge.Reflection.isInterface( type ) && !type.$nullable ) {
          return obj.type === type || Bridge.isObject( type ) || type === System.ValueType && Bridge.Reflection.isValueType( obj.type );
        }

        if ( ignoreFn !== true && type.$is ) {
          return type.$is( Bridge.unbox( obj, true ) );
        }

        if ( Bridge.Reflection.isAssignableFrom( type, obj.type ) ) {
          return true;
        }

        obj = Bridge.unbox( obj, true );
      }

      var ctor = obj.constructor === Object && obj.$getType ? obj.$getType() : Bridge.Reflection.convertType( obj.constructor );

      if ( type.constructor === Function && obj instanceof type || ctor === type || Bridge.isObject( type ) ) {
        return true;
      }

      var hasObjKind = ctor.$kind || ctor.$$inherits,
        hasTypeKind = type.$kind;

      if ( hasObjKind || hasTypeKind ) {
        var isInterface = type.$isInterface;

        if ( isInterface ) {
          if ( hasObjKind ) {
            if ( ctor.$isArrayEnumerator ) {
              return System.Array.is( obj, type );
            }

            return type.isAssignableFrom ? type.isAssignableFrom( ctor ) : Bridge.Reflection.getInterfaces( ctor ).indexOf( type ) >= 0;
          }

          if ( Bridge.isArray( obj, ctor ) ) {
            return System.Array.is( obj, type );
          }
        }

        if ( ignoreFn !== true && type.$is ) {
          return type.$is( obj );
        }

        if ( type.$literal ) {
          if ( Bridge.isPlainObject( obj ) ) {
            if ( obj.$getType ) {
              return Bridge.Reflection.isAssignableFrom( type, obj.$getType() );
            }

            return true;
          }
        }

        return false;
      }

      if ( tt === "string" ) {
        type = Bridge.unroll( type );
      }

      if ( tt === "function" && ( Bridge.getType( obj ).prototype instanceof type ) ) {
        return true;
      }

      if ( ignoreFn !== true ) {
        if ( typeof ( type.$is ) === "function" ) {
          return type.$is( obj );
        }

        if ( typeof ( type.isAssignableFrom ) === "function" ) {
          return type.isAssignableFrom( Bridge.getType( obj ) );
        }
      }

      if ( Bridge.isArray( obj ) ) {
        return System.Array.is( obj, type );
      }

      return tt === "object" && ( ( ctor === type ) || ( obj instanceof type ) );
    },

    as: function ( obj, type, allowNull ) {
      if ( Bridge.is( obj, type, false, allowNull ) ) {
        return obj != null && obj.$boxed && type !== Object && type !== System.Object ? obj.v : obj;
      }
      return null;
    },

    cast: function ( obj, type, allowNull ) {
      if ( obj == null ) {
        return obj;
      }

      var result = Bridge.is( obj, type, false, allowNull ) ? obj : null;

      if ( result === null ) {
        throw new System.InvalidCastException.$ctor1( "Unable to cast type " + ( obj ? Bridge.getTypeName( obj ) : "'null'" ) + " to type " + Bridge.getTypeName( type ) );
      }

      if ( obj.$boxed && type !== Object && type !== System.Object ) {
        return obj.v;
      }

      return result;
    },

    apply: function ( obj, values, callback ) {
      var names = Bridge.getPropertyNames( values, true ),
        i;

      for ( i = 0; i < names.length; i++ ) {
        var name = names[i];

        if ( typeof obj[name] === "function" && typeof values[name] !== "function" ) {
          obj[name]( values[name] );
        } else {
          obj[name] = values[name];
        }
      }

      if ( callback ) {
        callback.call( obj, obj );
      }

      return obj;
    },

    copyProperties: function ( to, from ) {
      var names = Bridge.getPropertyNames( from, false ),
        i;

      for ( i = 0; i < names.length; i++ ) {
        var name = names[i],
          own = from.hasOwnProperty( name ),
          dcount = name.split( "$" ).length;

        if ( own && ( dcount === 1 || dcount === 2 && name.match( "\$\d+$" ) ) ) {
          to[name] = from[name];
        }

      }

      return to;
    },

    merge: function ( to, from, callback, elemFactory ) {
      if ( to == null ) {
        return from;
      }

      // Maps instance of plain JS value or Object into Bridge object.
      // Used for deserialization. Proper deserialization requires reflection that is currently not supported in Bridge.
      // It currently is only capable to deserialize:
      // -instance of single class or primitive
      // -array of primitives
      // -array of single class
      if ( to instanceof System.Decimal && typeof from === "number" ) {
        return new System.Decimal( from );
      }

      if ( to instanceof System.Int64 && Bridge.isNumber( from ) ) {
        return new System.Int64( from );
      }

      if ( to instanceof System.UInt64 && Bridge.isNumber( from ) ) {
        return new System.UInt64( from );
      }

      if ( to instanceof Boolean || Bridge.isBoolean( to ) ||
        typeof to === "number" ||
        to instanceof String || Bridge.isString( to ) ||
        to instanceof Function || Bridge.isFunction( to ) ||
        to instanceof Date || Bridge.isDate( to ) ||
        Bridge.getType( to ).$number ) {
        return from;
      }

      var key,
        i,
        value,
        toValue,
        fn;

      if ( Bridge.isArray( from ) && Bridge.isFunction( to.add || to.push ) ) {
        fn = Bridge.isArray( to ) ? to.push : to.add;

        for ( i = 0; i < from.length; i++ ) {
          var item = from[i];

          if ( !Bridge.isArray( item ) ) {
            item = [typeof elemFactory === "undefined" ? item : Bridge.merge( elemFactory(), item )];
          }

          fn.apply( to, item );
        }
      } else {
        var t = Bridge.getType( to ),
          descriptors = t && t.$descriptors;

        if ( from ) {
          for ( key in from ) {
            value = from[key];

            var descriptor = null;

            if ( descriptors ) {
              for ( var i = descriptors.length - 1; i >= 0; i-- ) {
                if ( descriptors[i].name === key ) {
                  descriptor = descriptors[i];

                  break;
                }
              }
            }

            if ( descriptor != null ) {
              if ( descriptor.set ) {
                to[key] = Bridge.merge( to[key], value );
              } else {
                Bridge.merge( to[key], value );
              }
            } else if ( typeof to[key] === "function" ) {
              if ( key.match( /^\s*get[A-Z]/ ) ) {
                Bridge.merge( to[key](), value );
              } else {
                to[key]( value );
              }
            } else {
              var setter1 = "set" + key.charAt( 0 ).toUpperCase() + key.slice( 1 ),
                setter2 = "set" + key,
                getter;

              if ( typeof to[setter1] === "function" && typeof value !== "function" ) {
                getter = "g" + setter1.slice( 1 );

                if ( typeof to[getter] === "function" ) {
                  to[setter1]( Bridge.merge( to[getter](), value ) );
                } else {
                  to[setter1]( value );
                }
              } else if ( typeof to[setter2] === "function" && typeof value !== "function" ) {
                getter = "g" + setter2.slice( 1 );

                if ( typeof to[getter] === "function" ) {
                  to[setter2]( Bridge.merge( to[getter](), value ) );
                } else {
                  to[setter2]( value );
                }
              } else if ( value && value.constructor === Object && to[key] ) {
                toValue = to[key];
                Bridge.merge( toValue, value );
              } else {
                var isNumber = Bridge.isNumber( from );

                if ( to[key] instanceof System.Decimal && isNumber ) {
                  return new System.Decimal( from );
                }

                if ( to[key] instanceof System.Int64 && isNumber ) {
                  return new System.Int64( from );
                }

                if ( to[key] instanceof System.UInt64 && isNumber ) {
                  return new System.UInt64( from );
                }

                to[key] = value;
              }
            }
          }
        } else {
          if ( callback ) {
            callback.call( to, to );
          }

          return from;
        }
      }

      if ( callback ) {
        callback.call( to, to );
      }

      return to;
    },

    getEnumerator: function ( obj, fnName, T ) {
      if ( typeof obj === "string" ) {
        obj = System.String.toCharArray( obj );
      }

      if ( arguments.length === 2 && Bridge.isFunction( fnName ) ) {
        T = fnName;
        fnName = null;
      }

      if ( fnName && obj && obj[fnName] ) {
        return obj[fnName].call( obj );
      }

      if ( !T && obj && obj.GetEnumerator ) {
        return obj.GetEnumerator();
      }

      var name;

      if ( T && Bridge.isFunction( Bridge.getProperty( obj, name = "System$Collections$Generic$IEnumerable$1$" + Bridge.getTypeAlias( T ) + "$GetEnumerator" ) ) ) {
        return obj[name]();
      }

      if ( T && Bridge.isFunction( Bridge.getProperty( obj, name = "System$Collections$Generic$IEnumerable$1$GetEnumerator" ) ) ) {
        return obj[name]();
      }

      if ( Bridge.isFunction( Bridge.getProperty( obj, name = "System$Collections$IEnumerable$GetEnumerator" ) ) ) {
        return obj[name]();
      }

      if ( T && obj && obj.GetEnumerator ) {
        return obj.GetEnumerator();
      }

      if ( ( Object.prototype.toString.call( obj ) === "[object Array]" ) ||
        ( obj && Bridge.isDefined( obj.length ) ) ) {
        return new Bridge.ArrayEnumerator( obj, T );
      }

      throw new System.InvalidOperationException.$ctor1( "Cannot create Enumerator." );
    },

    getPropertyNames: function ( obj, includeFunctions ) {
      var names = [],
        name;

      for ( name in obj ) {
        if ( includeFunctions || typeof obj[name] !== "function" ) {
          names.push( name );
        }
      }

      return names;
    },

    getProperty: function ( obj, propertyName ) {
      if ( Bridge.isHtmlAttributeCollection( obj ) && !this.isValidHtmlAttributeName( propertyName ) ) {
        return undefined;
      }

      return obj[propertyName];
    },

    isValidHtmlAttributeName: function ( name ) {
      // https://html.spec.whatwg.org/multipage/syntax.html#attributes-2

      if ( !name || !name.length ) {
        return false;
      }

      var r = /^[a-zA-Z_][\w\-]*$/;

      return r.test( name );
    },

    isHtmlAttributeCollection: function ( obj ) {
      return typeof obj !== "undefined" && ( Object.prototype.toString.call( obj ) === "[object NamedNodeMap]" );
    },

    isDefined: function ( value, noNull ) {
      return typeof value !== "undefined" && ( noNull ? value !== null : true );
    },

    isEmpty: function ( value, allowEmpty ) {
      return ( typeof value === "undefined" || value === null ) || ( !allowEmpty ? value === "" : false ) || ( ( !allowEmpty && Bridge.isArray( value ) ) ? value.length === 0 : false );
    },

    toArray: function ( ienumerable ) {
      var i,
        item,
        len,
        result = [];

      if ( Bridge.isArray( ienumerable ) ) {
        for ( i = 0, len = ienumerable.length; i < len; ++i ) {
          result.push( ienumerable[i] );
        }
      } else {
        i = Bridge.getEnumerator( ienumerable );

        while ( i.moveNext() ) {
          item = i.Current;
          result.push( item );
        }
      }

      return result;
    },

    toList: function ( ienumerable, T ) {
      return new ( System.Collections.Generic.List$1( T || System.Object ).$ctor1 )( ienumerable );
    },

    arrayTypes: [globals.Array, globals.Uint8Array, globals.Int8Array, globals.Int16Array, globals.Uint16Array, globals.Int32Array, globals.Uint32Array, globals.Float32Array, globals.Float64Array, globals.Uint8ClampedArray],

    isArray: function ( obj, ctor ) {
      var c = ctor || ( obj != null ? obj.constructor : null );

      if ( !c ) {
        return false;
      }

      return Bridge.arrayTypes.indexOf( c ) >= 0 || c.$isArray || Array.isArray( obj );
    },

    isFunction: function ( obj ) {
      return typeof ( obj ) === "function";
    },

    isDate: function ( obj ) {
      return obj instanceof Date || Object.prototype.toString.call( obj ) === "[object Date]";
    },

    isNull: function ( value ) {
      return ( value === null ) || ( value === undefined );
    },

    isBoolean: function ( value ) {
      return typeof value === "boolean";
    },

    isNumber: function ( value ) {
      return typeof value === "number" && isFinite( value );
    },

    isString: function ( value ) {
      return typeof value === "string";
    },

    unroll: function ( value, scope ) {
      if ( Bridge.isArray( value ) ) {
        for ( var i = 0; i < value.length; i++ ) {
          var v = value[i];

          if ( Bridge.isString( v ) ) {
            value[i] = Bridge.unroll( v, scope );
          }
        }

        return;
      }

      var d = value.split( "." ),
        o = ( scope || Bridge.global )[d[0]],
        i = 1;

      for ( i; i < d.length; i++ ) {
        if ( !o ) {
          return null;
        }

        o = o[d[i]];
      }

      return o;
    },

    referenceEquals: function ( a, b ) {
      return Bridge.hasValue( a ) ? a === b : !Bridge.hasValue( b );
    },

    staticEquals: function ( a, b ) {
      if ( !Bridge.hasValue( a ) ) {
        return !Bridge.hasValue( b );
      }

      return Bridge.hasValue( b ) ? Bridge.equals( a, b ) : false;
    },

    equals: function ( a, b ) {
      if ( a == null && b == null ) {
        return true;
      }

      var guardItem = Bridge.$equalsGuard[Bridge.$equalsGuard.length - 1];

      if ( guardItem && guardItem.a === a && guardItem.b === b ) {
        return a === b;
      }

      Bridge.$equalsGuard.push( { a: a, b: b } );

      var fn = function ( a, b ) {
        if ( a && a.$boxed && a.type.equals && a.type.equals.length === 2 ) {
          return a.type.equals( a, b );
        }

        if ( b && b.$boxed && b.type.equals && b.type.equals.length === 2 ) {
          return b.type.equals( b, a );
        }

        if ( a && Bridge.isFunction( a.equals ) && a.equals.length === 1 ) {
          return a.equals( b );
        }

        if ( b && Bridge.isFunction( b.equals ) && b.equals.length === 1 ) {
          return b.equals( a );
        } if ( Bridge.isFunction( a ) && Bridge.isFunction( b ) ) {
          return Bridge.fn.equals.call( a, b );
        } else if ( Bridge.isDate( a ) && Bridge.isDate( b ) ) {
          if ( a.kind !== undefined && a.ticks !== undefined && b.kind !== undefined && b.ticks !== undefined ) {
            return a.ticks.equals( b.ticks );
          }

          return a.valueOf() === b.valueOf();
        } else if ( Bridge.isNull( a ) && Bridge.isNull( b ) ) {
          return true;
        } else if ( Bridge.isNull( a ) !== Bridge.isNull( b ) ) {
          return false;
        }

        var eq = a === b;

        if ( !eq && typeof a === "object" && typeof b === "object" && a !== null && b !== null && a.$kind === "struct" && b.$kind === "struct" && a.$$name === b.$$name ) {
          return Bridge.getHashCode( a ) === Bridge.getHashCode( b ) && Bridge.objectEquals( a, b );
        }

        if ( !eq && a && b && a.hasOwnProperty( "Item1" ) && Bridge.isPlainObject( a ) && b.hasOwnProperty( "Item1" ) && Bridge.isPlainObject( b ) ) {
          return Bridge.objectEquals( a, b, true );
        }

        return eq;
      };

      var result = fn( a, b );
      Bridge.$equalsGuard.pop();

      return result;
    },

    objectEquals: function ( a, b, oneLevel ) {
      Bridge.$$leftChain = [];
      Bridge.$$rightChain = [];

      var result = Bridge.deepEquals( a, b, oneLevel );

      delete Bridge.$$leftChain;
      delete Bridge.$$rightChain;

      return result;
    },

    deepEquals: function ( a, b, oneLevel ) {
      if ( typeof a === "object" && typeof b === "object" ) {
        if ( a === b ) {
          return true;
        }

        if ( Bridge.$$leftChain.indexOf( a ) > -1 || Bridge.$$rightChain.indexOf( b ) > -1 ) {
          return false;
        }

        var p;

        for ( p in b ) {
          if ( b.hasOwnProperty( p ) !== a.hasOwnProperty( p ) ) {
            return false;
          } else if ( typeof b[p] !== typeof a[p] ) {
            return false;
          }
        }

        for ( p in a ) {
          if ( b.hasOwnProperty( p ) !== a.hasOwnProperty( p ) ) {
            return false;
          } else if ( typeof a[p] !== typeof b[p] ) {
            return false;
          }

          if ( a[p] === b[p] ) {
            continue;
          } else if ( typeof ( a[p] ) === "object" && !oneLevel ) {
            Bridge.$$leftChain.push( a );
            Bridge.$$rightChain.push( b );

            if ( !Bridge.deepEquals( a[p], b[p] ) ) {
              return false;
            }

            Bridge.$$leftChain.pop();
            Bridge.$$rightChain.pop();
          } else {
            if ( !Bridge.equals( a[p], b[p] ) ) {
              return false;
            }
          }
        }

        return true;
      } else {
        return Bridge.equals( a, b );
      }
    },

    numberCompare: function ( a, b ) {
      if ( a < b ) {
        return -1;
      }

      if ( a > b ) {
        return 1;
      }

      if ( a == b ) {
        return 0;
      }

      if ( !isNaN( a ) ) {
        return 1;
      }

      if ( !isNaN( b ) ) {
        return -1;
      }

      return 0;
    },

    compare: function ( a, b, safe, T ) {
      if ( a && a.$boxed ) {
        a = Bridge.unbox( a, true );
      }

      if ( b && b.$boxed ) {
        b = Bridge.unbox( b, true );
      }

      if ( typeof a === "number" && typeof b === "number" ) {
        return Bridge.numberCompare( a, b );
      }

      if ( !Bridge.isDefined( a, true ) ) {
        if ( safe ) {
          return 0;
        }

        throw new System.NullReferenceException();
      } else if ( Bridge.isString( a ) ) {
        return System.String.compare( a, b );
      } else if ( Bridge.isNumber( a ) || Bridge.isBoolean( a ) ) {
        return a < b ? -1 : ( a > b ? 1 : 0 );
      } else if ( Bridge.isDate( a ) ) {
        if ( a.kind !== undefined && a.ticks !== undefined ) {
          return Bridge.compare( System.DateTime.getTicks( a ), System.DateTime.getTicks( b ) );
        }

        return Bridge.compare( a.valueOf(), b.valueOf() );
      }

      var name;

      if ( T && Bridge.isFunction( Bridge.getProperty( a, name = "System$IComparable$1$" + Bridge.getTypeAlias( T ) + "$compareTo" ) ) ) {
        return a[name]( b );
      }

      if ( T && Bridge.isFunction( Bridge.getProperty( a, name = "System$IComparable$1$compareTo" ) ) ) {
        return a[name]( b );
      }

      if ( Bridge.isFunction( Bridge.getProperty( a, name = "System$IComparable$compareTo" ) ) ) {
        return a[name]( b );
      }

      if ( Bridge.isFunction( a.compareTo ) ) {
        return a.compareTo( b );
      }

      if ( T && Bridge.isFunction( Bridge.getProperty( b, name = "System$IComparable$1$" + Bridge.getTypeAlias( T ) + "$compareTo" ) ) ) {
        return -b[name]( a );
      }

      if ( T && Bridge.isFunction( Bridge.getProperty( b, name = "System$IComparable$1$compareTo" ) ) ) {
        return -b[name]( a );
      }

      if ( Bridge.isFunction( Bridge.getProperty( b, name = "System$IComparable$compareTo" ) ) ) {
        return -b[name]( a );
      }

      if ( Bridge.isFunction( b.compareTo ) ) {
        return -b.compareTo( a );
      }

      if ( safe ) {
        return 0;
      }

      throw new System.Exception( "Cannot compare items" );
    },

    equalsT: function ( a, b, T ) {
      if ( a && a.$boxed && a.type.equalsT && a.type.equalsT.length === 2 ) {
        return a.type.equalsT( a, b );
      }

      if ( b && b.$boxed && b.type.equalsT && b.type.equalsT.length === 2 ) {
        return b.type.equalsT( b, a );
      }

      if ( !Bridge.isDefined( a, true ) ) {
        throw new System.NullReferenceException();
      } else if ( Bridge.isNumber( a ) || Bridge.isString( a ) || Bridge.isBoolean( a ) ) {
        return a === b;
      } else if ( Bridge.isDate( a ) ) {
        if ( a.kind !== undefined && a.ticks !== undefined ) {
          return System.DateTime.getTicks( a ).equals( System.DateTime.getTicks( b ) );
        }

        return a.valueOf() === b.valueOf();
      }

      var name;

      if ( T && a != null && Bridge.isFunction( Bridge.getProperty( a, name = "System$IEquatable$1$" + Bridge.getTypeAlias( T ) + "$equalsT" ) ) ) {
        return a[name]( b );
      }

      if ( T && b != null && Bridge.isFunction( Bridge.getProperty( b, name = "System$IEquatable$1$" + Bridge.getTypeAlias( T ) + "$equalsT" ) ) ) {
        return b[name]( a );
      }

      if ( Bridge.isFunction( a ) && Bridge.isFunction( b ) ) {
        return Bridge.fn.equals.call( a, b );
      }

      return a.equalsT ? a.equalsT( b ) : b.equalsT( a );
    },

    format: function ( obj, formatString, provider ) {
      if ( obj && obj.$boxed ) {
        if ( obj.type.$kind === "enum" ) {
          return System.Enum.format( obj.type, obj.v, formatString );
        } else if ( obj.type === System.Char ) {
          return System.Char.format( Bridge.unbox( obj, true ), formatString, provider );
        } else if ( obj.type.format ) {
          return obj.type.format( Bridge.unbox( obj, true ), formatString, provider );
        }
      }

      if ( Bridge.isNumber( obj ) ) {
        return Bridge.Int.format( obj, formatString, provider );
      } else if ( Bridge.isDate( obj ) ) {
        return System.DateTime.format( obj, formatString, provider );
      }

      var name;

      if ( Bridge.isFunction( Bridge.getProperty( obj, name = "System$IFormattable$format" ) ) ) {
        return obj[name]( formatString, provider );
      }

      return obj.format( formatString, provider );
    },

    getType: function ( instance, T ) {
      if ( instance && instance.$boxed ) {
        return instance.type;
      }

      if ( instance == null ) {
        throw new System.NullReferenceException.$ctor1( "instance is null" );
      }

      if ( T ) {
        var type = Bridge.getType( instance );
        return Bridge.Reflection.isAssignableFrom( T, type ) ? type : T;
      }

      if ( typeof ( instance ) === "number" ) {
        if ( !isNaN( instance ) && isFinite( instance ) && Math.floor( instance, 0 ) === instance ) {
          return System.Int32;
        } else {
          return System.Double;
        }
      }

      if ( instance.$type ) {
        return instance.$type;
      }

      if ( instance.$getType ) {
        return instance.$getType();
      }

      var result = null;

      try {
        result = instance.constructor;
      } catch ( ex ) {
        result = Object;
      }

      if ( result === Object ) {
        var str = instance.toString(),
          match = ( /\[object (.{1,})\]/ ).exec( str ),
          name = ( match && match.length > 1 ) ? match[1] : "Object";

        if ( name != "Object" ) {
          result = instance;
        }
      }

      return Bridge.Reflection.convertType( result );
    },

    isLower: function ( c ) {
      var s = String.fromCharCode( c );

      return s === s.toLowerCase() && s !== s.toUpperCase();
    },

    isUpper: function ( c ) {
      var s = String.fromCharCode( c );

      return s !== s.toLowerCase() && s === s.toUpperCase();
    },

    coalesce: function ( a, b ) {
      return Bridge.hasValue( a ) ? a : b;
    },

    fn: {
      equals: function ( fn ) {
        if ( this === fn ) {
          return true;
        }

        if ( fn == null || ( this.constructor !== fn.constructor ) ) {
          return false;
        }

        if ( this.$invocationList && fn.$invocationList ) {
          if ( this.$invocationList.length !== fn.$invocationList.length ) {
            return false;
          }

          for ( var i = 0; i < this.$invocationList.length; i++ ) {
            if ( this.$invocationList[i] !== fn.$invocationList[i] ) {
              return false;
            }
          }

          return true;
        }

        return this.equals && ( this.equals === fn.equals ) && this.$method && ( this.$method === fn.$method ) && this.$scope && ( this.$scope === fn.$scope );
      },

      call: function ( obj, fnName ) {
        var args = Array.prototype.slice.call( arguments, 2 );

        obj = obj || Bridge.global;

        return obj[fnName].apply( obj, args );
      },

      makeFn: function ( fn, length ) {
        switch ( length ) {
          case 0:
            return function () {
              return fn.apply( this, arguments );
            };
          case 1:
            return function ( a ) {
              return fn.apply( this, arguments );
            };
          case 2:
            return function ( a, b ) {
              return fn.apply( this, arguments );
            };
          case 3:
            return function ( a, b, c ) {
              return fn.apply( this, arguments );
            };
          case 4:
            return function ( a, b, c, d ) {
              return fn.apply( this, arguments );
            };
          case 5:
            return function ( a, b, c, d, e ) {
              return fn.apply( this, arguments );
            };
          case 6:
            return function ( a, b, c, d, e, f ) {
              return fn.apply( this, arguments );
            };
          case 7:
            return function ( a, b, c, d, e, f, g ) {
              return fn.apply( this, arguments );
            };
          case 8:
            return function ( a, b, c, d, e, f, g, h ) {
              return fn.apply( this, arguments );
            };
          case 9:
            return function ( a, b, c, d, e, f, g, h, i ) {
              return fn.apply( this, arguments );
            };
          case 10:
            return function ( a, b, c, d, e, f, g, h, i, j ) {
              return fn.apply( this, arguments );
            };
          case 11:
            return function ( a, b, c, d, e, f, g, h, i, j, k ) {
              return fn.apply( this, arguments );
            };
          case 12:
            return function ( a, b, c, d, e, f, g, h, i, j, k, l ) {
              return fn.apply( this, arguments );
            };
          case 13:
            return function ( a, b, c, d, e, f, g, h, i, j, k, l, m ) {
              return fn.apply( this, arguments );
            };
          case 14:
            return function ( a, b, c, d, e, f, g, h, i, j, k, l, m, n ) {
              return fn.apply( this, arguments );
            };
          case 15:
            return function ( a, b, c, d, e, f, g, h, i, j, k, l, m, n, o ) {
              return fn.apply( this, arguments );
            };
          case 16:
            return function ( a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p ) {
              return fn.apply( this, arguments );
            };
          case 17:
            return function ( a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q ) {
              return fn.apply( this, arguments );
            };
          case 18:
            return function ( a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r ) {
              return fn.apply( this, arguments );
            };
          case 19:
            return function ( a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s ) {
              return fn.apply( this, arguments );
            };
          default:
            return function ( a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t ) {
              return fn.apply( this, arguments );
            };
        }
      },

      cacheBind: function ( obj, method, args, appendArgs ) {
        return Bridge.fn.bind( obj, method, args, appendArgs, true );
      },

      bind: function ( obj, method, args, appendArgs, cache ) {
        if ( method && method.$method === method && method.$scope === obj ) {
          return method;
        }

        if ( obj && cache && obj.$$bind ) {
          for ( var i = 0; i < obj.$$bind.length; i++ ) {
            if ( obj.$$bind[i].$method === method ) {
              return obj.$$bind[i];
            }
          }
        }

        var fn;

        if ( arguments.length === 2 ) {
          fn = Bridge.fn.makeFn( function () {
            Bridge.caller.unshift( this );

            var result = null;

            try {
              result = method.apply( obj, arguments );
            } finally {
              Bridge.caller.shift( this );
            }

            return result;
          }, method.length );
        } else {
          fn = Bridge.fn.makeFn( function () {
            var callArgs = args || arguments;

            if ( appendArgs === true ) {
              callArgs = Array.prototype.slice.call( arguments, 0 );
              callArgs = callArgs.concat( args );
            } else if ( typeof appendArgs === "number" ) {
              callArgs = Array.prototype.slice.call( arguments, 0 );

              if ( appendArgs === 0 ) {
                callArgs.unshift.apply( callArgs, args );
              } else if ( appendArgs < callArgs.length ) {
                callArgs.splice.apply( callArgs, [appendArgs, 0].concat( args ) );
              } else {
                callArgs.push.apply( callArgs, args );
              }
            }

            Bridge.caller.unshift( this );

            var result = null;

            try {
              result = method.apply( obj, callArgs );
            } finally {
              Bridge.caller.shift( this );
            }

            return result;
          }, method.length );
        }

        if ( obj && cache ) {
          obj.$$bind = obj.$$bind || [];
          obj.$$bind.push( fn );
        }

        fn.$method = method;
        fn.$scope = obj;
        fn.equals = Bridge.fn.equals;

        return fn;
      },

      bindScope: function ( obj, method ) {
        var fn = Bridge.fn.makeFn( function () {
          var callArgs = Array.prototype.slice.call( arguments, 0 );

          callArgs.unshift.apply( callArgs, [obj] );

          Bridge.caller.unshift( this );

          var result = null;

          try {
            result = method.apply( obj, callArgs );
          } finally {
            Bridge.caller.shift( this );
          }

          return result;
        }, method.length );

        fn.$method = method;
        fn.$scope = obj;
        fn.equals = Bridge.fn.equals;

        return fn;
      },

      $build: function ( handlers ) {
        if ( !handlers || handlers.length === 0 ) {
          return null;
        }

        var fn = function () {
          var result = null,
            i,
            handler;

          for ( i = 0; i < handlers.length; i++ ) {
            handler = handlers[i];
            result = handler.apply( null, arguments );
          }

          return result;
        };

        fn.$invocationList = handlers ? Array.prototype.slice.call( handlers, 0 ) : [];
        handlers = fn.$invocationList.slice();

        return fn;
      },

      combine: function ( fn1, fn2 ) {
        if ( !fn1 || !fn2 ) {
          var fn = fn1 || fn2;

          return fn ? Bridge.fn.$build( [fn] ) : fn;
        }

        var list1 = fn1.$invocationList ? fn1.$invocationList : [fn1],
          list2 = fn2.$invocationList ? fn2.$invocationList : [fn2];

        return Bridge.fn.$build( list1.concat( list2 ) );
      },

      getInvocationList: function ( fn ) {
        if ( fn == null ) {
          throw new System.ArgumentNullException();
        }

        if ( !fn.$invocationList ) {
          fn.$invocationList = [fn];
        }

        return fn.$invocationList;
      },

      remove: function ( fn1, fn2 ) {
        if ( !fn1 || !fn2 ) {
          return fn1 || null;
        }

        var list1 = fn1.$invocationList ? fn1.$invocationList.slice( 0 ) : [fn1],
          list2 = fn2.$invocationList ? fn2.$invocationList : [fn2],
          result = [],
          exclude,
          i,
          j;

        exclude = -1;

        for ( i = list1.length - list2.length; i >= 0; i-- ) {
          if ( Bridge.fn.equalInvocationLists( list1, list2, i, list2.length ) ) {
            if ( list1.length - list2.length == 0 ) {
              return null;
            } else if ( list1.length - list2.length == 1 ) {
              return list1[i != 0 ? 0 : list1.length - 1];
            } else {
              list1.splice( i, list2.length );

              return Bridge.fn.$build( list1 );
            }
          }
        }

        return fn1;
      },

      equalInvocationLists: function ( a, b, start, count ) {
        for ( var i = 0; i < count; i = ( i + 1 ) | 0 ) {
          if ( !( Bridge.equals( a[System.Array.index( ( ( start + i ) | 0 ), a )], b[System.Array.index( i, b )] ) ) ) {
            return false;
          }
        }

        return true;
      },
    },

    sleep: function ( ms, timeout ) {
      if ( Bridge.hasValue( timeout ) ) {
        ms = timeout.getTotalMilliseconds();
      }

      if ( isNaN( ms ) || ms < -1 || ms > 2147483647 ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "timeout", "Number must be either non-negative and less than or equal to Int32.MaxValue or -1" );
      }

      if ( ms == -1 ) {
        ms = 2147483647;
      }

      var start = new Date().getTime();

      while ( ( new Date().getTime() - start ) < ms ) {
        if ( ( new Date().getTime() - start ) > 2147483647 ) {
          break;
        }
      }
    },

    getMetadata: function ( t ) {
      var m = t.$getMetadata ? t.$getMetadata() : t.$metadata;

      return m;
    },

    loadModule: function ( config, callback ) {
      var amd = config.amd,
        cjs = config.cjs,
        fnName = config.fn;

      var tcs = new System.Threading.Tasks.TaskCompletionSource(),
        fn = Bridge.global[fnName || "require"];

      if ( amd && amd.length > 0 ) {
        fn( amd, function () {
          var loads = Array.prototype.slice.call( arguments, 0 );

          if ( cjs && cjs.length > 0 ) {
            for ( var i = 0; i < cjs.length; i++ ) {
              loads.push( fn( cjs[i] ) );
            }
          }

          callback.apply( Bridge.global, loads );
          tcs.setResult();
        } );
      } else if ( cjs && cjs.length > 0 ) {
        var t = new System.Threading.Tasks.Task();
        t.status = System.Threading.Tasks.TaskStatus.ranToCompletion;

        var loads = [];

        for ( var j = 0; j < cjs.length; j++ ) {
          loads.push( fn( cjs[j] ) );
        }

        callback.apply( Bridge.global, loads );

        return t;
      } else {
        var t = new System.Threading.Tasks.Task();
        t.status = System.Threading.Tasks.TaskStatus.ranToCompletion;

        return t;
      }

      return tcs.task;
    }
  };

  if ( !globals.setImmediate ) {
    core.setImmediate = ( function () {
      var head = {},
        tail = head;

      var id = Math.random();

      function onmessage( e ) {
        if ( e.data != id ) {
          return;
        }

        head = head.next;
        var func = head.func;
        delete head.func;
        func();
      }

      if ( typeof window !== "undefined" ) {
        if ( window.addEventListener ) {
          window.addEventListener( "message", onmessage );
        } else {
          window.attachEvent( "onmessage", onmessage );
        }
      }

      return function ( func ) {
        tail = tail.next = { func: func };

        if ( typeof window !== "undefined" ) {
          window.postMessage( id, "*" );
        }
      };
    }() );
  } else {
    core.setImmediate = globals.setImmediate.bind( globals );
  }

  globals.Bridge = core;
  globals.Bridge.caller = [];
  globals.Bridge.$equalsGuard = [];
  globals.Bridge.$toStringGuard = [];

  if ( globals.console ) {
    globals.Bridge.Console = globals.console;
  }

  globals.System = {};
  globals.System.Diagnostics = {};
  globals.System.Diagnostics.Contracts = {};
  globals.System.Threading = {};

  // @source Browser.js

  var check = function ( regex ) {
    return Bridge.global.navigator && regex.test( Bridge.global.navigator.userAgent.toLowerCase() );
  },

    isStrict = Bridge.global.document && Bridge.global.document.compatMode === "CSS1Compat",

    version = function ( is, regex ) {
      var m;

      return Bridge.global.navigator && ( is && ( m = regex.exec( navigator.userAgent.toLowerCase() ) ) ) ? parseFloat( m[1] ) : 0;
    },

    docMode = Bridge.global.document ? Bridge.global.document.documentMode : null,
    isOpera = check( /opera/ ),
    isOpera10_5 = isOpera && check( /version\/10\.5/ ),
    isChrome = check( /\bchrome\b/ ),
    isWebKit = check( /webkit/ ),
    isSafari = !isChrome && check( /safari/ ),
    isSafari2 = isSafari && check( /applewebkit\/4/ ),
    isSafari3 = isSafari && check( /version\/3/ ),
    isSafari4 = isSafari && check( /version\/4/ ),
    isSafari5_0 = isSafari && check( /version\/5\.0/ ),
    isSafari5 = isSafari && check( /version\/5/ ),
    isIE = !isOpera && ( check( /msie/ ) || check( /trident/ ) ),
    isIE7 = isIE && ( ( check( /msie 7/ ) && docMode !== 8 && docMode !== 9 && docMode !== 10 ) || docMode === 7 ),
    isIE8 = isIE && ( ( check( /msie 8/ ) && docMode !== 7 && docMode !== 9 && docMode !== 10 ) || docMode === 8 ),
    isIE9 = isIE && ( ( check( /msie 9/ ) && docMode !== 7 && docMode !== 8 && docMode !== 10 ) || docMode === 9 ),
    isIE10 = isIE && ( ( check( /msie 10/ ) && docMode !== 7 && docMode !== 8 && docMode !== 9 ) || docMode === 10 ),
    isIE11 = isIE && ( ( check( /trident\/7\.0/ ) && docMode !== 7 && docMode !== 8 && docMode !== 9 && docMode !== 10 ) || docMode === 11 ),
    isIE6 = isIE && check( /msie 6/ ),
    isGecko = !isWebKit && !isIE && check( /gecko/ ),
    isGecko3 = isGecko && check( /rv:1\.9/ ),
    isGecko4 = isGecko && check( /rv:2\.0/ ),
    isGecko5 = isGecko && check( /rv:5\./ ),
    isGecko10 = isGecko && check( /rv:10\./ ),
    isFF3_0 = isGecko3 && check( /rv:1\.9\.0/ ),
    isFF3_5 = isGecko3 && check( /rv:1\.9\.1/ ),
    isFF3_6 = isGecko3 && check( /rv:1\.9\.2/ ),
    isWindows = check( /windows|win32/ ),
    isMac = check( /macintosh|mac os x/ ),
    isLinux = check( /linux/ ),
    scrollbarSize = null,
    chromeVersion = version( true, /\bchrome\/(\d+\.\d+)/ ),
    firefoxVersion = version( true, /\bfirefox\/(\d+\.\d+)/ ),
    ieVersion = version( isIE, /msie (\d+\.\d+)/ ),
    operaVersion = version( isOpera, /version\/(\d+\.\d+)/ ),
    safariVersion = version( isSafari, /version\/(\d+\.\d+)/ ),
    webKitVersion = version( isWebKit, /webkit\/(\d+\.\d+)/ ),
    isSecure = Bridge.global.location ? /^https/i.test( Bridge.global.location.protocol ) : false,
    isiPhone = Bridge.global.navigator && /iPhone/i.test( Bridge.global.navigator.platform ),
    isiPod = Bridge.global.navigator && /iPod/i.test( Bridge.global.navigator.platform ),
    isiPad = Bridge.global.navigator && /iPad/i.test( Bridge.global.navigator.userAgent ),
    isBlackberry = Bridge.global.navigator && /Blackberry/i.test( Bridge.global.navigator.userAgent ),
    isAndroid = Bridge.global.navigator && /Android/i.test( Bridge.global.navigator.userAgent ),
    isDesktop = isMac || isWindows || ( isLinux && !isAndroid ),
    isTablet = isiPad,
    isPhone = !isDesktop && !isTablet;

  var browser = {
    isStrict: isStrict,
    isIEQuirks: isIE && ( !isStrict && ( isIE6 || isIE7 || isIE8 || isIE9 ) ),
    isOpera: isOpera,
    isOpera10_5: isOpera10_5,
    isWebKit: isWebKit,
    isChrome: isChrome,
    isSafari: isSafari,
    isSafari3: isSafari3,
    isSafari4: isSafari4,
    isSafari5: isSafari5,
    isSafari5_0: isSafari5_0,
    isSafari2: isSafari2,
    isIE: isIE,
    isIE6: isIE6,
    isIE7: isIE7,
    isIE7m: isIE6 || isIE7,
    isIE7p: isIE && !isIE6,
    isIE8: isIE8,
    isIE8m: isIE6 || isIE7 || isIE8,
    isIE8p: isIE && !( isIE6 || isIE7 ),
    isIE9: isIE9,
    isIE9m: isIE6 || isIE7 || isIE8 || isIE9,
    isIE9p: isIE && !( isIE6 || isIE7 || isIE8 ),
    isIE10: isIE10,
    isIE10m: isIE6 || isIE7 || isIE8 || isIE9 || isIE10,
    isIE10p: isIE && !( isIE6 || isIE7 || isIE8 || isIE9 ),
    isIE11: isIE11,
    isIE11m: isIE6 || isIE7 || isIE8 || isIE9 || isIE10 || isIE11,
    isIE11p: isIE && !( isIE6 || isIE7 || isIE8 || isIE9 || isIE10 ),
    isGecko: isGecko,
    isGecko3: isGecko3,
    isGecko4: isGecko4,
    isGecko5: isGecko5,
    isGecko10: isGecko10,
    isFF3_0: isFF3_0,
    isFF3_5: isFF3_5,
    isFF3_6: isFF3_6,
    isFF4: 4 <= firefoxVersion && firefoxVersion < 5,
    isFF5: 5 <= firefoxVersion && firefoxVersion < 6,
    isFF10: 10 <= firefoxVersion && firefoxVersion < 11,
    isLinux: isLinux,
    isWindows: isWindows,
    isMac: isMac,
    chromeVersion: chromeVersion,
    firefoxVersion: firefoxVersion,
    ieVersion: ieVersion,
    operaVersion: operaVersion,
    safariVersion: safariVersion,
    webKitVersion: webKitVersion,
    isSecure: isSecure,
    isiPhone: isiPhone,
    isiPod: isiPod,
    isiPad: isiPad,
    isBlackberry: isBlackberry,
    isAndroid: isAndroid,
    isDesktop: isDesktop,
    isTablet: isTablet,
    isPhone: isPhone,
    iOS: isiPhone || isiPad || isiPod,
    standalone: Bridge.global.navigator ? !!Bridge.global.navigator.standalone : false
  };

  Bridge.Browser = browser;

  // @source Class.js

  var base = {
    _initialize: function () {
      if ( this.$init ) {
        return;
      }

      this.$init = {};

      if ( this.$staticInit ) {
        this.$staticInit();
      }

      if ( this.$initMembers ) {
        this.$initMembers();
      }
    },

    initConfig: function ( extend, base, config, statics, scope, prototype ) {
      var initFn,
        name,
        cls = ( statics ? scope : scope.ctor ),
        descriptors = cls.$descriptors,
        aliases = cls.$aliases;

      if ( config.fields ) {
        for ( name in config.fields ) {
          scope[name] = config.fields[name];
        }
      }

      var props = config.properties;
      if ( props ) {
        for ( name in props ) {
          var v = props[name],
            d,
            cfg;

          if ( v != null && Bridge.isPlainObject( v ) && ( !v.get || !v.set ) ) {
            for ( var k = 0; k < descriptors.length; k++ ) {
              if ( descriptors[k].name === name ) {
                d = descriptors[k];
              }
            }

            if ( d && d.get && !v.get ) {
              v.get = d.get;
            }

            if ( d && d.set && !v.set ) {
              v.set = d.set;
            }
          }

          cfg = Bridge.property( statics ? scope : prototype, name, v, statics, cls );
          cfg.name = name;
          cfg.cls = cls;

          descriptors.push( cfg );
        }
      }

      if ( config.events ) {
        for ( name in config.events ) {
          Bridge.event( scope, name, config.events[name], statics );
        }
      }

      if ( config.alias ) {
        for ( var i = 0; i < config.alias.length; i++ ) {
          ( function ( obj, name, alias, cls ) {
            var descriptor = null;

            for ( var i = descriptors.length - 1; i >= 0; i-- ) {
              if ( descriptors[i].name === name ) {
                descriptor = descriptors[i];

                break;
              }
            }

            var arr = Array.isArray( alias ) ? alias : [alias];

            for ( var j = 0; j < arr.length; j++ ) {
              alias = arr[j];

              if ( descriptor != null ) {
                Object.defineProperty( obj, alias, descriptor );
                aliases.push( { alias: alias, descriptor: descriptor } );
              } else {
                var m;

                if ( scope.hasOwnProperty( name ) || !prototype ) {
                  m = scope[name];

                  if ( m === undefined && prototype ) {
                    m = prototype[name];
                  }
                } else {
                  m = prototype[name];

                  if ( m === undefined ) {
                    m = scope[name];
                  }
                }

                if ( !Bridge.isFunction( m ) ) {
                  descriptor = {
                    get: function () {
                      return this[name];
                    },

                    set: function ( value ) {
                      this[name] = value;
                    }
                  };
                  Object.defineProperty( obj, alias, descriptor );
                  aliases.push( { alias: alias, descriptor: descriptor } );
                } else {
                  obj[alias] = m;
                  aliases.push( { fn: name, alias: alias } );
                }
              }
            }
          } )( statics ? scope : prototype, config.alias[i], config.alias[i + 1], cls );

          i++;
        }
      }

      if ( config.init ) {
        initFn = config.init;
      }

      if ( initFn || ( extend && !statics && base.$initMembers ) ) {
        scope.$initMembers = function () {
          if ( extend && !statics && base.$initMembers ) {
            base.$initMembers.call( this );
          }

          if ( initFn ) {
            initFn.call( this );
          }
        };
      }
    },

    convertScheme: function ( obj ) {
      var result = {},
        copy = function ( obj, to ) {

          var reserved = ["fields", "methods", "events", "props", "properties", "alias", "ctors"],
            keys = Object.keys( obj );

          for ( var i = 0; i < keys.length; i++ ) {
            var name = keys[i];

            if ( reserved.indexOf( name ) === -1 ) {
              to[name] = obj[name];
            }
          }

          if ( obj.fields ) {
            Bridge.apply( to, obj.fields );
          }

          if ( obj.methods ) {
            Bridge.apply( to, obj.methods );
          }

          var config = {},
            write = false;

          if ( obj.props ) {
            config.properties = obj.props;
            write = true;
          } else if ( obj.properties ) {
            config.properties = obj.properties;
            write = true;
          }

          if ( obj.events ) {
            config.events = obj.events;
            write = true;
          }

          if ( obj.alias ) {
            config.alias = obj.alias;
            write = true;
          }

          if ( obj.ctors ) {
            if ( obj.ctors.init ) {
              config.init = obj.ctors.init;
              write = true;
              delete obj.ctors.init;
            }

            Bridge.apply( to, obj.ctors );
          }

          if ( write ) {
            to.$config = config;
          }
        };

      if ( obj.main ) {
        result.$main = obj.main;
        delete obj.main;
      }

      copy( obj, result );

      if ( obj.statics || obj.$statics ) {
        result.$statics = {};
        copy( obj.statics || obj.$statics, result.$statics );
      }

      return result;
    },

    definei: function ( className, gscope, prop ) {
      if ( ( prop === true || !prop ) && gscope ) {
        gscope.$kind = "interface";
      } else if ( prop ) {
        prop.$kind = "interface";
      } else {
        gscope = { $kind: "interface" };
      }

      var c = Bridge.define( className, gscope, prop );

      c.$kind = "interface";
      c.$isInterface = true;

      return c;
    },

    // Create a new Class that inherits from this class
    define: function ( className, gscope, prop, gCfg ) {
      var isGenericInstance = false;

      if ( prop === true ) {
        isGenericInstance = true;
        prop = gscope;
        gscope = Bridge.global;
      } else if ( !prop ) {
        prop = gscope;
        gscope = Bridge.global;
      }

      var fn;

      if ( Bridge.isFunction( prop ) ) {
        fn = function () {
          var args,
            key,
            obj,
            c;

          key = Bridge.Class.getCachedType( fn, arguments );

          if ( key ) {
            return key.type;
          }

          args = Array.prototype.slice.call( arguments );
          obj = prop.apply( null, args );
          c = Bridge.define( Bridge.Class.genericName( className, args ), obj, true, { fn: fn, args: args } );

          if ( !Bridge.Class.staticInitAllow && !Bridge.Class.queueIsBlocked ) {
            Bridge.Class.$queue.push( c );
          }

          return Bridge.get( c );
        };

        fn.$cache = [];

        return Bridge.Class.generic( className, gscope, fn, prop );
      }

      if ( !isGenericInstance ) {
        Bridge.Class.staticInitAllow = false;
      }

      prop = prop || {};
      prop.$kind = prop.$kind || "class";

      var isNested = false;

      if ( prop.$kind.match( "^nested " ) !== null ) {
        isNested = true;
        prop.$kind = prop.$kind.substr( 7 );
      }

      if ( prop.$kind === "enum" && !prop.inherits ) {
        prop.inherits = [System.IComparable, System.IFormattable];
      }

      var rNames = ["fields", "events", "props", "ctors", "methods"],
        defaultScheme = Bridge.isFunction( prop.main ) ? 0 : 1,
        check = function ( scope ) {
          if ( scope.config && Bridge.isPlainObject( scope.config ) ||
            scope.$main && Bridge.isFunction( scope.$main ) ||
            scope.hasOwnProperty( "ctor" ) && Bridge.isFunction( scope.ctor ) ) {
            defaultScheme = 1;

            return false;
          }

          if ( scope.alias && Bridge.isArray( scope.alias ) && scope.alias.length > 0 && scope.alias.length % 2 === 0 ) {
            return true;
          }

          for ( var j = 0; j < rNames.length; j++ ) {
            if ( scope[rNames[j]] && Bridge.isPlainObject( scope[rNames[j]] ) ) {
              return true;
            }
          }

          return false;
        },
        alternateScheme = check( prop );

      if ( !alternateScheme && prop.statics ) {
        alternateScheme = check( prop.statics );
      }

      if ( !alternateScheme ) {
        alternateScheme = defaultScheme == 0;
      }

      if ( alternateScheme ) {
        prop = Bridge.Class.convertScheme( prop );
      }

      var extend = prop.$inherits || prop.inherits,
        statics = prop.$statics || prop.statics,
        isEntryPoint = prop.$entryPoint,
        base,
        prototype,
        scope = prop.$scope || gscope || Bridge.global,
        objectType = Bridge.global.System && Bridge.global.System.Object || Object,
        i,
        v,
        isCtor,
        ctorName,
        name,
        registerT = true;

      if ( prop.$kind === "enum" ) {
        extend = [System.Enum];
      }

      if ( prop.$noRegister === true ) {
        registerT = false;
        delete prop.$noRegister;
      }

      if ( prop.$inherits ) {
        delete prop.$inherits;
      } else {
        delete prop.inherits;
      }

      if ( isEntryPoint ) {
        delete prop.$entryPoint;
      }

      if ( Bridge.isFunction( statics ) ) {
        statics = null;
      } else if ( prop.$statics ) {
        delete prop.$statics;
      } else {
        delete prop.statics;
      }

      var Class,
        cls = prop.hasOwnProperty( "ctor" ) && prop.ctor;

      if ( !cls ) {
        if ( prop.$literal ) {
          Class = function ( obj ) {
            obj = obj || {};
            obj.$getType = function () { return Class; };

            return obj;
          };
        } else {
          Class = function () {
            this.$initialize();

            if ( Class.$base ) {
              if ( Class.$$inherits && Class.$$inherits.length > 0 && Class.$$inherits[0].$staticInit ) {
                Class.$$inherits[0].$staticInit();
              }

              if ( Class.$base.ctor ) {
                Class.$base.ctor.call( this );
              } else if ( Bridge.isFunction( Class.$base.constructor ) ) {
                Class.$base.constructor.call( this );
              }
            }
          };
        }

        prop.ctor = Class;
      } else {
        Class = cls;
      }

      if ( prop.$literal ) {
        if ( ( !statics || !statics.createInstance ) ) {
          Class.createInstance = function () {
            var obj = {};

            obj.$getType = function () { return Class; };

            return obj;
          };
        }

        Class.$literal = true;
        delete prop.$literal;
      }

      if ( !isGenericInstance && registerT ) {
        scope = Bridge.Class.set( scope, className, Class );
      }

      if ( gCfg ) {
        gCfg.fn.$cache.push( { type: Class, args: gCfg.args } );
      }

      Class.$$name = className;

      if ( isNested ) {
        var lastIndex = Class.$$name.lastIndexOf( "." );

        Class.$$name = Class.$$name.substr( 0, lastIndex ) + "+" + Class.$$name.substr( lastIndex + 1 );
      }

      Class.$kind = prop.$kind;

      if ( prop.$module ) {
        Class.$module = prop.$module;
      }

      if ( prop.$metadata ) {
        Class.$metadata = prop.$metadata;
      }

      if ( gCfg && isGenericInstance ) {
        Class.$genericTypeDefinition = gCfg.fn;
        Class.$typeArguments = gCfg.args;
        Class.$assembly = gCfg.fn.$assembly || Bridge.$currentAssembly;

        var result = Bridge.Reflection.getTypeFullName( gCfg.fn );

        for ( i = 0; i < gCfg.args.length; i++ ) {
          result += ( i === 0 ? "[" : "," ) + "[" + Bridge.Reflection.getTypeQName( gCfg.args[i] ) + "]";
        }

        result += "]";

        Class.$$fullname = result;
      } else {
        Class.$$fullname = Class.$$name;
      }

      if ( extend && Bridge.isFunction( extend ) ) {
        extend = extend();
      }

      Bridge.Class.createInheritors( Class, extend );

      var noBase = extend ? extend[0].$kind === "interface" : true;

      if ( noBase ) {
        extend = null;
      }

      base = extend ? extend[0].prototype : this.prototype;
      Class.$base = base;

      if ( extend && !extend[0].$$initCtor ) {
        var cls = extend[0];
        var $$initCtor = function () { };
        $$initCtor.prototype = cls.prototype;
        $$initCtor.prototype.constructor = cls;
        $$initCtor.prototype.$$fullname = Bridge.Reflection.getTypeFullName( cls );

        prototype = new $$initCtor();
      }
      else {
        prototype = extend ? new extend[0].$$initCtor() : ( objectType.$$initCtor ? new objectType.$$initCtor() : new objectType() );
      }

      Class.$$initCtor = function () { };
      Class.$$initCtor.prototype = prototype;
      Class.$$initCtor.prototype.constructor = Class;
      Class.$$initCtor.prototype.$$fullname = gCfg && isGenericInstance ? Class.$$fullname : Class.$$name;

      if ( statics ) {
        var staticsConfig = statics.$config || statics.config;

        if ( staticsConfig && !Bridge.isFunction( staticsConfig ) ) {
          Bridge.Class.initConfig( extend, base, staticsConfig, true, Class );

          if ( statics.$config ) {
            delete statics.$config;
          } else {
            delete statics.config;
          }
        }
      }

      var instanceConfig = prop.$config || prop.config;

      if ( instanceConfig && !Bridge.isFunction( instanceConfig ) ) {
        Bridge.Class.initConfig( extend, base, instanceConfig, false, prop, prototype );

        if ( prop.$config ) {
          delete prop.$config;
        } else {
          delete prop.config;
        }
      } else if ( extend && base.$initMembers ) {
        prop.$initMembers = function () {
          base.$initMembers.call( this );
        };
      }

      prop.$initialize = Bridge.Class._initialize;

      var keys = [];

      for ( name in prop ) {
        keys.push( name );
      }

      for ( i = 0; i < keys.length; i++ ) {
        name = keys[i];

        v = prop[name];
        isCtor = name === "ctor";
        ctorName = name;

        if ( Bridge.isFunction( v ) && ( isCtor || name.match( "^\\$ctor" ) !== null ) ) {
          isCtor = true;
        }

        var member = prop[name];

        if ( isCtor ) {
          Class[ctorName] = member;
          Class[ctorName].prototype = prototype;
          Class[ctorName].prototype.constructor = Class;
          prototype[ctorName] = member;
        } else {
          prototype[ctorName] = member;
        }
      }

      prototype.$$name = className;

      if ( !prototype.toJSON ) {
        prototype.toJSON = Bridge.Class.toJSON;
      }

      if ( statics ) {
        for ( name in statics ) {
          var member = statics[name];

          if ( name === "ctor" ) {
            Class["$ctor"] = member;
          } else {
            if ( prop.$kind === "enum" && !Bridge.isFunction( member ) && name.charAt( 0 ) !== "$" ) {
              Class.$names = Class.$names || [];
              Class.$names.push( { name: name, value: member } );
            }

            Class[name] = member;
          }
        }

        if ( prop.$kind === "enum" && Class.$names ) {
          Class.$names = Class.$names.sort( function ( i1, i2 ) {
            if ( Bridge.isFunction( i1.value.eq ) ) {
              return i1.value.sub( i2.value ).sign();
            }

            return i1.value - i2.value;
          } ).map( function ( i ) {
            return i.name;
          } );
        }
      }

      if ( !extend ) {
        extend = [objectType].concat( Class.$interfaces );
      }

      Bridge.Class.setInheritors( Class, extend );

      fn = function () {
        if ( Bridge.Class.staticInitAllow && !Class.$isGenericTypeDefinition ) {
          Class.$staticInit = null;

          if ( Class.$initMembers ) {
            Class.$initMembers();
          }

          if ( Class.$ctor ) {
            Class.$ctor();
          }
        }
      };

      if ( isEntryPoint || Bridge.isFunction( prototype.$main ) ) {
        if ( prototype.$main ) {
          var entryName = prototype.$main.name || "Main";

          if ( !Class[entryName] ) {
            Class[entryName] = prototype.$main;
          }
        }

        Bridge.Class.$queueEntry.push( Class );
      }

      Class.$staticInit = fn;

      if ( !isGenericInstance && registerT ) {
        Bridge.Class.registerType( className, Class );
      }

      if ( Bridge.Reflection ) {
        Class.$getMetadata = Bridge.Reflection.getMetadata;
      }

      if ( Class.$kind === "enum" ) {
        if ( !Class.prototype.$utype ) {
          Class.prototype.$utype = System.Int32;
        }
        Class.$is = function ( instance ) {
          var utype = Class.prototype.$utype;

          if ( utype === String ) {
            return typeof ( instance ) == "string";
          }

          if ( utype && utype.$is ) {
            return utype.$is( instance );
          }

          return typeof ( instance ) == "number";
        };

        Class.getDefaultValue = function () {
          var utype = Class.prototype.$utype;

          if ( utype === String || utype === System.String ) {
            return null;
          }

          return 0;
        };
      }

      if ( Class.$kind === "interface" ) {
        if ( Class.prototype.$variance ) {
          Class.isAssignableFrom = Bridge.Class.varianceAssignable;
        }

        Class.$isInterface = true;
      }

      return Class;
    },

    toCtorString: function () {
      return Bridge.Reflection.getTypeName( this );
    },

    createInheritors: function ( cls, extend ) {
      var interfaces = [],
        baseInterfaces = [],
        descriptors = [],
        aliases = [];

      if ( extend ) {
        for ( var j = 0; j < extend.length; j++ ) {
          var baseType = extend[j],
            baseI = ( baseType.$interfaces || [] ).concat( baseType.$baseInterfaces || [] ),
            baseDescriptors = baseType.$descriptors,
            baseAliases = baseType.$aliases;

          if ( baseDescriptors && baseDescriptors.length > 0 ) {
            for ( var d = 0; d < baseDescriptors.length; d++ ) {
              descriptors.push( baseDescriptors[d] );
            }
          }

          if ( baseAliases && baseAliases.length > 0 ) {
            for ( var d = 0; d < baseAliases.length; d++ ) {
              aliases.push( baseAliases[d] );
            }
          }

          if ( baseI.length > 0 ) {
            for ( var k = 0; k < baseI.length; k++ ) {
              if ( baseInterfaces.indexOf( baseI[k] ) < 0 ) {
                baseInterfaces.push( baseI[k] );
              }
            }
          }

          if ( baseType.$kind === "interface" ) {
            interfaces.push( baseType );
          }
        }
      }

      cls.$descriptors = descriptors;
      cls.$aliases = aliases;
      cls.$baseInterfaces = baseInterfaces;
      cls.$interfaces = interfaces;
      cls.$allInterfaces = interfaces.concat( baseInterfaces );
    },

    toJSON: function () {
      var obj = {},
        t = Bridge.getType( this ),
        descriptors = t.$descriptors || [];

      for ( var key in this ) {
        var own = this.hasOwnProperty( key ),
          descriptor = null;

        if ( !own ) {
          for ( var i = descriptors.length - 1; i >= 0; i-- ) {
            if ( descriptors[i].name === key ) {
              descriptor = descriptors[i];

              break;
            }
          }
        }

        var dcount = key.split( "$" ).length;

        if ( ( own || descriptor != null ) && ( dcount === 1 || dcount === 2 && key.match( "\$\d+$" ) ) ) {
          obj[key] = this[key];
        }
      }

      return obj;
    },

    setInheritors: function ( cls, extend ) {
      cls.$$inherits = extend;

      for ( var i = 0; i < extend.length; i++ ) {
        var scope = extend[i];

        if ( !scope.$$inheritors ) {
          scope.$$inheritors = [];
        }

        scope.$$inheritors.push( cls );
      }
    },

    varianceAssignable: function ( source ) {
      var check = function ( target, type ) {
        if ( type.$genericTypeDefinition === target.$genericTypeDefinition && type.$typeArguments.length === target.$typeArguments.length ) {
          for ( var i = 0; i < target.$typeArguments.length; i++ ) {
            var v = target.prototype.$variance[i], t = target.$typeArguments[i], s = type.$typeArguments[i];

            switch ( v ) {
              case 1: if ( !Bridge.Reflection.isAssignableFrom( t, s ) )
                return false;

                break;
              case 2: if ( !Bridge.Reflection.isAssignableFrom( s, t ) )
                return false;

                break;
              default: if ( s !== t )
                return false;
            }
          }

          return true;
        }

        return false;
      };

      if ( source.$kind === "interface" && check( this, source ) ) {
        return true;
      }

      var ifs = Bridge.Reflection.getInterfaces( source );

      for ( var i = 0; i < ifs.length; i++ ) {
        if ( ifs[i] === this || check( this, ifs[i] ) ) {
          return true;
        }
      }

      return false;
    },

    registerType: function ( className, cls ) {
      if ( Bridge.$currentAssembly ) {
        Bridge.$currentAssembly.$types[className] = cls;
        cls.$assembly = Bridge.$currentAssembly;
      }
    },

    addExtend: function ( cls, extend ) {
      var i,
        scope;

      Array.prototype.push.apply( cls.$$inherits, extend );
      cls.$interfaces = cls.$interfaces || [];
      cls.$baseInterfaces = cls.$baseInterfaces || [];

      for ( i = 0; i < extend.length; i++ ) {
        scope = extend[i];

        if ( !scope.$$inheritors ) {
          scope.$$inheritors = [];
        }

        scope.$$inheritors.push( cls );

        var baseI = ( scope.$interfaces || [] ).concat( scope.$baseInterfaces || [] );

        if ( baseI.length > 0 ) {
          for ( var k = 0; k < baseI.length; k++ ) {
            if ( cls.$baseInterfaces.indexOf( baseI[k] ) < 0 ) {
              cls.$baseInterfaces.push( baseI[k] );
            }
          }
        }

        if ( scope.$kind === "interface" ) {
          cls.$interfaces.push( scope );
        }
      }

      cls.$allInterfaces = cls.$interfaces.concat( cls.$baseInterfaces );
    },

    set: function ( scope, className, cls, noDefineProp ) {
      var nameParts = className.split( "." ),
        name,
        key,
        exists,
        i;

      for ( i = 0; i < ( nameParts.length - 1 ); i++ ) {
        if ( typeof scope[nameParts[i]] == "undefined" ) {
          scope[nameParts[i]] = {};
        }

        scope = scope[nameParts[i]];
      }

      name = nameParts[nameParts.length - 1];
      exists = scope[name];

      if ( exists ) {
        if ( exists.$$name === className ) {
          throw "Class '" + className + "' is already defined";
        }

        for ( key in exists ) {
          var o = exists[key];

          if ( typeof o === "function" && o.$$name ) {
            ( function ( cls, key, o ) {
              Object.defineProperty( cls, key, {
                get: function () {
                  if ( Bridge.Class.staticInitAllow ) {
                    if ( o.$staticInit ) {
                      o.$staticInit();
                    }

                    Bridge.Class.defineProperty( cls, key, o );
                  }

                  return o;
                },

                set: function ( newValue ) {
                  o = newValue;
                },

                enumerable: true,

                configurable: true
              } );
            } )( cls, key, o );
          }
        }
      }

      if ( noDefineProp !== true ) {
        ( function ( scope, name, cls ) {
          Object.defineProperty( scope, name, {
            get: function () {
              if ( Bridge.Class.staticInitAllow ) {
                if ( cls.$staticInit ) {
                  cls.$staticInit();
                }

                Bridge.Class.defineProperty( scope, name, cls );
              }

              return cls;
            },

            set: function ( newValue ) {
              cls = newValue;
            },

            enumerable: true,

            configurable: true
          } );
        } )( scope, name, cls );
      } else {
        scope[name] = cls;
      }

      return scope;
    },

    defineProperty: function ( scope, name, cls ) {
      Object.defineProperty( scope, name, {
        value: cls,
        enumerable: true,
        configurable: true
      } );
    },

    genericName: function ( name, typeArguments ) {
      var gName = name;

      for ( var i = 0; i < typeArguments.length; i++ ) {
        var ta = typeArguments[i];

        gName += "$" + ( ta.$$name || Bridge.getTypeName( ta ) );
      }

      return gName;
    },

    getCachedType: function ( fn, args ) {
      var arr = fn.$cache,
        len = arr.length,
        key,
        found,
        i, g;

      for ( i = 0; i < len; i++ ) {
        key = arr[i];

        if ( key.args.length === args.length ) {
          found = true;

          for ( g = 0; g < key.args.length; g++ ) {
            if ( key.args[g] !== args[g] ) {
              found = false;

              break;
            }
          }

          if ( found ) {
            return key;
          }
        }
      }

      return null;
    },

    generic: function ( className, scope, fn, prop ) {
      fn.$$name = className;
      fn.$kind = "class";

      Bridge.Class.set( scope, className, fn, true );
      Bridge.Class.registerType( className, fn );

      fn.$typeArgumentCount = prop.length;
      fn.$isGenericTypeDefinition = true;
      fn.$getMetadata = Bridge.Reflection.getMetadata;

      fn.$staticInit = function () {
        fn.$typeArguments = Bridge.Reflection.createTypeParams( prop );

        var old = Bridge.Class.staticInitAllow,
          oldIsBlocked = Bridge.Class.queueIsBlocked;

        Bridge.Class.staticInitAllow = false;
        Bridge.Class.queueIsBlocked = true;

        var cfg = prop.apply( null, fn.$typeArguments ),
          extend = cfg.$inherits || cfg.inherits;

        Bridge.Class.staticInitAllow = old;
        Bridge.Class.queueIsBlocked = oldIsBlocked;

        if ( extend && Bridge.isFunction( extend ) ) {
          extend = extend();
        }

        Bridge.Class.createInheritors( fn, extend );

        var objectType = Bridge.global.System && Bridge.global.System.Object || Object;

        if ( !extend ) {
          extend = [objectType].concat( fn.$interfaces );
        }

        Bridge.Class.setInheritors( fn, extend );

        var prototype = extend ? ( extend[0].$$initCtor ? new extend[0].$$initCtor() : new extend[0]() ) : new objectType();

        fn.prototype = prototype;
        fn.prototype.constructor = fn;
        fn.$kind = cfg.$kind || "class";

        if ( cfg.$module ) {
          fn.$module = cfg.$module;
        }
      };

      Bridge.Class.$queue.push( fn );

      return fn;
    },

    init: function ( fn ) {
      if ( Bridge.Reflection ) {
        var metas = Bridge.Reflection.deferredMeta,
          len = metas.length;

        if ( len > 0 ) {
          Bridge.Reflection.deferredMeta = [];

          for ( var i = 0; i < len; i++ ) {
            var item = metas[i];

            Bridge.setMetadata( item.typeName, item.metadata, item.ns );
          }
        }
      }

      if ( fn ) {
        var old = Bridge.Class.staticInitAllow;

        Bridge.Class.staticInitAllow = true;
        fn();
        Bridge.Class.staticInitAllow = old;

        return;
      }

      Bridge.Class.staticInitAllow = true;

      var queue = Bridge.Class.$queue.concat( Bridge.Class.$queueEntry );

      Bridge.Class.$queue.length = 0;
      Bridge.Class.$queueEntry.length = 0;

      for ( var i = 0; i < queue.length; i++ ) {
        var t = queue[i];

        if ( t.$staticInit ) {
          t.$staticInit();
        }

        if ( t.prototype.$main ) {
          ( function ( cls, name ) {
            Bridge.ready( function () {
              var task = cls[name]();

              if ( task && task.continueWith ) {
                task.continueWith( function () {
                  setTimeout( function () {
                    task.getAwaitedResult();
                  }, 0 );
                } );
              }
            } );
          } )( t, t.prototype.$main.name || "Main" );

          t.prototype.$main = null;
        }
      }
    }
  };

  Bridge.Class = base;
  Bridge.Class.$queue = [];
  Bridge.Class.$queueEntry = [];
  Bridge.define = Bridge.Class.define;
  Bridge.definei = Bridge.Class.definei;
  Bridge.init = Bridge.Class.init;

  // @source ReflectionAssembly.js

  Bridge.assembly = function ( assemblyName, res, callback, restore ) {
    if ( !callback ) {
      callback = res;
      res = {};
    }

    assemblyName = assemblyName || "Bridge.$Unknown";

    var asm = System.Reflection.Assembly.assemblies[assemblyName];

    if ( !asm ) {
      asm = new System.Reflection.Assembly( assemblyName, res );
    } else {
      Bridge.apply( asm.res, res || {} );
    }

    var oldAssembly = Bridge.$currentAssembly;

    Bridge.$currentAssembly = asm;

    if ( callback ) {
      var old = Bridge.Class.staticInitAllow;
      Bridge.Class.staticInitAllow = false;

      callback.call( Bridge.global, asm, Bridge.global );

      Bridge.Class.staticInitAllow = old;
    }

    Bridge.init();

    if ( restore ) {
      Bridge.$currentAssembly = oldAssembly;
    }
  };

  Bridge.define( "System.Reflection.Assembly", {
    statics: {
      assemblies: {}
    },

    ctor: function ( name, res ) {
      this.$initialize();
      this.name = name;
      this.res = res || {};
      this.$types = {};
      this.$ = {};

      System.Reflection.Assembly.assemblies[name] = this;
    },

    toString: function () {
      return this.name;
    },

    getManifestResourceNames: function () {
      return Object.keys( this.res );
    },

    getManifestResourceDataAsBase64: function ( type, name ) {
      if ( arguments.length === 1 ) {
        name = type;
        type = null;
      }

      if ( type ) {
        name = Bridge.Reflection.getTypeNamespace( type ) + "." + name;
      }

      return this.res[name] || null;
    },

    getManifestResourceData: function ( type, name ) {
      if ( arguments.length === 1 ) {
        name = type;
        type = null;
      }

      if ( type ) {
        name = Bridge.Reflection.getTypeNamespace( type ) + '.' + name;
      }

      var r = this.res[name];

      return r ? System.Convert.fromBase64String( r ) : null;
    },

    getCustomAttributes: function ( attributeType ) {
      if ( this.attr && attributeType && !Bridge.isBoolean( attributeType ) ) {
        return this.attr.filter( function ( a ) {
          return Bridge.is( a, attributeType );
        } );
      }

      return this.attr || [];
    }
  } );

  Bridge.$currentAssembly = new System.Reflection.Assembly( "mscorlib" );
  Bridge.SystemAssembly = Bridge.$currentAssembly;
  Bridge.SystemAssembly.$types["System.Reflection.Assembly"] = System.Reflection.Assembly;
  System.Reflection.Assembly.$assembly = Bridge.SystemAssembly;

  var $asm = Bridge.$currentAssembly;

  // @source Object.js

  Bridge.define( "System.Object", {} );

  // @source Void.js

  Bridge.define( "System.Void", {
    $kind: "struct",
    statics: {
      methods: {
        getDefaultValue: function () { return new System.Void(); }
      }
    },
    methods: {
      $clone: function ( to ) { return this; }
    }
  } );

  // @source SystemAssemblyVersion.js

  Bridge.init( function () {
    Bridge.SystemAssembly.version = "17.10.1";
    Bridge.SystemAssembly.compiler = "17.10.1";
  } );

  Bridge.define( "Bridge.Utils.SystemAssemblyVersion" );

  // @source Reflection.js

  Bridge.Reflection = {
    deferredMeta: [],

    setMetadata: function ( type, metadata, ns ) {
      if ( Bridge.isString( type ) ) {
        var typeName = type;
        type = Bridge.unroll( typeName );

        if ( type == null ) {
          Bridge.Reflection.deferredMeta.push( { typeName: typeName, metadata: metadata, ns: ns } );
          return;
        }
      }

      ns = Bridge.unroll( ns );
      type.$getMetadata = Bridge.Reflection.getMetadata;
      type.$metadata = metadata;
    },

    initMetaData: function ( type, metadata ) {
      if ( metadata.m ) {
        for ( var i = 0; i < metadata.m.length; i++ ) {
          var m = metadata.m[i];

          m.td = type;

          if ( m.ad ) {
            m.ad.td = type;
          }

          if ( m.r ) {
            m.r.td = type;
          }

          if ( m.g ) {
            m.g.td = type;
          }

          if ( m.s ) {
            m.s.td = type;
          }

          if ( m.tprm && Bridge.isArray( m.tprm ) ) {
            for ( var j = 0; j < m.tprm.length; j++ ) {
              m.tprm[j] = Bridge.Reflection.createTypeParam( m.tprm[j], type, m, j );
            }
          }
        }
      }

      type.$metadata = metadata;
      type.$initMetaData = true;
    },

    getMetadata: function () {
      if ( !this.$metadata && this.$genericTypeDefinition ) {
        this.$metadata = this.$genericTypeDefinition.$factoryMetadata || this.$genericTypeDefinition.$metadata;
      }

      var metadata = this.$metadata;

      if ( typeof ( metadata ) === "function" ) {
        if ( this.$isGenericTypeDefinition && !this.$factoryMetadata ) {
          this.$factoryMetadata = this.$metadata;
        }

        if ( this.$typeArguments ) {
          metadata = this.$metadata.apply( null, this.$typeArguments );
        } else if ( this.$isGenericTypeDefinition ) {
          var arr = Bridge.Reflection.createTypeParams( this.$metadata );
          this.$typeArguments = arr;
          metadata = this.$metadata.apply( null, arr );
        } else {
          metadata = this.$metadata();
        }
      }

      if ( !this.$initMetaData && metadata ) {
        Bridge.Reflection.initMetaData( this, metadata );
      }

      return metadata;
    },

    createTypeParams: function ( fn, t ) {
      var args,
        names = [],
        fnStr = fn.toString();

      args = fnStr.slice( fnStr.indexOf( "(" ) + 1, fnStr.indexOf( ")" ) ).match( /([^\s,]+)/g ) || [];

      for ( var i = 0; i < args.length; i++ ) {
        names.push( Bridge.Reflection.createTypeParam( args[i], t, null, i ) );
      }

      return names;
    },

    createTypeParam: function ( name, t, m, idx ) {
      var fn = function TypeParameter() { };

      fn.$$name = name;
      fn.$isTypeParameter = true;

      if ( t ) {
        fn.td = t;
      }

      if ( m ) {
        fn.md = m;
      }

      if ( idx != null ) {
        fn.gPrmPos = idx;
      }

      return fn;
    },

    load: function ( name ) {
      return System.Reflection.Assembly.assemblies[name] || require( name );
    },

    getGenericTypeDefinition: function ( type ) {
      if ( type.$isGenericTypeDefinition ) {
        return type;
      }

      if ( !type.$genericTypeDefinition ) {
        throw new System.InvalidOperationException.$ctor1( "This operation is only valid on generic types." );
      }

      return type.$genericTypeDefinition;
    },

    getGenericParameterCount: function ( type ) {
      return type.$typeArgumentCount || 0;
    },

    getGenericArguments: function ( type ) {
      return type.$typeArguments || [];
    },

    getMethodGenericArguments: function ( m ) {
      return m.tprm || [];
    },

    isGenericTypeDefinition: function ( type ) {
      return type.$isGenericTypeDefinition || false;
    },

    isGenericType: function ( type ) {
      return type.$genericTypeDefinition != null || Bridge.Reflection.isGenericTypeDefinition( type );
    },

    convertType: function ( type ) {
      if ( type === Boolean ) {
        return System.Boolean;
      }

      if ( type === String ) {
        return System.String;
      }

      if ( type === Object ) {
        return System.Object;
      }

      if ( type === Date ) {
        return System.DateTime;
      }

      return type;
    },

    getBaseType: function ( type ) {
      if ( Bridge.isObject( type ) || Bridge.Reflection.isInterface( type ) || type.prototype == null ) {
        return null;
      } else if ( Object.getPrototypeOf ) {
        return Bridge.Reflection.convertType( Object.getPrototypeOf( type.prototype ).constructor );
      } else {
        var p = type.prototype;

        if ( Object.prototype.hasOwnProperty.call( p, "constructor" ) ) {
          var ownValue;

          try {
            ownValue = p.constructor;
            delete p.constructor;
            return Bridge.Reflection.convertType( p.constructor );
          } finally {
            p.constructor = ownValue;
          }
        }

        return Bridge.Reflection.convertType( p.constructor );
      }
    },

    getTypeFullName: function ( obj ) {
      var str;

      if ( obj.$$fullname ) {
        str = obj.$$fullname;
      } else if ( obj.$$name ) {
        str = obj.$$name;
      }

      if ( str ) {
        var ns = Bridge.Reflection.getTypeNamespace( obj, str );

        if ( ns ) {
          var idx = str.indexOf( "[" );
          var name = str.substring( ns.length + 1, idx === -1 ? str.length : idx );

          if ( new RegExp( /[\.\$]/ ).test( name ) ) {
            str = ns + "." + name.replace( /\.|\$/g, function ( match ) { return ( match === "." ) ? "+" : "`"; } ) + ( idx === -1 ? "" : str.substring( idx ) );
          }
        }

        return str;
      }

      if ( obj.constructor === Object ) {
        str = obj.toString();

        var match = ( /\[object (.{1,})\]/ ).exec( str );
        var name = ( match && match.length > 1 ) ? match[1] : "Object";

        return name == "Object" ? "System.Object" : name;
      } else if ( obj.constructor === Function ) {
        str = obj.toString();
      } else {
        str = obj.constructor.toString();
      }

      var results = ( /function (.{1,})\(/ ).exec( str );

      if ( ( results && results.length > 1 ) ) {
        return results[1];
      }

      return "System.Object";
    },

    _makeQName: function ( name, asm ) {
      return name + ( asm ? ", " + asm.name : "" );
    },

    getTypeQName: function ( type ) {
      return Bridge.Reflection._makeQName( Bridge.Reflection.getTypeFullName( type ), type.$assembly );
    },

    getTypeName: function ( type ) {
      var fullName = Bridge.Reflection.getTypeFullName( type ),
        bIndex = fullName.indexOf( "[" ),
        pIndex = fullName.lastIndexOf( "+", bIndex >= 0 ? bIndex : fullName.length ),
        nsIndex = pIndex > -1 ? pIndex : fullName.lastIndexOf( ".", bIndex >= 0 ? bIndex : fullName.length );

      var name = nsIndex > 0 ? ( bIndex >= 0 ? fullName.substring( nsIndex + 1, bIndex ) : fullName.substr( nsIndex + 1 ) ) : fullName;

      return type.$isArray ? name + "[]" : name;
    },

    getTypeNamespace: function ( type, name ) {
      var fullName = name || Bridge.Reflection.getTypeFullName( type ),
        bIndex = fullName.indexOf( "[" ),
        nsIndex = fullName.lastIndexOf( ".", bIndex >= 0 ? bIndex : fullName.length ),
        ns = nsIndex > 0 ? fullName.substr( 0, nsIndex ) : "";

      if ( type.$assembly ) {
        var parentType = Bridge.Reflection._getAssemblyType( type.$assembly, ns );

        if ( parentType ) {
          ns = Bridge.Reflection.getTypeNamespace( parentType );
        }
      }

      return ns;
    },

    getTypeAssembly: function ( type ) {
      if ( type.$isArray ) {
        return Bridge.Reflection.getTypeAssembly( type.$elementType );
      }

      if ( System.Array.contains( [Date, Number, Boolean, String, Function, Array], type ) ) {
        return Bridge.SystemAssembly;
      }

      return type.$assembly || Bridge.SystemAssembly;
    },

    _extractArrayRank: function ( name ) {
      var rank = -1,
        m = ( /<(\d+)>$/g ).exec( name );

      if ( m ) {
        name = name.substring( 0, m.index );
        rank = parseInt( m[1] );
      }

      m = ( /\[(,*)\]$/g ).exec( name );

      if ( m ) {
        name = name.substring( 0, m.index );
        rank = m[1].length + 1;
      }

      return {
        rank: rank,
        name: name
      };
    },

    _getAssemblyType: function ( asm, name ) {
      var noAsm = false,
        rank = -1;

      if ( new RegExp( /[\+\`]/ ).test( name ) ) {
        name = name.replace( /\+|\`/g, function ( match ) { return match === "+" ? "." : "$"; } );
      }

      if ( !asm ) {
        asm = Bridge.SystemAssembly;
        noAsm = true;
      }

      var rankInfo = Bridge.Reflection._extractArrayRank( name );
      rank = rankInfo.rank;
      name = rankInfo.name;

      if ( asm.$types ) {
        var t = asm.$types[name] || null;

        if ( t ) {
          return rank > -1 ? System.Array.type( t, rank ) : t;
        }

        if ( asm.name === "mscorlib" ) {
          asm = Bridge.global;
        } else {
          return null;
        }
      }

      var a = name.split( "." ),
        scope = asm;

      for ( var i = 0; i < a.length; i++ ) {
        scope = scope[a[i]];

        if ( !scope ) {
          return null;
        }
      }

      if ( typeof scope !== "function" || !noAsm && scope.$assembly && asm.name !== scope.$assembly.name ) {
        return null;
      }

      return rank > -1 ? System.Array.type( scope, rank ) : scope;
    },

    getAssemblyTypes: function ( asm ) {
      var result = [];

      if ( asm.$types ) {
        for ( var t in asm.$types ) {
          if ( asm.$types.hasOwnProperty( t ) ) {
            result.push( asm.$types[t] );
          }
        }
      } else {
        var traverse = function ( s, n ) {
          for ( var c in s ) {
            if ( s.hasOwnProperty( c ) ) {
              traverse( s[c], c );
            }
          }

          if ( typeof ( s ) === "function" && Bridge.isUpper( n.charCodeAt( 0 ) ) ) {
            result.push( s );
          }
        };

        traverse( asm, "" );
      }

      return result;
    },

    createAssemblyInstance: function ( asm, typeName ) {
      var t = Bridge.Reflection.getType( typeName, asm );

      return t ? Bridge.createInstance( t ) : null;
    },

    getInterfaces: function ( type ) {
      var t;

      if ( type.$allInterfaces ) {
        return type.$allInterfaces;
      } else if ( type === Date ) {
        return [System.IComparable$1( Date ), System.IEquatable$1( Date ), System.IComparable, System.IFormattable];
      } else if ( type === Number ) {
        return [System.IComparable$1( Bridge.Int ), System.IEquatable$1( Bridge.Int ), System.IComparable, System.IFormattable];
      } else if ( type === Boolean ) {
        return [System.IComparable$1( Boolean ), System.IEquatable$1( Boolean ), System.IComparable];
      } else if ( type === String ) {
        return [System.IComparable$1( String ), System.IEquatable$1( String ), System.IComparable, System.ICloneable, System.Collections.IEnumerable, System.Collections.Generic.IEnumerable$1( System.Char )];
      } else if ( type === Array || type.$isArray || ( t = System.Array._typedArrays[Bridge.getTypeName( type )] ) ) {
        t = t || type.$elementType || System.Object;
        return [System.Collections.IEnumerable, System.Collections.ICollection, System.ICloneable, System.Collections.IList, System.Collections.Generic.IEnumerable$1( t ), System.Collections.Generic.ICollection$1( t ), System.Collections.Generic.IList$1( t )];
      } else {
        return [];
      }
    },

    isInstanceOfType: function ( instance, type ) {
      return Bridge.is( instance, type );
    },

    isAssignableFrom: function ( baseType, type ) {
      if ( baseType == null ) {
        throw new System.NullReferenceException();
      }

      if ( type == null ) {
        return false;
      }

      if ( baseType === type || Bridge.isObject( baseType ) ) {
        return true;
      }

      if ( Bridge.isFunction( baseType.isAssignableFrom ) ) {
        return baseType.isAssignableFrom( type );
      }

      if ( type === Array ) {
        return System.Array.is( [], baseType );
      }

      if ( Bridge.Reflection.isInterface( baseType ) && System.Array.contains( Bridge.Reflection.getInterfaces( type ), baseType ) ) {
        return true;
      }

      if ( baseType.$elementType && baseType.$isArray && type.$elementType && type.$isArray ) {
        if ( Bridge.Reflection.isValueType( baseType.$elementType ) !== Bridge.Reflection.isValueType( type.$elementType ) ) {
          return false;
        }

        return baseType.$rank === type.$rank && Bridge.Reflection.isAssignableFrom( baseType.$elementType, type.$elementType );
      }

      var inheritors = type.$$inherits,
        i,
        r;

      if ( inheritors ) {
        for ( i = 0; i < inheritors.length; i++ ) {
          r = Bridge.Reflection.isAssignableFrom( baseType, inheritors[i] );

          if ( r ) {
            return true;
          }
        }
      } else {
        return baseType.isPrototypeOf( type );
      }

      return false;
    },

    isClass: function ( type ) {
      return ( type.$kind === "class" || type.$kind === "nested class" || type === Array || type === Function || type === RegExp || type === String || type === Error || type === Object );
    },

    isEnum: function ( type ) {
      return type.$kind === "enum";
    },

    isFlags: function ( type ) {
      return !!( type.prototype && type.prototype.$flags );
    },

    isInterface: function ( type ) {
      return type.$kind === "interface" || type.$kind === "nested interface";
    },

    isAbstract: function ( type ) {
      if ( type === Function || type === System.Type ) {
        return true;
      }
      return ( ( Bridge.Reflection.getMetaValue( type, "att", 0 ) & 128 ) != 0 );
    },

    _getType: function ( typeName, asm, re, noinit ) {
      var outer = !re;

      if ( outer ) {
        typeName = typeName.replace( /\[(,*)\]/g, function ( match, g1 ) {
          return "<" + ( g1.length + 1 ) + ">";
        } );
      }

      var next = function () {
        for ( ; ; ) {
          var m = re.exec( typeName );

          if ( m && m[0] == "[" && ( typeName[m.index + 1] === "]" || typeName[m.index + 1] === "," ) ) {
            continue;
          }

          if ( m && m[0] == "]" && ( typeName[m.index - 1] === "[" || typeName[m.index - 1] === "," ) ) {
            continue;
          }

          if ( m && m[0] == "," && ( typeName[m.index + 1] === "]" || typeName[m.index + 1] === "," ) ) {
            continue;
          }

          return m;
        }
      };

      re = re || /[[,\]]/g;

      var last = re.lastIndex,
        m = next(),
        tname,
        targs = [],
        t,
        noasm = !asm;

      //asm = asm || Bridge.$currentAssembly;

      if ( m ) {
        tname = typeName.substring( last, m.index );

        switch ( m[0] ) {
          case "[":
            if ( typeName[m.index + 1] !== "[" ) {
              return null;
            }

            for ( ; ; ) {
              next();
              t = Bridge.Reflection._getType( typeName, null, re );

              if ( !t ) {
                return null;
              }

              targs.push( t );
              m = next();

              if ( m[0] === "]" ) {
                break;
              } else if ( m[0] !== "," ) {
                return null;
              }
            }

            var arrMatch = ( /^\s*<(\d+)>/g ).exec( typeName.substring( m.index + 1 ) );

            if ( arrMatch ) {
              tname = tname + "<" + parseInt( arrMatch[1] ) + ">";
            }

            m = next();

            if ( m && m[0] === "," ) {
              next();

              if ( !( asm = System.Reflection.Assembly.assemblies[( re.lastIndex > 0 ? typeName.substring( m.index + 1, re.lastIndex - 1 ) : typeName.substring( m.index + 1 ) ).trim()] ) ) {
                return null;
              }
            }
            break;

          case "]":
            break;

          case ",":
            next();

            if ( !( asm = System.Reflection.Assembly.assemblies[( re.lastIndex > 0 ? typeName.substring( m.index + 1, re.lastIndex - 1 ) : typeName.substring( m.index + 1 ) ).trim()] ) ) {
              return null;
            }

            break;
        }
      } else {
        tname = typeName.substring( last );
      }

      if ( outer && re.lastIndex ) {
        return null;
      }

      tname = tname.trim();

      var rankInfo = Bridge.Reflection._extractArrayRank( tname );
      var rank = rankInfo.rank;

      tname = rankInfo.name;

      t = Bridge.Reflection._getAssemblyType( asm, tname );

      if ( noinit ) {
        return t;
      }

      if ( !t && noasm ) {
        for ( var asmName in System.Reflection.Assembly.assemblies ) {
          if ( System.Reflection.Assembly.assemblies.hasOwnProperty( asmName ) && System.Reflection.Assembly.assemblies[asmName] !== asm ) {
            t = Bridge.Reflection._getType( typeName, System.Reflection.Assembly.assemblies[asmName], null, true );

            if ( t ) {
              break;
            }
          }
        }
      }

      t = targs.length ? t.apply( null, targs ) : t;

      if ( t && t.$staticInit ) {
        t.$staticInit();
      }

      if ( rank > -1 ) {
        t = System.Array.type( t, rank );
      }

      return t;
    },

    getType: function ( typeName, asm ) {
      if ( typeName == null ) {
        throw new System.ArgumentNullException.$ctor1( "typeName" );
      }

      return typeName ? Bridge.Reflection._getType( typeName, asm ) : null;
    },

    isPrimitive: function ( type ) {
      if ( type === System.Int64 ||
        type === System.UInt64 ||
        type === System.Double ||
        type === System.Single ||
        type === System.Byte ||
        type === System.SByte ||
        type === System.Int16 ||
        type === System.UInt16 ||
        type === System.Int32 ||
        type === System.UInt32 ||
        type === System.Boolean ||
        type === Boolean ||
        type === System.Char ||
        type === Number ) {
        return true;
      }

      return false;
    },

    canAcceptNull: function ( type ) {
      if ( type.$kind === "struct" ||
        type.$kind === "enum" ||
        type === System.Decimal ||
        type === System.Int64 ||
        type === System.UInt64 ||
        type === System.Double ||
        type === System.Single ||
        type === System.Byte ||
        type === System.SByte ||
        type === System.Int16 ||
        type === System.UInt16 ||
        type === System.Int32 ||
        type === System.UInt32 ||
        type === Bridge.Int ||
        type === System.Boolean ||
        type === System.DateTime ||
        type === Boolean ||
        type === Date ||
        type === Number ) {
        return false;
      }

      return true;
    },

    applyConstructor: function ( constructor, args ) {
      if ( !args || args.length === 0 ) {
        return new constructor();
      }

      if ( constructor.$$initCtor && constructor.$kind !== "anonymous" ) {
        var md = Bridge.getMetadata( constructor ),
          count = 0;

        if ( md ) {
          var ctors = Bridge.Reflection.getMembers( constructor, 1, 28 ),
            found;

          for ( var j = 0; j < ctors.length; j++ ) {
            var ctor = ctors[j];

            if ( ctor.p && ctor.p.length === args.length ) {
              found = true;

              for ( var k = 0; k < ctor.p.length; k++ ) {
                var p = ctor.p[k];

                if ( !Bridge.is( args[k], p ) || args[k] == null && !Bridge.Reflection.canAcceptNull( p ) ) {
                  found = false;

                  break;
                }
              }

              if ( found ) {
                constructor = constructor[ctor.sn];
                count++;
              }
            }
          }
        } else {
          if ( Bridge.isFunction( constructor.ctor ) && constructor.ctor.length === args.length ) {
            constructor = constructor.ctor;
          } else {
            var name = "$ctor",
              i = 1;

            while ( Bridge.isFunction( constructor[name + i] ) ) {
              if ( constructor[name + i].length === args.length ) {
                constructor = constructor[name + i];
                count++;
              }

              i++;
            }
          }
        }

        if ( count > 1 ) {
          throw new System.Exception( "The ambiguous constructor call" );
        }
      }

      var f = function () {
        constructor.apply( this, args );
      };

      f.prototype = constructor.prototype;

      return new f();
    },

    getAttributes: function ( type, attrType, inherit ) {
      var result = [],
        i,
        t,
        a,
        md,
        type_md;

      if ( inherit ) {
        var b = Bridge.Reflection.getBaseType( type );

        if ( b ) {
          a = Bridge.Reflection.getAttributes( b, attrType, true );

          for ( i = 0; i < a.length; i++ ) {
            t = Bridge.getType( a[i] );
            md = Bridge.getMetadata( t );

            if ( !md || !md.ni ) {
              result.push( a[i] );
            }
          }
        }
      }

      type_md = Bridge.getMetadata( type );

      if ( type_md && type_md.at ) {
        for ( i = 0; i < type_md.at.length; i++ ) {
          a = type_md.at[i];

          if ( attrType == null || Bridge.Reflection.isInstanceOfType( a, attrType ) ) {
            t = Bridge.getType( a );
            md = Bridge.getMetadata( t );

            if ( !md || !md.am ) {
              for ( var j = result.length - 1; j >= 0; j-- ) {
                if ( Bridge.Reflection.isInstanceOfType( result[j], t ) ) {
                  result.splice( j, 1 );
                }
              }
            }

            result.push( a );
          }
        }
      }

      return result;
    },

    getMembers: function ( type, memberTypes, bindingAttr, name, params ) {
      var result = [];

      if ( ( bindingAttr & 72 ) === 72 || ( bindingAttr & 6 ) === 4 ) {
        var b = Bridge.Reflection.getBaseType( type );

        if ( b ) {
          result = Bridge.Reflection.getMembers( b, memberTypes & ~1, bindingAttr & ( bindingAttr & 64 ? 255 : 247 ) & ( bindingAttr & 2 ? 251 : 255 ), name, params );
        }
      }

      var idx = 0,
        f = function ( m ) {
          if ( ( memberTypes & m.t ) && ( ( ( bindingAttr & 4 ) && !m.is ) || ( ( bindingAttr & 8 ) && m.is ) ) && ( !name || ( ( bindingAttr & 1 ) === 1 ? ( m.n.toUpperCase() === name.toUpperCase() ) : ( m.n === name ) ) ) ) {
            if ( ( bindingAttr & 16 ) === 16 && m.a === 2 ||
              ( bindingAttr & 32 ) === 32 && m.a !== 2 ) {
              if ( params ) {
                if ( ( m.p || [] ).length !== params.length ) {
                  return;
                }

                for ( var i = 0; i < params.length; i++ ) {
                  if ( params[i] !== m.p[i] ) {
                    return;
                  }
                }
              }

              if ( m.ov || m.v ) {
                result = result.filter( function ( a ) {
                  return !( a.n == m.n && a.t == m.t );
                } );
              }

              result.splice( idx++, 0, m );
            }
          }
        };

      var type_md = Bridge.getMetadata( type );

      if ( type_md && type_md.m ) {
        var mNames = ["g", "s", "ad", "r"];

        for ( var i = 0; i < type_md.m.length; i++ ) {
          var m = type_md.m[i];

          f( m );

          for ( var j = 0; j < 4; j++ ) {
            var a = mNames[j];

            if ( m[a] ) {
              f( m[a] );
            }
          }
        }
      }

      if ( bindingAttr & 256 ) {
        while ( type ) {
          var r = [];

          for ( var i = 0; i < result.length; i++ ) {
            if ( result[i].td === type ) {
              r.push( result[i] );
            }
          }

          if ( r.length > 1 ) {
            throw new System.Reflection.AmbiguousMatchException.$ctor1( "Ambiguous match" );
          } else if ( r.length === 1 ) {
            return r[0];
          }

          type = Bridge.Reflection.getBaseType( type );
        }

        return null;
      }

      return result;
    },

    createDelegate: function ( mi, firstArgument ) {
      var isStatic = mi.is || mi.sm,
        bind = firstArgument != null && !isStatic,
        method = Bridge.Reflection.midel( mi, firstArgument, null, bind );

      if ( !bind ) {
        if ( isStatic ) {
          return function () {
            var args = firstArgument != null ? [firstArgument] : [];

            return method.apply( mi.td, args.concat( Array.prototype.slice.call( arguments, 0 ) ) );
          };
        } else {
          return function ( target ) {
            return method.apply( target, Array.prototype.slice.call( arguments, 1 ) );
          };
        }
      }

      return method;
    },

    midel: function ( mi, target, typeArguments, bind ) {
      if ( bind !== false ) {
        if ( mi.is && !!target ) {
          throw new System.ArgumentException.$ctor1( "Cannot specify target for static method" );
        } else if ( !mi.is && !target ) {
          throw new System.ArgumentException.$ctor1( "Must specify target for instance method" );
        }
      }

      var method;

      if ( mi.fg ) {
        method = function () { return ( mi.is ? mi.td : this )[mi.fg]; };
      } else if ( mi.fs ) {
        method = function ( v ) { ( mi.is ? mi.td : this )[mi.fs] = v; };
      } else {
        method = mi.def || ( mi.is || mi.sm ? mi.td[mi.sn] : ( target ? target[mi.sn] : mi.td.prototype[mi.sn] ) );

        if ( mi.tpc ) {
          if ( mi.constructed && ( !typeArguments || typeArguments.length == 0 ) ) {
            typeArguments = mi.tprm;
          }

          if ( !typeArguments || typeArguments.length !== mi.tpc ) {
            throw new System.ArgumentException.$ctor1( "Wrong number of type arguments" );
          }

          var gMethod = method;

          method = function () {
            return gMethod.apply( this, typeArguments.concat( Array.prototype.slice.call( arguments ) ) );
          };
        } else {
          if ( typeArguments && typeArguments.length ) {
            throw new System.ArgumentException.$ctor1( "Cannot specify type arguments for non-generic method" );
          }
        }

        if ( mi.exp ) {
          var _m1 = method;

          method = function () { return _m1.apply( this, Array.prototype.slice.call( arguments, 0, arguments.length - 1 ).concat( arguments[arguments.length - 1] ) ); };
        }

        if ( mi.sm ) {
          var _m2 = method;

          method = function () { return _m2.apply( null, [this].concat( Array.prototype.slice.call( arguments ) ) ); };
        }
      }

      var orig = method;

      method = function () {
        var args = [],
          params = mi.pi || [],
          v,
          p;

        if ( !params.length && mi.p && mi.p.length ) {
          params = mi.p.map( function ( t ) {
            return { pt: t };
          } );
        }

        for ( var i = 0; i < arguments.length; i++ ) {
          p = params[i] || params[params.length - 1];
          v = arguments[i];

          args[i] = p && p.pt === System.Object ? v : Bridge.unbox( arguments[i] );

          if ( v == null && p && Bridge.Reflection.isValueType( p.pt ) ) {
            args[i] = Bridge.getDefaultValue( p.pt );
          }
        }

        var v = orig.apply( this, args );

        return v != null && mi.box ? mi.box( v ) : v;
      };

      return bind !== false ? Bridge.fn.bind( target, method ) : method;
    },

    invokeCI: function ( ci, args ) {
      if ( ci.exp ) {
        args = args.slice( 0, args.length - 1 ).concat( args[args.length - 1] );
      }

      if ( ci.def ) {
        return ci.def.apply( null, args );
      } else if ( ci.sm ) {
        return ci.td[ci.sn].apply( null, args );
      } else {
        if ( ci.td.$literal ) {
          return ( ci.sn ? ci.td[ci.sn] : ci.td ).apply( ci.td, args );
        }

        return Bridge.Reflection.applyConstructor( ci.sn ? ci.td[ci.sn] : ci.td, args );
      }
    },

    fieldAccess: function ( fi, obj ) {
      if ( fi.is && !!obj ) {
        throw new System.ArgumentException.$ctor1( "Cannot specify target for static field" );
      } else if ( !fi.is && !obj ) {
        throw new System.ArgumentException.$ctor1( "Must specify target for instance field" );
      }

      obj = fi.is ? fi.td : obj;

      if ( arguments.length === 3 ) {
        var v = arguments[2];

        if ( v == null && Bridge.Reflection.isValueType( fi.rt ) ) {
          v = Bridge.getDefaultValue( fi.rt );
        }

        obj[fi.sn] = v;
      } else {
        return fi.box ? fi.box( obj[fi.sn] ) : obj[fi.sn];
      }
    },

    getMetaValue: function ( type, name, dv ) {
      var md = type.$isTypeParameter ? type : Bridge.getMetadata( type );

      return md ? ( md[name] || dv ) : dv;
    },

    isArray: function ( type ) {
      return Bridge.arrayTypes.indexOf( type ) >= 0;
    },

    isValueType: function ( type ) {
      return !Bridge.Reflection.canAcceptNull( type );
    },

    getNestedTypes: function ( type, flags ) {
      var types = Bridge.Reflection.getMetaValue( type, "nested", [] );

      if ( flags ) {
        var tmp = [];
        for ( var i = 0; i < types.length; i++ ) {
          var nestedType = types[i],
            attrs = Bridge.Reflection.getMetaValue( nestedType, "att", 0 ),
            access = attrs & 7,
            isPublic = access === 1 || access === 2;

          if ( ( flags & 16 ) === 16 && isPublic ||
            ( flags & 32 ) === 32 && !isPublic ) {
            tmp.push( nestedType );
          }
        }

        types = tmp;
      }

      return types;
    },

    getNestedType: function ( type, name, flags ) {
      var types = Bridge.Reflection.getNestedTypes( type, flags );

      for ( var i = 0; i < types.length; i++ ) {
        if ( Bridge.Reflection.getTypeName( types[i] ) === name ) {
          return types[i];
        }
      }

      return null;
    },

    isGenericMethodDefinition: function ( mi ) {
      return Bridge.Reflection.isGenericMethod( mi ) && !mi.constructed;
    },

    isGenericMethod: function ( mi ) {
      return !!mi.tpc;
    },

    containsGenericParameters: function ( mi ) {
      if ( mi.$typeArguments ) {
        for ( var i = 0; i < mi.$typeArguments.length; i++ ) {
          if ( mi.$typeArguments[i].$isTypeParameter ) {
            return true;
          }
        }
      }

      var tprm = mi.tprm || [];

      for ( var i = 0; i < tprm.length; i++ ) {
        if ( tprm[i].$isTypeParameter ) {
          return true;
        }
      }

      return false;
    },

    genericParameterPosition: function ( type ) {
      if ( !type.$isTypeParameter ) {
        throw new System.InvalidOperationException.$ctor1( "The current type does not represent a type parameter." );
      }
      return type.gPrmPos || 0;
    },

    makeGenericMethod: function ( mi, args ) {
      var cmi = Bridge.apply( {}, mi );
      cmi.tprm = args;
      cmi.p = args;
      cmi.gd = mi;
      cmi.constructed = true;

      return cmi;
    },

    getGenericMethodDefinition: function ( mi ) {
      if ( !mi.tpc ) {
        throw new System.InvalidOperationException.$ctor1( "The current method is not a generic method. " );
      }

      return mi.gd || mi;
    }
  };

  Bridge.setMetadata = Bridge.Reflection.setMetadata;

  System.Reflection.ConstructorInfo = {
    $is: function ( obj ) {
      return obj != null && obj.t === 1;
    }
  };


  // @source Interfaces.js

  Bridge.define( "System.IFormattable", {
    $kind: "interface",
    statics: {
      $is: function ( obj ) {
        if ( Bridge.isNumber( obj ) || Bridge.isDate( obj ) ) {
          return true;
        }

        return Bridge.is( obj, System.IFormattable, true );
      }
    }
  } );

  Bridge.define( "System.IComparable", {
    $kind: "interface",

    statics: {
      $is: function ( obj ) {
        if ( Bridge.isNumber( obj ) || Bridge.isDate( obj ) || Bridge.isBoolean( obj ) || Bridge.isString( obj ) ) {
          return true;
        }

        return Bridge.is( obj, System.IComparable, true );
      }
    }
  } );

  Bridge.define( "System.IFormatProvider", {
    $kind: "interface"
  } );

  Bridge.define( "System.ICloneable", {
    $kind: "interface"
  } );

  Bridge.define( "System.IComparable$1", function ( T ) {
    return {
      $kind: "interface",

      statics: {
        $is: function ( obj ) {
          if ( Bridge.isNumber( obj ) && T.$number && T.$is( obj ) || Bridge.isDate( obj ) && ( T === Date || T === System.DateTime ) || Bridge.isBoolean( obj ) && ( T === Boolean || T === System.Boolean ) || Bridge.isString( obj ) && ( T === String || T === System.String ) ) {
            return true;
          }

          return Bridge.is( obj, System.IComparable$1( T ), true );
        },

        isAssignableFrom: function ( type ) {
          if ( type === System.DateTime && T === Date ) {
            return true;
          }

          return Bridge.Reflection.getInterfaces( type ).indexOf( System.IComparable$1( T ) ) >= 0;
        }
      }
    };
  } );

  Bridge.define( "System.IEquatable$1", function ( T ) {
    return {
      $kind: "interface",

      statics: {
        $is: function ( obj ) {
          if ( Bridge.isNumber( obj ) && T.$number && T.$is( obj ) || Bridge.isDate( obj ) && ( T === Date || T === System.DateTime ) || Bridge.isBoolean( obj ) && ( T === Boolean || T === System.Boolean ) || Bridge.isString( obj ) && ( T === String || T === System.String ) ) {
            return true;
          }

          return Bridge.is( obj, System.IEquatable$1( T ), true );
        },

        isAssignableFrom: function ( type ) {
          if ( type === System.DateTime && T === Date ) {
            return true;
          }

          return Bridge.Reflection.getInterfaces( type ).indexOf( System.IEquatable$1( T ) ) >= 0;
        }
      }
    };
  } );

  Bridge.define( "Bridge.IPromise", {
    $kind: "interface"
  } );

  Bridge.define( "System.IDisposable", {
    $kind: "interface"
  } );

  Bridge.define( "System.IAsyncResult", {
    $kind: "interface"
  } );

  // @source ValueType.js

  Bridge.define( "System.ValueType", {
    statics: {
      methods: {
        $is: function ( obj ) {
          return Bridge.Reflection.isValueType( Bridge.getType( obj ) );
        }
      }
    }
  } );

  // @source Enum.js

  var enumMethods = {
    nameEquals: function ( n1, n2, ignoreCase ) {
      if ( ignoreCase ) {
        return n1.toLowerCase() === n2.toLowerCase();
      }

      return ( n1.charAt( 0 ).toLowerCase() + n1.slice( 1 ) ) === ( n2.charAt( 0 ).toLowerCase() + n2.slice( 1 ) );
    },

    checkEnumType: function ( enumType ) {
      if ( !enumType ) {
        throw new System.ArgumentNullException.$ctor1( "enumType" );
      }

      if ( enumType.prototype && enumType.$kind !== "enum" ) {
        throw new System.ArgumentException.$ctor1( "", "enumType" );
      }
    },

    getUnderlyingType: function ( type ) {
      System.Enum.checkEnumType( type );

      return type.prototype.$utype || System.Int32;
    },

    toName: function ( name ) {
      return name;
    },

    toObject: function ( enumType, value ) {
      value = Bridge.unbox( value, true );

      if ( value == null ) {
        return null;
      }

      return enumMethods.parse( enumType, value.toString(), false, true );
    },

    parse: function ( enumType, s, ignoreCase, silent ) {
      System.Enum.checkEnumType( enumType );

      if ( s != null ) {
        if ( enumType === Number || enumType === System.String || enumType.$number ) {
          return s;
        }

        var intValue = {};

        if ( System.Int32.tryParse( s, intValue ) ) {
          return Bridge.box( intValue.v, enumType, function ( obj ) { return System.Enum.toString( enumType, obj ); } );
        }

        var names = System.Enum.getNames( enumType ),
          values = enumType;

        if ( !enumType.prototype || !enumType.prototype.$flags ) {
          for ( var i = 0; i < names.length; i++ ) {
            var name = names[i];

            if ( enumMethods.nameEquals( name, s, ignoreCase ) ) {
              return Bridge.box( values[name], enumType, function ( obj ) { return System.Enum.toString( enumType, obj ); } );
            }
          }
        } else {
          var parts = s.split( "," ),
            value = 0,
            parsed = true;

          for ( var i = parts.length - 1; i >= 0; i-- ) {
            var part = parts[i].trim(),
              found = false;

            for ( var n = 0; n < names.length; n++ ) {
              var name = names[n];

              if ( enumMethods.nameEquals( name, part, ignoreCase ) ) {
                value |= values[name];
                found = true;

                break;
              }
            }

            if ( !found ) {
              parsed = false;

              break;
            }
          }

          if ( parsed ) {
            return Bridge.box( value, enumType, function ( obj ) { return System.Enum.toString( enumType, obj ); } );
          }
        }
      }

      if ( silent !== true ) {
        throw new System.ArgumentException.$ctor3( "silent", "Invalid Enumeration Value" );
      }

      return null;
    },

    toStringFn: function ( type ) {
      return function ( value ) {
        return System.Enum.toString( type, value );
      };
    },

    toString: function ( enumType, value, forceFlags ) {
      if ( arguments.length === 0 ) {
        return "System.Enum";
      }

      if ( value && value.$boxed && enumType === System.Enum ) {
        enumType = value.type;
      }

      value = Bridge.unbox( value, true );

      if ( enumType === Number || enumType === System.String || enumType.$number ) {
        return value.toString();
      }

      System.Enum.checkEnumType( enumType );

      var values = enumType,
        names = System.Enum.getNames( enumType ),
        isLong = System.Int64.is64Bit( value );

      if ( ( ( !enumType.prototype || !enumType.prototype.$flags ) && forceFlags !== true ) || ( value === 0 ) ) {
        for ( var i = 0; i < names.length; i++ ) {
          var name = names[i];

          if ( isLong && System.Int64.is64Bit( values[name] ) ? ( values[name].eq( value ) ) : ( values[name] === value ) ) {
            return enumMethods.toName( name );
          }
        }

        return value.toString();
      } else {
        var parts = [],
          entries = System.Enum.getValuesAndNames( enumType ),
          index = entries.length - 1,
          saveResult = value;

        while ( index >= 0 ) {
          var entry = entries[index],
            long = isLong && System.Int64.is64Bit( entry.value );

          if ( ( index == 0 ) && ( long ? entry.value.isZero() : entry.value == 0 ) ) {
            break;
          }

          if ( long ? ( value.and( entry.value ).eq( entry.value ) ) : ( ( value & entry.value ) == entry.value ) ) {
            if ( long ) {
              value = value.sub( entry.value );
            } else {
              value -= entry.value;
            }

            parts.unshift( entry.name );
          }

          index--;
        }

        if ( isLong ? !value.isZero() : value !== 0 ) {
          return saveResult.toString();
        }

        if ( isLong ? saveResult.isZero() : saveResult === 0 ) {
          var entry = entries[0];

          if ( entry && ( System.Int64.is64Bit( entry.value ) ? entry.value.isZero() : ( entry.value == 0 ) ) ) {
            return entry.name;
          }

          return "0";
        }

        return parts.join( ", " );
      }
    },

    getValuesAndNames: function ( enumType ) {
      System.Enum.checkEnumType( enumType );

      var parts = [],
        names = System.Enum.getNames( enumType ),
        values = enumType;

      for ( var i = 0; i < names.length; i++ ) {
        parts.push( { name: names[i], value: values[names[i]] } );
      }

      return parts.sort( function ( i1, i2 ) {
        return System.Int64.is64Bit( i1.value ) ? i1.value.sub( i2.value ).sign() : ( i1.value - i2.value );
      } );
    },

    getValues: function ( enumType ) {
      System.Enum.checkEnumType( enumType );

      var parts = [],
        names = System.Enum.getNames( enumType ),
        values = enumType;

      for ( var i = 0; i < names.length; i++ ) {
        parts.push( values[names[i]] );
      }

      return parts.sort( function ( i1, i2 ) {
        return System.Int64.is64Bit( i1 ) ? i1.sub( i2 ).sign() : ( i1 - i2 );
      } );
    },

    format: function ( enumType, value, format ) {
      System.Enum.checkEnumType( enumType );

      var name;

      if ( !Bridge.hasValue( value ) && ( name = "value" ) || !Bridge.hasValue( format ) && ( name = "format" ) ) {
        throw new System.ArgumentNullException.$ctor1( name );
      }

      value = Bridge.unbox( value, true );

      switch ( format ) {
        case "G":
        case "g":
          return System.Enum.toString( enumType, value );
        case "x":
        case "X":
          return value.toString( 16 );
        case "d":
        case "D":
          return value.toString();
        case "f":
        case "F":
          return System.Enum.toString( enumType, value, true );
        default:
          throw new System.FormatException();
      }
    },

    getNames: function ( enumType ) {
      System.Enum.checkEnumType( enumType );

      var parts = [],
        values = enumType;

      if ( enumType.$names ) {
        return enumType.$names.slice( 0 );
      }

      for ( var i in values ) {
        if ( values.hasOwnProperty( i ) && i.indexOf( "$" ) < 0 && typeof values[i] !== "function" ) {
          parts.push( [enumMethods.toName( i ), values[i]] );
        }
      }

      return parts.sort( function ( i1, i2 ) {
        return System.Int64.is64Bit( i1[1] ) ? i1[1].sub( i2[1] ).sign() : ( i1[1] - i2[1] );
      } ).map( function ( i ) {
        return i[0];
      } );
    },

    getName: function ( enumType, value ) {
      value = Bridge.unbox( value, true );

      if ( value == null ) {
        throw new System.ArgumentNullException.$ctor1( "value" );
      }

      var isLong = System.Int64.is64Bit( value );

      if ( !isLong && !( typeof ( value ) === "number" && Math.floor( value, 0 ) === value ) ) {
        throw new System.ArgumentException.$ctor1( "Argument must be integer", "value" );
      }

      System.Enum.checkEnumType( enumType );

      var names = System.Enum.getNames( enumType ),
        values = enumType;

      for ( var i = 0; i < names.length; i++ ) {
        var name = names[i];

        if ( isLong ? value.eq( values[name] ) : ( values[name] === value ) ) {
          return name;
        }
      }

      return null;
    },

    hasFlag: function ( value, flag ) {
      flag = Bridge.unbox( flag, true );
      var isLong = System.Int64.is64Bit( value );

      return flag === 0 || ( isLong ? !value.and( flag ).isZero() : !!( value & flag ) );
    },

    isDefined: function ( enumType, value ) {
      value = Bridge.unbox( value, true );

      System.Enum.checkEnumType( enumType );

      var values = enumType,
        names = System.Enum.getNames( enumType ),
        isString = Bridge.isString( value ),
        isLong = System.Int64.is64Bit( value );

      for ( var i = 0; i < names.length; i++ ) {
        var name = names[i];

        if ( isString ? enumMethods.nameEquals( name, value, false ) : ( isLong ? value.eq( values[name] ) : ( values[name] === value ) ) ) {
          return true;
        }
      }

      return false;
    },

    tryParse: function ( enumType, value, result, ignoreCase ) {
      result.v = Bridge.unbox( enumMethods.parse( enumType, value, ignoreCase, true ), true );

      if ( result.v == null ) {
        result.v = 0;

        return false;
      }

      return true;
    },

    equals: function ( v1, v2, T ) {
      if ( v2 && v2.$boxed && ( v1 && v1.$boxed || T ) ) {
        if ( v2.type !== ( v1.type || T ) ) {
          return false;
        }
      }

      return System.Enum.equalsT( v1, v2 );
    },

    equalsT: function ( v1, v2 ) {
      return Bridge.equals( Bridge.unbox( v1, true ), Bridge.unbox( v2, true ) );
    }
  };

  Bridge.define( "System.Enum", {
    inherits: [System.IComparable, System.IFormattable],
    statics: {
      methods: enumMethods
    }
  } );

  // @source Nullable.js

  var nullable = {
    hasValue: Bridge.hasValue,

    getValue: function ( obj ) {
      obj = Bridge.unbox( obj, true );

      if ( !Bridge.hasValue( obj ) ) {
        throw new System.InvalidOperationException.$ctor1( "Nullable instance doesn't have a value." );
      }

      return obj;
    },

    getValueOrDefault: function ( obj, defValue ) {
      return Bridge.hasValue( obj ) ? obj : defValue;
    },

    add: function ( a, b ) {
      return Bridge.hasValue$1( a, b ) ? a + b : null;
    },

    band: function ( a, b ) {
      return Bridge.hasValue$1( a, b ) ? a & b : null;
    },

    bor: function ( a, b ) {
      return Bridge.hasValue$1( a, b ) ? a | b : null;
    },

    and: function ( a, b ) {
      if ( a === true && b === true ) {
        return true;
      } else if ( a === false || b === false ) {
        return false;
      }

      return null;
    },

    or: function ( a, b ) {
      if ( a === true || b === true ) {
        return true;
      } else if ( a === false && b === false ) {
        return false;
      }

      return null;
    },

    div: function ( a, b ) {
      return Bridge.hasValue$1( a, b ) ? a / b : null;
    },

    eq: function ( a, b ) {
      return !Bridge.hasValue( a ) ? !Bridge.hasValue( b ) : ( a === b );
    },

    equals: function ( a, b, fn ) {
      return !Bridge.hasValue( a ) ? !Bridge.hasValue( b ) : ( fn ? fn( a, b ) : Bridge.equals( a, b ) );
    },

    toString: function ( a, fn ) {
      return !Bridge.hasValue( a ) ? "" : ( fn ? fn( a ) : a.toString() );
    },

    toStringFn: function ( fn ) {
      return function ( v ) {
        return System.Nullable.toString( v, fn );
      };
    },

    getHashCode: function ( a, fn ) {
      return !Bridge.hasValue( a ) ? 0 : ( fn ? fn( a ) : Bridge.getHashCode( a ) );
    },

    getHashCodeFn: function ( fn ) {
      return function ( v ) {
        return System.Nullable.getHashCode( v, fn );
      };
    },

    xor: function ( a, b ) {
      if ( Bridge.hasValue$1( a, b ) ) {
        if ( Bridge.isBoolean( a ) && Bridge.isBoolean( b ) ) {
          return a != b;
        }

        return a ^ b;
      }

      return null;
    },

    gt: function ( a, b ) {
      return Bridge.hasValue$1( a, b ) && a > b;
    },

    gte: function ( a, b ) {
      return Bridge.hasValue$1( a, b ) && a >= b;
    },

    neq: function ( a, b ) {
      return !Bridge.hasValue( a ) ? Bridge.hasValue( b ) : ( a !== b );
    },

    lt: function ( a, b ) {
      return Bridge.hasValue$1( a, b ) && a < b;
    },

    lte: function ( a, b ) {
      return Bridge.hasValue$1( a, b ) && a <= b;
    },

    mod: function ( a, b ) {
      return Bridge.hasValue$1( a, b ) ? a % b : null;
    },

    mul: function ( a, b ) {
      return Bridge.hasValue$1( a, b ) ? a * b : null;
    },

    imul: function ( a, b ) {
      return Bridge.hasValue$1( a, b ) ? Bridge.Int.mul( a, b ) : null;
    },

    sl: function ( a, b ) {
      return Bridge.hasValue$1( a, b ) ? a << b : null;
    },

    sr: function ( a, b ) {
      return Bridge.hasValue$1( a, b ) ? a >> b : null;
    },

    srr: function ( a, b ) {
      return Bridge.hasValue$1( a, b ) ? a >>> b : null;
    },

    sub: function ( a, b ) {
      return Bridge.hasValue$1( a, b ) ? a - b : null;
    },

    bnot: function ( a ) {
      return Bridge.hasValue( a ) ? ~a : null;
    },

    neg: function ( a ) {
      return Bridge.hasValue( a ) ? -a : null;
    },

    not: function ( a ) {
      return Bridge.hasValue( a ) ? !a : null;
    },

    pos: function ( a ) {
      return Bridge.hasValue( a ) ? +a : null;
    },

    lift: function () {
      for ( var i = 1; i < arguments.length; i++ ) {
        if ( !Bridge.hasValue( arguments[i] ) ) {
          return null;
        }
      }

      if ( arguments[0] == null ) {
        return null;
      }

      if ( arguments[0].apply == undefined ) {
        return arguments[0];
      }

      return arguments[0].apply( null, Array.prototype.slice.call( arguments, 1 ) );
    },

    lift1: function ( f, o ) {
      return Bridge.hasValue( o ) ? ( typeof f === "function" ? f.apply( null, Array.prototype.slice.call( arguments, 1 ) ) : o[f].apply( o, Array.prototype.slice.call( arguments, 2 ) ) ) : null;
    },

    lift2: function ( f, a, b ) {
      return Bridge.hasValue$1( a, b ) ? ( typeof f === "function" ? f.apply( null, Array.prototype.slice.call( arguments, 1 ) ) : a[f].apply( a, Array.prototype.slice.call( arguments, 2 ) ) ) : null;
    },

    liftcmp: function ( f, a, b ) {
      return Bridge.hasValue$1( a, b ) ? ( typeof f === "function" ? f.apply( null, Array.prototype.slice.call( arguments, 1 ) ) : a[f].apply( a, Array.prototype.slice.call( arguments, 2 ) ) ) : false;
    },

    lifteq: function ( f, a, b ) {
      var va = Bridge.hasValue( a ),
        vb = Bridge.hasValue( b );

      return ( !va && !vb ) || ( va && vb && ( typeof f === "function" ? f.apply( null, Array.prototype.slice.call( arguments, 1 ) ) : a[f].apply( a, Array.prototype.slice.call( arguments, 2 ) ) ) );
    },

    liftne: function ( f, a, b ) {
      var va = Bridge.hasValue( a ),
        vb = Bridge.hasValue( b );

      return ( va !== vb ) || ( va && ( typeof f === "function" ? f.apply( null, Array.prototype.slice.call( arguments, 1 ) ) : a[f].apply( a, Array.prototype.slice.call( arguments, 2 ) ) ) );
    },

    getUnderlyingType: function ( nullableType ) {
      if ( !nullableType ) {
        throw new System.ArgumentNullException.$ctor1( "nullableType" );
      }

      if ( Bridge.Reflection.isGenericType( nullableType ) &&
        !Bridge.Reflection.isGenericTypeDefinition( nullableType ) ) {
        var genericType = Bridge.Reflection.getGenericTypeDefinition( nullableType );

        if ( genericType === System.Nullable$1 ) {
          return Bridge.Reflection.getGenericArguments( nullableType )[0];
        }
      }

      return null;
    },

    compare: function ( n1, n2 ) {
      return System.Collections.Generic.Comparer$1.$default.compare( n1, n2 );
    }
  };

  System.Nullable = nullable;

  Bridge.define( "System.Nullable$1", function ( T ) {
    return {
      $kind: "struct",

      statics: {
        $nullable: true,
        $nullableType: T,
        getDefaultValue: function () {
          return null;
        },

        $is: function ( obj ) {
          return Bridge.is( obj, T );
        }
      }
    };
  } );

  // @source Char.js

  Bridge.define( "System.Char", {
    inherits: [System.IComparable, System.IFormattable],
    $kind: "struct",
    statics: {
      min: 0,

      max: 65535,

      $is: function ( instance ) {
        return typeof ( instance ) === "number" && Math.round( instance, 0 ) == instance && instance >= System.Char.min && instance <= System.Char.max;
      },

      getDefaultValue: function () {
        return 0;
      },

      parse: function ( s ) {
        if ( !Bridge.hasValue( s ) ) {
          throw new System.ArgumentNullException.$ctor1( "s" );
        }

        if ( s.length !== 1 ) {
          throw new System.FormatException();
        }

        return s.charCodeAt( 0 );
      },

      tryParse: function ( s, result ) {
        var b = s && s.length === 1;

        result.v = b ? s.charCodeAt( 0 ) : 0;

        return b;
      },

      format: function ( number, format, provider ) {
        return Bridge.Int.format( number, format, provider );
      },

      charCodeAt: function ( str, index ) {
        if ( str == null ) {
          throw new System.ArgumentNullException();
        }

        if ( str.length != 1 ) {
          throw new System.FormatException.$ctor1( "String must be exactly one character long" );
        }

        return str.charCodeAt( index );
      },

      _isWhiteSpaceMatch: /[^\s\x09-\x0D\x85\xA0]/,

      isWhiteSpace: function ( s ) {
        return !System.Char._isWhiteSpaceMatch.test( s );
      },

      _isDigitMatch: new RegExp( /[0-9\u0030-\u0039\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]/ ),

      isDigit: function ( value ) {
        if ( value < 256 ) {
          return ( value >= 48 && value <= 57 );
        }

        return System.Char._isDigitMatch.test( String.fromCharCode( value ) );
      },

      _isLetterMatch: new RegExp( /[A-Za-z\u0061-\u007A\u00B5\u00DF-\u00F6\u00F8-\u00FF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0561-\u0587\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7FA\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A\u0041-\u005A\u00C0-\u00D6\u00D8-\u00DE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA\uFF21-\uFF3A\u01C5\u01C8\u01CB\u01F2\u1F88-\u1F8F\u1F98-\u1F9F\u1FA8-\u1FAF\u1FBC\u1FCC\u1FFC\u02B0-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0374\u037A\u0559\u0640\u06E5\u06E6\u07F4\u07F5\u07FA\u081A\u0824\u0828\u0971\u0E46\u0EC6\u10FC\u17D7\u1843\u1AA7\u1C78-\u1C7D\u1D2C-\u1D6A\u1D78\u1D9B-\u1DBF\u2071\u207F\u2090-\u209C\u2C7C\u2C7D\u2D6F\u2E2F\u3005\u3031-\u3035\u303B\u309D\u309E\u30FC-\u30FE\uA015\uA4F8-\uA4FD\uA60C\uA67F\uA717-\uA71F\uA770\uA788\uA7F8\uA7F9\uA9CF\uAA70\uAADD\uAAF3\uAAF4\uFF70\uFF9E\uFF9F\u00AA\u00BA\u01BB\u01C0-\u01C3\u0294\u05D0-\u05EA\u05F0-\u05F2\u0620-\u063F\u0641-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u0800-\u0815\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0972-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E45\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10D0-\u10FA\u10FD-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17DC\u1820-\u1842\u1844-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C77\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u2135-\u2138\u2D30-\u2D67\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3006\u303C\u3041-\u3096\u309F\u30A1-\u30FA\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA014\uA016-\uA48C\uA4D0-\uA4F7\uA500-\uA60B\uA610-\uA61F\uA62A\uA62B\uA66E\uA6A0-\uA6E5\uA7FB-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA6F\uAA71-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB\uAADC\uAAE0-\uAAEA\uAAF2\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF66-\uFF6F\uFF71-\uFF9D\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/ ),

      isLetter: function ( value ) {
        if ( value < 256 ) {
          return ( value >= 65 && value <= 90 ) || ( value >= 97 && value <= 122 );
        }

        return System.Char._isLetterMatch.test( String.fromCharCode( value ) );
      },

      _isHighSurrogateMatch: new RegExp( /[\uD800-\uDBFF]/ ),

      isHighSurrogate: function ( value ) {
        return System.Char._isHighSurrogateMatch.test( String.fromCharCode( value ) );
      },

      _isLowSurrogateMatch: new RegExp( /[\uDC00-\uDFFF]/ ),

      isLowSurrogate: function ( value ) {
        return System.Char._isLowSurrogateMatch.test( String.fromCharCode( value ) );
      },

      _isSurrogateMatch: new RegExp( /[\uD800-\uDFFF]/ ),

      isSurrogate: function ( value ) {
        return System.Char._isSurrogateMatch.test( String.fromCharCode( value ) );
      },

      _isNullMatch: new RegExp( "\u0000" ),

      isNull: function ( value ) {
        return System.Char._isNullMatch.test( String.fromCharCode( value ) );
      },

      _isSymbolMatch: new RegExp( /[\u20A0-\u20CF\u20D0-\u20FF\u2100-\u214F\u2150-\u218F\u2190-\u21FF\u2200-\u22FF\u2300-\u23FF\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF\u27C0-\u27EF\u27F0-\u27FF\u2800-\u28FF\u2900-\u297F\u2980-\u29FF\u2A00-\u2AFF\u2B00-\u2BFF]/ ),

      isSymbol: function ( value ) {
        if ( value < 256 ) {
          return ( [36, 43, 60, 61, 62, 94, 96, 124, 126, 162, 163, 164, 165, 166, 167, 168, 169, 172, 174, 175, 176, 177, 180, 182, 184, 215, 247].indexOf( value ) != -1 );
        }

        return System.Char._isSymbolMatch.test( String.fromCharCode( value ) );
      },

      _isSeparatorMatch: new RegExp( /[\u2028\u2029\u0020\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/ ),

      isSeparator: function ( value ) {
        if ( value < 256 ) {
          return ( value == 32 || value == 160 );
        }

        return System.Char._isSeparatorMatch.test( String.fromCharCode( value ) );
      },

      _isPunctuationMatch: new RegExp( /[\u0021-\u0023\u0025-\u002A\u002C-\u002F\u003A\u003B\u003F\u0040\u005B-\u005D\u005F\u007B\u007D\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E3B\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65\u002D\u058A\u05BE\u1400\u1806\u2010-\u2015\u2E17\u2E1A\u2E3A\u2E3B\u301C\u3030\u30A0\uFE31\uFE32\uFE58\uFE63\uFF0D\u0028\u005B\u007B\u0F3A\u0F3C\u169B\u201A\u201E\u2045\u207D\u208D\u2329\u2768\u276A\u276C\u276E\u2770\u2772\u2774\u27C5\u27E6\u27E8\u27EA\u27EC\u27EE\u2983\u2985\u2987\u2989\u298B\u298D\u298F\u2991\u2993\u2995\u2997\u29D8\u29DA\u29FC\u2E22\u2E24\u2E26\u2E28\u3008\u300A\u300C\u300E\u3010\u3014\u3016\u3018\u301A\u301D\uFD3E\uFE17\uFE35\uFE37\uFE39\uFE3B\uFE3D\uFE3F\uFE41\uFE43\uFE47\uFE59\uFE5B\uFE5D\uFF08\uFF3B\uFF5B\uFF5F\uFF62\u0029\u005D\u007D\u0F3B\u0F3D\u169C\u2046\u207E\u208E\u232A\u2769\u276B\u276D\u276F\u2771\u2773\u2775\u27C6\u27E7\u27E9\u27EB\u27ED\u27EF\u2984\u2986\u2988\u298A\u298C\u298E\u2990\u2992\u2994\u2996\u2998\u29D9\u29DB\u29FD\u2E23\u2E25\u2E27\u2E29\u3009\u300B\u300D\u300F\u3011\u3015\u3017\u3019\u301B\u301E\u301F\uFD3F\uFE18\uFE36\uFE38\uFE3A\uFE3C\uFE3E\uFE40\uFE42\uFE44\uFE48\uFE5A\uFE5C\uFE5E\uFF09\uFF3D\uFF5D\uFF60\uFF63\u00AB\u2018\u201B\u201C\u201F\u2039\u2E02\u2E04\u2E09\u2E0C\u2E1C\u2E20\u00BB\u2019\u201D\u203A\u2E03\u2E05\u2E0A\u2E0D\u2E1D\u2E21\u005F\u203F\u2040\u2054\uFE33\uFE34\uFE4D-\uFE4F\uFF3F\u0021-\u0023\u0025-\u0027\u002A\u002C\u002E\u002F\u003A\u003B\u003F\u0040\u005C\u00A1\u00A7\u00B6\u00B7\u00BF\u037E\u0387\u055A-\u055F\u0589\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u166D\u166E\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u1805\u1807-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2016\u2017\u2020-\u2027\u2030-\u2038\u203B-\u203E\u2041-\u2043\u2047-\u2051\u2053\u2055-\u205E\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00\u2E01\u2E06-\u2E08\u2E0B\u2E0E-\u2E16\u2E18\u2E19\u2E1B\u2E1E\u2E1F\u2E2A-\u2E2E\u2E30-\u2E39\u3001-\u3003\u303D\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFE10-\uFE16\uFE19\uFE30\uFE45\uFE46\uFE49-\uFE4C\uFE50-\uFE52\uFE54-\uFE57\uFE5F-\uFE61\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF07\uFF0A\uFF0C\uFF0E\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3C\uFF61\uFF64\uFF65]/ ),

      isPunctuation: function ( value ) {
        if ( value < 256 ) {
          return ( [33, 34, 35, 37, 38, 39, 40, 41, 42, 44, 45, 46, 47, 58, 59, 63, 64, 91, 92, 93, 95, 123, 125, 161, 171, 173, 183, 187, 191].indexOf( value ) != -1 );
        }

        return System.Char._isPunctuationMatch.test( String.fromCharCode( value ) );
      },

      _isNumberMatch: new RegExp( /[\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19\u0030-\u0039\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19\u16EE-\u16F0\u2160-\u2182\u2185-\u2188\u3007\u3021-\u3029\u3038-\u303A\uA6E6-\uA6EF\u00B2\u00B3\u00B9\u00BC-\u00BE\u09F4-\u09F9\u0B72-\u0B77\u0BF0-\u0BF2\u0C78-\u0C7E\u0D70-\u0D75\u0F2A-\u0F33\u1369-\u137C\u17F0-\u17F9\u19DA\u2070\u2074-\u2079\u2080-\u2089\u2150-\u215F\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA830-\uA835]/ ),

      isNumber: function ( value ) {
        if ( value < 256 ) {
          return ( [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 178, 179, 185, 188, 189, 190].indexOf( value ) != -1 );
        }

        return System.Char._isNumberMatch.test( String.fromCharCode( value ) );
      },

      _isControlMatch: new RegExp( /[\u0000-\u001F\u007F\u0080-\u009F]/ ),

      isControl: function ( value ) {
        if ( value < 256 ) {
          return ( value >= 0 && value <= 31 ) || ( value >= 127 && value <= 159 );
        }

        return System.Char._isControlMatch.test( String.fromCharCode( value ) );
      },

      isLatin1: function ( ch ) {
        return ( ch <= 255 );
      },

      isAscii: function ( ch ) {
        return ( ch <= 127 );
      },

      isUpper: function ( s, index ) {
        if ( s == null ) {
          throw new System.ArgumentNullException.$ctor1( "s" );
        }

        if ( ( index >>> 0 ) >= ( ( s.length ) >>> 0 ) ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "index" );
        }

        var c = s.charCodeAt( index );

        if ( System.Char.isLatin1( c ) ) {
          if ( System.Char.isAscii( c ) ) {
            return ( c >= 65 && c <= 90 );
          }
        }

        return Bridge.isUpper( c );
      },

      equals: function ( v1, v2 ) {
        if ( Bridge.is( v1, System.Char ) && Bridge.is( v2, System.Char ) ) {
          return Bridge.unbox( v1, true ) === Bridge.unbox( v2, true );
        }

        return false;
      },

      equalsT: function ( v1, v2 ) {
        return Bridge.unbox( v1, true ) === Bridge.unbox( v2, true );
      },

      getHashCode: function ( v ) {
        return v | ( v << 16 );
      }
    }
  } );

  Bridge.Class.addExtend( System.Char, [System.IComparable$1( System.Char ), System.IEquatable$1( System.Char )] );

  // @source IConvertible.js

  Bridge.define( "System.IConvertible", {
    $kind: "interface"
  } );

  // @source HResults.js

  Bridge.define( "System.HResults" );

  // @source Exception.js

  Bridge.define( "System.Exception", {
    config: {
      properties: {
        Message: {
          get: function () {
            return this.message;
          }
        },

        InnerException: {
          get: function () {
            return this.innerException;
          }
        },

        StackTrace: {
          get: function () {
            return this.errorStack.stack;
          }
        },

        Data: {
          get: function () {
            return this.data;
          }
        },

        HResult: {
          get: function () {
            return this._HResult;
          },
          set: function ( value ) {
            this._HResult = value;
          }
        }
      }
    },

    ctor: function ( message, innerException ) {
      this.$initialize();
      this.message = message ? message : ( "Exception of type '" + Bridge.getTypeName( this ) + "' was thrown." );
      this.innerException = innerException ? innerException : null;
      this.errorStack = new Error( this.message );
      this.data = new ( System.Collections.Generic.Dictionary$2( System.Object, System.Object ) )();
    },

    getBaseException: function () {
      var inner = this.innerException;
      var back = this;

      while ( inner != null ) {
        back = inner;
        inner = inner.innerException;
      }

      return back;
    },

    toString: function () {
      var builder = Bridge.getTypeName( this );

      if ( this.Message != null ) {
        builder += ": " + this.Message + "\n";
      } else {
        builder += "\n";
      }

      if ( this.StackTrace != null ) {
        builder += this.StackTrace + "\n";
      }

      return builder;
    },

    statics: {
      create: function ( error ) {
        if ( Bridge.is( error, System.Exception ) ) {
          return error;
        }

        var ex;

        if ( error instanceof TypeError ) {
          ex = new System.NullReferenceException.$ctor1( error.message );
        } else if ( error instanceof RangeError ) {
          ex = new System.ArgumentOutOfRangeException.$ctor1( error.message );
        } else if ( error instanceof Error ) {
          return new System.SystemException.$ctor1( error );
        } else if ( error && error.error && error.error.stack ) {
          ex = new System.Exception( error.error.stack );
        } else {
          ex = new System.Exception( error ? error.message ? error.message : error.toString() : null );
        }

        ex.errorStack = error;

        return ex;
      }
    }
  } );

  // @source SystemException.js

  Bridge.define( "System.SystemException", {
    inherits: [System.Exception],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.Exception.ctor.call( this, "System error." );
        this.HResult = -2146233087;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.Exception.ctor.call( this, message );
        this.HResult = -2146233087;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.Exception.ctor.call( this, message, innerException );
        this.HResult = -2146233087;
      }
    }
  } );

  // @source TextInfo.js

  Bridge.define( "System.Globalization.TextInfo", {
    inherits: [System.ICloneable],
    fields: {
      listSeparator: null
    },
    props: {
      ANSICodePage: 0,
      CultureName: null,
      EBCDICCodePage: 0,
      IsReadOnly: false,
      IsRightToLeft: false,
      LCID: 0,
      ListSeparator: {
        get: function () {
          return this.listSeparator;
        },
        set: function ( value ) {
          this.VerifyWritable();

          this.listSeparator = value;
        }
      },
      MacCodePage: 0,
      OEMCodePage: 0
    },
    alias: ["clone", "System$ICloneable$clone"],
    methods: {
      clone: function () {
        return Bridge.copy( new System.Globalization.TextInfo(), this, System.Array.init( ["ANSICodePage", "CultureName", "EBCDICCodePage", "IsRightToLeft", "LCID", "listSeparator", "MacCodePage", "OEMCodePage", "IsReadOnly"], System.String ) );
      },
      VerifyWritable: function () {
        if ( this.IsReadOnly ) {
          throw new System.InvalidOperationException.$ctor1( "Instance is read-only." );
        }
      }
    }
  } );

  // @source Globalization.js

  Bridge.define( "System.Globalization.DateTimeFormatInfo", {
    inherits: [System.IFormatProvider, System.ICloneable],

    config: {
      alias: [
        "getFormat", "System$IFormatProvider$getFormat"
      ]
    },

    statics: {
      $allStandardFormats: {
        "d": "shortDatePattern",
        "D": "longDatePattern",
        "f": "longDatePattern shortTimePattern",
        "F": "longDatePattern longTimePattern",
        "g": "shortDatePattern shortTimePattern",
        "G": "shortDatePattern longTimePattern",
        "m": "monthDayPattern",
        "M": "monthDayPattern",
        "o": "roundtripFormat",
        "O": "roundtripFormat",
        "r": "rfc1123",
        "R": "rfc1123",
        "s": "sortableDateTimePattern",
        "S": "sortableDateTimePattern1",
        "t": "shortTimePattern",
        "T": "longTimePattern",
        "u": "universalSortableDateTimePattern",
        "U": "longDatePattern longTimePattern",
        "y": "yearMonthPattern",
        "Y": "yearMonthPattern"
      },

      ctor: function () {
        this.invariantInfo = Bridge.merge( new System.Globalization.DateTimeFormatInfo(), {
          abbreviatedDayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          abbreviatedMonthGenitiveNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", ""],
          abbreviatedMonthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", ""],
          amDesignator: "AM",
          dateSeparator: "/",
          dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          firstDayOfWeek: 0,
          fullDateTimePattern: "dddd, dd MMMM yyyy HH:mm:ss",
          longDatePattern: "dddd, dd MMMM yyyy",
          longTimePattern: "HH:mm:ss",
          monthDayPattern: "MMMM dd",
          monthGenitiveNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", ""],
          monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", ""],
          pmDesignator: "PM",
          rfc1123: "ddd, dd MMM yyyy HH':'mm':'ss 'GMT'",
          shortDatePattern: "MM/dd/yyyy",
          shortestDayNames: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
          shortTimePattern: "HH:mm",
          sortableDateTimePattern: "yyyy'-'MM'-'dd'T'HH':'mm':'ss",
          sortableDateTimePattern1: "yyyy'-'MM'-'dd",
          timeSeparator: ":",
          universalSortableDateTimePattern: "yyyy'-'MM'-'dd HH':'mm':'ss'Z'",
          yearMonthPattern: "yyyy MMMM",
          roundtripFormat: "yyyy'-'MM'-'dd'T'HH':'mm':'ss.fffffffzzz"
        } );
      }
    },

    getFormat: function ( type ) {
      switch ( type ) {
        case System.Globalization.DateTimeFormatInfo:
          return this;
        default:
          return null;
      }
    },

    getAbbreviatedDayName: function ( dayofweek ) {
      if ( dayofweek < 0 || dayofweek > 6 ) {
        throw new System.ArgumentOutOfRangeException$ctor1( "dayofweek" );
      }

      return this.abbreviatedDayNames[dayofweek];
    },

    getAbbreviatedMonthName: function ( month ) {
      if ( month < 1 || month > 13 ) {
        throw new System.ArgumentOutOfRangeException.$ctor1( "month" );
      }

      return this.abbreviatedMonthNames[month - 1];
    },

    getAllDateTimePatterns: function ( format, returnNull ) {
      var f = System.Globalization.DateTimeFormatInfo.$allStandardFormats,
        formats,
        names,
        pattern,
        i,
        result = [];

      if ( format ) {
        if ( !f[format] ) {
          if ( returnNull ) {
            return null;
          }

          throw new System.ArgumentException.$ctor3( "", "format" );
        }

        formats = {};
        formats[format] = f[format];
      } else {
        formats = f;
      }

      for ( f in formats ) {
        names = formats[f].split( " " );
        pattern = "";

        for ( i = 0; i < names.length; i++ ) {
          pattern = ( i === 0 ? "" : ( pattern + " " ) ) + this[names[i]];
        }

        result.push( pattern );
      }

      return result;
    },

    getDayName: function ( dayofweek ) {
      if ( dayofweek < 0 || dayofweek > 6 ) {
        throw new System.ArgumentOutOfRangeException.$ctor1( "dayofweek" );
      }

      return this.dayNames[dayofweek];
    },

    getMonthName: function ( month ) {
      if ( month < 1 || month > 13 ) {
        throw new System.ArgumentOutOfRangeException.$ctor1( "month" );
      }

      return this.monthNames[month - 1];
    },

    getShortestDayName: function ( dayOfWeek ) {
      if ( dayOfWeek < 0 || dayOfWeek > 6 ) {
        throw new System.ArgumentOutOfRangeException.$ctor1( "dayOfWeek" );
      }

      return this.shortestDayNames[dayOfWeek];
    },

    clone: function () {
      return Bridge.copy( new System.Globalization.DateTimeFormatInfo(), this, [
        "abbreviatedDayNames",
        "abbreviatedMonthGenitiveNames",
        "abbreviatedMonthNames",
        "amDesignator",
        "dateSeparator",
        "dayNames",
        "firstDayOfWeek",
        "fullDateTimePattern",
        "longDatePattern",
        "longTimePattern",
        "monthDayPattern",
        "monthGenitiveNames",
        "monthNames",
        "pmDesignator",
        "rfc1123",
        "shortDatePattern",
        "shortestDayNames",
        "shortTimePattern",
        "sortableDateTimePattern",
        "timeSeparator",
        "universalSortableDateTimePattern",
        "yearMonthPattern",
        "roundtripFormat"
      ] );
    }
  } );

  Bridge.define( "System.Globalization.NumberFormatInfo", {
    inherits: [System.IFormatProvider, System.ICloneable],

    config: {
      alias: [
        "getFormat", "System$IFormatProvider$getFormat"
      ]
    },

    statics: {
      ctor: function () {
        this.numberNegativePatterns = ["(n)", "-n", "- n", "n-", "n -"];
        this.currencyNegativePatterns = ["($n)", "-$n", "$-n", "$n-", "(n$)", "-n$", "n-$", "n$-", "-n $", "-$ n", "n $-", "$ n-", "$ -n", "n- $", "($ n)", "(n $)"];
        this.currencyPositivePatterns = ["$n", "n$", "$ n", "n $"];
        this.percentNegativePatterns = ["-n %", "-n%", "-%n", "%-n", "%n-", "n-%", "n%-", "-% n", "n %-", "% n-", "% -n", "n- %"];
        this.percentPositivePatterns = ["n %", "n%", "%n", "% n"];

        this.invariantInfo = Bridge.merge( new System.Globalization.NumberFormatInfo(), {
          nanSymbol: "NaN",
          negativeSign: "-",
          positiveSign: "+",
          negativeInfinitySymbol: "-Infinity",
          positiveInfinitySymbol: "Infinity",

          percentSymbol: "%",
          percentGroupSizes: [3],
          percentDecimalDigits: 2,
          percentDecimalSeparator: ".",
          percentGroupSeparator: ",",
          percentPositivePattern: 0,
          percentNegativePattern: 0,

          currencySymbol: "¤",
          currencyGroupSizes: [3],
          currencyDecimalDigits: 2,
          currencyDecimalSeparator: ".",
          currencyGroupSeparator: ",",
          currencyNegativePattern: 0,
          currencyPositivePattern: 0,

          numberGroupSizes: [3],
          numberDecimalDigits: 2,
          numberDecimalSeparator: ".",
          numberGroupSeparator: ",",
          numberNegativePattern: 1
        } );
      }
    },

    getFormat: function ( type ) {
      switch ( type ) {
        case System.Globalization.NumberFormatInfo:
          return this;
        default:
          return null;
      }
    },

    clone: function () {
      return Bridge.copy( new System.Globalization.NumberFormatInfo(), this, [
        "nanSymbol",
        "negativeSign",
        "positiveSign",
        "negativeInfinitySymbol",
        "positiveInfinitySymbol",
        "percentSymbol",
        "percentGroupSizes",
        "percentDecimalDigits",
        "percentDecimalSeparator",
        "percentGroupSeparator",
        "percentPositivePattern",
        "percentNegativePattern",
        "currencySymbol",
        "currencyGroupSizes",
        "currencyDecimalDigits",
        "currencyDecimalSeparator",
        "currencyGroupSeparator",
        "currencyNegativePattern",
        "currencyPositivePattern",
        "numberGroupSizes",
        "numberDecimalDigits",
        "numberDecimalSeparator",
        "numberGroupSeparator",
        "numberNegativePattern"
      ] );
    }
  } );

  Bridge.define( "System.Globalization.CultureInfo", {
    inherits: [System.IFormatProvider, System.ICloneable],

    config: {
      alias: [
        "getFormat", "System$IFormatProvider$getFormat"
      ]
    },

    $entryPoint: true,

    statics: {
      ctor: function () {
        this.cultures = this.cultures || {};

        this.invariantCulture = Bridge.merge( new System.Globalization.CultureInfo( "iv", true ), {
          englishName: "Invariant Language (Invariant Country)",
          nativeName: "Invariant Language (Invariant Country)",
          numberFormat: System.Globalization.NumberFormatInfo.invariantInfo,
          dateTimeFormat: System.Globalization.DateTimeFormatInfo.invariantInfo,
          TextInfo: Bridge.merge( new System.Globalization.TextInfo(), {
            ANSICodePage: 1252,
            CultureName: "",
            EBCDICCodePage: 37,
            listSeparator: ",",
            IsRightToLeft: false,
            LCID: 127,
            MacCodePage: 10000,
            OEMCodePage: 437,
            IsReadOnly: true
          } )
        } );

        this.setCurrentCulture( System.Globalization.CultureInfo.invariantCulture );
      },

      getCurrentCulture: function () {
        return this.currentCulture;
      },

      setCurrentCulture: function ( culture ) {
        this.currentCulture = culture;

        System.Globalization.DateTimeFormatInfo.currentInfo = culture.dateTimeFormat;
        System.Globalization.NumberFormatInfo.currentInfo = culture.numberFormat;
      },

      getCultureInfo: function ( name ) {
        if ( name == null ) {
          throw new System.ArgumentNullException.$ctor1( "name" );
        } else if ( name === "" ) {
          return System.Globalization.CultureInfo.invariantCulture;
        }

        var c = this.cultures[name];

        if ( c == null ) {
          throw new System.Globalization.CultureNotFoundException.$ctor5( "name", name );
        }

        return c;
      },

      getCultures: function () {
        var names = Bridge.getPropertyNames( this.cultures ),
          result = [],
          i;

        for ( i = 0; i < names.length; i++ ) {
          result.push( this.cultures[names[i]] );
        }

        return result;
      }
    },

    ctor: function ( name, create ) {
      this.$initialize();
      this.name = name;

      if ( !System.Globalization.CultureInfo.cultures ) {
        System.Globalization.CultureInfo.cultures = {};
      }

      if ( name == null ) {
        throw new System.ArgumentNullException.$ctor1( "name" );
      }

      var c;

      if ( name === "" ) {
        c = System.Globalization.CultureInfo.invariantCulture;
      } else {
        c = System.Globalization.CultureInfo.cultures[name];
      }

      if ( c == null ) {
        if ( !create ) {
          throw new System.Globalization.CultureNotFoundException.$ctor5( "name", name );
        }

        System.Globalization.CultureInfo.cultures[name] = this;
      } else {
        Bridge.copy( this, c, [
          "englishName",
          "nativeName",
          "numberFormat",
          "dateTimeFormat",
          "TextInfo"
        ] );

        this.TextInfo.IsReadOnly = false;
      }
    },

    getFormat: function ( type ) {
      switch ( type ) {
        case System.Globalization.NumberFormatInfo:
          return this.numberFormat;
        case System.Globalization.DateTimeFormatInfo:
          return this.dateTimeFormat;
        default:
          return null;
      }
    },

    clone: function () {
      return new System.Globalization.CultureInfo( this.name );
    }
  } );

  // @source TypeCode.js

  Bridge.define( "System.TypeCode", {
    $kind: "enum",
    statics: {
      fields: {
        Empty: 0,
        Object: 1,
        DBNull: 2,
        Boolean: 3,
        Char: 4,
        SByte: 5,
        Byte: 6,
        Int16: 7,
        UInt16: 8,
        Int32: 9,
        UInt32: 10,
        Int64: 11,
        UInt64: 12,
        Single: 13,
        Double: 14,
        Decimal: 15,
        DateTime: 16,
        String: 18
      }
    }
  } );

  // @source TypeCodeValues.js

  Bridge.define( "System.TypeCodeValues", {
    statics: {
      fields: {
        Empty: null,
        Object: null,
        DBNull: null,
        Boolean: null,
        Char: null,
        SByte: null,
        Byte: null,
        Int16: null,
        UInt16: null,
        Int32: null,
        UInt32: null,
        Int64: null,
        UInt64: null,
        Single: null,
        Double: null,
        Decimal: null,
        DateTime: null,
        String: null
      },
      ctors: {
        init: function () {
          this.Empty = "0";
          this.Object = "1";
          this.DBNull = "2";
          this.Boolean = "3";
          this.Char = "4";
          this.SByte = "5";
          this.Byte = "6";
          this.Int16 = "7";
          this.UInt16 = "8";
          this.Int32 = "9";
          this.UInt32 = "10";
          this.Int64 = "11";
          this.UInt64 = "12";
          this.Single = "13";
          this.Double = "14";
          this.Decimal = "15";
          this.DateTime = "16";
          this.String = "18";
        }
      }
    }
  } );

  // @source Type.js

  Bridge.define( "System.Type", {

    statics: {
      $is: function ( instance ) {
        return instance && instance.constructor === Function;
      },

      getTypeCode: function ( t ) {
        if ( t == null ) {
          return System.TypeCode.Empty;
        }
        if ( t === System.Double ) {
          return System.TypeCode.Double;
        }
        if ( t === System.Single ) {
          return System.TypeCode.Single;
        }
        if ( t === System.Decimal ) {
          return System.TypeCode.Decimal;
        }
        if ( t === System.Byte ) {
          return System.TypeCode.Byte;
        }
        if ( t === System.SByte ) {
          return System.TypeCode.SByte;
        }
        if ( t === System.UInt16 ) {
          return System.TypeCode.UInt16;
        }
        if ( t === System.Int16 ) {
          return System.TypeCode.Int16;
        }
        if ( t === System.UInt32 ) {
          return System.TypeCode.UInt32;
        }
        if ( t === System.Int32 ) {
          return System.TypeCode.Int32;
        }
        if ( t === System.UInt64 ) {
          return System.TypeCode.UInt64;
        }
        if ( t === System.Int64 ) {
          return System.TypeCode.Int64;
        }
        if ( t === System.Boolean ) {
          return System.TypeCode.Boolean;
        }
        if ( t === System.Char ) {
          return System.TypeCode.Char;
        }
        if ( t === System.DateTime ) {
          return System.TypeCode.DateTime;
        }
        if ( t === System.String ) {
          return System.TypeCode.String;
        }
        return System.TypeCode.Object;
      }
    }
  } );

  // @source Bool.js

  Bridge.define( "System.Boolean", {
    inherits: [System.IComparable],

    statics: {
      trueString: "True",
      falseString: "False",

      $is: function ( instance ) {
        return typeof ( instance ) === "boolean";
      },

      getDefaultValue: function () {
        return false;
      },

      createInstance: function () {
        return false;
      },

      toString: function ( v ) {
        return v ? System.Boolean.trueString : System.Boolean.falseString;
      },

      parse: function ( value ) {
        if ( !Bridge.hasValue( value ) ) {
          throw new System.ArgumentNullException.$ctor1( "value" );
        }

        var result = {
          v: false
        };

        if ( !System.Boolean.tryParse( value, result ) ) {
          throw new System.FormatException.$ctor1( "Bad format for Boolean value" );
        }

        return result.v;
      },

      tryParse: function ( value, result ) {
        result.v = false;

        if ( !Bridge.hasValue( value ) ) {
          return false;
        }

        if ( System.String.equals( System.Boolean.trueString, value, 5 ) ) {
          result.v = true;
          return true;
        }

        if ( System.String.equals( System.Boolean.falseString, value, 5 ) ) {
          result.v = false;
          return true;
        }

        var start = 0,
          end = value.length - 1;

        while ( start < value.length ) {
          if ( !System.Char.isWhiteSpace( value[start] ) && !System.Char.isNull( value.charCodeAt( start ) ) ) {
            break;
          }

          start++;
        }

        while ( end >= start ) {
          if ( !System.Char.isWhiteSpace( value[end] ) && !System.Char.isNull( value.charCodeAt( end ) ) ) {
            break;
          }

          end--;
        }

        value = value.substr( start, end - start + 1 );

        if ( System.String.equals( System.Boolean.trueString, value, 5 ) ) {
          result.v = true;

          return true;
        }

        if ( System.String.equals( System.Boolean.falseString, value, 5 ) ) {
          result.v = false;

          return true;
        }

        return false;
      }
    }
  } );

  System.Boolean.$kind = "";
  Bridge.Class.addExtend( System.Boolean, [System.IComparable$1( System.Boolean ), System.IEquatable$1( System.Boolean )] );

  // @source Integer.js

  Bridge.define( "Bridge.Int", {
    inherits: [System.IComparable, System.IFormattable],
    statics: {
      $number: true,

      MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER || Math.pow( 2, 53 ) - 1,
      MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER || -( Math.pow( 2, 53 ) - 1 ),

      $is: function ( instance ) {
        return typeof ( instance ) === "number" && isFinite( instance ) && Math.floor( instance, 0 ) === instance;
      },

      getDefaultValue: function () {
        return 0;
      },

      format: function ( number, format, provider, T, toUnsign ) {
        var nf = ( provider || System.Globalization.CultureInfo.getCurrentCulture() ).getFormat( System.Globalization.NumberFormatInfo ),
          decimalSeparator = nf.numberDecimalSeparator,
          groupSeparator = nf.numberGroupSeparator,
          isDecimal = number instanceof System.Decimal,
          isLong = number instanceof System.Int64 || number instanceof System.UInt64,
          isNeg = isDecimal || isLong ? ( number.isZero() ? false : number.isNegative() ) : number < 0,
          match,
          precision,
          groups,
          fs;

        if ( !isLong && ( isDecimal ? !number.isFinite() : !isFinite( number ) ) ) {
          return Number.NEGATIVE_INFINITY === number || ( isDecimal && isNeg ) ? nf.negativeInfinitySymbol : ( isNaN( number ) ? nf.nanSymbol : nf.positiveInfinitySymbol );
        }

        if ( !format ) {
          format = "G";
        }

        match = format.match( /^([a-zA-Z])(\d*)$/ );

        if ( match ) {
          fs = match[1].toUpperCase();
          precision = parseInt( match[2], 10 );
          //precision = precision > 15 ? 15 : precision;

          switch ( fs ) {
            case "D":
              return this.defaultFormat( number, isNaN( precision ) ? 1 : precision, 0, 0, nf, true );
            case "F":
            case "N":
              if ( isNaN( precision ) ) {
                precision = nf.numberDecimalDigits;
              }

              return this.defaultFormat( number, 1, precision, precision, nf, fs === "F" );
            case "G":
            case "E":
              var exponent = 0,
                coefficient = isDecimal || isLong ? ( isLong && number.eq( System.Int64.MinValue ) ? System.Int64( number.value.toUnsigned() ) : number.abs() ) : Math.abs( number ),
                exponentPrefix = match[1],
                exponentPrecision = 3,
                minDecimals,
                maxDecimals;

              while ( isDecimal || isLong ? coefficient.gte( 10 ) : ( coefficient >= 10 ) ) {
                if ( isDecimal || isLong ) {
                  coefficient = coefficient.div( 10 );
                } else {
                  coefficient /= 10;
                }

                exponent++;
              }

              while ( isDecimal || isLong ? ( coefficient.ne( 0 ) && coefficient.lt( 1 ) ) : ( coefficient !== 0 && coefficient < 1 ) ) {
                if ( isDecimal || isLong ) {
                  coefficient = coefficient.mul( 10 );
                } else {
                  coefficient *= 10;
                }

                exponent--;
              }

              if ( fs === "G" ) {
                var noPrecision = isNaN( precision );

                if ( noPrecision ) {
                  if ( isDecimal ) {
                    precision = 29;
                  } else if ( isLong ) {
                    precision = number instanceof System.Int64 ? 19 : 20;
                  } else if ( T && T.precision ) {
                    precision = T.precision;
                  } else {
                    precision = 15;
                  }
                }

                if ( ( exponent > -5 && exponent < precision ) || isDecimal && noPrecision ) {
                  minDecimals = 0;
                  maxDecimals = precision - ( exponent > 0 ? exponent + 1 : 1 );

                  return this.defaultFormat( number, 1, isDecimal ? Math.min( 27, Math.max( minDecimals, number.$precision ) ) : minDecimals, maxDecimals, nf, true );
                }

                exponentPrefix = exponentPrefix === "G" ? "E" : "e";
                exponentPrecision = 2;
                minDecimals = 0;
                maxDecimals = ( precision || 15 ) - 1;
              } else {
                minDecimals = maxDecimals = isNaN( precision ) ? 6 : precision;
              }

              if ( exponent >= 0 ) {
                exponentPrefix += nf.positiveSign;
              } else {
                exponentPrefix += nf.negativeSign;
                exponent = -exponent;
              }

              if ( isNeg ) {
                if ( isDecimal || isLong ) {
                  coefficient = coefficient.mul( -1 );
                } else {
                  coefficient *= -1;
                }
              }

              return this.defaultFormat( coefficient, 1, isDecimal ? Math.min( 27, Math.max( minDecimals, number.$precision ) ) : minDecimals, maxDecimals, nf ) + exponentPrefix + this.defaultFormat( exponent, exponentPrecision, 0, 0, nf, true );
            case "P":
              if ( isNaN( precision ) ) {
                precision = nf.percentDecimalDigits;
              }

              return this.defaultFormat( number * 100, 1, precision, precision, nf, false, "percent" );
            case "X":
              var result;

              if ( isDecimal ) {
                result = number.round().value.toHex().substr( 2 );
              } else if ( isLong ) {
                var uvalue = toUnsign ? toUnsign( number ) : number;
                result = uvalue.toString( 16 );
              } else {
                var uvalue = toUnsign ? toUnsign( Math.round( number ) ) : Math.round( number ) >>> 0;
                result = uvalue.toString( 16 );
              }

              if ( match[1] === "X" ) {
                result = result.toUpperCase();
              }

              precision -= result.length;

              while ( precision-- > 0 ) {
                result = "0" + result;
              }

              return result;
            case "C":
              if ( isNaN( precision ) ) {
                precision = nf.currencyDecimalDigits;
              }

              return this.defaultFormat( number, 1, precision, precision, nf, false, "currency" );
            case "R":
              var r_result = isDecimal || isLong ? ( number.toString() ) : ( "" + number );

              if ( decimalSeparator !== "." ) {
                r_result = r_result.replace( ".", decimalSeparator );
              }

              r_result = r_result.replace( "e", "E" );

              return r_result;
          }
        }

        if ( format.indexOf( ",." ) !== -1 || System.String.endsWith( format, "," ) ) {
          var count = 0,
            index = format.indexOf( ",." );

          if ( index === -1 ) {
            index = format.length - 1;
          }

          while ( index > -1 && format.charAt( index ) === "," ) {
            count++;
            index--;
          }

          if ( isDecimal || isLong ) {
            number = number.div( Math.pow( 1000, count ) );
          } else {
            number /= Math.pow( 1000, count );
          }
        }

        if ( format.indexOf( "%" ) !== -1 ) {
          if ( isDecimal || isLong ) {
            number = number.mul( 100 );
          } else {
            number *= 100;
          }
        }

        if ( format.indexOf( "‰" ) !== -1 ) {
          if ( isDecimal || isLong ) {
            number = number.mul( 1000 );
          } else {
            number *= 1000;
          }
        }

        groups = format.split( ";" );

        if ( ( isDecimal || isLong ? number.lt( 0 ) : ( number < 0 ) ) && groups.length > 1 ) {
          if ( isDecimal || isLong ) {
            number = number.mul( -1 );
          } else {
            number *= -1;
          }

          format = groups[1];
        } else {
          format = groups[( isDecimal || isLong ? number.ne( 0 ) : !number ) && groups.length > 2 ? 2 : 0];
        }

        return this.customFormat( number, format, nf, !format.match( /^[^\.]*[0#],[0#]/ ) );
      },

      defaultFormat: function ( number, minIntLen, minDecLen, maxDecLen, provider, noGroup, name ) {
        name = name || "number";

        var nf = ( provider || System.Globalization.CultureInfo.getCurrentCulture() ).getFormat( System.Globalization.NumberFormatInfo ),
          str,
          decimalIndex,
          pattern,
          roundingFactor,
          groupIndex,
          groupSize,
          groups = nf[name + "GroupSizes"],
          decimalPart,
          index,
          done,
          startIndex,
          length,
          part,
          sep,
          buffer = "",
          isDecimal = number instanceof System.Decimal,
          isLong = number instanceof System.Int64 || number instanceof System.UInt64,
          isNeg = isDecimal || isLong ? ( number.isZero() ? false : number.isNegative() ) : number < 0,
          isZero = false;

        roundingFactor = Math.pow( 10, maxDecLen );

        if ( isDecimal ) {
          str = number.abs().toDecimalPlaces( maxDecLen ).toFixed();
        } else if ( isLong ) {
          str = number.eq( System.Int64.MinValue ) ? number.value.toUnsigned().toString() : number.abs().toString();
        } else {
          str = "" + ( +Math.abs( number ).toFixed( maxDecLen ) );
        }

        isZero = str.split( "" ).every( function ( s ) { return s === "0" || s === "."; } );

        decimalIndex = str.indexOf( "." );

        if ( decimalIndex > 0 ) {
          decimalPart = nf[name + "DecimalSeparator"] + str.substr( decimalIndex + 1 );
          str = str.substr( 0, decimalIndex );
        }

        if ( str.length < minIntLen ) {
          str = Array( minIntLen - str.length + 1 ).join( "0" ) + str;
        }

        if ( decimalPart ) {
          if ( ( decimalPart.length - 1 ) < minDecLen ) {
            decimalPart += Array( minDecLen - decimalPart.length + 2 ).join( "0" );
          }

          if ( maxDecLen === 0 ) {
            decimalPart = null;
          } else if ( ( decimalPart.length - 1 ) > maxDecLen ) {
            decimalPart = decimalPart.substr( 0, maxDecLen + 1 );
          }
        } else if ( minDecLen > 0 ) {
          decimalPart = nf[name + "DecimalSeparator"] + Array( minDecLen + 1 ).join( "0" );
        }

        groupIndex = 0;
        groupSize = groups[groupIndex];

        if ( str.length < groupSize ) {
          buffer = str;

          if ( decimalPart ) {
            buffer += decimalPart;
          }
        } else {
          index = str.length;
          done = false;
          sep = noGroup ? "" : nf[name + "GroupSeparator"];

          while ( !done ) {
            length = groupSize;
            startIndex = index - length;

            if ( startIndex < 0 ) {
              groupSize += startIndex;
              length += startIndex;
              startIndex = 0;
              done = true;
            }

            if ( !length ) {
              break;
            }

            part = str.substr( startIndex, length );

            if ( buffer.length ) {
              buffer = part + sep + buffer;
            } else {
              buffer = part;
            }

            index -= length;

            if ( groupIndex < groups.length - 1 ) {
              groupIndex++;
              groupSize = groups[groupIndex];
            }
          }

          if ( decimalPart ) {
            buffer += decimalPart;
          }
        }

        if ( isNeg && !isZero ) {
          pattern = System.Globalization.NumberFormatInfo[name + "NegativePatterns"][nf[name + "NegativePattern"]];

          return pattern.replace( "-", nf.negativeSign ).replace( "%", nf.percentSymbol ).replace( "$", nf.currencySymbol ).replace( "n", buffer );
        } else if ( System.Globalization.NumberFormatInfo[name + "PositivePatterns"] ) {
          pattern = System.Globalization.NumberFormatInfo[name + "PositivePatterns"][nf[name + "PositivePattern"]];

          return pattern.replace( "%", nf.percentSymbol ).replace( "$", nf.currencySymbol ).replace( "n", buffer );
        }

        return buffer;
      }
    }
  } );

  // @source Long.js

  System.Int64 = function ( l ) {
    return;
  };

  System.Int64.getValue = function ( l ) {
    return;
  };

  /* ULONG */

  System.UInt64 = function ( l ) {
    return;
  };

  // @source Decimal.js

  System.Decimal = function ( v, provider, T ) {
    return;
  };

  // @source TimeSpan.js

  Bridge.define( "System.TimeSpan", {
    inherits: [System.IComparable],

    config: {
      alias: [
        "compareTo", ["System$IComparable$compareTo", "System$IComparable$1$compareTo", "System$IComparable$1System$TimeSpan$compareTo"]
      ]
    },

    $kind: "struct",
    statics: {
      fromDays: function ( value ) {
        return new System.TimeSpan( value * 864e9 );
      },

      fromHours: function ( value ) {
        return new System.TimeSpan( value * 36e9 );
      },

      fromMilliseconds: function ( value ) {
        return new System.TimeSpan( value * 1e4 );
      },

      fromMinutes: function ( value ) {
        return new System.TimeSpan( value * 6e8 );
      },

      fromSeconds: function ( value ) {
        return new System.TimeSpan( value * 1e7 );
      },

      fromTicks: function ( value ) {
        return new System.TimeSpan( value );
      },

      ctor: function () {
        this.zero = new System.TimeSpan( System.Int64.Zero );
        this.maxValue = new System.TimeSpan( System.Int64.MaxValue );
        this.minValue = new System.TimeSpan( System.Int64.MinValue );
      },

      getDefaultValue: function () {
        return new System.TimeSpan( System.Int64.Zero );
      },

      neg: function ( t ) {
        return Bridge.hasValue( t ) ? ( new System.TimeSpan( t.ticks.neg() ) ) : null;
      },

      sub: function ( t1, t2 ) {
        return Bridge.hasValue$1( t1, t2 ) ? ( new System.TimeSpan( t1.ticks.sub( t2.ticks ) ) ) : null;
      },

      eq: function ( t1, t2 ) {
        if ( t1 === null && t2 === null ) {
          return true;
        }

        return Bridge.hasValue$1( t1, t2 ) ? ( t1.ticks.eq( t2.ticks ) ) : false;
      },

      neq: function ( t1, t2 ) {
        if ( t1 === null && t2 === null ) {
          return false;
        }

        return Bridge.hasValue$1( t1, t2 ) ? ( t1.ticks.ne( t2.ticks ) ) : true;
      },

      plus: function ( t ) {
        return Bridge.hasValue( t ) ? ( new System.TimeSpan( t.ticks ) ) : null;
      },

      add: function ( t1, t2 ) {
        return Bridge.hasValue$1( t1, t2 ) ? ( new System.TimeSpan( t1.ticks.add( t2.ticks ) ) ) : null;
      },

      gt: function ( a, b ) {
        return Bridge.hasValue$1( a, b ) ? ( a.ticks.gt( b.ticks ) ) : false;
      },

      gte: function ( a, b ) {
        return Bridge.hasValue$1( a, b ) ? ( a.ticks.gte( b.ticks ) ) : false;
      },

      lt: function ( a, b ) {
        return Bridge.hasValue$1( a, b ) ? ( a.ticks.lt( b.ticks ) ) : false;
      },

      lte: function ( a, b ) {
        return Bridge.hasValue$1( a, b ) ? ( a.ticks.lte( b.ticks ) ) : false;
      },

      timeSpanWithDays: /^(\-)?(\d+)[\.|:](\d+):(\d+):(\d+)(\.\d+)?/,
      timeSpanNoDays: /^(\-)?(\d+):(\d+):(\d+)(\.\d+)?/,

      parse: function ( value ) {
        var match,
          milliseconds;

        function parseMilliseconds( value ) {
          return value ? parseFloat( '0' + value ) * 1000 : 0;
        }

        if ( ( match = value.match( System.TimeSpan.timeSpanWithDays ) ) ) {
          var ts = new System.TimeSpan( match[2], match[3], match[4], match[5], parseMilliseconds( match[6] ) );

          return match[1] ? new System.TimeSpan( ts.ticks.neg() ) : ts;
        }

        if ( ( match = value.match( System.TimeSpan.timeSpanNoDays ) ) ) {
          var ts = new System.TimeSpan( 0, match[2], match[3], match[4], parseMilliseconds( match[5] ) );

          return match[1] ? new System.TimeSpan( ts.ticks.neg() ) : ts;
        }

        return null;
      },

      tryParse: function ( value, provider, result ) {
        result.v = this.parse( value );

        if ( result.v == null ) {
          result.v = this.minValue;

          return false;
        }

        return true;
      }
    },

    ctor: function () {
      this.$initialize();
      this.ticks = System.Int64.Zero;

      if ( arguments.length === 1 ) {
        this.ticks = arguments[0] instanceof System.Int64 ? arguments[0] : new System.Int64( arguments[0] );
      } else if ( arguments.length === 3 ) {
        this.ticks = new System.Int64( arguments[0] ).mul( 60 ).add( arguments[1] ).mul( 60 ).add( arguments[2] ).mul( 1e7 );
      } else if ( arguments.length === 4 ) {
        this.ticks = new System.Int64( arguments[0] ).mul( 24 ).add( arguments[1] ).mul( 60 ).add( arguments[2] ).mul( 60 ).add( arguments[3] ).mul( 1e7 );
      } else if ( arguments.length === 5 ) {
        this.ticks = new System.Int64( arguments[0] ).mul( 24 ).add( arguments[1] ).mul( 60 ).add( arguments[2] ).mul( 60 ).add( arguments[3] ).mul( 1e3 ).add( arguments[4] ).mul( 1e4 );
      }
    },

    TimeToTicks: function ( hour, minute, second ) {
      var totalSeconds = System.Int64( hour ).mul( "3600" ).add( System.Int64( minute ).mul( "60" ) ).add( System.Int64( second ) );
      return totalSeconds.mul( "10000000" );
    },

    getTicks: function () {
      return this.ticks;
    },

    getDays: function () {
      return this.ticks.div( 864e9 ).toNumber();
    },

    getHours: function () {
      return this.ticks.div( 36e9 ).mod( 24 ).toNumber();
    },

    getMilliseconds: function () {
      return this.ticks.div( 1e4 ).mod( 1e3 ).toNumber();
    },

    getMinutes: function () {
      return this.ticks.div( 6e8 ).mod( 60 ).toNumber();
    },

    getSeconds: function () {
      return this.ticks.div( 1e7 ).mod( 60 ).toNumber();
    },

    getTotalDays: function () {
      return this.ticks.toNumberDivided( 864e9 );
    },

    getTotalHours: function () {
      return this.ticks.toNumberDivided( 36e9 );
    },

    getTotalMilliseconds: function () {
      return this.ticks.toNumberDivided( 1e4 );
    },

    getTotalMinutes: function () {
      return this.ticks.toNumberDivided( 6e8 );
    },

    getTotalSeconds: function () {
      return this.ticks.toNumberDivided( 1e7 );
    },

    get12HourHour: function () {
      return ( this.getHours() > 12 ) ? this.getHours() - 12 : ( this.getHours() === 0 ) ? 12 : this.getHours();
    },

    add: function ( ts ) {
      return new System.TimeSpan( this.ticks.add( ts.ticks ) );
    },

    subtract: function ( ts ) {
      return new System.TimeSpan( this.ticks.sub( ts.ticks ) );
    },

    duration: function () {
      return new System.TimeSpan( this.ticks.abs() );
    },

    negate: function () {
      return new System.TimeSpan( this.ticks.neg() );
    },

    compareTo: function ( other ) {
      return this.ticks.compareTo( other.ticks );
    },

    equals: function ( other ) {
      return Bridge.is( other, System.TimeSpan ) ? other.ticks.eq( this.ticks ) : false;
    },

    equalsT: function ( other ) {
      return other.ticks.eq( this.ticks );
    },

    format: function ( formatStr, provider ) {
      return this.toString( formatStr, provider );
    },

    getHashCode: function () {
      return this.ticks.getHashCode();
    },

    toString: function ( formatStr, provider ) {
      var ticks = this.ticks,
        result = "",
        me = this,
        dtInfo = ( provider || System.Globalization.CultureInfo.getCurrentCulture() ).getFormat( System.Globalization.DateTimeFormatInfo ),
        format = function ( t, n, dir, cut ) {
          return System.String.alignString( Math.abs( t | 0 ).toString(), n || 2, "0", dir || 2, cut || false );
        },
        isNeg = ticks < 0;

      if ( formatStr ) {
        return formatStr.replace( /(\\.|'[^']*'|"[^"]*"|dd?|HH?|hh?|mm?|ss?|tt?|f{1,7}|\:|\/)/g,
          function ( match, group, index ) {
            var part = match;

            switch ( match ) {
              case "d":
                return me.getDays();
              case "dd":
                return format( me.getDays() );
              case "H":
                return me.getHours();
              case "HH":
                return format( me.getHours() );
              case "h":
                return me.get12HourHour();
              case "hh":
                return format( me.get12HourHour() );
              case "m":
                return me.getMinutes();
              case "mm":
                return format( me.getMinutes() );
              case "s":
                return me.getSeconds();
              case "ss":
                return format( me.getSeconds() );
              case "t":
                return ( ( me.getHours() < 12 ) ? dtInfo.amDesignator : dtInfo.pmDesignator ).substring( 0, 1 );
              case "tt":
                return ( me.getHours() < 12 ) ? dtInfo.amDesignator : dtInfo.pmDesignator;
              case "f":
              case "ff":
              case "fff":
              case "ffff":
              case "fffff":
              case "ffffff":
              case "fffffff":
                return format( me.getMilliseconds(), match.length, 1, true );
              default:
                return match.substr( 1, match.length - 1 - ( match.charAt( 0 ) !== "\\" ) );
            }
          }
        );
      }

      if ( ticks.abs().gte( 864e9 ) ) {
        result += format( ticks.toNumberDivided( 864e9 ), 1 ) + ".";
        ticks = ticks.mod( 864e9 );
      }

      result += format( ticks.toNumberDivided( 36e9 ) ) + ":";
      ticks = ticks.mod( 36e9 );
      result += format( ticks.toNumberDivided( 6e8 ) | 0 ) + ":";
      ticks = ticks.mod( 6e8 );
      result += format( ticks.toNumberDivided( 1e7 ) );
      ticks = ticks.mod( 1e7 );

      if ( ticks.gt( 0 ) ) {
        result += "." + format( ticks.toNumber(), 7 );
      }

      return ( isNeg ? "-" : "" ) + result;
    }
  } );

  Bridge.Class.addExtend( System.TimeSpan, [System.IComparable$1( System.TimeSpan ), System.IEquatable$1( System.TimeSpan )] );

  // @source StringBuilder.js

  Bridge.define( "System.Text.StringBuilder", {
    ctor: function () {
      this.$initialize();
      this.buffer = [],
        this.capacity = 16;

      if ( arguments.length === 1 ) {
        this.append( arguments[0] );
      } else if ( arguments.length === 2 ) {
        this.append( arguments[0] );
        this.setCapacity( arguments[1] );
      } else if ( arguments.length >= 3 ) {
        this.append( arguments[0], arguments[1], arguments[2] );
        if ( arguments.length === 4 ) {
          this.setCapacity( arguments[3] );
        }
      }
    },

    getLength: function () {
      if ( this.buffer.length < 2 ) {
        return this.buffer[0] ? this.buffer[0].length : 0;
      }

      var s = this.getString();

      return s.length;
    },

    setLength: function ( value ) {
      if ( value === 0 ) {
        this.clear();
      } else if ( value < 0 ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "value", "Length cannot be less than zero" );
      } else {
        var l = this.getLength();

        if ( value === l ) {
          return;
        }

        var delta = value - l;

        if ( delta > 0 ) {
          this.append( "\0", delta );
        } else {
          this.remove( l + delta, -delta );
        }
      }
    },

    getCapacity: function () {
      var length = this.getLength();

      return ( this.capacity > length ) ? this.capacity : length;
    },

    setCapacity: function ( value ) {
      var length = this.getLength();

      if ( value > length ) {
        this.capacity = value;
      }
    },

    toString: function () {
      var s = this.getString();

      if ( arguments.length === 2 ) {
        var startIndex = arguments[0],
          length = arguments[1];

        this.checkLimits( s, startIndex, length );

        return s.substr( startIndex, length );
      }

      return s;
    },

    append: function ( value ) {
      if ( value == null ) {
        return this;
      }

      if ( arguments.length === 2 ) {
        // append a char repeated count times
        var count = arguments[1];

        if ( count === 0 ) {
          return this;
        } else if ( count < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "count", "cannot be less than zero" );
        }

        value = Array( count + 1 ).join( value ).toString();
      } else if ( arguments.length === 3 ) {
        // append a (startIndex, count) substring of value
        var startIndex = arguments[1],
          count = arguments[2];

        if ( count === 0 ) {
          return this;
        }

        this.checkLimits( value, startIndex, count );
        value = value.substr( startIndex, count );
      }

      this.buffer[this.buffer.length] = value;
      this.clearString();

      return this;
    },

    appendFormat: function ( format ) {
      return this.append( System.String.format.apply( System.String, arguments ) );
    },

    clear: function () {
      this.buffer = [];
      this.clearString();

      return this;
    },

    appendLine: function () {
      if ( arguments.length === 1 ) {
        this.append( arguments[0] );
      }

      return this.append( "\r\n" );
    },

    equals: function ( sb ) {
      if ( sb == null ) {
        return false;
      }

      if ( sb === this ) {
        return true;
      }

      return this.toString() === sb.toString();
    },

    remove: function ( startIndex, length ) {
      var s = this.getString();

      this.checkLimits( s, startIndex, length );

      if ( s.length === length && startIndex === 0 ) {
        // Optimization.  If we are deleting everything
        return this.clear();
      }

      if ( length > 0 ) {
        this.buffer = [];
        this.buffer[0] = s.substring( 0, startIndex );
        this.buffer[1] = s.substring( startIndex + length, s.length );
        this.clearString();
      }

      return this;
    },

    insert: function ( index, value ) {
      if ( value == null ) {
        return this;
      }

      if ( arguments.length === 3 ) {
        // insert value repeated count times
        var count = arguments[2];

        if ( count === 0 ) {
          return this;
        } else if ( count < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "count", "cannot be less than zero" );
        }

        value = Array( count + 1 ).join( value ).toString();
      }

      var s = this.getString();

      this.buffer = [];

      if ( index < 1 ) {
        this.buffer[0] = value;
        this.buffer[1] = s;
      } else if ( index >= s.length ) {
        this.buffer[0] = s;
        this.buffer[1] = value;
      } else {
        this.buffer[0] = s.substring( 0, index );
        this.buffer[1] = value;
        this.buffer[2] = s.substring( index, s.length );
      }

      this.clearString();

      return this;
    },

    replace: function ( oldValue, newValue ) {
      var r = new RegExp( oldValue, "g" ),
        s = this.buffer.join( "" );

      this.buffer = [];

      if ( arguments.length === 4 ) {
        var startIndex = arguments[2],
          count = arguments[3],
          b = s.substr( startIndex, count );

        this.checkLimits( s, startIndex, count );

        this.buffer[0] = s.substring( 0, startIndex );
        this.buffer[1] = b.replace( r, newValue );
        this.buffer[2] = s.substring( startIndex + count, s.length );
      } else {
        this.buffer[0] = s.replace( r, newValue );
      }

      this.clearString();
      return this;
    },

    checkLimits: function ( value, startIndex, length ) {
      if ( length < 0 ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "length", "must be non-negative" );
      }

      if ( startIndex < 0 ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "startIndex", "startIndex cannot be less than zero" );
      }

      if ( length > value.length - startIndex ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "Index and length must refer to a location within the string" );
      }
    },

    clearString: function () {
      this.$str = null;
    },

    getString: function () {
      if ( !this.$str ) {
        this.$str = this.buffer.join( "" );
        this.buffer = [];
        this.buffer[0] = this.$str;
      }

      return this.$str;
    },

    getChar: function ( index ) {
      var str = this.getString();

      if ( index < 0 || index >= str.length ) {
        throw new System.IndexOutOfRangeException();
      }

      return str.charCodeAt( index );
    },

    setChar: function ( index, value ) {
      var str = this.getString();

      if ( index < 0 || index >= str.length ) {
        throw new System.ArgumentOutOfRangeException();
      }

      value = String.fromCharCode( value );
      this.buffer = [];
      this.buffer[0] = str.substring( 0, index );
      this.buffer[1] = value;
      this.buffer[2] = str.substring( index + 1, str.length );
      this.clearString();
    }
  } );

  // @source Array.js

  var array = {
    toIndex: function ( arr, indices ) {
      if ( indices.length !== ( arr.$s ? arr.$s.length : 1 ) ) {
        throw new System.ArgumentException.$ctor1( "Invalid number of indices" );
      }

      if ( indices[0] < 0 || indices[0] >= ( arr.$s ? arr.$s[0] : arr.length ) ) {
        throw new System.IndexOutOfRangeException.$ctor1( "Index 0 out of range" );
      }

      var idx = indices[0],
        i;

      if ( arr.$s ) {
        for ( i = 1; i < arr.$s.length; i++ ) {
          if ( indices[i] < 0 || indices[i] >= arr.$s[i] ) {
            throw new System.IndexOutOfRangeException.$ctor1( "Index " + i + " out of range" );
          }

          idx = idx * arr.$s[i] + indices[i];
        }
      }

      return idx;
    },

    index: function ( index, arr ) {
      if ( index < 0 || index >= arr.length ) {
        throw new System.IndexOutOfRangeException();
      }
      return index;
    },

    $get: function ( indices ) {
      var r = this[System.Array.toIndex( this, indices )];

      return typeof r !== "undefined" ? r : this.$v;
    },

    get: function ( arr ) {
      if ( arguments.length < 2 ) {
        throw new System.ArgumentNullException.$ctor1( "indices" );
      }

      var idx = Array.prototype.slice.call( arguments, 1 );

      for ( var i = 0; i < idx.length; i++ ) {
        if ( !Bridge.hasValue( idx[i] ) ) {
          throw new System.ArgumentNullException.$ctor1( "indices" );
        }
      }

      var r = arr[System.Array.toIndex( arr, idx )];

      return typeof r !== "undefined" ? r : arr.$v;
    },

    $set: function ( indices, value ) {
      this[System.Array.toIndex( this, indices )] = value;
    },

    set: function ( arr, value ) {
      var indices = Array.prototype.slice.call( arguments, 2 );

      arr[System.Array.toIndex( arr, indices )] = value;
    },

    getLength: function ( arr, dimension ) {
      if ( dimension < 0 || dimension >= ( arr.$s ? arr.$s.length : 1 ) ) {
        throw new System.IndexOutOfRangeException();
      }

      return arr.$s ? arr.$s[dimension] : arr.length;
    },

    getRank: function ( arr ) {
      return arr.$type ? arr.$type.$rank : ( arr.$s ? arr.$s.length : 1 );
    },

    getLower: function ( arr, d ) {
      System.Array.getLength( arr, d );

      return 0;
    },

    create: function ( defvalue, initValues, T, sizes ) {
      if ( sizes === null ) {
        throw new System.ArgumentNullException.$ctor1( "length" );
      }

      var arr = [],
        length = arguments.length > 3 ? 1 : 0,
        i, s, v, j,
        idx,
        indices,
        flatIdx;

      arr.$v = defvalue;
      arr.$s = [];
      arr.get = System.Array.$get;
      arr.set = System.Array.$set;

      if ( sizes && Bridge.isArray( sizes ) ) {
        for ( i = 0; i < sizes.length; i++ ) {
          j = sizes[i];

          if ( isNaN( j ) || j < 0 ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "length" );
          }

          length *= j;
          arr.$s[i] = j;
        }
      } else {
        for ( i = 3; i < arguments.length; i++ ) {
          j = arguments[i];

          if ( isNaN( j ) || j < 0 ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "length" );
          }

          length *= j;
          arr.$s[i - 3] = j;
        }
      }

      arr.length = length;
      var isFn = Bridge.isFunction( defvalue );

      if ( isFn ) {
        var v = defvalue();

        if ( !v || ( !v.$kind && typeof v !== "object" ) ) {
          isFn = false;
          defvalue = v;
        }
      }

      for ( var k = 0; k < length; k++ ) {
        arr[k] = isFn ? defvalue() : defvalue;
      }

      if ( initValues ) {
        for ( i = 0; i < arr.length; i++ ) {
          indices = [];
          flatIdx = i;

          for ( s = arr.$s.length - 1; s >= 0; s-- ) {
            idx = flatIdx % arr.$s[s];
            indices.unshift( idx );
            flatIdx = Bridge.Int.div( flatIdx - idx, arr.$s[s] );
          }

          v = initValues;

          for ( idx = 0; idx < indices.length; idx++ ) {
            v = v[indices[idx]];
          }

          arr[i] = v;
        }
      }

      System.Array.init( arr, T, arr.$s.length );

      return arr;
    },

    init: function ( length, value, T, addFn ) {
      if ( length == null ) {
        throw new System.ArgumentNullException.$ctor1( "length" );
      }

      if ( Bridge.isArray( length ) ) {
        var elementType = value,
          rank = T || 1;

        System.Array.type( elementType, rank, length );

        return length;
      }

      if ( isNaN( length ) || length < 0 ) {
        throw new System.ArgumentOutOfRangeException.$ctor1( "length" );
      }

      var arr = new Array( length ),
        isFn = addFn !== true && Bridge.isFunction( value );

      if ( isFn ) {
        var v = value();

        if ( !v || ( !v.$kind && typeof v !== "object" ) ) {
          isFn = false;
          value = v;
        }
      }

      for ( var i = 0; i < length; i++ ) {
        arr[i] = isFn ? value() : value;
      }

      return System.Array.init( arr, T, 1 );
    },

    toEnumerable: function ( array ) {
      return new Bridge.ArrayEnumerable( array );
    },

    toEnumerator: function ( array, T ) {
      return new Bridge.ArrayEnumerator( array, T );
    },

    _typedArrays: {
      Float32Array: System.Single,
      Float64Array: System.Double,
      Int8Array: System.SByte,
      Int16Array: System.Int16,
      Int32Array: System.Int32,
      Uint8Array: System.Byte,
      Uint8ClampedArray: System.Byte,
      Uint16Array: System.UInt16,
      Uint32Array: System.UInt32
    },

    is: function ( obj, type ) {
      if ( obj instanceof Bridge.ArrayEnumerator ) {
        if ( ( obj.constructor === type ) || ( obj instanceof type ) ||
          type === Bridge.ArrayEnumerator ||
          type.$$name && System.String.startsWith( type.$$name, "System.Collections.IEnumerator" ) ||
          type.$$name && System.String.startsWith( type.$$name, "System.Collections.Generic.IEnumerator" ) ) {
          return true;
        }

        return false;
      }

      if ( !Bridge.isArray( obj ) ) {
        return false;
      }

      if ( type.$elementType && type.$isArray ) {
        var et = Bridge.getType( obj ).$elementType;

        if ( et ) {

          if ( Bridge.Reflection.isValueType( et ) !== Bridge.Reflection.isValueType( type.$elementType ) ) {
            return false;
          }

          return System.Array.getRank( obj ) === type.$rank && Bridge.Reflection.isAssignableFrom( type.$elementType, et );
        }

        type = Array;
      }

      if ( ( obj.constructor === type ) || ( obj instanceof type ) ) {
        return true;
      }

      if ( type === System.Collections.IEnumerable ||
        type === System.Collections.ICollection ||
        type === System.ICloneable ||
        type === System.Collections.IList ||
        type.$$name && System.String.startsWith( type.$$name, "System.Collections.Generic.IEnumerable$1" ) ||
        type.$$name && System.String.startsWith( type.$$name, "System.Collections.Generic.ICollection$1" ) ||
        type.$$name && System.String.startsWith( type.$$name, "System.Collections.Generic.IList$1" ) ||
        type.$$name && System.String.startsWith( type.$$name, "System.Collections.Generic.IReadOnlyCollection$1" ) ||
        type.$$name && System.String.startsWith( type.$$name, "System.Collections.Generic.IReadOnlyList$1" ) ) {
        return true;
      }

      var isTypedArray = !!System.Array._typedArrays[String.prototype.slice.call( Object.prototype.toString.call( obj ), 8, -1 )];

      if ( isTypedArray && !!System.Array._typedArrays[type.name] ) {
        return obj instanceof type;
      }

      return isTypedArray;
    },

    clone: function ( arr ) {
      var newArr;

      if ( arr.length === 1 ) {
        newArr = [arr[0]];
      } else {
        newArr = arr.slice( 0 );
      }

      newArr.$type = arr.$type;
      newArr.$v = arr.$v;
      newArr.$s = arr.$s;
      newArr.get = System.Array.$get;
      newArr.set = System.Array.$set;

      return newArr;
    },

    getCount: function ( obj, T ) {
      var name,
        v;

      if ( Bridge.isArray( obj ) ) {
        return obj.length;
      } else if ( T && Bridge.isFunction( obj[name = "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( T ) + "$getCount"] ) ) {
        return obj[name]();
      } else if ( Bridge.isFunction( obj[name = "System$Collections$ICollection$getCount"] ) ) {
        return obj[name]();
      } else if ( T && ( v = obj["System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( T ) + "$Count"] ) !== undefined ) {
        return v;
      } else if ( ( v = obj["System$Collections$ICollection$Count"] ) !== undefined ) {
        return v;
      } else if ( ( v = obj.Count ) !== undefined ) {
        return v;
      } else if ( Bridge.isFunction( obj.getCount ) ) {
        return obj.getCount();
      }

      return 0;
    },

    getIsReadOnly: function ( obj, T ) {
      var name,
        v;

      if ( Bridge.isArray( obj ) ) {
        return T ? true : false;
      } else if ( T && Bridge.isFunction( obj[name = "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( T ) + "$getIsReadOnly"] ) ) {
        return obj[name]();
      } else if ( T && ( v = obj["System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( T ) + "$IsReadOnly"] ) !== undefined ) {
        return v;
      } else if ( Bridge.isFunction( obj[name = "System$Collections$IList$getIsReadOnly"] ) ) {
        return obj[name]();
      } else if ( ( v = obj["System$Collections$IList$IsReadOnly"] ) !== undefined ) {
        return v;
      } else if ( ( v = obj.IsReadOnly ) !== undefined ) {
        return v;
      } else if ( Bridge.isFunction( obj.getIsReadOnly ) ) {
        return obj.getIsReadOnly();
      }

      return false;
    },

    checkReadOnly: function ( obj, T, msg ) {
      if ( Bridge.isArray( obj ) ) {
        if ( T ) {
          throw new System.NotSupportedException.$ctor1( msg || "Collection was of a fixed size." );
        }
      } else if ( System.Array.getIsReadOnly( obj, T ) ) {
        throw new System.NotSupportedException.$ctor1( msg || "Collection is read-only." );
      }
    },

    add: function ( obj, item, T ) {
      var name;

      System.Array.checkReadOnly( obj, T );

      if ( T ) {
        item = System.Array.checkNewElementType( item, T );
      }

      if ( T && Bridge.isFunction( obj[name = "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( T ) + "$add"] ) ) {
        return obj[name]( item );
      } else if ( Bridge.isFunction( obj[name = "System$Collections$IList$add"] ) ) {
        return obj[name]( item );
      } else if ( Bridge.isFunction( obj.add ) ) {
        return obj.add( item );
      }

      return -1;
    },

    checkNewElementType: function ( v, type ) {
      var unboxed = Bridge.unbox( v, true );

      if ( Bridge.isNumber( unboxed ) ) {
        if ( type === System.Decimal ) {
          return new System.Decimal( unboxed );
        }

        if ( type === System.Int64 ) {
          return new System.Int64( unboxed );
        }

        if ( type === System.UInt64 ) {
          return new System.UInt64( unboxed );
        }
      }

      var is = Bridge.is( v, type );

      if ( !is ) {
        if ( v == null && Bridge.getDefaultValue( type ) == null ) {
          return null;
        }

        throw new System.ArgumentException.$ctor1( "The value " + unboxed + "is not of type " + Bridge.getTypeName( type ) + " and cannot be used in this generic collection." );
      }

      return unboxed;
    },

    clear: function ( obj, T ) {
      var name;

      System.Array.checkReadOnly( obj, T, "Collection is read-only." );

      if ( Bridge.isArray( obj ) ) {
        System.Array.fill( obj, T ? ( T.getDefaultValue || Bridge.getDefaultValue( T ) ) : null, 0, obj.length );
      } else if ( T && Bridge.isFunction( obj[name = "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( T ) + "$clear"] ) ) {
        obj[name]();
      } else if ( Bridge.isFunction( obj[name = "System$Collections$IList$clear"] ) ) {
        obj[name]();
      } else if ( Bridge.isFunction( obj.clear ) ) {
        obj.clear();
      }
    },

    fill: function ( dst, val, index, count ) {
      if ( !Bridge.hasValue( dst ) ) {
        throw new System.ArgumentNullException.$ctor1( "dst" );
      }

      if ( index < 0 || count < 0 || ( index + count ) > dst.length ) {
        throw new System.IndexOutOfRangeException();
      }

      var isFn = Bridge.isFunction( val );

      if ( isFn ) {
        var v = val();

        if ( !v || ( !v.$kind && typeof v !== "object" ) ) {
          isFn = false;
          val = v;
        }
      }

      while ( --count >= 0 ) {
        dst[index + count] = isFn ? val() : val;
      }
    },

    copy: function ( src, spos, dest, dpos, len ) {
      if ( !dest ) {
        throw new System.ArgumentNullException.$ctor3( "dest", "Value cannot be null" );
      }

      if ( !src ) {
        throw new System.ArgumentNullException.$ctor3( "src", "Value cannot be null" );
      }

      if ( spos < 0 || dpos < 0 || len < 0 ) {
        throw new System.ArgumentOutOfRangeException.$ctor1( "bound", "Number was less than the array's lower bound in the first dimension" );
      }

      if ( len > ( src.length - spos ) || len > ( dest.length - dpos ) ) {
        throw new System.ArgumentException.$ctor1( "Destination array was not long enough. Check destIndex and length, and the array's lower bounds" );
      }

      if ( spos < dpos && src === dest ) {
        while ( --len >= 0 ) {
          dest[dpos + len] = src[spos + len];
        }
      } else {
        for ( var i = 0; i < len; i++ ) {
          dest[dpos + i] = src[spos + i];
        }
      }
    },

    copyTo: function ( obj, dest, index, T ) {
      var name;

      if ( Bridge.isArray( obj ) ) {
        System.Array.copy( obj, 0, dest, index, obj ? obj.length : 0 );
      } else if ( Bridge.isFunction( obj.copyTo ) ) {
        obj.copyTo( dest, index );
      } else if ( T && Bridge.isFunction( obj[name = "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( T ) + "$copyTo"] ) ) {
        obj[name]( dest, index );
      } else if ( Bridge.isFunction( obj[name = "System$Collections$ICollection$copyTo"] ) ) {
        obj[name]( dest, index );
      } else {
        throw new System.NotImplementedException.$ctor1( "copyTo" );
      }
    },

    indexOf: function ( arr, item, startIndex, count, T ) {
      var name;

      if ( Bridge.isArray( arr ) ) {
        var i,
          el,
          endIndex;

        startIndex = startIndex || 0;
        count = Bridge.isNumber( count ) ? count : arr.length;
        endIndex = startIndex + count;

        for ( i = startIndex; i < endIndex; i++ ) {
          el = arr[i];

          if ( el === item || System.Collections.Generic.EqualityComparer$1.$default.equals2( el, item ) ) {
            return i;
          }
        }
      } else if ( T && Bridge.isFunction( arr[name = "System$Collections$Generic$IList$1$" + Bridge.getTypeAlias( T ) + "$indexOf"] ) ) {
        return arr[name]( item );
      } else if ( Bridge.isFunction( arr[name = "System$Collections$IList$indexOf"] ) ) {
        return arr[name]( item );
      } else if ( Bridge.isFunction( arr.indexOf ) ) {
        return arr.indexOf( item );
      }

      return -1;
    },

    contains: function ( obj, item, T ) {
      var name;

      if ( Bridge.isArray( obj ) ) {
        return System.Array.indexOf( obj, item ) > -1;
      } else if ( T && Bridge.isFunction( obj[name = "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( T ) + "$contains"] ) ) {
        return obj[name]( item );
      } else if ( Bridge.isFunction( obj[name = "System$Collections$IList$contains"] ) ) {
        return obj[name]( item );
      } else if ( Bridge.isFunction( obj.contains ) ) {
        return obj.contains( item );
      }

      return false;
    },

    remove: function ( obj, item, T ) {
      var name;

      System.Array.checkReadOnly( obj, T );

      if ( Bridge.isArray( obj ) ) {
        var index = System.Array.indexOf( obj, item );

        if ( index > -1 ) {
          obj.splice( index, 1 );

          return true;
        }
      } else if ( T && Bridge.isFunction( obj[name = "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( T ) + "$remove"] ) ) {
        return obj[name]( item );
      } else if ( Bridge.isFunction( obj[name = "System$Collections$IList$remove"] ) ) {
        return obj[name]( item );
      } else if ( Bridge.isFunction( obj.remove ) ) {
        return obj.remove( item );
      }

      return false;
    },

    insert: function ( obj, index, item, T ) {
      var name;

      System.Array.checkReadOnly( obj, T );

      if ( T ) {
        item = System.Array.checkNewElementType( item, T );
      }

      if ( T && Bridge.isFunction( obj[name = "System$Collections$Generic$IList$1$" + Bridge.getTypeAlias( T ) + "$insert"] ) ) {
        obj[name]( index, item );
      } else if ( Bridge.isFunction( obj[name = "System$Collections$IList$insert"] ) ) {
        obj[name]( index, item );
      } else if ( Bridge.isFunction( obj.insert ) ) {
        obj.insert( index, item );
      }
    },

    removeAt: function ( obj, index, T ) {
      var name;

      System.Array.checkReadOnly( obj, T );

      if ( Bridge.isArray( obj ) ) {
        obj.splice( index, 1 );
      } else if ( T && Bridge.isFunction( obj[name = "System$Collections$Generic$IList$1$" + Bridge.getTypeAlias( T ) + "$removeAt"] ) ) {
        obj[name]( index );
      } else if ( Bridge.isFunction( obj[name = "System$Collections$IList$removeAt"] ) ) {
        obj[name]( index );
      } else if ( Bridge.isFunction( obj.removeAt ) ) {
        obj.removeAt( index );
      }
    },

    getItem: function ( obj, idx, T ) {
      var name,
        v;

      if ( Bridge.isArray( obj ) ) {
        v = obj[idx];
        if ( T ) {
          return v;
        }

        return ( obj.$type && ( Bridge.isNumber( v ) || Bridge.isBoolean( v ) || Bridge.isDate( v ) ) ) ? Bridge.box( v, obj.$type.$elementType ) : v;
      } else if ( T && Bridge.isFunction( obj[name = "System$Collections$Generic$IList$1$" + Bridge.getTypeAlias( T ) + "$getItem"] ) ) {
        v = obj[name]( idx );
        return v;
      } else if ( Bridge.isFunction( obj.get ) ) {
        v = obj.get( idx );
      } else if ( Bridge.isFunction( obj.getItem ) ) {
        v = obj.getItem( idx );
      } else if ( Bridge.isFunction( obj[name = "System$Collections$IList$$getItem"] ) ) {
        v = obj[name]( idx );
      } else if ( Bridge.isFunction( obj.get_Item ) ) {
        v = obj.get_Item( idx );
      }

      return T && Bridge.getDefaultValue( T ) != null ? Bridge.box( v, T ) : v;
    },

    setItem: function ( obj, idx, value, T ) {
      var name;

      if ( Bridge.isArray( obj ) ) {
        if ( obj.$type ) {
          value = System.Array.checkElementType( value, obj.$type.$elementType );
        }

        obj[idx] = value;
      } else {
        if ( T ) {
          value = System.Array.checkElementType( value, T );
        }

        if ( Bridge.isFunction( obj.set ) ) {
          obj.set( idx, value );
        } else if ( Bridge.isFunction( obj.setItem ) ) {
          obj.setItem( idx, value );
        } else if ( T && Bridge.isFunction( obj[name = "System$Collections$Generic$IList$1$" + Bridge.getTypeAlias( T ) + "$setItem"] ) ) {
          return obj[name]( idx, value );
        } else if ( T && Bridge.isFunction( obj[name = "System$Collections$IList$setItem"] ) ) {
          return obj[name]( idx, value );
        } else if ( Bridge.isFunction( obj.set_Item ) ) {
          obj.set_Item( idx, value );
        }
      }
    },

    checkElementType: function ( v, type ) {
      var unboxed = Bridge.unbox( v, true );

      if ( Bridge.isNumber( unboxed ) ) {
        if ( type === System.Decimal ) {
          return new System.Decimal( unboxed );
        }

        if ( type === System.Int64 ) {
          return new System.Int64( unboxed );
        }

        if ( type === System.UInt64 ) {
          return new System.UInt64( unboxed );
        }
      }

      var is = Bridge.is( v, type );

      if ( !is ) {
        if ( v == null ) {
          return Bridge.getDefaultValue( type );
        }

        throw new System.ArgumentException.$ctor1( "Cannot widen from source type to target type either because the source type is a not a primitive type or the conversion cannot be accomplished." );
      }

      return unboxed;
    },

    resize: function ( arr, newSize, val, T ) {
      if ( newSize < 0 ) {
        throw new System.ArgumentOutOfRangeException.$ctor3( "newSize", newSize, "newSize cannot be less than 0." );
      }

      var oldSize = 0,
        isFn = Bridge.isFunction( val ),
        ref = arr.v;

      if ( isFn ) {
        var v = val();

        if ( !v || ( !v.$kind && typeof v !== "object" ) ) {
          isFn = false;
          val = v;
        }
      }

      if ( !ref ) {
        ref = System.Array.init( new Array( newSize ), T );
      } else {
        oldSize = ref.length;
        ref.length = newSize;
      }

      for ( var i = oldSize; i < newSize; i++ ) {
        ref[i] = isFn ? val() : val;
      }

      ref.$s = [ref.length];

      arr.v = ref;
    },

    reverse: function ( arr, index, length ) {
      if ( !array ) {
        throw new System.ArgumentNullException.$ctor1( "arr" );
      }

      if ( !index && index !== 0 ) {
        index = 0;
        length = arr.length;
      }

      if ( index < 0 || length < 0 ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( ( index < 0 ? "index" : "length" ), "Non-negative number required." );
      }

      if ( ( array.length - index ) < length ) {
        throw new System.ArgumentException.$ctor1( "Offset and length were out of bounds for the array or count is greater than the number of elements from index to the end of the source collection." );
      }

      if ( System.Array.getRank( arr ) !== 1 ) {
        throw new System.Exception( "Only single dimension arrays are supported here." );
      }

      var i = index,
        j = index + length - 1;

      while ( i < j ) {
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        i++;
        j--;
      }
    },

    binarySearch: function ( array, index, length, value, comparer ) {
      if ( !array ) {
        throw new System.ArgumentNullException.$ctor1( "array" );
      }

      var lb = 0;

      if ( index < lb || length < 0 ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( index < lb ? "index" : "length", "Non-negative number required." );
      }

      if ( array.length - ( index - lb ) < length ) {
        throw new System.ArgumentException.$ctor1( "Offset and length were out of bounds for the array or count is greater than the number of elements from index to the end of the source collection." );
      }

      if ( System.Array.getRank( array ) !== 1 ) {
        throw new System.RankException.$ctor1( "Only single dimensional arrays are supported for the requested action." );
      }

      if ( !comparer ) {
        comparer = System.Collections.Generic.Comparer$1.$default;
      }

      var lo = index,
        hi = index + length - 1,
        i,
        c;

      while ( lo <= hi ) {
        i = lo + ( ( hi - lo ) >> 1 );

        try {
          c = System.Collections.Generic.Comparer$1.get( comparer )( array[i], value );
        } catch ( e ) {
          throw new System.InvalidOperationException.$ctor2( "Failed to compare two elements in the array.", e );
        }

        if ( c === 0 ) {
          return i;
        }

        if ( c < 0 ) {
          lo = i + 1;
        } else {
          hi = i - 1;
        }
      }

      return ~lo;
    },

    sortDict: function ( keys, values, index, length, comparer ) {
      if ( !comparer ) {
        comparer = System.Collections.Generic.Comparer$1.$default;
      }

      var list = [],
        fn = Bridge.fn.bind( comparer, System.Collections.Generic.Comparer$1.get( comparer ) );

      if ( length == null ) {
        length = keys.length;
      }

      for ( var j = 0; j < keys.length; j++ ) {
        list.push( { key: keys[j], value: values[j] } );
      }

      if ( index === 0 && length === list.length ) {
        list.sort( function ( x, y ) {
          return fn( x.key, y.key );
        } );
      } else {
        var newarray = list.slice( index, index + length );

        newarray.sort( function ( x, y ) {
          return fn( x.key, y.key );
        } );

        for ( var i = index; i < ( index + length ); i++ ) {
          list[i] = newarray[i - index];
        }
      }

      for ( var k = 0; k < list.length; k++ ) {
        keys[k] = list[k].key;
        values[k] = list[k].value;
      }
    },

    sort: function ( array, index, length, comparer ) {
      if ( !array ) {
        throw new System.ArgumentNullException.$ctor1( "array" );
      }

      if ( arguments.length === 2 && typeof index === "function" ) {
        array.sort( index );
        return;
      }

      if ( arguments.length === 2 && typeof index === "object" ) {
        comparer = index;
        index = null;
      }

      if ( !Bridge.isNumber( index ) ) {
        index = 0;
      }

      if ( !Bridge.isNumber( length ) ) {
        length = array.length;
      }

      if ( !comparer ) {
        comparer = System.Collections.Generic.Comparer$1.$default;
      }

      if ( index === 0 && length === array.length ) {
        array.sort( Bridge.fn.bind( comparer, System.Collections.Generic.Comparer$1.get( comparer ) ) );
      } else {
        var newarray = array.slice( index, index + length );

        newarray.sort( Bridge.fn.bind( comparer, System.Collections.Generic.Comparer$1.get( comparer ) ) );

        for ( var i = index; i < ( index + length ); i++ ) {
          array[i] = newarray[i - index];
        }
      }
    },

    min: function ( arr, minValue ) {
      var min = arr[0],
        len = arr.length;

      for ( var i = 0; i < len; i++ ) {
        if ( ( arr[i] < min || min < minValue ) && !( arr[i] < minValue ) ) {
          min = arr[i];
        }
      }

      return min;
    },

    max: function ( arr, maxValue ) {
      var max = arr[0],
        len = arr.length;

      for ( var i = 0; i < len; i++ ) {
        if ( ( arr[i] > max || max > maxValue ) && !( arr[i] > maxValue ) ) {
          max = arr[i];
        }
      }

      return max;
    },

    addRange: function ( arr, items ) {
      if ( Bridge.isArray( items ) ) {
        arr.push.apply( arr, items );
      } else {
        var e = Bridge.getEnumerator( items );

        try {
          while ( e.moveNext() ) {
            arr.push( e.Current );
          }
        } finally {
          if ( Bridge.is( e, System.IDisposable ) ) {
            e.Dispose();
          }
        }
      }
    },

    convertAll: function ( array, converter ) {
      if ( !Bridge.hasValue( array ) ) {
        throw new System.ArgumentNullException.$ctor1( "array" );
      }

      if ( !Bridge.hasValue( converter ) ) {
        throw new System.ArgumentNullException.$ctor1( "converter" );
      }

      var array2 = array.map( converter );

      return array2;
    },

    find: function ( T, array, match ) {
      if ( !Bridge.hasValue( array ) ) {
        throw new System.ArgumentNullException.$ctor1( "array" );
      }

      if ( !Bridge.hasValue( match ) ) {
        throw new System.ArgumentNullException.$ctor1( "match" );
      }

      for ( var i = 0; i < array.length; i++ ) {
        if ( match( array[i] ) ) {
          return array[i];
        }
      }

      return Bridge.getDefaultValue( T );
    },

    findAll: function ( array, match ) {
      if ( !Bridge.hasValue( array ) ) {
        throw new System.ArgumentNullException.$ctor1( "array" );
      }

      if ( !Bridge.hasValue( match ) ) {
        throw new System.ArgumentNullException.$ctor1( "match" );
      }

      var list = [];

      for ( var i = 0; i < array.length; i++ ) {
        if ( match( array[i] ) ) {
          list.push( array[i] );
        }
      }

      return list;
    },

    findIndex: function ( array, startIndex, count, match ) {
      if ( !Bridge.hasValue( array ) ) {
        throw new System.ArgumentNullException.$ctor1( "array" );
      }

      if ( arguments.length === 2 ) {
        match = startIndex;
        startIndex = 0;
        count = array.length;
      } else if ( arguments.length === 3 ) {
        match = count;
        count = array.length - startIndex;
      }

      if ( startIndex < 0 || startIndex > array.length ) {
        throw new System.ArgumentOutOfRangeException.$ctor1( "startIndex" );
      }

      if ( count < 0 || startIndex > array.length - count ) {
        throw new System.ArgumentOutOfRangeException.$ctor1( "count" );
      }

      if ( !Bridge.hasValue( match ) ) {
        throw new System.ArgumentNullException.$ctor1( "match" );
      }

      var endIndex = startIndex + count;

      for ( var i = startIndex; i < endIndex; i++ ) {
        if ( match( array[i] ) ) {
          return i;
        }
      }

      return -1;
    },

    findLast: function ( T, array, match ) {
      if ( !Bridge.hasValue( array ) ) {
        throw new System.ArgumentNullException.$ctor1( "array" );
      }

      if ( !Bridge.hasValue( match ) ) {
        throw new System.ArgumentNullException.$ctor1( "match" );
      }

      for ( var i = array.length - 1; i >= 0; i-- ) {
        if ( match( array[i] ) ) {
          return array[i];
        }
      }

      return Bridge.getDefaultValue( T );
    },

    findLastIndex: function ( array, startIndex, count, match ) {
      if ( !Bridge.hasValue( array ) ) {
        throw new System.ArgumentNullException.$ctor1( "array" );
      }

      if ( arguments.length === 2 ) {
        match = startIndex;
        startIndex = array.length - 1;
        count = array.length;
      } else if ( arguments.length === 3 ) {
        match = count;
        count = startIndex + 1;
      }

      if ( !Bridge.hasValue( match ) ) {
        throw new System.ArgumentNullException.$ctor1( "match" );
      }

      if ( array.length === 0 ) {
        if ( startIndex !== -1 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "startIndex" );
        }
      } else {
        if ( startIndex < 0 || startIndex >= array.length ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "startIndex" );
        }
      }

      if ( count < 0 || startIndex - count + 1 < 0 ) {
        throw new System.ArgumentOutOfRangeException.$ctor1( "count" );
      }

      var endIndex = startIndex - count;

      for ( var i = startIndex; i > endIndex; i-- ) {
        if ( match( array[i] ) ) {
          return i;
        }
      }

      return -1;
    },

    forEach: function ( array, action ) {
      if ( !Bridge.hasValue( array ) ) {
        throw new System.ArgumentNullException.$ctor1( "array" );
      }

      if ( !Bridge.hasValue( action ) ) {
        throw new System.ArgumentNullException.$ctor1( "action" );
      }

      for ( var i = 0; i < array.length; i++ ) {
        action( array[i], i, array );
      }
    },

    indexOfT: function ( array, value, startIndex, count ) {
      if ( !Bridge.hasValue( array ) ) {
        throw new System.ArgumentNullException.$ctor1( "array" );
      }

      if ( arguments.length === 2 ) {
        startIndex = 0;
        count = array.length;
      } else if ( arguments.length === 3 ) {
        count = array.length - startIndex;
      }

      if ( startIndex < 0 || ( startIndex >= array.length && array.length > 0 ) ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "startIndex", "out of range" );
      }

      if ( count < 0 || count > array.length - startIndex ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "count", "out of range" );
      }

      return System.Array.indexOf( array, value, startIndex, count );
    },

    isFixedSize: function ( array ) {
      if ( Bridge.isArray( array ) ) {
        return true;
      } else if ( array["System$Collections$IList$isFixedSize"] != null ) {
        return array["System$Collections$IList$isFixedSize"];
      } else if ( array["System$Collections$IList$IsFixedSize"] != null ) {
        return array["System$Collections$IList$IsFixedSize"];
      } else if ( array.isFixedSize != null ) {
        return array.isFixedSize;
      } else if ( array.IsFixedSize != null ) {
        return array.IsFixedSize;
      }

      return true;
    },

    isSynchronized: function ( array ) {
      return false;
    },

    lastIndexOfT: function ( array, value, startIndex, count ) {
      if ( !Bridge.hasValue( array ) ) {
        throw new System.ArgumentNullException.$ctor1( "array" );
      }

      if ( arguments.length === 2 ) {
        startIndex = array.length - 1;
        count = array.length;
      } else if ( arguments.length === 3 ) {
        count = ( array.length === 0 ) ? 0 : ( startIndex + 1 );
      }

      if ( startIndex < 0 || ( startIndex >= array.length && array.length > 0 ) ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "startIndex", "out of range" );
      }

      if ( count < 0 || startIndex - count + 1 < 0 ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "count", "out of range" );
      }

      var endIndex = startIndex - count + 1;

      for ( var i = startIndex; i >= endIndex; i-- ) {
        var el = array[i];

        if ( el === value || System.Collections.Generic.EqualityComparer$1.$default.equals2( el, value ) ) {
          return i;
        }
      }

      return -1;
    },

    syncRoot: function ( array ) {
      return array;
    },

    trueForAll: function ( array, match ) {
      if ( !Bridge.hasValue( array ) ) {
        throw new System.ArgumentNullException.$ctor1( "array" );
      }

      if ( !Bridge.hasValue( match ) ) {
        throw new System.ArgumentNullException.$ctor1( "match" );
      }

      for ( var i = 0; i < array.length; i++ ) {
        if ( !match( array[i] ) ) {
          return false;
        }
      }

      return true;
    },

    type: function ( t, rank, arr ) {
      rank = rank || 1;

      var typeCache = System.Array.$cache[rank],
        result,
        name;

      if ( !typeCache ) {
        typeCache = [];
        System.Array.$cache[rank] = typeCache;
      }

      for ( var i = 0; i < typeCache.length; i++ ) {
        if ( typeCache[i].$elementType === t ) {
          result = typeCache[i];
          break;
        }
      }

      if ( !result ) {
        name = Bridge.getTypeName( t ) + "[" + System.String.fromCharCount( ",".charCodeAt( 0 ), rank - 1 ) + "]";

        var old = Bridge.Class.staticInitAllow;

        result = Bridge.define( name, {
          //$inherits: [System.Array, System.Collections.ICollection, System.ICloneable, System.Collections.Generic.IList$1( t ), System.Collections.Generic.IReadOnlyCollection$1( t )],
          $inherits: [System.Array, System.ICloneable],
          $noRegister: true,
          statics: {
            $elementType: t,
            $rank: rank,
            $isArray: true,
            $is: function ( obj ) {
              return System.Array.is( obj, this );
            },
            getDefaultValue: function () {
              return null;
            },
            createInstance: function () {
              var arr;

              if ( this.$rank === 1 ) {
                arr = [];
              } else {
                var args = [Bridge.getDefaultValue( this.$elementType ), null, this.$elementType];

                for ( var j = 0; j < this.$rank; j++ ) {
                  args.push( 0 );
                }

                arr = System.Array.create.apply( System.Array, args );
              }

              arr.$type = this;

              return arr;
            }
          }
        } );

        typeCache.push( result );

        Bridge.Class.staticInitAllow = true;

        if ( result.$staticInit ) {
          result.$staticInit();
        }

        Bridge.Class.staticInitAllow = old;
      }

      if ( arr ) {
        arr.$type = result;
      }

      return arr || result;
    },
    getLongLength: function ( array ) {
      return System.Int64( array.length );
    }
  };

  Bridge.define( "System.Array", {
    statics: array
  } );

  System.Array.$cache = {};

  // @source Interfaces.js

  Bridge.define( "System.Collections.IEnumerable", {
    $kind: "interface"
  } );

  Bridge.define( "System.Collections.Generic.IEnumerable$1", function ( T ) {
    return {
      inherits: [System.Collections.IEnumerable],
      $kind: "interface",
      $variance: [1]
    };
  } );

  // @source String.js

  Bridge.define( "System.String", {
    inherits: [System.IComparable, System.ICloneable, System.Collections.IEnumerable, System.Collections.Generic.IEnumerable$1( System.Char )],

    statics: {
      $is: function ( instance ) {
        return typeof ( instance ) === "string";
      },

      charCodeAt: function ( str, idx ) {
        idx = idx || 0;

        var code = str.charCodeAt( idx ),
          hi,
          low;

        if ( 0xD800 <= code && code <= 0xDBFF ) {
          hi = code;
          low = str.charCodeAt( idx + 1 );

          if ( isNaN( low ) ) {
            throw new System.Exception( "High surrogate not followed by low surrogate" );
          }

          return ( ( hi - 0xD800 ) * 0x400 ) + ( low - 0xDC00 ) + 0x10000;
        }

        if ( 0xDC00 <= code && code <= 0xDFFF ) {
          return false;
        }

        return code;
      },

      fromCharCode: function ( codePt ) {
        if ( codePt > 0xFFFF ) {
          codePt -= 0x10000;

          return String.fromCharCode( 0xD800 + ( codePt >> 10 ), 0xDC00 + ( codePt & 0x3FF ) );
        }

        return String.fromCharCode( codePt );
      },

      fromCharArray: function ( chars, startIndex, length ) {
        if ( chars == null ) {
          throw new System.ArgumentNullException.$ctor1( "chars" );
        }

        if ( startIndex < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "startIndex" );
        }

        if ( length < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "length" );
        }

        if ( chars.length - startIndex < length ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "startIndex" );
        }

        var result = "";

        startIndex = startIndex || 0;
        length = Bridge.isNumber( length ) ? length : chars.length;

        if ( ( startIndex + length ) > chars.length ) {
          length = chars.length - startIndex;
        }

        for ( var i = 0; i < length; i++ ) {
          var ch = chars[i + startIndex] | 0;

          result += String.fromCharCode( ch );
        }

        return result;
      },

      lastIndexOf: function ( s, search, startIndex, count ) {
        var index = s.lastIndexOf( search, startIndex );

        return ( index < ( startIndex - count + 1 ) ) ? -1 : index;
      },

      lastIndexOfAny: function ( s, chars, startIndex, count ) {
        var length = s.length;

        if ( !length ) {
          return -1;
        }

        chars = String.fromCharCode.apply( null, chars );
        startIndex = startIndex || length - 1;
        count = count || length;

        var endIndex = startIndex - count + 1;

        if ( endIndex < 0 ) {
          endIndex = 0;
        }

        for ( var i = startIndex; i >= endIndex; i-- ) {
          if ( chars.indexOf( s.charAt( i ) ) >= 0 ) {
            return i;
          }
        }

        return -1;
      },

      isNullOrWhiteSpace: function ( s ) {
        if ( !s ) {
          return true;
        }

        return System.Char.isWhiteSpace( s );
      },

      isNullOrEmpty: function ( s ) {
        return !s;
      },

      fromCharCount: function ( c, count ) {
        if ( count >= 0 ) {
          return String( Array( count + 1 ).join( String.fromCharCode( c ) ) );
        } else {
          throw new System.ArgumentOutOfRangeException.$ctor4( "count", "cannot be less than zero" );
        }
      },

      format: function ( format, args ) {
        return System.String._format( System.Globalization.CultureInfo.getCurrentCulture(), format, Array.isArray( args ) && arguments.length == 2 ? args : Array.prototype.slice.call( arguments, 1 ) );
      },

      formatProvider: function ( provider, format, args ) {
        return System.String._format( provider, format, Array.isArray( args ) && arguments.length == 3 ? args : Array.prototype.slice.call( arguments, 2 ) );
      },

      _format: function ( provider, format, args ) {
        if ( format == null ) {
          throw new System.ArgumentNullException.$ctor1( "format" );
        }

        var reverse = function ( s ) {
          return s.split( "" ).reverse().join( "" );
        };

        format = reverse( reverse( format.replace( /\{\{/g, function ( m ) {
          return String.fromCharCode( 1, 1 );
        } ) ).replace( /\}\}/g, function ( m ) {
          return String.fromCharCode( 2, 2 );
        } ) );

        var me = this,
          _formatRe = /(\{+)((\d+|[a-zA-Z_$]\w+(?:\.[a-zA-Z_$]\w+|\[\d+\])*)(?:\,(-?\d*))?(?:\:([^\}]*))?)(\}+)|(\{+)|(\}+)/g,
          fn = this.decodeBraceSequence;

        format = format.replace( _formatRe, function ( m, openBrace, elementContent, index, align, format, closeBrace, repeatOpenBrace, repeatCloseBrace ) {
          if ( repeatOpenBrace ) {
            return fn( repeatOpenBrace );
          }

          if ( repeatCloseBrace ) {
            return fn( repeatCloseBrace );
          }

          if ( openBrace.length % 2 === 0 || closeBrace.length % 2 === 0 ) {
            return fn( openBrace ) + elementContent + fn( closeBrace );
          }

          return fn( openBrace, true ) + me.handleElement( provider, index, align, format, args ) + fn( closeBrace, true );
        } );

        return format.replace( /(\x01\x01)|(\x02\x02)/g, function ( m ) {
          if ( m == String.fromCharCode( 1, 1 ) ) {
            return "{";
          }

          if ( m == String.fromCharCode( 2, 2 ) ) {
            return "}";
          }
        } );
      },

      handleElement: function ( provider, index, alignment, formatStr, args ) {
        var value;

        index = parseInt( index, 10 );

        if ( index > args.length - 1 ) {
          throw new System.FormatException.$ctor1( "Input string was not in a correct format." );
        }

        value = args[index];

        if ( value == null ) {
          value = "";
        }

        if ( formatStr && value.$boxed && value.type.$kind === "enum" ) {
          value = System.Enum.format( value.type, value.v, formatStr );
        } else if ( formatStr && value.$boxed && value.type.format ) {
          value = value.type.format( Bridge.unbox( value, true ), formatStr, provider );
        } else if ( formatStr && Bridge.is( value, System.IFormattable ) ) {
          value = Bridge.format( Bridge.unbox( value, true ), formatStr, provider );
        } if ( Bridge.isNumber( value ) ) {
          value = Bridge.Int.format( value, formatStr, provider );
        } else if ( Bridge.isDate( value ) ) {
          value = System.DateTime.format( value, formatStr, provider );
        } else {
          value = "" + Bridge.toString( value );
        }

        if ( alignment ) {
          alignment = parseInt( alignment, 10 );

          if ( !Bridge.isNumber( alignment ) ) {
            alignment = null;
          }
        }

        return System.String.alignString( Bridge.toString( value ), alignment );
      },

      decodeBraceSequence: function ( braces, remove ) {
        return braces.substr( 0, ( braces.length + ( remove ? 0 : 1 ) ) / 2 );
      },

      alignString: function ( str, alignment, pad, dir, cut ) {
        if ( str == null || !alignment ) {
          return str;
        }

        if ( !pad ) {
          pad = " ";
        }

        if ( Bridge.isNumber( pad ) ) {
          pad = String.fromCharCode( pad );
        }

        if ( !dir ) {
          dir = alignment < 0 ? 1 : 2;
        }

        alignment = Math.abs( alignment );

        if ( cut && ( str.length > alignment ) ) {
          str = str.substring( 0, alignment );
        }

        if ( alignment + 1 >= str.length ) {
          switch ( dir ) {
            case 2:
              str = Array( alignment + 1 - str.length ).join( pad ) + str;
              break;

            case 3:
              var padlen = alignment - str.length,
                right = Math.ceil( padlen / 2 ),
                left = padlen - right;

              str = Array( left + 1 ).join( pad ) + str + Array( right + 1 ).join( pad );
              break;

            case 1:
            default:
              str = str + Array( alignment + 1 - str.length ).join( pad );
              break;
          }
        }

        return str;
      },

      startsWith: function ( str, prefix ) {
        if ( !prefix.length ) {
          return true;
        }

        if ( prefix.length > str.length ) {
          return false;
        }

        return System.String.equals( str.slice( 0, prefix.length ), prefix, arguments[2] );
      },

      endsWith: function ( str, suffix ) {
        if ( !suffix.length ) {
          return true;
        }

        if ( suffix.length > str.length ) {
          return false;
        }

        return System.String.equals( str.slice( str.length - suffix.length, str.length ), suffix, arguments[2] );
      },

      contains: function ( str, value ) {
        if ( value == null ) {
          throw new System.ArgumentNullException();
        }

        if ( str == null ) {
          return false;
        }

        return str.indexOf( value ) > -1;
      },

      indexOfAny: function ( str, anyOf ) {
        if ( anyOf == null ) {
          throw new System.ArgumentNullException();
        }

        if ( str == null || str === "" ) {
          return -1;
        }

        var startIndex = ( arguments.length > 2 ) ? arguments[2] : 0;

        if ( startIndex < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "startIndex", "startIndex cannot be less than zero" );
        }

        var length = str.length - startIndex;

        if ( arguments.length > 3 && arguments[3] != null ) {
          length = arguments[3];
        }

        if ( length < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "length", "must be non-negative" );
        }

        if ( length > str.length - startIndex ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "length", "Index and length must refer to a location within the string" );
        }

        length = startIndex + length;
        anyOf = String.fromCharCode.apply( null, anyOf );

        for ( var i = startIndex; i < length; i++ ) {
          if ( anyOf.indexOf( str.charAt( i ) ) >= 0 ) {
            return i;
          }
        }

        return -1;
      },

      indexOf: function ( str, value ) {
        if ( value == null ) {
          throw new System.ArgumentNullException();
        }

        if ( str == null || str === "" ) {
          return -1;
        }

        var startIndex = ( arguments.length > 2 ) ? arguments[2] : 0;

        if ( startIndex < 0 || startIndex > str.length ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "startIndex", "startIndex cannot be less than zero and must refer to a location within the string" );
        }

        if ( value === "" ) {
          return ( arguments.length > 2 ) ? startIndex : 0;
        }

        var length = str.length - startIndex;

        if ( arguments.length > 3 && arguments[3] != null ) {
          length = arguments[3];
        }

        if ( length < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "length", "must be non-negative" );
        }

        if ( length > str.length - startIndex ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "length", "Index and length must refer to a location within the string" );
        }

        var s = str.substr( startIndex, length ),
          index = ( arguments.length === 5 && arguments[4] % 2 !== 0 ) ? s.toLocaleUpperCase().indexOf( value.toLocaleUpperCase() ) : s.indexOf( value );

        if ( index > -1 ) {
          if ( arguments.length === 5 ) {
            // StringComparison
            return ( System.String.compare( value, s.substr( index, value.length ), arguments[4] ) === 0 ) ? index + startIndex : -1;
          } else {
            return index + startIndex;
          }
        }

        return -1;
      },

      equals: function () {
        return System.String.compare.apply( this, arguments ) === 0;
      },

      swapCase: function ( letters ) {
        return letters.replace( /\w/g, function ( c ) {
          if ( c === c.toLowerCase() ) {
            return c.toUpperCase();
          } else {
            return c.toLowerCase();
          }
        } );
      },

      compare: function ( strA, strB ) {
        if ( strA == null ) {
          return ( strB == null ) ? 0 : -1;
        }

        if ( strB == null ) {
          return 1;
        }

        if ( arguments.length >= 3 ) {
          if ( !Bridge.isBoolean( arguments[2] ) ) {
            // StringComparison
            switch ( arguments[2] ) {
              case 1: // CurrentCultureIgnoreCase
                return strA.localeCompare( strB, System.Globalization.CultureInfo.getCurrentCulture().name, {
                  sensitivity: "accent"
                } );
              case 2: // InvariantCulture
                return strA.localeCompare( strB, System.Globalization.CultureInfo.invariantCulture.name );
              case 3: // InvariantCultureIgnoreCase
                return strA.localeCompare( strB, System.Globalization.CultureInfo.invariantCulture.name, {
                  sensitivity: "accent"
                } );
              case 4: // Ordinal
                return ( strA === strB ) ? 0 : ( ( strA > strB ) ? 1 : -1 );
              case 5: // OrdinalIgnoreCase
                return ( strA.toUpperCase() === strB.toUpperCase() ) ? 0 : ( ( strA.toUpperCase() > strB.toUpperCase() ) ? 1 : -1 );
              case 0: // CurrentCulture
              default:
                break;
            }
          } else {
            // ignoreCase
            if ( arguments[2] ) {
              strA = strA.toLocaleUpperCase();
              strB = strB.toLocaleUpperCase();
            }

            if ( arguments.length === 4 ) {
              // CultureInfo
              return strA.localeCompare( strB, arguments[3].name );
            }
          }
        }

        return strA.localeCompare( strB );
      },

      toCharArray: function ( str, startIndex, length ) {
        if ( startIndex < 0 || startIndex > str.length || startIndex > str.length - length ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "startIndex", "startIndex cannot be less than zero and must refer to a location within the string" );
        }

        if ( length < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "length", "must be non-negative" );
        }

        if ( !Bridge.hasValue( startIndex ) ) {
          startIndex = 0;
        }

        if ( !Bridge.hasValue( length ) ) {
          length = str.length;
        }

        var arr = [];

        for ( var i = startIndex; i < startIndex + length; i++ ) {
          arr.push( str.charCodeAt( i ) );
        }

        return arr;
      },

      escape: function ( str ) {
        return str.replace( /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&" );
      },

      replaceAll: function ( str, a, b ) {
        var reg = new RegExp( System.String.escape( a ), "g" );

        return str.replace( reg, b );
      },

      insert: function ( index, strA, strB ) {
        return index > 0 ? ( strA.substring( 0, index ) + strB + strA.substring( index, strA.length ) ) : ( strB + strA );
      },

      remove: function ( s, index, count ) {
        if ( s == null ) {
          throw new System.NullReferenceException();
        }

        if ( index < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "startIndex", "StartIndex cannot be less than zero" );
        }

        if ( count != null ) {
          if ( count < 0 ) {
            throw new System.ArgumentOutOfRangeException.$ctor4( "count", "Count cannot be less than zero" );
          }

          if ( count > s.length - index ) {
            throw new System.ArgumentOutOfRangeException.$ctor4( "count", "Index and count must refer to a location within the string" );
          }
        } else {
          if ( index >= s.length ) {
            throw new System.ArgumentOutOfRangeException.$ctor4( "startIndex", "startIndex must be less than length of string" );
          }
        }

        if ( count == null || ( ( index + count ) > s.length ) ) {
          return s.substr( 0, index );
        }

        return s.substr( 0, index ) + s.substr( index + count );
      },

      split: function ( s, strings, limit, options ) {
        var re = ( !Bridge.hasValue( strings ) || strings.length === 0 ) ? new RegExp( "\\s", "g" ) : new RegExp( strings.map( System.String.escape ).join( "|" ), "g" ),
          res = [],
          m,
          i;

        for ( i = 0; ; i = re.lastIndex ) {
          if ( m = re.exec( s ) ) {
            if ( options !== 1 || m.index > i ) {
              if ( res.length === limit - 1 ) {
                res.push( s.substr( i ) );

                return res;
              } else {
                res.push( s.substring( i, m.index ) );
              }
            }
          } else {
            if ( options !== 1 || i !== s.length ) {
              res.push( s.substr( i ) );
            }

            return res;
          }
        }
      },

      trimEnd: function ( str, chars ) {
        return str.replace( chars ? new RegExp( "[" + System.String.escape( String.fromCharCode.apply( null, chars ) ) + "]+$" ) : /\s*$/, "" );
      },

      trimStart: function ( str, chars ) {
        return str.replace( chars ? new RegExp( "^[" + System.String.escape( String.fromCharCode.apply( null, chars ) ) + "]+" ) : /^\s*/, "" );
      },

      trim: function ( str, chars ) {
        return System.String.trimStart( System.String.trimEnd( str, chars ), chars );
      },

      trimStartZeros: function ( str ) {
        return str.replace( new RegExp( "^[ 0+]+(?=.)" ), "" );
      },

      concat: function ( values ) {
        var list = ( arguments.length == 1 && Array.isArray( values ) ) ? values : [].slice.call( arguments ),
          s = "";

        for ( var i = 0; i < list.length; i++ ) {
          s += list[i] == null ? "" : Bridge.toString( list[i] );
        }

        return s;
      },

      copyTo: function ( str, sourceIndex, destination, destinationIndex, count ) {
        if ( destination == null ) {
          throw new System.ArgumentNullException.$ctor1( "destination" );
        }

        if ( str == null ) {
          throw new System.ArgumentNullException.$ctor1( "str" );
        }

        if ( count < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "count" );
        }

        if ( sourceIndex < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "sourceIndex" );
        }

        if ( count > str.length - sourceIndex ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "sourceIndex" );
        }

        if ( destinationIndex > destination.length - count || destinationIndex < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "destinationIndex" );
        }

        if ( count > 0 ) {
          for ( var i = 0; i < count; i++ ) {
            destination[destinationIndex + i] = str.charCodeAt( sourceIndex + i );
          }
        }
      }
    }
  } );

  Bridge.Class.addExtend( System.String, [System.IComparable$1( System.String ), System.IEquatable$1( System.String )] );

  // @source Regex.js

  Bridge.define( "System.Text.RegularExpressions.Regex", {
    statics: {
      _cacheSize: 15,
      _defaultMatchTimeout: System.TimeSpan.fromMilliseconds( -1 ),

      getCacheSize: function () {
        return System.Text.RegularExpressions.Regex._cacheSize;
      },

      setCacheSize: function ( value ) {
        if ( value < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "value" );
        }

        System.Text.RegularExpressions.Regex._cacheSize = value;
        //TODO: remove extra items from cache
      },

      escape: function ( str ) {
        if ( str == null ) {
          throw new System.ArgumentNullException.$ctor1( "str" );
        }

        return System.Text.RegularExpressions.RegexParser.escape( str );
      },

      unescape: function ( str ) {
        if ( str == null ) {
          throw new System.ArgumentNullException.$ctor1( "str" );
        }

        return System.Text.RegularExpressions.RegexParser.unescape( str );
      },

      isMatch: function ( input, pattern, options, matchTimeout ) {
        var scope = System.Text.RegularExpressions;

        if ( !Bridge.isDefined( options ) ) {
          options = scope.RegexOptions.None;
        }

        if ( !Bridge.isDefined( matchTimeout ) ) {
          matchTimeout = scope.Regex._defaultMatchTimeout;
        }

        var regex = new System.Text.RegularExpressions.Regex.ctor( pattern, options, matchTimeout, true );

        return regex.isMatch( input );
      },

      match: function ( input, pattern, options, matchTimeout ) {
        var scope = System.Text.RegularExpressions;

        if ( !Bridge.isDefined( options ) ) {
          options = scope.RegexOptions.None;
        }

        if ( !Bridge.isDefined( matchTimeout ) ) {
          matchTimeout = scope.Regex._defaultMatchTimeout;
        }

        var regex = new System.Text.RegularExpressions.Regex.ctor( pattern, options, matchTimeout, true );

        return regex.match( input );
      },

      matches: function ( input, pattern, options, matchTimeout ) {
        var scope = System.Text.RegularExpressions;

        if ( !Bridge.isDefined( options ) ) {
          options = scope.RegexOptions.None;
        }

        if ( !Bridge.isDefined( matchTimeout ) ) {
          matchTimeout = scope.Regex._defaultMatchTimeout;
        }

        var regex = new System.Text.RegularExpressions.Regex.ctor( pattern, options, matchTimeout, true );

        return regex.matches( input );
      },

      replace: function ( input, pattern, replacement, options, matchTimeout ) {
        var scope = System.Text.RegularExpressions;

        if ( !Bridge.isDefined( options ) ) {
          options = scope.RegexOptions.None;
        }

        if ( !Bridge.isDefined( matchTimeout ) ) {
          matchTimeout = scope.Regex._defaultMatchTimeout;
        }

        var regex = new System.Text.RegularExpressions.Regex.ctor( pattern, options, matchTimeout, true );

        return regex.replace( input, replacement );
      },

      split: function ( input, pattern, options, matchTimeout ) {
        var scope = System.Text.RegularExpressions;

        if ( !Bridge.isDefined( options ) ) {
          options = scope.RegexOptions.None;
        }

        if ( !Bridge.isDefined( matchTimeout ) ) {
          matchTimeout = scope.Regex._defaultMatchTimeout;
        }

        var regex = new System.Text.RegularExpressions.Regex.ctor( pattern, options, matchTimeout, true );

        return regex.split( input );
      }
    },

    _pattern: "",
    _matchTimeout: System.TimeSpan.fromMilliseconds( -1 ),
    _runner: null,
    _caps: null,
    _capsize: 0,
    _capnames: null,
    _capslist: null,

    config: {
      init: function () {
        this._options = System.Text.RegularExpressions.RegexOptions.None;
      }
    },

    ctor: function ( pattern, options, matchTimeout, useCache ) {
      this.$initialize();

      if ( !Bridge.isDefined( options ) ) {
        options = System.Text.RegularExpressions.RegexOptions.None;
      }

      if ( !Bridge.isDefined( matchTimeout ) ) {
        matchTimeout = System.TimeSpan.fromMilliseconds( -1 );
      }

      if ( !Bridge.isDefined( useCache ) ) {
        useCache = false;
      }

      var scope = System.Text.RegularExpressions;

      if ( pattern == null ) {
        throw new System.ArgumentNullException.$ctor1( "pattern" );
      }

      if ( options < scope.RegexOptions.None || ( ( options >> 10 ) !== 0 ) ) {
        throw new System.ArgumentOutOfRangeException.$ctor1( "options" );
      }

      if ( ( ( options & scope.RegexOptions.ECMAScript ) !== 0 ) &&
        ( ( options & ~( scope.RegexOptions.ECMAScript |
          scope.RegexOptions.IgnoreCase |
          scope.RegexOptions.Multiline |
          scope.RegexOptions.CultureInvariant
        ) ) !== 0 ) ) {
        throw new System.ArgumentOutOfRangeException.$ctor1( "options" );
      }

      // Check if the specified options are supported.
      var supportedOptions =
        System.Text.RegularExpressions.RegexOptions.IgnoreCase |
        System.Text.RegularExpressions.RegexOptions.Multiline |
        System.Text.RegularExpressions.RegexOptions.Singleline |
        System.Text.RegularExpressions.RegexOptions.IgnorePatternWhitespace |
        System.Text.RegularExpressions.RegexOptions.ExplicitCapture;

      if ( ( options | supportedOptions ) !== supportedOptions ) {
        throw new System.NotSupportedException.$ctor1( "Specified Regex options are not supported." );
      }

      this._validateMatchTimeout( matchTimeout );

      this._pattern = pattern;
      this._options = options;
      this._matchTimeout = matchTimeout;
      this._runner = new scope.RegexRunner( this );

      //TODO: cache
      var patternInfo = this._runner.parsePattern();

      this._capnames = patternInfo.sparseSettings.sparseSlotNameMap;
      this._capslist = patternInfo.sparseSettings.sparseSlotNameMap.keys;
      this._capsize = this._capslist.length;
    },

    getMatchTimeout: function () {
      return this._matchTimeout;
    },

    getOptions: function () {
      return this._options;
    },

    getRightToLeft: function () {
      return ( this._options & System.Text.RegularExpressions.RegexOptions.RightToLeft ) !== 0;
    },

    isMatch: function ( input, startat ) {
      if ( input == null ) {
        throw new System.ArgumentNullException.$ctor1( "input" );
      }

      if ( !Bridge.isDefined( startat ) ) {
        startat = this.getRightToLeft() ? input.length : 0;
      }

      var match = this._runner.run( true, -1, input, 0, input.length, startat );

      return match == null;
    },

    match: function ( input, startat, arg3 ) {
      if ( input == null ) {
        throw new System.ArgumentNullException.$ctor1( "input" );
      }

      var length = input.length,
        beginning = 0;

      if ( arguments.length === 3 ) {
        beginning = startat;
        length = arg3;
        startat = this.getRightToLeft() ? beginning + length : beginning;
      } else if ( !Bridge.isDefined( startat ) ) {
        startat = this.getRightToLeft() ? length : 0;
      }

      return this._runner.run( false, -1, input, beginning, length, startat );
    },

    matches: function ( input, startat ) {
      if ( input == null ) {
        throw new System.ArgumentNullException.$ctor1( "input" );
      }

      if ( !Bridge.isDefined( startat ) ) {
        startat = this.getRightToLeft() ? input.length : 0;
      }

      return new System.Text.RegularExpressions.MatchCollection( this, input, 0, input.length, startat );
    },

    getGroupNames: function () {
      if ( this._capslist == null ) {
        var invariantCulture = System.Globalization.CultureInfo.invariantCulture;

        var result = [];
        var max = this._capsize;
        var i;

        for ( i = 0; i < max; i++ ) {
          result[i] = System.Convert.toString( i, invariantCulture, System.Convert.typeCodes.Int32 );
        }

        return result;
      } else {
        return this._capslist.slice();
      }
    },

    getGroupNumbers: function () {
      var caps = this._caps;
      var result;
      var key;
      var max;
      var i;

      if ( caps == null ) {
        result = [];
        max = this._capsize;
        for ( i = 0; i < max; i++ ) {
          result.push( i );
        }
      } else {
        result = [];

        for ( key in caps ) {
          if ( caps.hasOwnProperty( key ) ) {
            result[caps[key]] = key;
          }
        }
      }

      return result;
    },

    groupNameFromNumber: function ( i ) {
      if ( this._capslist == null ) {
        if ( i >= 0 && i < this._capsize ) {
          var invariantCulture = System.Globalization.CultureInfo.invariantCulture;

          return System.Convert.toString( i, invariantCulture, System.Convert.typeCodes.Int32 );
        }

        return "";
      } else {
        if ( this._caps != null ) {
          var obj = this._caps[i];

          if ( obj == null ) {
            return "";
          }

          return parseInt( obj );
        }

        if ( i >= 0 && i < this._capslist.length ) {
          return this._capslist[i];
        }

        return "";
      }
    },

    groupNumberFromName: function ( name ) {
      if ( name == null ) {
        throw new System.ArgumentNullException.$ctor1( "name" );
      }

      // look up name if we have a hashtable of names
      if ( this._capnames != null ) {
        var ret = this._capnames[name];

        if ( ret == null ) {
          return -1;
        }

        return parseInt( ret );
      }

      // convert to an int if it looks like a number
      var result = 0;
      var ch;
      var i;

      for ( i = 0; i < name.Length; i++ ) {
        ch = name[i];

        if ( ch > "9" || ch < "0" ) {
          return -1;
        }

        result *= 10;
        result += ( ch - "0" );
      }

      // return int if it's in range
      if ( result >= 0 && result < this._capsize ) {
        return result;
      }

      return -1;
    },

    replace: function ( input, evaluator, count, startat ) {
      if ( input == null ) {
        throw new System.ArgumentNullException.$ctor1( "input" );
      }

      if ( !Bridge.isDefined( count ) ) {
        count = -1;
      }

      if ( !Bridge.isDefined( startat ) ) {
        startat = this.getRightToLeft() ? input.length : 0;
      }

      if ( evaluator == null ) {
        throw new System.ArgumentNullException.$ctor1( "evaluator" );
      }

      if ( Bridge.isFunction( evaluator ) ) {
        return System.Text.RegularExpressions.RegexReplacement.replace( evaluator, this, input, count, startat );
      }

      var repl = System.Text.RegularExpressions.RegexParser.parseReplacement( evaluator, this._caps, this._capsize, this._capnames, this._options );
      //TODO: Cache

      return repl.replace( this, input, count, startat );
    },

    split: function ( input, count, startat ) {
      if ( input == null ) {
        throw new System.ArgumentNullException.$ctor1( "input" );
      }

      if ( !Bridge.isDefined( count ) ) {
        count = 0;
      }

      if ( !Bridge.isDefined( startat ) ) {
        startat = this.getRightToLeft() ? input.length : 0;
      }

      return System.Text.RegularExpressions.RegexReplacement.split( this, input, count, startat );
    },

    _validateMatchTimeout: function ( matchTimeout ) {
      var ms = matchTimeout.getTotalMilliseconds();

      if ( -1 === ms ) {
        return;
      }

      if ( ms > 0 && ms <= 2147483646 ) {
        return;
      }

      throw new System.ArgumentOutOfRangeException.$ctor1( "matchTimeout" );
    }
  } );

  // @source RegexParser.js

  Bridge.define( "System.Text.RegularExpressions.RegexParser", {
    statics: {
      _Q: 5, // quantifier
      _S: 4, // ordinary stopper
      _Z: 3, // ScanBlank stopper
      _X: 2, // whitespace
      _E: 1, // should be escaped

      _category: [
        //0 1 2  3  4  5  6  7  8  9  A  B  C  D  E  F  0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F
        0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        //! " #  $  %  &  '  (  )  *  +  ,  -  .  /  0  1  2  3  4  5  6  7  8  9  :  ;  <  =  >  ?
        2, 0, 0, 3, 4, 0, 0, 0, 4, 4, 5, 5, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5,
        //@ A B  C  D  E  F  G  H  I  J  K  L  M  N  O  P  Q  R  S  T  U  V  W  X  Y  Z  [  \  ]  ^  _
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 4, 0,
        //' a b  c  d  e  f  g  h  i  j  k  l  m  n  o  p  q  r  s  t  u  v  w  x  y  z  {  |  }  ~
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 4, 0, 0, 0
      ],

      escape: function ( input ) {
        var sb;
        var ch;
        var lastpos;
        var i;

        for ( i = 0; i < input.length; i++ ) {
          if ( System.Text.RegularExpressions.RegexParser._isMetachar( input[i] ) ) {
            sb = "";
            ch = input[i];

            sb += input.slice( 0, i );

            do {
              sb += "\\";

              switch ( ch ) {
                case "\n":
                  ch = "n";
                  break;
                case "\r":
                  ch = "r";
                  break;
                case "\t":
                  ch = "t";
                  break;
                case "\f":
                  ch = "f";
                  break;
              }

              sb += ch;
              i++;
              lastpos = i;

              while ( i < input.length ) {
                ch = input[i];

                if ( System.Text.RegularExpressions.RegexParser._isMetachar( ch ) ) {
                  break;
                }

                i++;
              }

              sb += input.slice( lastpos, i );
            } while ( i < input.length );

            return sb;
          }
        }

        return input;
      },

      unescape: function ( input ) {
        var culture = System.Globalization.CultureInfo.invariantCulture;
        var sb;
        var lastpos;
        var i;
        var p;

        for ( i = 0; i < input.length; i++ ) {
          if ( input[i] === "\\" ) {
            sb = "";
            p = new System.Text.RegularExpressions.RegexParser( culture );
            p._setPattern( input );

            sb += input.slice( 0, i );

            do {
              i++;

              p._textto( i );

              if ( i < input.length ) {
                sb += p._scanCharEscape();
              }

              i = p._textpos();
              lastpos = i;

              while ( i < input.length && input[i] !== "\\" ) {
                i++;
              }

              sb += input.slice( lastpos, i );
            } while ( i < input.length );

            return sb;
          }
        }

        return input;
      },

      parseReplacement: function ( rep, caps, capsize, capnames, op ) {
        var culture = System.Globalization.CultureInfo.getCurrentCulture(); // TODO: InvariantCulture
        var p = new System.Text.RegularExpressions.RegexParser( culture );

        p._options = op;
        p._noteCaptures( caps, capsize, capnames );
        p._setPattern( rep );

        var root = p._scanReplacement();

        return new System.Text.RegularExpressions.RegexReplacement( rep, root, caps );
      },

      _isMetachar: function ( ch ) {
        var code = ch.charCodeAt( 0 );

        return ( code <= "|".charCodeAt( 0 ) && System.Text.RegularExpressions.RegexParser._category[code] >= System.Text.RegularExpressions.RegexParser._E );
      }
    },

    _caps: null,
    _capsize: 0,
    _capnames: null,
    _pattern: "",
    _currentPos: 0,
    _concatenation: null,
    _culture: null,

    config: {
      init: function () {
        this._options = System.Text.RegularExpressions.RegexOptions.None;
      }
    },

    ctor: function ( culture ) {
      this.$initialize();
      this._culture = culture;
      this._caps = {};
    },

    _noteCaptures: function ( caps, capsize, capnames ) {
      this._caps = caps;
      this._capsize = capsize;
      this._capnames = capnames;
    },

    _setPattern: function ( pattern ) {
      if ( pattern == null ) {
        pattern = "";
      }

      this._pattern = pattern || "";
      this._currentPos = 0;
    },

    _scanReplacement: function () {
      this._concatenation = new System.Text.RegularExpressions.RegexNode( System.Text.RegularExpressions.RegexNode.Concatenate, this._options );
      var c;
      var startpos;
      var dollarNode;

      while ( true ) {
        c = this._charsRight();

        if ( c === 0 ) {
          break;
        }

        startpos = this._textpos();

        while ( c > 0 && this._rightChar() !== "$" ) {
          this._moveRight();
          c--;
        }

        this._addConcatenate( startpos, this._textpos() - startpos );

        if ( c > 0 ) {
          if ( this._moveRightGetChar() === "$" ) {
            dollarNode = this._scanDollar();
            this._concatenation.addChild( dollarNode );
          }
        }
      }

      return this._concatenation;
    },

    _addConcatenate: function ( pos, cch /*, bool isReplacement*/ ) {
      if ( cch === 0 ) {
        return;
      }

      var node;

      if ( cch > 1 ) {
        var str = this._pattern.slice( pos, pos + cch );

        node = new System.Text.RegularExpressions.RegexNode( System.Text.RegularExpressions.RegexNode.Multi, this._options, str );
      } else {
        var ch = this._pattern[pos];

        node = new System.Text.RegularExpressions.RegexNode( System.Text.RegularExpressions.RegexNode.One, this._options, ch );
      }

      this._concatenation.addChild( node );
    },

    _useOptionE: function () {
      return ( this._options & System.Text.RegularExpressions.RegexOptions.ECMAScript ) !== 0;
    },

    _makeException: function ( message ) {
      return new System.ArgumentException( "Incorrect pattern. " + message );
    },

    _scanDollar: function () {
      var maxValueDiv10 = 214748364; // Int32.MaxValue / 10;
      var maxValueMod10 = 7; // Int32.MaxValue % 10;

      if ( this._charsRight() === 0 ) {
        return new System.Text.RegularExpressions.RegexNode( System.Text.RegularExpressions.RegexNode.One, this._options, "$" );
      }

      var ch = this._rightChar();
      var angled;
      var backpos = this._textpos();
      var lastEndPos = backpos;

      // Note angle
      if ( ch === "{" && this._charsRight() > 1 ) {
        angled = true;
        this._moveRight();
        ch = this._rightChar();
      } else {
        angled = false;
      }

      // Try to parse backreference: \1 or \{1} or \{cap}

      var capnum;
      var digit;

      if ( ch >= "0" && ch <= "9" ) {
        if ( !angled && this._useOptionE() ) {
          capnum = -1;
          var newcapnum = ch - "0";

          this._moveRight();

          if ( this._isCaptureSlot( newcapnum ) ) {
            capnum = newcapnum;
            lastEndPos = this._textpos();
          }

          while ( this._charsRight() > 0 && ( ch = this._rightChar() ) >= "0" && ch <= "9" ) {
            digit = ch - "0";
            if ( newcapnum > ( maxValueDiv10 ) || ( newcapnum === ( maxValueDiv10 ) && digit > ( maxValueMod10 ) ) ) {
              throw this._makeException( "Capture group is out of range." );
            }

            newcapnum = newcapnum * 10 + digit;

            this._moveRight();

            if ( this._isCaptureSlot( newcapnum ) ) {
              capnum = newcapnum;
              lastEndPos = this._textpos();
            }
          }
          this._textto( lastEndPos );

          if ( capnum >= 0 ) {
            return new System.Text.RegularExpressions.RegexNode( System.Text.RegularExpressions.RegexNode.Ref, this._options, capnum );
          }
        } else {
          capnum = this._scanDecimal();

          if ( !angled || this._charsRight() > 0 && this._moveRightGetChar() === "}" ) {
            if ( this._isCaptureSlot( capnum ) ) {
              return new System.Text.RegularExpressions.RegexNode( System.Text.RegularExpressions.RegexNode.Ref, this._options, capnum );
            }
          }
        }
      } else if ( angled && this._isWordChar( ch ) ) {
        var capname = this._scanCapname();

        if ( this._charsRight() > 0 && this._moveRightGetChar() === "}" ) {
          if ( this._isCaptureName( capname ) ) {
            var captureSlot = this._captureSlotFromName( capname );

            return new System.Text.RegularExpressions.RegexNode( System.Text.RegularExpressions.RegexNode.Ref, this._options, captureSlot );
          }
        }
      } else if ( !angled ) {
        capnum = 1;

        switch ( ch ) {
          case "$":
            this._moveRight();
            return new System.Text.RegularExpressions.RegexNode( System.Text.RegularExpressions.RegexNode.One, this._options, "$" );

          case "&":
            capnum = 0;
            break;

          case "`":
            capnum = System.Text.RegularExpressions.RegexReplacement.LeftPortion;
            break;

          case "\'":
            capnum = System.Text.RegularExpressions.RegexReplacement.RightPortion;
            break;

          case "+":
            capnum = System.Text.RegularExpressions.RegexReplacement.LastGroup;
            break;

          case "_":
            capnum = System.Text.RegularExpressions.RegexReplacement.WholeString;
            break;
        }

        if ( capnum !== 1 ) {
          this._moveRight();

          return new System.Text.RegularExpressions.RegexNode( System.Text.RegularExpressions.RegexNode.Ref, this._options, capnum );
        }
      }

      // unrecognized $: literalize

      this._textto( backpos );

      return new System.Text.RegularExpressions.RegexNode( System.Text.RegularExpressions.RegexNode.One, this._options, "$" );
    },

    _scanDecimal: function () {
      // Scans any number of decimal digits (pegs value at 2^31-1 if too large)

      var maxValueDiv10 = 214748364; // Int32.MaxValue / 10;
      var maxValueMod10 = 7; // Int32.MaxValue % 10;
      var i = 0;
      var ch;
      var d;

      while ( this._charsRight() > 0 ) {
        ch = this._rightChar();

        if ( ch < "0" || ch > "9" ) {
          break;
        }

        d = ch - "0";

        this._moveRight();

        if ( i > ( maxValueDiv10 ) || ( i === ( maxValueDiv10 ) && d > ( maxValueMod10 ) ) ) {
          throw this._makeException( "Capture group is out of range." );
        }

        i *= 10;
        i += d;
      }

      return i;
    },

    _scanOctal: function () {
      var d;
      var i;
      var c;

      // Consume octal chars only up to 3 digits and value 0377

      c = 3;

      if ( c > this._charsRight() ) {
        c = this._charsRight();
      }

      for ( i = 0; c > 0 && ( d = this._rightChar() - "0" ) <= 7; c -= 1 ) {
        this._moveRight();

        i *= 8;
        i += d;

        if ( this._useOptionE() && i >= 0x20 ) {
          break;
        }
      }

      // Octal codes only go up to 255.  Any larger and the behavior that Perl follows
      // is simply to truncate the high bits.
      i &= 0xFF;

      return String.fromCharCode( i );
    },

    _scanHex: function ( c ) {
      var i;
      var d;

      i = 0;

      if ( this._charsRight() >= c ) {
        for ( ; c > 0 && ( ( d = this._hexDigit( this._moveRightGetChar() ) ) >= 0 ); c -= 1 ) {
          i *= 0x10;
          i += d;
        }
      }

      if ( c > 0 ) {
        throw this._makeException( "Insufficient hexadecimal digits." );
      }

      return i;
    },

    _hexDigit: function ( ch ) {
      var d;

      var code = ch.charCodeAt( 0 );

      if ( ( d = code - "0".charCodeAt( 0 ) ) <= 9 ) {
        return d;
      }

      if ( ( d = code - "a".charCodeAt( 0 ) ) <= 5 ) {
        return d + 0xa;
      }

      if ( ( d = code - "A".charCodeAt( 0 ) ) <= 5 ) {
        return d + 0xa;
      }

      return -1;
    },

    _scanControl: function () {
      if ( this._charsRight() <= 0 ) {
        throw this._makeException( "Missing control character." );
      }

      var ch = this._moveRightGetChar();

      // \ca interpreted as \cA

      var code = ch.charCodeAt( 0 );

      if ( code >= "a".charCodeAt( 0 ) && code <= "z".charCodeAt( 0 ) ) {
        code = code - ( "a".charCodeAt( 0 ) - "A".charCodeAt( 0 ) );
      }

      if ( ( code = ( code - "@".charCodeAt( 0 ) ) ) < " ".charCodeAt( 0 ) ) {
        return String.fromCharCode( code );
      }

      throw this._makeException( "Unrecognized control character." );
    },

    _scanCapname: function () {
      var startpos = this._textpos();

      while ( this._charsRight() > 0 ) {
        if ( !this._isWordChar( this._moveRightGetChar() ) ) {
          this._moveLeft();

          break;
        }
      }

      return _pattern.slice( startpos, this._textpos() );
    },

    _scanCharEscape: function () {
      var ch = this._moveRightGetChar();

      if ( ch >= "0" && ch <= "7" ) {
        this._moveLeft();

        return this._scanOctal();
      }

      switch ( ch ) {
        case "x":
          return this._scanHex( 2 );
        case "u":
          return this._scanHex( 4 );
        case "a":
          return "\u0007";
        case "b":
          return "\b";
        case "e":
          return "\u001B";
        case "f":
          return "\f";
        case "n":
          return "\n";
        case "r":
          return "\r";
        case "t":
          return "\t";
        case "v":
          return "\u000B";
        case "c":
          return this._scanControl();
        default:
          var isInvalidBasicLatin = ch === '8' || ch === '9' || ch === '_';
          if ( isInvalidBasicLatin || ( !this._useOptionE() && this._isWordChar( ch ) ) ) {
            throw this._makeException( "Unrecognized escape sequence \\" + ch + "." );
          }
          return ch;
      }
    },

    _captureSlotFromName: function ( capname ) {
      return this._capnames[capname];
    },

    _isCaptureSlot: function ( i ) {
      if ( this._caps != null ) {
        return this._caps[i] != null;
      }

      return ( i >= 0 && i < this._capsize );
    },

    _isCaptureName: function ( capname ) {
      if ( this._capnames == null ) {
        return false;
      }

      return _capnames[capname] != null;
    },

    _isWordChar: function ( ch ) {
      // Partial implementation,
      // see the link for more details (http://referencesource.microsoft.com/#System/regex/system/text/regularexpressions/RegexParser.cs,1156)
      return System.Char.isLetter( ch.charCodeAt( 0 ) );
    },

    _charsRight: function () {
      return this._pattern.length - this._currentPos;
    },

    _rightChar: function () {
      return this._pattern[this._currentPos];
    },

    _moveRightGetChar: function () {
      return this._pattern[this._currentPos++];
    },

    _moveRight: function () {
      this._currentPos++;
    },

    _textpos: function () {
      return this._currentPos;
    },

    _textto: function ( pos ) {
      this._currentPos = pos;
    },

    _moveLeft: function () {
      this._currentPos--;
    }
  } );

  // @source End.js

  // module export
  if ( typeof define === "function" && define.amd ) {
    // AMD
    define( "bridge", [], function () { return Bridge; } );
  } else if ( typeof module !== "undefined" && module.exports ) {
    // Node
    module.exports = Bridge;
  }

  // @source Finally.js

} )( this );
