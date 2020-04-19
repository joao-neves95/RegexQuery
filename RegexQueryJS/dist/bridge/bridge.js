/**
 * @version   : 17.10.1 - Bridge.NET
 * @author    : Object.NET, Inc. http://bridge.net/
 * @copyright : Copyright 2008-2019 Object.NET, Inc. http://object.net/
 * @license   : See license.txt and https://github.com/bridgedotnet/Bridge/blob/master/LICENSE.md
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

  System.Reflection.EventInfo = {
    $is: function ( obj ) {
      return obj != null && obj.t === 2;
    }
  };

  System.Reflection.FieldInfo = {
    $is: function ( obj ) {
      return obj != null && obj.t === 4;
    }
  };

  System.Reflection.MethodBase = {
    $is: function ( obj ) {
      return obj != null && ( obj.t === 1 || obj.t === 8 );
    }
  };

  System.Reflection.MethodInfo = {
    $is: function ( obj ) {
      return obj != null && obj.t === 8;
    }
  };

  System.Reflection.PropertyInfo = {
    $is: function ( obj ) {
      return obj != null && obj.t === 16;
    }
  };

  System.AppDomain = {
    getAssemblies: function () {
      return Object.keys( System.Reflection.Assembly.assemblies ).map( function ( n ) { return System.Reflection.Assembly.assemblies[n]; } );
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

  // @source Ref.js

  Bridge.define( "Bridge.Ref$1", function ( T ) {
    return {
      statics: {
        methods: {
          op_Implicit: function ( reference ) {
            return reference.Value;
          }
        }
      },
      fields: {
        getter: null,
        setter: null
      },
      props: {
        Value: {
          get: function () {
            return this.getter();
          },
          set: function ( value ) {
            this.setter( value );
          }
        },
        v: {
          get: function () {
            return this.Value;
          },
          set: function ( value ) {
            this.Value = value;
          }
        }
      },
      ctors: {
        ctor: function ( getter, setter ) {
          this.$initialize();
          this.getter = getter;
          this.setter = setter;
        }
      },
      methods: {
        toString: function () {
          return Bridge.toString( this.Value );
        },
        valueOf: function () {
          return this.Value;
        }
      }
    };
  } );

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

  // @source OutOfMemoryException.js

  Bridge.define( "System.OutOfMemoryException", {
    inherits: [System.SystemException],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.SystemException.$ctor1.call( this, "Insufficient memory to continue the execution of the program." );
        this.HResult = -2147024362;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2147024362;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, innerException );
        this.HResult = -2147024362;
      }
    }
  } );

  // @source ArrayTypeMismatchException.js

  Bridge.define( "System.ArrayTypeMismatchException", {
    inherits: [System.SystemException],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.SystemException.$ctor1.call( this, "Attempted to access an element as a type incompatible with the array." );
        this.HResult = -2146233085;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2146233085;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, innerException );
        this.HResult = -2146233085;
      }
    }
  } );

  // @source MissingManifestResourceException.js

  Bridge.define( "System.Resources.MissingManifestResourceException", {
    inherits: [System.SystemException],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.SystemException.$ctor1.call( this, "Unable to find manifest resource." );
        this.HResult = -2146233038;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2146233038;
      },
      $ctor2: function ( message, inner ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, inner );
        this.HResult = -2146233038;
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

  // @source BidiCategory.js

  Bridge.define( "System.Globalization.BidiCategory", {
    $kind: "enum",
    statics: {
      fields: {
        LeftToRight: 0,
        LeftToRightEmbedding: 1,
        LeftToRightOverride: 2,
        RightToLeft: 3,
        RightToLeftArabic: 4,
        RightToLeftEmbedding: 5,
        RightToLeftOverride: 6,
        PopDirectionalFormat: 7,
        EuropeanNumber: 8,
        EuropeanNumberSeparator: 9,
        EuropeanNumberTerminator: 10,
        ArabicNumber: 11,
        CommonNumberSeparator: 12,
        NonSpacingMark: 13,
        BoundaryNeutral: 14,
        ParagraphSeparator: 15,
        SegmentSeparator: 16,
        Whitespace: 17,
        OtherNeutrals: 18,
        LeftToRightIsolate: 19,
        RightToLeftIsolate: 20,
        FirstStrongIsolate: 21,
        PopDirectionIsolate: 22
      }
    }
  } );

  // @source SortVersion.js

  Bridge.define( "System.Globalization.SortVersion", {
    inherits: function () { return [System.IEquatable$1( System.Globalization.SortVersion )]; },
    statics: {
      methods: {
        op_Equality: function ( left, right ) {
          if ( left != null ) {
            return left.equalsT( right );
          }

          if ( right != null ) {
            return right.equalsT( left );
          }

          return true;
        },
        op_Inequality: function ( left, right ) {
          return !( System.Globalization.SortVersion.op_Equality( left, right ) );
        }
      }
    },
    fields: {
      m_NlsVersion: 0,
      m_SortId: null
    },
    props: {
      FullVersion: {
        get: function () {
          return this.m_NlsVersion;
        }
      },
      SortId: {
        get: function () {
          return this.m_SortId;
        }
      }
    },
    alias: ["equalsT", "System$IEquatable$1$System$Globalization$SortVersion$equalsT"],
    ctors: {
      init: function () {
        this.m_SortId = new System.Guid();
      },
      ctor: function ( fullVersion, sortId ) {
        this.$initialize();
        this.m_SortId = sortId;
        this.m_NlsVersion = fullVersion;
      },
      $ctor1: function ( nlsVersion, effectiveId, customVersion ) {
        this.$initialize();
        this.m_NlsVersion = nlsVersion;

        if ( System.Guid.op_Equality( customVersion, System.Guid.Empty ) ) {
          var b1 = ( effectiveId >> 24 ) & 255;
          var b2 = ( ( effectiveId & 16711680 ) >> 16 ) & 255;
          var b3 = ( ( effectiveId & 65280 ) >> 8 ) & 255;
          var b4 = ( effectiveId & 255 ) & 255;
          customVersion = new System.Guid.$ctor2( 0, 0, 0, 0, 0, 0, 0, b1, b2, b3, b4 );
        }

        this.m_SortId = customVersion;
      }
    },
    methods: {
      equals: function ( obj ) {
        var n = Bridge.as( obj, System.Globalization.SortVersion );
        if ( System.Globalization.SortVersion.op_Inequality( n, null ) ) {
          return this.equalsT( n );
        }

        return false;
      },
      equalsT: function ( other ) {
        if ( System.Globalization.SortVersion.op_Equality( other, null ) ) {
          return false;
        }

        return this.m_NlsVersion === other.m_NlsVersion && System.Guid.op_Equality( this.m_SortId, other.m_SortId );
      },
      getHashCode: function () {
        return Bridge.Int.mul( this.m_NlsVersion, 7 ) | this.m_SortId.getHashCode();
      }
    }
  } );

  // @source UnicodeCategory.js

  Bridge.define( "System.Globalization.UnicodeCategory", {
    $kind: "enum",
    statics: {
      fields: {
        UppercaseLetter: 0,
        LowercaseLetter: 1,
        TitlecaseLetter: 2,
        ModifierLetter: 3,
        OtherLetter: 4,
        NonSpacingMark: 5,
        SpacingCombiningMark: 6,
        EnclosingMark: 7,
        DecimalDigitNumber: 8,
        LetterNumber: 9,
        OtherNumber: 10,
        SpaceSeparator: 11,
        LineSeparator: 12,
        ParagraphSeparator: 13,
        Control: 14,
        Format: 15,
        Surrogate: 16,
        PrivateUse: 17,
        ConnectorPunctuation: 18,
        DashPunctuation: 19,
        OpenPunctuation: 20,
        ClosePunctuation: 21,
        InitialQuotePunctuation: 22,
        FinalQuotePunctuation: 23,
        OtherPunctuation: 24,
        MathSymbol: 25,
        CurrencySymbol: 26,
        ModifierSymbol: 27,
        OtherSymbol: 28,
        OtherNotAssigned: 29
      }
    }
  } );

  // @source DaylightTimeStruct.js

  Bridge.define( "System.Globalization.DaylightTimeStruct", {
    $kind: "struct",
    statics: {
      methods: {
        getDefaultValue: function () { return new System.Globalization.DaylightTimeStruct(); }
      }
    },
    fields: {
      Start: null,
      End: null,
      Delta: null
    },
    ctors: {
      init: function () {
        this.Start = System.DateTime.getDefaultValue();
        this.End = System.DateTime.getDefaultValue();
        this.Delta = new System.TimeSpan();
      },
      $ctor1: function ( start, end, delta ) {
        this.$initialize();
        this.Start = start;
        this.End = end;
        this.Delta = delta;
      },
      ctor: function () {
        this.$initialize();
      }
    },
    methods: {
      getHashCode: function () {
        var h = Bridge.addHash( [7445027511, this.Start, this.End, this.Delta] );
        return h;
      },
      equals: function ( o ) {
        if ( !Bridge.is( o, System.Globalization.DaylightTimeStruct ) ) {
          return false;
        }
        return Bridge.equals( this.Start, o.Start ) && Bridge.equals( this.End, o.End ) && Bridge.equals( this.Delta, o.Delta );
      },
      $clone: function ( to ) {
        var s = to || new System.Globalization.DaylightTimeStruct();
        s.Start = this.Start;
        s.End = this.End;
        s.Delta = this.Delta;
        return s;
      }
    }
  } );

  // @source DaylightTime.js

  Bridge.define( "System.Globalization.DaylightTime", {
    fields: {
      _start: null,
      _end: null,
      _delta: null
    },
    props: {
      Start: {
        get: function () {
          return this._start;
        }
      },
      End: {
        get: function () {
          return this._end;
        }
      },
      Delta: {
        get: function () {
          return this._delta;
        }
      }
    },
    ctors: {
      init: function () {
        this._start = System.DateTime.getDefaultValue();
        this._end = System.DateTime.getDefaultValue();
        this._delta = new System.TimeSpan();
      },
      ctor: function () {
        this.$initialize();
      },
      $ctor1: function ( start, end, delta ) {
        this.$initialize();
        this._start = start;
        this._end = end;
        this._delta = delta;
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

  // @source Environment.js

  Bridge.define( "System.Environment", {
    statics: {
      fields: {
        Variables: null
      },
      props: {
        Location: {
          get: function () {
            var g = Bridge.global;

            if ( g && g.location ) {
              return g.location;
            }

            return null;
          }
        },
        CommandLine: {
          get: function () {
            return ( System.Environment.GetCommandLineArgs() ).join( " " );
          }
        },
        CurrentDirectory: {
          get: function () {
            var l = System.Environment.Location;

            return l ? l.pathname : "";
          },
          set: function ( value ) {
            var l = System.Environment.Location;

            if ( l ) {
              l.pathname = value;
            }
          }
        },
        ExitCode: 0,
        Is64BitOperatingSystem: {
          get: function () {
            var n = Bridge.global ? Bridge.global.navigator : null;

            if ( n && ( !Bridge.referenceEquals( n.userAgent.indexOf( "WOW64" ), -1 ) || !Bridge.referenceEquals( n.userAgent.indexOf( "Win64" ), -1 ) ) ) {
              return true;
            }

            return false;
          }
        },
        ProcessorCount: {
          get: function () {
            var n = Bridge.global ? Bridge.global.navigator : null;

            if ( n && n.hardwareConcurrency ) {
              return n.hardwareConcurrency;
            }

            return 1;
          }
        },
        StackTrace: {
          get: function () {
            var err = new Error();
            var s = err.stack;

            if ( !System.String.isNullOrEmpty( s ) ) {
              if ( System.String.indexOf( s, "at" ) >= 0 ) {
                return s.substr( System.String.indexOf( s, "at" ) );
              }
            }

            return "";
          }
        },
        Version: {
          get: function () {
            var s = Bridge.SystemAssembly.compiler;

            var v = {};

            if ( System.Version.tryParse( s, v ) ) {
              return v.v;
            }

            return new System.Version.ctor();
          }
        }
      },
      ctors: {
        init: function () {
          this.ExitCode = 0;
        },
        ctor: function () {
          System.Environment.Variables = new ( System.Collections.Generic.Dictionary$2( System.String, System.String ) ).ctor();
          System.Environment.PatchDictionary( System.Environment.Variables );
        }
      },
      methods: {
        GetResourceString: function ( key ) {
          return key;
        },
        GetResourceString$1: function ( key, values ) {
          if ( values === void 0 ) { values = []; }
          var s = System.Environment.GetResourceString( key );
          return System.String.formatProvider.apply( System.String, [System.Globalization.CultureInfo.getCurrentCulture(), s].concat( values ) );
        },
        PatchDictionary: function ( d ) {
          d.noKeyCheck = true;

          return d;
        },
        Exit: function ( exitCode ) {
          System.Environment.ExitCode = exitCode;
        },
        ExpandEnvironmentVariables: function ( name ) {
          var $t;
          if ( name == null ) {
            throw new System.ArgumentNullException.$ctor1( name );
          }

          $t = Bridge.getEnumerator( System.Environment.Variables );
          try {
            while ( $t.moveNext() ) {
              var pair = $t.Current;
              name = System.String.replaceAll( name, "%" + ( pair.key || "" ) + "%", pair.value );
            }
          } finally {
            if ( Bridge.is( $t, System.IDisposable ) ) {
              $t.System$IDisposable$Dispose();
            }
          }

          return name;
        },
        FailFast: function ( message ) {
          throw new System.Exception( message );
        },
        FailFast$1: function ( message, exception ) {
          throw new System.Exception( message, exception );
        },
        GetCommandLineArgs: function () {
          var l = System.Environment.Location;

          if ( l ) {
            var args = new ( System.Collections.Generic.List$1( System.String ) ).ctor();

            var path = l.pathname;

            if ( !System.String.isNullOrEmpty( path ) ) {
              args.add( path );
            }

            var search = l.search;

            if ( !System.String.isNullOrEmpty( search ) && search.length > 1 ) {
              var query = System.String.split( search.substr( 1 ), [38].map( function ( i ) { { return String.fromCharCode( i ); } } ) );

              for ( var i = 0; i < query.length; i = ( i + 1 ) | 0 ) {
                var param = System.String.split( query[System.Array.index( i, query )], [61].map( function ( i ) { { return String.fromCharCode( i ); } } ) );

                for ( var j = 0; j < param.length; j = ( j + 1 ) | 0 ) {
                  args.add( param[System.Array.index( j, param )] );
                }
              }
            }

            return args.ToArray();
          }

          return System.Array.init( 0, null, System.String );
        },
        GetEnvironmentVariable: function ( variable ) {
          if ( variable == null ) {
            throw new System.ArgumentNullException.$ctor1( "variable" );
          }

          var r = {};

          if ( System.Environment.Variables.tryGetValue( variable.toLowerCase(), r ) ) {
            return r.v;
          }

          return null;
        },
        GetEnvironmentVariable$1: function ( variable, target ) {
          return System.Environment.GetEnvironmentVariable( variable );
        },
        GetEnvironmentVariables: function () {
          return System.Environment.PatchDictionary( new ( System.Collections.Generic.Dictionary$2( System.String, System.String ) ).$ctor1( System.Environment.Variables ) );
        },
        GetEnvironmentVariables$1: function ( target ) {
          return System.Environment.GetEnvironmentVariables();
        },
        GetLogicalDrives: function () {
          return System.Array.init( 0, null, System.String );
        },
        SetEnvironmentVariable: function ( variable, value ) {
          if ( variable == null ) {
            throw new System.ArgumentNullException.$ctor1( "variable" );
          }

          if ( System.String.isNullOrEmpty( variable ) || System.String.startsWith( variable, String.fromCharCode( 0 ) ) || System.String.contains( variable, "=" ) || variable.length > 32767 ) {
            throw new System.ArgumentException.$ctor1( "Incorrect variable (cannot be empty, contain zero character nor equal sign, be longer than 32767)." );
          }

          variable = variable.toLowerCase();

          if ( System.String.isNullOrEmpty( value ) ) {
            if ( System.Environment.Variables.containsKey( variable ) ) {
              System.Environment.Variables.remove( variable );
            }
          } else {
            System.Environment.Variables.setItem( variable, value );
          }
        },
        SetEnvironmentVariable$1: function ( variable, value, target ) {
          System.Environment.SetEnvironmentVariable( variable, value );
        }
      }
    }
  } );

  // @source StringSplitOptions.js

  Bridge.define( "System.StringSplitOptions", {
    $kind: "enum",
    statics: {
      fields: {
        None: 0,
        RemoveEmptyEntries: 1
      }
    },
    $flags: true
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
  // @source Math.js

  Bridge.Math = {
    divRem: function ( a, b, result ) {
      var remainder = a % b;

      result.v = remainder;

      return ( a - remainder ) / b;
    },

    round: function ( n, d, rounding ) {
      var m = Math.pow( 10, d || 0 );

      n *= m;

      var sign = ( n > 0 ) | -( n < 0 );

      if ( n % 1 === 0.5 * sign ) {
        var f = Math.floor( n );

        return ( f + ( rounding === 4 ? ( sign > 0 ) : ( f % 2 * sign ) ) ) / m;
      }

      return Math.round( n ) / m;
    },

    log10: Math.log10 || function ( x ) {
      return Math.log( x ) / Math.LN10;
    },

    logWithBase: function ( x, newBase ) {
      if ( isNaN( x ) ) {
        return x;
      }

      if ( isNaN( newBase ) ) {
        return newBase;
      }

      if ( newBase === 1 ) {
        return NaN;
      }

      if ( x !== 1 && ( newBase === 0 || newBase === Number.POSITIVE_INFINITY ) ) {
        return NaN;
      }

      return Bridge.Math.log10( x ) / Bridge.Math.log10( newBase );
    },

    log: function ( x ) {
      if ( x === 0.0 ) {
        return Number.NEGATIVE_INFINITY;
      }

      if ( x < 0.0 || isNaN( x ) ) {
        return NaN;
      }

      if ( x === Number.POSITIVE_INFINITY ) {
        return Number.POSITIVE_INFINITY;
      }

      if ( x === Number.NEGATIVE_INFINITY ) {
        return NaN;
      }

      return Math.log( x );
    },

    sinh: Math.sinh || function ( x ) {
      return ( Math.exp( x ) - Math.exp( -x ) ) / 2;
    },

    cosh: Math.cosh || function ( x ) {
      return ( Math.exp( x ) + Math.exp( -x ) ) / 2;
    },

    tanh: Math.tanh || function ( x ) {
      if ( x === Infinity ) {
        return 1;
      } else if ( x === -Infinity ) {
        return -1;
      } else {
        var y = Math.exp( 2 * x );

        return ( y - 1 ) / ( y + 1 );
      }
    },

    IEEERemainder: function ( x, y ) {
      var regularMod = x % y;
      if ( isNaN( regularMod ) ) {
        return Number.NaN;
      }
      if ( regularMod === 0 ) {
        if ( x < 0 ) {
          return -0;
        }
      }
      var alternativeResult;
      alternativeResult = regularMod - ( Math.abs( y ) * Bridge.Int.sign( x ) );
      if ( Math.abs( alternativeResult ) === Math.abs( regularMod ) ) {
        var divisionResult = x / y;
        var roundedResult = Bridge.Math.round( divisionResult, 0, 6 );
        if ( Math.abs( roundedResult ) > Math.abs( divisionResult ) ) {
          return alternativeResult;
        } else {
          return regularMod;
        }
      }
      if ( Math.abs( alternativeResult ) < Math.abs( regularMod ) ) {
        return alternativeResult;
      } else {
        return regularMod;
      }
    }
  };

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
      },

      customFormat: function ( number, format, nf, noGroup ) {
        var digits = 0,
          forcedDigits = -1,
          integralDigits = -1,
          decimals = 0,
          forcedDecimals = -1,
          atDecimals = 0,
          unused = 1,
          c, i, f,
          endIndex,
          roundingFactor,
          decimalIndex,
          isNegative = false,
          isZero = false,
          name,
          groupCfg,
          buffer = "",
          isZeroInt = false,
          wasSeparator = false,
          wasIntPart = false,
          isDecimal = number instanceof System.Decimal,
          isLong = number instanceof System.Int64 || number instanceof System.UInt64,
          isNeg = isDecimal || isLong ? ( number.isZero() ? false : number.isNegative() ) : number < 0;

        name = "number";

        if ( format.indexOf( "%" ) !== -1 ) {
          name = "percent";
        } else if ( format.indexOf( "$" ) !== -1 ) {
          name = "currency";
        }

        for ( i = 0; i < format.length; i++ ) {
          c = format.charAt( i );

          if ( c === "'" || c === '"' ) {
            i = format.indexOf( c, i + 1 );

            if ( i < 0 ) {
              break;
            }
          } else if ( c === "\\" ) {
            i++;
          } else {
            if ( c === "0" || c === "#" ) {
              decimals += atDecimals;

              if ( c === "0" ) {
                if ( atDecimals ) {
                  forcedDecimals = decimals;
                } else if ( forcedDigits < 0 ) {
                  forcedDigits = digits;
                }
              }

              digits += !atDecimals;
            }

            atDecimals = atDecimals || c === ".";
          }
        }
        forcedDigits = forcedDigits < 0 ? 1 : digits - forcedDigits;

        if ( isNeg ) {
          isNegative = true;
        }

        roundingFactor = Math.pow( 10, decimals );

        if ( isDecimal ) {
          number = System.Decimal.round( number.abs().mul( roundingFactor ), 4 ).div( roundingFactor ).toString();
        } else if ( isLong ) {
          number = ( number.eq( System.Int64.MinValue ) ? System.Int64( number.value.toUnsigned() ) : number.abs() ).mul( roundingFactor ).div( roundingFactor ).toString();
        } else {
          number = "" + ( Math.round( Math.abs( number ) * roundingFactor ) / roundingFactor );
        }

        isZero = number.split( "" ).every( function ( s ) { return s === "0" || s === "."; } );

        decimalIndex = number.indexOf( "." );
        integralDigits = decimalIndex < 0 ? number.length : decimalIndex;
        i = integralDigits - digits;

        groupCfg = {
          groupIndex: Math.max( integralDigits, forcedDigits ),
          sep: noGroup ? "" : nf[name + "GroupSeparator"]
        };

        if ( integralDigits === 1 && number.charAt( 0 ) === "0" ) {
          isZeroInt = true;
        }

        for ( f = 0; f < format.length; f++ ) {
          c = format.charAt( f );

          if ( c === "'" || c === '"' ) {
            endIndex = format.indexOf( c, f + 1 );

            buffer += format.substring( f + 1, endIndex < 0 ? format.length : endIndex );

            if ( endIndex < 0 ) {
              break;
            }

            f = endIndex;
          } else if ( c === "\\" ) {
            buffer += format.charAt( f + 1 );
            f++;
          } else if ( c === "#" || c === "0" ) {
            wasIntPart = true;

            if ( !wasSeparator && isZeroInt && c === "#" ) {
              i++;
            } else {
              groupCfg.buffer = buffer;

              if ( i < integralDigits ) {
                if ( i >= 0 ) {
                  if ( unused ) {
                    this.addGroup( number.substr( 0, i ), groupCfg );
                  }

                  this.addGroup( number.charAt( i ), groupCfg );
                } else if ( i >= integralDigits - forcedDigits ) {
                  this.addGroup( "0", groupCfg );
                }

                unused = 0;
              } else if ( forcedDecimals-- > 0 || i < number.length ) {
                this.addGroup( i >= number.length ? "0" : number.charAt( i ), groupCfg );
              }

              buffer = groupCfg.buffer;

              i++;
            }
          } else if ( c === "." ) {
            if ( !wasIntPart && !isZeroInt ) {
              buffer += number.substr( 0, integralDigits );
              wasIntPart = true;
            }

            if ( number.length > ++i || forcedDecimals > 0 ) {
              wasSeparator = true;
              buffer += nf[name + "DecimalSeparator"];
            }
          } else if ( c !== "," ) {
            buffer += c;
          }
        }

        if ( isNegative && !isZero ) {
          buffer = "-" + buffer;
        }

        return buffer;
      },

      addGroup: function ( value, cfg ) {
        var buffer = cfg.buffer,
          sep = cfg.sep,
          groupIndex = cfg.groupIndex;

        for ( var i = 0, length = value.length; i < length; i++ ) {
          buffer += value.charAt( i );

          if ( sep && groupIndex > 1 && groupIndex-- % 3 === 1 ) {
            buffer += sep;
          }
        }

        cfg.buffer = buffer;
        cfg.groupIndex = groupIndex;
      },

      parseFloat: function ( s, provider ) {
        var res = {};

        Bridge.Int.tryParseFloat( s, provider, res, false );

        return res.v;
      },

      tryParseFloat: function ( s, provider, result, safe ) {
        result.v = 0;

        if ( safe == null ) {
          safe = true;
        }

        if ( s == null ) {
          if ( safe ) {
            return false;
          }

          throw new System.ArgumentNullException.$ctor1( "s" );
        }

        s = s.trim();

        var nfInfo = ( provider || System.Globalization.CultureInfo.getCurrentCulture() ).getFormat( System.Globalization.NumberFormatInfo ),
          point = nfInfo.numberDecimalSeparator,
          thousands = nfInfo.numberGroupSeparator;

        var errMsg = "Input string was not in a correct format.";

        var pointIndex = s.indexOf( point );
        var thousandIndex = thousands ? s.indexOf( thousands ) : -1;

        if ( pointIndex > -1 ) {
          // point before thousands is not allowed
          // "10.2,5" -> FormatException
          // "1,0.2,5" -> FormatException
          if ( ( ( pointIndex < thousandIndex ) || ( ( thousandIndex > -1 ) && ( pointIndex < s.indexOf( thousands, pointIndex ) ) ) )
            // only one point is allowed
            || ( s.indexOf( point, pointIndex + 1 ) > -1 ) ) {
            if ( safe ) {
              return false;
            }

            throw new System.FormatException.$ctor1( errMsg );
          }
        }

        if ( ( point !== "." ) && ( thousands !== "." ) && ( s.indexOf( "." ) > -1 ) ) {
          if ( safe ) {
            return false;
          }

          throw new System.FormatException.$ctor1( errMsg );
        }

        if ( thousandIndex > -1 ) {
          // mutiple thousands are allowed, so we remove them before going further
          var tmpStr = "";

          for ( var i = 0; i < s.length; i++ ) {
            if ( s[i] !== thousands ) {
              tmpStr += s[i];
            }
          }

          s = tmpStr;
        }

        if ( s === nfInfo.negativeInfinitySymbol ) {
          result.v = Number.NEGATIVE_INFINITY;

          return true;
        } else if ( s === nfInfo.positiveInfinitySymbol ) {
          result.v = Number.POSITIVE_INFINITY;

          return true;
        } else if ( s === nfInfo.nanSymbol ) {
          result.v = Number.NaN;

          return true;
        }

        var countExp = 0,
          ePrev = false;

        for ( var i = 0; i < s.length; i++ ) {
          if ( !System.Char.isNumber( s[i].charCodeAt( 0 ) ) &&
            s[i] !== "." &&
            s[i] !== "," &&
            ( s[i] !== nfInfo.positiveSign || i !== 0 && !ePrev ) &&
            ( s[i] !== nfInfo.negativeSign || i !== 0 && !ePrev ) &&
            s[i] !== point &&
            s[i] !== thousands ) {
            if ( s[i].toLowerCase() === "e" ) {
              ePrev = true;
              countExp++;

              if ( countExp > 1 ) {
                if ( safe ) {
                  return false;
                }

                throw new System.FormatException.$ctor1( errMsg );
              }
            } else {
              ePrev = false;
              if ( safe ) {
                return false;
              }

              throw new System.FormatException.$ctor1( errMsg );
            }
          } else {
            ePrev = false;
          }
        }

        var r = parseFloat( s.replace( point, "." ) );

        if ( isNaN( r ) ) {
          if ( safe ) {
            return false;
          }

          throw new System.FormatException.$ctor1( errMsg );
        }

        result.v = r;

        return true;
      },

      parseInt: function ( str, min, max, radix ) {
        radix = radix || 10;

        if ( str == null ) {
          throw new System.ArgumentNullException.$ctor1( "str" );
        }

        str = str.trim();

        if ( ( radix <= 10 && !/^[+-]?[0-9]+$/.test( str ) )
          || ( radix == 16 && !/^[+-]?[0-9A-F]+$/gi.test( str ) ) ) {
          throw new System.FormatException.$ctor1( "Input string was not in a correct format." );
        }

        var result = parseInt( str, radix );

        if ( isNaN( result ) ) {
          throw new System.FormatException.$ctor1( "Input string was not in a correct format." );
        }

        if ( result < min || result > max ) {
          throw new System.OverflowException();
        }

        return result;
      },

      tryParseInt: function ( str, result, min, max, radix ) {
        result.v = 0;
        radix = radix || 10;

        if ( str != null && str.trim === "".trim ) {
          str = str.trim();
        }

        if ( ( radix <= 10 && !/^[+-]?[0-9]+$/.test( str ) )
          || ( radix == 16 && !/^[+-]?[0-9A-F]+$/gi.test( str ) ) ) {
          return false;
        }

        result.v = parseInt( str, radix );

        if ( result.v < min || result.v > max ) {
          result.v = 0;

          return false;
        }

        return true;
      },

      isInfinite: function ( x ) {
        return x === Number.POSITIVE_INFINITY || x === Number.NEGATIVE_INFINITY;
      },

      trunc: function ( num ) {
        if ( !Bridge.isNumber( num ) ) {
          return Bridge.Int.isInfinite( num ) ? num : null;
        }

        return num > 0 ? Math.floor( num ) : Math.ceil( num );
      },

      div: function ( x, y ) {
        if ( x == null || y == null ) {
          return null;
        }

        if ( y === 0 ) {
          throw new System.DivideByZeroException();
        }

        return this.trunc( x / y );
      },

      mod: function ( x, y ) {
        if ( x == null || y == null ) {
          return null;
        }

        if ( y === 0 ) {
          throw new System.DivideByZeroException();
        }

        return x % y;
      },

      check: function ( x, type ) {
        if ( System.Int64.is64Bit( x ) ) {
          return System.Int64.check( x, type );
        } else if ( x instanceof System.Decimal ) {
          return System.Decimal.toInt( x, type );
        }

        if ( Bridge.isNumber( x ) ) {
          if ( System.Int64.is64BitType( type ) ) {
            if ( type === System.UInt64 && x < 0 ) {
              throw new System.OverflowException();
            }

            return type === System.Int64 ? System.Int64( x ) : System.UInt64( x );
          } else if ( !type.$is( x ) ) {
            throw new System.OverflowException();
          }
        }

        if ( Bridge.Int.isInfinite( x ) || isNaN( x ) ) {
          if ( System.Int64.is64BitType( type ) ) {
            return type.MinValue;
          }

          return type.min;
        }

        return x;
      },

      sxb: function ( x ) {
        return Bridge.isNumber( x ) ? ( x | ( x & 0x80 ? 0xffffff00 : 0 ) ) : ( ( Bridge.Int.isInfinite( x ) || isNaN( x ) ) ? System.SByte.min : null );
      },

      sxs: function ( x ) {
        return Bridge.isNumber( x ) ? ( x | ( x & 0x8000 ? 0xffff0000 : 0 ) ) : ( ( Bridge.Int.isInfinite( x ) || isNaN( x ) ) ? System.Int16.min : null );
      },

      clip8: function ( x ) {
        return Bridge.isNumber( x ) ? Bridge.Int.sxb( x & 0xff ) : ( ( Bridge.Int.isInfinite( x ) || isNaN( x ) ) ? System.SByte.min : null );
      },

      clipu8: function ( x ) {
        return Bridge.isNumber( x ) ? x & 0xff : ( ( Bridge.Int.isInfinite( x ) || isNaN( x ) ) ? System.Byte.min : null );
      },

      clip16: function ( x ) {
        return Bridge.isNumber( x ) ? Bridge.Int.sxs( x & 0xffff ) : ( ( Bridge.Int.isInfinite( x ) || isNaN( x ) ) ? System.Int16.min : null );
      },

      clipu16: function ( x ) {
        return Bridge.isNumber( x ) ? x & 0xffff : ( ( Bridge.Int.isInfinite( x ) || isNaN( x ) ) ? System.UInt16.min : null );
      },

      clip32: function ( x ) {
        return Bridge.isNumber( x ) ? x | 0 : ( ( Bridge.Int.isInfinite( x ) || isNaN( x ) ) ? System.Int32.min : null );
      },

      clipu32: function ( x ) {
        return Bridge.isNumber( x ) ? x >>> 0 : ( ( Bridge.Int.isInfinite( x ) || isNaN( x ) ) ? System.UInt32.min : null );
      },

      clip64: function ( x ) {
        return Bridge.isNumber( x ) ? System.Int64( Bridge.Int.trunc( x ) ) : ( ( Bridge.Int.isInfinite( x ) || isNaN( x ) ) ? System.Int64.MinValue : null );
      },

      clipu64: function ( x ) {
        return Bridge.isNumber( x ) ? System.UInt64( Bridge.Int.trunc( x ) ) : ( ( Bridge.Int.isInfinite( x ) || isNaN( x ) ) ? System.UInt64.MinValue : null );
      },

      sign: function ( x ) {
        if ( x === Number.POSITIVE_INFINITY ) {
          return 1;
        }

        if ( x === Number.NEGATIVE_INFINITY ) {
          return -1;
        }

        return Bridge.isNumber( x ) ? ( x === 0 ? 0 : ( x < 0 ? -1 : 1 ) ) : null;
      },

      $mul: Math.imul || function ( a, b ) {
        var ah = ( a >>> 16 ) & 0xffff,
          al = a & 0xffff,
          bh = ( b >>> 16 ) & 0xffff,
          bl = b & 0xffff;

        return ( ( al * bl ) + ( ( ( ah * bl + al * bh ) << 16 ) >>> 0 ) | 0 );
      },

      mul: function ( a, b, overflow ) {
        if ( a == null || b == null ) {
          return null;
        }

        if ( overflow ) {
          Bridge.Int.check( a * b, System.Int32 );
        }

        return Bridge.Int.$mul( a, b );
      },

      umul: function ( a, b, overflow ) {
        if ( a == null || b == null ) {
          return null;
        }

        if ( overflow ) {
          Bridge.Int.check( a * b, System.UInt32 );
        }

        return Bridge.Int.$mul( a, b ) >>> 0;
      }
    }
  } );

  Bridge.Int.$kind = "";
  Bridge.Class.addExtend( Bridge.Int, [System.IComparable$1( Bridge.Int ), System.IEquatable$1( Bridge.Int )] );

  ( function () {
    var createIntType = function ( name, min, max, precision, toUnsign ) {
      var type = Bridge.define( name, {
        inherits: [System.IComparable, System.IFormattable],

        statics: {
          $number: true,
          toUnsign: toUnsign,
          min: min,
          max: max,
          precision: precision,

          $is: function ( instance ) {
            return typeof ( instance ) === "number" && Math.floor( instance, 0 ) === instance && instance >= min && instance <= max;
          },
          getDefaultValue: function () {
            return 0;
          },
          parse: function ( s, radix ) {
            return Bridge.Int.parseInt( s, min, max, radix );
          },
          tryParse: function ( s, result, radix ) {
            return Bridge.Int.tryParseInt( s, result, min, max, radix );
          },
          format: function ( number, format, provider ) {
            return Bridge.Int.format( number, format, provider, type, toUnsign );
          },
          equals: function ( v1, v2 ) {
            if ( Bridge.is( v1, type ) && Bridge.is( v2, type ) ) {
              return Bridge.unbox( v1, true ) === Bridge.unbox( v2, true );
            }

            return false;
          },
          equalsT: function ( v1, v2 ) {
            return Bridge.unbox( v1, true ) === Bridge.unbox( v2, true );
          }
        }
      } );

      type.$kind = "";
      Bridge.Class.addExtend( type, [System.IComparable$1( type ), System.IEquatable$1( type )] );
    };

    createIntType( "System.Byte", 0, 255, 3 );
    createIntType( "System.SByte", -128, 127, 3, Bridge.Int.clipu8 );
    createIntType( "System.Int16", -32768, 32767, 5, Bridge.Int.clipu16 );
    createIntType( "System.UInt16", 0, 65535, 5 );
    createIntType( "System.Int32", -2147483648, 2147483647, 10, Bridge.Int.clipu32 );
    createIntType( "System.UInt32", 0, 4294967295, 10 );
  } )();

  // @source Double.js

  Bridge.define( "System.Double", {
    inherits: [System.IComparable, System.IFormattable],
    statics: {
      min: -Number.MAX_VALUE,

      max: Number.MAX_VALUE,

      precision: 15,

      $number: true,

      $is: function ( instance ) {
        return typeof ( instance ) === "number";
      },

      getDefaultValue: function () {
        return 0;
      },

      parse: function ( s, provider ) {
        return Bridge.Int.parseFloat( s, provider );
      },

      tryParse: function ( s, provider, result ) {
        return Bridge.Int.tryParseFloat( s, provider, result );
      },

      format: function ( number, format, provider ) {
        return Bridge.Int.format( number, format || 'G', provider, System.Double );
      },

      equals: function ( v1, v2 ) {
        if ( Bridge.is( v1, System.Double ) && Bridge.is( v2, System.Double ) ) {
          v1 = Bridge.unbox( v1, true );
          v2 = Bridge.unbox( v2, true );

          if ( isNaN( v1 ) && isNaN( v2 ) ) {
            return true;
          }

          return v1 === v2;
        }

        return false;
      },

      equalsT: function ( v1, v2 ) {
        return Bridge.unbox( v1, true ) === Bridge.unbox( v2, true );
      },

      getHashCode: function ( v ) {
        var value = Bridge.unbox( v, true );

        if ( value === 0 ) {
          return 0;
        }

        if ( value === Number.POSITIVE_INFINITY ) {
          return 0x7FF00000;
        }

        if ( value === Number.NEGATIVE_INFINITY ) {
          return 0xFFF00000;
        }

        return Bridge.getHashCode( value.toExponential() );
      }
    }
  } );

  System.Double.$kind = "";
  Bridge.Class.addExtend( System.Double, [System.IComparable$1( System.Double ), System.IEquatable$1( System.Double )] );

  Bridge.define( "System.Single", {
    inherits: [System.IComparable, System.IFormattable],
    statics: {
      min: -3.40282346638528859e+38,

      max: 3.40282346638528859e+38,

      precision: 7,

      $number: true,

      $is: System.Double.$is,

      getDefaultValue: System.Double.getDefaultValue,

      parse: System.Double.parse,

      tryParse: System.Double.tryParse,

      format: function ( number, format, provider ) {
        return Bridge.Int.format( number, format || 'G', provider, System.Single );
      },

      equals: function ( v1, v2 ) {
        if ( Bridge.is( v1, System.Single ) && Bridge.is( v2, System.Single ) ) {
          v1 = Bridge.unbox( v1, true );
          v2 = Bridge.unbox( v2, true );

          if ( isNaN( v1 ) && isNaN( v2 ) ) {
            return true;
          }

          return v1 === v2;
        }

        return false;
      },

      equalsT: function ( v1, v2 ) {
        return Bridge.unbox( v1, true ) === Bridge.unbox( v2, true );
      },

      getHashCode: System.Double.getHashCode
    }
  } );

  System.Single.$kind = "";
  Bridge.Class.addExtend( System.Single, [System.IComparable$1( System.Single ), System.IEquatable$1( System.Single )] );

  // @source Long.js

  /* long.js https://github.com/dcodeIO/long.js/blob/master/LICENSE */
  ( function ( b ) {
    function d( a, b, c ) { this.low = a | 0; this.high = b | 0; this.unsigned = !!c; } function g( a ) { return !0 === ( a && a.__isLong__ ); } function m( a, b ) { var c, u; if ( b ) { a >>>= 0; if ( u = 0 <= a && 256 > a ) if ( c = A[a] ) return c; c = e( a, 0 > ( a | 0 ) ? -1 : 0, !0 ); u && ( A[a] = c ); } else { a |= 0; if ( u = -128 <= a && 128 > a ) if ( c = B[a] ) return c; c = e( a, 0 > a ? -1 : 0, !1 ); u && ( B[a] = c ); } return c; } function n( a, b ) {
      if ( isNaN( a ) || !isFinite( a ) ) return b ? p : k; if ( b ) { if ( 0 > a ) return p; if ( a >= C ) return D; } else { if ( a <= -E ) return l; if ( a + 1 >= E ) return F; } return 0 > a ? n( -a, b ).neg() : e( a % 4294967296 | 0, a / 4294967296 |
        0, b );
    } function e( a, b, c ) { return new d( a, b, c ); } function y( a, b, c ) {
      if ( 0 === a.length ) throw Error( "empty string" ); if ( "NaN" === a || "Infinity" === a || "+Infinity" === a || "-Infinity" === a ) return k; "number" === typeof b ? ( c = b, b = !1 ) : b = !!b; c = c || 10; if ( 2 > c || 36 < c ) throw RangeError( "radix" ); var u; if ( 0 < ( u = a.indexOf( "-" ) ) ) throw Error( "interior hyphen" ); if ( 0 === u ) return y( a.substring( 1 ), b, c ).neg(); u = n( w( c, 8 ) ); for ( var e = k, f = 0; f < a.length; f += 8 ) {
        var d = Math.min( 8, a.length - f ), g = parseInt( a.substring( f, f + d ), c ); 8 > d ? ( d = n( w( c, d ) ), e = e.mul( d ).add( n( g ) ) ) :
          ( e = e.mul( u ), e = e.add( n( g ) ) );
      } e.unsigned = b; return e;
    } function q( a ) { return a instanceof d ? a : "number" === typeof a ? n( a ) : "string" === typeof a ? y( a ) : e( a.low, a.high, a.unsigned ); } b.Bridge.$Long = d; d.__isLong__; Object.defineProperty( d.prototype, "__isLong__", { value: !0, enumerable: !1, configurable: !1 } ); d.isLong = g; var B = {}, A = {}; d.fromInt = m; d.fromNumber = n; d.fromBits = e; var w = Math.pow; d.fromString = y; d.fromValue = q; var C = 4294967296 * 4294967296, E = C / 2, G = m( 16777216 ), k = m( 0 ); d.ZERO = k; var p = m( 0, !0 ); d.UZERO = p; var r = m( 1 ); d.ONE = r; var H =
      m( 1, !0 ); d.UONE = H; var z = m( -1 ); d.NEG_ONE = z; var F = e( -1, 2147483647, !1 ); d.MAX_VALUE = F; var D = e( -1, -1, !0 ); d.MAX_UNSIGNED_VALUE = D; var l = e( 0, -2147483648, !1 ); d.MIN_VALUE = l; b = d.prototype; b.toInt = function () { return this.unsigned ? this.low >>> 0 : this.low; }; b.toNumber = function () { return this.unsigned ? 4294967296 * ( this.high >>> 0 ) + ( this.low >>> 0 ) : 4294967296 * this.high + ( this.low >>> 0 ); }; b.toString = function ( a ) {
        a = a || 10; if ( 2 > a || 36 < a ) throw RangeError( "radix" ); if ( this.isZero() ) return "0"; if ( this.isNegative() ) {
          if ( this.eq( l ) ) {
            var b =
              n( a ), c = this.div( b ), b = c.mul( b ).sub( this ); return c.toString( a ) + b.toInt().toString( a );
          } return ( "undefined" === typeof a || 10 === a ? "-" : "" ) + this.neg().toString( a );
        } for ( var c = n( w( a, 6 ), this.unsigned ), b = this, e = ""; ; ) { var d = b.div( c ), f = ( b.sub( d.mul( c ) ).toInt() >>> 0 ).toString( a ), b = d; if ( b.isZero() ) return f + e; for ( ; 6 > f.length; ) f = "0" + f; e = "" + f + e; }
      }; b.getHighBits = function () { return this.high; }; b.getHighBitsUnsigned = function () { return this.high >>> 0; }; b.getLowBits = function () { return this.low; }; b.getLowBitsUnsigned = function () {
        return this.low >>>
          0;
      }; b.getNumBitsAbs = function () { if ( this.isNegative() ) return this.eq( l ) ? 64 : this.neg().getNumBitsAbs(); for ( var a = 0 != this.high ? this.high : this.low, b = 31; 0 < b && 0 == ( a & 1 << b ); b-- ); return 0 != this.high ? b + 33 : b + 1; }; b.isZero = function () { return 0 === this.high && 0 === this.low; }; b.isNegative = function () { return !this.unsigned && 0 > this.high; }; b.isPositive = function () { return this.unsigned || 0 <= this.high; }; b.isOdd = function () { return 1 === ( this.low & 1 ); }; b.isEven = function () { return 0 === ( this.low & 1 ); }; b.equals = function ( a ) {
        g( a ) || ( a = q( a ) ); return this.unsigned !==
          a.unsigned && 1 === this.high >>> 31 && 1 === a.high >>> 31 ? !1 : this.high === a.high && this.low === a.low;
      }; b.eq = b.equals; b.notEquals = function ( a ) { return !this.eq( a ); }; b.neq = b.notEquals; b.lessThan = function ( a ) { return 0 > this.comp( a ); }; b.lt = b.lessThan; b.lessThanOrEqual = function ( a ) { return 0 >= this.comp( a ); }; b.lte = b.lessThanOrEqual; b.greaterThan = function ( a ) { return 0 < this.comp( a ); }; b.gt = b.greaterThan; b.greaterThanOrEqual = function ( a ) { return 0 <= this.comp( a ); }; b.gte = b.greaterThanOrEqual; b.compare = function ( a ) {
        g( a ) || ( a = q( a ) ); if ( this.eq( a ) ) return 0;
        var b = this.isNegative(), c = a.isNegative(); return b && !c ? -1 : !b && c ? 1 : this.unsigned ? a.high >>> 0 > this.high >>> 0 || a.high === this.high && a.low >>> 0 > this.low >>> 0 ? -1 : 1 : this.sub( a ).isNegative() ? -1 : 1;
      }; b.comp = b.compare; b.negate = function () { return !this.unsigned && this.eq( l ) ? l : this.not().add( r ); }; b.neg = b.negate; b.add = function ( a ) {
        g( a ) || ( a = q( a ) ); var b = this.high >>> 16, c = this.high & 65535, d = this.low >>> 16, l = a.high >>> 16, f = a.high & 65535, n = a.low >>> 16, k; k = 0 + ( ( this.low & 65535 ) + ( a.low & 65535 ) ); a = 0 + ( k >>> 16 ); a += d + n; d = 0 + ( a >>> 16 ); d += c + f; c =
          0 + ( d >>> 16 ); c = c + ( b + l ) & 65535; return e( ( a & 65535 ) << 16 | k & 65535, c << 16 | d & 65535, this.unsigned );
      }; b.subtract = function ( a ) { g( a ) || ( a = q( a ) ); return this.add( a.neg() ); }; b.sub = b.subtract; b.multiply = function ( a ) {
        if ( this.isZero() ) return k; g( a ) || ( a = q( a ) ); if ( a.isZero() ) return k; if ( this.eq( l ) ) return a.isOdd() ? l : k; if ( a.eq( l ) ) return this.isOdd() ? l : k; if ( this.isNegative() ) return a.isNegative() ? this.neg().mul( a.neg() ) : this.neg().mul( a ).neg(); if ( a.isNegative() ) return this.mul( a.neg() ).neg(); if ( this.lt( G ) && a.lt( G ) ) return n( this.toNumber() *
          a.toNumber(), this.unsigned ); var b = this.high >>> 16, c = this.high & 65535, d = this.low >>> 16, x = this.low & 65535, f = a.high >>> 16, m = a.high & 65535, p = a.low >>> 16; a = a.low & 65535; var v, h, t, r; r = 0 + x * a; t = 0 + ( r >>> 16 ); t += d * a; h = 0 + ( t >>> 16 ); t = ( t & 65535 ) + x * p; h += t >>> 16; t &= 65535; h += c * a; v = 0 + ( h >>> 16 ); h = ( h & 65535 ) + d * p; v += h >>> 16; h &= 65535; h += x * m; v += h >>> 16; h &= 65535; v = v + ( b * a + c * p + d * m + x * f ) & 65535; return e( t << 16 | r & 65535, v << 16 | h, this.unsigned );
      }; b.mul = b.multiply; b.divide = function ( a ) {
        g( a ) || ( a = q( a ) ); if ( a.isZero() ) throw Error( "division by zero" ); if ( this.isZero() ) return this.unsigned ?
          p : k; var b, c, d; if ( this.unsigned ) a.unsigned || ( a = a.toUnsigned() ); else { if ( this.eq( l ) ) { if ( a.eq( r ) || a.eq( z ) ) return l; if ( a.eq( l ) ) return r; b = this.shr( 1 ).div( a ).shl( 1 ); if ( b.eq( k ) ) return a.isNegative() ? r : z; c = this.sub( a.mul( b ) ); return d = b.add( c.div( a ) ); } if ( a.eq( l ) ) return this.unsigned ? p : k; if ( this.isNegative() ) return a.isNegative() ? this.neg().div( a.neg() ) : this.neg().div( a ).neg(); if ( a.isNegative() ) return this.div( a.neg() ).neg(); } if ( this.unsigned ) { if ( a.gt( this ) ) return p; if ( a.gt( this.shru( 1 ) ) ) return H; d = p; } else d =
            k; for ( c = this; c.gte( a ); ) { b = Math.max( 1, Math.floor( c.toNumber() / a.toNumber() ) ); for ( var e = Math.ceil( Math.log( b ) / Math.LN2 ), e = 48 >= e ? 1 : w( 2, e - 48 ), f = n( b ), m = f.mul( a ); m.isNegative() || m.gt( c ); ) b -= e, f = n( b, this.unsigned ), m = f.mul( a ); f.isZero() && ( f = r ); d = d.add( f ); c = c.sub( m ); } return d;
      }; b.div = b.divide; b.modulo = function ( a ) { g( a ) || ( a = q( a ) ); return this.sub( this.div( a ).mul( a ) ); }; b.mod = b.modulo; b.not = function () { return e( ~this.low, ~this.high, this.unsigned ); }; b.and = function ( a ) {
        g( a ) || ( a = q( a ) ); return e( this.low & a.low, this.high &
          a.high, this.unsigned );
      }; b.or = function ( a ) { g( a ) || ( a = q( a ) ); return e( this.low | a.low, this.high | a.high, this.unsigned ); }; b.xor = function ( a ) { g( a ) || ( a = q( a ) ); return e( this.low ^ a.low, this.high ^ a.high, this.unsigned ); }; b.shiftLeft = function ( a ) { g( a ) && ( a = a.toInt() ); return 0 === ( a &= 63 ) ? this : 32 > a ? e( this.low << a, this.high << a | this.low >>> 32 - a, this.unsigned ) : e( 0, this.low << a - 32, this.unsigned ); }; b.shl = b.shiftLeft; b.shiftRight = function ( a ) {
        g( a ) && ( a = a.toInt() ); return 0 === ( a &= 63 ) ? this : 32 > a ? e( this.low >>> a | this.high << 32 - a, this.high >>
          a, this.unsigned ) : e( this.high >> a - 32, 0 <= this.high ? 0 : -1, this.unsigned );
      }; b.shr = b.shiftRight; b.shiftRightUnsigned = function ( a ) { g( a ) && ( a = a.toInt() ); a &= 63; if ( 0 === a ) return this; var b = this.high; return 32 > a ? e( this.low >>> a | b << 32 - a, b >>> a, this.unsigned ) : 32 === a ? e( b, 0, this.unsigned ) : e( b >>> a - 32, 0, this.unsigned ); }; b.shru = b.shiftRightUnsigned; b.toSigned = function () { return this.unsigned ? e( this.low, this.high, !1 ) : this; }; b.toUnsigned = function () { return this.unsigned ? this : e( this.low, this.high, !0 ); };
  } )( Bridge.global );

  System.Int64 = function ( l ) {
    if ( this.constructor !== System.Int64 ) {
      return new System.Int64( l );
    }

    if ( !Bridge.hasValue( l ) ) {
      l = 0;
    }

    this.T = System.Int64;
    this.unsigned = false;
    this.value = System.Int64.getValue( l );
  };

  System.Int64.$number = true;
  System.Int64.TWO_PWR_16_DBL = 1 << 16;
  System.Int64.TWO_PWR_32_DBL = System.Int64.TWO_PWR_16_DBL * System.Int64.TWO_PWR_16_DBL;
  System.Int64.TWO_PWR_64_DBL = System.Int64.TWO_PWR_32_DBL * System.Int64.TWO_PWR_32_DBL;
  System.Int64.TWO_PWR_63_DBL = System.Int64.TWO_PWR_64_DBL / 2;

  System.Int64.$$name = "System.Int64";
  System.Int64.prototype.$$name = "System.Int64";
  System.Int64.$kind = "struct";
  System.Int64.prototype.$kind = "struct";

  System.Int64.$$inherits = [];
  Bridge.Class.addExtend( System.Int64, [System.IComparable, System.IFormattable, System.IComparable$1( System.Int64 ), System.IEquatable$1( System.Int64 )] );

  System.Int64.$is = function ( instance ) {
    return instance instanceof System.Int64;
  };

  System.Int64.is64Bit = function ( instance ) {
    return instance instanceof System.Int64 || instance instanceof System.UInt64;
  };

  System.Int64.is64BitType = function ( type ) {
    return type === System.Int64 || type === System.UInt64;
  };

  System.Int64.getDefaultValue = function () {
    return System.Int64.Zero;
  };

  System.Int64.getValue = function ( l ) {
    if ( !Bridge.hasValue( l ) ) {
      return null;
    }

    if ( l instanceof Bridge.$Long ) {
      return l;
    }

    if ( l instanceof System.Int64 ) {
      return l.value;
    }

    if ( l instanceof System.UInt64 ) {
      return l.value.toSigned();
    }

    if ( Bridge.isArray( l ) ) {
      return new Bridge.$Long( l[0], l[1] );
    }

    if ( Bridge.isString( l ) ) {
      return Bridge.$Long.fromString( l );
    }

    if ( Bridge.isNumber( l ) ) {
      if ( l + 1 >= System.Int64.TWO_PWR_63_DBL ) {
        return ( new System.UInt64( l ) ).value.toSigned();
      }
      return Bridge.$Long.fromNumber( l );
    }

    if ( l instanceof System.Decimal ) {
      return Bridge.$Long.fromString( l.toString() );
    }

    return Bridge.$Long.fromValue( l );
  };

  System.Int64.create = function ( l ) {
    if ( !Bridge.hasValue( l ) ) {
      return null;
    }

    if ( l instanceof System.Int64 ) {
      return l;
    }

    return new System.Int64( l );
  };

  System.Int64.lift = function ( l ) {
    if ( !Bridge.hasValue( l ) ) {
      return null;
    }
    return System.Int64.create( l );
  };

  System.Int64.toNumber = function ( value ) {
    if ( !value ) {
      return null;
    }

    return value.toNumber();
  };

  System.Int64.prototype.toNumberDivided = function ( divisor ) {
    var integral = this.div( divisor ),
      remainder = this.mod( divisor ),
      scaledRemainder = remainder.toNumber() / divisor;

    return integral.toNumber() + scaledRemainder;
  };

  System.Int64.prototype.toJSON = function () {
    return this.gt( Bridge.Int.MAX_SAFE_INTEGER ) || this.lt( Bridge.Int.MIN_SAFE_INTEGER ) ? this.toString() : this.toNumber();
  };

  System.Int64.prototype.toString = function ( format, provider ) {
    if ( !format && !provider ) {
      return this.value.toString();
    }

    if ( Bridge.isNumber( format ) && !provider ) {
      return this.value.toString( format );
    }

    return Bridge.Int.format( this, format, provider, System.Int64, System.Int64.clipu64 );
  };

  System.Int64.prototype.format = function ( format, provider ) {
    return Bridge.Int.format( this, format, provider, System.Int64, System.Int64.clipu64 );
  };

  System.Int64.prototype.isNegative = function () {
    return this.value.isNegative();
  };

  System.Int64.prototype.abs = function () {
    if ( this.T === System.Int64 && this.eq( System.Int64.MinValue ) ) {
      throw new System.OverflowException();
    }
    return new this.T( this.value.isNegative() ? this.value.neg() : this.value );
  };

  System.Int64.prototype.compareTo = function ( l ) {
    return this.value.compare( this.T.getValue( l ) );
  };

  System.Int64.prototype.add = function ( l, overflow ) {
    var addl = this.T.getValue( l ),
      r = new this.T( this.value.add( addl ) );

    if ( overflow ) {
      var neg1 = this.value.isNegative(),
        neg2 = addl.isNegative(),
        rneg = r.value.isNegative();

      if ( ( neg1 && neg2 && !rneg ) ||
        ( !neg1 && !neg2 && rneg ) ||
        ( this.T === System.UInt64 && r.lt( System.UInt64.max( this, addl ) ) ) ) {
        throw new System.OverflowException();
      }
    }

    return r;
  };

  System.Int64.prototype.sub = function ( l, overflow ) {
    var subl = this.T.getValue( l ),
      r = new this.T( this.value.sub( subl ) );

    if ( overflow ) {
      var neg1 = this.value.isNegative(),
        neg2 = subl.isNegative(),
        rneg = r.value.isNegative();

      if ( ( neg1 && !neg2 && !rneg ) ||
        ( !neg1 && neg2 && rneg ) ||
        ( this.T === System.UInt64 && this.value.lt( subl ) ) ) {
        throw new System.OverflowException();
      }
    }

    return r;
  };

  System.Int64.prototype.isZero = function () {
    return this.value.isZero();
  };

  System.Int64.prototype.mul = function ( l, overflow ) {
    var arg = this.T.getValue( l ),
      r = new this.T( this.value.mul( arg ) );

    if ( overflow ) {
      var s1 = this.sign(),
        s2 = arg.isZero() ? 0 : ( arg.isNegative() ? -1 : 1 ),
        rs = r.sign();

      if ( this.T === System.Int64 ) {
        if ( this.eq( System.Int64.MinValue ) || this.eq( System.Int64.MaxValue ) ) {
          if ( arg.neq( 1 ) && arg.neq( 0 ) ) {
            throw new System.OverflowException();
          }

          return r;
        }

        if ( arg.eq( Bridge.$Long.MIN_VALUE ) || arg.eq( Bridge.$Long.MAX_VALUE ) ) {
          if ( this.neq( 1 ) && this.neq( 0 ) ) {
            throw new System.OverflowException();
          }

          return r;
        }

        if ( ( s1 === -1 && s2 === -1 && rs !== 1 ) ||
          ( s1 === 1 && s2 === 1 && rs !== 1 ) ||
          ( s1 === -1 && s2 === 1 && rs !== -1 ) ||
          ( s1 === 1 && s2 === -1 && rs !== -1 ) ) {
          throw new System.OverflowException();
        }

        var r_abs = r.abs();

        if ( r_abs.lt( this.abs() ) || r_abs.lt( System.Int64( arg ).abs() ) ) {
          throw new System.OverflowException();
        }
      } else {
        if ( this.eq( System.UInt64.MaxValue ) ) {
          if ( arg.neq( 1 ) && arg.neq( 0 ) ) {
            throw new System.OverflowException();
          }

          return r;
        }

        if ( arg.eq( Bridge.$Long.MAX_UNSIGNED_VALUE ) ) {
          if ( this.neq( 1 ) && this.neq( 0 ) ) {
            throw new System.OverflowException();
          }

          return r;
        }

        var r_abs = r.abs();

        if ( r_abs.lt( this.abs() ) || r_abs.lt( System.Int64( arg ).abs() ) ) {
          throw new System.OverflowException();
        }
      }
    }

    return r;
  };

  System.Int64.prototype.div = function ( l ) {
    return new this.T( this.value.div( this.T.getValue( l ) ) );
  };

  System.Int64.prototype.mod = function ( l ) {
    return new this.T( this.value.mod( this.T.getValue( l ) ) );
  };

  System.Int64.prototype.neg = function ( overflow ) {
    if ( overflow && this.T === System.Int64 && this.eq( System.Int64.MinValue ) ) {
      throw new System.OverflowException();
    }
    return new this.T( this.value.neg() );
  };

  System.Int64.prototype.inc = function ( overflow ) {
    return this.add( 1, overflow );
  };

  System.Int64.prototype.dec = function ( overflow ) {
    return this.sub( 1, overflow );
  };

  System.Int64.prototype.sign = function () {
    return this.value.isZero() ? 0 : ( this.value.isNegative() ? -1 : 1 );
  };

  System.Int64.prototype.clone = function () {
    return new this.T( this );
  };

  System.Int64.prototype.ne = function ( l ) {
    return this.value.neq( this.T.getValue( l ) );
  };

  System.Int64.prototype.neq = function ( l ) {
    return this.value.neq( this.T.getValue( l ) );
  };

  System.Int64.prototype.eq = function ( l ) {
    return this.value.eq( this.T.getValue( l ) );
  };

  System.Int64.prototype.lt = function ( l ) {
    return this.value.lt( this.T.getValue( l ) );
  };

  System.Int64.prototype.lte = function ( l ) {
    return this.value.lte( this.T.getValue( l ) );
  };

  System.Int64.prototype.gt = function ( l ) {
    return this.value.gt( this.T.getValue( l ) );
  };

  System.Int64.prototype.gte = function ( l ) {
    return this.value.gte( this.T.getValue( l ) );
  };

  System.Int64.prototype.equals = function ( l ) {
    return this.value.eq( this.T.getValue( l ) );
  };

  System.Int64.prototype.equalsT = function ( l ) {
    return this.equals( l );
  };

  System.Int64.prototype.getHashCode = function () {
    var n = ( this.sign() * 397 + this.value.high ) | 0;
    n = ( n * 397 + this.value.low ) | 0;

    return n;
  };

  System.Int64.prototype.toNumber = function () {
    return this.value.toNumber();
  };

  System.Int64.parse = function ( str ) {
    if ( str == null ) {
      throw new System.ArgumentNullException.$ctor1( "str" );
    }

    if ( !/^[+-]?[0-9]+$/.test( str ) ) {
      throw new System.FormatException.$ctor1( "Input string was not in a correct format." );
    }

    var result = new System.Int64( str );

    if ( System.String.trimStartZeros( str ) !== result.toString() ) {
      throw new System.OverflowException();
    }

    return result;
  };

  System.Int64.tryParse = function ( str, v ) {
    try {
      if ( str == null || !/^[+-]?[0-9]+$/.test( str ) ) {
        v.v = System.Int64( Bridge.$Long.ZERO );
        return false;
      }

      v.v = new System.Int64( str );

      if ( System.String.trimStartZeros( str ) !== v.v.toString() ) {
        v.v = System.Int64( Bridge.$Long.ZERO );
        return false;
      }

      return true;
    } catch ( e ) {
      v.v = System.Int64( Bridge.$Long.ZERO );
      return false;
    }
  };

  System.Int64.divRem = function ( a, b, result ) {
    a = System.Int64( a );
    b = System.Int64( b );
    var remainder = a.mod( b );
    result.v = remainder;
    return a.sub( remainder ).div( b );
  };

  System.Int64.min = function () {
    var values = [],
      min, i, len;

    for ( i = 0, len = arguments.length; i < len; i++ ) {
      values.push( System.Int64.getValue( arguments[i] ) );
    }

    i = 0;
    min = values[0];
    for ( ; ++i < values.length; ) {
      if ( values[i].lt( min ) ) {
        min = values[i];
      }
    }

    return new System.Int64( min );
  };

  System.Int64.max = function () {
    var values = [],
      max, i, len;

    for ( i = 0, len = arguments.length; i < len; i++ ) {
      values.push( System.Int64.getValue( arguments[i] ) );
    }

    i = 0;
    max = values[0];
    for ( ; ++i < values.length; ) {
      if ( values[i].gt( max ) ) {
        max = values[i];
      }
    }

    return new System.Int64( max );
  };

  System.Int64.prototype.and = function ( l ) {
    return new this.T( this.value.and( this.T.getValue( l ) ) );
  };

  System.Int64.prototype.not = function () {
    return new this.T( this.value.not() );
  };

  System.Int64.prototype.or = function ( l ) {
    return new this.T( this.value.or( this.T.getValue( l ) ) );
  };

  System.Int64.prototype.shl = function ( l ) {
    return new this.T( this.value.shl( l ) );
  };

  System.Int64.prototype.shr = function ( l ) {
    return new this.T( this.value.shr( l ) );
  };

  System.Int64.prototype.shru = function ( l ) {
    return new this.T( this.value.shru( l ) );
  };

  System.Int64.prototype.xor = function ( l ) {
    return new this.T( this.value.xor( this.T.getValue( l ) ) );
  };

  System.Int64.check = function ( v, tp ) {
    if ( Bridge.Int.isInfinite( v ) ) {
      if ( tp === System.Int64 || tp === System.UInt64 ) {
        return tp.MinValue;
      }
      return tp.min;
    }

    if ( !v ) {
      return null;
    }

    var str, r;
    if ( tp === System.Int64 ) {
      if ( v instanceof System.Int64 ) {
        return v;
      }

      str = v.value.toString();
      r = new System.Int64( str );

      if ( str !== r.value.toString() ) {
        throw new System.OverflowException();
      }

      return r;
    }

    if ( tp === System.UInt64 ) {
      if ( v instanceof System.UInt64 ) {
        return v;
      }

      if ( v.value.isNegative() ) {
        throw new System.OverflowException();
      }
      str = v.value.toString();
      r = new System.UInt64( str );

      if ( str !== r.value.toString() ) {
        throw new System.OverflowException();
      }

      return r;
    }

    return Bridge.Int.check( v.toNumber(), tp );
  };

  System.Int64.clip8 = function ( x ) {
    x = ( x == null || System.Int64.is64Bit( x ) ) ? x : new System.Int64( x );
    return x ? Bridge.Int.sxb( x.value.low & 0xff ) : ( Bridge.Int.isInfinite( x ) ? System.SByte.min : null );
  };

  System.Int64.clipu8 = function ( x ) {
    x = ( x == null || System.Int64.is64Bit( x ) ) ? x : new System.Int64( x );
    return x ? x.value.low & 0xff : ( Bridge.Int.isInfinite( x ) ? System.Byte.min : null );
  };

  System.Int64.clip16 = function ( x ) {
    x = ( x == null || System.Int64.is64Bit( x ) ) ? x : new System.Int64( x );
    return x ? Bridge.Int.sxs( x.value.low & 0xffff ) : ( Bridge.Int.isInfinite( x ) ? System.Int16.min : null );
  };

  System.Int64.clipu16 = function ( x ) {
    x = ( x == null || System.Int64.is64Bit( x ) ) ? x : new System.Int64( x );
    return x ? x.value.low & 0xffff : ( Bridge.Int.isInfinite( x ) ? System.UInt16.min : null );
  };

  System.Int64.clip32 = function ( x ) {
    x = ( x == null || System.Int64.is64Bit( x ) ) ? x : new System.Int64( x );
    return x ? x.value.low | 0 : ( Bridge.Int.isInfinite( x ) ? System.Int32.min : null );
  };

  System.Int64.clipu32 = function ( x ) {
    x = ( x == null || System.Int64.is64Bit( x ) ) ? x : new System.Int64( x );
    return x ? x.value.low >>> 0 : ( Bridge.Int.isInfinite( x ) ? System.UInt32.min : null );
  };

  System.Int64.clip64 = function ( x ) {
    x = ( x == null || System.Int64.is64Bit( x ) ) ? x : new System.UInt64( x );
    return x ? new System.Int64( x.value.toSigned() ) : ( Bridge.Int.isInfinite( x ) ? System.Int64.MinValue : null );
  };

  System.Int64.clipu64 = function ( x ) {
    x = ( x == null || System.Int64.is64Bit( x ) ) ? x : new System.Int64( x );
    return x ? new System.UInt64( x.value.toUnsigned() ) : ( Bridge.Int.isInfinite( x ) ? System.UInt64.MinValue : null );
  };

  System.Int64.Zero = System.Int64( Bridge.$Long.ZERO );
  System.Int64.MinValue = System.Int64( Bridge.$Long.MIN_VALUE );
  System.Int64.MaxValue = System.Int64( Bridge.$Long.MAX_VALUE );
  System.Int64.precision = 19;

  /* ULONG */

  System.UInt64 = function ( l ) {
    if ( this.constructor !== System.UInt64 ) {
      return new System.UInt64( l );
    }

    if ( !Bridge.hasValue( l ) ) {
      l = 0;
    }

    this.T = System.UInt64;
    this.unsigned = true;
    this.value = System.UInt64.getValue( l, true );
  };

  System.UInt64.$number = true;
  System.UInt64.$$name = "System.UInt64";
  System.UInt64.prototype.$$name = "System.UInt64";
  System.UInt64.$kind = "struct";
  System.UInt64.prototype.$kind = "struct";
  System.UInt64.$$inherits = [];
  Bridge.Class.addExtend( System.UInt64, [System.IComparable, System.IFormattable, System.IComparable$1( System.UInt64 ), System.IEquatable$1( System.UInt64 )] );

  System.UInt64.$is = function ( instance ) {
    return instance instanceof System.UInt64;
  };

  System.UInt64.getDefaultValue = function () {
    return System.UInt64.Zero;
  };

  System.UInt64.getValue = function ( l ) {
    if ( !Bridge.hasValue( l ) ) {
      return null;
    }

    if ( l instanceof Bridge.$Long ) {
      return l;
    }

    if ( l instanceof System.UInt64 ) {
      return l.value;
    }

    if ( l instanceof System.Int64 ) {
      return l.value.toUnsigned();
    }

    if ( Bridge.isArray( l ) ) {
      return new Bridge.$Long( l[0], l[1], true );
    }

    if ( Bridge.isString( l ) ) {
      return Bridge.$Long.fromString( l, true );
    }

    if ( Bridge.isNumber( l ) ) {
      if ( l < 0 ) {
        return ( new System.Int64( l ) ).value.toUnsigned();
      }

      return Bridge.$Long.fromNumber( l, true );
    }

    if ( l instanceof System.Decimal ) {
      return Bridge.$Long.fromString( l.toString(), true );
    }

    return Bridge.$Long.fromValue( l );
  };

  System.UInt64.create = function ( l ) {
    if ( !Bridge.hasValue( l ) ) {
      return null;
    }

    if ( l instanceof System.UInt64 ) {
      return l;
    }

    return new System.UInt64( l );
  };

  System.UInt64.lift = function ( l ) {
    if ( !Bridge.hasValue( l ) ) {
      return null;
    }
    return System.UInt64.create( l );
  };

  System.UInt64.prototype.toString = System.Int64.prototype.toString;
  System.UInt64.prototype.format = System.Int64.prototype.format;
  System.UInt64.prototype.isNegative = System.Int64.prototype.isNegative;
  System.UInt64.prototype.abs = System.Int64.prototype.abs;
  System.UInt64.prototype.compareTo = System.Int64.prototype.compareTo;
  System.UInt64.prototype.add = System.Int64.prototype.add;
  System.UInt64.prototype.sub = System.Int64.prototype.sub;
  System.UInt64.prototype.isZero = System.Int64.prototype.isZero;
  System.UInt64.prototype.mul = System.Int64.prototype.mul;
  System.UInt64.prototype.div = System.Int64.prototype.div;
  System.UInt64.prototype.toNumberDivided = System.Int64.prototype.toNumberDivided;
  System.UInt64.prototype.mod = System.Int64.prototype.mod;
  System.UInt64.prototype.neg = System.Int64.prototype.neg;
  System.UInt64.prototype.inc = System.Int64.prototype.inc;
  System.UInt64.prototype.dec = System.Int64.prototype.dec;
  System.UInt64.prototype.sign = System.Int64.prototype.sign;
  System.UInt64.prototype.clone = System.Int64.prototype.clone;
  System.UInt64.prototype.ne = System.Int64.prototype.ne;
  System.UInt64.prototype.neq = System.Int64.prototype.neq;
  System.UInt64.prototype.eq = System.Int64.prototype.eq;
  System.UInt64.prototype.lt = System.Int64.prototype.lt;
  System.UInt64.prototype.lte = System.Int64.prototype.lte;
  System.UInt64.prototype.gt = System.Int64.prototype.gt;
  System.UInt64.prototype.gte = System.Int64.prototype.gte;
  System.UInt64.prototype.equals = System.Int64.prototype.equals;
  System.UInt64.prototype.equalsT = System.Int64.prototype.equalsT;
  System.UInt64.prototype.getHashCode = System.Int64.prototype.getHashCode;
  System.UInt64.prototype.toNumber = System.Int64.prototype.toNumber;

  System.UInt64.parse = function ( str ) {
    if ( str == null ) {
      throw new System.ArgumentNullException.$ctor1( "str" );
    }

    if ( !/^[+-]?[0-9]+$/.test( str ) ) {
      throw new System.FormatException.$ctor1( "Input string was not in a correct format." );
    }

    var result = new System.UInt64( str );

    if ( result.value.isNegative() ) {
      throw new System.OverflowException();
    }

    if ( System.String.trimStartZeros( str ) !== result.toString() ) {
      throw new System.OverflowException();
    }

    return result;
  };

  System.UInt64.tryParse = function ( str, v ) {
    try {
      if ( str == null || !/^[+-]?[0-9]+$/.test( str ) ) {
        v.v = System.UInt64( Bridge.$Long.UZERO );
        return false;
      }

      v.v = new System.UInt64( str );

      if ( v.v.isNegative() ) {
        v.v = System.UInt64( Bridge.$Long.UZERO );
        return false;
      }

      if ( System.String.trimStartZeros( str ) !== v.v.toString() ) {
        v.v = System.UInt64( Bridge.$Long.UZERO );
        return false;
      }

      return true;
    } catch ( e ) {
      v.v = System.UInt64( Bridge.$Long.UZERO );
      return false;
    }
  };

  System.UInt64.min = function () {
    var values = [],
      min, i, len;

    for ( i = 0, len = arguments.length; i < len; i++ ) {
      values.push( System.UInt64.getValue( arguments[i] ) );
    }

    i = 0;
    min = values[0];
    for ( ; ++i < values.length; ) {
      if ( values[i].lt( min ) ) {
        min = values[i];
      }
    }

    return new System.UInt64( min );
  };

  System.UInt64.max = function () {
    var values = [],
      max, i, len;

    for ( i = 0, len = arguments.length; i < len; i++ ) {
      values.push( System.UInt64.getValue( arguments[i] ) );
    }

    i = 0;
    max = values[0];
    for ( ; ++i < values.length; ) {
      if ( values[i].gt( max ) ) {
        max = values[i];
      }
    }

    return new System.UInt64( max );
  };

  System.UInt64.divRem = function ( a, b, result ) {
    a = System.UInt64( a );
    b = System.UInt64( b );
    var remainder = a.mod( b );
    result.v = remainder;
    return a.sub( remainder ).div( b );
  };

  System.UInt64.prototype.toJSON = function () {
    return this.gt( Bridge.Int.MAX_SAFE_INTEGER ) ? this.toString() : this.toNumber();
  };

  System.UInt64.prototype.and = System.Int64.prototype.and;
  System.UInt64.prototype.not = System.Int64.prototype.not;
  System.UInt64.prototype.or = System.Int64.prototype.or;
  System.UInt64.prototype.shl = System.Int64.prototype.shl;
  System.UInt64.prototype.shr = System.Int64.prototype.shr;
  System.UInt64.prototype.shru = System.Int64.prototype.shru;
  System.UInt64.prototype.xor = System.Int64.prototype.xor;

  System.UInt64.Zero = System.UInt64( Bridge.$Long.UZERO );
  System.UInt64.MinValue = System.UInt64.Zero;
  System.UInt64.MaxValue = System.UInt64( Bridge.$Long.MAX_UNSIGNED_VALUE );
  System.UInt64.precision = 20;

  // @source Decimal.js

  /* decimal.js v7.1.0 https://github.com/MikeMcl/decimal.js/LICENCE */
  !function ( n ) { "use strict"; function e( n ) { var e, i, t, r = n.length - 1, s = "", o = n[0]; if ( r > 0 ) { for ( s += o, e = 1; r > e; e++ ) t = n[e] + "", i = Rn - t.length, i && ( s += l( i ) ), s += t; o = n[e], t = o + "", i = Rn - t.length, i && ( s += l( i ) ); } else if ( 0 === o ) return "0"; for ( ; o % 10 === 0; ) o /= 10; return s + o; } function i( n, e, i ) { if ( n !== ~~n || e > n || n > i ) throw Error( En + n ); } function t( n, e, i, t ) { var r, s, o, u; for ( s = n[0]; s >= 10; s /= 10 )--e; return --e < 0 ? ( e += Rn, r = 0 ) : ( r = Math.ceil( ( e + 1 ) / Rn ), e %= Rn ), s = On( 10, Rn - e ), u = n[r] % s | 0, null == t ? 3 > e ? ( 0 == e ? u = u / 100 | 0 : 1 == e && ( u = u / 10 | 0 ), o = 4 > i && 99999 == u || i > 3 && 49999 == u || 5e4 == u || 0 == u ) : o = ( 4 > i && u + 1 == s || i > 3 && u + 1 == s / 2 ) && ( n[r + 1] / s / 100 | 0 ) == On( 10, e - 2 ) - 1 || ( u == s / 2 || 0 == u ) && 0 == ( n[r + 1] / s / 100 | 0 ) : 4 > e ? ( 0 == e ? u = u / 1e3 | 0 : 1 == e ? u = u / 100 | 0 : 2 == e && ( u = u / 10 | 0 ), o = ( t || 4 > i ) && 9999 == u || !t && i > 3 && 4999 == u ) : o = ( ( t || 4 > i ) && u + 1 == s || !t && i > 3 && u + 1 == s / 2 ) && ( n[r + 1] / s / 1e3 | 0 ) == On( 10, e - 3 ) - 1, o; } function r( n, e, i ) { for ( var t, r, s = [0], o = 0, u = n.length; u > o; ) { for ( r = s.length; r--; ) s[r] *= e; for ( s[0] += wn.indexOf( n.charAt( o++ ) ), t = 0; t < s.length; t++ ) s[t] > i - 1 && ( void 0 === s[t + 1] && ( s[t + 1] = 0 ), s[t + 1] += s[t] / i | 0, s[t] %= i ); } return s.reverse(); } function s( n, e ) { var i, t, r = e.d.length; 32 > r ? ( i = Math.ceil( r / 3 ), t = Math.pow( 4, -i ).toString() ) : ( i = 16, t = "2.3283064365386962890625e-10" ), n.precision += i, e = E( n, 1, e.times( t ), new n( 1 ) ); for ( var s = i; s--; ) { var o = e.times( e ); e = o.times( o ).minus( o ).times( 8 ).plus( 1 ); } return n.precision -= i, e; } function o( n, e, i, t ) { var r, s, o, u, c, f, a, h, l, d = n.constructor; n: if ( null != e ) { if ( h = n.d, !h ) return n; for ( r = 1, u = h[0]; u >= 10; u /= 10 ) r++; if ( s = e - r, 0 > s ) s += Rn, o = e, a = h[l = 0], c = a / On( 10, r - o - 1 ) % 10 | 0; else if ( l = Math.ceil( ( s + 1 ) / Rn ), u = h.length, l >= u ) { if ( !t ) break n; for ( ; u++ <= l; ) h.push( 0 ); a = c = 0, r = 1, s %= Rn, o = s - Rn + 1; } else { for ( a = u = h[l], r = 1; u >= 10; u /= 10 ) r++; s %= Rn, o = s - Rn + r, c = 0 > o ? 0 : a / On( 10, r - o - 1 ) % 10 | 0; } if ( t = t || 0 > e || void 0 !== h[l + 1] || ( 0 > o ? a : a % On( 10, r - o - 1 ) ), f = 4 > i ? ( c || t ) && ( 0 == i || i == ( n.s < 0 ? 3 : 2 ) ) : c > 5 || 5 == c && ( 4 == i || t || 6 == i && ( s > 0 ? o > 0 ? a / On( 10, r - o ) : 0 : h[l - 1] ) % 10 & 1 || i == ( n.s < 0 ? 8 : 7 ) ), 1 > e || !h[0] ) return h.length = 0, f ? ( e -= n.e + 1, h[0] = On( 10, ( Rn - e % Rn ) % Rn ), n.e = -e || 0 ) : h[0] = n.e = 0, n; if ( 0 == s ? ( h.length = l, u = 1, l-- ) : ( h.length = l + 1, u = On( 10, Rn - s ), h[l] = o > 0 ? ( a / On( 10, r - o ) % On( 10, o ) | 0 ) * u : 0 ), f ) for ( ; ; ) { if ( 0 == l ) { for ( s = 1, o = h[0]; o >= 10; o /= 10 ) s++; for ( o = h[0] += u, u = 1; o >= 10; o /= 10 ) u++; s != u && ( n.e++, h[0] == Pn && ( h[0] = 1 ) ); break; } if ( h[l] += u, h[l] != Pn ) break; h[l--] = 0, u = 1; } for ( s = h.length; 0 === h[--s]; ) h.pop(); } return bn && ( n.e > d.maxE ? ( n.d = null, n.e = NaN ) : n.e < d.minE && ( n.e = 0, n.d = [0] ) ), n; } function u( n, i, t ) { if ( !n.isFinite() ) return v( n ); var r, s = n.e, o = e( n.d ), u = o.length; return i ? ( t && ( r = t - u ) > 0 ? o = o.charAt( 0 ) + "." + o.slice( 1 ) + l( r ) : u > 1 && ( o = o.charAt( 0 ) + "." + o.slice( 1 ) ), o = o + ( n.e < 0 ? "e" : "e+" ) + n.e ) : 0 > s ? ( o = "0." + l( -s - 1 ) + o, t && ( r = t - u ) > 0 && ( o += l( r ) ) ) : s >= u ? ( o += l( s + 1 - u ), t && ( r = t - s - 1 ) > 0 && ( o = o + "." + l( r ) ) ) : ( ( r = s + 1 ) < u && ( o = o.slice( 0, r ) + "." + o.slice( r ) ), t && ( r = t - u ) > 0 && ( s + 1 === u && ( o += "." ), o += l( r ) ) ), o; } function c( n, e ) { for ( var i = 1, t = n[0]; t >= 10; t /= 10 ) i++; return i + e * Rn - 1; } function f( n, e, i ) { if ( e > Un ) throw bn = !0, i && ( n.precision = i ), Error( Mn ); return o( new n( mn ), e, 1, !0 ); } function a( n, e, i ) { if ( e > _n ) throw Error( Mn ); return o( new n( vn ), e, i, !0 ); } function h( n ) { var e = n.length - 1, i = e * Rn + 1; if ( e = n[e] ) { for ( ; e % 10 == 0; e /= 10 ) i--; for ( e = n[0]; e >= 10; e /= 10 ) i++; } return i; } function l( n ) { for ( var e = ""; n--; ) e += "0"; return e; } function d( n, e, i, t ) { var r, s = new n( 1 ), o = Math.ceil( t / Rn + 4 ); for ( bn = !1; ; ) { if ( i % 2 && ( s = s.times( e ), q( s.d, o ) && ( r = !0 ) ), i = qn( i / 2 ), 0 === i ) { i = s.d.length - 1, r && 0 === s.d[i] && ++s.d[i]; break; } e = e.times( e ), q( e.d, o ); } return bn = !0, s; } function p( n ) { return 1 & n.d[n.d.length - 1]; } function g( n, e, i ) { for ( var t, r = new n( e[0] ), s = 0; ++s < e.length; ) { if ( t = new n( e[s] ), !t.s ) { r = t; break; } r[i]( t ) && ( r = t ); } return r; } function w( n, i ) { var r, s, u, c, f, a, h, l = 0, d = 0, p = 0, g = n.constructor, w = g.rounding, m = g.precision; if ( !n.d || !n.d[0] || n.e > 17 ) return new g( n.d ? n.d[0] ? n.s < 0 ? 0 : 1 / 0 : 1 : n.s ? n.s < 0 ? 0 : n : NaN ); for ( null == i ? ( bn = !1, h = m ) : h = i, a = new g( .03125 ); n.e > -2; ) n = n.times( a ), p += 5; for ( s = Math.log( On( 2, p ) ) / Math.LN10 * 2 + 5 | 0, h += s, r = c = f = new g( 1 ), g.precision = h; ; ) { if ( c = o( c.times( n ), h, 1 ), r = r.times( ++d ), a = f.plus( Sn( c, r, h, 1 ) ), e( a.d ).slice( 0, h ) === e( f.d ).slice( 0, h ) ) { for ( u = p; u--; ) f = o( f.times( f ), h, 1 ); if ( null != i ) return g.precision = m, f; if ( !( 3 > l && t( f.d, h - s, w, l ) ) ) return o( f, g.precision = m, w, bn = !0 ); g.precision = h += 10, r = c = a = new g( 1 ), d = 0, l++; } f = a; } } function m( n, i ) { var r, s, u, c, a, h, l, d, p, g, w, v = 1, N = 10, b = n, x = b.d, E = b.constructor, M = E.rounding, y = E.precision; if ( b.s < 0 || !x || !x[0] || !b.e && 1 == x[0] && 1 == x.length ) return new E( x && !x[0] ? -1 / 0 : 1 != b.s ? NaN : x ? 0 : b ); if ( null == i ? ( bn = !1, p = y ) : p = i, E.precision = p += N, r = e( x ), s = r.charAt( 0 ), !( Math.abs( c = b.e ) < 15e14 ) ) return d = f( E, p + 2, y ).times( c + "" ), b = m( new E( s + "." + r.slice( 1 ) ), p - N ).plus( d ), E.precision = y, null == i ? o( b, y, M, bn = !0 ) : b; for ( ; 7 > s && 1 != s || 1 == s && r.charAt( 1 ) > 3; ) b = b.times( n ), r = e( b.d ), s = r.charAt( 0 ), v++; for ( c = b.e, s > 1 ? ( b = new E( "0." + r ), c++ ) : b = new E( s + "." + r.slice( 1 ) ), g = b, l = a = b = Sn( b.minus( 1 ), b.plus( 1 ), p, 1 ), w = o( b.times( b ), p, 1 ), u = 3; ; ) { if ( a = o( a.times( w ), p, 1 ), d = l.plus( Sn( a, new E( u ), p, 1 ) ), e( d.d ).slice( 0, p ) === e( l.d ).slice( 0, p ) ) { if ( l = l.times( 2 ), 0 !== c && ( l = l.plus( f( E, p + 2, y ).times( c + "" ) ) ), l = Sn( l, new E( v ), p, 1 ), null != i ) return E.precision = y, l; if ( !t( l.d, p - N, M, h ) ) return o( l, E.precision = y, M, bn = !0 ); E.precision = p += N, d = a = b = Sn( g.minus( 1 ), g.plus( 1 ), p, 1 ), w = o( b.times( b ), p, 1 ), u = h = 1; } l = d, u += 2; } } function v( n ) { return String( n.s * n.s / 0 ); } function N( n, e ) { var i, t, r; for ( ( i = e.indexOf( "." ) ) > -1 && ( e = e.replace( ".", "" ) ), ( t = e.search( /e/i ) ) > 0 ? ( 0 > i && ( i = t ), i += +e.slice( t + 1 ), e = e.substring( 0, t ) ) : 0 > i && ( i = e.length ), t = 0; 48 === e.charCodeAt( t ); t++ ); for ( r = e.length; 48 === e.charCodeAt( r - 1 ); --r ); if ( e = e.slice( t, r ) ) { if ( r -= t, n.e = i = i - t - 1, n.d = [], t = ( i + 1 ) % Rn, 0 > i && ( t += Rn ), r > t ) { for ( t && n.d.push( +e.slice( 0, t ) ), r -= Rn; r > t; ) n.d.push( +e.slice( t, t += Rn ) ); e = e.slice( t ), t = Rn - e.length; } else t -= r; for ( ; t--; ) e += "0"; n.d.push( +e ), bn && ( n.e > n.constructor.maxE ? ( n.d = null, n.e = NaN ) : n.e < n.constructor.minE && ( n.e = 0, n.d = [0] ) ); } else n.e = 0, n.d = [0]; return n; } function b( n, e ) { var i, t, s, o, u, f, a, h, l; if ( "Infinity" === e || "NaN" === e ) return +e || ( n.s = NaN ), n.e = NaN, n.d = null, n; if ( An.test( e ) ) i = 16, e = e.toLowerCase(); else if ( Fn.test( e ) ) i = 2; else { if ( !Dn.test( e ) ) throw Error( En + e ); i = 8; } for ( o = e.search( /p/i ), o > 0 ? ( a = +e.slice( o + 1 ), e = e.substring( 2, o ) ) : e = e.slice( 2 ), o = e.indexOf( "." ), u = o >= 0, t = n.constructor, u && ( e = e.replace( ".", "" ), f = e.length, o = f - o, s = d( t, new t( i ), o, 2 * o ) ), h = r( e, i, Pn ), l = h.length - 1, o = l; 0 === h[o]; --o ) h.pop(); return 0 > o ? new t( 0 * n.s ) : ( n.e = c( h, l ), n.d = h, bn = !1, u && ( n = Sn( n, s, 4 * f ) ), a && ( n = n.times( Math.abs( a ) < 54 ? Math.pow( 2, a ) : Nn.pow( 2, a ) ) ), bn = !0, n ); } function x( n, e ) { var i, t = e.d.length; if ( 3 > t ) return E( n, 2, e, e ); i = 1.4 * Math.sqrt( t ), i = i > 16 ? 16 : 0 | i, e = e.times( Math.pow( 5, -i ) ), e = E( n, 2, e, e ); for ( var r, s = new n( 5 ), o = new n( 16 ), u = new n( 20 ); i--; ) r = e.times( e ), e = e.times( s.plus( r.times( o.times( r ).minus( u ) ) ) ); return e; } function E( n, e, i, t, r ) { var s, o, u, c, f = 1, a = n.precision, h = Math.ceil( a / Rn ); for ( bn = !1, c = i.times( i ), u = new n( t ); ; ) { if ( o = Sn( u.times( c ), new n( e++ * e++ ), a, 1 ), u = r ? t.plus( o ) : t.minus( o ), t = Sn( o.times( c ), new n( e++ * e++ ), a, 1 ), o = u.plus( t ), void 0 !== o.d[h] ) { for ( s = h; o.d[s] === u.d[s] && s--; ); if ( -1 == s ) break; } s = u, u = t, t = o, o = s, f++; } return bn = !0, o.d.length = h + 1, o; } function M( n, e ) { var i, t = e.s < 0, r = a( n, n.precision, 1 ), s = r.times( .5 ); if ( e = e.abs(), e.lte( s ) ) return dn = t ? 4 : 1, e; if ( i = e.divToInt( r ), i.isZero() ) dn = t ? 3 : 2; else { if ( e = e.minus( i.times( r ) ), e.lte( s ) ) return dn = p( i ) ? t ? 2 : 3 : t ? 4 : 1, e; dn = p( i ) ? t ? 1 : 4 : t ? 3 : 2; } return e.minus( r ).abs(); } function y( n, e, t, s ) { var o, c, f, a, h, l, d, p, g, w = n.constructor, m = void 0 !== t; if ( m ? ( i( t, 1, gn ), void 0 === s ? s = w.rounding : i( s, 0, 8 ) ) : ( t = w.precision, s = w.rounding ), n.isFinite() ) { for ( d = u( n ), f = d.indexOf( "." ), m ? ( o = 2, 16 == e ? t = 4 * t - 3 : 8 == e && ( t = 3 * t - 2 ) ) : o = e, f >= 0 && ( d = d.replace( ".", "" ), g = new w( 1 ), g.e = d.length - f, g.d = r( u( g ), 10, o ), g.e = g.d.length ), p = r( d, 10, o ), c = h = p.length; 0 == p[--h]; ) p.pop(); if ( p[0] ) { if ( 0 > f ? c-- : ( n = new w( n ), n.d = p, n.e = c, n = Sn( n, g, t, s, 0, o ), p = n.d, c = n.e, l = hn ), f = p[t], a = o / 2, l = l || void 0 !== p[t + 1], l = 4 > s ? ( void 0 !== f || l ) && ( 0 === s || s === ( n.s < 0 ? 3 : 2 ) ) : f > a || f === a && ( 4 === s || l || 6 === s && 1 & p[t - 1] || s === ( n.s < 0 ? 8 : 7 ) ), p.length = t, l ) for ( ; ++p[--t] > o - 1; ) p[t] = 0, t || ( ++c, p.unshift( 1 ) ); for ( h = p.length; !p[h - 1]; --h ); for ( f = 0, d = ""; h > f; f++ ) d += wn.charAt( p[f] ); if ( m ) { if ( h > 1 ) if ( 16 == e || 8 == e ) { for ( f = 16 == e ? 4 : 3, --h; h % f; h++ ) d += "0"; for ( p = r( d, o, e ), h = p.length; !p[h - 1]; --h ); for ( f = 1, d = "1."; h > f; f++ ) d += wn.charAt( p[f] ); } else d = d.charAt( 0 ) + "." + d.slice( 1 ); d = d + ( 0 > c ? "p" : "p+" ) + c; } else if ( 0 > c ) { for ( ; ++c; ) d = "0" + d; d = "0." + d; } else if ( ++c > h ) for ( c -= h; c--; ) d += "0"; else h > c && ( d = d.slice( 0, c ) + "." + d.slice( c ) ); } else d = m ? "0p+0" : "0"; d = ( 16 == e ? "0x" : 2 == e ? "0b" : 8 == e ? "0o" : "" ) + d; } else d = v( n ); return n.s < 0 ? "-" + d : d; } function q( n, e ) { return n.length > e ? ( n.length = e, !0 ) : void 0; } function O( n ) { return new this( n ).abs(); } function F( n ) { return new this( n ).acos(); } function A( n ) { return new this( n ).acosh(); } function D( n, e ) { return new this( n ).plus( e ); } function Z( n ) { return new this( n ).asin(); } function P( n ) { return new this( n ).asinh(); } function R( n ) { return new this( n ).atan(); } function L( n ) { return new this( n ).atanh(); } function U( n, e ) { n = new this( n ), e = new this( e ); var i, t = this.precision, r = this.rounding, s = t + 4; return n.s && e.s ? n.d || e.d ? !e.d || n.isZero() ? ( i = e.s < 0 ? a( this, t, r ) : new this( 0 ), i.s = n.s ) : !n.d || e.isZero() ? ( i = a( this, s, 1 ).times( .5 ), i.s = n.s ) : e.s < 0 ? ( this.precision = s, this.rounding = 1, i = this.atan( Sn( n, e, s, 1 ) ), e = a( this, s, 1 ), this.precision = t, this.rounding = r, i = n.s < 0 ? i.minus( e ) : i.plus( e ) ) : i = this.atan( Sn( n, e, s, 1 ) ) : ( i = a( this, s, 1 ).times( e.s > 0 ? .25 : .75 ), i.s = n.s ) : i = new this( NaN ), i; } function _( n ) { return new this( n ).cbrt(); } function k( n ) { return o( n = new this( n ), n.e + 1, 2 ); } function S( n ) { if ( !n || "object" != typeof n ) throw Error( xn + "Object expected" ); var e, i, t, r = ["precision", 1, gn, "rounding", 0, 8, "toExpNeg", -pn, 0, "toExpPos", 0, pn, "maxE", 0, pn, "minE", -pn, 0, "modulo", 0, 9]; for ( e = 0; e < r.length; e += 3 ) if ( void 0 !== ( t = n[i = r[e]] ) ) { if ( !( qn( t ) === t && t >= r[e + 1] && t <= r[e + 2] ) ) throw Error( En + i + ": " + t ); this[i] = t; } if ( void 0 !== ( t = n[i = "crypto"] ) ) { if ( t !== !0 && t !== !1 && 0 !== t && 1 !== t ) throw Error( En + i + ": " + t ); if ( t ) { if ( "undefined" == typeof crypto || !crypto || !crypto.getRandomValues && !crypto.randomBytes ) throw Error( yn ); this[i] = !0; } else this[i] = !1; } return this; } function T( n ) { return new this( n ).cos(); } function C( n ) { return new this( n ).cosh(); } function I( n ) { function e( n ) { var i, t, r, s = this; if ( !( s instanceof e ) ) return new e( n ); if ( s.constructor = e, n instanceof e ) return s.s = n.s, s.e = n.e, void ( s.d = ( n = n.d ) ? n.slice() : n ); if ( r = typeof n, "number" === r ) { if ( 0 === n ) return s.s = 0 > 1 / n ? -1 : 1, s.e = 0, void ( s.d = [0] ); if ( 0 > n ? ( n = -n, s.s = -1 ) : s.s = 1, n === ~~n && 1e7 > n ) { for ( i = 0, t = n; t >= 10; t /= 10 ) i++; return s.e = i, void ( s.d = [n] ); } return 0 * n !== 0 ? ( n || ( s.s = NaN ), s.e = NaN, void ( s.d = null ) ) : N( s, n.toString() ); } if ( "string" !== r ) throw Error( En + n ); return 45 === n.charCodeAt( 0 ) ? ( n = n.slice( 1 ), s.s = -1 ) : s.s = 1, Zn.test( n ) ? N( s, n ) : b( s, n ); } var i, t, r; if ( e.prototype = kn, e.ROUND_UP = 0, e.ROUND_DOWN = 1, e.ROUND_CEIL = 2, e.ROUND_FLOOR = 3, e.ROUND_HALF_UP = 4, e.ROUND_HALF_DOWN = 5, e.ROUND_HALF_EVEN = 6, e.ROUND_HALF_CEIL = 7, e.ROUND_HALF_FLOOR = 8, e.EUCLID = 9, e.config = e.set = S, e.clone = I, e.abs = O, e.acos = F, e.acosh = A, e.add = D, e.asin = Z, e.asinh = P, e.atan = R, e.atanh = L, e.atan2 = U, e.cbrt = _, e.ceil = k, e.cos = T, e.cosh = C, e.div = H, e.exp = B, e.floor = V, e.hypot = $, e.ln = j, e.log = W, e.log10 = z, e.log2 = J, e.max = G, e.min = K, e.mod = Q, e.mul = X, e.pow = Y, e.random = nn, e.round = en, e.sign = tn, e.sin = rn, e.sinh = sn, e.sqrt = on, e.sub = un, e.tan = cn, e.tanh = fn, e.trunc = an, void 0 === n && ( n = {} ), n ) for ( r = ["precision", "rounding", "toExpNeg", "toExpPos", "maxE", "minE", "modulo", "crypto"], i = 0; i < r.length; ) n.hasOwnProperty( t = r[i++] ) || ( n[t] = this[t] ); return e.config( n ), e; } function H( n, e ) { return new this( n ).div( e ); } function B( n ) { return new this( n ).exp(); } function V( n ) { return o( n = new this( n ), n.e + 1, 3 ); } function $() { var n, e, i = new this( 0 ); for ( bn = !1, n = 0; n < arguments.length; ) if ( e = new this( arguments[n++] ), e.d ) i.d && ( i = i.plus( e.times( e ) ) ); else { if ( e.s ) return bn = !0, new this( 1 / 0 ); i = e; } return bn = !0, i.sqrt(); } function j( n ) { return new this( n ).ln(); } function W( n, e ) { return new this( n ).log( e ); } function J( n ) { return new this( n ).log( 2 ); } function z( n ) { return new this( n ).log( 10 ); } function G() { return g( this, arguments, "lt" ); } function K() { return g( this, arguments, "gt" ); } function Q( n, e ) { return new this( n ).mod( e ); } function X( n, e ) { return new this( n ).mul( e ); } function Y( n, e ) { return new this( n ).pow( e ); } function nn( n ) { var e, t, r, s, o = 0, u = new this( 1 ), c = []; if ( void 0 === n ? n = this.precision : i( n, 1, gn ), r = Math.ceil( n / Rn ), this.crypto ) if ( crypto.getRandomValues ) for ( e = crypto.getRandomValues( new Uint32Array( r ) ); r > o; ) s = e[o], s >= 429e7 ? e[o] = crypto.getRandomValues( new Uint32Array( 1 ) )[0] : c[o++] = s % 1e7; else { if ( !crypto.randomBytes ) throw Error( yn ); for ( e = crypto.randomBytes( r *= 4 ); r > o; ) s = e[o] + ( e[o + 1] << 8 ) + ( e[o + 2] << 16 ) + ( ( 127 & e[o + 3] ) << 24 ), s >= 214e7 ? crypto.randomBytes( 4 ).copy( e, o ) : ( c.push( s % 1e7 ), o += 4 ); o = r / 4; } else for ( ; r > o; ) c[o++] = 1e7 * Math.random() | 0; for ( r = c[--o], n %= Rn, r && n && ( s = On( 10, Rn - n ), c[o] = ( r / s | 0 ) * s ); 0 === c[o]; o-- ) c.pop(); if ( 0 > o ) t = 0, c = [0]; else { for ( t = -1; 0 === c[0]; t -= Rn ) c.shift(); for ( r = 1, s = c[0]; s >= 10; s /= 10 ) r++; Rn > r && ( t -= Rn - r ); } return u.e = t, u.d = c, u; } function en( n ) { return o( n = new this( n ), n.e + 1, this.rounding ); } function tn( n ) { return n = new this( n ), n.d ? n.d[0] ? n.s : 0 * n.s : n.s || NaN; } function rn( n ) { return new this( n ).sin(); } function sn( n ) { return new this( n ).sinh(); } function on( n ) { return new this( n ).sqrt(); } function un( n, e ) { return new this( n ).sub( e ); } function cn( n ) { return new this( n ).tan(); } function fn( n ) { return new this( n ).tanh(); } function an( n ) { return o( n = new this( n ), n.e + 1, 1 ); } var hn, ln, dn, pn = 9e15, gn = 1e9, wn = "0123456789abcdef", mn = "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058", vn = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789", Nn = { precision: 20, rounding: 4, modulo: 1, toExpNeg: -7, toExpPos: 21, minE: -pn, maxE: pn, crypto: !1 }, bn = !0, xn = "[DecimalError] ", En = xn + "Invalid argument: ", Mn = xn + "Precision limit exceeded", yn = xn + "crypto unavailable", qn = Math.floor, On = Math.pow, Fn = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i, An = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i, Dn = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i, Zn = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i, Pn = 1e7, Rn = 7, Ln = 9007199254740991, Un = mn.length - 1, _n = vn.length - 1, kn = {}; kn.absoluteValue = kn.abs = function () { var n = new this.constructor( this ); return n.s < 0 && ( n.s = 1 ), o( n ); }, kn.ceil = function () { return o( new this.constructor( this ), this.e + 1, 2 ); }, kn.comparedTo = kn.cmp = function ( n ) { var e, i, t, r, s = this, o = s.d, u = ( n = new s.constructor( n ) ).d, c = s.s, f = n.s; if ( !o || !u ) return c && f ? c !== f ? c : o === u ? 0 : !o ^ 0 > c ? 1 : -1 : NaN; if ( !o[0] || !u[0] ) return o[0] ? c : u[0] ? -f : 0; if ( c !== f ) return c; if ( s.e !== n.e ) return s.e > n.e ^ 0 > c ? 1 : -1; for ( t = o.length, r = u.length, e = 0, i = r > t ? t : r; i > e; ++e ) if ( o[e] !== u[e] ) return o[e] > u[e] ^ 0 > c ? 1 : -1; return t === r ? 0 : t > r ^ 0 > c ? 1 : -1; }, kn.cosine = kn.cos = function () { var n, e, i = this, t = i.constructor; return i.d ? i.d[0] ? ( n = t.precision, e = t.rounding, t.precision = n + Math.max( i.e, i.sd() ) + Rn, t.rounding = 1, i = s( t, M( t, i ) ), t.precision = n, t.rounding = e, o( 2 == dn || 3 == dn ? i.neg() : i, n, e, !0 ) ) : new t( 1 ) : new t( NaN ); }, kn.cubeRoot = kn.cbrt = function () { var n, i, t, r, s, u, c, f, a, h, l = this, d = l.constructor; if ( !l.isFinite() || l.isZero() ) return new d( l ); for ( bn = !1, u = l.s * Math.pow( l.s * l, 1 / 3 ), u && Math.abs( u ) != 1 / 0 ? r = new d( u.toString() ) : ( t = e( l.d ), n = l.e, ( u = ( n - t.length + 1 ) % 3 ) && ( t += 1 == u || -2 == u ? "0" : "00" ), u = Math.pow( t, 1 / 3 ), n = qn( ( n + 1 ) / 3 ) - ( n % 3 == ( 0 > n ? -1 : 2 ) ), u == 1 / 0 ? t = "5e" + n : ( t = u.toExponential(), t = t.slice( 0, t.indexOf( "e" ) + 1 ) + n ), r = new d( t ), r.s = l.s ), c = ( n = d.precision ) + 3; ; ) if ( f = r, a = f.times( f ).times( f ), h = a.plus( l ), r = Sn( h.plus( l ).times( f ), h.plus( a ), c + 2, 1 ), e( f.d ).slice( 0, c ) === ( t = e( r.d ) ).slice( 0, c ) ) { if ( t = t.slice( c - 3, c + 1 ), "9999" != t && ( s || "4999" != t ) ) { ( !+t || !+t.slice( 1 ) && "5" == t.charAt( 0 ) ) && ( o( r, n + 1, 1 ), i = !r.times( r ).times( r ).eq( l ) ); break; } if ( !s && ( o( f, n + 1, 0 ), f.times( f ).times( f ).eq( l ) ) ) { r = f; break; } c += 4, s = 1; } return bn = !0, o( r, n, d.rounding, i ); }, kn.decimalPlaces = kn.dp = function () { var n, e = this.d, i = NaN; if ( e ) { if ( n = e.length - 1, i = ( n - qn( this.e / Rn ) ) * Rn, n = e[n] ) for ( ; n % 10 == 0; n /= 10 ) i--; 0 > i && ( i = 0 ); } return i; }, kn.dividedBy = kn.div = function ( n ) { return Sn( this, new this.constructor( n ) ); }, kn.dividedToIntegerBy = kn.divToInt = function ( n ) { var e = this, i = e.constructor; return o( Sn( e, new i( n ), 0, 1, 1 ), i.precision, i.rounding ); }, kn.equals = kn.eq = function ( n ) { return 0 === this.cmp( n ); }, kn.floor = function () { return o( new this.constructor( this ), this.e + 1, 3 ); }, kn.greaterThan = kn.gt = function ( n ) { return this.cmp( n ) > 0; }, kn.greaterThanOrEqualTo = kn.gte = function ( n ) { var e = this.cmp( n ); return 1 == e || 0 === e; }, kn.hyperbolicCosine = kn.cosh = function () { var n, e, i, t, r, s = this, u = s.constructor, c = new u( 1 ); if ( !s.isFinite() ) return new u( s.s ? 1 / 0 : NaN ); if ( s.isZero() ) return c; i = u.precision, t = u.rounding, u.precision = i + Math.max( s.e, s.sd() ) + 4, u.rounding = 1, r = s.d.length, 32 > r ? ( n = Math.ceil( r / 3 ), e = Math.pow( 4, -n ).toString() ) : ( n = 16, e = "2.3283064365386962890625e-10" ), s = E( u, 1, s.times( e ), new u( 1 ), !0 ); for ( var f, a = n, h = new u( 8 ); a--; ) f = s.times( s ), s = c.minus( f.times( h.minus( f.times( h ) ) ) ); return o( s, u.precision = i, u.rounding = t, !0 ); }, kn.hyperbolicSine = kn.sinh = function () { var n, e, i, t, r = this, s = r.constructor; if ( !r.isFinite() || r.isZero() ) return new s( r ); if ( e = s.precision, i = s.rounding, s.precision = e + Math.max( r.e, r.sd() ) + 4, s.rounding = 1, t = r.d.length, 3 > t ) r = E( s, 2, r, r, !0 ); else { n = 1.4 * Math.sqrt( t ), n = n > 16 ? 16 : 0 | n, r = r.times( Math.pow( 5, -n ) ), r = E( s, 2, r, r, !0 ); for ( var u, c = new s( 5 ), f = new s( 16 ), a = new s( 20 ); n--; ) u = r.times( r ), r = r.times( c.plus( u.times( f.times( u ).plus( a ) ) ) ); } return s.precision = e, s.rounding = i, o( r, e, i, !0 ); }, kn.hyperbolicTangent = kn.tanh = function () { var n, e, i = this, t = i.constructor; return i.isFinite() ? i.isZero() ? new t( i ) : ( n = t.precision, e = t.rounding, t.precision = n + 7, t.rounding = 1, Sn( i.sinh(), i.cosh(), t.precision = n, t.rounding = e ) ) : new t( i.s ); }, kn.inverseCosine = kn.acos = function () { var n, e = this, i = e.constructor, t = e.abs().cmp( 1 ), r = i.precision, s = i.rounding; return -1 !== t ? 0 === t ? e.isNeg() ? a( i, r, s ) : new i( 0 ) : new i( NaN ) : e.isZero() ? a( i, r + 4, s ).times( .5 ) : ( i.precision = r + 6, i.rounding = 1, e = e.asin(), n = a( i, r + 4, s ).times( .5 ), i.precision = r, i.rounding = s, n.minus( e ) ); }, kn.inverseHyperbolicCosine = kn.acosh = function () { var n, e, i = this, t = i.constructor; return i.lte( 1 ) ? new t( i.eq( 1 ) ? 0 : NaN ) : i.isFinite() ? ( n = t.precision, e = t.rounding, t.precision = n + Math.max( Math.abs( i.e ), i.sd() ) + 4, t.rounding = 1, bn = !1, i = i.times( i ).minus( 1 ).sqrt().plus( i ), bn = !0, t.precision = n, t.rounding = e, i.ln() ) : new t( i ); }, kn.inverseHyperbolicSine = kn.asinh = function () { var n, e, i = this, t = i.constructor; return !i.isFinite() || i.isZero() ? new t( i ) : ( n = t.precision, e = t.rounding, t.precision = n + 2 * Math.max( Math.abs( i.e ), i.sd() ) + 6, t.rounding = 1, bn = !1, i = i.times( i ).plus( 1 ).sqrt().plus( i ), bn = !0, t.precision = n, t.rounding = e, i.ln() ); }, kn.inverseHyperbolicTangent = kn.atanh = function () { var n, e, i, t, r = this, s = r.constructor; return r.isFinite() ? r.e >= 0 ? new s( r.abs().eq( 1 ) ? r.s / 0 : r.isZero() ? r : NaN ) : ( n = s.precision, e = s.rounding, t = r.sd(), Math.max( t, n ) < 2 * -r.e - 1 ? o( new s( r ), n, e, !0 ) : ( s.precision = i = t - r.e, r = Sn( r.plus( 1 ), new s( 1 ).minus( r ), i + n, 1 ), s.precision = n + 4, s.rounding = 1, r = r.ln(), s.precision = n, s.rounding = e, r.times( .5 ) ) ) : new s( NaN ); }, kn.inverseSine = kn.asin = function () { var n, e, i, t, r = this, s = r.constructor; return r.isZero() ? new s( r ) : ( e = r.abs().cmp( 1 ), i = s.precision, t = s.rounding, -1 !== e ? 0 === e ? ( n = a( s, i + 4, t ).times( .5 ), n.s = r.s, n ) : new s( NaN ) : ( s.precision = i + 6, s.rounding = 1, r = r.div( new s( 1 ).minus( r.times( r ) ).sqrt().plus( 1 ) ).atan(), s.precision = i, s.rounding = t, r.times( 2 ) ) ); }, kn.inverseTangent = kn.atan = function () { var n, e, i, t, r, s, u, c, f, h = this, l = h.constructor, d = l.precision, p = l.rounding; if ( h.isFinite() ) { if ( h.isZero() ) return new l( h ); if ( h.abs().eq( 1 ) && _n >= d + 4 ) return u = a( l, d + 4, p ).times( .25 ), u.s = h.s, u; } else { if ( !h.s ) return new l( NaN ); if ( _n >= d + 4 ) return u = a( l, d + 4, p ).times( .5 ), u.s = h.s, u; } for ( l.precision = c = d + 10, l.rounding = 1, i = Math.min( 28, c / Rn + 2 | 0 ), n = i; n; --n ) h = h.div( h.times( h ).plus( 1 ).sqrt().plus( 1 ) ); for ( bn = !1, e = Math.ceil( c / Rn ), t = 1, f = h.times( h ), u = new l( h ), r = h; -1 !== n; ) if ( r = r.times( f ), s = u.minus( r.div( t += 2 ) ), r = r.times( f ), u = s.plus( r.div( t += 2 ) ), void 0 !== u.d[e] ) for ( n = e; u.d[n] === s.d[n] && n--; ); return i && ( u = u.times( 2 << i - 1 ) ), bn = !0, o( u, l.precision = d, l.rounding = p, !0 ); }, kn.isFinite = function () { return !!this.d; }, kn.isInteger = kn.isInt = function () { return !!this.d && qn( this.e / Rn ) > this.d.length - 2; }, kn.isNaN = function () { return !this.s; }, kn.isNegative = kn.isNeg = function () { return this.s < 0; }, kn.isPositive = kn.isPos = function () { return this.s > 0; }, kn.isZero = function () { return !!this.d && 0 === this.d[0]; }, kn.lessThan = kn.lt = function ( n ) { return this.cmp( n ) < 0; }, kn.lessThanOrEqualTo = kn.lte = function ( n ) { return this.cmp( n ) < 1; }, kn.logarithm = kn.log = function ( n ) { var i, r, s, u, c, a, h, l, d = this, p = d.constructor, g = p.precision, w = p.rounding, v = 5; if ( null == n ) n = new p( 10 ), i = !0; else { if ( n = new p( n ), r = n.d, n.s < 0 || !r || !r[0] || n.eq( 1 ) ) return new p( NaN ); i = n.eq( 10 ); } if ( r = d.d, d.s < 0 || !r || !r[0] || d.eq( 1 ) ) return new p( r && !r[0] ? -1 / 0 : 1 != d.s ? NaN : r ? 0 : 1 / 0 ); if ( i ) if ( r.length > 1 ) c = !0; else { for ( u = r[0]; u % 10 === 0; ) u /= 10; c = 1 !== u; } if ( bn = !1, h = g + v, a = m( d, h ), s = i ? f( p, h + 10 ) : m( n, h ), l = Sn( a, s, h, 1 ), t( l.d, u = g, w ) ) do if ( h += 10, a = m( d, h ), s = i ? f( p, h + 10 ) : m( n, h ), l = Sn( a, s, h, 1 ), !c ) { +e( l.d ).slice( u + 1, u + 15 ) + 1 == 1e14 && ( l = o( l, g + 1, 0 ) ); break; } while ( t( l.d, u += 10, w ) ); return bn = !0, o( l, g, w ); }, kn.minus = kn.sub = function ( n ) { var e, i, t, r, s, u, f, a, h, l, d, p, g = this, w = g.constructor; if ( n = new w( n ), !g.d || !n.d ) return g.s && n.s ? g.d ? n.s = -n.s : n = new w( n.d || g.s !== n.s ? g : NaN ) : n = new w( NaN ), n; if ( g.s != n.s ) return n.s = -n.s, g.plus( n ); if ( h = g.d, p = n.d, f = w.precision, a = w.rounding, !h[0] || !p[0] ) { if ( p[0] ) n.s = -n.s; else { if ( !h[0] ) return new w( 3 === a ? -0 : 0 ); n = new w( g ); } return bn ? o( n, f, a ) : n; } if ( i = qn( n.e / Rn ), l = qn( g.e / Rn ), h = h.slice(), s = l - i ) { for ( d = 0 > s, d ? ( e = h, s = -s, u = p.length ) : ( e = p, i = l, u = h.length ), t = Math.max( Math.ceil( f / Rn ), u ) + 2, s > t && ( s = t, e.length = 1 ), e.reverse(), t = s; t--; ) e.push( 0 ); e.reverse(); } else { for ( t = h.length, u = p.length, d = u > t, d && ( u = t ), t = 0; u > t; t++ ) if ( h[t] != p[t] ) { d = h[t] < p[t]; break; } s = 0; } for ( d && ( e = h, h = p, p = e, n.s = -n.s ), u = h.length, t = p.length - u; t > 0; --t ) h[u++] = 0; for ( t = p.length; t > s; ) { if ( h[--t] < p[t] ) { for ( r = t; r && 0 === h[--r]; ) h[r] = Pn - 1; --h[r], h[t] += Pn; } h[t] -= p[t]; } for ( ; 0 === h[--u]; ) h.pop(); for ( ; 0 === h[0]; h.shift() )--i; return h[0] ? ( n.d = h, n.e = c( h, i ), bn ? o( n, f, a ) : n ) : new w( 3 === a ? -0 : 0 ); }, kn.modulo = kn.mod = function ( n ) { var e, i = this, t = i.constructor; return n = new t( n ), !i.d || !n.s || n.d && !n.d[0] ? new t( NaN ) : !n.d || i.d && !i.d[0] ? o( new t( i ), t.precision, t.rounding ) : ( bn = !1, 9 == t.modulo ? ( e = Sn( i, n.abs(), 0, 3, 1 ), e.s *= n.s ) : e = Sn( i, n, 0, t.modulo, 1 ), e = e.times( n ), bn = !0, i.minus( e ) ); }, kn.naturalExponential = kn.exp = function () { return w( this ); }, kn.naturalLogarithm = kn.ln = function () { return m( this ); }, kn.negated = kn.neg = function () { var n = new this.constructor( this ); return n.s = -n.s, o( n ); }, kn.plus = kn.add = function ( n ) { var e, i, t, r, s, u, f, a, h, l, d = this, p = d.constructor; if ( n = new p( n ), !d.d || !n.d ) return d.s && n.s ? d.d || ( n = new p( n.d || d.s === n.s ? d : NaN ) ) : n = new p( NaN ), n; if ( d.s != n.s ) return n.s = -n.s, d.minus( n ); if ( h = d.d, l = n.d, f = p.precision, a = p.rounding, !h[0] || !l[0] ) return l[0] || ( n = new p( d ) ), bn ? o( n, f, a ) : n; if ( s = qn( d.e / Rn ), t = qn( n.e / Rn ), h = h.slice(), r = s - t ) { for ( 0 > r ? ( i = h, r = -r, u = l.length ) : ( i = l, t = s, u = h.length ), s = Math.ceil( f / Rn ), u = s > u ? s + 1 : u + 1, r > u && ( r = u, i.length = 1 ), i.reverse(); r--; ) i.push( 0 ); i.reverse(); } for ( u = h.length, r = l.length, 0 > u - r && ( r = u, i = l, l = h, h = i ), e = 0; r; ) e = ( h[--r] = h[r] + l[r] + e ) / Pn | 0, h[r] %= Pn; for ( e && ( h.unshift( e ), ++t ), u = h.length; 0 == h[--u]; ) h.pop(); return n.d = h, n.e = c( h, t ), bn ? o( n, f, a ) : n; }, kn.precision = kn.sd = function ( n ) { var e, i = this; if ( void 0 !== n && n !== !!n && 1 !== n && 0 !== n ) throw Error( En + n ); return i.d ? ( e = h( i.d ), n && i.e + 1 > e && ( e = i.e + 1 ) ) : e = NaN, e; }, kn.round = function () { var n = this, e = n.constructor; return o( new e( n ), n.e + 1, e.rounding ); }, kn.sine = kn.sin = function () { var n, e, i = this, t = i.constructor; return i.isFinite() ? i.isZero() ? new t( i ) : ( n = t.precision, e = t.rounding, t.precision = n + Math.max( i.e, i.sd() ) + Rn, t.rounding = 1, i = x( t, M( t, i ) ), t.precision = n, t.rounding = e, o( dn > 2 ? i.neg() : i, n, e, !0 ) ) : new t( NaN ); }, kn.squareRoot = kn.sqrt = function () { var n, i, t, r, s, u, c = this, f = c.d, a = c.e, h = c.s, l = c.constructor; if ( 1 !== h || !f || !f[0] ) return new l( !h || 0 > h && ( !f || f[0] ) ? NaN : f ? c : 1 / 0 ); for ( bn = !1, h = Math.sqrt( +c ), 0 == h || h == 1 / 0 ? ( i = e( f ), ( i.length + a ) % 2 == 0 && ( i += "0" ), h = Math.sqrt( i ), a = qn( ( a + 1 ) / 2 ) - ( 0 > a || a % 2 ), h == 1 / 0 ? i = "1e" + a : ( i = h.toExponential(), i = i.slice( 0, i.indexOf( "e" ) + 1 ) + a ), r = new l( i ) ) : r = new l( h.toString() ), t = ( a = l.precision ) + 3; ; ) if ( u = r, r = u.plus( Sn( c, u, t + 2, 1 ) ).times( .5 ), e( u.d ).slice( 0, t ) === ( i = e( r.d ) ).slice( 0, t ) ) { if ( i = i.slice( t - 3, t + 1 ), "9999" != i && ( s || "4999" != i ) ) { ( !+i || !+i.slice( 1 ) && "5" == i.charAt( 0 ) ) && ( o( r, a + 1, 1 ), n = !r.times( r ).eq( c ) ); break; } if ( !s && ( o( u, a + 1, 0 ), u.times( u ).eq( c ) ) ) { r = u; break; } t += 4, s = 1; } return bn = !0, o( r, a, l.rounding, n ); }, kn.tangent = kn.tan = function () { var n, e, i = this, t = i.constructor; return i.isFinite() ? i.isZero() ? new t( i ) : ( n = t.precision, e = t.rounding, t.precision = n + 10, t.rounding = 1, i = i.sin(), i.s = 1, i = Sn( i, new t( 1 ).minus( i.times( i ) ).sqrt(), n + 10, 0 ), t.precision = n, t.rounding = e, o( 2 == dn || 4 == dn ? i.neg() : i, n, e, !0 ) ) : new t( NaN ); }, kn.times = kn.mul = function ( n ) { var e, i, t, r, s, u, f, a, h, l = this, d = l.constructor, p = l.d, g = ( n = new d( n ) ).d; if ( n.s *= l.s, !( p && p[0] && g && g[0] ) ) return new d( !n.s || p && !p[0] && !g || g && !g[0] && !p ? NaN : p && g ? 0 * n.s : n.s / 0 ); for ( i = qn( l.e / Rn ) + qn( n.e / Rn ), a = p.length, h = g.length, h > a && ( s = p, p = g, g = s, u = a, a = h, h = u ), s = [], u = a + h, t = u; t--; ) s.push( 0 ); for ( t = h; --t >= 0; ) { for ( e = 0, r = a + t; r > t; ) f = s[r] + g[t] * p[r - t - 1] + e, s[r--] = f % Pn | 0, e = f / Pn | 0; s[r] = ( s[r] + e ) % Pn | 0; } for ( ; !s[--u]; ) s.pop(); for ( e ? ++i : s.shift(), t = s.length; !s[--t]; ) s.pop(); return n.d = s, n.e = c( s, i ), bn ? o( n, d.precision, d.rounding ) : n; }, kn.toBinary = function ( n, e ) { return y( this, 2, n, e ); }, kn.toDecimalPlaces = kn.toDP = function ( n, e ) { var t = this, r = t.constructor; return t = new r( t ), void 0 === n ? t : ( i( n, 0, gn ), void 0 === e ? e = r.rounding : i( e, 0, 8 ), o( t, n + t.e + 1, e ) ); }, kn.toExponential = function ( n, e ) { var t, r = this, s = r.constructor; return void 0 === n ? t = u( r, !0 ) : ( i( n, 0, gn ), void 0 === e ? e = s.rounding : i( e, 0, 8 ), r = o( new s( r ), n + 1, e ), t = u( r, !0, n + 1 ) ), r.isNeg() && !r.isZero() ? "-" + t : t; }, kn.toFixed = function ( n, e ) { var t, r, s = this, c = s.constructor; return void 0 === n ? t = u( s ) : ( i( n, 0, gn ), void 0 === e ? e = c.rounding : i( e, 0, 8 ), r = o( new c( s ), n + s.e + 1, e ), t = u( r, !1, n + r.e + 1 ) ), s.isNeg() && !s.isZero() ? "-" + t : t; }, kn.toFraction = function ( n ) { var i, t, r, s, o, u, c, f, a, l, d, p, g = this, w = g.d, m = g.constructor; if ( !w ) return new m( g ); if ( a = t = new m( 1 ), r = f = new m( 0 ), i = new m( r ), o = i.e = h( w ) - g.e - 1, u = o % Rn, i.d[0] = On( 10, 0 > u ? Rn + u : u ), null == n ) n = o > 0 ? i : a; else { if ( c = new m( n ), !c.isInt() || c.lt( a ) ) throw Error( En + c ); n = c.gt( i ) ? o > 0 ? i : a : c; } for ( bn = !1, c = new m( e( w ) ), l = m.precision, m.precision = o = w.length * Rn * 2; d = Sn( c, i, 0, 1, 1 ), s = t.plus( d.times( r ) ), 1 != s.cmp( n ); ) t = r, r = s, s = a, a = f.plus( d.times( s ) ), f = s, s = i, i = c.minus( d.times( s ) ), c = s; return s = Sn( n.minus( t ), r, 0, 1, 1 ), f = f.plus( s.times( a ) ), t = t.plus( s.times( r ) ), f.s = a.s = g.s, p = Sn( a, r, o, 1 ).minus( g ).abs().cmp( Sn( f, t, o, 1 ).minus( g ).abs() ) < 1 ? [a, r] : [f, t], m.precision = l, bn = !0, p; }, kn.toHexadecimal = kn.toHex = function ( n, e ) { return y( this, 16, n, e ); }, kn.toNearest = function ( n, e ) { var t = this, r = t.constructor; if ( t = new r( t ), null == n ) { if ( !t.d ) return t; n = new r( 1 ), e = r.rounding; } else { if ( n = new r( n ), void 0 !== e && i( e, 0, 8 ), !t.d ) return n.s ? t : n; if ( !n.d ) return n.s && ( n.s = t.s ), n; } return n.d[0] ? ( bn = !1, 4 > e && ( e = [4, 5, 7, 8][e] ), t = Sn( t, n, 0, e, 1 ).times( n ), bn = !0, o( t ) ) : ( n.s = t.s, t = n ), t; }, kn.toNumber = function () { return +this; }, kn.toOctal = function ( n, e ) { return y( this, 8, n, e ); }, kn.toPower = kn.pow = function ( n ) { var i, r, s, u, c, f, a, h = this, l = h.constructor, p = +( n = new l( n ) ); if ( !( h.d && n.d && h.d[0] && n.d[0] ) ) return new l( On( +h, p ) ); if ( h = new l( h ), h.eq( 1 ) ) return h; if ( s = l.precision, c = l.rounding, n.eq( 1 ) ) return o( h, s, c ); if ( i = qn( n.e / Rn ), r = n.d.length - 1, a = i >= r, f = h.s, a ) { if ( ( r = 0 > p ? -p : p ) <= Ln ) return u = d( l, h, r, s ), n.s < 0 ? new l( 1 ).div( u ) : o( u, s, c ); } else if ( 0 > f ) return new l( NaN ); return f = 0 > f && 1 & n.d[Math.max( i, r )] ? -1 : 1, r = On( +h, p ), i = 0 != r && isFinite( r ) ? new l( r + "" ).e : qn( p * ( Math.log( "0." + e( h.d ) ) / Math.LN10 + h.e + 1 ) ), i > l.maxE + 1 || i < l.minE - 1 ? new l( i > 0 ? f / 0 : 0 ) : ( bn = !1, l.rounding = h.s = 1, r = Math.min( 12, ( i + "" ).length ), u = w( n.times( m( h, s + r ) ), s ), u = o( u, s + 5, 1 ), t( u.d, s, c ) && ( i = s + 10, u = o( w( n.times( m( h, i + r ) ), i ), i + 5, 1 ), +e( u.d ).slice( s + 1, s + 15 ) + 1 == 1e14 && ( u = o( u, s + 1, 0 ) ) ), u.s = f, bn = !0, l.rounding = c, o( u, s, c ) ); }, kn.toPrecision = function ( n, e ) { var t, r = this, s = r.constructor; return void 0 === n ? t = u( r, r.e <= s.toExpNeg || r.e >= s.toExpPos ) : ( i( n, 1, gn ), void 0 === e ? e = s.rounding : i( e, 0, 8 ), r = o( new s( r ), n, e ), t = u( r, n <= r.e || r.e <= s.toExpNeg, n ) ), r.isNeg() && !r.isZero() ? "-" + t : t; }, kn.toSignificantDigits = kn.toSD = function ( n, e ) { var t = this, r = t.constructor; return void 0 === n ? ( n = r.precision, e = r.rounding ) : ( i( n, 1, gn ), void 0 === e ? e = r.rounding : i( e, 0, 8 ) ), o( new r( t ), n, e ); }, kn.toString = function () { var n = this, e = n.constructor, i = u( n, n.e <= e.toExpNeg || n.e >= e.toExpPos ); return n.isNeg() && !n.isZero() ? "-" + i : i; }, kn.truncated = kn.trunc = function () { return o( new this.constructor( this ), this.e + 1, 1 ); }, kn.valueOf = kn.toJSON = function () { var n = this, e = n.constructor, i = u( n, n.e <= e.toExpNeg || n.e >= e.toExpPos ); return n.isNeg() ? "-" + i : i; }; var Sn = function () { function n( n, e, i ) { var t, r = 0, s = n.length; for ( n = n.slice(); s--; ) t = n[s] * e + r, n[s] = t % i | 0, r = t / i | 0; return r && n.unshift( r ), n; } function e( n, e, i, t ) { var r, s; if ( i != t ) s = i > t ? 1 : -1; else for ( r = s = 0; i > r; r++ ) if ( n[r] != e[r] ) { s = n[r] > e[r] ? 1 : -1; break; } return s; } function i( n, e, i, t ) { for ( var r = 0; i--; ) n[i] -= r, r = n[i] < e[i] ? 1 : 0, n[i] = r * t + n[i] - e[i]; for ( ; !n[0] && n.length > 1; ) n.shift(); } return function ( t, r, s, u, c, f ) { var a, h, l, d, p, g, w, m, v, N, b, x, E, M, y, q, O, F, A, D, Z = t.constructor, P = t.s == r.s ? 1 : -1, R = t.d, L = r.d; if ( !( R && R[0] && L && L[0] ) ) return new Z( t.s && r.s && ( R ? !L || R[0] != L[0] : L ) ? R && 0 == R[0] || !L ? 0 * P : P / 0 : NaN ); for ( f ? ( p = 1, h = t.e - r.e ) : ( f = Pn, p = Rn, h = qn( t.e / p ) - qn( r.e / p ) ), A = L.length, O = R.length, v = new Z( P ), N = v.d = [], l = 0; L[l] == ( R[l] || 0 ); l++ ); if ( L[l] > ( R[l] || 0 ) && h--, null == s ? ( M = s = Z.precision, u = Z.rounding ) : M = c ? s + ( t.e - r.e ) + 1 : s, 0 > M ) N.push( 1 ), g = !0; else { if ( M = M / p + 2 | 0, l = 0, 1 == A ) { for ( d = 0, L = L[0], M++; ( O > l || d ) && M--; l++ ) y = d * f + ( R[l] || 0 ), N[l] = y / L | 0, d = y % L | 0; g = d || O > l; } else { for ( d = f / ( L[0] + 1 ) | 0, d > 1 && ( L = n( L, d, f ), R = n( R, d, f ), A = L.length, O = R.length ), q = A, b = R.slice( 0, A ), x = b.length; A > x; ) b[x++] = 0; D = L.slice(), D.unshift( 0 ), F = L[0], L[1] >= f / 2 && ++F; do d = 0, a = e( L, b, A, x ), 0 > a ? ( E = b[0], A != x && ( E = E * f + ( b[1] || 0 ) ), d = E / F | 0, d > 1 ? ( d >= f && ( d = f - 1 ), w = n( L, d, f ), m = w.length, x = b.length, a = e( w, b, m, x ), 1 == a && ( d--, i( w, m > A ? D : L, m, f ) ) ) : ( 0 == d && ( a = d = 1 ), w = L.slice() ), m = w.length, x > m && w.unshift( 0 ), i( b, w, x, f ), -1 == a && ( x = b.length, a = e( L, b, A, x ), 1 > a && ( d++, i( b, x > A ? D : L, x, f ) ) ), x = b.length ) : 0 === a && ( d++, b = [0] ), N[l++] = d, a && b[0] ? b[x++] = R[q] || 0 : ( b = [R[q]], x = 1 ); while ( ( q++ < O || void 0 !== b[0] ) && M-- ); g = void 0 !== b[0]; } N[0] || N.shift(); } if ( 1 == p ) v.e = h, hn = g; else { for ( l = 1, d = N[0]; d >= 10; d /= 10 ) l++; v.e = l + h * p - 1, o( v, c ? s + v.e + 1 : s, u, g ); } return v; }; }(); Nn = I( Nn ), mn = new Nn( mn ), vn = new Nn( vn ), Bridge.$Decimal = Nn, "function" == typeof define && define.amd ? define( "decimal.js", function () { return Nn; } ) : "undefined" != typeof module && module.exports ? module.exports = Nn["default"] = Nn.Decimal = Nn : ( n || ( n = "undefined" != typeof self && self && self.self == self ? self : Function( "return this" )() ), ln = n.Decimal, Nn.noConflict = function () { return n.Decimal = ln, Nn; }/*, n.Decimal = Nn*/ ); }( Bridge.global );

  System.Decimal = function ( v, provider, T ) {
    if ( this.constructor !== System.Decimal ) {
      return new System.Decimal( v, provider, T );
    }

    if ( v == null ) {
      v = 0;
    }

    if ( Bridge.isNumber( provider ) ) {
      this.$precision = provider;
      provider = undefined;
    } else {
      this.$precision = 0;
    }

    if ( typeof v === "string" ) {
      provider = provider || System.Globalization.CultureInfo.getCurrentCulture();

      var nfInfo = provider && provider.getFormat( System.Globalization.NumberFormatInfo ),
        dot;

      if ( nfInfo && nfInfo.numberDecimalSeparator !== "." ) {
        v = v.replace( nfInfo.numberDecimalSeparator, "." );
      }

      // Native .NET accepts the sign in postfixed form. Yet, it is documented otherwise.
      // https://docs.microsoft.com/en-us/dotnet/api/system.decimal.parse
      // True at least as with: Microsoft (R) Build Engine version 16.1.76+g14b0a930a7 for .NET Framework
      if ( !/^\s*[+-]?(\d+|\d+\.|\d*\.\d+)((e|E)[+-]?\d+)?\s*$/.test( v ) &&
        !/^\s*(\d+|\d+\.|\d*\.\d+)((e|E)[+-]?\d+)?[+-]\s*$/.test( v ) ) {
        throw new System.FormatException();
      }

      v = v.replace( /\s/g, "" );

      // Move the postfixed - to front, or remove "+" so the underlying
      // decimal handler knows what to do with the string.
      if ( /[+-]$/.test( v ) ) {
        var vlastpos = v.length - 1;
        if ( v.indexOf( "-", vlastpos ) === vlastpos ) {
          v = v.replace( /(.*)(-)$/, "$2$1" );
        } else {
          v = v.substr( 0, vlastpos );
        }
      } else if ( v.lastIndexOf( "+", 0 ) === 0 ) {
        v = v.substr( 1 );
      }

      if ( !this.$precision && ( dot = v.indexOf( "." ) ) >= 0 ) {
        this.$precision = v.length - dot - 1;
      }
    }

    if ( isNaN( v ) || System.Decimal.MaxValue && typeof v === "number" && ( System.Decimal.MinValue.gt( v ) || System.Decimal.MaxValue.lt( v ) ) ) {
      throw new System.OverflowException();
    }

    if ( T && T.precision && typeof v === "number" && Number.isFinite( v ) ) {
      var i = Bridge.Int.trunc( v );
      var length = ( i + "" ).length;
      var p = T.precision - length;
      if ( p < 0 ) {
        p = 0;
      }
      v = v.toFixed( p );
    }

    if ( v instanceof System.Decimal ) {
      this.$precision = v.$precision;
    }

    this.value = System.Decimal.getValue( v );
  };

  System.Decimal.$number = true;
  System.Decimal.$$name = "System.Decimal";
  System.Decimal.prototype.$$name = "System.Decimal";
  System.Decimal.$kind = "struct";
  System.Decimal.prototype.$kind = "struct";
  System.Decimal.$$inherits = [];
  Bridge.Class.addExtend( System.Decimal, [System.IComparable, System.IFormattable, System.IComparable$1( System.Decimal ), System.IEquatable$1( System.Decimal )] );

  System.Decimal.$is = function ( instance ) {
    return instance instanceof System.Decimal;
  };

  System.Decimal.getDefaultValue = function () {
    return new System.Decimal( 0 );
  };

  System.Decimal.getValue = function ( d ) {
    if ( !Bridge.hasValue( d ) ) {
      return this.getDefaultValue();
    }

    if ( d instanceof System.Decimal ) {
      return d.value;
    }

    if ( d instanceof System.Int64 || d instanceof System.UInt64 ) {
      return new Bridge.$Decimal( d.toString() );
    }

    return new Bridge.$Decimal( d );
  };

  System.Decimal.create = function ( d ) {
    if ( !Bridge.hasValue( d ) ) {
      return null;
    }

    if ( d instanceof System.Decimal ) {
      return d;
    }

    return new System.Decimal( d );
  };

  System.Decimal.lift = function ( d ) {
    return d == null ? null : System.Decimal.create( d );
  };

  System.Decimal.prototype.toString = function ( format, provider ) {
    return Bridge.Int.format( this, format || "G", provider );
  };

  System.Decimal.prototype.toFloat = function () {
    return this.value.toNumber();
  };

  System.Decimal.prototype.toJSON = function () {
    return this.value.toNumber();
  };

  System.Decimal.prototype.format = function ( format, provider ) {
    return Bridge.Int.format( this, format, provider );
  };

  System.Decimal.prototype.decimalPlaces = function () {
    return this.value.decimalPlaces();
  };

  System.Decimal.prototype.dividedToIntegerBy = function ( d ) {
    var d = new System.Decimal( this.value.dividedToIntegerBy( System.Decimal.getValue( d ) ), this.$precision );
    d.$precision = Math.max( d.value.decimalPlaces(), this.$precision );
    return d;
  };

  System.Decimal.prototype.exponential = function () {
    return new System.Decimal( this.value.exponential(), this.$precision );
  };

  System.Decimal.prototype.abs = function () {
    return new System.Decimal( this.value.abs(), this.$precision );
  };

  System.Decimal.prototype.floor = function () {
    return new System.Decimal( this.value.floor() );
  };

  System.Decimal.prototype.ceil = function () {
    return new System.Decimal( this.value.ceil() );
  };

  System.Decimal.prototype.trunc = function () {
    return new System.Decimal( this.value.trunc() );
  };

  System.Decimal.round = function ( obj, mode ) {
    obj = System.Decimal.create( obj );

    var old = Bridge.$Decimal.rounding;

    Bridge.$Decimal.rounding = mode;

    var d = new System.Decimal( obj.value.round() );

    Bridge.$Decimal.rounding = old;

    return d;
  };

  System.Decimal.toDecimalPlaces = function ( obj, decimals, mode ) {
    obj = System.Decimal.create( obj );
    var d = new System.Decimal( obj.value.toDecimalPlaces( decimals, mode ) );
    return d;
  };

  System.Decimal.prototype.compareTo = function ( another ) {
    return this.value.comparedTo( System.Decimal.getValue( another ) );
  };

  System.Decimal.prototype.add = function ( another ) {
    var d = new System.Decimal( this.value.plus( System.Decimal.getValue( another ) ) );
    d.$precision = Math.max( d.value.decimalPlaces(), Math.max( another.$precision || 0, this.$precision ) );
    return d;
  };

  System.Decimal.prototype.sub = function ( another ) {
    var d = new System.Decimal( this.value.minus( System.Decimal.getValue( another ) ) );
    d.$precision = Math.max( d.value.decimalPlaces(), Math.max( another.$precision || 0, this.$precision ) );
    return d;
  };

  System.Decimal.prototype.isZero = function () {
    return this.value.isZero;
  };

  System.Decimal.prototype.mul = function ( another ) {
    var d = new System.Decimal( this.value.times( System.Decimal.getValue( another ) ) );
    d.$precision = Math.max( d.value.decimalPlaces(), Math.max( another.$precision || 0, this.$precision ) );
    return d;
  };

  System.Decimal.prototype.div = function ( another ) {
    var d = new System.Decimal( this.value.dividedBy( System.Decimal.getValue( another ) ) );
    d.$precision = Math.max( d.value.decimalPlaces(), Math.max( another.$precision || 0, this.$precision ) );
    return d;
  };

  System.Decimal.prototype.mod = function ( another ) {
    var d = new System.Decimal( this.value.modulo( System.Decimal.getValue( another ) ) );
    d.$precision = Math.max( d.value.decimalPlaces(), Math.max( another.$precision || 0, this.$precision ) );
    return d;
  };

  System.Decimal.prototype.neg = function () {
    return new System.Decimal( this.value.negated(), this.$precision );
  };

  System.Decimal.prototype.inc = function () {
    return new System.Decimal( this.value.plus( System.Decimal.getValue( 1 ) ), this.$precision );
  };

  System.Decimal.prototype.dec = function () {
    return new System.Decimal( this.value.minus( System.Decimal.getValue( 1 ) ), this.$precision );
  };

  System.Decimal.prototype.sign = function () {
    return this.value.isZero() ? 0 : ( this.value.isNegative() ? -1 : 1 );
  };

  System.Decimal.prototype.clone = function () {
    return new System.Decimal( this, this.$precision );
  };

  System.Decimal.prototype.ne = function ( v ) {
    return !!this.compareTo( v );
  };

  System.Decimal.prototype.lt = function ( v ) {
    return this.compareTo( v ) < 0;
  };

  System.Decimal.prototype.lte = function ( v ) {
    return this.compareTo( v ) <= 0;
  };

  System.Decimal.prototype.gt = function ( v ) {
    return this.compareTo( v ) > 0;
  };

  System.Decimal.prototype.gte = function ( v ) {
    return this.compareTo( v ) >= 0;
  };

  System.Decimal.prototype.equals = function ( v ) {
    if ( v instanceof System.Decimal || typeof v === "number" ) {
      return !this.compareTo( v );
    }

    return false;
  };

  System.Decimal.prototype.equalsT = function ( v ) {
    return !this.compareTo( v );
  };

  System.Decimal.prototype.getHashCode = function () {
    var n = ( this.sign() * 397 + this.value.e ) | 0;

    for ( var i = 0; i < this.value.d.length; i++ ) {
      n = ( n * 397 + this.value.d[i] ) | 0;
    }

    return n;
  };

  System.Decimal.toInt = function ( v, tp ) {
    if ( !v ) {
      return null;
    }

    if ( tp ) {
      var str,
        r;

      if ( tp === System.Int64 ) {
        str = v.value.trunc().toString();
        r = new System.Int64( str );

        if ( str !== r.value.toString() ) {
          throw new System.OverflowException();
        }

        return r;
      }

      if ( tp === System.UInt64 ) {
        if ( v.value.isNegative() ) {
          throw new System.OverflowException();
        }

        str = v.value.trunc().toString();
        r = new System.UInt64( str );

        if ( str !== r.value.toString() ) {
          throw new System.OverflowException();
        }

        return r;
      }

      return Bridge.Int.check( Bridge.Int.trunc( v.value.toNumber() ), tp );
    }

    var i = Bridge.Int.trunc( System.Decimal.getValue( v ).toNumber() );

    if ( !Bridge.Int.$is( i ) ) {
      throw new System.OverflowException();
    }

    return i;
  };

  System.Decimal.tryParse = function ( s, provider, v ) {
    try {
      v.v = new System.Decimal( s, provider );

      return true;
    } catch ( e ) {
      v.v = new System.Decimal( 0 );

      return false;
    }
  };

  System.Decimal.toFloat = function ( v ) {
    if ( !v ) {
      return null;
    }

    return System.Decimal.getValue( v ).toNumber();
  };

  System.Decimal.setConfig = function ( config ) {
    Bridge.$Decimal.config( config );
  };

  System.Decimal.min = function () {
    var values = [],
      d, p;

    for ( var i = 0, len = arguments.length; i < len; i++ ) {
      values.push( System.Decimal.getValue( arguments[i] ) );
    }

    d = Bridge.$Decimal.min.apply( Bridge.$Decimal, values );

    for ( var i = 0; i < arguments.length; i++ ) {
      if ( d.eq( values[i] ) ) {
        p = arguments[i].$precision;
      }
    }

    return new System.Decimal( d, p );
  };

  System.Decimal.max = function () {
    var values = [],
      d, p;

    for ( var i = 0, len = arguments.length; i < len; i++ ) {
      values.push( System.Decimal.getValue( arguments[i] ) );
    }

    d = Bridge.$Decimal.max.apply( Bridge.$Decimal, values );

    for ( var i = 0; i < arguments.length; i++ ) {
      if ( d.eq( values[i] ) ) {
        p = arguments[i].$precision;
      }
    }

    return new System.Decimal( d, p );
  };

  System.Decimal.random = function ( dp ) {
    return new System.Decimal( Bridge.$Decimal.random( dp ) );
  };

  System.Decimal.exp = function ( d ) {
    return new System.Decimal( System.Decimal.getValue( d ).exp() );
  };

  System.Decimal.exp = function ( d ) {
    return new System.Decimal( System.Decimal.getValue( d ).exp() );
  };

  System.Decimal.ln = function ( d ) {
    return new System.Decimal( System.Decimal.getValue( d ).ln() );
  };

  System.Decimal.log = function ( d, logBase ) {
    return new System.Decimal( System.Decimal.getValue( d ).log( logBase ) );
  };

  System.Decimal.pow = function ( d, exponent ) {
    return new System.Decimal( System.Decimal.getValue( d ).pow( exponent ) );
  };

  System.Decimal.sqrt = function ( d ) {
    return new System.Decimal( System.Decimal.getValue( d ).sqrt() );
  };

  System.Decimal.prototype.isFinite = function () {
    return this.value.isFinite();
  };

  System.Decimal.prototype.isInteger = function () {
    return this.value.isInteger();
  };

  System.Decimal.prototype.isNaN = function () {
    return this.value.isNaN();
  };

  System.Decimal.prototype.isNegative = function () {
    return this.value.isNegative();
  };

  System.Decimal.prototype.isZero = function () {
    return this.value.isZero();
  };

  System.Decimal.prototype.log = function ( logBase ) {
    var d = new System.Decimal( this.value.log( logBase ) );
    d.$precision = Math.max( d.value.decimalPlaces(), this.$precision );
    return d;
  };

  System.Decimal.prototype.ln = function () {
    var d = new System.Decimal( this.value.ln() );
    d.$precision = Math.max( d.value.decimalPlaces(), this.$precision );
    return d;
  };

  System.Decimal.prototype.precision = function () {
    return this.value.precision();
  };

  System.Decimal.prototype.round = function () {
    var old = Bridge.$Decimal.rounding,
      r;

    Bridge.$Decimal.rounding = 6;
    r = new System.Decimal( this.value.round() );
    Bridge.$Decimal.rounding = old;

    return r;
  };

  System.Decimal.prototype.sqrt = function () {
    var d = new System.Decimal( this.value.sqrt() );
    d.$precision = Math.max( d.value.decimalPlaces(), this.$precision );
    return d;
  };

  System.Decimal.prototype.toDecimalPlaces = function ( dp, rm ) {
    return new System.Decimal( this.value.toDecimalPlaces( dp, rm ) );
  };

  System.Decimal.prototype.toExponential = function ( dp, rm ) {
    return this.value.toExponential( dp, rm );
  };

  System.Decimal.prototype.toFixed = function ( dp, rm ) {
    return this.value.toFixed( dp, rm );
  };

  System.Decimal.prototype.pow = function ( n ) {
    var d = new System.Decimal( this.value.pow( n ) );
    d.$precision = Math.max( d.value.decimalPlaces(), this.$precision );
    return d;
  };

  System.Decimal.prototype.toPrecision = function ( dp, rm ) {
    return this.value.toPrecision( dp, rm );
  };

  System.Decimal.prototype.toSignificantDigits = function ( dp, rm ) {
    var d = new System.Decimal( this.value.toSignificantDigits( dp, rm ) );
    d.$precision = Math.max( d.value.decimalPlaces(), this.$precision );
    return d;
  };

  System.Decimal.prototype.valueOf = function () {
    return this.value.valueOf();
  };

  System.Decimal.prototype._toFormat = function ( dp, rm, f ) {
    var x = this.value;

    if ( !x.isFinite() ) {
      return x.toString();
    }

    var i,
      isNeg = x.isNeg(),
      groupSeparator = f.groupSeparator,
      g1 = +f.groupSize,
      g2 = +f.secondaryGroupSize,
      arr = x.toFixed( dp, rm ).split( "." ),
      intPart = arr[0],
      fractionPart = arr[1],
      intDigits = isNeg ? intPart.slice( 1 ) : intPart,
      len = intDigits.length;

    if ( g2 ) {
      len -= ( i = g1, g1 = g2, g2 = i );
    }

    if ( g1 > 0 && len > 0 ) {
      i = len % g1 || g1;
      intPart = intDigits.substr( 0, i );

      for ( ; i < len; i += g1 ) {
        intPart += groupSeparator + intDigits.substr( i, g1 );
      }

      if ( g2 > 0 ) {
        intPart += groupSeparator + intDigits.slice( i );
      }

      if ( isNeg ) {
        intPart = "-" + intPart;
      }
    }

    return fractionPart
      ? intPart + f.decimalSeparator + ( ( g2 = +f.fractionGroupSize )
        ? fractionPart.replace( new RegExp( "\\d{" + g2 + "}\\B", "g" ),
          "$&" + f.fractionGroupSeparator )
        : fractionPart )
      : intPart;
  };

  System.Decimal.prototype.toFormat = function ( dp, rm, provider ) {
    var config = {
      decimalSeparator: ".",
      groupSeparator: ",",
      groupSize: 3,
      secondaryGroupSize: 0,
      fractionGroupSeparator: "\xA0",
      fractionGroupSize: 0
    },
      d;

    if ( provider && !provider.getFormat ) {
      config = Bridge.merge( config, provider );
      d = this._toFormat( dp, rm, config );
    } else {
      provider = provider || System.Globalization.CultureInfo.getCurrentCulture();

      var nfInfo = provider && provider.getFormat( System.Globalization.NumberFormatInfo );

      if ( nfInfo ) {
        config.decimalSeparator = nfInfo.numberDecimalSeparator;
        config.groupSeparator = nfInfo.numberGroupSeparator;
        config.groupSize = nfInfo.numberGroupSizes[0];
      }

      d = this._toFormat( dp, rm, config );
    }

    return d;
  };

  System.Decimal.prototype.getBytes = function () {
    var s = this.value.s,
      e = this.value.e,
      d = this.value.d,
      bytes = System.Array.init( 23, 0, System.Byte );

    bytes[0] = s & 255;
    bytes[1] = e;

    if ( d && d.length > 0 ) {
      bytes[2] = d.length * 4;

      for ( var i = 0; i < d.length; i++ ) {
        bytes[i * 4 + 3] = d[i] & 255;
        bytes[i * 4 + 4] = ( d[i] >> 8 ) & 255;
        bytes[i * 4 + 5] = ( d[i] >> 16 ) & 255;
        bytes[i * 4 + 6] = ( d[i] >> 24 ) & 255;
      }
    } else {
      bytes[2] = 0;
    }

    return bytes;
  };

  System.Decimal.fromBytes = function ( bytes ) {
    var value = new System.Decimal( 0 ),
      s = Bridge.Int.sxb( bytes[0] & 255 ),
      e = bytes[1],
      ln = bytes[2],
      d = [];

    value.value.s = s;
    value.value.e = e;

    if ( ln > 0 ) {
      for ( var i = 3; i < ( ln + 3 ); ) {
        d.push( bytes[i] | bytes[i + 1] << 8 | bytes[i + 2] << 16 | bytes[i + 3] << 24 );
        i = i + 4;
      }
    }

    value.value.d = d;

    return value;
  };

  Bridge.$Decimal.config( { precision: 29 } );

  System.Decimal.Zero = System.Decimal( 0 );
  System.Decimal.One = System.Decimal( 1 );
  System.Decimal.MinusOne = System.Decimal( -1 );
  System.Decimal.MinValue = System.Decimal( "-79228162514264337593543950335" );
  System.Decimal.MaxValue = System.Decimal( "79228162514264337593543950335" );
  System.Decimal.precision = 29;

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
          $inherits: [System.Array, System.Collections.ICollection, System.ICloneable, System.Collections.Generic.IList$1( t ), System.Collections.Generic.IReadOnlyCollection$1( t )],
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

  // @source ArraySegment.js

  Bridge.define( "System.ArraySegment", {
    $kind: "struct",

    statics: {
      getDefaultValue: function () {
        return new System.ArraySegment();
      }
    },

    ctor: function ( array, offset, count ) {
      this.$initialize();

      if ( arguments.length === 0 ) {
        this.array = null;
        this.offset = 0;
        this.count = 0;

        return;
      }

      if ( array == null ) {
        throw new System.ArgumentNullException.$ctor1( "array" );
      }

      this.array = array;

      if ( Bridge.isNumber( offset ) ) {
        if ( offset < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "offset" );
        }

        this.offset = offset;
      } else {
        this.offset = 0;
      }

      if ( Bridge.isNumber( count ) ) {
        if ( count < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "count" );
        }

        this.count = count;
      } else {
        this.count = array.length;
      }

      if ( array.length - this.offset < this.count ) {
        throw new ArgumentException();
      }
    },

    getArray: function () {
      return this.array;
    },

    getCount: function () {
      return this.count;
    },

    getOffset: function () {
      return this.offset;
    },

    getHashCode: function () {
      var h = Bridge.addHash( [5322976039, this.array, this.count, this.offset] );

      return h;
    },

    equals: function ( o ) {
      if ( !Bridge.is( o, System.ArraySegment ) ) {
        return false;
      }

      return Bridge.equals( this.array, o.array ) && Bridge.equals( this.count, o.count ) && Bridge.equals( this.offset, o.offset );
    },

    $clone: function ( to ) { return this; }
  } );

  // @source Interfaces.js

  Bridge.define( "System.Collections.IEnumerable", {
    $kind: "interface"
  } );
  Bridge.define( "System.Collections.ICollection", {
    inherits: [System.Collections.IEnumerable],
    $kind: "interface"
  } );
  Bridge.define( "System.Collections.IList", {
    inherits: [System.Collections.ICollection],
    $kind: "interface"
  } );
  Bridge.define( "System.Collections.IDictionary", {
    inherits: [System.Collections.ICollection],
    $kind: "interface"
  } );

  Bridge.define( "System.Collections.Generic.IEnumerable$1", function ( T ) {
    return {
      inherits: [System.Collections.IEnumerable],
      $kind: "interface",
      $variance: [1]
    };
  } );

  Bridge.define( "System.Collections.Generic.ICollection$1", function ( T ) {
    return {
      inherits: [System.Collections.Generic.IEnumerable$1( T )],
      $kind: "interface"
    };
  } );

  Bridge.define( "System.Collections.Generic.IEqualityComparer$1", function ( T ) {
    return {
      $kind: "interface",
      $variance: [2]
    };
  } );

  Bridge.define( "System.Collections.Generic.IDictionary$2", function ( TKey, TValue ) {
    return {
      inherits: [System.Collections.Generic.ICollection$1( System.Collections.Generic.KeyValuePair$2( TKey, TValue ) )],
      $kind: "interface"
    };
  } );

  Bridge.define( "System.Collections.Generic.IList$1", function ( T ) {
    return {
      inherits: [System.Collections.Generic.ICollection$1( T )],
      $kind: "interface"
    };
  } );

  Bridge.define( "System.Collections.Generic.ISet$1", function ( T ) {
    return {
      inherits: [System.Collections.Generic.ICollection$1( T )],
      $kind: "interface"
    };
  } );

  Bridge.define( "System.Collections.Generic.IReadOnlyCollection$1", function ( T ) {
    return {
      inherits: [System.Collections.Generic.IEnumerable$1( T )],
      $kind: "interface"
    };
  } );

  Bridge.define( "System.Collections.Generic.IReadOnlyList$1", function ( T ) {
    return {
      inherits: [System.Collections.Generic.IReadOnlyCollection$1( T )],
      $kind: "interface",
      $variance: [1]
    };
  } );

  Bridge.define( "System.Collections.Generic.IReadOnlyDictionary$2", function ( TKey, TValue ) {
    return {
      inherits: [System.Collections.Generic.IReadOnlyCollection$1( System.Collections.Generic.KeyValuePair$2( TKey, TValue ) )],
      $kind: "interface"
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

  // @source KeyValuePair.js

  Bridge.define( "System.Collections.Generic.KeyValuePair$2", function ( TKey, TValue ) {
    return {
      $kind: "struct",
      statics: {
        methods: {
          getDefaultValue: function () { return new ( System.Collections.Generic.KeyValuePair$2( TKey, TValue ) )(); }
        }
      },
      fields: {
        key$1: Bridge.getDefaultValue( TKey ),
        value$1: Bridge.getDefaultValue( TValue )
      },
      props: {
        key: {
          get: function () {
            return this.key$1;
          }
        },
        value: {
          get: function () {
            return this.value$1;
          }
        }
      },
      ctors: {
        $ctor1: function ( key, value ) {
          this.$initialize();
          this.key$1 = key;
          this.value$1 = value;
        },
        ctor: function () {
          this.$initialize();
        }
      },
      methods: {
        toString: function () {
          var s = System.Text.StringBuilderCache.Acquire();
          s.append( String.fromCharCode( 91 ) );
          if ( this.key != null ) {
            s.append( Bridge.toString( this.key ) );
          }
          s.append( ", " );
          if ( this.value != null ) {
            s.append( Bridge.toString( this.value ) );
          }
          s.append( String.fromCharCode( 93 ) );
          return System.Text.StringBuilderCache.GetStringAndRelease( s );
        },
        Deconstruct: function ( key, value ) {
          key.v = this.key;
          value.v = this.value;
        },
        getHashCode: function () {
          var h = Bridge.addHash( [5072499452, this.key$1, this.value$1] );
          return h;
        },
        equals: function ( o ) {
          if ( !Bridge.is( o, System.Collections.Generic.KeyValuePair$2( TKey, TValue ) ) ) {
            return false;
          }
          return Bridge.equals( this.key$1, o.key$1 ) && Bridge.equals( this.value$1, o.value$1 );
        },
        $clone: function ( to ) { return this; }
      }
    };
  } );

  // @source IEnumerator.js

  Bridge.define( "System.Collections.IEnumerator", {
    $kind: "interface"
  } );

  // @source IComparer.js

  Bridge.define( "System.Collections.IComparer", {
    $kind: "interface"
  } );

  // @source IDictionaryEnumerator.js

  Bridge.define( "System.Collections.IDictionaryEnumerator", {
    inherits: [System.Collections.IEnumerator],
    $kind: "interface"
  } );

  // @source IEqualityComparer.js

  Bridge.define( "System.Collections.IEqualityComparer", {
    $kind: "interface"
  } );

  // @source IStructuralComparable.js

  Bridge.define( "System.Collections.IStructuralComparable", {
    $kind: "interface"
  } );

  // @source IStructuralEquatable.js

  Bridge.define( "System.Collections.IStructuralEquatable", {
    $kind: "interface"
  } );

  // @source IEnumerator.js

  Bridge.definei( "System.Collections.Generic.IEnumerator$1", function ( T ) {
    return {
      inherits: [System.IDisposable, System.Collections.IEnumerator],
      $kind: "interface",
      $variance: [1]
    };
  } );

  // @source IComparer.js

  Bridge.definei( "System.Collections.Generic.IComparer$1", function ( T ) {
    return {
      $kind: "interface",
      $variance: [2]
    };
  } );

  // @source Enumerator.js

  Bridge.define( "System.Collections.Generic.LinkedList$1.Enumerator", function ( T ) {
    return {
      inherits: [System.Collections.Generic.IEnumerator$1( T ), System.Collections.IEnumerator],
      $kind: "nested struct",
      statics: {
        fields: {
          LinkedListName: null,
          CurrentValueName: null,
          VersionName: null,
          IndexName: null
        },
        ctors: {
          init: function () {
            this.LinkedListName = "LinkedList";
            this.CurrentValueName = "Current";
            this.VersionName = "Version";
            this.IndexName = "Index";
          }
        },
        methods: {
          getDefaultValue: function () { return new ( System.Collections.Generic.LinkedList$1.Enumerator( T ) )(); }
        }
      },
      fields: {
        list: null,
        node: null,
        version: 0,
        current: Bridge.getDefaultValue( T ),
        index: 0
      },
      props: {
        Current: {
          get: function () {
            return this.current;
          }
        },
        System$Collections$IEnumerator$Current: {
          get: function () {
            if ( this.index === 0 || ( this.index === ( ( this.list.Count + 1 ) | 0 ) ) ) {
              System.ThrowHelper.ThrowInvalidOperationException( System.ExceptionResource.InvalidOperation_EnumOpCantHappen );
            }

            return this.current;
          }
        }
      },
      alias: [
        "Current", ["System$Collections$Generic$IEnumerator$1$" + Bridge.getTypeAlias( T ) + "$Current$1", "System$Collections$Generic$IEnumerator$1$Current$1"],
        "moveNext", "System$Collections$IEnumerator$moveNext",
        "Dispose", "System$IDisposable$Dispose"
      ],
      ctors: {
        $ctor1: function ( list ) {
          this.$initialize();
          this.list = list;
          this.version = list.version;
          this.node = list.head;
          this.current = Bridge.getDefaultValue( T );
          this.index = 0;
        },
        ctor: function () {
          this.$initialize();
        }
      },
      methods: {
        moveNext: function () {
          if ( this.version !== this.list.version ) {
            throw new System.InvalidOperationException.ctor();
          }

          if ( this.node == null ) {
            this.index = ( this.list.Count + 1 ) | 0;
            return false;
          }

          this.index = ( this.index + 1 ) | 0;
          this.current = this.node.item;
          this.node = this.node.next;
          if ( Bridge.referenceEquals( this.node, this.list.head ) ) {
            this.node = null;
          }
          return true;
        },
        System$Collections$IEnumerator$reset: function () {
          if ( this.version !== this.list.version ) {
            throw new System.InvalidOperationException.ctor();
          }

          this.current = Bridge.getDefaultValue( T );
          this.node = this.list.head;
          this.index = 0;
        },
        Dispose: function () { },
        getHashCode: function () {
          var h = Bridge.addHash( [3788985113, this.list, this.node, this.version, this.current, this.index] );
          return h;
        },
        equals: function ( o ) {
          if ( !Bridge.is( o, System.Collections.Generic.LinkedList$1.Enumerator( T ) ) ) {
            return false;
          }
          return Bridge.equals( this.list, o.list ) && Bridge.equals( this.node, o.node ) && Bridge.equals( this.version, o.version ) && Bridge.equals( this.current, o.current ) && Bridge.equals( this.index, o.index );
        },
        $clone: function ( to ) {
          var s = to || new ( System.Collections.Generic.LinkedList$1.Enumerator( T ) )();
          s.list = this.list;
          s.node = this.node;
          s.version = this.version;
          s.current = this.current;
          s.index = this.index;
          return s;
        }
      }
    };
  } );

  // @source TreeRotation.js

  Bridge.define( "System.Collections.Generic.TreeRotation", {
    $kind: "enum",
    statics: {
      fields: {
        LeftRotation: 1,
        RightRotation: 2,
        RightLeftRotation: 3,
        LeftRightRotation: 4
      }
    }
  } );

  // @source Dictionary.js

  Bridge.define( "System.Collections.Generic.Dictionary$2", function ( TKey, TValue ) {
    return {
      inherits: [System.Collections.Generic.IDictionary$2( TKey, TValue ), System.Collections.IDictionary, System.Collections.Generic.IReadOnlyDictionary$2( TKey, TValue )],
      statics: {
        fields: {
          VersionName: null,
          HashSizeName: null,
          KeyValuePairsName: null,
          ComparerName: null
        },
        ctors: {
          init: function () {
            this.VersionName = "Version";
            this.HashSizeName = "HashSize";
            this.KeyValuePairsName = "KeyValuePairs";
            this.ComparerName = "Comparer";
          }
        },
        methods: {
          IsCompatibleKey: function ( key ) {
            if ( key == null ) {
              System.ThrowHelper.ThrowArgumentNullException( System.ExceptionArgument.key );
            }
            return ( Bridge.is( key, TKey ) );
          }
        }
      },
      fields: {
        buckets: null,
        simpleBuckets: null,
        entries: null,
        count: 0,
        version: 0,
        freeList: 0,
        freeCount: 0,
        comparer: null,
        keys: null,
        values: null,
        isSimpleKey: false
      },
      props: {
        Comparer: {
          get: function () {
            return this.comparer;
          }
        },
        Count: {
          get: function () {
            return ( ( this.count - this.freeCount ) | 0 );
          }
        },
        Keys: {
          get: function () {
            if ( this.keys == null ) {
              this.keys = new ( System.Collections.Generic.Dictionary$2.KeyCollection( TKey, TValue ) )( this );
            }
            return this.keys;
          }
        },
        System$Collections$Generic$IDictionary$2$Keys: {
          get: function () {
            if ( this.keys == null ) {
              this.keys = new ( System.Collections.Generic.Dictionary$2.KeyCollection( TKey, TValue ) )( this );
            }
            return this.keys;
          }
        },
        System$Collections$Generic$IReadOnlyDictionary$2$Keys: {
          get: function () {
            if ( this.keys == null ) {
              this.keys = new ( System.Collections.Generic.Dictionary$2.KeyCollection( TKey, TValue ) )( this );
            }
            return this.keys;
          }
        },
        Values: {
          get: function () {
            if ( this.values == null ) {
              this.values = new ( System.Collections.Generic.Dictionary$2.ValueCollection( TKey, TValue ) )( this );
            }
            return this.values;
          }
        },
        System$Collections$Generic$IDictionary$2$Values: {
          get: function () {
            if ( this.values == null ) {
              this.values = new ( System.Collections.Generic.Dictionary$2.ValueCollection( TKey, TValue ) )( this );
            }
            return this.values;
          }
        },
        System$Collections$Generic$IReadOnlyDictionary$2$Values: {
          get: function () {
            if ( this.values == null ) {
              this.values = new ( System.Collections.Generic.Dictionary$2.ValueCollection( TKey, TValue ) )( this );
            }
            return this.values;
          }
        },
        System$Collections$Generic$ICollection$1$IsReadOnly: {
          get: function () {
            return false;
          }
        },
        System$Collections$ICollection$IsSynchronized: {
          get: function () {
            return false;
          }
        },
        System$Collections$ICollection$SyncRoot: {
          get: function () {
            return null;
          }
        },
        System$Collections$IDictionary$IsFixedSize: {
          get: function () {
            return false;
          }
        },
        System$Collections$IDictionary$IsReadOnly: {
          get: function () {
            return false;
          }
        },
        System$Collections$IDictionary$Keys: {
          get: function () {
            return Bridge.cast( this.Keys, System.Collections.ICollection );
          }
        },
        System$Collections$IDictionary$Values: {
          get: function () {
            return Bridge.cast( this.Values, System.Collections.ICollection );
          }
        }
      },
      alias: [
        "Count", ["System$Collections$Generic$IReadOnlyCollection$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$Count", "System$Collections$Generic$IReadOnlyCollection$1$Count"],
        "Count", "System$Collections$ICollection$Count",
        "Count", "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$Count",
        "System$Collections$Generic$IDictionary$2$Keys", "System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$Keys",
        "System$Collections$Generic$IReadOnlyDictionary$2$Keys", "System$Collections$Generic$IReadOnlyDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$Keys",
        "System$Collections$Generic$IDictionary$2$Values", "System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$Values",
        "System$Collections$Generic$IReadOnlyDictionary$2$Values", "System$Collections$Generic$IReadOnlyDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$Values",
        "getItem", "System$Collections$Generic$IReadOnlyDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$getItem",
        "setItem", "System$Collections$Generic$IReadOnlyDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$setItem",
        "getItem", "System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$getItem",
        "setItem", "System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$setItem",
        "add", "System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$add",
        "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$add", "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$add",
        "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$contains", "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$contains",
        "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$remove", "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$remove",
        "clear", "System$Collections$IDictionary$clear",
        "clear", "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$clear",
        "containsKey", "System$Collections$Generic$IReadOnlyDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$containsKey",
        "containsKey", "System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$containsKey",
        "System$Collections$Generic$IEnumerable$1$System$Collections$Generic$KeyValuePair$2$GetEnumerator", "System$Collections$Generic$IEnumerable$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$GetEnumerator",
        "remove", "System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$remove",
        "tryGetValue", "System$Collections$Generic$IReadOnlyDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$tryGetValue",
        "tryGetValue", "System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$tryGetValue",
        "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$IsReadOnly", "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$IsReadOnly",
        "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$copyTo", "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$copyTo"
      ],
      ctors: {
        ctor: function () {
          System.Collections.Generic.Dictionary$2( TKey, TValue ).$ctor5.call( this, 0, null );
        },
        $ctor4: function ( capacity ) {
          System.Collections.Generic.Dictionary$2( TKey, TValue ).$ctor5.call( this, capacity, null );
        },
        $ctor3: function ( comparer ) {
          System.Collections.Generic.Dictionary$2( TKey, TValue ).$ctor5.call( this, 0, comparer );
        },
        $ctor5: function ( capacity, comparer ) {
          this.$initialize();
          if ( capacity < 0 ) {
            System.ThrowHelper.ThrowArgumentOutOfRangeException$1( System.ExceptionArgument.capacity );
          }
          if ( capacity > 0 ) {
            this.Initialize( capacity );
          }
          this.comparer = comparer || System.Collections.Generic.EqualityComparer$1( TKey ).def;

          this.isSimpleKey = ( ( Bridge.referenceEquals( TKey, System.String ) ) || ( TKey.$number === true && !Bridge.referenceEquals( TKey, System.Int64 ) && !Bridge.referenceEquals( TKey, System.UInt64 ) ) || ( Bridge.referenceEquals( TKey, System.Char ) ) ) && ( Bridge.referenceEquals( this.comparer, System.Collections.Generic.EqualityComparer$1( TKey ).def ) );
        },
        $ctor1: function ( dictionary ) {
          System.Collections.Generic.Dictionary$2( TKey, TValue ).$ctor2.call( this, dictionary, null );
        },
        $ctor2: function ( dictionary, comparer ) {
          var $t;
          System.Collections.Generic.Dictionary$2( TKey, TValue ).$ctor5.call( this, dictionary != null ? System.Array.getCount( dictionary, System.Collections.Generic.KeyValuePair$2( TKey, TValue ) ) : 0, comparer );

          if ( dictionary == null ) {
            System.ThrowHelper.ThrowArgumentNullException( System.ExceptionArgument.dictionary );
          }

          $t = Bridge.getEnumerator( dictionary, System.Collections.Generic.KeyValuePair$2( TKey, TValue ) );
          try {
            while ( $t.moveNext() ) {
              var pair = $t.Current;
              this.add( pair.key, pair.value );
            }
          } finally {
            if ( Bridge.is( $t, System.IDisposable ) ) {
              $t.System$IDisposable$Dispose();
            }
          }
        }
      },
      methods: {
        getItem: function ( key ) {
          var i = this.FindEntry( key );
          if ( i >= 0 ) {
            return this.entries[System.Array.index( i, this.entries )].value;
          }
          throw new System.Collections.Generic.KeyNotFoundException.ctor();
        },
        setItem: function ( key, value ) {
          this.Insert( key, value, false );
        },
        System$Collections$IDictionary$getItem: function ( key ) {
          if ( System.Collections.Generic.Dictionary$2( TKey, TValue ).IsCompatibleKey( key ) ) {
            var i = this.FindEntry( Bridge.cast( Bridge.unbox( key, TKey ), TKey ) );
            if ( i >= 0 ) {
              return this.entries[System.Array.index( i, this.entries )].value;
            }
          }
          return null;
        },
        System$Collections$IDictionary$setItem: function ( key, value ) {
          if ( key == null ) {
            System.ThrowHelper.ThrowArgumentNullException( System.ExceptionArgument.key );
          }
          System.ThrowHelper.IfNullAndNullsAreIllegalThenThrow( TValue, value, System.ExceptionArgument.value );

          try {
            var tempKey = Bridge.cast( Bridge.unbox( key, TKey ), TKey );
            try {
              this.setItem( tempKey, Bridge.cast( Bridge.unbox( value, TValue ), TValue ) );
            } catch ( $e1 ) {
              $e1 = System.Exception.create( $e1 );
              if ( Bridge.is( $e1, System.InvalidCastException ) ) {
                System.ThrowHelper.ThrowWrongValueTypeArgumentException( System.Object, value, TValue );
              } else {
                throw $e1;
              }
            }
          } catch ( $e2 ) {
            $e2 = System.Exception.create( $e2 );
            if ( Bridge.is( $e2, System.InvalidCastException ) ) {
              System.ThrowHelper.ThrowWrongKeyTypeArgumentException( System.Object, key, TKey );
            } else {
              throw $e2;
            }
          }
        },
        add: function ( key, value ) {
          this.Insert( key, value, true );
        },
        System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$add: function ( keyValuePair ) {
          this.add( keyValuePair.key, keyValuePair.value );
        },
        System$Collections$IDictionary$add: function ( key, value ) {
          if ( key == null ) {
            System.ThrowHelper.ThrowArgumentNullException( System.ExceptionArgument.key );
          }
          System.ThrowHelper.IfNullAndNullsAreIllegalThenThrow( TValue, value, System.ExceptionArgument.value );

          try {
            var tempKey = Bridge.cast( Bridge.unbox( key, TKey ), TKey );

            try {
              this.add( tempKey, Bridge.cast( Bridge.unbox( value, TValue ), TValue ) );
            } catch ( $e1 ) {
              $e1 = System.Exception.create( $e1 );
              if ( Bridge.is( $e1, System.InvalidCastException ) ) {
                System.ThrowHelper.ThrowWrongValueTypeArgumentException( System.Object, value, TValue );
              } else {
                throw $e1;
              }
            }
          } catch ( $e2 ) {
            $e2 = System.Exception.create( $e2 );
            if ( Bridge.is( $e2, System.InvalidCastException ) ) {
              System.ThrowHelper.ThrowWrongKeyTypeArgumentException( System.Object, key, TKey );
            } else {
              throw $e2;
            }
          }
        },
        System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$contains: function ( keyValuePair ) {
          var i = this.FindEntry( keyValuePair.key );
          if ( i >= 0 && System.Collections.Generic.EqualityComparer$1( TValue ).def.equals2( this.entries[System.Array.index( i, this.entries )].value, keyValuePair.value ) ) {
            return true;
          }
          return false;
        },
        System$Collections$IDictionary$contains: function ( key ) {
          if ( System.Collections.Generic.Dictionary$2( TKey, TValue ).IsCompatibleKey( key ) ) {
            return this.containsKey( Bridge.cast( Bridge.unbox( key, TKey ), TKey ) );
          }

          return false;
        },
        System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$remove: function ( keyValuePair ) {
          var i = this.FindEntry( keyValuePair.key );
          if ( i >= 0 && System.Collections.Generic.EqualityComparer$1( TValue ).def.equals2( this.entries[System.Array.index( i, this.entries )].value, keyValuePair.value ) ) {
            this.remove( keyValuePair.key );
            return true;
          }
          return false;
        },
        remove: function ( key ) {
          if ( key == null ) {
            System.ThrowHelper.ThrowArgumentNullException( System.ExceptionArgument.key );
          }

          if ( this.isSimpleKey ) {
            if ( this.simpleBuckets != null ) {
              if ( this.simpleBuckets.hasOwnProperty( key ) ) {
                var i = this.simpleBuckets[key];
                delete this.simpleBuckets[key];
                this.entries[System.Array.index( i, this.entries )].hashCode = -1;
                this.entries[System.Array.index( i, this.entries )].next = this.freeList;
                this.entries[System.Array.index( i, this.entries )].key = Bridge.getDefaultValue( TKey );
                this.entries[System.Array.index( i, this.entries )].value = Bridge.getDefaultValue( TValue );
                this.freeList = i;
                this.freeCount = ( this.freeCount + 1 ) | 0;
                this.version = ( this.version + 1 ) | 0;
                return true;
              }
            }
          } else if ( this.buckets != null ) {
            var hashCode = this.comparer[Bridge.geti( this.comparer, "System$Collections$Generic$IEqualityComparer$1$" + Bridge.getTypeAlias( TKey ) + "$getHashCode2", "System$Collections$Generic$IEqualityComparer$1$getHashCode2" )]( key ) & 2147483647;
            var bucket = hashCode % this.buckets.length;
            var last = -1;
            for ( var i1 = this.buckets[System.Array.index( bucket, this.buckets )]; i1 >= 0; last = i1, i1 = this.entries[System.Array.index( i1, this.entries )].next ) {
              if ( this.entries[System.Array.index( i1, this.entries )].hashCode === hashCode && this.comparer[Bridge.geti( this.comparer, "System$Collections$Generic$IEqualityComparer$1$" + Bridge.getTypeAlias( TKey ) + "$equals2", "System$Collections$Generic$IEqualityComparer$1$equals2" )]( this.entries[System.Array.index( i1, this.entries )].key, key ) ) {
                if ( last < 0 ) {
                  this.buckets[System.Array.index( bucket, this.buckets )] = this.entries[System.Array.index( i1, this.entries )].next;
                } else {
                  this.entries[System.Array.index( last, this.entries )].next = this.entries[System.Array.index( i1, this.entries )].next;
                }
                this.entries[System.Array.index( i1, this.entries )].hashCode = -1;
                this.entries[System.Array.index( i1, this.entries )].next = this.freeList;
                this.entries[System.Array.index( i1, this.entries )].key = Bridge.getDefaultValue( TKey );
                this.entries[System.Array.index( i1, this.entries )].value = Bridge.getDefaultValue( TValue );
                this.freeList = i1;
                this.freeCount = ( this.freeCount + 1 ) | 0;
                this.version = ( this.version + 1 ) | 0;
                return true;
              }
            }
          }
          return false;
        },
        System$Collections$IDictionary$remove: function ( key ) {
          if ( System.Collections.Generic.Dictionary$2( TKey, TValue ).IsCompatibleKey( key ) ) {
            this.remove( Bridge.cast( Bridge.unbox( key, TKey ), TKey ) );
          }
        },
        clear: function () {
          if ( this.count > 0 ) {
            for ( var i = 0; i < this.buckets.length; i = ( i + 1 ) | 0 ) {
              this.buckets[System.Array.index( i, this.buckets )] = -1;
            }
            if ( this.isSimpleKey ) {
              this.simpleBuckets = {};
            }
            System.Array.fill( this.entries, function () {
              return Bridge.getDefaultValue( System.Collections.Generic.Dictionary$2.Entry( TKey, TValue ) );
            }, 0, this.count );
            this.freeList = -1;
            this.count = 0;
            this.freeCount = 0;
            this.version = ( this.version + 1 ) | 0;
          }
        },
        containsKey: function ( key ) {
          return this.FindEntry( key ) >= 0;
        },
        ContainsValue: function ( value ) {
          if ( value == null ) {
            for ( var i = 0; i < this.count; i = ( i + 1 ) | 0 ) {
              if ( this.entries[System.Array.index( i, this.entries )].hashCode >= 0 && this.entries[System.Array.index( i, this.entries )].value == null ) {
                return true;
              }
            }
          } else {
            var c = System.Collections.Generic.EqualityComparer$1( TValue ).def;
            for ( var i1 = 0; i1 < this.count; i1 = ( i1 + 1 ) | 0 ) {
              if ( this.entries[System.Array.index( i1, this.entries )].hashCode >= 0 && c.equals2( this.entries[System.Array.index( i1, this.entries )].value, value ) ) {
                return true;
              }
            }
          }
          return false;
        },
        CopyTo: function ( array, index ) {
          if ( array == null ) {
            System.ThrowHelper.ThrowArgumentNullException( System.ExceptionArgument.array );
          }

          if ( index < 0 || index > array.length ) {
            System.ThrowHelper.ThrowArgumentOutOfRangeException$2( System.ExceptionArgument.index, System.ExceptionResource.ArgumentOutOfRange_NeedNonNegNum );
          }

          if ( ( ( array.length - index ) | 0 ) < this.Count ) {
            System.ThrowHelper.ThrowArgumentException( System.ExceptionResource.Arg_ArrayPlusOffTooSmall );
          }

          var count = this.count;
          var entries = this.entries;
          for ( var i = 0; i < count; i = ( i + 1 ) | 0 ) {
            if ( entries[System.Array.index( i, entries )].hashCode >= 0 ) {
              array[System.Array.index( Bridge.identity( index, ( ( index = ( index + 1 ) | 0 ) ) ), array )] = new ( System.Collections.Generic.KeyValuePair$2( TKey, TValue ) ).$ctor1( entries[System.Array.index( i, entries )].key, entries[System.Array.index( i, entries )].value );
            }
          }
        },
        System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$copyTo: function ( array, index ) {
          this.CopyTo( array, index );
        },
        System$Collections$ICollection$copyTo: function ( array, index ) {
          if ( array == null ) {
            System.ThrowHelper.ThrowArgumentNullException( System.ExceptionArgument.array );
          }

          if ( System.Array.getRank( array ) !== 1 ) {
            System.ThrowHelper.ThrowArgumentException( System.ExceptionResource.Arg_RankMultiDimNotSupported );
          }

          if ( System.Array.getLower( array, 0 ) !== 0 ) {
            System.ThrowHelper.ThrowArgumentException( System.ExceptionResource.Arg_NonZeroLowerBound );
          }

          if ( index < 0 || index > array.length ) {
            System.ThrowHelper.ThrowArgumentOutOfRangeException$2( System.ExceptionArgument.index, System.ExceptionResource.ArgumentOutOfRange_NeedNonNegNum );
          }

          if ( ( ( array.length - index ) | 0 ) < this.Count ) {
            System.ThrowHelper.ThrowArgumentException( System.ExceptionResource.Arg_ArrayPlusOffTooSmall );
          }

          var pairs = Bridge.as( array, System.Array.type( System.Collections.Generic.KeyValuePair$2( TKey, TValue ) ) );
          if ( pairs != null ) {
            this.CopyTo( pairs, index );
          } else if ( Bridge.is( array, System.Array.type( System.Collections.DictionaryEntry ) ) ) {
            var dictEntryArray = Bridge.as( array, System.Array.type( System.Collections.DictionaryEntry ) );
            var entries = this.entries;
            for ( var i = 0; i < this.count; i = ( i + 1 ) | 0 ) {
              if ( entries[System.Array.index( i, entries )].hashCode >= 0 ) {
                dictEntryArray[System.Array.index( Bridge.identity( index, ( ( index = ( index + 1 ) | 0 ) ) ), dictEntryArray )] = new System.Collections.DictionaryEntry.$ctor1( entries[System.Array.index( i, entries )].key, entries[System.Array.index( i, entries )].value );
              }
            }
          } else {
            var objects = Bridge.as( array, System.Array.type( System.Object ) );
            if ( objects == null ) {
              System.ThrowHelper.ThrowArgumentException( System.ExceptionResource.Argument_InvalidArrayType );
            }

            try {
              var count = this.count;
              var entries1 = this.entries;
              for ( var i1 = 0; i1 < count; i1 = ( i1 + 1 ) | 0 ) {
                if ( entries1[System.Array.index( i1, entries1 )].hashCode >= 0 ) {
                  objects[System.Array.index( Bridge.identity( index, ( ( index = ( index + 1 ) | 0 ) ) ), objects )] = new ( System.Collections.Generic.KeyValuePair$2( TKey, TValue ) ).$ctor1( entries1[System.Array.index( i1, entries1 )].key, entries1[System.Array.index( i1, entries1 )].value );
                }
              }
            } catch ( $e1 ) {
              $e1 = System.Exception.create( $e1 );
              if ( Bridge.is( $e1, System.ArrayTypeMismatchException ) ) {
                System.ThrowHelper.ThrowArgumentException( System.ExceptionResource.Argument_InvalidArrayType );
              } else {
                throw $e1;
              }
            }
          }
        },
        GetEnumerator: function () {
          return new ( System.Collections.Generic.Dictionary$2.Enumerator( TKey, TValue ) ).$ctor1( this, System.Collections.Generic.Dictionary$2.Enumerator( TKey, TValue ).KeyValuePair );
        },
        System$Collections$Generic$IEnumerable$1$System$Collections$Generic$KeyValuePair$2$GetEnumerator: function () {
          return new ( System.Collections.Generic.Dictionary$2.Enumerator( TKey, TValue ) ).$ctor1( this, System.Collections.Generic.Dictionary$2.Enumerator( TKey, TValue ).KeyValuePair ).$clone();
        },
        System$Collections$IEnumerable$GetEnumerator: function () {
          return new ( System.Collections.Generic.Dictionary$2.Enumerator( TKey, TValue ) ).$ctor1( this, System.Collections.Generic.Dictionary$2.Enumerator( TKey, TValue ).KeyValuePair ).$clone();
        },
        System$Collections$IDictionary$GetEnumerator: function () {
          return new ( System.Collections.Generic.Dictionary$2.Enumerator( TKey, TValue ) ).$ctor1( this, System.Collections.Generic.Dictionary$2.Enumerator( TKey, TValue ).DictEntry ).$clone();
        },
        FindEntry: function ( key ) {
          if ( key == null ) {
            System.ThrowHelper.ThrowArgumentNullException( System.ExceptionArgument.key );
          }

          if ( this.isSimpleKey ) {
            if ( this.simpleBuckets != null && this.simpleBuckets.hasOwnProperty( key ) ) {
              return this.simpleBuckets[key];
            }
          } else if ( this.buckets != null ) {
            var hashCode = this.comparer[Bridge.geti( this.comparer, "System$Collections$Generic$IEqualityComparer$1$" + Bridge.getTypeAlias( TKey ) + "$getHashCode2", "System$Collections$Generic$IEqualityComparer$1$getHashCode2" )]( key ) & 2147483647;
            for ( var i = this.buckets[System.Array.index( hashCode % this.buckets.length, this.buckets )]; i >= 0; i = this.entries[System.Array.index( i, this.entries )].next ) {
              if ( this.entries[System.Array.index( i, this.entries )].hashCode === hashCode && this.comparer[Bridge.geti( this.comparer, "System$Collections$Generic$IEqualityComparer$1$" + Bridge.getTypeAlias( TKey ) + "$equals2", "System$Collections$Generic$IEqualityComparer$1$equals2" )]( this.entries[System.Array.index( i, this.entries )].key, key ) ) {
                return i;
              }
            }
          }
          return -1;
        },
        Initialize: function ( capacity ) {
          var size = System.Collections.HashHelpers.GetPrime( capacity );
          this.buckets = System.Array.init( size, 0, System.Int32 );
          for ( var i = 0; i < this.buckets.length; i = ( i + 1 ) | 0 ) {
            this.buckets[System.Array.index( i, this.buckets )] = -1;
          }
          this.entries = System.Array.init( size, function () {
            return new ( System.Collections.Generic.Dictionary$2.Entry( TKey, TValue ) )();
          }, System.Collections.Generic.Dictionary$2.Entry( TKey, TValue ) );
          this.freeList = -1;
          this.simpleBuckets = {};
        },
        Insert: function ( key, value, add ) {

          if ( key == null ) {
            System.ThrowHelper.ThrowArgumentNullException( System.ExceptionArgument.key );
          }

          if ( this.buckets == null ) {
            this.Initialize( 0 );
          }

          if ( this.isSimpleKey ) {
            if ( this.simpleBuckets.hasOwnProperty( key ) ) {
              if ( add ) {
                System.ThrowHelper.ThrowArgumentException( System.ExceptionResource.Argument_AddingDuplicate );
              }

              this.entries[System.Array.index( this.simpleBuckets[key], this.entries )].value = value;
              this.version = ( this.version + 1 ) | 0;
              return;
            }

            var simpleIndex;
            if ( this.freeCount > 0 ) {
              simpleIndex = this.freeList;
              this.freeList = this.entries[System.Array.index( simpleIndex, this.entries )].next;
              this.freeCount = ( this.freeCount - 1 ) | 0;
            } else {
              if ( this.count === this.entries.length ) {
                this.Resize();
              }
              simpleIndex = this.count;
              this.count = ( this.count + 1 ) | 0;
            }

            this.entries[System.Array.index( simpleIndex, this.entries )].hashCode = 1;
            this.entries[System.Array.index( simpleIndex, this.entries )].next = -1;
            this.entries[System.Array.index( simpleIndex, this.entries )].key = key;
            this.entries[System.Array.index( simpleIndex, this.entries )].value = value;

            this.simpleBuckets[key] = simpleIndex;
            this.version = ( this.version + 1 ) | 0;

            return;
          }

          var hashCode = this.comparer[Bridge.geti( this.comparer, "System$Collections$Generic$IEqualityComparer$1$" + Bridge.getTypeAlias( TKey ) + "$getHashCode2", "System$Collections$Generic$IEqualityComparer$1$getHashCode2" )]( key ) & 2147483647;
          var targetBucket = hashCode % this.buckets.length;

          for ( var i = this.buckets[System.Array.index( targetBucket, this.buckets )]; i >= 0; i = this.entries[System.Array.index( i, this.entries )].next ) {
            if ( this.entries[System.Array.index( i, this.entries )].hashCode === hashCode && this.comparer[Bridge.geti( this.comparer, "System$Collections$Generic$IEqualityComparer$1$" + Bridge.getTypeAlias( TKey ) + "$equals2", "System$Collections$Generic$IEqualityComparer$1$equals2" )]( this.entries[System.Array.index( i, this.entries )].key, key ) ) {
              if ( add ) {
                System.ThrowHelper.ThrowArgumentException( System.ExceptionResource.Argument_AddingDuplicate );
              }
              this.entries[System.Array.index( i, this.entries )].value = value;
              this.version = ( this.version + 1 ) | 0;
              return;
            }
          }
          var index;
          if ( this.freeCount > 0 ) {
            index = this.freeList;
            this.freeList = this.entries[System.Array.index( index, this.entries )].next;
            this.freeCount = ( this.freeCount - 1 ) | 0;
          } else {
            if ( this.count === this.entries.length ) {
              this.Resize();
              targetBucket = hashCode % this.buckets.length;
            }
            index = this.count;
            this.count = ( this.count + 1 ) | 0;
          }

          this.entries[System.Array.index( index, this.entries )].hashCode = hashCode;
          this.entries[System.Array.index( index, this.entries )].next = this.buckets[System.Array.index( targetBucket, this.buckets )];
          this.entries[System.Array.index( index, this.entries )].key = key;
          this.entries[System.Array.index( index, this.entries )].value = value;
          this.buckets[System.Array.index( targetBucket, this.buckets )] = index;
          this.version = ( this.version + 1 ) | 0;
        },
        Resize: function () {
          this.Resize$1( System.Collections.HashHelpers.ExpandPrime( this.count ), false );
        },
        Resize$1: function ( newSize, forceNewHashCodes ) {
          var newBuckets = System.Array.init( newSize, 0, System.Int32 );
          for ( var i = 0; i < newBuckets.length; i = ( i + 1 ) | 0 ) {
            newBuckets[System.Array.index( i, newBuckets )] = -1;
          }
          if ( this.isSimpleKey ) {
            this.simpleBuckets = {};
          }
          var newEntries = System.Array.init( newSize, function () {
            return new ( System.Collections.Generic.Dictionary$2.Entry( TKey, TValue ) )();
          }, System.Collections.Generic.Dictionary$2.Entry( TKey, TValue ) );
          System.Array.copy( this.entries, 0, newEntries, 0, this.count );
          if ( forceNewHashCodes ) {
            for ( var i1 = 0; i1 < this.count; i1 = ( i1 + 1 ) | 0 ) {
              if ( newEntries[System.Array.index( i1, newEntries )].hashCode !== -1 ) {
                newEntries[System.Array.index( i1, newEntries )].hashCode = ( this.comparer[Bridge.geti( this.comparer, "System$Collections$Generic$IEqualityComparer$1$" + Bridge.getTypeAlias( TKey ) + "$getHashCode2", "System$Collections$Generic$IEqualityComparer$1$getHashCode2" )]( newEntries[System.Array.index( i1, newEntries )].key ) & 2147483647 );
              }
            }
          }
          for ( var i2 = 0; i2 < this.count; i2 = ( i2 + 1 ) | 0 ) {
            if ( newEntries[System.Array.index( i2, newEntries )].hashCode >= 0 ) {
              if ( this.isSimpleKey ) {
                newEntries[System.Array.index( i2, newEntries )].next = -1;
                this.simpleBuckets[newEntries[System.Array.index( i2, newEntries )].key] = i2;
              } else {
                var bucket = newEntries[System.Array.index( i2, newEntries )].hashCode % newSize;
                newEntries[System.Array.index( i2, newEntries )].next = newBuckets[System.Array.index( bucket, newBuckets )];
                newBuckets[System.Array.index( bucket, newBuckets )] = i2;
              }
            }
          }
          this.buckets = newBuckets;
          this.entries = newEntries;
        },
        tryGetValue: function ( key, value ) {
          var i = this.FindEntry( key );
          if ( i >= 0 ) {
            value.v = this.entries[System.Array.index( i, this.entries )].value;
            return true;
          }
          value.v = Bridge.getDefaultValue( TValue );
          return false;
        },
        GetValueOrDefault: function ( key ) {
          var i = this.FindEntry( key );
          if ( i >= 0 ) {
            return this.entries[System.Array.index( i, this.entries )].value;
          }
          return Bridge.getDefaultValue( TValue );
        }
      }
    };
  } );

  // @source Entry.js

  Bridge.define( "System.Collections.Generic.Dictionary$2.Entry", function ( TKey, TValue ) {
    return {
      $kind: "nested struct",
      statics: {
        methods: {
          getDefaultValue: function () { return new ( System.Collections.Generic.Dictionary$2.Entry( TKey, TValue ) )(); }
        }
      },
      fields: {
        hashCode: 0,
        next: 0,
        key: Bridge.getDefaultValue( TKey ),
        value: Bridge.getDefaultValue( TValue )
      },
      ctors: {
        ctor: function () {
          this.$initialize();
        }
      },
      methods: {
        getHashCode: function () {
          var h = Bridge.addHash( [1920233150, this.hashCode, this.next, this.key, this.value] );
          return h;
        },
        equals: function ( o ) {
          if ( !Bridge.is( o, System.Collections.Generic.Dictionary$2.Entry( TKey, TValue ) ) ) {
            return false;
          }
          return Bridge.equals( this.hashCode, o.hashCode ) && Bridge.equals( this.next, o.next ) && Bridge.equals( this.key, o.key ) && Bridge.equals( this.value, o.value );
        },
        $clone: function ( to ) {
          var s = to || new ( System.Collections.Generic.Dictionary$2.Entry( TKey, TValue ) )();
          s.hashCode = this.hashCode;
          s.next = this.next;
          s.key = this.key;
          s.value = this.value;
          return s;
        }
      }
    };
  } );

  // @source Enumerator.js

  Bridge.define( "System.Collections.Generic.Dictionary$2.Enumerator", function ( TKey, TValue ) {
    return {
      inherits: [System.Collections.Generic.IEnumerator$1( System.Collections.Generic.KeyValuePair$2( TKey, TValue ) ), System.Collections.IDictionaryEnumerator],
      $kind: "nested struct",
      statics: {
        fields: {
          DictEntry: 0,
          KeyValuePair: 0
        },
        ctors: {
          init: function () {
            this.DictEntry = 1;
            this.KeyValuePair = 2;
          }
        },
        methods: {
          getDefaultValue: function () { return new ( System.Collections.Generic.Dictionary$2.Enumerator( TKey, TValue ) )(); }
        }
      },
      fields: {
        dictionary: null,
        version: 0,
        index: 0,
        current: null,
        getEnumeratorRetType: 0
      },
      props: {
        Current: {
          get: function () {
            return this.current;
          }
        },
        System$Collections$IEnumerator$Current: {
          get: function () {
            if ( this.index === 0 || ( this.index === ( ( this.dictionary.count + 1 ) | 0 ) ) ) {
              System.ThrowHelper.ThrowInvalidOperationException( System.ExceptionResource.InvalidOperation_EnumOpCantHappen );
            }

            if ( this.getEnumeratorRetType === System.Collections.Generic.Dictionary$2.Enumerator( TKey, TValue ).DictEntry ) {
              return new System.Collections.DictionaryEntry.$ctor1( this.current.key, this.current.value ).$clone();
            } else {
              return new ( System.Collections.Generic.KeyValuePair$2( TKey, TValue ) ).$ctor1( this.current.key, this.current.value );
            }
          }
        },
        System$Collections$IDictionaryEnumerator$Entry: {
          get: function () {
            if ( this.index === 0 || ( this.index === ( ( this.dictionary.count + 1 ) | 0 ) ) ) {
              System.ThrowHelper.ThrowInvalidOperationException( System.ExceptionResource.InvalidOperation_EnumOpCantHappen );
            }

            return new System.Collections.DictionaryEntry.$ctor1( this.current.key, this.current.value );
          }
        },
        System$Collections$IDictionaryEnumerator$Key: {
          get: function () {
            if ( this.index === 0 || ( this.index === ( ( this.dictionary.count + 1 ) | 0 ) ) ) {
              System.ThrowHelper.ThrowInvalidOperationException( System.ExceptionResource.InvalidOperation_EnumOpCantHappen );
            }

            return this.current.key;
          }
        },
        System$Collections$IDictionaryEnumerator$Value: {
          get: function () {
            if ( this.index === 0 || ( this.index === ( ( this.dictionary.count + 1 ) | 0 ) ) ) {
              System.ThrowHelper.ThrowInvalidOperationException( System.ExceptionResource.InvalidOperation_EnumOpCantHappen );
            }

            return this.current.value;
          }
        }
      },
      alias: [
        "moveNext", "System$Collections$IEnumerator$moveNext",
        "Current", ["System$Collections$Generic$IEnumerator$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$Current$1", "System$Collections$Generic$IEnumerator$1$Current$1"],
        "Dispose", "System$IDisposable$Dispose"
      ],
      ctors: {
        init: function () {
          this.current = new ( System.Collections.Generic.KeyValuePair$2( TKey, TValue ) )();
        },
        $ctor1: function ( dictionary, getEnumeratorRetType ) {
          this.$initialize();
          this.dictionary = dictionary;
          this.version = dictionary.version;
          this.index = 0;
          this.getEnumeratorRetType = getEnumeratorRetType;
          this.current = new ( System.Collections.Generic.KeyValuePair$2( TKey, TValue ) ).ctor();
        },
        ctor: function () {
          this.$initialize();
        }
      },
      methods: {
        moveNext: function () {
          var $t, $t1, $t2;
          if ( this.version !== this.dictionary.version ) {
            System.ThrowHelper.ThrowInvalidOperationException( System.ExceptionResource.InvalidOperation_EnumFailedVersion );
          }

          while ( ( this.index >>> 0 ) < ( ( this.dictionary.count ) >>> 0 ) ) {
            if ( ( $t = this.dictionary.entries )[System.Array.index( this.index, $t )].hashCode >= 0 ) {
              this.current = new ( System.Collections.Generic.KeyValuePair$2( TKey, TValue ) ).$ctor1( ( $t1 = this.dictionary.entries )[System.Array.index( this.index, $t1 )].key, ( $t2 = this.dictionary.entries )[System.Array.index( this.index, $t2 )].value );
              this.index = ( this.index + 1 ) | 0;
              return true;
            }
            this.index = ( this.index + 1 ) | 0;
          }

          this.index = ( this.dictionary.count + 1 ) | 0;
          this.current = new ( System.Collections.Generic.KeyValuePair$2( TKey, TValue ) ).ctor();
          return false;
        },
        Dispose: function () { },
        System$Collections$IEnumerator$reset: function () {
          if ( this.version !== this.dictionary.version ) {
            System.ThrowHelper.ThrowInvalidOperationException( System.ExceptionResource.InvalidOperation_EnumFailedVersion );
          }

          this.index = 0;
          this.current = new ( System.Collections.Generic.KeyValuePair$2( TKey, TValue ) ).ctor();
        },
        getHashCode: function () {
          var h = Bridge.addHash( [3788985113, this.dictionary, this.version, this.index, this.current, this.getEnumeratorRetType] );
          return h;
        },
        equals: function ( o ) {
          if ( !Bridge.is( o, System.Collections.Generic.Dictionary$2.Enumerator( TKey, TValue ) ) ) {
            return false;
          }
          return Bridge.equals( this.dictionary, o.dictionary ) && Bridge.equals( this.version, o.version ) && Bridge.equals( this.index, o.index ) && Bridge.equals( this.current, o.current ) && Bridge.equals( this.getEnumeratorRetType, o.getEnumeratorRetType );
        },
        $clone: function ( to ) {
          var s = to || new ( System.Collections.Generic.Dictionary$2.Enumerator( TKey, TValue ) )();
          s.dictionary = this.dictionary;
          s.version = this.version;
          s.index = this.index;
          s.current = this.current;
          s.getEnumeratorRetType = this.getEnumeratorRetType;
          return s;
        }
      }
    };
  } );

  // @source KeyCollection.js

  Bridge.define( "System.Collections.Generic.Dictionary$2.KeyCollection", function ( TKey, TValue ) {
    return {
      inherits: [System.Collections.Generic.ICollection$1( TKey ), System.Collections.ICollection, System.Collections.Generic.IReadOnlyCollection$1( TKey )],
      $kind: "nested class",
      fields: {
        dictionary: null
      },
      props: {
        Count: {
          get: function () {
            return this.dictionary.Count;
          }
        },
        System$Collections$Generic$ICollection$1$IsReadOnly: {
          get: function () {
            return true;
          }
        },
        System$Collections$ICollection$IsSynchronized: {
          get: function () {
            return false;
          }
        },
        System$Collections$ICollection$SyncRoot: {
          get: function () {
            return Bridge.cast( this.dictionary, System.Collections.ICollection ).System$Collections$ICollection$SyncRoot;
          }
        }
      },
      alias: [
        "copyTo", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TKey ) + "$copyTo",
        "Count", ["System$Collections$Generic$IReadOnlyCollection$1$" + Bridge.getTypeAlias( TKey ) + "$Count", "System$Collections$Generic$IReadOnlyCollection$1$Count"],
        "Count", "System$Collections$ICollection$Count",
        "Count", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TKey ) + "$Count",
        "System$Collections$Generic$ICollection$1$IsReadOnly", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TKey ) + "$IsReadOnly",
        "System$Collections$Generic$ICollection$1$add", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TKey ) + "$add",
        "System$Collections$Generic$ICollection$1$clear", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TKey ) + "$clear",
        "System$Collections$Generic$ICollection$1$contains", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TKey ) + "$contains",
        "System$Collections$Generic$ICollection$1$remove", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TKey ) + "$remove",
        "System$Collections$Generic$IEnumerable$1$GetEnumerator", "System$Collections$Generic$IEnumerable$1$" + Bridge.getTypeAlias( TKey ) + "$GetEnumerator"
      ],
      ctors: {
        ctor: function ( dictionary ) {
          this.$initialize();
          if ( dictionary == null ) {
            System.ThrowHelper.ThrowArgumentNullException( System.ExceptionArgument.dictionary );
          }
          this.dictionary = dictionary;
        }
      },
      methods: {
        GetEnumerator: function () {
          return new ( System.Collections.Generic.Dictionary$2.KeyCollection.Enumerator( TKey, TValue ) ).$ctor1( this.dictionary );
        },
        System$Collections$Generic$IEnumerable$1$GetEnumerator: function () {
          return new ( System.Collections.Generic.Dictionary$2.KeyCollection.Enumerator( TKey, TValue ) ).$ctor1( this.dictionary ).$clone();
        },
        System$Collections$IEnumerable$GetEnumerator: function () {
          return new ( System.Collections.Generic.Dictionary$2.KeyCollection.Enumerator( TKey, TValue ) ).$ctor1( this.dictionary ).$clone();
        },
        copyTo: function ( array, index ) {
          if ( array == null ) {
            System.ThrowHelper.ThrowArgumentNullException( System.ExceptionArgument.array );
          }

          if ( index < 0 || index > array.length ) {
            System.ThrowHelper.ThrowArgumentOutOfRangeException$2( System.ExceptionArgument.index, System.ExceptionResource.ArgumentOutOfRange_NeedNonNegNum );
          }

          if ( ( ( array.length - index ) | 0 ) < this.dictionary.Count ) {
            System.ThrowHelper.ThrowArgumentException( System.ExceptionResource.Arg_ArrayPlusOffTooSmall );
          }

          var count = this.dictionary.count;
          var entries = this.dictionary.entries;
          for ( var i = 0; i < count; i = ( i + 1 ) | 0 ) {
            if ( entries[System.Array.index( i, entries )].hashCode >= 0 ) {
              array[System.Array.index( Bridge.identity( index, ( ( index = ( index + 1 ) | 0 ) ) ), array )] = entries[System.Array.index( i, entries )].key;
            }
          }
        },
        System$Collections$ICollection$copyTo: function ( array, index ) {
          if ( array == null ) {
            System.ThrowHelper.ThrowArgumentNullException( System.ExceptionArgument.array );
          }

          if ( System.Array.getRank( array ) !== 1 ) {
            System.ThrowHelper.ThrowArgumentException( System.ExceptionResource.Arg_RankMultiDimNotSupported );
          }

          if ( System.Array.getLower( array, 0 ) !== 0 ) {
            System.ThrowHelper.ThrowArgumentException( System.ExceptionResource.Arg_NonZeroLowerBound );
          }

          if ( index < 0 || index > array.length ) {
            System.ThrowHelper.ThrowArgumentOutOfRangeException$2( System.ExceptionArgument.index, System.ExceptionResource.ArgumentOutOfRange_NeedNonNegNum );
          }

          if ( ( ( array.length - index ) | 0 ) < this.dictionary.Count ) {
            System.ThrowHelper.ThrowArgumentException( System.ExceptionResource.Arg_ArrayPlusOffTooSmall );
          }

          var keys = Bridge.as( array, System.Array.type( TKey ) );
          if ( keys != null ) {
            this.copyTo( keys, index );
          } else {
            var objects = Bridge.as( array, System.Array.type( System.Object ) );
            if ( objects == null ) {
              System.ThrowHelper.ThrowArgumentException( System.ExceptionResource.Argument_InvalidArrayType );
            }

            var count = this.dictionary.count;
            var entries = this.dictionary.entries;
            try {
              for ( var i = 0; i < count; i = ( i + 1 ) | 0 ) {
                if ( entries[System.Array.index( i, entries )].hashCode >= 0 ) {
                  objects[System.Array.index( Bridge.identity( index, ( ( index = ( index + 1 ) | 0 ) ) ), objects )] = entries[System.Array.index( i, entries )].key;
                }
              }
            } catch ( $e1 ) {
              $e1 = System.Exception.create( $e1 );
              if ( Bridge.is( $e1, System.ArrayTypeMismatchException ) ) {
                System.ThrowHelper.ThrowArgumentException( System.ExceptionResource.Argument_InvalidArrayType );
              } else {
                throw $e1;
              }
            }
          }
        },
        System$Collections$Generic$ICollection$1$add: function ( item ) {
          System.ThrowHelper.ThrowNotSupportedException$1( System.ExceptionResource.NotSupported_KeyCollectionSet );
        },
        System$Collections$Generic$ICollection$1$clear: function () {
          System.ThrowHelper.ThrowNotSupportedException$1( System.ExceptionResource.NotSupported_KeyCollectionSet );
        },
        System$Collections$Generic$ICollection$1$contains: function ( item ) {
          return this.dictionary.containsKey( item );
        },
        System$Collections$Generic$ICollection$1$remove: function ( item ) {
          System.ThrowHelper.ThrowNotSupportedException$1( System.ExceptionResource.NotSupported_KeyCollectionSet );
          return false;
        }
      }
    };
  } );

  // @source Enumerator.js

  Bridge.define( "System.Collections.Generic.Dictionary$2.KeyCollection.Enumerator", function ( TKey, TValue ) {
    return {
      inherits: [System.Collections.Generic.IEnumerator$1( TKey ), System.Collections.IEnumerator],
      $kind: "nested struct",
      statics: {
        methods: {
          getDefaultValue: function () { return new ( System.Collections.Generic.Dictionary$2.KeyCollection.Enumerator( TKey, TValue ) )(); }
        }
      },
      fields: {
        dictionary: null,
        index: 0,
        version: 0,
        currentKey: Bridge.getDefaultValue( TKey )
      },
      props: {
        Current: {
          get: function () {
            return this.currentKey;
          }
        },
        System$Collections$IEnumerator$Current: {
          get: function () {
            if ( this.index === 0 || ( this.index === ( ( this.dictionary.count + 1 ) | 0 ) ) ) {
              System.ThrowHelper.ThrowInvalidOperationException( System.ExceptionResource.InvalidOperation_EnumOpCantHappen );
            }

            return this.currentKey;
          }
        }
      },
      alias: [
        "Dispose", "System$IDisposable$Dispose",
        "moveNext", "System$Collections$IEnumerator$moveNext",
        "Current", ["System$Collections$Generic$IEnumerator$1$" + Bridge.getTypeAlias( TKey ) + "$Current$1", "System$Collections$Generic$IEnumerator$1$Current$1"]
      ],
      ctors: {
        $ctor1: function ( dictionary ) {
          this.$initialize();
          this.dictionary = dictionary;
          this.version = dictionary.version;
          this.index = 0;
          this.currentKey = Bridge.getDefaultValue( TKey );
        },
        ctor: function () {
          this.$initialize();
        }
      },
      methods: {
        Dispose: function () { },
        moveNext: function () {
          var $t, $t1;
          if ( this.version !== this.dictionary.version ) {
            System.ThrowHelper.ThrowInvalidOperationException( System.ExceptionResource.InvalidOperation_EnumFailedVersion );
          }

          while ( ( this.index >>> 0 ) < ( ( this.dictionary.count ) >>> 0 ) ) {
            if ( ( $t = this.dictionary.entries )[System.Array.index( this.index, $t )].hashCode >= 0 ) {
              this.currentKey = ( $t1 = this.dictionary.entries )[System.Array.index( this.index, $t1 )].key;
              this.index = ( this.index + 1 ) | 0;
              return true;
            }
            this.index = ( this.index + 1 ) | 0;
          }

          this.index = ( this.dictionary.count + 1 ) | 0;
          this.currentKey = Bridge.getDefaultValue( TKey );
          return false;
        },
        System$Collections$IEnumerator$reset: function () {
          if ( this.version !== this.dictionary.version ) {
            System.ThrowHelper.ThrowInvalidOperationException( System.ExceptionResource.InvalidOperation_EnumFailedVersion );
          }

          this.index = 0;
          this.currentKey = Bridge.getDefaultValue( TKey );
        },
        getHashCode: function () {
          var h = Bridge.addHash( [3788985113, this.dictionary, this.index, this.version, this.currentKey] );
          return h;
        },
        equals: function ( o ) {
          if ( !Bridge.is( o, System.Collections.Generic.Dictionary$2.KeyCollection.Enumerator( TKey, TValue ) ) ) {
            return false;
          }
          return Bridge.equals( this.dictionary, o.dictionary ) && Bridge.equals( this.index, o.index ) && Bridge.equals( this.version, o.version ) && Bridge.equals( this.currentKey, o.currentKey );
        },
        $clone: function ( to ) {
          var s = to || new ( System.Collections.Generic.Dictionary$2.KeyCollection.Enumerator( TKey, TValue ) )();
          s.dictionary = this.dictionary;
          s.index = this.index;
          s.version = this.version;
          s.currentKey = this.currentKey;
          return s;
        }
      }
    };
  } );

  // @source ValueCollection.js

  Bridge.define( "System.Collections.Generic.Dictionary$2.ValueCollection", function ( TKey, TValue ) {
    return {
      inherits: [System.Collections.Generic.ICollection$1( TValue ), System.Collections.ICollection, System.Collections.Generic.IReadOnlyCollection$1( TValue )],
      $kind: "nested class",
      fields: {
        dictionary: null
      },
      props: {
        Count: {
          get: function () {
            return this.dictionary.Count;
          }
        },
        System$Collections$Generic$ICollection$1$IsReadOnly: {
          get: function () {
            return true;
          }
        },
        System$Collections$ICollection$IsSynchronized: {
          get: function () {
            return false;
          }
        },
        System$Collections$ICollection$SyncRoot: {
          get: function () {
            return Bridge.cast( this.dictionary, System.Collections.ICollection ).System$Collections$ICollection$SyncRoot;
          }
        }
      },
      alias: [
        "copyTo", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TValue ) + "$copyTo",
        "Count", ["System$Collections$Generic$IReadOnlyCollection$1$" + Bridge.getTypeAlias( TValue ) + "$Count", "System$Collections$Generic$IReadOnlyCollection$1$Count"],
        "Count", "System$Collections$ICollection$Count",
        "Count", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TValue ) + "$Count",
        "System$Collections$Generic$ICollection$1$IsReadOnly", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TValue ) + "$IsReadOnly",
        "System$Collections$Generic$ICollection$1$add", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TValue ) + "$add",
        "System$Collections$Generic$ICollection$1$remove", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TValue ) + "$remove",
        "System$Collections$Generic$ICollection$1$clear", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TValue ) + "$clear",
        "System$Collections$Generic$ICollection$1$contains", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TValue ) + "$contains",
        "System$Collections$Generic$IEnumerable$1$GetEnumerator", "System$Collections$Generic$IEnumerable$1$" + Bridge.getTypeAlias( TValue ) + "$GetEnumerator"
      ],
      ctors: {
        ctor: function ( dictionary ) {
          this.$initialize();
          if ( dictionary == null ) {
            System.ThrowHelper.ThrowArgumentNullException( System.ExceptionArgument.dictionary );
          }
          this.dictionary = dictionary;
        }
      },
      methods: {
        GetEnumerator: function () {
          return new ( System.Collections.Generic.Dictionary$2.ValueCollection.Enumerator( TKey, TValue ) ).$ctor1( this.dictionary );
        },
        System$Collections$Generic$IEnumerable$1$GetEnumerator: function () {
          return new ( System.Collections.Generic.Dictionary$2.ValueCollection.Enumerator( TKey, TValue ) ).$ctor1( this.dictionary ).$clone();
        },
        System$Collections$IEnumerable$GetEnumerator: function () {
          return new ( System.Collections.Generic.Dictionary$2.ValueCollection.Enumerator( TKey, TValue ) ).$ctor1( this.dictionary ).$clone();
        },
        copyTo: function ( array, index ) {
          if ( array == null ) {
            System.ThrowHelper.ThrowArgumentNullException( System.ExceptionArgument.array );
          }

          if ( index < 0 || index > array.length ) {
            System.ThrowHelper.ThrowArgumentOutOfRangeException$2( System.ExceptionArgument.index, System.ExceptionResource.ArgumentOutOfRange_NeedNonNegNum );
          }

          if ( ( ( array.length - index ) | 0 ) < this.dictionary.Count ) {
            System.ThrowHelper.ThrowArgumentException( System.ExceptionResource.Arg_ArrayPlusOffTooSmall );
          }

          var count = this.dictionary.count;
          var entries = this.dictionary.entries;
          for ( var i = 0; i < count; i = ( i + 1 ) | 0 ) {
            if ( entries[System.Array.index( i, entries )].hashCode >= 0 ) {
              array[System.Array.index( Bridge.identity( index, ( ( index = ( index + 1 ) | 0 ) ) ), array )] = entries[System.Array.index( i, entries )].value;
            }
          }
        },
        System$Collections$ICollection$copyTo: function ( array, index ) {
          if ( array == null ) {
            System.ThrowHelper.ThrowArgumentNullException( System.ExceptionArgument.array );
          }

          if ( System.Array.getRank( array ) !== 1 ) {
            System.ThrowHelper.ThrowArgumentException( System.ExceptionResource.Arg_RankMultiDimNotSupported );
          }

          if ( System.Array.getLower( array, 0 ) !== 0 ) {
            System.ThrowHelper.ThrowArgumentException( System.ExceptionResource.Arg_NonZeroLowerBound );
          }

          if ( index < 0 || index > array.length ) {
            System.ThrowHelper.ThrowArgumentOutOfRangeException$2( System.ExceptionArgument.index, System.ExceptionResource.ArgumentOutOfRange_NeedNonNegNum );
          }

          if ( ( ( array.length - index ) | 0 ) < this.dictionary.Count ) {
            System.ThrowHelper.ThrowArgumentException( System.ExceptionResource.Arg_ArrayPlusOffTooSmall );
          }

          var values = Bridge.as( array, System.Array.type( TValue ) );
          if ( values != null ) {
            this.copyTo( values, index );
          } else {
            var objects = Bridge.as( array, System.Array.type( System.Object ) );
            if ( objects == null ) {
              System.ThrowHelper.ThrowArgumentException( System.ExceptionResource.Argument_InvalidArrayType );
            }

            var count = this.dictionary.count;
            var entries = this.dictionary.entries;
            try {
              for ( var i = 0; i < count; i = ( i + 1 ) | 0 ) {
                if ( entries[System.Array.index( i, entries )].hashCode >= 0 ) {
                  objects[System.Array.index( Bridge.identity( index, ( ( index = ( index + 1 ) | 0 ) ) ), objects )] = entries[System.Array.index( i, entries )].value;
                }
              }
            } catch ( $e1 ) {
              $e1 = System.Exception.create( $e1 );
              if ( Bridge.is( $e1, System.ArrayTypeMismatchException ) ) {
                System.ThrowHelper.ThrowArgumentException( System.ExceptionResource.Argument_InvalidArrayType );
              } else {
                throw $e1;
              }
            }
          }
        },
        System$Collections$Generic$ICollection$1$add: function ( item ) {
          System.ThrowHelper.ThrowNotSupportedException$1( System.ExceptionResource.NotSupported_ValueCollectionSet );
        },
        System$Collections$Generic$ICollection$1$remove: function ( item ) {
          System.ThrowHelper.ThrowNotSupportedException$1( System.ExceptionResource.NotSupported_ValueCollectionSet );
          return false;
        },
        System$Collections$Generic$ICollection$1$clear: function () {
          System.ThrowHelper.ThrowNotSupportedException$1( System.ExceptionResource.NotSupported_ValueCollectionSet );
        },
        System$Collections$Generic$ICollection$1$contains: function ( item ) {
          return this.dictionary.ContainsValue( item );
        }
      }
    };
  } );

  // @source Enumerator.js

  Bridge.define( "System.Collections.Generic.Dictionary$2.ValueCollection.Enumerator", function ( TKey, TValue ) {
    return {
      inherits: [System.Collections.Generic.IEnumerator$1( TValue ), System.Collections.IEnumerator],
      $kind: "nested struct",
      statics: {
        methods: {
          getDefaultValue: function () { return new ( System.Collections.Generic.Dictionary$2.ValueCollection.Enumerator( TKey, TValue ) )(); }
        }
      },
      fields: {
        dictionary: null,
        index: 0,
        version: 0,
        currentValue: Bridge.getDefaultValue( TValue )
      },
      props: {
        Current: {
          get: function () {
            return this.currentValue;
          }
        },
        System$Collections$IEnumerator$Current: {
          get: function () {
            if ( this.index === 0 || ( this.index === ( ( this.dictionary.count + 1 ) | 0 ) ) ) {
              System.ThrowHelper.ThrowInvalidOperationException( System.ExceptionResource.InvalidOperation_EnumOpCantHappen );
            }

            return this.currentValue;
          }
        }
      },
      alias: [
        "Dispose", "System$IDisposable$Dispose",
        "moveNext", "System$Collections$IEnumerator$moveNext",
        "Current", ["System$Collections$Generic$IEnumerator$1$" + Bridge.getTypeAlias( TValue ) + "$Current$1", "System$Collections$Generic$IEnumerator$1$Current$1"]
      ],
      ctors: {
        $ctor1: function ( dictionary ) {
          this.$initialize();
          this.dictionary = dictionary;
          this.version = dictionary.version;
          this.index = 0;
          this.currentValue = Bridge.getDefaultValue( TValue );
        },
        ctor: function () {
          this.$initialize();
        }
      },
      methods: {
        Dispose: function () { },
        moveNext: function () {
          var $t, $t1;
          if ( this.version !== this.dictionary.version ) {
            System.ThrowHelper.ThrowInvalidOperationException( System.ExceptionResource.InvalidOperation_EnumFailedVersion );
          }

          while ( ( this.index >>> 0 ) < ( ( this.dictionary.count ) >>> 0 ) ) {
            if ( ( $t = this.dictionary.entries )[System.Array.index( this.index, $t )].hashCode >= 0 ) {
              this.currentValue = ( $t1 = this.dictionary.entries )[System.Array.index( this.index, $t1 )].value;
              this.index = ( this.index + 1 ) | 0;
              return true;
            }
            this.index = ( this.index + 1 ) | 0;
          }
          this.index = ( this.dictionary.count + 1 ) | 0;
          this.currentValue = Bridge.getDefaultValue( TValue );
          return false;
        },
        System$Collections$IEnumerator$reset: function () {
          if ( this.version !== this.dictionary.version ) {
            System.ThrowHelper.ThrowInvalidOperationException( System.ExceptionResource.InvalidOperation_EnumFailedVersion );
          }
          this.index = 0;
          this.currentValue = Bridge.getDefaultValue( TValue );
        },
        getHashCode: function () {
          var h = Bridge.addHash( [3788985113, this.dictionary, this.index, this.version, this.currentValue] );
          return h;
        },
        equals: function ( o ) {
          if ( !Bridge.is( o, System.Collections.Generic.Dictionary$2.ValueCollection.Enumerator( TKey, TValue ) ) ) {
            return false;
          }
          return Bridge.equals( this.dictionary, o.dictionary ) && Bridge.equals( this.index, o.index ) && Bridge.equals( this.version, o.version ) && Bridge.equals( this.currentValue, o.currentValue );
        },
        $clone: function ( to ) {
          var s = to || new ( System.Collections.Generic.Dictionary$2.ValueCollection.Enumerator( TKey, TValue ) )();
          s.dictionary = this.dictionary;
          s.index = this.index;
          s.version = this.version;
          s.currentValue = this.currentValue;
          return s;
        }
      }
    };
  } );

  // @source ReadOnlyDictionary.js

  Bridge.define( "System.Collections.ObjectModel.ReadOnlyDictionary$2", function ( TKey, TValue ) {
    return {
      inherits: [System.Collections.Generic.IDictionary$2( TKey, TValue ), System.Collections.IDictionary, System.Collections.Generic.IReadOnlyDictionary$2( TKey, TValue )],
      statics: {
        fields: {
          NotSupported_ReadOnlyCollection: null
        },
        ctors: {
          init: function () {
            this.NotSupported_ReadOnlyCollection = "Collection is read-only.";
          }
        },
        methods: {
          IsCompatibleKey: function ( key ) {
            if ( key == null ) {
              throw new System.ArgumentNullException.$ctor1( "key" );
            }
            return Bridge.is( key, TKey );
          }
        }
      },
      fields: {
        m_dictionary: null,
        _keys: null,
        _values: null
      },
      props: {
        Dictionary: {
          get: function () {
            return this.m_dictionary;
          }
        },
        Keys: {
          get: function () {
            if ( this._keys == null ) {
              this._keys = new ( System.Collections.ObjectModel.ReadOnlyDictionary$2.KeyCollection( TKey, TValue ) )( this.m_dictionary["System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$Keys"] );
            }
            return this._keys;
          }
        },
        Values: {
          get: function () {
            if ( this._values == null ) {
              this._values = new ( System.Collections.ObjectModel.ReadOnlyDictionary$2.ValueCollection( TKey, TValue ) )( this.m_dictionary["System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$Values"] );
            }
            return this._values;
          }
        },
        System$Collections$Generic$IDictionary$2$Keys: {
          get: function () {
            return this.Keys;
          }
        },
        System$Collections$Generic$IDictionary$2$Values: {
          get: function () {
            return this.Values;
          }
        },
        Count: {
          get: function () {
            return System.Array.getCount( this.m_dictionary, System.Collections.Generic.KeyValuePair$2( TKey, TValue ) );
          }
        },
        System$Collections$Generic$ICollection$1$IsReadOnly: {
          get: function () {
            return true;
          }
        },
        System$Collections$IDictionary$IsFixedSize: {
          get: function () {
            return true;
          }
        },
        System$Collections$IDictionary$IsReadOnly: {
          get: function () {
            return true;
          }
        },
        System$Collections$IDictionary$Keys: {
          get: function () {
            return this.Keys;
          }
        },
        System$Collections$IDictionary$Values: {
          get: function () {
            return this.Values;
          }
        },
        System$Collections$ICollection$IsSynchronized: {
          get: function () {
            return false;
          }
        },
        System$Collections$ICollection$SyncRoot: {
          get: function () {
            return null;
          }
        },
        System$Collections$Generic$IReadOnlyDictionary$2$Keys: {
          get: function () {
            return this.Keys;
          }
        },
        System$Collections$Generic$IReadOnlyDictionary$2$Values: {
          get: function () {
            return this.Values;
          }
        }
      },
      alias: [
        "containsKey", "System$Collections$Generic$IReadOnlyDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$containsKey",
        "containsKey", "System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$containsKey",
        "System$Collections$Generic$IDictionary$2$Keys", "System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$Keys",
        "tryGetValue", "System$Collections$Generic$IReadOnlyDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$tryGetValue",
        "tryGetValue", "System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$tryGetValue",
        "System$Collections$Generic$IDictionary$2$Values", "System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$Values",
        "getItem", "System$Collections$Generic$IReadOnlyDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$getItem",
        "System$Collections$Generic$IDictionary$2$add", "System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$add",
        "System$Collections$Generic$IDictionary$2$remove", "System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$remove",
        "System$Collections$Generic$IDictionary$2$getItem", "System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$getItem",
        "System$Collections$Generic$IDictionary$2$setItem", "System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$setItem",
        "Count", ["System$Collections$Generic$IReadOnlyCollection$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$Count", "System$Collections$Generic$IReadOnlyCollection$1$Count"],
        "Count", "System$Collections$ICollection$Count",
        "Count", "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$Count",
        "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$contains", "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$contains",
        "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$copyTo", "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$copyTo",
        "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$IsReadOnly", "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$IsReadOnly",
        "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$add", "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$add",
        "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$clear", "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$clear",
        "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$remove", "System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$remove",
        "GetEnumerator", ["System$Collections$Generic$IEnumerable$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$GetEnumerator", "System$Collections$Generic$IEnumerable$1$GetEnumerator"],
        "System$Collections$Generic$IReadOnlyDictionary$2$Keys", "System$Collections$Generic$IReadOnlyDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$Keys",
        "System$Collections$Generic$IReadOnlyDictionary$2$Values", "System$Collections$Generic$IReadOnlyDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$Values"
      ],
      ctors: {
        ctor: function ( dictionary ) {
          this.$initialize();
          if ( dictionary == null ) {
            throw new System.ArgumentNullException.$ctor1( "dictionary" );
          }
          this.m_dictionary = dictionary;
        }
      },
      methods: {
        getItem: function ( key ) {
          return this.m_dictionary["System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$getItem"]( key );
        },
        System$Collections$Generic$IDictionary$2$getItem: function ( key ) {
          return this.m_dictionary["System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$getItem"]( key );
        },
        System$Collections$Generic$IDictionary$2$setItem: function ( key, value ) {
          throw new System.NotSupportedException.$ctor1( System.Collections.ObjectModel.ReadOnlyDictionary$2( TKey, TValue ).NotSupported_ReadOnlyCollection );
        },
        System$Collections$IDictionary$getItem: function ( key ) {
          if ( System.Collections.ObjectModel.ReadOnlyDictionary$2( TKey, TValue ).IsCompatibleKey( key ) ) {
            return this.getItem( Bridge.cast( Bridge.unbox( key, TKey ), TKey ) );
          }
          return null;
        },
        System$Collections$IDictionary$setItem: function ( key, value ) {
          throw new System.NotSupportedException.$ctor1( System.Collections.ObjectModel.ReadOnlyDictionary$2( TKey, TValue ).NotSupported_ReadOnlyCollection );
        },
        containsKey: function ( key ) {
          return this.m_dictionary["System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$containsKey"]( key );
        },
        tryGetValue: function ( key, value ) {
          return this.m_dictionary["System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$tryGetValue"]( key, value );
        },
        System$Collections$Generic$IDictionary$2$add: function ( key, value ) {
          throw new System.NotSupportedException.$ctor1( System.Collections.ObjectModel.ReadOnlyDictionary$2( TKey, TValue ).NotSupported_ReadOnlyCollection );
        },
        System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$add: function ( item ) {
          throw new System.NotSupportedException.$ctor1( System.Collections.ObjectModel.ReadOnlyDictionary$2( TKey, TValue ).NotSupported_ReadOnlyCollection );
        },
        System$Collections$IDictionary$add: function ( key, value ) {
          throw new System.NotSupportedException.$ctor1( System.Collections.ObjectModel.ReadOnlyDictionary$2( TKey, TValue ).NotSupported_ReadOnlyCollection );
        },
        System$Collections$Generic$IDictionary$2$remove: function ( key ) {
          throw new System.NotSupportedException.$ctor1( System.Collections.ObjectModel.ReadOnlyDictionary$2( TKey, TValue ).NotSupported_ReadOnlyCollection );
        },
        System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$remove: function ( item ) {
          throw new System.NotSupportedException.$ctor1( System.Collections.ObjectModel.ReadOnlyDictionary$2( TKey, TValue ).NotSupported_ReadOnlyCollection );
        },
        System$Collections$IDictionary$remove: function ( key ) {
          throw new System.NotSupportedException.$ctor1( System.Collections.ObjectModel.ReadOnlyDictionary$2( TKey, TValue ).NotSupported_ReadOnlyCollection );
        },
        System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$contains: function ( item ) {
          return System.Array.contains( this.m_dictionary, item, System.Collections.Generic.KeyValuePair$2( TKey, TValue ) );
        },
        System$Collections$IDictionary$contains: function ( key ) {
          return System.Collections.ObjectModel.ReadOnlyDictionary$2( TKey, TValue ).IsCompatibleKey( key ) && this.containsKey( Bridge.cast( Bridge.unbox( key, TKey ), TKey ) );
        },
        System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$copyTo: function ( array, arrayIndex ) {
          System.Array.copyTo( this.m_dictionary, array, arrayIndex, System.Collections.Generic.KeyValuePair$2( TKey, TValue ) );
        },
        System$Collections$ICollection$copyTo: function ( array, index ) {
          var $t, $t1;
          if ( array == null ) {
            throw new System.ArgumentNullException.$ctor1( "array" );
          }

          if ( System.Array.getRank( array ) !== 1 ) {
            throw new System.ArgumentException.$ctor1( "Only single dimensional arrays are supported for the requested action." );
          }

          if ( System.Array.getLower( array, 0 ) !== 0 ) {
            throw new System.ArgumentException.$ctor1( "The lower bound of target array must be zero." );
          }

          if ( index < 0 || index > array.length ) {
            throw new System.ArgumentOutOfRangeException.$ctor4( "index", "Non-negative number required." );
          }

          if ( ( ( array.length - index ) | 0 ) < this.Count ) {
            throw new System.ArgumentException.$ctor1( "Destination array is not long enough to copy all the items in the collection. Check array index and length." );
          }

          var pairs = Bridge.as( array, System.Array.type( System.Collections.Generic.KeyValuePair$2( TKey, TValue ) ) );
          if ( pairs != null ) {
            System.Array.copyTo( this.m_dictionary, pairs, index, System.Collections.Generic.KeyValuePair$2( TKey, TValue ) );
          } else {
            var dictEntryArray = Bridge.as( array, System.Array.type( System.Collections.DictionaryEntry ) );
            if ( dictEntryArray != null ) {
              $t = Bridge.getEnumerator( this.m_dictionary, System.Collections.Generic.KeyValuePair$2( TKey, TValue ) );
              try {
                while ( $t.moveNext() ) {
                  var item = $t.Current;
                  dictEntryArray[System.Array.index( Bridge.identity( index, ( ( index = ( index + 1 ) | 0 ) ) ), dictEntryArray )] = new System.Collections.DictionaryEntry.$ctor1( item.key, item.value );
                }
              } finally {
                if ( Bridge.is( $t, System.IDisposable ) ) {
                  $t.System$IDisposable$Dispose();
                }
              }
            } else {
              var objects = Bridge.as( array, System.Array.type( System.Object ) );
              if ( objects == null ) {
                throw new System.ArgumentException.$ctor1( "Target array type is not compatible with the type of items in the collection." );
              }

              try {
                $t1 = Bridge.getEnumerator( this.m_dictionary, System.Collections.Generic.KeyValuePair$2( TKey, TValue ) );
                try {
                  while ( $t1.moveNext() ) {
                    var item1 = $t1.Current;
                    objects[System.Array.index( Bridge.identity( index, ( ( index = ( index + 1 ) | 0 ) ) ), objects )] = new ( System.Collections.Generic.KeyValuePair$2( TKey, TValue ) ).$ctor1( item1.key, item1.value );
                  }
                } finally {
                  if ( Bridge.is( $t1, System.IDisposable ) ) {
                    $t1.System$IDisposable$Dispose();
                  }
                }
              } catch ( $e1 ) {
                $e1 = System.Exception.create( $e1 );
                if ( Bridge.is( $e1, System.ArrayTypeMismatchException ) ) {
                  throw new System.ArgumentException.$ctor1( "Target array type is not compatible with the type of items in the collection." );
                } else {
                  throw $e1;
                }
              }
            }
          }
        },
        System$Collections$Generic$ICollection$1$System$Collections$Generic$KeyValuePair$2$clear: function () {
          throw new System.NotSupportedException.$ctor1( System.Collections.ObjectModel.ReadOnlyDictionary$2( TKey, TValue ).NotSupported_ReadOnlyCollection );
        },
        System$Collections$IDictionary$clear: function () {
          throw new System.NotSupportedException.$ctor1( System.Collections.ObjectModel.ReadOnlyDictionary$2( TKey, TValue ).NotSupported_ReadOnlyCollection );
        },
        GetEnumerator: function () {
          return Bridge.getEnumerator( this.m_dictionary, System.Collections.Generic.KeyValuePair$2( TKey, TValue ) );
        },
        System$Collections$IEnumerable$GetEnumerator: function () {
          return Bridge.getEnumerator( Bridge.cast( this.m_dictionary, System.Collections.IEnumerable ) );
        },
        System$Collections$IDictionary$GetEnumerator: function () {
          var d = Bridge.as( this.m_dictionary, System.Collections.IDictionary );
          if ( d != null ) {
            return d.System$Collections$IDictionary$GetEnumerator();
          }
          return new ( System.Collections.ObjectModel.ReadOnlyDictionary$2.DictionaryEnumerator( TKey, TValue ) ).$ctor1( this.m_dictionary ).$clone();
        }
      }
    };
  } );

  // @source DictionaryEnumerator.js

  Bridge.define( "System.Collections.ObjectModel.ReadOnlyDictionary$2.DictionaryEnumerator", function ( TKey, TValue ) {
    return {
      inherits: [System.Collections.IDictionaryEnumerator],
      $kind: "nested struct",
      statics: {
        methods: {
          getDefaultValue: function () { return new ( System.Collections.ObjectModel.ReadOnlyDictionary$2.DictionaryEnumerator( TKey, TValue ) )(); }
        }
      },
      fields: {
        _dictionary: null,
        _enumerator: null
      },
      props: {
        Entry: {
          get: function () {
            return new System.Collections.DictionaryEntry.$ctor1( this._enumerator[Bridge.geti( this._enumerator, "System$Collections$Generic$IEnumerator$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$Current$1", "System$Collections$Generic$IEnumerator$1$Current$1" )].key, this._enumerator[Bridge.geti( this._enumerator, "System$Collections$Generic$IEnumerator$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$Current$1", "System$Collections$Generic$IEnumerator$1$Current$1" )].value );
          }
        },
        Key: {
          get: function () {
            return this._enumerator[Bridge.geti( this._enumerator, "System$Collections$Generic$IEnumerator$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$Current$1", "System$Collections$Generic$IEnumerator$1$Current$1" )].key;
          }
        },
        Value: {
          get: function () {
            return this._enumerator[Bridge.geti( this._enumerator, "System$Collections$Generic$IEnumerator$1$System$Collections$Generic$KeyValuePair$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$Current$1", "System$Collections$Generic$IEnumerator$1$Current$1" )].value;
          }
        },
        Current: {
          get: function () {
            return this.Entry.$clone();
          }
        }
      },
      alias: [
        "Entry", "System$Collections$IDictionaryEnumerator$Entry",
        "Key", "System$Collections$IDictionaryEnumerator$Key",
        "Value", "System$Collections$IDictionaryEnumerator$Value",
        "Current", "System$Collections$IEnumerator$Current",
        "moveNext", "System$Collections$IEnumerator$moveNext",
        "reset", "System$Collections$IEnumerator$reset"
      ],
      ctors: {
        $ctor1: function ( dictionary ) {
          this.$initialize();
          this._dictionary = dictionary;
          this._enumerator = Bridge.getEnumerator( this._dictionary, System.Collections.Generic.KeyValuePair$2( TKey, TValue ) );
        },
        ctor: function () {
          this.$initialize();
        }
      },
      methods: {
        moveNext: function () {
          return this._enumerator.System$Collections$IEnumerator$moveNext();
        },
        reset: function () {
          this._enumerator.System$Collections$IEnumerator$reset();
        },
        getHashCode: function () {
          var h = Bridge.addHash( [9276503029, this._dictionary, this._enumerator] );
          return h;
        },
        equals: function ( o ) {
          if ( !Bridge.is( o, System.Collections.ObjectModel.ReadOnlyDictionary$2.DictionaryEnumerator( TKey, TValue ) ) ) {
            return false;
          }
          return Bridge.equals( this._dictionary, o._dictionary ) && Bridge.equals( this._enumerator, o._enumerator );
        },
        $clone: function ( to ) {
          var s = to || new ( System.Collections.ObjectModel.ReadOnlyDictionary$2.DictionaryEnumerator( TKey, TValue ) )();
          s._dictionary = this._dictionary;
          s._enumerator = this._enumerator;
          return s;
        }
      }
    };
  } );

  // @source KeyCollection.js

  Bridge.define( "System.Collections.ObjectModel.ReadOnlyDictionary$2.KeyCollection", function ( TKey, TValue ) {
    return {
      inherits: [System.Collections.Generic.ICollection$1( TKey ), System.Collections.ICollection, System.Collections.Generic.IReadOnlyCollection$1( TKey )],
      $kind: "nested class",
      fields: {
        _collection: null
      },
      props: {
        Count: {
          get: function () {
            return System.Array.getCount( this._collection, TKey );
          }
        },
        System$Collections$Generic$ICollection$1$IsReadOnly: {
          get: function () {
            return true;
          }
        },
        System$Collections$ICollection$IsSynchronized: {
          get: function () {
            return false;
          }
        },
        System$Collections$ICollection$SyncRoot: {
          get: function () {
            return null;
          }
        }
      },
      alias: [
        "System$Collections$Generic$ICollection$1$add", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TKey ) + "$add",
        "System$Collections$Generic$ICollection$1$clear", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TKey ) + "$clear",
        "System$Collections$Generic$ICollection$1$contains", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TKey ) + "$contains",
        "copyTo", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TKey ) + "$copyTo",
        "Count", ["System$Collections$Generic$IReadOnlyCollection$1$" + Bridge.getTypeAlias( TKey ) + "$Count", "System$Collections$Generic$IReadOnlyCollection$1$Count"],
        "Count", "System$Collections$ICollection$Count",
        "Count", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TKey ) + "$Count",
        "System$Collections$Generic$ICollection$1$IsReadOnly", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TKey ) + "$IsReadOnly",
        "System$Collections$Generic$ICollection$1$remove", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TKey ) + "$remove",
        "GetEnumerator", ["System$Collections$Generic$IEnumerable$1$" + Bridge.getTypeAlias( TKey ) + "$GetEnumerator", "System$Collections$Generic$IEnumerable$1$GetEnumerator"]
      ],
      ctors: {
        ctor: function ( collection ) {
          this.$initialize();
          if ( collection == null ) {
            throw new System.ArgumentNullException.$ctor1( "collection" );
          }
          this._collection = collection;
        }
      },
      methods: {
        System$Collections$Generic$ICollection$1$add: function ( item ) {
          throw new System.NotSupportedException.$ctor1( System.Collections.ObjectModel.ReadOnlyDictionary$2( TKey, TValue ).NotSupported_ReadOnlyCollection );
        },
        System$Collections$Generic$ICollection$1$clear: function () {
          throw new System.NotSupportedException.$ctor1( System.Collections.ObjectModel.ReadOnlyDictionary$2( TKey, TValue ).NotSupported_ReadOnlyCollection );
        },
        System$Collections$Generic$ICollection$1$contains: function ( item ) {
          return System.Array.contains( this._collection, item, TKey );
        },
        copyTo: function ( array, arrayIndex ) {
          System.Array.copyTo( this._collection, array, arrayIndex, TKey );
        },
        System$Collections$ICollection$copyTo: function ( array, index ) {
          System.Collections.ObjectModel.ReadOnlyDictionaryHelpers.CopyToNonGenericICollectionHelper( TKey, this._collection, array, index );
        },
        System$Collections$Generic$ICollection$1$remove: function ( item ) {
          throw new System.NotSupportedException.$ctor1( System.Collections.ObjectModel.ReadOnlyDictionary$2( TKey, TValue ).NotSupported_ReadOnlyCollection );
        },
        GetEnumerator: function () {
          return Bridge.getEnumerator( this._collection, TKey );
        },
        System$Collections$IEnumerable$GetEnumerator: function () {
          return Bridge.getEnumerator( Bridge.cast( this._collection, System.Collections.IEnumerable ) );
        }
      }
    };
  } );

  // @source ValueCollection.js

  Bridge.define( "System.Collections.ObjectModel.ReadOnlyDictionary$2.ValueCollection", function ( TKey, TValue ) {
    return {
      inherits: [System.Collections.Generic.ICollection$1( TValue ), System.Collections.ICollection, System.Collections.Generic.IReadOnlyCollection$1( TValue )],
      $kind: "nested class",
      fields: {
        _collection: null
      },
      props: {
        Count: {
          get: function () {
            return System.Array.getCount( this._collection, TValue );
          }
        },
        System$Collections$Generic$ICollection$1$IsReadOnly: {
          get: function () {
            return true;
          }
        },
        System$Collections$ICollection$IsSynchronized: {
          get: function () {
            return false;
          }
        },
        System$Collections$ICollection$SyncRoot: {
          get: function () {
            return null;
          }
        }
      },
      alias: [
        "System$Collections$Generic$ICollection$1$add", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TValue ) + "$add",
        "System$Collections$Generic$ICollection$1$clear", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TValue ) + "$clear",
        "System$Collections$Generic$ICollection$1$contains", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TValue ) + "$contains",
        "copyTo", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TValue ) + "$copyTo",
        "Count", ["System$Collections$Generic$IReadOnlyCollection$1$" + Bridge.getTypeAlias( TValue ) + "$Count", "System$Collections$Generic$IReadOnlyCollection$1$Count"],
        "Count", "System$Collections$ICollection$Count",
        "Count", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TValue ) + "$Count",
        "System$Collections$Generic$ICollection$1$IsReadOnly", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TValue ) + "$IsReadOnly",
        "System$Collections$Generic$ICollection$1$remove", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( TValue ) + "$remove",
        "GetEnumerator", ["System$Collections$Generic$IEnumerable$1$" + Bridge.getTypeAlias( TValue ) + "$GetEnumerator", "System$Collections$Generic$IEnumerable$1$GetEnumerator"]
      ],
      ctors: {
        ctor: function ( collection ) {
          this.$initialize();
          if ( collection == null ) {
            throw new System.ArgumentNullException.$ctor1( "collection" );
          }
          this._collection = collection;
        }
      },
      methods: {
        System$Collections$Generic$ICollection$1$add: function ( item ) {
          throw new System.NotSupportedException.$ctor1( System.Collections.ObjectModel.ReadOnlyDictionary$2( TKey, TValue ).NotSupported_ReadOnlyCollection );
        },
        System$Collections$Generic$ICollection$1$clear: function () {
          throw new System.NotSupportedException.$ctor1( System.Collections.ObjectModel.ReadOnlyDictionary$2( TKey, TValue ).NotSupported_ReadOnlyCollection );
        },
        System$Collections$Generic$ICollection$1$contains: function ( item ) {
          return System.Array.contains( this._collection, item, TValue );
        },
        copyTo: function ( array, arrayIndex ) {
          System.Array.copyTo( this._collection, array, arrayIndex, TValue );
        },
        System$Collections$ICollection$copyTo: function ( array, index ) {
          System.Collections.ObjectModel.ReadOnlyDictionaryHelpers.CopyToNonGenericICollectionHelper( TValue, this._collection, array, index );
        },
        System$Collections$Generic$ICollection$1$remove: function ( item ) {
          throw new System.NotSupportedException.$ctor1( System.Collections.ObjectModel.ReadOnlyDictionary$2( TKey, TValue ).NotSupported_ReadOnlyCollection );
        },
        GetEnumerator: function () {
          return Bridge.getEnumerator( this._collection, TValue );
        },
        System$Collections$IEnumerable$GetEnumerator: function () {
          return Bridge.getEnumerator( Bridge.cast( this._collection, System.Collections.IEnumerable ) );
        }
      }
    };
  } );

  // @source ReadOnlyDictionaryHelpers.js

  Bridge.define( "System.Collections.ObjectModel.ReadOnlyDictionaryHelpers", {
    statics: {
      methods: {
        CopyToNonGenericICollectionHelper: function ( T, collection, array, index ) {
          var $t;
          if ( array == null ) {
            throw new System.ArgumentNullException.$ctor1( "array" );
          }

          if ( System.Array.getRank( array ) !== 1 ) {
            throw new System.ArgumentException.$ctor1( "Only single dimensional arrays are supported for the requested action." );
          }

          if ( System.Array.getLower( array, 0 ) !== 0 ) {
            throw new System.ArgumentException.$ctor1( "The lower bound of target array must be zero." );
          }

          if ( index < 0 ) {
            throw new System.ArgumentOutOfRangeException.$ctor4( "index", "Index is less than zero." );
          }

          if ( ( ( array.length - index ) | 0 ) < System.Array.getCount( collection, T ) ) {
            throw new System.ArgumentException.$ctor1( "Destination array is not long enough to copy all the items in the collection. Check array index and length." );
          }

          var nonGenericCollection = Bridge.as( collection, System.Collections.ICollection );
          if ( nonGenericCollection != null ) {
            System.Array.copyTo( nonGenericCollection, array, index );
            return;
          }

          var items = Bridge.as( array, System.Array.type( T ) );
          if ( items != null ) {
            System.Array.copyTo( collection, items, index, T );
          } else {
            /* 
               FxOverRh: Type.IsAssignableNot() not an api on that platform.

            //
            // Catch the obvious case assignment will fail.
            // We can found all possible problems by doing the check though.
            // For example, if the element type of the Array is derived from T,
            // we can't figure out if we can successfully copy the element beforehand.
            //
            Type targetType = array.GetType().GetElementType();
            Type sourceType = typeof(T);
            if (!(targetType.IsAssignableFrom(sourceType) || sourceType.IsAssignableFrom(targetType))) {
               throw new ArgumentException(SR.Argument_InvalidArrayType);
            }
            */

            var objects = Bridge.as( array, System.Array.type( System.Object ) );
            if ( objects == null ) {
              throw new System.ArgumentException.$ctor1( "Target array type is not compatible with the type of items in the collection." );
            }

            try {
              $t = Bridge.getEnumerator( collection, T );
              try {
                while ( $t.moveNext() ) {
                  var item = $t.Current;
                  objects[System.Array.index( Bridge.identity( index, ( ( index = ( index + 1 ) | 0 ) ) ), objects )] = item;
                }
              } finally {
                if ( Bridge.is( $t, System.IDisposable ) ) {
                  $t.System$IDisposable$Dispose();
                }
              }
            } catch ( $e1 ) {
              $e1 = System.Exception.create( $e1 );
              if ( Bridge.is( $e1, System.ArrayTypeMismatchException ) ) {
                throw new System.ArgumentException.$ctor1( "Target array type is not compatible with the type of items in the collection." );
              } else {
                throw $e1;
              }
            }
          }
        }
      }
    }
  } );

  // @source CollectionExtensions.js

  Bridge.define( "System.Collections.Generic.CollectionExtensions", {
    statics: {
      methods: {
        GetValueOrDefault: function ( TKey, TValue, dictionary, key ) {
          return System.Collections.Generic.CollectionExtensions.GetValueOrDefault$1( TKey, TValue, dictionary, key, Bridge.getDefaultValue( TValue ) );
        },
        GetValueOrDefault$1: function ( TKey, TValue, dictionary, key, defaultValue ) {
          if ( dictionary == null ) {
            throw new System.ArgumentNullException.$ctor1( "dictionary" );
          }

          var value = {};
          return dictionary["System$Collections$Generic$IReadOnlyDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$tryGetValue"]( key, value ) ? value.v : defaultValue;
        },
        TryAdd: function ( TKey, TValue, dictionary, key, value ) {
          if ( dictionary == null ) {
            throw new System.ArgumentNullException.$ctor1( "dictionary" );
          }

          if ( !dictionary["System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$containsKey"]( key ) ) {
            dictionary["System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$add"]( key, value );
            return true;
          }

          return false;
        },
        Remove: function ( TKey, TValue, dictionary, key, value ) {
          if ( dictionary == null ) {
            throw new System.ArgumentNullException.$ctor1( "dictionary" );
          }

          if ( dictionary["System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$tryGetValue"]( key, value ) ) {
            dictionary["System$Collections$Generic$IDictionary$2$" + Bridge.getTypeAlias( TKey ) + "$" + Bridge.getTypeAlias( TValue ) + "$remove"]( key );
            return true;
          }

          value.v = Bridge.getDefaultValue( TValue );
          return false;
        }
      }
    }
  } );

  // @source StringComparer.js

  Bridge.define( "System.StringComparer", {
    inherits: [System.Collections.Generic.IComparer$1( System.String ), System.Collections.Generic.IEqualityComparer$1( System.String )],
    statics: {
      fields: {
        _ordinal: null,
        _ordinalIgnoreCase: null
      },
      props: {
        Ordinal: {
          get: function () {
            return System.StringComparer._ordinal;
          }
        },
        OrdinalIgnoreCase: {
          get: function () {
            return System.StringComparer._ordinalIgnoreCase;
          }
        }
      },
      ctors: {
        init: function () {
          this._ordinal = new System.OrdinalComparer( false );
          this._ordinalIgnoreCase = new System.OrdinalComparer( true );
        }
      }
    },
    methods: {
      Compare: function ( x, y ) {
        if ( Bridge.referenceEquals( x, y ) ) {
          return 0;
        }
        if ( x == null ) {
          return -1;
        }
        if ( y == null ) {
          return 1;
        }

        var sa = Bridge.as( x, System.String );
        if ( sa != null ) {
          var sb = Bridge.as( y, System.String );
          if ( sb != null ) {
            return this.compare( sa, sb );
          }
        }

        var ia = Bridge.as( x, System.IComparable );
        if ( ia != null ) {
          return Bridge.compare( ia, y );
        }

        throw new System.ArgumentException.$ctor1( "At least one object must implement IComparable." );
      },
      Equals: function ( x, y ) {
        if ( Bridge.referenceEquals( x, y ) ) {
          return true;
        }
        if ( x == null || y == null ) {
          return false;
        }

        var sa = Bridge.as( x, System.String );
        if ( sa != null ) {
          var sb = Bridge.as( y, System.String );
          if ( sb != null ) {
            return this.equals2( sa, sb );
          }
        }
        return Bridge.equals( x, y );
      },
      GetHashCode: function ( obj ) {
        if ( obj == null ) {
          throw new System.ArgumentNullException.$ctor1( "obj" );
        }

        var s = Bridge.as( obj, System.String );
        if ( s != null ) {
          return this.getHashCode2( s );
        }
        return Bridge.getHashCode( obj );
      }
    }
  } );

  // @source OrdinalComparer.js

  Bridge.define( "System.OrdinalComparer", {
    inherits: [System.StringComparer],
    fields: {
      _ignoreCase: false
    },
    alias: [
      "compare", ["System$Collections$Generic$IComparer$1$System$String$compare", "System$Collections$Generic$IComparer$1$compare"],
      "equals2", ["System$Collections$Generic$IEqualityComparer$1$System$String$equals2", "System$Collections$Generic$IEqualityComparer$1$equals2"],
      "getHashCode2", ["System$Collections$Generic$IEqualityComparer$1$System$String$getHashCode2", "System$Collections$Generic$IEqualityComparer$1$getHashCode2"]
    ],
    ctors: {
      ctor: function ( ignoreCase ) {
        this.$initialize();
        System.StringComparer.ctor.call( this );
        this._ignoreCase = ignoreCase;
      }
    },
    methods: {
      compare: function ( x, y ) {
        if ( Bridge.referenceEquals( x, y ) ) {
          return 0;
        }
        if ( x == null ) {
          return -1;
        }
        if ( y == null ) {
          return 1;
        }

        if ( this._ignoreCase ) {
          return System.String.compare( x, y, 5 );
        }

        return System.String.compare( x, y, false );
      },
      equals2: function ( x, y ) {
        if ( Bridge.referenceEquals( x, y ) ) {
          return true;
        }
        if ( x == null || y == null ) {
          return false;
        }

        if ( this._ignoreCase ) {
          if ( x.length !== y.length ) {
            return false;
          }
          return ( System.String.compare( x, y, 5 ) === 0 );
        }
        return System.String.equals( x, y );
      },
      equals: function ( obj ) {
        var comparer = Bridge.as( obj, System.OrdinalComparer );
        if ( comparer == null ) {
          return false;
        }
        return ( this._ignoreCase === comparer._ignoreCase );
      },
      getHashCode2: function ( obj ) {
        if ( obj == null ) {
          throw new System.ArgumentNullException.$ctor1( "obj" );
        }

        if ( this._ignoreCase && obj != null ) {
          return Bridge.getHashCode( obj.toLowerCase() );
        }

        return Bridge.getHashCode( obj );
      },
      getHashCode: function () {
        var name = "OrdinalComparer";
        var hashCode = Bridge.getHashCode( name );
        return this._ignoreCase ? ( ~hashCode ) : hashCode;
      }
    }
  } );

  // @source CustomEnumerator.js

  Bridge.define( "Bridge.CustomEnumerator", {
    inherits: [System.Collections.IEnumerator, System.IDisposable],

    config: {
      properties: {
        Current: {
          get: function () {
            return this.getCurrent();
          }
        },

        Current$1: {
          get: function () {
            return this.getCurrent();
          }
        }
      },

      alias: [
        "getCurrent", "System$Collections$IEnumerator$getCurrent",
        "moveNext", "System$Collections$IEnumerator$moveNext",
        "reset", "System$Collections$IEnumerator$reset",
        "Dispose", "System$IDisposable$Dispose",
        "Current", "System$Collections$IEnumerator$Current"
      ]
    },

    ctor: function ( moveNext, getCurrent, reset, dispose, scope, T ) {
      this.$initialize();
      this.$moveNext = moveNext;
      this.$getCurrent = getCurrent;
      this.$Dispose = dispose;
      this.$reset = reset;
      this.scope = scope;

      if ( T ) {
        this["System$Collections$Generic$IEnumerator$1$" + Bridge.getTypeAlias( T ) + "$getCurrent$1"] = this.getCurrent;
        this["System$Collections$Generic$IEnumerator$1$getCurrent$1"] = this.getCurrent;

        Object.defineProperty( this, "System$Collections$Generic$IEnumerator$1$" + Bridge.getTypeAlias( T ) + "$Current$1", {
          get: this.getCurrent,
          enumerable: true
        } );

        Object.defineProperty( this, "System$Collections$Generic$IEnumerator$1$Current$1", {
          get: this.getCurrent,
          enumerable: true
        } );
      }
    },

    moveNext: function () {
      try {
        return this.$moveNext.call( this.scope );
      }
      catch ( ex ) {
        this.Dispose.call( this.scope );

        throw ex;
      }
    },

    getCurrent: function () {
      return this.$getCurrent.call( this.scope );
    },

    getCurrent$1: function () {
      return this.$getCurrent.call( this.scope );
    },

    reset: function () {
      if ( this.$reset ) {
        this.$reset.call( this.scope );
      }
    },

    Dispose: function () {
      if ( this.$Dispose ) {
        this.$Dispose.call( this.scope );
      }
    }
  } );

  // @source ArrayEnumerator.js

  Bridge.define( "Bridge.ArrayEnumerator", {
    inherits: [System.Collections.IEnumerator, System.IDisposable],

    statics: {
      $isArrayEnumerator: true
    },

    config: {
      properties: {
        Current: {
          get: function () {
            return this.getCurrent();
          }
        },

        Current$1: {
          get: function () {
            return this.getCurrent();
          }
        }
      },

      alias: [
        "getCurrent", "System$Collections$IEnumerator$getCurrent",
        "moveNext", "System$Collections$IEnumerator$moveNext",
        "reset", "System$Collections$IEnumerator$reset",
        "Dispose", "System$IDisposable$Dispose",
        "Current", "System$Collections$IEnumerator$Current"
      ]
    },

    ctor: function ( array, T ) {
      this.$initialize();
      this.array = array;
      this.reset();

      if ( T ) {
        this["System$Collections$Generic$IEnumerator$1$" + Bridge.getTypeAlias( T ) + "$getCurrent$1"] = this.getCurrent;
        this["System$Collections$Generic$IEnumerator$1$getCurrent$1"] = this.getCurrent;

        Object.defineProperty( this, "System$Collections$Generic$IEnumerator$1$" + Bridge.getTypeAlias( T ) + "$Current$1", {
          get: this.getCurrent,
          enumerable: true
        } );

        Object.defineProperty( this, "System$Collections$Generic$IEnumerator$1$Current$1", {
          get: this.getCurrent,
          enumerable: true
        } );
      }
    },

    moveNext: function () {
      this.index++;

      return this.index < this.array.length;
    },

    getCurrent: function () {
      return this.array[this.index];
    },

    getCurrent$1: function () {
      return this.array[this.index];
    },

    reset: function () {
      this.index = -1;
    },

    Dispose: Bridge.emptyFn
  } );

  Bridge.define( "Bridge.ArrayEnumerable", {
    inherits: [System.Collections.IEnumerable],

    config: {
      alias: [
        "GetEnumerator", "System$Collections$IEnumerable$GetEnumerator"
      ]
    },

    ctor: function ( array ) {
      this.$initialize();
      this.array = array;
    },

    GetEnumerator: function () {
      return new Bridge.ArrayEnumerator( this.array );
    }
  } );

  // @source EqualityComparer.js

  Bridge.define( "System.Collections.Generic.EqualityComparer$1", function ( T ) {
    return {
      inherits: [System.Collections.Generic.IEqualityComparer$1( T )],

      statics: {
        config: {
          init: function () {
            this.def = new ( System.Collections.Generic.EqualityComparer$1( T ) )();
          }
        }
      },

      config: {
        alias: [
          "equals2", ["System$Collections$Generic$IEqualityComparer$1$" + Bridge.getTypeAlias( T ) + "$equals2", "System$Collections$Generic$IEqualityComparer$1$equals2"],
          "getHashCode2", ["System$Collections$Generic$IEqualityComparer$1$" + Bridge.getTypeAlias( T ) + "$getHashCode2", "System$Collections$Generic$IEqualityComparer$1$getHashCode2"]
        ]
      },

      equals2: function ( x, y ) {
        if ( !Bridge.isDefined( x, true ) ) {
          return !Bridge.isDefined( y, true );
        } else if ( Bridge.isDefined( y, true ) ) {
          var isBridge = x && x.$$name;

          if ( Bridge.isFunction( x ) && Bridge.isFunction( y ) ) {
            return Bridge.fn.equals.call( x, y );
          } else if ( !isBridge || x && x.$boxed || y && y.$boxed ) {
            return Bridge.equals( x, y );
          } else if ( Bridge.isFunction( x.equalsT ) ) {
            return Bridge.equalsT( x, y );
          } else if ( Bridge.isFunction( x.equals ) ) {
            return Bridge.equals( x, y );
          }

          return x === y;
        }

        return false;
      },

      getHashCode2: function ( obj ) {
        return Bridge.isDefined( obj, true ) ? Bridge.getHashCode( obj ) : 0;
      }
    };
  } );

  System.Collections.Generic.EqualityComparer$1.$default = new ( System.Collections.Generic.EqualityComparer$1( System.Object ) )();

  // @source Comparer.js

  Bridge.define( "System.Collections.Generic.Comparer$1", function ( T ) {
    return {
      inherits: [System.Collections.Generic.IComparer$1( T )],

      ctor: function ( fn ) {
        this.$initialize();
        this.fn = fn;
        this.compare = fn;
        this["System$Collections$Generic$IComparer$1$" + Bridge.getTypeAlias( T ) + "$compare"] = fn;
        this["System$Collections$Generic$IComparer$1$compare"] = fn;
      }
    };
  } );

  System.Collections.Generic.Comparer$1.$default = new ( System.Collections.Generic.Comparer$1( System.Object ) )( function ( x, y ) {
    if ( !Bridge.hasValue( x ) ) {
      return !Bridge.hasValue( y ) ? 0 : -1;
    } else if ( !Bridge.hasValue( y ) ) {
      return 1;
    }

    return Bridge.compare( x, y );
  } );

  System.Collections.Generic.Comparer$1.get = function ( obj, T ) {
    var m;

    if ( T && ( m = obj["System$Collections$Generic$IComparer$1$" + Bridge.getTypeAlias( T ) + "$compare"] ) ) {
      return m.bind( obj );
    }

    if ( m = obj["System$Collections$Generic$IComparer$1$compare"] ) {
      return m.bind( obj );
    }

    return obj.compare.bind( obj );
  };

  // @source Dictionary.js

  System.Collections.Generic.Dictionary$2.getTypeParameters = function ( type ) {
    var interfaceType;

    if ( System.String.startsWith( type.$$name, "System.Collections.Generic.IDictionary" ) ) {
      interfaceType = type;
    } else {
      var interfaces = Bridge.Reflection.getInterfaces( type );

      for ( var j = 0; j < interfaces.length; j++ ) {
        if ( System.String.startsWith( interfaces[j].$$name, "System.Collections.Generic.IDictionary" ) ) {
          interfaceType = interfaces[j];

          break;
        }
      }
    }

    var typesGeneric = interfaceType ? Bridge.Reflection.getGenericArguments( interfaceType ) : null;
    var typeKey = typesGeneric ? typesGeneric[0] : null;
    var typeValue = typesGeneric ? typesGeneric[1] : null;

    return [typeKey, typeValue];
  };
  // @source List.js

  Bridge.define( "System.Collections.Generic.List$1", function ( T ) {
    return {
      inherits: [System.Collections.Generic.IList$1( T ), System.Collections.IList, System.Collections.Generic.IReadOnlyList$1( T )],
      statics: {
        fields: {
          _defaultCapacity: 0,
          _emptyArray: null
        },
        ctors: {
          init: function () {
            this._defaultCapacity = 4;
            this._emptyArray = System.Array.init( 0, function () {
              return Bridge.getDefaultValue( T );
            }, T );
          }
        },
        methods: {
          IsCompatibleObject: function ( value ) {
            return ( ( Bridge.is( value, T ) ) || ( value == null && Bridge.getDefaultValue( T ) == null ) );
          }
        }
      },
      fields: {
        _items: null,
        _size: 0,
        _version: 0
      },
      props: {
        Capacity: {
          get: function () {
            return this._items.length;
          },
          set: function ( value ) {
            if ( value < this._size ) {
              throw new System.ArgumentOutOfRangeException.$ctor1( "value" );
            }

            if ( value !== this._items.length ) {
              if ( value > 0 ) {
                var newItems = System.Array.init( value, function () {
                  return Bridge.getDefaultValue( T );
                }, T );
                if ( this._size > 0 ) {
                  System.Array.copy( this._items, 0, newItems, 0, this._size );
                }
                this._items = newItems;
              } else {
                this._items = System.Collections.Generic.List$1( T )._emptyArray;
              }
            }
          }
        },
        Count: {
          get: function () {
            return this._size;
          }
        },
        System$Collections$IList$IsFixedSize: {
          get: function () {
            return false;
          }
        },
        System$Collections$Generic$ICollection$1$IsReadOnly: {
          get: function () {
            return false;
          }
        },
        System$Collections$IList$IsReadOnly: {
          get: function () {
            return false;
          }
        },
        System$Collections$ICollection$IsSynchronized: {
          get: function () {
            return false;
          }
        },
        System$Collections$ICollection$SyncRoot: {
          get: function () {
            return this;
          }
        }
      },
      alias: [
        "Count", ["System$Collections$Generic$IReadOnlyCollection$1$" + Bridge.getTypeAlias( T ) + "$Count", "System$Collections$Generic$IReadOnlyCollection$1$Count"],
        "Count", "System$Collections$ICollection$Count",
        "Count", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( T ) + "$Count",
        "System$Collections$Generic$ICollection$1$IsReadOnly", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( T ) + "$IsReadOnly",
        "getItem", ["System$Collections$Generic$IReadOnlyList$1$" + Bridge.getTypeAlias( T ) + "$getItem", "System$Collections$Generic$IReadOnlyList$1$getItem"],
        "setItem", ["System$Collections$Generic$IReadOnlyList$1$" + Bridge.getTypeAlias( T ) + "$setItem", "System$Collections$Generic$IReadOnlyList$1$setItem"],
        "getItem", "System$Collections$Generic$IList$1$" + Bridge.getTypeAlias( T ) + "$getItem",
        "setItem", "System$Collections$Generic$IList$1$" + Bridge.getTypeAlias( T ) + "$setItem",
        "add", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( T ) + "$add",
        "clear", "System$Collections$IList$clear",
        "clear", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( T ) + "$clear",
        "contains", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( T ) + "$contains",
        "copyTo", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( T ) + "$copyTo",
        "System$Collections$Generic$IEnumerable$1$GetEnumerator", "System$Collections$Generic$IEnumerable$1$" + Bridge.getTypeAlias( T ) + "$GetEnumerator",
        "indexOf", "System$Collections$Generic$IList$1$" + Bridge.getTypeAlias( T ) + "$indexOf",
        "insert", "System$Collections$Generic$IList$1$" + Bridge.getTypeAlias( T ) + "$insert",
        "remove", "System$Collections$Generic$ICollection$1$" + Bridge.getTypeAlias( T ) + "$remove",
        "removeAt", "System$Collections$IList$removeAt",
        "removeAt", "System$Collections$Generic$IList$1$" + Bridge.getTypeAlias( T ) + "$removeAt"
      ],
      ctors: {
        ctor: function () {
          this.$initialize();
          this._items = System.Collections.Generic.List$1( T )._emptyArray;
        },
        $ctor2: function ( capacity ) {
          this.$initialize();
          if ( capacity < 0 ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "capacity" );
          }

          if ( capacity === 0 ) {
            this._items = System.Collections.Generic.List$1( T )._emptyArray;
          } else {
            this._items = System.Array.init( capacity, function () {
              return Bridge.getDefaultValue( T );
            }, T );
          }
        },
        $ctor1: function ( collection ) {
          this.$initialize();
          if ( collection == null ) {
            throw new System.ArgumentNullException.$ctor1( "collection" );
          }

          var c = Bridge.as( collection, System.Collections.Generic.ICollection$1( T ) );
          if ( c != null ) {
            var count = System.Array.getCount( c, T );
            if ( count === 0 ) {
              this._items = System.Collections.Generic.List$1( T )._emptyArray;
            } else {
              this._items = System.Array.init( count, function () {
                return Bridge.getDefaultValue( T );
              }, T );
              System.Array.copyTo( c, this._items, 0, T );
              this._size = count;
            }
          } else {
            this._size = 0;
            this._items = System.Collections.Generic.List$1( T )._emptyArray;

            var en = Bridge.getEnumerator( collection, T );
            try {
              while ( en.System$Collections$IEnumerator$moveNext() ) {
                this.add( en[Bridge.geti( en, "System$Collections$Generic$IEnumerator$1$" + Bridge.getTypeAlias( T ) + "$Current$1", "System$Collections$Generic$IEnumerator$1$Current$1" )] );
              }
            }
            finally {
              if ( Bridge.hasValue( en ) ) {
                en.System$IDisposable$Dispose();
              }
            }
          }
        }
      },
      methods: {
        getItem: function ( index ) {
          if ( ( index >>> 0 ) >= ( this._size >>> 0 ) ) {
            throw new System.ArgumentOutOfRangeException.ctor();
          }
          return this._items[System.Array.index( index, this._items )];
        },
        setItem: function ( index, value ) {
          if ( ( index >>> 0 ) >= ( this._size >>> 0 ) ) {
            throw new System.ArgumentOutOfRangeException.ctor();
          }
          this._items[System.Array.index( index, this._items )] = value;
          this._version = ( this._version + 1 ) | 0;
        },
        System$Collections$IList$getItem: function ( index ) {
          return this.getItem( index );
        },
        System$Collections$IList$setItem: function ( index, value ) {
          if ( value == null && !( Bridge.getDefaultValue( T ) == null ) ) {
            throw new System.ArgumentNullException.$ctor1( "value" );
          }

          try {
            this.setItem( index, Bridge.cast( Bridge.unbox( value, T ), T ) );
          } catch ( $e1 ) {
            $e1 = System.Exception.create( $e1 );
            if ( Bridge.is( $e1, System.InvalidCastException ) ) {
              throw new System.ArgumentException.$ctor1( "value" );
            } else {
              throw $e1;
            }
          }
        },
        add: function ( item ) {
          if ( this._size === this._items.length ) {
            this.EnsureCapacity( ( ( this._size + 1 ) | 0 ) );
          }
          this._items[System.Array.index( Bridge.identity( this._size, ( ( this._size = ( this._size + 1 ) | 0 ) ) ), this._items )] = item;
          this._version = ( this._version + 1 ) | 0;
        },
        System$Collections$IList$add: function ( item ) {
          if ( item == null && !( Bridge.getDefaultValue( T ) == null ) ) {
            throw new System.ArgumentNullException.$ctor1( "item" );
          }

          try {
            this.add( Bridge.cast( Bridge.unbox( item, T ), T ) );
          } catch ( $e1 ) {
            $e1 = System.Exception.create( $e1 );
            if ( Bridge.is( $e1, System.InvalidCastException ) ) {
              throw new System.ArgumentException.$ctor1( "item" );
            } else {
              throw $e1;
            }
          }

          return ( ( this.Count - 1 ) | 0 );
        },
        AddRange: function ( collection ) {
          this.InsertRange( this._size, collection );
        },
        AsReadOnly: function () {
          return new ( System.Collections.ObjectModel.ReadOnlyCollection$1( T ) )( this );
        },
        BinarySearch$2: function ( index, count, item, comparer ) {
          if ( index < 0 ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "index" );
          }
          if ( count < 0 ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "count" );
          }
          if ( ( ( this._size - index ) | 0 ) < count ) {
            throw new System.ArgumentException.ctor();
          }

          return System.Array.binarySearch( this._items, index, count, item, comparer );
        },
        BinarySearch: function ( item ) {
          return this.BinarySearch$2( 0, this.Count, item, null );
        },
        BinarySearch$1: function ( item, comparer ) {
          return this.BinarySearch$2( 0, this.Count, item, comparer );
        },
        clear: function () {
          if ( this._size > 0 ) {
            System.Array.fill( this._items, function () {
              return Bridge.getDefaultValue( T );
            }, 0, this._size );
            this._size = 0;
          }
          this._version = ( this._version + 1 ) | 0;
        },
        contains: function ( item ) {
          if ( item == null ) {
            for ( var i = 0; i < this._size; i = ( i + 1 ) | 0 ) {
              if ( this._items[System.Array.index( i, this._items )] == null ) {
                return true;
              }
            }
            return false;
          } else {
            var c = System.Collections.Generic.EqualityComparer$1( T ).def;
            for ( var i1 = 0; i1 < this._size; i1 = ( i1 + 1 ) | 0 ) {
              if ( c.equals2( this._items[System.Array.index( i1, this._items )], item ) ) {
                return true;
              }
            }
            return false;
          }
        },
        System$Collections$IList$contains: function ( item ) {
          if ( System.Collections.Generic.List$1( T ).IsCompatibleObject( item ) ) {
            return this.contains( Bridge.cast( Bridge.unbox( item, T ), T ) );
          }
          return false;
        },
        ConvertAll: function ( TOutput, converter ) {
          if ( Bridge.staticEquals( converter, null ) ) {
            throw new System.ArgumentNullException.$ctor1( "converter" );
          }

          var list = new ( System.Collections.Generic.List$1( TOutput ) ).$ctor2( this._size );
          for ( var i = 0; i < this._size; i = ( i + 1 ) | 0 ) {
            list._items[System.Array.index( i, list._items )] = converter( this._items[System.Array.index( i, this._items )] );
          }
          list._size = this._size;
          return list;
        },
        CopyTo: function ( array ) {
          this.copyTo( array, 0 );
        },
        System$Collections$ICollection$copyTo: function ( array, arrayIndex ) {
          if ( ( array != null ) && ( System.Array.getRank( array ) !== 1 ) ) {
            throw new System.ArgumentException.$ctor1( "array" );
          }

          System.Array.copy( this._items, 0, array, arrayIndex, this._size );
        },
        CopyTo$1: function ( index, array, arrayIndex, count ) {
          if ( ( ( this._size - index ) | 0 ) < count ) {
            throw new System.ArgumentException.ctor();
          }

          System.Array.copy( this._items, index, array, arrayIndex, count );
        },
        copyTo: function ( array, arrayIndex ) {
          System.Array.copy( this._items, 0, array, arrayIndex, this._size );
        },
        EnsureCapacity: function ( min ) {
          if ( this._items.length < min ) {
            var newCapacity = this._items.length === 0 ? System.Collections.Generic.List$1( T )._defaultCapacity : Bridge.Int.mul( this._items.length, 2 );
            if ( ( newCapacity >>> 0 ) > 2146435071 ) {
              newCapacity = 2146435071;
            }
            if ( newCapacity < min ) {
              newCapacity = min;
            }
            this.Capacity = newCapacity;
          }
        },
        Exists: function ( match ) {
          return this.FindIndex$2( match ) !== -1;
        },
        Find: function ( match ) {
          if ( Bridge.staticEquals( match, null ) ) {
            throw new System.ArgumentNullException.$ctor1( "match" );
          }

          for ( var i = 0; i < this._size; i = ( i + 1 ) | 0 ) {
            if ( match( this._items[System.Array.index( i, this._items )] ) ) {
              return this._items[System.Array.index( i, this._items )];
            }
          }
          return Bridge.getDefaultValue( T );
        },
        FindAll: function ( match ) {
          if ( Bridge.staticEquals( match, null ) ) {
            throw new System.ArgumentNullException.$ctor1( "match" );
          }

          var list = new ( System.Collections.Generic.List$1( T ) ).ctor();
          for ( var i = 0; i < this._size; i = ( i + 1 ) | 0 ) {
            if ( match( this._items[System.Array.index( i, this._items )] ) ) {
              list.add( this._items[System.Array.index( i, this._items )] );
            }
          }
          return list;
        },
        FindIndex$2: function ( match ) {
          return this.FindIndex( 0, this._size, match );
        },
        FindIndex$1: function ( startIndex, match ) {
          return this.FindIndex( startIndex, ( ( this._size - startIndex ) | 0 ), match );
        },
        FindIndex: function ( startIndex, count, match ) {
          if ( ( startIndex >>> 0 ) > ( this._size >>> 0 ) ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "startIndex" );
          }

          if ( count < 0 || startIndex > ( ( this._size - count ) | 0 ) ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "count" );
          }

          if ( Bridge.staticEquals( match, null ) ) {
            throw new System.ArgumentNullException.$ctor1( "match" );
          }

          var endIndex = ( startIndex + count ) | 0;
          for ( var i = startIndex; i < endIndex; i = ( i + 1 ) | 0 ) {
            if ( match( this._items[System.Array.index( i, this._items )] ) ) {
              return i;
            }
          }
          return -1;
        },
        FindLast: function ( match ) {
          if ( Bridge.staticEquals( match, null ) ) {
            throw new System.ArgumentNullException.$ctor1( "match" );
          }

          for ( var i = ( this._size - 1 ) | 0; i >= 0; i = ( i - 1 ) | 0 ) {
            if ( match( this._items[System.Array.index( i, this._items )] ) ) {
              return this._items[System.Array.index( i, this._items )];
            }
          }
          return Bridge.getDefaultValue( T );
        },
        FindLastIndex$2: function ( match ) {
          return this.FindLastIndex( ( ( this._size - 1 ) | 0 ), this._size, match );
        },
        FindLastIndex$1: function ( startIndex, match ) {
          return this.FindLastIndex( startIndex, ( ( startIndex + 1 ) | 0 ), match );
        },
        FindLastIndex: function ( startIndex, count, match ) {
          if ( Bridge.staticEquals( match, null ) ) {
            throw new System.ArgumentNullException.$ctor1( "match" );
          }

          if ( this._size === 0 ) {
            if ( startIndex !== -1 ) {
              throw new System.ArgumentOutOfRangeException.$ctor1( "startIndex" );
            }
          } else {
            if ( ( startIndex >>> 0 ) >= ( this._size >>> 0 ) ) {
              throw new System.ArgumentOutOfRangeException.$ctor1( "startIndex" );
            }
          }

          if ( count < 0 || ( ( ( ( startIndex - count ) | 0 ) + 1 ) | 0 ) < 0 ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "count" );
          }

          var endIndex = ( startIndex - count ) | 0;
          for ( var i = startIndex; i > endIndex; i = ( i - 1 ) | 0 ) {
            if ( match( this._items[System.Array.index( i, this._items )] ) ) {
              return i;
            }
          }
          return -1;
        },
        ForEach: function ( action ) {
          if ( Bridge.staticEquals( action, null ) ) {
            throw new System.ArgumentNullException.$ctor1( "match" );
          }

          var version = this._version;

          for ( var i = 0; i < this._size; i = ( i + 1 ) | 0 ) {
            if ( version !== this._version ) {
              break;
            }
            action( this._items[System.Array.index( i, this._items )] );
          }

          if ( version !== this._version ) {
            throw new System.InvalidOperationException.ctor();
          }
        },
        GetEnumerator: function () {
          return new ( System.Collections.Generic.List$1.Enumerator( T ) ).$ctor1( this );
        },
        System$Collections$Generic$IEnumerable$1$GetEnumerator: function () {
          return new ( System.Collections.Generic.List$1.Enumerator( T ) ).$ctor1( this ).$clone();
        },
        System$Collections$IEnumerable$GetEnumerator: function () {
          return new ( System.Collections.Generic.List$1.Enumerator( T ) ).$ctor1( this ).$clone();
        },
        GetRange: function ( index, count ) {
          if ( index < 0 ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "index" );
          }

          if ( count < 0 ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "count" );
          }

          if ( ( ( this._size - index ) | 0 ) < count ) {
            throw new System.ArgumentException.ctor();
          }

          var list = new ( System.Collections.Generic.List$1( T ) ).$ctor2( count );
          System.Array.copy( this._items, index, list._items, 0, count );
          list._size = count;
          return list;
        },
        indexOf: function ( item ) {
          return System.Array.indexOfT( this._items, item, 0, this._size );
        },
        System$Collections$IList$indexOf: function ( item ) {
          if ( System.Collections.Generic.List$1( T ).IsCompatibleObject( item ) ) {
            return this.indexOf( Bridge.cast( Bridge.unbox( item, T ), T ) );
          }
          return -1;
        },
        IndexOf: function ( item, index ) {
          if ( index > this._size ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "index" );
          }
          return System.Array.indexOfT( this._items, item, index, ( ( this._size - index ) | 0 ) );
        },
        IndexOf$1: function ( item, index, count ) {
          if ( index > this._size ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "index" );
          }

          if ( count < 0 || index > ( ( this._size - count ) | 0 ) ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "count" );
          }

          return System.Array.indexOfT( this._items, item, index, count );
        },
        insert: function ( index, item ) {
          if ( ( index >>> 0 ) > ( this._size >>> 0 ) ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "index" );
          }
          if ( this._size === this._items.length ) {
            this.EnsureCapacity( ( ( this._size + 1 ) | 0 ) );
          }
          if ( index < this._size ) {
            System.Array.copy( this._items, index, this._items, ( ( index + 1 ) | 0 ), ( ( this._size - index ) | 0 ) );
          }
          this._items[System.Array.index( index, this._items )] = item;
          this._size = ( this._size + 1 ) | 0;
          this._version = ( this._version + 1 ) | 0;
        },
        System$Collections$IList$insert: function ( index, item ) {
          if ( item == null && !( Bridge.getDefaultValue( T ) == null ) ) {
            throw new System.ArgumentNullException.$ctor1( "item" );
          }

          try {
            this.insert( index, Bridge.cast( Bridge.unbox( item, T ), T ) );
          } catch ( $e1 ) {
            $e1 = System.Exception.create( $e1 );
            if ( Bridge.is( $e1, System.InvalidCastException ) ) {
              throw new System.ArgumentException.$ctor1( "item" );
            } else {
              throw $e1;
            }
          }
        },
        InsertRange: function ( index, collection ) {
          if ( collection == null ) {
            throw new System.ArgumentNullException.$ctor1( "collection" );
          }

          if ( ( index >>> 0 ) > ( this._size >>> 0 ) ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "index" );
          }

          var c = Bridge.as( collection, System.Collections.Generic.ICollection$1( T ) );
          if ( c != null ) {
            var count = System.Array.getCount( c, T );
            if ( count > 0 ) {
              this.EnsureCapacity( ( ( this._size + count ) | 0 ) );
              if ( index < this._size ) {
                System.Array.copy( this._items, index, this._items, ( ( index + count ) | 0 ), ( ( this._size - index ) | 0 ) );
              }

              if ( Bridge.referenceEquals( this, c ) ) {
                System.Array.copy( this._items, 0, this._items, index, index );
                System.Array.copy( this._items, ( ( index + count ) | 0 ), this._items, Bridge.Int.mul( index, 2 ), ( ( this._size - index ) | 0 ) );
              } else {
                var itemsToInsert = System.Array.init( count, function () {
                  return Bridge.getDefaultValue( T );
                }, T );
                System.Array.copyTo( c, itemsToInsert, 0, T );
                System.Array.copy( itemsToInsert, 0, this._items, index, itemsToInsert.length );
              }
              this._size = ( this._size + count ) | 0;
            }
          } else {
            var en = Bridge.getEnumerator( collection, T );
            try {
              while ( en.System$Collections$IEnumerator$moveNext() ) {
                this.insert( Bridge.identity( index, ( ( index = ( index + 1 ) | 0 ) ) ), en[Bridge.geti( en, "System$Collections$Generic$IEnumerator$1$" + Bridge.getTypeAlias( T ) + "$Current$1", "System$Collections$Generic$IEnumerator$1$Current$1" )] );
              }
            }
            finally {
              if ( Bridge.hasValue( en ) ) {
                en.System$IDisposable$Dispose();
              }
            }
          }
          this._version = ( this._version + 1 ) | 0;
        },
        LastIndexOf: function ( item ) {
          if ( this._size === 0 ) {
            return -1;
          } else {
            return this.LastIndexOf$2( item, ( ( this._size - 1 ) | 0 ), this._size );
          }
        },
        LastIndexOf$1: function ( item, index ) {
          if ( index >= this._size ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "index" );
          }
          return this.LastIndexOf$2( item, index, ( ( index + 1 ) | 0 ) );
        },
        LastIndexOf$2: function ( item, index, count ) {
          if ( ( this.Count !== 0 ) && ( index < 0 ) ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "index" );
          }

          if ( ( this.Count !== 0 ) && ( count < 0 ) ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "count" );
          }

          if ( this._size === 0 ) {
            return -1;
          }

          if ( index >= this._size ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "index" );
          }

          if ( count > ( ( index + 1 ) | 0 ) ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "count" );
          }

          return System.Array.lastIndexOfT( this._items, item, index, count );
        },
        remove: function ( item ) {
          var index = this.indexOf( item );
          if ( index >= 0 ) {
            this.removeAt( index );
            return true;
          }

          return false;
        },
        System$Collections$IList$remove: function ( item ) {
          if ( System.Collections.Generic.List$1( T ).IsCompatibleObject( item ) ) {
            this.remove( Bridge.cast( Bridge.unbox( item, T ), T ) );
          }
        },
        RemoveAll: function ( match ) {
          if ( Bridge.staticEquals( match, null ) ) {
            throw new System.ArgumentNullException.$ctor1( "match" );
          }

          var freeIndex = 0;

          while ( freeIndex < this._size && !match( this._items[System.Array.index( freeIndex, this._items )] ) ) {
            freeIndex = ( freeIndex + 1 ) | 0;
          }
          if ( freeIndex >= this._size ) {
            return 0;
          }

          var current = ( freeIndex + 1 ) | 0;
          while ( current < this._size ) {
            while ( current < this._size && match( this._items[System.Array.index( current, this._items )] ) ) {
              current = ( current + 1 ) | 0;
            }

            if ( current < this._size ) {
              this._items[System.Array.index( Bridge.identity( freeIndex, ( ( freeIndex = ( freeIndex + 1 ) | 0 ) ) ), this._items )] = this._items[System.Array.index( Bridge.identity( current, ( ( current = ( current + 1 ) | 0 ) ) ), this._items )];
            }
          }

          System.Array.fill( this._items, function () {
            return Bridge.getDefaultValue( T );
          }, freeIndex, ( ( this._size - freeIndex ) | 0 ) );
          var result = ( this._size - freeIndex ) | 0;
          this._size = freeIndex;
          this._version = ( this._version + 1 ) | 0;
          return result;
        },
        removeAt: function ( index ) {
          if ( ( index >>> 0 ) >= ( this._size >>> 0 ) ) {
            throw new System.ArgumentOutOfRangeException.ctor();
          }
          this._size = ( this._size - 1 ) | 0;
          if ( index < this._size ) {
            System.Array.copy( this._items, ( ( index + 1 ) | 0 ), this._items, index, ( ( this._size - index ) | 0 ) );
          }
          this._items[System.Array.index( this._size, this._items )] = Bridge.getDefaultValue( T );
          this._version = ( this._version + 1 ) | 0;
        },
        RemoveRange: function ( index, count ) {
          if ( index < 0 ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "index" );
          }

          if ( count < 0 ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "count" );
          }

          if ( ( ( this._size - index ) | 0 ) < count ) {
            throw new System.ArgumentException.ctor();
          }

          if ( count > 0 ) {
            var i = this._size;
            this._size = ( this._size - count ) | 0;
            if ( index < this._size ) {
              System.Array.copy( this._items, ( ( index + count ) | 0 ), this._items, index, ( ( this._size - index ) | 0 ) );
            }
            System.Array.fill( this._items, function () {
              return Bridge.getDefaultValue( T );
            }, this._size, count );
            this._version = ( this._version + 1 ) | 0;
          }
        },
        Reverse: function () {
          this.Reverse$1( 0, this.Count );
        },
        Reverse$1: function ( index, count ) {
          if ( index < 0 ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "index" );
          }

          if ( count < 0 ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "count" );
          }

          if ( ( ( this._size - index ) | 0 ) < count ) {
            throw new System.ArgumentException.ctor();
          }
          System.Array.reverse( this._items, index, count );
          this._version = ( this._version + 1 ) | 0;
        },
        Sort: function () {
          this.Sort$3( 0, this.Count, null );
        },
        Sort$1: function ( comparer ) {
          this.Sort$3( 0, this.Count, comparer );
        },
        Sort$3: function ( index, count, comparer ) {
          if ( index < 0 ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "index" );
          }

          if ( count < 0 ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "count" );
          }

          if ( ( ( this._size - index ) | 0 ) < count ) {
            throw new System.ArgumentException.ctor();
          }

          System.Array.sort( this._items, index, count, comparer );
          this._version = ( this._version + 1 ) | 0;
        },
        Sort$2: function ( comparison ) {
          if ( Bridge.staticEquals( comparison, null ) ) {
            throw new System.ArgumentNullException.$ctor1( "comparison" );
          }

          if ( this._size > 0 ) {
            if ( this._items.length === this._size ) {
              System.Array.sort( this._items, comparison );
            } else {
              var newItems = System.Array.init( this._size, function () {
                return Bridge.getDefaultValue( T );
              }, T );
              System.Array.copy( this._items, 0, newItems, 0, this._size );
              System.Array.sort( newItems, comparison );
              System.Array.copy( newItems, 0, this._items, 0, this._size );
            }
          }
        },
        ToArray: function () {

          var array = System.Array.init( this._size, function () {
            return Bridge.getDefaultValue( T );
          }, T );
          System.Array.copy( this._items, 0, array, 0, this._size );
          return array;
        },
        TrimExcess: function () {
          var threshold = Bridge.Int.clip32( this._items.length * 0.9 );
          if ( this._size < threshold ) {
            this.Capacity = this._size;
          }
        },
        TrueForAll: function ( match ) {
          if ( Bridge.staticEquals( match, null ) ) {
            throw new System.ArgumentNullException.$ctor1( "match" );
          }

          for ( var i = 0; i < this._size; i = ( i + 1 ) | 0 ) {
            if ( !match( this._items[System.Array.index( i, this._items )] ) ) {
              return false;
            }
          }
          return true;
        },
        toJSON: function () {
          var newItems = System.Array.init( this._size, function () {
            return Bridge.getDefaultValue( T );
          }, T );
          if ( this._size > 0 ) {
            System.Array.copy( this._items, 0, newItems, 0, this._size );
          }

          return newItems;
        }
      }
    };
  } );

  // @source KeyNotFoundException.js

  Bridge.define( "System.Collections.Generic.KeyNotFoundException", {
    inherits: [System.SystemException],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.SystemException.$ctor1.call( this, "The given key was not present in the dictionary." );
        this.HResult = -2146232969;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2146232969;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, innerException );
        this.HResult = -2146232969;
      }
    }
  } );

  // @source List.js

  System.Collections.Generic.List$1.getElementType = function ( type ) {
    var interfaceType;

    if ( System.String.startsWith( type.$$name, "System.Collections.Generic.IList" ) ) {
      interfaceType = type;
    } else {
      var interfaces = Bridge.Reflection.getInterfaces( type );

      for ( var j = 0; j < interfaces.length; j++ ) {
        if ( System.String.startsWith( interfaces[j].$$name, "System.Collections.Generic.IList" ) ) {
          interfaceType = interfaces[j];

          break;
        }
      }
    }

    return interfaceType ? Bridge.Reflection.getGenericArguments( interfaceType )[0] : null;
  };

  // @source CharEnumerator.js

  Bridge.define( "System.CharEnumerator", {
    inherits: [System.Collections.IEnumerator, System.Collections.Generic.IEnumerator$1( System.Char ), System.IDisposable, System.ICloneable],
    fields: {
      _str: null,
      _index: 0,
      _currentElement: 0
    },
    props: {
      System$Collections$IEnumerator$Current: {
        get: function () {
          return Bridge.box( this.Current, System.Char, String.fromCharCode, System.Char.getHashCode );
        }
      },
      Current: {
        get: function () {
          if ( this._index === -1 ) {
            throw new System.InvalidOperationException.$ctor1( "Enumeration has not started. Call MoveNext." );
          }
          if ( this._index >= this._str.length ) {
            throw new System.InvalidOperationException.$ctor1( "Enumeration already finished." );
          }
          return this._currentElement;
        }
      }
    },
    alias: [
      "clone", "System$ICloneable$clone",
      "moveNext", "System$Collections$IEnumerator$moveNext",
      "Dispose", "System$IDisposable$Dispose",
      "Current", ["System$Collections$Generic$IEnumerator$1$System$Char$Current$1", "System$Collections$Generic$IEnumerator$1$Current$1"],
      "reset", "System$Collections$IEnumerator$reset"
    ],
    ctors: {
      ctor: function ( str ) {
        this.$initialize();
        this._str = str;
        this._index = -1;
      }
    },
    methods: {
      clone: function () {
        return Bridge.clone( this );
      },
      moveNext: function () {
        if ( this._index < ( ( ( this._str.length - 1 ) | 0 ) ) ) {
          this._index = ( this._index + 1 ) | 0;
          this._currentElement = this._str.charCodeAt( this._index );
          return true;
        } else {
          this._index = this._str.length;
        }
        return false;
      },
      Dispose: function () {
        if ( this._str != null ) {
          this._index = this._str.length;
        }
        this._str = null;
      },
      reset: function () {
        this._currentElement = 0;
        this._index = -1;
      }
    }
  } );

  // @source Task.js

  Bridge.define( "System.Threading.Tasks.Task", {
    inherits: [System.IDisposable, System.IAsyncResult],

    config: {
      alias: [
        "dispose", "System$IDisposable$Dispose",
        "AsyncState", "System$IAsyncResult$AsyncState",
        "CompletedSynchronously", "System$IAsyncResult$CompletedSynchronously",
        "IsCompleted", "System$IAsyncResult$IsCompleted"
      ],

      properties: {
        IsCompleted: {
          get: function () {
            return this.isCompleted();
          }
        }
      }
    },

    ctor: function ( action, state ) {
      this.$initialize();
      this.action = action;
      this.state = state;
      this.AsyncState = state;
      this.CompletedSynchronously = false;
      this.exception = null;
      this.status = System.Threading.Tasks.TaskStatus.created;
      this.callbacks = [];
      this.result = null;
    },

    statics: {
      queue: [],

      runQueue: function () {
        var queue = System.Threading.Tasks.Task.queue.slice( 0 );
        System.Threading.Tasks.Task.queue = [];

        for ( var i = 0; i < queue.length; i++ ) {
          queue[i]();
        }
      },

      schedule: function ( fn ) {
        System.Threading.Tasks.Task.queue.push( fn );
        Bridge.setImmediate( System.Threading.Tasks.Task.runQueue );
      },

      delay: function ( delay, state ) {
        var tcs = new System.Threading.Tasks.TaskCompletionSource(),
          token,
          cancelCallback = false;

        if ( Bridge.is( state, System.Threading.CancellationToken ) ) {
          token = state;
          state = undefined;
        }

        if ( token ) {
          token.cancelWasRequested = function () {
            if ( !cancelCallback ) {
              cancelCallback = true;
              clearTimeout( clear );

              tcs.setCanceled();
            }
          };
        }

        var ms = delay;
        if ( Bridge.is( delay, System.TimeSpan ) ) {
          ms = delay.getTotalMilliseconds();
        }

        var clear = setTimeout( function () {
          if ( !cancelCallback ) {
            cancelCallback = true;
            tcs.setResult( state );
          }
        }, ms );

        if ( token && token.getIsCancellationRequested() ) {
          Bridge.setImmediate( token.cancelWasRequested );
        }

        return tcs.task;
      },

      fromResult: function ( result, T ) {
        var t = new ( System.Threading.Tasks.Task$1( T || System.Object ) )();

        t.status = System.Threading.Tasks.TaskStatus.ranToCompletion;
        t.result = result;

        return t;
      },

      run: function ( fn ) {
        var tcs = new System.Threading.Tasks.TaskCompletionSource();

        System.Threading.Tasks.Task.schedule( function () {
          try {
            var result = fn();

            if ( Bridge.is( result, System.Threading.Tasks.Task ) ) {
              result.continueWith( function () {
                if ( result.isFaulted() || result.isCanceled() ) {
                  tcs.setException( result.exception.innerExceptions.Count > 0 ? result.exception.innerExceptions.getItem( 0 ) : result.exception );
                } else {
                  tcs.setResult( result.getAwaitedResult() );
                }
              } );
            } else {
              tcs.setResult( result );
            }
          } catch ( e ) {
            tcs.setException( System.Exception.create( e ) );
          }
        } );

        return tcs.task;
      },

      whenAll: function ( tasks ) {
        var tcs = new System.Threading.Tasks.TaskCompletionSource(),
          result,
          executing,
          cancelled = false,
          exceptions = [],
          i;

        if ( Bridge.is( tasks, System.Collections.IEnumerable ) ) {
          tasks = Bridge.toArray( tasks );
        } else if ( !Bridge.isArray( tasks ) ) {
          tasks = Array.prototype.slice.call( arguments, 0 );
        }

        if ( tasks.length === 0 ) {
          tcs.setResult( [] );

          return tcs.task;
        }

        executing = tasks.length;
        result = new Array( tasks.length );

        for ( i = 0; i < tasks.length; i++ ) {
          ( function ( i ) {
            tasks[i].continueWith( function ( t ) {
              switch ( t.status ) {
                case System.Threading.Tasks.TaskStatus.ranToCompletion:
                  result[i] = t.getResult();
                  break;
                case System.Threading.Tasks.TaskStatus.canceled:
                  cancelled = true;
                  break;
                case System.Threading.Tasks.TaskStatus.faulted:
                  System.Array.addRange( exceptions, t.exception.innerExceptions );
                  break;
                default:
                  throw new System.InvalidOperationException.$ctor1( "Invalid task status: " + t.status );
              }

              if ( --executing === 0 ) {
                if ( exceptions.length > 0 ) {
                  tcs.setException( exceptions );
                } else if ( cancelled ) {
                  tcs.setCanceled();
                } else {
                  tcs.setResult( result );
                }
              }
            } );
          } )( i );
        }

        return tcs.task;
      },

      whenAny: function ( tasks ) {
        if ( Bridge.is( tasks, System.Collections.IEnumerable ) ) {
          tasks = Bridge.toArray( tasks );
        } else if ( !Bridge.isArray( tasks ) ) {
          tasks = Array.prototype.slice.call( arguments, 0 );
        }

        if ( !tasks.length ) {
          throw new System.ArgumentException.$ctor1( "At least one task is required" );
        }

        var tcs = new System.Threading.Tasks.TaskCompletionSource(),
          i;

        for ( i = 0; i < tasks.length; i++ ) {
          tasks[i].continueWith( function ( t ) {
            switch ( t.status ) {
              case System.Threading.Tasks.TaskStatus.ranToCompletion:
                tcs.trySetResult( t );
                break;
              case System.Threading.Tasks.TaskStatus.canceled:
              case System.Threading.Tasks.TaskStatus.faulted:
                tcs.trySetException( t.exception.innerExceptions );
                break;
              default:
                throw new System.InvalidOperationException.$ctor1( "Invalid task status: " + t.status );
            }
          } );
        }

        return tcs.task;
      },

      fromCallback: function ( target, method ) {
        var tcs = new System.Threading.Tasks.TaskCompletionSource(),
          args = Array.prototype.slice.call( arguments, 2 ),
          callback;

        callback = function ( value ) {
          tcs.setResult( value );
        };

        args.push( callback );

        target[method].apply( target, args );

        return tcs.task;
      },

      fromCallbackResult: function ( target, method, resultHandler ) {
        var tcs = new System.Threading.Tasks.TaskCompletionSource(),
          args = Array.prototype.slice.call( arguments, 3 ),
          callback;

        callback = function ( value ) {
          tcs.setResult( value );
        };

        resultHandler( args, callback );

        target[method].apply( target, args );

        return tcs.task;
      },

      fromCallbackOptions: function ( target, method, name ) {
        var tcs = new System.Threading.Tasks.TaskCompletionSource(),
          args = Array.prototype.slice.call( arguments, 3 ),
          callback;

        callback = function ( value ) {
          tcs.setResult( value );
        };

        args[0] = args[0] || {};
        args[0][name] = callback;

        target[method].apply( target, args );

        return tcs.task;
      },

      fromPromise: function ( promise, handler, errorHandler, progressHandler ) {
        var tcs = new System.Threading.Tasks.TaskCompletionSource();

        if ( !promise.then ) {
          promise = promise.promise();
        }

        if ( typeof ( handler ) === 'number' ) {
          handler = ( function ( i ) {
            return function () {
              return arguments[i >= 0 ? i : ( arguments.length + i )];
            };
          } )( handler );
        } else if ( typeof ( handler ) !== 'function' ) {
          handler = function () {
            return Array.prototype.slice.call( arguments, 0 );
          };
        }

        promise.then( function () {
          tcs.setResult( handler ? handler.apply( null, arguments ) : Array.prototype.slice.call( arguments, 0 ) );
        }, function () {
          tcs.setException( errorHandler ? errorHandler.apply( null, arguments ) : new Bridge.PromiseException( Array.prototype.slice.call( arguments, 0 ) ) );
        }, progressHandler );

        return tcs.task;
      }
    },

    getException: function () {
      return this.isCanceled() ? null : this.exception;
    },

    waitt: function ( timeout, token ) {
      var ms = timeout,
        tcs = new System.Threading.Tasks.TaskCompletionSource(),
        cancelCallback = false;

      if ( token ) {
        token.cancelWasRequested = function () {
          if ( !cancelCallback ) {
            cancelCallback = true;
            clearTimeout( clear );
            tcs.setException( new System.OperationCanceledException.$ctor1( token ) );
          }
        };
      }

      if ( Bridge.is( timeout, System.TimeSpan ) ) {
        ms = timeout.getTotalMilliseconds();
      }

      var clear = setTimeout( function () {
        cancelCallback = true;
        tcs.setResult( false );
      }, ms );

      this.continueWith( function () {
        clearTimeout( clear );
        if ( !cancelCallback ) {
          cancelCallback = true;
          tcs.setResult( true );
        }
      } );

      return tcs.task;
    },

    wait: function ( token ) {
      var me = this,
        tcs = new System.Threading.Tasks.TaskCompletionSource(),
        complete = false;

      if ( token ) {
        token.cancelWasRequested = function () {
          if ( !complete ) {
            complete = true;
            tcs.setException( new System.OperationCanceledException.$ctor1( token ) );
          }
        };
      }

      this.continueWith( function () {
        if ( !complete ) {
          complete = true;
          if ( me.isFaulted() || me.isCanceled() ) {
            tcs.setException( me.exception );
          } else {
            tcs.setResult();
          }
        }
      } );

      return tcs.task;
    },

    continue: function ( continuationAction ) {
      if ( this.isCompleted() ) {
        System.Threading.Tasks.Task.queue.push( continuationAction );
        System.Threading.Tasks.Task.runQueue();
      } else {
        this.callbacks.push( continuationAction );
      }
    },

    continueWith: function ( continuationAction, raise ) {
      var tcs = new System.Threading.Tasks.TaskCompletionSource(),
        me = this,
        fn = raise ? function () {
          tcs.setResult( continuationAction( me ) );
        } : function () {
          try {
            tcs.setResult( continuationAction( me ) );
          } catch ( e ) {
            tcs.setException( System.Exception.create( e ) );
          }
        };

      if ( this.isCompleted() ) {
        //System.Threading.Tasks.Task.schedule(fn);
        System.Threading.Tasks.Task.queue.push( fn );
        System.Threading.Tasks.Task.runQueue();
      } else {
        this.callbacks.push( fn );
      }

      return tcs.task;
    },

    start: function () {
      if ( this.status !== System.Threading.Tasks.TaskStatus.created ) {
        throw new System.InvalidOperationException.$ctor1( "Task was already started." );
      }

      var me = this;

      this.status = System.Threading.Tasks.TaskStatus.running;

      System.Threading.Tasks.Task.schedule( function () {
        try {
          var result = me.action( me.state );

          delete me.action;
          delete me.state;

          me.complete( result );
        } catch ( e ) {
          me.fail( new System.AggregateException( null, [System.Exception.create( e )] ) );
        }
      } );
    },

    runCallbacks: function () {
      var me = this;

      for ( var i = 0; i < me.callbacks.length; i++ ) {
        me.callbacks[i]( me );
      }

      delete me.callbacks;
    },

    complete: function ( result ) {
      if ( this.isCompleted() ) {
        return false;
      }

      this.result = result;
      this.status = System.Threading.Tasks.TaskStatus.ranToCompletion;
      this.runCallbacks();

      return true;
    },

    fail: function ( error ) {
      if ( this.isCompleted() ) {
        return false;
      }

      this.exception = error;
      this.status = this.exception.hasTaskCanceledException && this.exception.hasTaskCanceledException() ? System.Threading.Tasks.TaskStatus.canceled : System.Threading.Tasks.TaskStatus.faulted;
      this.runCallbacks();

      return true;
    },

    cancel: function ( error ) {
      if ( this.isCompleted() ) {
        return false;
      }

      this.exception = error || new System.AggregateException( null, [new System.Threading.Tasks.TaskCanceledException.$ctor3( this )] );
      this.status = System.Threading.Tasks.TaskStatus.canceled;
      this.runCallbacks();

      return true;
    },

    isCanceled: function () {
      return this.status === System.Threading.Tasks.TaskStatus.canceled;
    },

    isCompleted: function () {
      return this.status === System.Threading.Tasks.TaskStatus.ranToCompletion || this.status === System.Threading.Tasks.TaskStatus.canceled || this.status === System.Threading.Tasks.TaskStatus.faulted;
    },

    isFaulted: function () {
      return this.status === System.Threading.Tasks.TaskStatus.faulted;
    },

    _getResult: function ( awaiting ) {
      switch ( this.status ) {
        case System.Threading.Tasks.TaskStatus.ranToCompletion:
          return this.result;
        case System.Threading.Tasks.TaskStatus.canceled:
          if ( this.exception && this.exception.innerExceptions ) {
            throw awaiting ? ( this.exception.innerExceptions.Count > 0 ? this.exception.innerExceptions.getItem( 0 ) : null ) : this.exception;
          }

          var ex = new System.Threading.Tasks.TaskCanceledException.$ctor3( this );
          throw awaiting ? ex : new System.AggregateException( null, [ex] );
        case System.Threading.Tasks.TaskStatus.faulted:
          throw awaiting ? ( this.exception.innerExceptions.Count > 0 ? this.exception.innerExceptions.getItem( 0 ) : null ) : this.exception;
        default:
          throw new System.InvalidOperationException.$ctor1( "Task is not yet completed." );
      }
    },

    getResult: function () {
      return this._getResult( false );
    },

    dispose: function () { },

    getAwaiter: function () {
      return this;
    },

    getAwaitedResult: function () {
      return this._getResult( true );
    }
  } );

  Bridge.define( "System.Threading.Tasks.Task$1", function ( T ) {
    return {
      inherits: [System.Threading.Tasks.Task],
      ctor: function ( action, state ) {
        this.$initialize();
        System.Threading.Tasks.Task.ctor.call( this, action, state );
      }
    };
  } );

  Bridge.define( "System.Threading.Tasks.TaskStatus", {
    $kind: "enum",
    $statics: {
      created: 0,
      waitingForActivation: 1,
      waitingToRun: 2,
      running: 3,
      waitingForChildrenToComplete: 4,
      ranToCompletion: 5,
      canceled: 6,
      faulted: 7
    }
  } );

  Bridge.define( "System.Threading.Tasks.TaskCompletionSource", {
    ctor: function ( state ) {
      this.$initialize();
      this.task = new System.Threading.Tasks.Task( null, state );
      this.task.status = System.Threading.Tasks.TaskStatus.running;
    },

    setCanceled: function () {
      if ( !this.task.cancel() ) {
        throw new System.InvalidOperationException.$ctor1( "Task was already completed." );
      }
    },

    setResult: function ( result ) {
      if ( !this.task.complete( result ) ) {
        throw new System.InvalidOperationException.$ctor1( "Task was already completed." );
      }
    },

    setException: function ( exception ) {
      if ( !this.trySetException( exception ) ) {
        throw new System.InvalidOperationException.$ctor1( "Task was already completed." );
      }
    },

    trySetCanceled: function () {
      return this.task.cancel();
    },

    trySetResult: function ( result ) {
      return this.task.complete( result );
    },

    trySetException: function ( exception ) {
      if ( Bridge.is( exception, System.Exception ) ) {
        exception = [exception];
      }

      exception = new System.AggregateException( null, exception );

      if ( exception.hasTaskCanceledException() ) {
        return this.task.cancel( exception );
      }

      return this.task.fail( exception );
    }
  } );

  Bridge.define( "System.Threading.CancellationTokenSource", {
    inherits: [System.IDisposable],

    config: {
      alias: [
        "dispose", "System$IDisposable$Dispose"
      ]
    },

    ctor: function ( delay ) {
      this.$initialize();
      this.timeout = typeof delay === "number" && delay >= 0 ? setTimeout( Bridge.fn.bind( this, this.cancel ), delay, -1 ) : null;
      this.isCancellationRequested = false;
      this.token = new System.Threading.CancellationToken( this );
      this.handlers = [];
    },

    cancel: function ( throwFirst ) {
      if ( this.isCancellationRequested ) {
        return;
      }

      this.isCancellationRequested = true;

      var x = [],
        h = this.handlers;

      this.clean();
      this.token.cancelWasRequested();

      for ( var i = 0; i < h.length; i++ ) {
        try {
          h[i].f( h[i].s );
        } catch ( ex ) {
          if ( throwFirst && throwFirst !== -1 ) {
            throw ex;
          }

          x.push( ex );
        }
      }

      if ( x.length > 0 && throwFirst !== -1 ) {
        throw new System.AggregateException( null, x );
      }
    },

    cancelAfter: function ( delay ) {
      if ( this.isCancellationRequested ) {
        return;
      }

      if ( this.timeout ) {
        clearTimeout( this.timeout );
      }

      this.timeout = setTimeout( Bridge.fn.bind( this, this.cancel ), delay, -1 );
    },

    register: function ( f, s ) {
      if ( this.isCancellationRequested ) {
        f( s );

        return new System.Threading.CancellationTokenRegistration();
      } else {
        var o = {
          f: f,
          s: s
        };

        this.handlers.push( o );

        return new System.Threading.CancellationTokenRegistration( this, o );
      }
    },

    deregister: function ( o ) {
      var ix = this.handlers.indexOf( o );

      if ( ix >= 0 ) {
        this.handlers.splice( ix, 1 );
      }
    },

    dispose: function () {
      this.clean();
    },

    clean: function () {
      if ( this.timeout ) {
        clearTimeout( this.timeout );
      }

      this.timeout = null;
      this.handlers = [];

      if ( this.links ) {
        for ( var i = 0; i < this.links.length; i++ ) {
          this.links[i].dispose();
        }

        this.links = null;
      }
    },

    statics: {
      createLinked: function () {
        var cts = new System.Threading.CancellationTokenSource();

        cts.links = [];

        var d = Bridge.fn.bind( cts, cts.cancel );

        for ( var i = 0; i < arguments.length; i++ ) {
          cts.links.push( arguments[i].register( d ) );
        }

        return cts;
      }
    }
  } );

  Bridge.define( "System.Threading.CancellationToken", {
    $kind: "struct",

    ctor: function ( source ) {
      this.$initialize();

      if ( !Bridge.is( source, System.Threading.CancellationTokenSource ) ) {
        source = source ? System.Threading.CancellationToken.sourceTrue : System.Threading.CancellationToken.sourceFalse;
      }

      this.source = source;
    },

    cancelWasRequested: function () {

    },

    getCanBeCanceled: function () {
      return !this.source.uncancellable;
    },

    getIsCancellationRequested: function () {
      return this.source.isCancellationRequested;
    },

    throwIfCancellationRequested: function () {
      if ( this.source.isCancellationRequested ) {
        throw new System.OperationCanceledException.$ctor1( this );
      }
    },

    register: function ( cb, s ) {
      return this.source.register( cb, s );
    },

    getHashCode: function () {
      return Bridge.getHashCode( this.source );
    },

    equals: function ( other ) {
      return other.source === this.source;
    },

    equalsT: function ( other ) {
      return other.source === this.source;
    },

    statics: {
      sourceTrue: {
        isCancellationRequested: true,
        register: function ( f, s ) {
          f( s );

          return new System.Threading.CancellationTokenRegistration();
        }
      },
      sourceFalse: {
        uncancellable: true,
        isCancellationRequested: false,
        register: function () {
          return new System.Threading.CancellationTokenRegistration();
        }
      },
      getDefaultValue: function () {
        return new System.Threading.CancellationToken();
      }
    }
  } );

  System.Threading.CancellationToken.none = new System.Threading.CancellationToken();

  Bridge.define( "System.Threading.CancellationTokenRegistration", {
    inherits: function () {
      return [System.IDisposable, System.IEquatable$1( System.Threading.CancellationTokenRegistration )];
    },

    $kind: "struct",

    config: {
      alias: [
        "dispose", "System$IDisposable$Dispose"
      ]
    },

    ctor: function ( cts, o ) {
      this.$initialize();
      this.cts = cts;
      this.o = o;
    },

    dispose: function () {
      if ( this.cts ) {
        this.cts.deregister( this.o );
        this.cts = this.o = null;
      }
    },

    equalsT: function ( o ) {
      return this === o;
    },

    equals: function ( o ) {
      return this === o;
    },

    statics: {
      getDefaultValue: function () {
        return new System.Threading.CancellationTokenRegistration();
      }
    }
  } );

  // @source Validation.js

  var validation = {
    isNull: function ( value ) {
      return !Bridge.isDefined( value, true );
    },

    isEmpty: function ( value ) {
      return value == null || value.length === 0 || Bridge.is( value, System.Collections.ICollection ) ? value.getCount() === 0 : false;
    },

    isNotEmptyOrWhitespace: function ( value ) {
      return Bridge.isDefined( value, true ) && !( /^$|\s+/.test( value ) );
    },

    isNotNull: function ( value ) {
      return Bridge.isDefined( value, true );
    },

    isNotEmpty: function ( value ) {
      return !Bridge.Validation.isEmpty( value );
    },

    email: function ( value ) {
      var re = /^(")?(?:[^\."])(?:(?:[\.])?(?:[\w\-!#$%&'*+/=?^_`{|}~]))*\1@(\w[\-\w]*\.){1,5}([A-Za-z]){2,6}$/;

      return re.test( value );
    },

    url: function ( value ) {
      var re = /(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:\.\d{1,3}){3})(?!(?:\.\d{1,3}){2})(?!\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/;

      return re.test( value );
    },

    alpha: function ( value ) {
      var re = /^[a-zA-Z_]+$/;

      return re.test( value );
    },

    alphaNum: function ( value ) {
      var re = /^[a-zA-Z_]+$/;

      return re.test( value );
    },

    creditCard: function ( value, type ) {
      var re,
        checksum,
        i,
        digit,
        notype = false;

      if ( type === "Visa" ) {
        // Visa: length 16, prefix 4, dashes optional.
        re = /^4\d{3}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}$/;
      } else if ( type === "MasterCard" ) {
        // Mastercard: length 16, prefix 51-55, dashes optional.
        re = /^5[1-5]\d{2}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}$/;
      } else if ( type === "Discover" ) {
        // Discover: length 16, prefix 6011, dashes optional.
        re = /^6011[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}$/;
      } else if ( type === "AmericanExpress" ) {
        // American Express: length 15, prefix 34 or 37.
        re = /^3[4,7]\d{13}$/;
      } else if ( type === "DinersClub" ) {
        // Diners: length 14, prefix 30, 36, or 38.
        re = /^(3[0,6,8]\d{12})|(5[45]\d{14})$/;
      } else {
        // Basing min and max length on
        // http://developer.ean.com/general_info/Valid_Credit_Card_Types
        if ( !value || value.length < 13 || value.length > 19 ) {
          return false;
        }

        re = /[^0-9 \-]+/;
        notype = true;
      }

      if ( !re.test( value ) ) {
        return false;
      }

      // Remove all dashes for the checksum checks to eliminate negative numbers
      value = value.split( notype ? "-" : /[- ]/ ).join( "" );

      // Checksum ("Mod 10")
      // Add even digits in even length strings or odd digits in odd length strings.
      checksum = 0;

      for ( i = ( 2 - ( value.length % 2 ) ); i <= value.length; i += 2 ) {
        checksum += parseInt( value.charAt( i - 1 ) );
      }

      // Analyze odd digits in even length strings or even digits in odd length strings.
      for ( i = ( value.length % 2 ) + 1; i < value.length; i += 2 ) {
        digit = parseInt( value.charAt( i - 1 ) ) * 2;

        if ( digit < 10 ) {
          checksum += digit;
        } else {
          checksum += ( digit - 9 );
        }
      }

      return ( checksum % 10 ) === 0;
    }
  };

  Bridge.Validation = validation;

  // @source Attribute.js

  Bridge.define( "System.Attribute", {
    statics: {
      getCustomAttributes: function ( o, t, b ) {
        if ( o == null ) {
          throw new System.ArgumentNullException.$ctor1( "element" );
        }

        if ( t == null ) {
          throw new System.ArgumentNullException.$ctor1( "attributeType" );
        }

        var r = o.at || [];

        if ( o.ov === true ) {
          var baseType = Bridge.Reflection.getBaseType( o.td ),
            baseAttrs = [],
            baseMember = null;

          while ( baseType != null && baseMember == null ) {
            baseMember = Bridge.Reflection.getMembers( baseType, 31, 28, o.n );

            if ( baseMember.length == 0 ) {
              var newBaseType = Bridge.Reflection.getBaseType( baseType );

              if ( newBaseType != baseType ) {
                baseType = newBaseType;
              }

              baseMember = null;
            } else {
              baseMember = baseMember[0];
            }
          }

          if ( baseMember != null ) {
            baseAttrs = System.Attribute.getCustomAttributes( baseMember, t );
          }

          for ( var i = 0; i < baseAttrs.length; i++ ) {
            var baseAttr = baseAttrs[i],
              attrType = Bridge.getType( baseAttr ),
              meta = Bridge.getMetadata( attrType );

            if ( meta && meta.am || !r.some( function ( a ) { return Bridge.is( a, t ); } ) ) {
              r.push( baseAttr );
            }
          }
        }

        if ( !t ) {
          return r;
        }

        return r.filter( function ( a ) { return Bridge.is( a, t ); } );
      },

      getCustomAttributes$1: function ( a, t, b ) {
        if ( a == null ) {
          throw new System.ArgumentNullException.$ctor1( "element" );
        }

        if ( t == null ) {
          throw new System.ArgumentNullException.$ctor1( "attributeType" );
        }

        return a.getCustomAttributes( t || b );
      },

      isDefined: function ( o, t, b ) {
        var attrs = System.Attribute.getCustomAttributes( o, t, b );

        return attrs.length > 0;
      }
    }
  } );

  // @source SerializableAttribute.js

  Bridge.define( "System.SerializableAttribute", {
    inherits: [System.Attribute],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.Attribute.ctor.call( this );
      }
    }
  } );

  // @source INotifyPropertyChanged.js

  Bridge.define( "System.ComponentModel.INotifyPropertyChanged", {
    $kind: "interface"
  } );

  Bridge.define( "System.ComponentModel.PropertyChangedEventArgs", {
    ctor: function ( propertyName, newValue, oldValue ) {
      this.$initialize();
      this.propertyName = propertyName;
      this.newValue = newValue;
      this.oldValue = oldValue;
    }
  } );

  // @source Convert.js

  var scope = {};

  scope.convert = {
    typeCodes: {
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
    },

    convertTypes: [
      null,
      System.Object,
      null,
      System.Boolean,
      System.Char,
      System.SByte,
      System.Byte,
      System.Int16,
      System.UInt16,
      System.Int32,
      System.UInt32,
      System.Int64,
      System.UInt64,
      System.Single,
      System.Double,
      System.Decimal,
      System.DateTime,
      System.Object,
      System.String
    ],

    toBoolean: function ( value, formatProvider ) {
      value = Bridge.unbox( value, true );

      switch ( typeof ( value ) ) {
        case "boolean":
          return value;

        case "number":
          return value !== 0; // non-zero int/float value is always converted to True;

        case "string":
          var lowCaseVal = value.toLowerCase().trim();

          if ( lowCaseVal === "true" ) {
            return true;
          } else if ( lowCaseVal === "false" ) {
            return false;
          } else {
            throw new System.FormatException.$ctor1( "String was not recognized as a valid Boolean." );
          }

        case "object":
          if ( value == null ) {
            return false;
          }

          if ( value instanceof System.Decimal ) {
            return !value.isZero();
          }

          if ( System.Int64.is64Bit( value ) ) {
            return value.ne( 0 );
          }

          break;
      }

      // TODO: #822 When IConvertible is implemented, try it before throwing InvalidCastEx
      var typeCode = scope.internal.suggestTypeCode( value );
      scope.internal.throwInvalidCastEx( typeCode, scope.convert.typeCodes.Boolean );

      // try converting using IConvertible
      return scope.convert.convertToType( scope.convert.typeCodes.Boolean, value, formatProvider || null );
    },

    toChar: function ( value, formatProvider, valueTypeCode ) {
      var typeCodes = scope.convert.typeCodes,
        isChar = Bridge.is( value, System.Char );

      value = Bridge.unbox( value, true );

      if ( value instanceof System.Decimal ) {
        value = value.toFloat();
      }

      if ( value instanceof System.Int64 || value instanceof System.UInt64 ) {
        value = value.toNumber();
      }

      var type = typeof ( value );

      valueTypeCode = valueTypeCode || scope.internal.suggestTypeCode( value );

      if ( valueTypeCode === typeCodes.String && value == null ) {
        type = "string";
      }

      if ( valueTypeCode !== typeCodes.Object || isChar ) {
        switch ( type ) {
          case "boolean":
            scope.internal.throwInvalidCastEx( typeCodes.Boolean, typeCodes.Char );

          case "number":
            var isFloatingType = scope.internal.isFloatingType( valueTypeCode );

            if ( isFloatingType || value % 1 !== 0 ) {
              scope.internal.throwInvalidCastEx( valueTypeCode, typeCodes.Char );
            }

            scope.internal.validateNumberRange( value, typeCodes.Char, true );

            return value;

          case "string":
            if ( value == null ) {
              throw new System.ArgumentNullException.$ctor1( "value" );
            }

            if ( value.length !== 1 ) {
              throw new System.FormatException.$ctor1( "String must be exactly one character long." );
            }

            return value.charCodeAt( 0 );
        }
      }

      if ( valueTypeCode === typeCodes.Object || type === "object" ) {
        if ( value == null ) {
          return 0;
        }

        if ( Bridge.isDate( value ) ) {
          scope.internal.throwInvalidCastEx( typeCodes.DateTime, typeCodes.Char );
        }
      }

      // TODO: #822 When IConvertible is implemented, try it before throwing InvalidCastEx
      scope.internal.throwInvalidCastEx( valueTypeCode, scope.convert.typeCodes.Char );

      // try converting using IConvertible
      return scope.convert.convertToType( typeCodes.Char, value, formatProvider || null );
    },

    toSByte: function ( value, formatProvider, valueTypeCode ) {
      return scope.internal.toNumber( value, formatProvider || null, scope.convert.typeCodes.SByte, valueTypeCode || null );
    },

    toByte: function ( value, formatProvider ) {
      return scope.internal.toNumber( value, formatProvider || null, scope.convert.typeCodes.Byte );
    },

    toInt16: function ( value, formatProvider ) {
      return scope.internal.toNumber( value, formatProvider || null, scope.convert.typeCodes.Int16 );
    },

    toUInt16: function ( value, formatProvider ) {
      return scope.internal.toNumber( value, formatProvider || null, scope.convert.typeCodes.UInt16 );
    },

    toInt32: function ( value, formatProvider ) {
      return scope.internal.toNumber( value, formatProvider || null, scope.convert.typeCodes.Int32 );
    },

    toUInt32: function ( value, formatProvider ) {
      return scope.internal.toNumber( value, formatProvider || null, scope.convert.typeCodes.UInt32 );
    },

    toInt64: function ( value, formatProvider ) {
      var result = scope.internal.toNumber( value, formatProvider || null, scope.convert.typeCodes.Int64 );
      return new System.Int64( result );
    },

    toUInt64: function ( value, formatProvider ) {
      var result = scope.internal.toNumber( value, formatProvider || null, scope.convert.typeCodes.UInt64 );
      return new System.UInt64( result );
    },

    toSingle: function ( value, formatProvider ) {
      return scope.internal.toNumber( value, formatProvider || null, scope.convert.typeCodes.Single );
    },

    toDouble: function ( value, formatProvider ) {
      return scope.internal.toNumber( value, formatProvider || null, scope.convert.typeCodes.Double );
    },

    toDecimal: function ( value, formatProvider ) {
      if ( value instanceof System.Decimal ) {
        return value;
      }

      return new System.Decimal( scope.internal.toNumber( value, formatProvider || null, scope.convert.typeCodes.Decimal ) );
    },

    toDateTime: function ( value, formatProvider ) {
      var typeCodes = scope.convert.typeCodes;

      value = Bridge.unbox( value, true );

      switch ( typeof ( value ) ) {
        case "boolean":
          scope.internal.throwInvalidCastEx( typeCodes.Boolean, typeCodes.DateTime );

        case "number":
          var fromType = scope.internal.suggestTypeCode( value );
          scope.internal.throwInvalidCastEx( fromType, typeCodes.DateTime );

        case "string":
          value = System.DateTime.parse( value, formatProvider || null );

          return value;

        case "object":
          if ( value == null ) {
            return scope.internal.getMinValue( typeCodes.DateTime );
          }

          if ( Bridge.isDate( value ) ) {
            return value;
          }

          if ( value instanceof System.Decimal ) {
            scope.internal.throwInvalidCastEx( typeCodes.Decimal, typeCodes.DateTime );
          }

          if ( value instanceof System.Int64 ) {
            scope.internal.throwInvalidCastEx( typeCodes.Int64, typeCodes.DateTime );
          }

          if ( value instanceof System.UInt64 ) {
            scope.internal.throwInvalidCastEx( typeCodes.UInt64, typeCodes.DateTime );
          }

          break;
      }

      // TODO: #822 When IConvertible is implemented, try it before throwing InvalidCastEx
      var valueTypeCode = scope.internal.suggestTypeCode( value );

      scope.internal.throwInvalidCastEx( valueTypeCode, scope.convert.typeCodes.DateTime );

      // try converting using IConvertible
      return scope.convert.convertToType( typeCodes.DateTime, value, formatProvider || null );
    },

    toString: function ( value, formatProvider, valueTypeCode ) {
      if ( value && value.$boxed ) {
        return value.toString();
      }

      var typeCodes = scope.convert.typeCodes,
        type = typeof ( value );

      switch ( type ) {
        case "boolean":
          return value ? "True" : "False";

        case "number":
          if ( ( valueTypeCode || null ) === typeCodes.Char ) {
            return String.fromCharCode( value );
          }

          if ( isNaN( value ) ) {
            return "NaN";
          }

          if ( value % 1 !== 0 ) {
            value = parseFloat( value.toPrecision( 15 ) );
          }

          return value.toString();

        case "string":
          return value;

        case "object":
          if ( value == null ) {
            return "";
          }

          // If the object has an override to the toString() method,
          // then just return its result
          if ( value.toString !== Object.prototype.toString ) {
            return value.toString();
          }

          if ( Bridge.isDate( value ) ) {
            return System.DateTime.format( value, null, formatProvider || null );
          }

          if ( value instanceof System.Decimal ) {
            if ( value.isInteger() ) {
              return value.toFixed( 0, 4 );
            }
            return value.toPrecision( value.precision() );
          }

          if ( System.Int64.is64Bit( value ) ) {
            return value.toString();
          }

          if ( value.format ) {
            return value.format( null, formatProvider || null );
          }

          var typeName = Bridge.getTypeName( value );

          return typeName;
      }

      // try converting using IConvertible
      return scope.convert.convertToType( scope.convert.typeCodes.String, value, formatProvider || null );
    },

    toNumberInBase: function ( str, fromBase, typeCode ) {
      if ( fromBase !== 2 && fromBase !== 8 && fromBase !== 10 && fromBase !== 16 ) {
        throw new System.ArgumentException.$ctor1( "Invalid Base." );
      }

      var typeCodes = scope.convert.typeCodes;

      if ( str == null ) {
        if ( typeCode === typeCodes.Int64 ) {
          return System.Int64.Zero;
        }

        if ( typeCode === typeCodes.UInt64 ) {
          return System.UInt64.Zero;
        }

        return 0;
      }

      if ( str.length === 0 ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "length", "Index was out of range. Must be non-negative and less than the size of the collection." );
      }

      // Let's process the string in lower case.
      str = str.toLowerCase();

      var minValue = scope.internal.getMinValue( typeCode ),
        maxValue = scope.internal.getMaxValue( typeCode );

      // Calculate offset (start index)
      var isNegative = false,
        startIndex = 0;

      if ( str[startIndex] === "-" ) {
        if ( fromBase !== 10 ) {
          throw new System.ArgumentException.$ctor1( "String cannot contain a minus sign if the base is not 10." );
        }

        if ( minValue >= 0 ) {
          throw new System.OverflowException.$ctor1( "The string was being parsed as an unsigned number and could not have a negative sign." );
        }

        isNegative = true;
        ++startIndex;
      } else if ( str[startIndex] === "+" ) {
        ++startIndex;
      }

      if ( fromBase === 16 && str.length >= 2 && str[startIndex] === "0" && str[startIndex + 1] === "x" ) {
        startIndex += 2;
      }

      // Fill allowed codes for the specified base:
      var allowedCodes;

      if ( fromBase === 2 ) {
        allowedCodes = scope.internal.charsToCodes( "01" );
      } else if ( fromBase === 8 ) {
        allowedCodes = scope.internal.charsToCodes( "01234567" );
      } else if ( fromBase === 10 ) {
        allowedCodes = scope.internal.charsToCodes( "0123456789" );
      } else if ( fromBase === 16 ) {
        allowedCodes = scope.internal.charsToCodes( "0123456789abcdef" );
      } else {
        throw new System.ArgumentException.$ctor1( "Invalid Base." );
      }

      // Create charCode-to-Value map
      var codeValues = {};

      for ( var i = 0; i < allowedCodes.length; i++ ) {
        var allowedCode = allowedCodes[i];

        codeValues[allowedCode] = i;
      }

      var firstAllowed = allowedCodes[0],
        lastAllowed = allowedCodes[allowedCodes.length - 1],
        res,
        totalMax,
        code,
        j;

      if ( typeCode === typeCodes.Int64 || typeCode === typeCodes.UInt64 ) {
        for ( j = startIndex; j < str.length; j++ ) {
          code = str[j].charCodeAt( 0 );

          if ( !( code >= firstAllowed && code <= lastAllowed ) ) {
            if ( j === startIndex ) {
              throw new System.FormatException.$ctor1( "Could not find any recognizable digits." );
            } else {
              throw new System.FormatException.$ctor1( "Additional non-parsable characters are at the end of the string." );
            }
          }
        }

        var isSign = typeCode === typeCodes.Int64;

        if ( isSign ) {
          res = new System.Int64( Bridge.$Long.fromString( str, false, fromBase ) );
        } else {
          res = new System.UInt64( Bridge.$Long.fromString( str, true, fromBase ) );
        }

        if ( res.toString( fromBase ) !== System.String.trimStartZeros( str ) ) {
          throw new System.OverflowException.$ctor1( "Value was either too large or too small." );
        }

        return res;
      } else {
        // Parse the number:
        res = 0;
        totalMax = maxValue - minValue + 1;

        for ( j = startIndex; j < str.length; j++ ) {
          code = str[j].charCodeAt( 0 );

          if ( code >= firstAllowed && code <= lastAllowed ) {
            res *= fromBase;
            res += codeValues[code];

            if ( res > scope.internal.typeRanges.Int64_MaxValue ) {
              throw new System.OverflowException.$ctor1( "Value was either too large or too small." );
            }
          } else {
            if ( j === startIndex ) {
              throw new System.FormatException.$ctor1( "Could not find any recognizable digits." );
            } else {
              throw new System.FormatException.$ctor1( "Additional non-parsable characters are at the end of the string." );
            }
          }
        }

        if ( isNegative ) {
          res *= -1;
        }

        if ( res > maxValue && fromBase !== 10 && minValue < 0 ) {
          // Assume that the value is negative, transform it:
          res = res - totalMax;
        }

        if ( res < minValue || res > maxValue ) {
          throw new System.OverflowException.$ctor1( "Value was either too large or too small." );
        }

        return res;
      }
    },

    toStringInBase: function ( value, toBase, typeCode ) {
      var typeCodes = scope.convert.typeCodes;

      value = Bridge.unbox( value, true );

      if ( toBase !== 2 && toBase !== 8 && toBase !== 10 && toBase !== 16 ) {
        throw new System.ArgumentException.$ctor1( "Invalid Base." );
      }

      var minValue = scope.internal.getMinValue( typeCode ),
        maxValue = scope.internal.getMaxValue( typeCode ),
        special = System.Int64.is64Bit( value );

      if ( special ) {
        if ( value.lt( minValue ) || value.gt( maxValue ) ) {
          throw new System.OverflowException.$ctor1( "Value was either too large or too small for an unsigned byte." );
        }
      } else if ( value < minValue || value > maxValue ) {
        throw new System.OverflowException.$ctor1( "Value was either too large or too small for an unsigned byte." );
      }

      // Handle negative numbers:
      var isNegative = false;

      if ( special ) {
        if ( toBase === 10 ) {
          return value.toString();
        } else {
          return value.value.toUnsigned().toString( toBase );
        }
      } else if ( value < 0 ) {
        if ( toBase === 10 ) {
          isNegative = true;
          value *= -1;
        } else {
          value = ( maxValue + 1 - minValue ) + value;
        }
      }

      // Fill allowed codes for the specified base:
      var allowedChars;

      if ( toBase === 2 ) {
        allowedChars = "01";
      } else if ( toBase === 8 ) {
        allowedChars = "01234567";
      } else if ( toBase === 10 ) {
        allowedChars = "0123456789";
      } else if ( toBase === 16 ) {
        allowedChars = "0123456789abcdef";
      } else {
        throw new System.ArgumentException.$ctor1( "Invalid Base." );
      }

      // Fill Value-To-Char map:
      var charByValues = {},
        allowedCharArr = allowedChars.split( "" ),
        allowedChar;

      for ( var i = 0; i < allowedCharArr.length; i++ ) {
        allowedChar = allowedCharArr[i];

        charByValues[i] = allowedChar;
      }

      // Parse the number:
      var res = "";

      if ( value === 0 || ( special && value.eq( 0 ) ) ) {
        res = "0";
      } else {
        var mod, char;

        if ( special ) {
          while ( value.gt( 0 ) ) {
            mod = value.mod( toBase );
            value = value.sub( mod ).div( toBase );

            char = charByValues[mod.toNumber()];
            res += char;
          }
        } else {
          while ( value > 0 ) {
            mod = value % toBase;
            value = ( value - mod ) / toBase;

            char = charByValues[mod];
            res += char;
          }
        }
      }

      if ( isNegative ) {
        res += "-";
      }

      res = res.split( "" ).reverse().join( "" );

      return res;
    },

    toBase64String: function ( inArray, offset, length, options ) {
      if ( inArray == null ) {
        throw new System.ArgumentNullException.$ctor1( "inArray" );
      }

      offset = offset || 0;
      length = length != null ? length : inArray.length;
      options = options || 0; // 0 - means "None", 1 - stands for "InsertLineBreaks"

      if ( length < 0 ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "length", "Index was out of range. Must be non-negative and less than the size of the collection." );
      }

      if ( offset < 0 ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "offset", "Value must be positive." );
      }

      if ( options < 0 || options > 1 ) {
        throw new System.ArgumentException.$ctor1( "Illegal enum value." );
      }

      var inArrayLength = inArray.length;

      if ( offset > ( inArrayLength - length ) ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "offset", "Offset and length must refer to a position in the string." );
      }

      if ( inArrayLength === 0 ) {
        return "";
      }

      var insertLineBreaks = ( options === 1 ),
        strArrayLen = scope.internal.toBase64_CalculateAndValidateOutputLength( length, insertLineBreaks );

      var strArray = [];
      strArray.length = strArrayLen;

      scope.internal.convertToBase64Array( strArray, inArray, offset, length, insertLineBreaks );

      var str = strArray.join( "" );

      return str;
    },

    toBase64CharArray: function ( inArray, offsetIn, length, outArray, offsetOut, options ) {
      if ( inArray == null ) {
        throw new System.ArgumentNullException.$ctor1( "inArray" );
      }

      if ( outArray == null ) {
        throw new System.ArgumentNullException.$ctor1( "outArray" );
      }

      if ( length < 0 ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "length", "Index was out of range. Must be non-negative and less than the size of the collection." );
      }

      if ( offsetIn < 0 ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "offsetIn", "Value must be positive." );
      }

      if ( offsetOut < 0 ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "offsetOut", "Value must be positive." );
      }

      options = options || 0; // 0 - means "None", 1 - stands for "InsertLineBreaks"

      if ( options < 0 || options > 1 ) {
        throw new System.ArgumentException.$ctor1( "Illegal enum value." );
      }

      var inArrayLength = inArray.length;

      if ( offsetIn > inArrayLength - length ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "offsetIn", "Offset and length must refer to a position in the string." );
      }

      if ( inArrayLength === 0 ) {
        return 0;
      }

      var insertLineBreaks = options === 1,
        outArrayLength = outArray.length; //This is the maximally required length that must be available in the char array

      // Length of the char buffer required
      var numElementsToCopy = scope.internal.toBase64_CalculateAndValidateOutputLength( length, insertLineBreaks );

      if ( offsetOut > ( outArrayLength - numElementsToCopy ) ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "offsetOut", "Either offset did not refer to a position in the string, or there is an insufficient length of destination character array." );
      }

      var charsArr = [],
        charsArrLength = scope.internal.convertToBase64Array( charsArr, inArray, offsetIn, length, insertLineBreaks );

      scope.internal.charsToCodes( charsArr, outArray, offsetOut );

      return charsArrLength;
    },

    fromBase64String: function ( s ) {
      // "s" is an unfortunate parameter name, but we need to keep it for backward compat.

      if ( s == null ) {
        throw new System.ArgumentNullException.$ctor1( "s" );
      }

      var sChars = s.split( "" ),
        bytes = scope.internal.fromBase64CharPtr( sChars, 0, sChars.length );

      return bytes;
    },

    fromBase64CharArray: function ( inArray, offset, length ) {
      if ( inArray == null ) {
        throw new System.ArgumentNullException.$ctor1( "inArray" );
      }

      if ( length < 0 ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "length", "Index was out of range. Must be non-negative and less than the size of the collection." );
      }

      if ( offset < 0 ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "offset", "Value must be positive." );
      }

      if ( offset > ( inArray.length - length ) ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "offset", "Offset and length must refer to a position in the string." );
      }

      var chars = scope.internal.codesToChars( inArray ),
        bytes = scope.internal.fromBase64CharPtr( chars, offset, length );

      return bytes;
    },

    getTypeCode: function ( t ) {
      if ( t == null ) {
        return System.TypeCode.Object;
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
    },

    changeConversionType: function ( value, conversionType, provider ) {
      if ( conversionType == null ) {
        throw new System.ArgumentNullException.$ctor1( "conversionType" );
      }

      if ( value == null ) {
        if ( Bridge.Reflection.isValueType( conversionType ) ) {
          throw new System.InvalidCastException.$ctor1( "Null object cannot be converted to a value type." );
        }
        return null;
      }

      var fromTypeCode = scope.convert.getTypeCode( Bridge.getType( value ) ),
        ic = Bridge.as( value, System.IConvertible );

      if ( ic == null && fromTypeCode == System.TypeCode.Object ) {
        if ( Bridge.referenceEquals( Bridge.getType( value ), conversionType ) ) {
          return value;
        }
        throw new System.InvalidCastException.$ctor1( "Cannot convert to IConvertible" );
      }

      if ( Bridge.referenceEquals( conversionType, scope.convert.convertTypes[System.Array.index( System.TypeCode.Boolean, scope.convert.convertTypes )] ) ) {
        return ic == null ? scope.convert.toBoolean( value, provider ) : ic.System$IConvertible$ToBoolean( provider );
      }
      if ( Bridge.referenceEquals( conversionType, scope.convert.convertTypes[System.Array.index( System.TypeCode.Char, scope.convert.convertTypes )] ) ) {
        return ic == null ? scope.convert.toChar( value, provider, fromTypeCode ) : ic.System$IConvertible$ToChar( provider );
      }
      if ( Bridge.referenceEquals( conversionType, scope.convert.convertTypes[System.Array.index( System.TypeCode.SByte, scope.convert.convertTypes )] ) ) {
        return ic == null ? scope.convert.toSByte( value, provider, fromTypeCode ) : ic.System$IConvertible$ToSByte( provider );
      }
      if ( Bridge.referenceEquals( conversionType, scope.convert.convertTypes[System.Array.index( System.TypeCode.Byte, scope.convert.convertTypes )] ) ) {
        return ic == null ? scope.convert.toByte( value, provider ) : ic.System$IConvertible$ToByte( provider );
      }
      if ( Bridge.referenceEquals( conversionType, scope.convert.convertTypes[System.Array.index( System.TypeCode.Int16, scope.convert.convertTypes )] ) ) {
        return ic == null ? scope.convert.toInt16( value, provider ) : ic.System$IConvertible$ToInt16( provider );
      }
      if ( Bridge.referenceEquals( conversionType, scope.convert.convertTypes[System.Array.index( System.TypeCode.UInt16, scope.convert.convertTypes )] ) ) {
        return ic == null ? scope.convert.toUInt16( value, provider ) : ic.System$IConvertible$ToUInt16( provider );
      }
      if ( Bridge.referenceEquals( conversionType, scope.convert.convertTypes[System.Array.index( System.TypeCode.Int32, scope.convert.convertTypes )] ) ) {
        return ic == null ? scope.convert.toInt32( value, provider ) : ic.System$IConvertible$ToInt32( provider );
      }
      if ( Bridge.referenceEquals( conversionType, scope.convert.convertTypes[System.Array.index( System.TypeCode.UInt32, scope.convert.convertTypes )] ) ) {
        return ic == null ? scope.convert.toUInt32( value, provider ) : ic.System$IConvertible$ToUInt32( provider );
      }
      if ( Bridge.referenceEquals( conversionType, scope.convert.convertTypes[System.Array.index( System.TypeCode.Int64, scope.convert.convertTypes )] ) ) {
        return ic == null ? scope.convert.toInt64( value, provider ) : ic.System$IConvertible$ToInt64( provider );
      }
      if ( Bridge.referenceEquals( conversionType, scope.convert.convertTypes[System.Array.index( System.TypeCode.UInt64, scope.convert.convertTypes )] ) ) {
        return ic == null ? scope.convert.toUInt64( value, provider ) : ic.System$IConvertible$ToUInt64( provider );
      }
      if ( Bridge.referenceEquals( conversionType, scope.convert.convertTypes[System.Array.index( System.TypeCode.Single, scope.convert.convertTypes )] ) ) {
        return ic == null ? scope.convert.toSingle( value, provider ) : ic.System$IConvertible$ToSingle( provider );
      }
      if ( Bridge.referenceEquals( conversionType, scope.convert.convertTypes[System.Array.index( System.TypeCode.Double, scope.convert.convertTypes )] ) ) {
        return ic == null ? scope.convert.toDouble( value, provider ) : ic.System$IConvertible$ToDouble( provider );
      }
      if ( Bridge.referenceEquals( conversionType, scope.convert.convertTypes[System.Array.index( System.TypeCode.Decimal, scope.convert.convertTypes )] ) ) {
        return ic == null ? scope.convert.toDecimal( value, provider ) : ic.System$IConvertible$ToDecimal( provider );
      }
      if ( Bridge.referenceEquals( conversionType, scope.convert.convertTypes[System.Array.index( System.TypeCode.DateTime, scope.convert.convertTypes )] ) ) {
        return ic == null ? scope.convert.toDateTime( value, provider ) : ic.System$IConvertible$ToDateTime( provider );
      }
      if ( Bridge.referenceEquals( conversionType, scope.convert.convertTypes[System.Array.index( System.TypeCode.String, scope.convert.convertTypes )] ) ) {
        return ic == null ? scope.convert.toString( value, provider, fromTypeCode ) : ic.System$IConvertible$ToString( provider );
      }
      if ( Bridge.referenceEquals( conversionType, scope.convert.convertTypes[System.Array.index( System.TypeCode.Object, scope.convert.convertTypes )] ) ) {
        return value;
      }

      if ( ic == null ) {
        throw new System.InvalidCastException.$ctor1( "Cannot convert to IConvertible" );
      }

      return ic.System$IConvertible$ToType( conversionType, provider );
    },

    changeType: function ( value, typeCode, formatProvider ) {
      if ( Bridge.isFunction( typeCode ) ) {
        return scope.convert.changeConversionType( value, typeCode, formatProvider );
      }

      if ( value == null && ( typeCode === System.TypeCode.Empty || typeCode === System.TypeCode.String || typeCode === System.TypeCode.Object ) ) {
        return null;
      }

      var fromTypeCode = scope.convert.getTypeCode( Bridge.getType( value ) ),
        v = Bridge.as( value, System.IConvertible );

      if ( v == null && fromTypeCode == System.TypeCode.Object ) {
        throw new System.InvalidCastException.$ctor1( "Cannot convert to IConvertible" );
      }

      switch ( typeCode ) {
        case System.TypeCode.Boolean:
          return v == null ? scope.convert.toBoolean( value, formatProvider ) : v.System$IConvertible$ToBoolean( provider );
        case System.TypeCode.Char:
          return v == null ? scope.convert.toChar( value, formatProvider, fromTypeCode ) : v.System$IConvertible$ToChar( provider );
        case System.TypeCode.SByte:
          return v == null ? scope.convert.toSByte( value, formatProvider, fromTypeCode ) : v.System$IConvertible$ToSByte( provider );
        case System.TypeCode.Byte:
          return v == null ? scope.convert.toByte( value, formatProvider, fromTypeCode ) : v.System$IConvertible$ToByte( provider );
        case System.TypeCode.Int16:
          return v == null ? scope.convert.toInt16( value, formatProvider ) : v.System$IConvertible$ToInt16( provider );
        case System.TypeCode.UInt16:
          return v == null ? scope.convert.toUInt16( value, formatProvider ) : v.System$IConvertible$ToUInt16( provider );
        case System.TypeCode.Int32:
          return v == null ? scope.convert.toInt32( value, formatProvider ) : v.System$IConvertible$ToInt32( provider );
        case System.TypeCode.UInt32:
          return v == null ? scope.convert.toUInt32( value, formatProvider ) : v.System$IConvertible$ToUInt32( provider );
        case System.TypeCode.Int64:
          return v == null ? scope.convert.toInt64( value, formatProvider ) : v.System$IConvertible$ToInt64( provider );
        case System.TypeCode.UInt64:
          return v == null ? scope.convert.toUInt64( value, formatProvider ) : v.System$IConvertible$ToUInt64( provider );
        case System.TypeCode.Single:
          return v == null ? scope.convert.toSingle( value, formatProvider ) : v.System$IConvertible$ToSingle( provider );
        case System.TypeCode.Double:
          return v == null ? scope.convert.toDouble( value, formatProvider ) : v.System$IConvertible$ToDouble( provider );
        case System.TypeCode.Decimal:
          return v == null ? scope.convert.toDecimal( value, formatProvider ) : v.System$IConvertible$ToDecimal( provider );
        case System.TypeCode.DateTime:
          return v == null ? scope.convert.toDateTime( value, formatProvider ) : v.System$IConvertible$ToDateTime( provider );
        case System.TypeCode.String:
          return v == null ? scope.convert.toString( value, formatProvider, fromTypeCode ) : v.System$IConvertible$ToString( provider );
        case System.TypeCode.Object:
          return value;
        case System.TypeCode.DBNull:
          throw new System.InvalidCastException.$ctor1( "Cannot convert DBNull values" );
        case System.TypeCode.Empty:
          throw new System.InvalidCastException.$ctor1( "Cannot convert Empty values" );
        default:
          throw new System.ArgumentException.$ctor1( "Unknown type code" );
      }
    }
  };

  scope.internal = {
    base64Table: [
      "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O",
      "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d",
      "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s",
      "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7",
      "8", "9", "+", "/", "="
    ],

    typeRanges: {
      Char_MinValue: 0,
      Char_MaxValue: 65535,

      Byte_MinValue: 0,
      Byte_MaxValue: 255,

      SByte_MinValue: -128,
      SByte_MaxValue: 127,

      Int16_MinValue: -32768,
      Int16_MaxValue: 32767,

      UInt16_MinValue: 0,
      UInt16_MaxValue: 65535,

      Int32_MinValue: -2147483648,
      Int32_MaxValue: 2147483647,

      UInt32_MinValue: 0,
      UInt32_MaxValue: 4294967295,

      Int64_MinValue: System.Int64.MinValue,
      Int64_MaxValue: System.Int64.MaxValue,

      UInt64_MinValue: System.UInt64.MinValue,
      UInt64_MaxValue: System.UInt64.MaxValue,

      Single_MinValue: -3.40282347e+38,
      Single_MaxValue: 3.40282347e+38,

      Double_MinValue: -1.7976931348623157e+308,
      Double_MaxValue: 1.7976931348623157e+308,

      Decimal_MinValue: System.Decimal.MinValue,
      Decimal_MaxValue: System.Decimal.MaxValue
    },

    base64LineBreakPosition: 76,

    getTypeCodeName: function ( typeCode ) {
      var typeCodes = scope.convert.typeCodes;

      if ( scope.internal.typeCodeNames == null ) {
        var names = {};

        for ( var codeName in typeCodes ) {
          if ( !typeCodes.hasOwnProperty( codeName ) ) {
            continue;
          }

          var codeValue = typeCodes[codeName];

          names[codeValue] = codeName;
        }
        scope.internal.typeCodeNames = names;
      }

      var name = scope.internal.typeCodeNames[typeCode];

      if ( name == null ) {
        throw System.ArgumentOutOfRangeException( "typeCode", "The specified typeCode is undefined." );
      }

      return name;
    },

    suggestTypeCode: function ( value ) {
      var typeCodes = scope.convert.typeCodes,
        type = typeof ( value );

      switch ( type ) {
        case "boolean":
          return typeCodes.Boolean;

        case "number":
          if ( value % 1 !== 0 ) {
            return typeCodes.Double;
          }

          return typeCodes.Int32;

        case "string":
          return typeCodes.String;

        case "object":
          if ( Bridge.isDate( value ) ) {
            return typeCodes.DateTime;
          }

          if ( value != null ) {
            return typeCodes.Object;
          }

          break;
      }
      return null;
    },

    getMinValue: function ( typeCode ) {
      var typeCodes = scope.convert.typeCodes;

      switch ( typeCode ) {
        case typeCodes.Char:
          return scope.internal.typeRanges.Char_MinValue;
        case typeCodes.SByte:
          return scope.internal.typeRanges.SByte_MinValue;
        case typeCodes.Byte:
          return scope.internal.typeRanges.Byte_MinValue;
        case typeCodes.Int16:
          return scope.internal.typeRanges.Int16_MinValue;
        case typeCodes.UInt16:
          return scope.internal.typeRanges.UInt16_MinValue;
        case typeCodes.Int32:
          return scope.internal.typeRanges.Int32_MinValue;
        case typeCodes.UInt32:
          return scope.internal.typeRanges.UInt32_MinValue;
        case typeCodes.Int64:
          return scope.internal.typeRanges.Int64_MinValue;
        case typeCodes.UInt64:
          return scope.internal.typeRanges.UInt64_MinValue;
        case typeCodes.Single:
          return scope.internal.typeRanges.Single_MinValue;
        case typeCodes.Double:
          return scope.internal.typeRanges.Double_MinValue;
        case typeCodes.Decimal:
          return scope.internal.typeRanges.Decimal_MinValue;
        case typeCodes.DateTime:
          return System.DateTime.getMinValue();

        default:
          return null;
      }
    },

    getMaxValue: function ( typeCode ) {
      var typeCodes = scope.convert.typeCodes;

      switch ( typeCode ) {
        case typeCodes.Char:
          return scope.internal.typeRanges.Char_MaxValue;
        case typeCodes.SByte:
          return scope.internal.typeRanges.SByte_MaxValue;
        case typeCodes.Byte:
          return scope.internal.typeRanges.Byte_MaxValue;
        case typeCodes.Int16:
          return scope.internal.typeRanges.Int16_MaxValue;
        case typeCodes.UInt16:
          return scope.internal.typeRanges.UInt16_MaxValue;
        case typeCodes.Int32:
          return scope.internal.typeRanges.Int32_MaxValue;
        case typeCodes.UInt32:
          return scope.internal.typeRanges.UInt32_MaxValue;
        case typeCodes.Int64:
          return scope.internal.typeRanges.Int64_MaxValue;
        case typeCodes.UInt64:
          return scope.internal.typeRanges.UInt64_MaxValue;
        case typeCodes.Single:
          return scope.internal.typeRanges.Single_MaxValue;
        case typeCodes.Double:
          return scope.internal.typeRanges.Double_MaxValue;
        case typeCodes.Decimal:
          return scope.internal.typeRanges.Decimal_MaxValue;
        case typeCodes.DateTime:
          return System.DateTime.getMaxValue();
        default:
          throw new System.ArgumentOutOfRangeException.$ctor4( "typeCode", "The specified typeCode is undefined." );
      }
    },

    isFloatingType: function ( typeCode ) {
      var typeCodes = scope.convert.typeCodes,
        isFloatingType =
          typeCode === typeCodes.Single ||
          typeCode === typeCodes.Double ||
          typeCode === typeCodes.Decimal;

      return isFloatingType;
    },

    toNumber: function ( value, formatProvider, typeCode, valueTypeCode ) {
      value = Bridge.unbox( value, true );

      var typeCodes = scope.convert.typeCodes,
        type = typeof ( value ),
        isFloating = scope.internal.isFloatingType( typeCode );

      if ( valueTypeCode === typeCodes.String ) {
        type = "string";
      }

      if ( System.Int64.is64Bit( value ) || value instanceof System.Decimal ) {
        type = "number";
      }

      switch ( type ) {
        case "boolean":
          return value ? 1 : 0;

        case "number":
          if ( typeCode === typeCodes.Decimal ) {
            scope.internal.validateNumberRange( value, typeCode, true );

            return new System.Decimal( value, formatProvider );
          }

          if ( typeCode === typeCodes.Int64 ) {
            scope.internal.validateNumberRange( value, typeCode, true );

            return new System.Int64( value );
          }

          if ( typeCode === typeCodes.UInt64 ) {
            scope.internal.validateNumberRange( value, typeCode, true );

            return new System.UInt64( value );
          }

          if ( System.Int64.is64Bit( value ) ) {
            value = value.toNumber();
          } else if ( value instanceof System.Decimal ) {
            value = value.toFloat();
          }

          if ( !isFloating && ( value % 1 !== 0 ) ) {
            value = scope.internal.roundToInt( value, typeCode );
          }

          if ( isFloating ) {
            var minValue = scope.internal.getMinValue( typeCode ),
              maxValue = scope.internal.getMaxValue( typeCode );

            if ( value > maxValue ) {
              value = Infinity;
            } else if ( value < minValue ) {
              value = -Infinity;
            }
          }

          scope.internal.validateNumberRange( value, typeCode, false );
          return value;

        case "string":
          if ( value == null ) {
            if ( formatProvider != null ) {
              throw new System.ArgumentNullException.$ctor3( "String", "Value cannot be null." );
            }

            return 0;
          }

          if ( isFloating ) {
            var nfInfo = ( formatProvider || System.Globalization.CultureInfo.getCurrentCulture() ).getFormat( System.Globalization.NumberFormatInfo ),
              point = nfInfo.numberDecimalSeparator;

            if ( typeCode === typeCodes.Decimal ) {
              if ( !new RegExp( "^[+-]?(\\d+|\\d+.|\\d*\\" + point + "\\d+)$" ).test( value ) ) {
                if ( !/^[+-]?[0-9]+$/.test( value ) ) {
                  throw new System.FormatException.$ctor1( "Input string was not in a correct format." );
                }
              }

              value = new System.Decimal( value, formatProvider );
            } else {
              if ( !new RegExp( "^[-+]?[0-9]*\\" + point + "?[0-9]+([eE][-+]?[0-9]+)?$" ).test( value ) ) {
                throw new System.FormatException.$ctor1( "Input string was not in a correct format." );
              }

              value = Bridge.Int.parseFloat( value, formatProvider );
            }
          } else {
            if ( !/^[+-]?[0-9]+$/.test( value ) ) {
              throw new System.FormatException.$ctor1( "Input string was not in a correct format." );
            }

            var str = value;

            if ( typeCode === typeCodes.Int64 ) {
              value = new System.Int64( value );

              if ( System.String.trimStartZeros( str ) !== value.toString() ) {
                this.throwOverflow( scope.internal.getTypeCodeName( typeCode ) );
              }
            } else if ( typeCode === typeCodes.UInt64 ) {
              value = new System.UInt64( value );

              if ( System.String.trimStartZeros( str ) !== value.toString() ) {
                this.throwOverflow( scope.internal.getTypeCodeName( typeCode ) );
              }
            } else {
              value = parseInt( value, 10 );
            }
          }

          if ( isNaN( value ) ) {
            throw new System.FormatException.$ctor1( "Input string was not in a correct format." );
          }

          scope.internal.validateNumberRange( value, typeCode, true );

          return value;

        case "object":
          if ( value == null ) {
            return 0;
          }

          if ( Bridge.isDate( value ) ) {
            scope.internal.throwInvalidCastEx( scope.convert.typeCodes.DateTime, typeCode );
          }

          break;
      }

      // TODO: #822 When IConvertible is implemented, try it before throwing InvalidCastEx
      valueTypeCode = valueTypeCode || scope.internal.suggestTypeCode( value );
      scope.internal.throwInvalidCastEx( valueTypeCode, typeCode );

      // try converting using IConvertible
      return scope.convert.convertToType( typeCode, value, formatProvider );
    },

    validateNumberRange: function ( value, typeCode, denyInfinity ) {
      var typeCodes = scope.convert.typeCodes,
        minValue = scope.internal.getMinValue( typeCode ),
        maxValue = scope.internal.getMaxValue( typeCode ),
        typeName = scope.internal.getTypeCodeName( typeCode );

      if ( typeCode === typeCodes.Single ||
        typeCode === typeCodes.Double ) {
        if ( !denyInfinity && ( value === Infinity || value === -Infinity ) ) {
          return;
        }
      }

      if ( typeCode === typeCodes.Decimal || typeCode === typeCodes.Int64 || typeCode === typeCodes.UInt64 ) {
        if ( typeCode === typeCodes.Decimal ) {
          if ( !System.Int64.is64Bit( value ) ) {
            if ( minValue.gt( value ) || maxValue.lt( value ) ) {
              this.throwOverflow( typeName );
            }
          }

          value = new System.Decimal( value );
        } else if ( typeCode === typeCodes.Int64 ) {
          if ( value instanceof System.UInt64 ) {
            if ( value.gt( System.Int64.MaxValue ) ) {
              this.throwOverflow( typeName );
            }
          } else if ( value instanceof System.Decimal ) {
            if ( ( value.gt( new System.Decimal( maxValue ) ) || value.lt( new System.Decimal( minValue ) ) ) ) {
              this.throwOverflow( typeName );
            }
          } else if ( !( value instanceof System.Int64 ) ) {
            if ( minValue.toNumber() > value || maxValue.toNumber() < value ) {
              this.throwOverflow( typeName );
            }
          }

          value = new System.Int64( value );
        } else if ( typeCode === typeCodes.UInt64 ) {
          if ( value instanceof System.Int64 ) {
            if ( value.isNegative() ) {
              this.throwOverflow( typeName );
            }
          } else if ( value instanceof System.Decimal ) {
            if ( ( value.gt( new System.Decimal( maxValue ) ) || value.lt( new System.Decimal( minValue ) ) ) ) {
              this.throwOverflow( typeName );
            }
          } else if ( !( value instanceof System.UInt64 ) ) {
            if ( minValue.toNumber() > value || maxValue.toNumber() < value ) {
              this.throwOverflow( typeName );
            }
          }

          value = new System.UInt64( value );
        }
      } else if ( value < minValue || value > maxValue ) {
        this.throwOverflow( typeName );
      }
    },

    throwOverflow: function ( typeName ) {
      throw new System.OverflowException.$ctor1( "Value was either too large or too small for '" + typeName + "'." );
    },

    roundToInt: function ( value, typeCode ) {
      if ( value % 1 === 0 ) {
        return value;
      }

      var intPart;

      if ( value >= 0 ) {
        intPart = Math.floor( value );
      } else {
        intPart = -1 * Math.floor( -value );
      }

      var floatPart = value - intPart,
        minValue = scope.internal.getMinValue( typeCode ),
        maxValue = scope.internal.getMaxValue( typeCode );

      if ( value >= 0.0 ) {
        if ( value < ( maxValue + 0.5 ) ) {
          if ( floatPart > 0.5 || floatPart === 0.5 && ( intPart & 1 ) !== 0 ) {
            ++intPart;
          }

          return intPart;
        }
      } else if ( value >= ( minValue - 0.5 ) ) {
        if ( floatPart < -0.5 || floatPart === -0.5 && ( intPart & 1 ) !== 0 ) {
          --intPart;
        }

        return intPart;
      }

      var typeName = scope.internal.getTypeCodeName( typeCode );

      throw new System.OverflowException.$ctor1( "Value was either too large or too small for an '" + typeName + "'." );
    },

    toBase64_CalculateAndValidateOutputLength: function ( inputLength, insertLineBreaks ) {
      var base64LineBreakPosition = scope.internal.base64LineBreakPosition,
        outlen = ~~( inputLength / 3 ) * 4; // the base length - we want integer division here.

      outlen += ( ( inputLength % 3 ) !== 0 ) ? 4 : 0; // at most 4 more chars for the remainder

      if ( outlen === 0 ) {
        return 0;
      }

      if ( insertLineBreaks ) {
        var newLines = ~~( outlen / base64LineBreakPosition );

        if ( ( outlen % base64LineBreakPosition ) === 0 ) {
          --newLines;
        }

        outlen += newLines * 2; // the number of line break chars we'll add, "\r\n"
      }

      // If we overflow an int then we cannot allocate enough
      // memory to output the value so throw
      if ( outlen > 2147483647 ) {
        throw new System.OutOfMemoryException();
      }

      return outlen;
    },

    convertToBase64Array: function ( outChars, inData, offset, length, insertLineBreaks ) {
      var base64Table = scope.internal.base64Table,
        base64LineBreakPosition = scope.internal.base64LineBreakPosition,
        lengthmod3 = length % 3,
        calcLength = offset + ( length - lengthmod3 ),
        charCount = 0,
        j = 0;

      // Convert three bytes at a time to base64 notation.  This will consume 4 chars.
      var i;

      for ( i = offset; i < calcLength; i += 3 ) {
        if ( insertLineBreaks ) {
          if ( charCount === base64LineBreakPosition ) {
            outChars[j++] = "\r";
            outChars[j++] = "\n";
            charCount = 0;
          }

          charCount += 4;
        }

        outChars[j] = base64Table[( inData[i] & 0xfc ) >> 2];
        outChars[j + 1] = base64Table[( ( inData[i] & 0x03 ) << 4 ) | ( ( inData[i + 1] & 0xf0 ) >> 4 )];
        outChars[j + 2] = base64Table[( ( inData[i + 1] & 0x0f ) << 2 ) | ( ( inData[i + 2] & 0xc0 ) >> 6 )];
        outChars[j + 3] = base64Table[( inData[i + 2] & 0x3f )];
        j += 4;
      }

      //Where we left off before
      i = calcLength;

      if ( insertLineBreaks && ( lengthmod3 !== 0 ) && ( charCount === scope.internal.base64LineBreakPosition ) ) {
        outChars[j++] = "\r";
        outChars[j++] = "\n";
      }

      switch ( lengthmod3 ) {
        case 2: //One character padding needed
          outChars[j] = base64Table[( inData[i] & 0xfc ) >> 2];
          outChars[j + 1] = base64Table[( ( inData[i] & 0x03 ) << 4 ) | ( ( inData[i + 1] & 0xf0 ) >> 4 )];
          outChars[j + 2] = base64Table[( inData[i + 1] & 0x0f ) << 2];
          outChars[j + 3] = base64Table[64]; //Pad
          j += 4;

          break;

        case 1: // Two character padding needed
          outChars[j] = base64Table[( inData[i] & 0xfc ) >> 2];
          outChars[j + 1] = base64Table[( inData[i] & 0x03 ) << 4];
          outChars[j + 2] = base64Table[64]; //Pad
          outChars[j + 3] = base64Table[64]; //Pad
          j += 4;

          break;
      }

      return j;
    },

    fromBase64CharPtr: function ( input, offset, inputLength ) {
      if ( inputLength < 0 ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "inputLength", "Index was out of range. Must be non-negative and less than the size of the collection." );
      }

      if ( offset < 0 ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "offset", "Value must be positive." );
      }

      // We need to get rid of any trailing white spaces.
      // Otherwise we would be rejecting input such as "abc= ":
      while ( inputLength > 0 ) {
        var lastChar = input[offset + inputLength - 1];

        if ( lastChar !== " " && lastChar !== "\n" && lastChar !== "\r" && lastChar !== "\t" ) {
          break;
        }

        inputLength--;
      }

      // Compute the output length:
      var resultLength = scope.internal.fromBase64_ComputeResultLength( input, offset, inputLength );

      if ( 0 > resultLength ) {
        throw new System.InvalidOperationException.$ctor1( "Contract voilation: 0 <= resultLength." );
      }

      // resultLength can be zero. We will still enter FromBase64_Decode and process the input.
      // It may either simply write no bytes (e.g. input = " ") or throw (e.g. input = "ab").

      // Create result byte blob:
      var decodedBytes = [];
      decodedBytes.length = resultLength;

      // Convert Base64 chars into bytes:
      scope.internal.fromBase64_Decode( input, offset, inputLength, decodedBytes, 0, resultLength );

      // We are done:
      return decodedBytes;
    },

    fromBase64_Decode: function ( input, inputIndex, inputLength, dest, destIndex, destLength ) {
      var startDestIndex = destIndex;

      // You may find this method weird to look at. Its written for performance, not aesthetics.
      // You will find unrolled loops label jumps and bit manipulations.

      var intA = "A".charCodeAt( 0 ),
        inta = "a".charCodeAt( 0 ),
        int0 = "0".charCodeAt( 0 ),
        intEq = "=".charCodeAt( 0 ),
        intPlus = "+".charCodeAt( 0 ),
        intSlash = "/".charCodeAt( 0 ),
        intSpace = " ".charCodeAt( 0 ),
        intTab = "\t".charCodeAt( 0 ),
        intNLn = "\n".charCodeAt( 0 ),
        intCRt = "\r".charCodeAt( 0 ),
        intAtoZ = ( "Z".charCodeAt( 0 ) - "A".charCodeAt( 0 ) ),
        int0To9 = ( "9".charCodeAt( 0 ) - "0".charCodeAt( 0 ) );

      var endInputIndex = inputIndex + inputLength,
        endDestIndex = destIndex + destLength;

      // Current char code/value:
      var currCode;

      // This 4-byte integer will contain the 4 codes of the current 4-char group.
      // Eeach char codes for 6 bits = 24 bits.
      // The remaining byte will be FF, we use it as a marker when 4 chars have been processed.
      var currBlockCodes = 0x000000FF;

      var allInputConsumed = false,
        equalityCharEncountered = false;

      while ( true ) {
        // break when done:
        if ( inputIndex >= endInputIndex ) {
          allInputConsumed = true;

          break;
        }

        // Get current char:
        currCode = input[inputIndex].charCodeAt( 0 );
        inputIndex++;

        // Determine current char code (unsigned Int comparison):
        if ( ( ( currCode - intA ) >>> 0 ) <= intAtoZ ) {
          currCode -= intA;
        } else if ( ( ( currCode - inta ) >>> 0 ) <= intAtoZ ) {
          currCode -= ( inta - 26 );
        } else if ( ( ( currCode - int0 ) >>> 0 ) <= int0To9 ) {
          currCode -= ( int0 - 52 );
        } else {
          // Use the slower switch for less common cases:
          switch ( currCode ) {
            // Significant chars:
            case intPlus:
              currCode = 62;

              break;

            case intSlash:
              currCode = 63;

              break;

            // Legal no-value chars (we ignore these):
            case intCRt:
            case intNLn:
            case intSpace:
            case intTab:
              continue;

            // The equality char is only legal at the end of the input.
            // Jump after the loop to make it easier for the JIT register predictor to do a good job for the loop itself:
            case intEq:
              equalityCharEncountered = true;

              break;

            // Other chars are illegal:
            default:
              throw new System.FormatException.$ctor1( "The input is not a valid Base-64 string as it contains a non-base 64 character, more than two padding characters, or an illegal character among the padding characters." );
          }
        }

        if ( equalityCharEncountered ) {
          break;
        }

        // Ok, we got the code. Save it:
        currBlockCodes = ( currBlockCodes << 6 ) | currCode;

        // Last bit in currBlockCodes will be on after in shifted right 4 times:
        if ( ( currBlockCodes & 0x80000000 ) !== 0 ) {
          if ( ( endDestIndex - destIndex ) < 3 ) {
            return -1;
          }

          dest[destIndex] = 0xFF & ( currBlockCodes >> 16 );
          dest[destIndex + 1] = 0xFF & ( currBlockCodes >> 8 );
          dest[destIndex + 2] = 0xFF & ( currBlockCodes );
          destIndex += 3;

          currBlockCodes = 0x000000FF;
        }
      } // end of while

      if ( !allInputConsumed && !equalityCharEncountered ) {
        throw new System.InvalidOperationException.$ctor1( "Contract violation: should never get here." );
      }

      if ( equalityCharEncountered ) {
        if ( currCode !== intEq ) {
          throw new System.InvalidOperationException.$ctor1( "Contract violation: currCode == intEq." );
        }

        // Recall that inputIndex is now one position past where '=' was read.
        // '=' can only be at the last input pos:
        if ( inputIndex === endInputIndex ) {
          // Code is zero for trailing '=':
          currBlockCodes <<= 6;

          // The '=' did not complete a 4-group. The input must be bad:
          if ( ( currBlockCodes & 0x80000000 ) === 0 ) {
            throw new System.FormatException.$ctor1( "Invalid length for a Base-64 char array or string." );
          }

          if ( ( endDestIndex - destIndex ) < 2 ) {
            // Autch! We underestimated the output length!
            return -1;
          }

          // We are good, store bytes form this past group. We had a single "=", so we take two bytes:
          dest[destIndex] = 0xFF & ( currBlockCodes >> 16 );
          dest[destIndex + 1] = 0xFF & ( currBlockCodes >> 8 );
          destIndex += 2;

          currBlockCodes = 0x000000FF;
        } else { // '=' can also be at the pre-last position iff the last is also a '=' excluding the white spaces:
          // We need to get rid of any intermediate white spaces.
          // Otherwise we would be rejecting input such as "abc= =":
          while ( inputIndex < ( endInputIndex - 1 ) ) {
            var lastChar = input[inputIndex];

            if ( lastChar !== " " && lastChar !== "\n" && lastChar !== "\r" && lastChar !== "\t" ) {
              break;
            }

            inputIndex++;
          }

          if ( inputIndex === ( endInputIndex - 1 ) && input[inputIndex] === "=" ) {
            // Code is zero for each of the two '=':
            currBlockCodes <<= 12;

            // The '=' did not complete a 4-group. The input must be bad:
            if ( ( currBlockCodes & 0x80000000 ) === 0 ) {
              throw new System.FormatException.$ctor1( "Invalid length for a Base-64 char array or string." );
            }

            if ( ( endDestIndex - destIndex ) < 1 ) {
              // Autch! We underestimated the output length!
              return -1;
            }

            // We are good, store bytes form this past group. We had a "==", so we take only one byte:
            dest[destIndex] = 0xFF & ( currBlockCodes >> 16 );
            destIndex++;

            currBlockCodes = 0x000000FF;
          } else {
            // '=' is not ok at places other than the end:
            throw new System.FormatException.$ctor1( "The input is not a valid Base-64 string as it contains a non-base 64 character, more than two padding characters, or an illegal character among the padding characters." );
          }
        }
      }

      // We get here either from above or by jumping out of the loop:
      // The last block of chars has less than 4 items
      if ( currBlockCodes !== 0x000000FF ) {
        throw new System.FormatException.$ctor1( "Invalid length for a Base-64 char array or string." );
      }

      // Return how many bytes were actually recovered:
      return ( destIndex - startDestIndex );
    },

    fromBase64_ComputeResultLength: function ( input, startIndex, inputLength ) {
      var intEq = "=",
        intSpace = " ";

      if ( inputLength < 0 ) {
        throw new System.ArgumentOutOfRangeException.$ctor4( "inputLength", "Index was out of range. Must be non-negative and less than the size of the collection." );
      }

      var endIndex = startIndex + inputLength,
        usefulInputLength = inputLength,
        padding = 0;

      while ( startIndex < endIndex ) {
        var c = input[startIndex];

        startIndex++;

        // We want to be as fast as possible and filter out spaces with as few comparisons as possible.
        // We end up accepting a number of illegal chars as legal white-space chars.
        // This is ok: as soon as we hit them during actual decode we will recognise them as illegal and throw.
        if ( c <= intSpace ) {
          usefulInputLength--;
        } else if ( c === intEq ) {
          usefulInputLength--;
          padding++;
        }
      }

      if ( 0 > usefulInputLength ) {
        throw new System.InvalidOperationException.$ctor1( "Contract violation: 0 <= usefulInputLength." );
      }

      if ( 0 > padding ) {
        // For legal input, we can assume that 0 <= padding < 3. But it may be more for illegal input.
        // We will notice it at decode when we see a '=' at the wrong place.
        throw new System.InvalidOperationException.$ctor1( "Contract violation: 0 <= padding." );
      }

      // Perf: reuse the variable that stored the number of '=' to store the number of bytes encoded by the
      // last group that contains the '=':
      if ( padding !== 0 ) {
        if ( padding === 1 ) {
          padding = 2;
        } else if ( padding === 2 ) {
          padding = 1;
        } else {
          throw new System.FormatException.$ctor1( "The input is not a valid Base-64 string as it contains a non-base 64 character, more than two padding characters, or an illegal character among the padding characters." );
        }
      }

      // Done:
      return ~~( usefulInputLength / 4 ) * 3 + padding;
    },

    charsToCodes: function ( chars, codes, codesOffset ) {
      if ( chars == null ) {
        return null;
      }

      codesOffset = codesOffset || 0;

      if ( codes == null ) {
        codes = [];
        codes.length = chars.length;
      }

      for ( var i = 0; i < chars.length; i++ ) {
        codes[i + codesOffset] = chars[i].charCodeAt( 0 );
      }

      return codes;
    },

    codesToChars: function ( codes, chars ) {
      if ( codes == null ) {
        return null;
      }

      chars = chars || [];

      for ( var i = 0; i < codes.length; i++ ) {
        var code = codes[i];

        chars[i] = String.fromCharCode( code );
      }

      return chars;
    },

    throwInvalidCastEx: function ( fromTypeCode, toTypeCode ) {
      var fromType = scope.internal.getTypeCodeName( fromTypeCode ), toType = scope.internal.getTypeCodeName( toTypeCode );

      throw new System.InvalidCastException.$ctor1( "Invalid cast from '" + fromType + "' to '" + toType + "'." );
    }
  };

  System.Convert = scope.convert;

  // @source ClientWebSocket.js

  Bridge.define( "System.Net.WebSockets.ClientWebSocket", {
    inherits: [System.IDisposable],

    ctor: function () {
      this.$initialize();
      this.messageBuffer = [];
      this.state = "none";
      this.options = new System.Net.WebSockets.ClientWebSocketOptions();
      this.disposed = false;
      this.closeStatus = null;
      this.closeStatusDescription = null;
    },

    getCloseStatus: function () {
      return this.closeStatus;
    },

    getState: function () {
      return this.state;
    },

    getCloseStatusDescription: function () {
      return this.closeStatusDescription;
    },

    getSubProtocol: function () {
      return this.socket ? this.socket.protocol : null;
    },

    onCloseHandler: function ( event ) {
      var reason,
        success = false;

      // See http://tools.ietf.org/html/rfc6455#section-7.4.1
      if ( event.code == 1000 ) {
        reason = "Status code: " + event.code + ". Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
        success = true;
      } else if ( event.code == 1001 )
        reason = "Status code: " + event.code + ". An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
      else if ( event.code == 1002 )
        reason = "Status code: " + event.code + ". An endpoint is terminating the connection due to a protocol error";
      else if ( event.code == 1003 )
        reason = "Status code: " + event.code + ". An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
      else if ( event.code == 1004 )
        reason = "Status code: " + event.code + ". Reserved. The specific meaning might be defined in the future.";
      else if ( event.code == 1005 )
        reason = "Status code: " + event.code + ". No status code was actually present.";
      else if ( event.code == 1006 )
        reason = "Status code: " + event.code + ". The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
      else if ( event.code == 1007 )
        reason = "Status code: " + event.code + ". An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
      else if ( event.code == 1008 )
        reason = "Status code: " + event.code + ". An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";
      else if ( event.code == 1009 )
        reason = "Status code: " + event.code + ". An endpoint is terminating the connection because it has received a message that is too big for it to process.";
      else if ( event.code == 1010 ) // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
        reason = "Status code: " + event.code + ". An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reason;
      else if ( event.code == 1011 )
        reason = "Status code: " + event.code + ". A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
      else if ( event.code == 1015 )
        reason = "Status code: " + event.code + ". The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
      else
        reason = "Unknown reason";

      return {
        code: event.code,
        reason: reason
      };
    },

    connectAsync: function ( uri, cancellationToken ) {
      if ( this.state !== "none" ) {
        throw new System.InvalidOperationException.$ctor1( "Socket is not in initial state" );
      }

      this.options.setToReadOnly();
      this.state = "connecting";

      var tcs = new System.Threading.Tasks.TaskCompletionSource(),
        self = this;

      try {
        this.socket = new WebSocket( uri.getAbsoluteUri(), this.options.requestedSubProtocols );

        this.socket.onerror = function ( e ) {
          setTimeout( function () {
            if ( self.closeInfo && !self.closeInfo.success ) {
              e.message = self.closeInfo.reason;
            }
            tcs.setException( System.Exception.create( e ) );
          }, 10 );
        };

        this.socket.binaryType = "arraybuffer";
        this.socket.onopen = function () {
          self.state = "open";
          tcs.setResult( null );
        };

        this.socket.onmessage = function ( e ) {
          var data = e.data,
            message = {},
            i;

          message.bytes = [];

          if ( typeof ( data ) === "string" ) {
            for ( i = 0; i < data.length; ++i ) {
              message.bytes.push( data.charCodeAt( i ) );
            }

            message.messageType = "text";
            self.messageBuffer.push( message );

            return;
          }

          if ( data instanceof ArrayBuffer ) {
            var dataView = new Uint8Array( data );

            for ( i = 0; i < dataView.length; i++ ) {
              message.bytes.push( dataView[i] );
            }

            message.messageType = "binary";
            self.messageBuffer.push( message );

            return;
          }

          throw new System.ArgumentException.$ctor1( "Invalid message type." );
        };

        this.socket.onclose = function ( e ) {
          self.state = "closed";
          self.closeStatus = e.code;
          self.closeStatusDescription = e.reason;
          self.closeInfo = self.onCloseHandler( e );
        };
      } catch ( e ) {
        tcs.setException( System.Exception.create( e ) );
      }

      return tcs.task;
    },

    sendAsync: function ( buffer, messageType, endOfMessage, cancellationToken ) {
      this.throwIfNotConnected();

      var tcs = new System.Threading.Tasks.TaskCompletionSource();

      try {
        if ( messageType === "close" ) {
          this.socket.close();
        } else {
          var array = buffer.getArray(),
            count = buffer.getCount(),
            offset = buffer.getOffset();

          var data = new Uint8Array( count );

          for ( var i = 0; i < count; i++ ) {
            data[i] = array[i + offset];
          }

          if ( messageType === "text" ) {
            data = String.fromCharCode.apply( null, data );
          }

          this.socket.send( data );
        }

        tcs.setResult( null );
      } catch ( e ) {
        tcs.setException( System.Exception.create( e ) );
      }

      return tcs.task;
    },

    receiveAsync: function ( buffer, cancellationToken ) {
      this.throwIfNotConnected();

      var task,
        tcs = new System.Threading.Tasks.TaskCompletionSource(),
        self = this,
        asyncBody = Bridge.fn.bind( this, function () {
          try {
            if ( cancellationToken.getIsCancellationRequested() ) {
              tcs.setException( new System.Threading.Tasks.TaskCanceledException( "Receive has been cancelled.", tcs.task ) );

              return;
            }

            if ( self.messageBuffer.length === 0 ) {
              task = System.Threading.Tasks.Task.delay( 0 );
              task.continueWith( asyncBody );

              return;
            }

            var message = self.messageBuffer[0],
              array = buffer.getArray(),
              resultBytes,
              endOfMessage;

            if ( message.bytes.length <= array.length ) {
              self.messageBuffer.shift();
              resultBytes = message.bytes;
              endOfMessage = true;
            } else {
              resultBytes = message.bytes.slice( 0, array.length );
              message.bytes = message.bytes.slice( array.length, message.bytes.length );
              endOfMessage = false;
            }

            for ( var i = 0; i < resultBytes.length; i++ ) {
              array[i] = resultBytes[i];
            }

            tcs.setResult( new System.Net.WebSockets.WebSocketReceiveResult(
              resultBytes.length, message.messageType, endOfMessage ) );
          } catch ( e ) {
            tcs.setException( System.Exception.create( e ) );
          }
        }, arguments );

      asyncBody();

      return tcs.task;
    },

    closeAsync: function ( closeStatus, statusDescription, cancellationToken ) {
      this.throwIfNotConnected();

      if ( this.state !== "open" ) {
        throw new System.InvalidOperationException.$ctor1( "Socket is not in connected state" );
      }

      var tcs = new System.Threading.Tasks.TaskCompletionSource(),
        self = this,
        task,
        asyncBody = function () {
          if ( self.state === "closed" ) {
            tcs.setResult( null );
            return;
          }

          if ( cancellationToken.getIsCancellationRequested() ) {
            tcs.setException( new System.Threading.Tasks.TaskCanceledException( "Closing has been cancelled.", tcs.task ) );
            return;
          }

          task = System.Threading.Tasks.Task.delay( 0 );
          task.continueWith( asyncBody );
        };
      try {
        this.state = "closesent";
        this.socket.close( closeStatus, statusDescription );
      } catch ( e ) {
        tcs.setException( System.Exception.create( e ) );
      }

      asyncBody();

      return tcs.task;
    },

    closeOutputAsync: function ( closeStatus, statusDescription, cancellationToken ) {
      this.throwIfNotConnected();

      if ( this.state !== "open" ) {
        throw new System.InvalidOperationException.$ctor1( "Socket is not in connected state" );
      }

      var tcs = new System.Threading.Tasks.TaskCompletionSource();

      try {
        this.state = "closesent";
        this.socket.close( closeStatus, statusDescription );
        tcs.setResult( null );
      } catch ( e ) {
        tcs.setException( System.Exception.create( e ) );
      }

      return tcs.task;
    },

    abort: function () {
      this.Dispose();
    },

    Dispose: function () {
      if ( this.disposed ) {
        return;
      }

      this.disposed = true;
      this.messageBuffer = [];

      if ( state === "open" ) {
        this.state = "closesent";
        this.socket.close();
      }
    },

    throwIfNotConnected: function () {
      if ( this.disposed ) {
        throw new System.InvalidOperationException.$ctor1( "Socket is disposed." );
      }

      if ( this.socket.readyState !== 1 ) {
        throw new System.InvalidOperationException.$ctor1( "Socket is not connected." );
      }
    }
  } );

  Bridge.define( "System.Net.WebSockets.ClientWebSocketOptions", {
    ctor: function () {
      this.$initialize();
      this.isReadOnly = false;
      this.requestedSubProtocols = [];
    },

    setToReadOnly: function () {
      if ( this.isReadOnly ) {
        throw new System.InvalidOperationException.$ctor1( "Options are already readonly." );
      }

      this.isReadOnly = true;
    },

    addSubProtocol: function ( subProtocol ) {
      if ( this.isReadOnly ) {
        throw new System.InvalidOperationException.$ctor1( "Socket already started." );
      }

      if ( this.requestedSubProtocols.indexOf( subProtocol ) > -1 ) {
        throw new System.ArgumentException.$ctor1( "Socket cannot have duplicate sub-protocols.", "subProtocol" );
      }

      this.requestedSubProtocols.push( subProtocol );
    }
  } );

  Bridge.define( "System.Net.WebSockets.WebSocketReceiveResult", {
    ctor: function ( count, messageType, endOfMessage, closeStatus, closeStatusDescription ) {
      this.$initialize();
      this.count = count;
      this.messageType = messageType;
      this.endOfMessage = endOfMessage;
      this.closeStatus = closeStatus;
      this.closeStatusDescription = closeStatusDescription;
    },

    getCount: function () {
      return this.count;
    },

    getMessageType: function () {
      return this.messageType;
    },

    getEndOfMessage: function () {
      return this.endOfMessage;
    },

    getCloseStatus: function () {
      return this.closeStatus;
    },

    getCloseStatusDescription: function () {
      return this.closeStatusDescription;
    }
  } );

  // @source Uri.js

  Bridge.assembly( "System", {}, function ( $asm, globals ) {
    "use strict";

    Bridge.define( "System.Uri", {
      statics: {
        methods: {
          equals: function ( uri1, uri2 ) {
            if ( uri1 == uri2 ) {
              return true;
            }

            if ( uri1 == null || uri2 == null ) {
              return false;
            }

            return uri2.equals( uri1 );
          },

          notEquals: function ( uri1, uri2 ) {
            return !System.Uri.equals( uri1, uri2 );
          }
        }
      },

      ctor: function ( uriString ) {
        this.$initialize();
        this.absoluteUri = uriString;
      },

      getAbsoluteUri: function () {
        return this.absoluteUri;
      },

      toJSON: function () {
        return this.absoluteUri;
      },

      toString: function () {
        return this.absoluteUri;
      },

      equals: function ( uri ) {
        if ( uri == null || !Bridge.is( uri, System.Uri ) ) {
          return false;
        }

        return this.absoluteUri === uri.absoluteUri;
      }
    } );
  }, true );

  // @source Generator.js

  Bridge.define( "Bridge.GeneratorEnumerable", {
    inherits: [System.Collections.IEnumerable],

    config: {
      alias: [
        "GetEnumerator", "System$Collections$IEnumerable$GetEnumerator"
      ]
    },

    ctor: function ( action ) {
      this.$initialize();
      this.GetEnumerator = action;
      this.System$Collections$IEnumerable$GetEnumerator = action;
    }
  } );

  Bridge.define( "Bridge.GeneratorEnumerable$1", function ( T ) {
    return {
      inherits: [System.Collections.Generic.IEnumerable$1( T )],

      config: {
        alias: [
          "GetEnumerator", ["System$Collections$Generic$IEnumerable$1$" + Bridge.getTypeAlias( T ) + "$GetEnumerator", "System$Collections$Generic$IEnumerable$1$GetEnumerator"]
        ]
      },

      ctor: function ( action ) {
        this.$initialize();
        this.GetEnumerator = action;
        this["System$Collections$Generic$IEnumerable$1$" + Bridge.getTypeAlias( T ) + "$GetEnumerator"] = action;
        this["System$Collections$Generic$IEnumerable$1$GetEnumerator"] = action;
      }
    };
  } );

  Bridge.define( "Bridge.GeneratorEnumerator", {
    inherits: [System.Collections.IEnumerator],

    current: null,

    config: {
      properties: {
        Current: {
          get: function () {
            return this.getCurrent();
          }
        }
      },

      alias: [
        "getCurrent", "System$Collections$IEnumerator$getCurrent",
        "moveNext", "System$Collections$IEnumerator$moveNext",
        "reset", "System$Collections$IEnumerator$reset",
        "Current", "System$Collections$IEnumerator$Current"
      ]
    },

    ctor: function ( action ) {
      this.$initialize();
      this.moveNext = action;
      this.System$Collections$IEnumerator$moveNext = action;
    },

    getCurrent: function () {
      return this.current;
    },

    getCurrent$1: function () {
      return this.current;
    },

    reset: function () {
      throw new System.NotSupportedException();
    }
  } );

  Bridge.define( "Bridge.GeneratorEnumerator$1", function ( T ) {
    return {
      inherits: [System.Collections.Generic.IEnumerator$1( T ), System.IDisposable],

      current: null,

      config: {
        properties: {
          Current: {
            get: function () {
              return this.getCurrent();
            }
          },

          Current$1: {
            get: function () {
              return this.getCurrent();
            }
          }
        },
        alias: [
          "getCurrent", ["System$Collections$Generic$IEnumerator$1$" + Bridge.getTypeAlias( T ) + "$getCurrent$1", "System$Collections$Generic$IEnumerator$1$getCurrent$1"],
          "Current", ["System$Collections$Generic$IEnumerator$1$" + Bridge.getTypeAlias( T ) + "$Current$1", "System$Collections$Generic$IEnumerator$1$Current$1"],
          "Current", "System$Collections$IEnumerator$Current",
          "Dispose", "System$IDisposable$Dispose",
          "moveNext", "System$Collections$IEnumerator$moveNext",
          "reset", "System$Collections$IEnumerator$reset"
        ]
      },

      ctor: function ( action, final ) {
        this.$initialize();
        this.moveNext = action;
        this.System$Collections$IEnumerator$moveNext = action;
        this.final = final;
      },

      getCurrent: function () {
        return this.current;
      },

      getCurrent$1: function () {
        return this.current;
      },

      System$Collections$IEnumerator$getCurrent: function () {
        return this.current;
      },

      Dispose: function () {
        if ( this.final ) {
          this.final();
        }
      },

      reset: function () {
        throw new System.NotSupportedException();
      }
    };
  } );

  // @source CollectionDataContractAttribute.js

  Bridge.define( "System.Runtime.Serialization.CollectionDataContractAttribute", {
    inherits: [System.Attribute],
    fields: {
      _name: null,
      _ns: null,
      _itemName: null,
      _keyName: null,
      _valueName: null,
      _isReference: false,
      _isNameSetExplicitly: false,
      _isNamespaceSetExplicitly: false,
      _isReferenceSetExplicitly: false,
      _isItemNameSetExplicitly: false,
      _isKeyNameSetExplicitly: false,
      _isValueNameSetExplicitly: false
    },
    props: {
      Namespace: {
        get: function () {
          return this._ns;
        },
        set: function ( value ) {
          this._ns = value;
          this._isNamespaceSetExplicitly = true;
        }
      },
      IsNamespaceSetExplicitly: {
        get: function () {
          return this._isNamespaceSetExplicitly;
        }
      },
      Name: {
        get: function () {
          return this._name;
        },
        set: function ( value ) {
          this._name = value;
          this._isNameSetExplicitly = true;
        }
      },
      IsNameSetExplicitly: {
        get: function () {
          return this._isNameSetExplicitly;
        }
      },
      ItemName: {
        get: function () {
          return this._itemName;
        },
        set: function ( value ) {
          this._itemName = value;
          this._isItemNameSetExplicitly = true;
        }
      },
      IsItemNameSetExplicitly: {
        get: function () {
          return this._isItemNameSetExplicitly;
        }
      },
      KeyName: {
        get: function () {
          return this._keyName;
        },
        set: function ( value ) {
          this._keyName = value;
          this._isKeyNameSetExplicitly = true;
        }
      },
      IsReference: {
        get: function () {
          return this._isReference;
        },
        set: function ( value ) {
          this._isReference = value;
          this._isReferenceSetExplicitly = true;
        }
      },
      IsReferenceSetExplicitly: {
        get: function () {
          return this._isReferenceSetExplicitly;
        }
      },
      IsKeyNameSetExplicitly: {
        get: function () {
          return this._isKeyNameSetExplicitly;
        }
      },
      ValueName: {
        get: function () {
          return this._valueName;
        },
        set: function ( value ) {
          this._valueName = value;
          this._isValueNameSetExplicitly = true;
        }
      },
      IsValueNameSetExplicitly: {
        get: function () {
          return this._isValueNameSetExplicitly;
        }
      }
    },
    ctors: {
      ctor: function () {
        this.$initialize();
        System.Attribute.ctor.call( this );
      }
    }
  } );

  // @source ContractNamespaceAttribute.js

  Bridge.define( "System.Runtime.Serialization.ContractNamespaceAttribute", {
    inherits: [System.Attribute],
    fields: {
      _clrNamespace: null,
      _contractNamespace: null
    },
    props: {
      ClrNamespace: {
        get: function () {
          return this._clrNamespace;
        },
        set: function ( value ) {
          this._clrNamespace = value;
        }
      },
      ContractNamespace: {
        get: function () {
          return this._contractNamespace;
        }
      }
    },
    ctors: {
      ctor: function ( contractNamespace ) {
        this.$initialize();
        System.Attribute.ctor.call( this );
        this._contractNamespace = contractNamespace;
      }
    }
  } );

  // @source DataContractAttribute.js

  Bridge.define( "System.Runtime.Serialization.DataContractAttribute", {
    inherits: [System.Attribute],
    fields: {
      _name: null,
      _ns: null,
      _isNameSetExplicitly: false,
      _isNamespaceSetExplicitly: false,
      _isReference: false,
      _isReferenceSetExplicitly: false
    },
    props: {
      IsReference: {
        get: function () {
          return this._isReference;
        },
        set: function ( value ) {
          this._isReference = value;
          this._isReferenceSetExplicitly = true;
        }
      },
      IsReferenceSetExplicitly: {
        get: function () {
          return this._isReferenceSetExplicitly;
        }
      },
      Namespace: {
        get: function () {
          return this._ns;
        },
        set: function ( value ) {
          this._ns = value;
          this._isNamespaceSetExplicitly = true;
        }
      },
      IsNamespaceSetExplicitly: {
        get: function () {
          return this._isNamespaceSetExplicitly;
        }
      },
      Name: {
        get: function () {
          return this._name;
        },
        set: function ( value ) {
          this._name = value;
          this._isNameSetExplicitly = true;
        }
      },
      IsNameSetExplicitly: {
        get: function () {
          return this._isNameSetExplicitly;
        }
      }
    },
    ctors: {
      ctor: function () {
        this.$initialize();
        System.Attribute.ctor.call( this );
      }
    }
  } );

  // @source DataMemberAttribute.js

  Bridge.define( "System.Runtime.Serialization.DataMemberAttribute", {
    inherits: [System.Attribute],
    fields: {
      _name: null,
      _isNameSetExplicitly: false,
      _order: 0,
      _isRequired: false,
      _emitDefaultValue: false
    },
    props: {
      Name: {
        get: function () {
          return this._name;
        },
        set: function ( value ) {
          this._name = value;
          this._isNameSetExplicitly = true;
        }
      },
      IsNameSetExplicitly: {
        get: function () {
          return this._isNameSetExplicitly;
        }
      },
      Order: {
        get: function () {
          return this._order;
        },
        set: function ( value ) {
          if ( value < 0 ) {
            throw new System.Runtime.Serialization.InvalidDataContractException.$ctor1( "Property 'Order' in DataMemberAttribute attribute cannot be a negative number." );
          }
          this._order = value;
        }
      },
      IsRequired: {
        get: function () {
          return this._isRequired;
        },
        set: function ( value ) {
          this._isRequired = value;
        }
      },
      EmitDefaultValue: {
        get: function () {
          return this._emitDefaultValue;
        },
        set: function ( value ) {
          this._emitDefaultValue = value;
        }
      }
    },
    ctors: {
      init: function () {
        this._order = -1;
        this._emitDefaultValue = true;
      },
      ctor: function () {
        this.$initialize();
        System.Attribute.ctor.call( this );
      }
    }
  } );

  // @source EnumMemberAttribute.js

  Bridge.define( "System.Runtime.Serialization.EnumMemberAttribute", {
    inherits: [System.Attribute],
    fields: {
      _value: null,
      _isValueSetExplicitly: false
    },
    props: {
      Value: {
        get: function () {
          return this._value;
        },
        set: function ( value ) {
          this._value = value;
          this._isValueSetExplicitly = true;
        }
      },
      IsValueSetExplicitly: {
        get: function () {
          return this._isValueSetExplicitly;
        }
      }
    },
    ctors: {
      ctor: function () {
        this.$initialize();
        System.Attribute.ctor.call( this );
      }
    }
  } );

  // @source IDeserializationCallback.js

  Bridge.define( "System.Runtime.Serialization.IDeserializationCallback", {
    $kind: "interface"
  } );

  // @source IFormatterConverter.js

  Bridge.define( "System.Runtime.Serialization.IFormatterConverter", {
    $kind: "interface"
  } );

  // @source IgnoreDataMemberAttribute.js

  Bridge.define( "System.Runtime.Serialization.IgnoreDataMemberAttribute", {
    inherits: [System.Attribute],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.Attribute.ctor.call( this );
      }
    }
  } );

  // @source InvalidDataContractException.js

  Bridge.define( "System.Runtime.Serialization.InvalidDataContractException", {
    inherits: [System.Exception],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.Exception.ctor.call( this );
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.Exception.ctor.call( this, message );
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.Exception.ctor.call( this, message, innerException );
      }
    }
  } );

  // @source IObjectReference.js

  Bridge.define( "System.Runtime.Serialization.IObjectReference", {
    $kind: "interface"
  } );

  // @source ISafeSerializationData.js

  Bridge.define( "System.Runtime.Serialization.ISafeSerializationData", {
    $kind: "interface"
  } );

  // @source ISerializable.js

  Bridge.define( "System.Runtime.Serialization.ISerializable", {
    $kind: "interface"
  } );

  // @source ISerializationSurrogateProvider.js

  Bridge.define( "System.Runtime.Serialization.ISerializationSurrogateProvider", {
    $kind: "interface"
  } );

  // @source KnownTypeAttribute.js

  Bridge.define( "System.Runtime.Serialization.KnownTypeAttribute", {
    inherits: [System.Attribute],
    fields: {
      _methodName: null,
      _type: null
    },
    props: {
      MethodName: {
        get: function () {
          return this._methodName;
        }
      },
      Type: {
        get: function () {
          return this._type;
        }
      }
    },
    ctors: {
      ctor: function () {
        this.$initialize();
        System.Attribute.ctor.call( this );
      },
      $ctor2: function ( type ) {
        this.$initialize();
        System.Attribute.ctor.call( this );
        this._type = type;
      },
      $ctor1: function ( methodName ) {
        this.$initialize();
        System.Attribute.ctor.call( this );
        this._methodName = methodName;
      }
    }
  } );

  // @source SerializationEntry.js

  Bridge.define( "System.Runtime.Serialization.SerializationEntry", {
    $kind: "struct",
    statics: {
      methods: {
        getDefaultValue: function () { return new System.Runtime.Serialization.SerializationEntry(); }
      }
    },
    fields: {
      _name: null,
      _value: null,
      _type: null
    },
    props: {
      Value: {
        get: function () {
          return this._value;
        }
      },
      Name: {
        get: function () {
          return this._name;
        }
      },
      ObjectType: {
        get: function () {
          return this._type;
        }
      }
    },
    ctors: {
      $ctor1: function ( entryName, entryValue, entryType ) {
        this.$initialize();
        this._name = entryName;
        this._value = entryValue;
        this._type = entryType;
      },
      ctor: function () {
        this.$initialize();
      }
    },
    methods: {
      getHashCode: function () {
        var h = Bridge.addHash( [7645431029, this._name, this._value, this._type] );
        return h;
      },
      equals: function ( o ) {
        if ( !Bridge.is( o, System.Runtime.Serialization.SerializationEntry ) ) {
          return false;
        }
        return Bridge.equals( this._name, o._name ) && Bridge.equals( this._value, o._value ) && Bridge.equals( this._type, o._type );
      },
      $clone: function ( to ) {
        var s = to || new System.Runtime.Serialization.SerializationEntry();
        s._name = this._name;
        s._value = this._value;
        s._type = this._type;
        return s;
      }
    }
  } );

  // @source SerializationException.js

  Bridge.define( "System.Runtime.Serialization.SerializationException", {
    inherits: [System.SystemException],
    statics: {
      fields: {
        s_nullMessage: null
      },
      ctors: {
        init: function () {
          this.s_nullMessage = "Serialization error.";
        }
      }
    },
    ctors: {
      ctor: function () {
        this.$initialize();
        System.SystemException.$ctor1.call( this, System.Runtime.Serialization.SerializationException.s_nullMessage );
        this.HResult = -2146233076;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2146233076;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, innerException );
        this.HResult = -2146233076;
      }
    }
  } );

  // @source SerializationInfoEnumerator.js

  Bridge.define( "System.Runtime.Serialization.SerializationInfoEnumerator", {
    inherits: [System.Collections.IEnumerator],
    fields: {
      _members: null,
      _data: null,
      _types: null,
      _numItems: 0,
      _currItem: 0,
      _current: false
    },
    props: {
      System$Collections$IEnumerator$Current: {
        get: function () {
          return this.Current.$clone();
        }
      },
      Current: {
        get: function () {
          if ( this._current === false ) {
            throw new System.InvalidOperationException.$ctor1( "Enumeration has either not started or has already finished." );
          }
          return new System.Runtime.Serialization.SerializationEntry.$ctor1( this._members[System.Array.index( this._currItem, this._members )], this._data[System.Array.index( this._currItem, this._data )], this._types[System.Array.index( this._currItem, this._types )] );
        }
      },
      Name: {
        get: function () {
          if ( this._current === false ) {
            throw new System.InvalidOperationException.$ctor1( "Enumeration has either not started or has already finished." );
          }
          return this._members[System.Array.index( this._currItem, this._members )];
        }
      },
      Value: {
        get: function () {
          if ( this._current === false ) {
            throw new System.InvalidOperationException.$ctor1( "Enumeration has either not started or has already finished." );
          }
          return this._data[System.Array.index( this._currItem, this._data )];
        }
      },
      ObjectType: {
        get: function () {
          if ( this._current === false ) {
            throw new System.InvalidOperationException.$ctor1( "Enumeration has either not started or has already finished." );
          }
          return this._types[System.Array.index( this._currItem, this._types )];
        }
      }
    },
    alias: [
      "moveNext", "System$Collections$IEnumerator$moveNext",
      "reset", "System$Collections$IEnumerator$reset"
    ],
    ctors: {
      ctor: function ( members, info, types, numItems ) {
        this.$initialize();

        this._members = members;
        this._data = info;
        this._types = types;

        this._numItems = ( numItems - 1 ) | 0;
        this._currItem = -1;
        this._current = false;
      }
    },
    methods: {
      moveNext: function () {
        if ( this._currItem < this._numItems ) {
          this._currItem = ( this._currItem + 1 ) | 0;
          this._current = true;
        } else {
          this._current = false;
        }

        return this._current;
      },
      reset: function () {
        this._currItem = -1;
        this._current = false;
      }
    }
  } );

  // @source StreamingContext.js

  Bridge.define( "System.Runtime.Serialization.StreamingContext", {
    $kind: "struct",
    statics: {
      methods: {
        getDefaultValue: function () { return new System.Runtime.Serialization.StreamingContext(); }
      }
    },
    fields: {
      _additionalContext: null,
      _state: 0
    },
    props: {
      State: {
        get: function () {
          return this._state;
        }
      },
      Context: {
        get: function () {
          return this._additionalContext;
        }
      }
    },
    ctors: {
      $ctor1: function ( state ) {
        System.Runtime.Serialization.StreamingContext.$ctor2.call( this, state, null );
      },
      $ctor2: function ( state, additional ) {
        this.$initialize();
        this._state = state;
        this._additionalContext = additional;
      },
      ctor: function () {
        this.$initialize();
      }
    },
    methods: {
      equals: function ( obj ) {
        if ( !( Bridge.is( obj, System.Runtime.Serialization.StreamingContext ) ) ) {
          return false;
        }
        var ctx = System.Nullable.getValue( Bridge.cast( Bridge.unbox( obj, System.Runtime.Serialization.StreamingContext ), System.Runtime.Serialization.StreamingContext ) );
        return Bridge.referenceEquals( ctx._additionalContext, this._additionalContext ) && ctx._state === this._state;
      },
      getHashCode: function () {
        return this._state;
      },
      $clone: function ( to ) {
        var s = to || new System.Runtime.Serialization.StreamingContext();
        s._additionalContext = this._additionalContext;
        s._state = this._state;
        return s;
      }
    }
  } );

  // @source StreamingContextStates.js

  Bridge.define( "System.Runtime.Serialization.StreamingContextStates", {
    $kind: "enum",
    statics: {
      fields: {
        CrossProcess: 1,
        CrossMachine: 2,
        File: 4,
        Persistence: 8,
        Remoting: 16,
        Other: 32,
        Clone: 64,
        CrossAppDomain: 128,
        All: 255
      }
    },
    $flags: true
  } );

  // @source OnSerializingAttribute.js

  Bridge.define( "System.Runtime.Serialization.OnSerializingAttribute", {
    inherits: [System.Attribute]
  } );

  // @source OnSerializedAttribute.js

  Bridge.define( "System.Runtime.Serialization.OnSerializedAttribute", {
    inherits: [System.Attribute]
  } );

  // @source OnDeserializingAttribute.js

  Bridge.define( "System.Runtime.Serialization.OnDeserializingAttribute", {
    inherits: [System.Attribute]
  } );

  // @source OnDeserializedAttribute.js

  Bridge.define( "System.Runtime.Serialization.OnDeserializedAttribute", {
    inherits: [System.Attribute]
  } );

  // @source SecurityException.js

  Bridge.define( "System.Security.SecurityException", {
    inherits: [System.SystemException],
    statics: {
      fields: {
        DemandedName: null,
        GrantedSetName: null,
        RefusedSetName: null,
        DeniedName: null,
        PermitOnlyName: null,
        UrlName: null
      },
      ctors: {
        init: function () {
          this.DemandedName = "Demanded";
          this.GrantedSetName = "GrantedSet";
          this.RefusedSetName = "RefusedSet";
          this.DeniedName = "Denied";
          this.PermitOnlyName = "PermitOnly";
          this.UrlName = "Url";
        }
      }
    },
    props: {
      Demanded: null,
      DenySetInstance: null,
      GrantedSet: null,
      Method: null,
      PermissionState: null,
      PermissionType: null,
      PermitOnlySetInstance: null,
      RefusedSet: null,
      Url: null
    },
    ctors: {
      ctor: function () {
        this.$initialize();
        System.SystemException.$ctor1.call( this, "Security error." );
        this.HResult = -2146233078;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2146233078;
      },
      $ctor2: function ( message, inner ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, inner );
        this.HResult = -2146233078;
      },
      $ctor3: function ( message, type ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2146233078;
        this.PermissionType = type;
      },
      $ctor4: function ( message, type, state ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2146233078;
        this.PermissionType = type;
        this.PermissionState = state;
      }
    },
    methods: {
      toString: function () {
        return Bridge.toString( this );
      }
    }
  } );

  // @source UnauthorizedAccessException.js

  Bridge.define( "System.UnauthorizedAccessException", {
    inherits: [System.SystemException],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.SystemException.$ctor1.call( this, "Attempted to perform an unauthorized operation." );
        this.HResult = -2147024891;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2147024891;
      },
      $ctor2: function ( message, inner ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, inner );
        this.HResult = -2147024891;
      }
    }
  } );

  // @source UnhandledExceptionEventArgs.js

  Bridge.define( "System.UnhandledExceptionEventArgs", {
    fields: {
      _exception: null,
      _isTerminating: false
    },
    props: {
      ExceptionObject: {
        get: function () {
          return this._exception;
        }
      },
      IsTerminating: {
        get: function () {
          return this._isTerminating;
        }
      }
    },
    ctors: {
      ctor: function ( exception, isTerminating ) {
        this.$initialize();
        System.Object.call( this );
        this._exception = exception;
        this._isTerminating = isTerminating;
      }
    }
  } );

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

  // @source UnitySerializationHolder.js

  Bridge.define( "System.UnitySerializationHolder", {
    inherits: [System.Runtime.Serialization.ISerializable, System.Runtime.Serialization.IObjectReference],
    statics: {
      fields: {
        NullUnity: 0
      },
      ctors: {
        init: function () {
          this.NullUnity = 2;
        }
      }
    },
    alias: ["GetRealObject", "System$Runtime$Serialization$IObjectReference$GetRealObject"],
    methods: {
      GetRealObject: function ( context ) {
        throw System.NotImplemented.ByDesign;

      }
    }
  } );

  // @source DateTimeKind.js

  Bridge.define( "System.DateTimeKind", {
    $kind: "enum",
    statics: {
      fields: {
        Unspecified: 0,
        Utc: 1,
        Local: 2
      }
    }
  } );

  // @source DateTimeOffset.js

  Bridge.define( "System.DateTimeOffset", {
    inherits: function () { return [System.IComparable, System.IFormattable, System.Runtime.Serialization.ISerializable, System.Runtime.Serialization.IDeserializationCallback, System.IComparable$1( System.DateTimeOffset ), System.IEquatable$1( System.DateTimeOffset )]; },
    $kind: "struct",
    statics: {
      fields: {
        MaxOffset: System.Int64( 0 ),
        MinOffset: System.Int64( 0 ),
        UnixEpochTicks: System.Int64( 0 ),
        UnixEpochSeconds: System.Int64( 0 ),
        UnixEpochMilliseconds: System.Int64( 0 ),
        MinValue: null,
        MaxValue: null
      },
      props: {
        Now: {
          get: function () {
            return new System.DateTimeOffset.$ctor1( System.DateTime.getNow() );
          }
        },
        UtcNow: {
          get: function () {
            return new System.DateTimeOffset.$ctor1( System.DateTime.getUtcNow() );
          }
        }
      },
      ctors: {
        init: function () {
          this.MinValue = new System.DateTimeOffset();
          this.MaxValue = new System.DateTimeOffset();
          this.MaxOffset = System.Int64( [1488826368, 117] );
          this.MinOffset = System.Int64( [-1488826368, -118] );
          this.UnixEpochTicks = System.Int64( [-139100160, 144670709] );
          this.UnixEpochSeconds = System.Int64( [2006054656, 14] );
          this.UnixEpochMilliseconds = System.Int64( [304928768, 14467] );
          this.MinValue = new System.DateTimeOffset.$ctor5( System.DateTime.getMinTicks(), System.TimeSpan.zero );
          this.MaxValue = new System.DateTimeOffset.$ctor5( System.DateTime.getMaxTicks(), System.TimeSpan.zero );
        }
      },
      methods: {
        Compare: function ( first, second ) {
          return Bridge.compare( first.UtcDateTime, second.UtcDateTime );
        },
        Equals: function ( first, second ) {
          return Bridge.equalsT( first.UtcDateTime, second.UtcDateTime );
        },
        FromFileTime: function ( fileTime ) {
          return new System.DateTimeOffset.$ctor1( System.DateTime.FromFileTime( fileTime ) );
        },
        FromUnixTimeSeconds: function ( seconds ) {
          var MinSeconds = System.Int64( [-2006054656, -15] );
          var MaxSeconds = System.Int64( [-769665, 58] );

          if ( seconds.lt( MinSeconds ) || seconds.gt( MaxSeconds ) ) {
            throw new System.ArgumentOutOfRangeException.$ctor4( "seconds", System.String.format( System.Environment.GetResourceString( "ArgumentOutOfRange_Range" ), MinSeconds, MaxSeconds ) );
          }

          var ticks = seconds.mul( System.Int64( 10000000 ) ).add( System.DateTimeOffset.UnixEpochTicks );
          return new System.DateTimeOffset.$ctor5( ticks, System.TimeSpan.zero );
        },
        FromUnixTimeMilliseconds: function ( milliseconds ) {
          var MinMilliseconds = System.Int64( [-304928768, -14468] );
          var MaxMilliseconds = System.Int64( [-769664001, 58999] );

          if ( milliseconds.lt( MinMilliseconds ) || milliseconds.gt( MaxMilliseconds ) ) {
            throw new System.ArgumentOutOfRangeException.$ctor4( "milliseconds", System.String.format( System.Environment.GetResourceString( "ArgumentOutOfRange_Range" ), MinMilliseconds, MaxMilliseconds ) );
          }

          var ticks = milliseconds.mul( System.Int64( 10000 ) ).add( System.DateTimeOffset.UnixEpochTicks );
          return new System.DateTimeOffset.$ctor5( ticks, System.TimeSpan.zero );
        },
        Parse: function ( input ) {
          var offset = {};
          var dateResult = System.DateTimeParse.Parse$1( input, System.Globalization.DateTimeFormatInfo.currentInfo, 0, offset );
          return new System.DateTimeOffset.$ctor5( System.DateTime.getTicks( dateResult ), offset.v );
        },
        Parse$1: function ( input, formatProvider ) {
          return System.DateTimeOffset.Parse$2( input, formatProvider, 0 );
        },
        Parse$2: function ( input, formatProvider, styles ) {
          throw System.NotImplemented.ByDesign;
        },
        ParseExact: function ( input, format, formatProvider ) {
          return System.DateTimeOffset.ParseExact$1( input, format, formatProvider, 0 );
        },
        ParseExact$1: function ( input, format, formatProvider, styles ) {
          throw System.NotImplemented.ByDesign;
        },
        TryParse: function ( input, result ) {
          var offset = {};
          var dateResult = {};
          var parsed = System.DateTimeParse.TryParse$1( input, System.Globalization.DateTimeFormatInfo.currentInfo, 0, dateResult, offset );
          result.v = new System.DateTimeOffset.$ctor5( System.DateTime.getTicks( dateResult.v ), offset.v );
          return parsed;
        },
        ValidateOffset: function ( offset ) {
          var ticks = offset.getTicks();
          if ( ticks.mod( System.Int64( 600000000 ) ).ne( System.Int64( 0 ) ) ) {
            throw new System.ArgumentException.$ctor3( System.Environment.GetResourceString( "Argument_OffsetPrecision" ), "offset" );
          }
          if ( ticks.lt( System.DateTimeOffset.MinOffset ) || ticks.gt( System.DateTimeOffset.MaxOffset ) ) {
            throw new System.ArgumentOutOfRangeException.$ctor4( "offset", System.Environment.GetResourceString( "Argument_OffsetOutOfRange" ) );
          }
          return System.Int64.clip16( offset.getTicks().div( System.Int64( 600000000 ) ) );
        },
        ValidateDate: function ( dateTime, offset ) {
          var utcTicks = System.DateTime.getTicks( dateTime ).sub( offset.getTicks() );
          if ( utcTicks.lt( System.DateTime.getMinTicks() ) || utcTicks.gt( System.DateTime.getMaxTicks() ) ) {
            throw new System.ArgumentOutOfRangeException.$ctor4( "offset", System.Environment.GetResourceString( "Argument_UTCOutOfRange" ) );
          }
          return System.DateTime.create$2( utcTicks, 0 );
        },
        op_Implicit: function ( dateTime ) {
          return new System.DateTimeOffset.$ctor1( dateTime );
        },
        op_Addition: function ( dateTimeOffset, timeSpan ) {
          return new System.DateTimeOffset.$ctor2( System.DateTime.adddt( dateTimeOffset.ClockDateTime, timeSpan ), dateTimeOffset.Offset );
        },
        op_Subtraction: function ( dateTimeOffset, timeSpan ) {
          return new System.DateTimeOffset.$ctor2( System.DateTime.subdt( dateTimeOffset.ClockDateTime, timeSpan ), dateTimeOffset.Offset );
        },
        op_Subtraction$1: function ( left, right ) {
          return System.DateTime.subdd( left.UtcDateTime, right.UtcDateTime );
        },
        op_Equality: function ( left, right ) {
          return Bridge.equals( left.UtcDateTime, right.UtcDateTime );
        },
        op_Inequality: function ( left, right ) {
          return !Bridge.equals( left.UtcDateTime, right.UtcDateTime );
        },
        op_LessThan: function ( left, right ) {
          return System.DateTime.lt( left.UtcDateTime, right.UtcDateTime );
        },
        op_LessThanOrEqual: function ( left, right ) {
          return System.DateTime.lte( left.UtcDateTime, right.UtcDateTime );
        },
        op_GreaterThan: function ( left, right ) {
          return System.DateTime.gt( left.UtcDateTime, right.UtcDateTime );
        },
        op_GreaterThanOrEqual: function ( left, right ) {
          return System.DateTime.gte( left.UtcDateTime, right.UtcDateTime );
        },
        getDefaultValue: function () { return new System.DateTimeOffset(); }
      }
    },
    fields: {
      m_dateTime: null,
      m_offsetMinutes: 0
    },
    props: {
      DateTime: {
        get: function () {
          return this.ClockDateTime;
        }
      },
      UtcDateTime: {
        get: function () {
          return System.DateTime.specifyKind( this.m_dateTime, 1 );
        }
      },
      LocalDateTime: {
        get: function () {
          return System.DateTime.toLocalTime( this.UtcDateTime );
        }
      },
      ClockDateTime: {
        get: function () {
          return System.DateTime.create$2( System.DateTime.getTicks( ( System.DateTime.adddt( this.m_dateTime, this.Offset ) ) ), 0 );
        }
      },
      Date: {
        get: function () {
          return System.DateTime.getDate( this.ClockDateTime );
        }
      },
      Day: {
        get: function () {
          return System.DateTime.getDay( this.ClockDateTime );
        }
      },
      DayOfWeek: {
        get: function () {
          return System.DateTime.getDayOfWeek( this.ClockDateTime );
        }
      },
      DayOfYear: {
        get: function () {
          return System.DateTime.getDayOfYear( this.ClockDateTime );
        }
      },
      Hour: {
        get: function () {
          return System.DateTime.getHour( this.ClockDateTime );
        }
      },
      Millisecond: {
        get: function () {
          return System.DateTime.getMillisecond( this.ClockDateTime );
        }
      },
      Minute: {
        get: function () {
          return System.DateTime.getMinute( this.ClockDateTime );
        }
      },
      Month: {
        get: function () {
          return System.DateTime.getMonth( this.ClockDateTime );
        }
      },
      Offset: {
        get: function () {
          return new System.TimeSpan( 0, this.m_offsetMinutes, 0 );
        }
      },
      Second: {
        get: function () {
          return System.DateTime.getSecond( this.ClockDateTime );
        }
      },
      Ticks: {
        get: function () {
          return System.DateTime.getTicks( this.ClockDateTime );
        }
      },
      UtcTicks: {
        get: function () {
          return System.DateTime.getTicks( this.UtcDateTime );
        }
      },
      TimeOfDay: {
        get: function () {
          return System.DateTime.getTimeOfDay( this.ClockDateTime );
        }
      },
      Year: {
        get: function () {
          return System.DateTime.getYear( this.ClockDateTime );
        }
      }
    },
    alias: [
      "compareTo", ["System$IComparable$1$System$DateTimeOffset$compareTo", "System$IComparable$1$compareTo"],
      "equalsT", "System$IEquatable$1$System$DateTimeOffset$equalsT",
      "format", "System$IFormattable$format"
    ],
    ctors: {
      init: function () {
        this.m_dateTime = System.DateTime.getDefaultValue();
      },
      $ctor5: function ( ticks, offset ) {
        this.$initialize();
        this.m_offsetMinutes = System.DateTimeOffset.ValidateOffset( offset );
        var dateTime = System.DateTime.create$2( ticks );
        this.m_dateTime = System.DateTimeOffset.ValidateDate( dateTime, offset );
      },
      $ctor1: function ( dateTime ) {
        this.$initialize();
        var offset;

        offset = new System.TimeSpan( System.Int64( 0 ) );
        this.m_offsetMinutes = System.DateTimeOffset.ValidateOffset( offset );
        this.m_dateTime = System.DateTimeOffset.ValidateDate( dateTime, offset );
      },
      $ctor2: function ( dateTime, offset ) {
        this.$initialize();
        this.m_offsetMinutes = System.DateTimeOffset.ValidateOffset( offset );
        this.m_dateTime = System.DateTimeOffset.ValidateDate( dateTime, offset );
      },
      $ctor4: function ( year, month, day, hour, minute, second, offset ) {
        this.$initialize();
        this.m_offsetMinutes = System.DateTimeOffset.ValidateOffset( offset );
        this.m_dateTime = System.DateTimeOffset.ValidateDate( System.DateTime.create( year, month, day, hour, minute, second ), offset );
      },
      $ctor3: function ( year, month, day, hour, minute, second, millisecond, offset ) {
        this.$initialize();
        this.m_offsetMinutes = System.DateTimeOffset.ValidateOffset( offset );
        this.m_dateTime = System.DateTimeOffset.ValidateDate( System.DateTime.create( year, month, day, hour, minute, second, millisecond ), offset );
      },
      ctor: function () {
        this.$initialize();
      }
    },
    methods: {
      ToOffset: function ( offset ) {
        return new System.DateTimeOffset.$ctor5( System.DateTime.getTicks( ( System.DateTime.adddt( this.m_dateTime, offset ) ) ), offset );
      },
      Add: function ( timeSpan ) {
        return new System.DateTimeOffset.$ctor2( System.DateTime.add( this.ClockDateTime, timeSpan ), this.Offset );
      },
      AddDays: function ( days ) {
        return new System.DateTimeOffset.$ctor2( System.DateTime.addDays( this.ClockDateTime, days ), this.Offset );
      },
      AddHours: function ( hours ) {
        return new System.DateTimeOffset.$ctor2( System.DateTime.addHours( this.ClockDateTime, hours ), this.Offset );
      },
      AddMilliseconds: function ( milliseconds ) {
        return new System.DateTimeOffset.$ctor2( System.DateTime.addMilliseconds( this.ClockDateTime, milliseconds ), this.Offset );
      },
      AddMinutes: function ( minutes ) {
        return new System.DateTimeOffset.$ctor2( System.DateTime.addMinutes( this.ClockDateTime, minutes ), this.Offset );
      },
      AddMonths: function ( months ) {
        return new System.DateTimeOffset.$ctor2( System.DateTime.addMonths( this.ClockDateTime, months ), this.Offset );
      },
      AddSeconds: function ( seconds ) {
        return new System.DateTimeOffset.$ctor2( System.DateTime.addSeconds( this.ClockDateTime, seconds ), this.Offset );
      },
      AddTicks: function ( ticks ) {
        return new System.DateTimeOffset.$ctor2( System.DateTime.addTicks( this.ClockDateTime, ticks ), this.Offset );
      },
      AddYears: function ( years ) {
        return new System.DateTimeOffset.$ctor2( System.DateTime.addYears( this.ClockDateTime, years ), this.Offset );
      },
      System$IComparable$compareTo: function ( obj ) {
        if ( obj == null ) {
          return 1;
        }
        if ( !( Bridge.is( obj, System.DateTimeOffset ) ) ) {
          throw new System.ArgumentException.$ctor1( System.Environment.GetResourceString( "Arg_MustBeDateTimeOffset" ) );
        }

        var objUtc = System.Nullable.getValue( Bridge.cast( Bridge.unbox( obj, System.DateTimeOffset ), System.DateTimeOffset ) ).UtcDateTime;
        var utc = this.UtcDateTime;
        if ( System.DateTime.gt( utc, objUtc ) ) {
          return 1;
        }
        if ( System.DateTime.lt( utc, objUtc ) ) {
          return -1;
        }
        return 0;
      },
      compareTo: function ( other ) {
        var otherUtc = other.UtcDateTime;
        var utc = this.UtcDateTime;
        if ( System.DateTime.gt( utc, otherUtc ) ) {
          return 1;
        }
        if ( System.DateTime.lt( utc, otherUtc ) ) {
          return -1;
        }
        return 0;
      },
      equals: function ( obj ) {
        if ( Bridge.is( obj, System.DateTimeOffset ) ) {
          return Bridge.equalsT( this.UtcDateTime, System.Nullable.getValue( Bridge.cast( Bridge.unbox( obj, System.DateTimeOffset ), System.DateTimeOffset ) ).UtcDateTime );
        }
        return false;
      },
      equalsT: function ( other ) {
        return Bridge.equalsT( this.UtcDateTime, other.UtcDateTime );
      },
      EqualsExact: function ( other ) {
        return ( Bridge.equals( this.ClockDateTime, other.ClockDateTime ) && System.TimeSpan.eq( this.Offset, other.Offset ) && System.DateTime.getKind( this.ClockDateTime ) === System.DateTime.getKind( other.ClockDateTime ) );
      },
      System$Runtime$Serialization$IDeserializationCallback$OnDeserialization: function ( sender ) {
        try {
          this.m_offsetMinutes = System.DateTimeOffset.ValidateOffset( this.Offset );
          this.m_dateTime = System.DateTimeOffset.ValidateDate( this.ClockDateTime, this.Offset );
        } catch ( $e1 ) {
          $e1 = System.Exception.create( $e1 );
          var e;
          if ( Bridge.is( $e1, System.ArgumentException ) ) {
            e = $e1;
            throw new System.Runtime.Serialization.SerializationException.$ctor2( System.Environment.GetResourceString( "Serialization_InvalidData" ), e );
          } else {
            throw $e1;
          }
        }
      },
      getHashCode: function () {
        return Bridge.getHashCode( this.UtcDateTime );
      },
      Subtract$1: function ( value ) {
        return System.DateTime.subdd( this.UtcDateTime, value.UtcDateTime );
      },
      Subtract: function ( value ) {
        return new System.DateTimeOffset.$ctor2( System.DateTime.subtract( this.ClockDateTime, value ), this.Offset );
      },
      ToFileTime: function () {
        return System.DateTime.ToFileTime( this.UtcDateTime );
      },
      ToUnixTimeSeconds: function () {
        var seconds = System.DateTime.getTicks( this.UtcDateTime ).div( System.Int64( 10000000 ) );
        return seconds.sub( System.DateTimeOffset.UnixEpochSeconds );
      },
      ToUnixTimeMilliseconds: function () {
        var milliseconds = System.DateTime.getTicks( this.UtcDateTime ).div( System.Int64( 10000 ) );
        return milliseconds.sub( System.DateTimeOffset.UnixEpochMilliseconds );
      },
      ToLocalTime: function () {
        return this.ToLocalTime$1( false );
      },
      ToLocalTime$1: function ( throwOnOverflow ) {
        return new System.DateTimeOffset.$ctor1( System.DateTime.toLocalTime( this.UtcDateTime, throwOnOverflow ) );
      },
      toString: function () {
        return System.DateTime.format( System.DateTime.specifyKind( this.ClockDateTime, 2 ) );

      },
      ToString$1: function ( format ) {
        return System.DateTime.format( System.DateTime.specifyKind( this.ClockDateTime, 2 ), format );

      },
      ToString: function ( formatProvider ) {
        return System.DateTime.format( System.DateTime.specifyKind( this.ClockDateTime, 2 ), null, formatProvider );

      },
      format: function ( format, formatProvider ) {
        return System.DateTime.format( System.DateTime.specifyKind( this.ClockDateTime, 2 ), format, formatProvider );

      },
      ToUniversalTime: function () {
        return new System.DateTimeOffset.$ctor1( this.UtcDateTime );
      },
      $clone: function ( to ) {
        var s = to || new System.DateTimeOffset();
        s.m_dateTime = this.m_dateTime;
        s.m_offsetMinutes = this.m_offsetMinutes;
        return s;
      }
    }
  } );

  // @source DateTimeParse.js

  Bridge.define( "System.DateTimeParse", {
    statics: {
      methods: {
        TryParseExact: function ( s, format, dtfi, style, result ) {
          return System.DateTime.tryParseExact( s, format, null, result );

        },
        Parse: function ( s, dtfi, styles ) {
          return System.DateTime.parse( s, dtfi );
        },
        Parse$1: function ( s, dtfi, styles, offset ) {
          throw System.NotImplemented.ByDesign;

        },
        TryParse: function ( s, dtfi, styles, result ) {
          return System.DateTime.tryParse( s, null, result );

        },
        TryParse$1: function ( s, dtfi, styles, result, offset ) {
          throw System.NotImplemented.ByDesign;
        }
      }
    }
  } );

  // @source DateTimeResult.js

  Bridge.define( "System.DateTimeResult", {
    $kind: "struct",
    statics: {
      methods: {
        getDefaultValue: function () { return new System.DateTimeResult(); }
      }
    },
    fields: {
      Year: 0,
      Month: 0,
      Day: 0,
      Hour: 0,
      Minute: 0,
      Second: 0,
      fraction: 0,
      era: 0,
      flags: 0,
      timeZoneOffset: null,
      calendar: null,
      parsedDate: null,
      failure: 0,
      failureMessageID: null,
      failureMessageFormatArgument: null,
      failureArgumentName: null
    },
    ctors: {
      init: function () {
        this.timeZoneOffset = new System.TimeSpan();
        this.parsedDate = System.DateTime.getDefaultValue();
      },
      ctor: function () {
        this.$initialize();
      }
    },
    methods: {
      Init: function () {
        this.Year = -1;
        this.Month = -1;
        this.Day = -1;
        this.fraction = -1;
        this.era = -1;
      },
      SetDate: function ( year, month, day ) {
        this.Year = year;
        this.Month = month;
        this.Day = day;
      },
      SetFailure: function ( failure, failureMessageID, failureMessageFormatArgument ) {
        this.failure = failure;
        this.failureMessageID = failureMessageID;
        this.failureMessageFormatArgument = failureMessageFormatArgument;
      },
      SetFailure$1: function ( failure, failureMessageID, failureMessageFormatArgument, failureArgumentName ) {
        this.failure = failure;
        this.failureMessageID = failureMessageID;
        this.failureMessageFormatArgument = failureMessageFormatArgument;
        this.failureArgumentName = failureArgumentName;
      },
      getHashCode: function () {
        var h = Bridge.addHash( [5374321750, this.Year, this.Month, this.Day, this.Hour, this.Minute, this.Second, this.fraction, this.era, this.flags, this.timeZoneOffset, this.calendar, this.parsedDate, this.failure, this.failureMessageID, this.failureMessageFormatArgument, this.failureArgumentName] );
        return h;
      },
      equals: function ( o ) {
        if ( !Bridge.is( o, System.DateTimeResult ) ) {
          return false;
        }
        return Bridge.equals( this.Year, o.Year ) && Bridge.equals( this.Month, o.Month ) && Bridge.equals( this.Day, o.Day ) && Bridge.equals( this.Hour, o.Hour ) && Bridge.equals( this.Minute, o.Minute ) && Bridge.equals( this.Second, o.Second ) && Bridge.equals( this.fraction, o.fraction ) && Bridge.equals( this.era, o.era ) && Bridge.equals( this.flags, o.flags ) && Bridge.equals( this.timeZoneOffset, o.timeZoneOffset ) && Bridge.equals( this.calendar, o.calendar ) && Bridge.equals( this.parsedDate, o.parsedDate ) && Bridge.equals( this.failure, o.failure ) && Bridge.equals( this.failureMessageID, o.failureMessageID ) && Bridge.equals( this.failureMessageFormatArgument, o.failureMessageFormatArgument ) && Bridge.equals( this.failureArgumentName, o.failureArgumentName );
      },
      $clone: function ( to ) {
        var s = to || new System.DateTimeResult();
        s.Year = this.Year;
        s.Month = this.Month;
        s.Day = this.Day;
        s.Hour = this.Hour;
        s.Minute = this.Minute;
        s.Second = this.Second;
        s.fraction = this.fraction;
        s.era = this.era;
        s.flags = this.flags;
        s.timeZoneOffset = this.timeZoneOffset;
        s.calendar = this.calendar;
        s.parsedDate = this.parsedDate;
        s.failure = this.failure;
        s.failureMessageID = this.failureMessageID;
        s.failureMessageFormatArgument = this.failureMessageFormatArgument;
        s.failureArgumentName = this.failureArgumentName;
        return s;
      }
    }
  } );

  // @source DayOfWeek.js

  Bridge.define( "System.DayOfWeek", {
    $kind: "enum",
    statics: {
      fields: {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6
      }
    }
  } );

  // @source DBNull.js

  Bridge.define( "System.DBNull", {
    inherits: [System.Runtime.Serialization.ISerializable, System.IConvertible],
    statics: {
      fields: {
        Value: null
      },
      ctors: {
        init: function () {
          this.Value = new System.DBNull();
        }
      }
    },
    alias: [
      "ToString", "System$IConvertible$ToString",
      "GetTypeCode", "System$IConvertible$GetTypeCode"
    ],
    ctors: {
      ctor: function () {
        this.$initialize();
      }
    },
    methods: {
      toString: function () {
        return "";
      },
      ToString: function ( provider ) {
        return "";
      },
      GetTypeCode: function () {
        return System.TypeCode.DBNull;
      },
      System$IConvertible$ToBoolean: function ( provider ) {
        throw new System.InvalidCastException.$ctor1( "Object cannot be cast from DBNull to other types." );
      },
      System$IConvertible$ToChar: function ( provider ) {
        throw new System.InvalidCastException.$ctor1( "Object cannot be cast from DBNull to other types." );
      },
      System$IConvertible$ToSByte: function ( provider ) {
        throw new System.InvalidCastException.$ctor1( "Object cannot be cast from DBNull to other types." );
      },
      System$IConvertible$ToByte: function ( provider ) {
        throw new System.InvalidCastException.$ctor1( "Object cannot be cast from DBNull to other types." );
      },
      System$IConvertible$ToInt16: function ( provider ) {
        throw new System.InvalidCastException.$ctor1( "Object cannot be cast from DBNull to other types." );
      },
      System$IConvertible$ToUInt16: function ( provider ) {
        throw new System.InvalidCastException.$ctor1( "Object cannot be cast from DBNull to other types." );
      },
      System$IConvertible$ToInt32: function ( provider ) {
        throw new System.InvalidCastException.$ctor1( "Object cannot be cast from DBNull to other types." );
      },
      System$IConvertible$ToUInt32: function ( provider ) {
        throw new System.InvalidCastException.$ctor1( "Object cannot be cast from DBNull to other types." );
      },
      System$IConvertible$ToInt64: function ( provider ) {
        throw new System.InvalidCastException.$ctor1( "Object cannot be cast from DBNull to other types." );
      },
      System$IConvertible$ToUInt64: function ( provider ) {
        throw new System.InvalidCastException.$ctor1( "Object cannot be cast from DBNull to other types." );
      },
      System$IConvertible$ToSingle: function ( provider ) {
        throw new System.InvalidCastException.$ctor1( "Object cannot be cast from DBNull to other types." );
      },
      System$IConvertible$ToDouble: function ( provider ) {
        throw new System.InvalidCastException.$ctor1( "Object cannot be cast from DBNull to other types." );
      },
      System$IConvertible$ToDecimal: function ( provider ) {
        throw new System.InvalidCastException.$ctor1( "Object cannot be cast from DBNull to other types." );
      },
      System$IConvertible$ToDateTime: function ( provider ) {
        throw new System.InvalidCastException.$ctor1( "Object cannot be cast from DBNull to other types." );
      },
      System$IConvertible$ToType: function ( type, provider ) {
        return System.Convert.defaultToType( Bridge.cast( this, System.IConvertible ), type, provider );
      }
    }
  } );

  // @source Empty.js

  Bridge.define( "System.Empty", {
    statics: {
      fields: {
        Value: null
      },
      ctors: {
        init: function () {
          this.Value = new System.Empty();
        }
      }
    },
    ctors: {
      ctor: function () {
        this.$initialize();
      }
    },
    methods: {
      toString: function () {
        return "";
      }
    }
  } );

  // @source ApplicationException.js

  Bridge.define( "System.ApplicationException", {
    inherits: [System.Exception],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.Exception.ctor.call( this, "Error in the application." );
        this.HResult = -2146232832;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.Exception.ctor.call( this, message );
        this.HResult = -2146232832;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.Exception.ctor.call( this, message, innerException );
        this.HResult = -2146232832;
      }
    }
  } );

  // @source ArgumentException.js

  Bridge.define( "System.ArgumentException", {
    inherits: [System.SystemException],
    fields: {
      _paramName: null
    },
    props: {
      Message: {
        get: function () {
          var s = Bridge.ensureBaseProperty( this, "Message" ).$System$Exception$Message;
          if ( !System.String.isNullOrEmpty( this._paramName ) ) {
            var resourceString = System.SR.Format( "Parameter name: {0}", this._paramName );
            return ( s || "" ) + ( "\n" || "" ) + ( resourceString || "" );
          } else {
            return s;
          }
        }
      },
      ParamName: {
        get: function () {
          return this._paramName;
        }
      }
    },
    ctors: {
      ctor: function () {
        this.$initialize();
        System.SystemException.$ctor1.call( this, "Value does not fall within the expected range." );
        this.HResult = -2147024809;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2147024809;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, innerException );
        this.HResult = -2147024809;
      },
      $ctor4: function ( message, paramName, innerException ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, innerException );
        this._paramName = paramName;
        this.HResult = -2147024809;
      },
      $ctor3: function ( message, paramName ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this._paramName = paramName;
        this.HResult = -2147024809;
      }
    }
  } );

  // @source ArgumentNullException.js

  Bridge.define( "System.ArgumentNullException", {
    inherits: [System.ArgumentException],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.ArgumentException.$ctor1.call( this, "Value cannot be null." );
        this.HResult = -2147467261;
      },
      $ctor1: function ( paramName ) {
        this.$initialize();
        System.ArgumentException.$ctor3.call( this, "Value cannot be null.", paramName );
        this.HResult = -2147467261;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.ArgumentException.$ctor2.call( this, message, innerException );
        this.HResult = -2147467261;
      },
      $ctor3: function ( paramName, message ) {
        this.$initialize();
        System.ArgumentException.$ctor3.call( this, message, paramName );
        this.HResult = -2147467261;
      }
    }
  } );

  // @source ArgumentOutOfRangeException.js

  Bridge.define( "System.ArgumentOutOfRangeException", {
    inherits: [System.ArgumentException],
    fields: {
      _actualValue: null
    },
    props: {
      Message: {
        get: function () {
          var s = Bridge.ensureBaseProperty( this, "Message" ).$System$ArgumentException$Message;
          if ( this._actualValue != null ) {
            var valueMessage = System.SR.Format( "Actual value was {0}.", Bridge.toString( this._actualValue ) );
            if ( s == null ) {
              return valueMessage;
            }
            return ( s || "" ) + ( "\n" || "" ) + ( valueMessage || "" );
          }
          return s;
        }
      },
      ActualValue: {
        get: function () {
          return this._actualValue;
        }
      }
    },
    ctors: {
      ctor: function () {
        this.$initialize();
        System.ArgumentException.$ctor1.call( this, "Specified argument was out of the range of valid values." );
        this.HResult = -2146233086;
      },
      $ctor1: function ( paramName ) {
        this.$initialize();
        System.ArgumentException.$ctor3.call( this, "Specified argument was out of the range of valid values.", paramName );
        this.HResult = -2146233086;
      },
      $ctor4: function ( paramName, message ) {
        this.$initialize();
        System.ArgumentException.$ctor3.call( this, message, paramName );
        this.HResult = -2146233086;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.ArgumentException.$ctor2.call( this, message, innerException );
        this.HResult = -2146233086;
      },
      $ctor3: function ( paramName, actualValue, message ) {
        this.$initialize();
        System.ArgumentException.$ctor3.call( this, message, paramName );
        this._actualValue = actualValue;
        this.HResult = -2146233086;
      }
    }
  } );

  // @source ArithmeticException.js

  Bridge.define( "System.ArithmeticException", {
    inherits: [System.SystemException],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.SystemException.$ctor1.call( this, "Overflow or underflow in the arithmetic operation." );
        this.HResult = -2147024362;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2147024362;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, innerException );
        this.HResult = -2147024362;
      }
    }
  } );

  // @source Base64FormattingOptions.js

  Bridge.define( "System.Base64FormattingOptions", {
    $kind: "enum",
    statics: {
      fields: {
        None: 0,
        InsertLineBreaks: 1
      }
    },
    $flags: true
  } );

  // @source DivideByZeroException.js

  Bridge.define( "System.DivideByZeroException", {
    inherits: [System.ArithmeticException],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.ArithmeticException.$ctor1.call( this, "Attempted to divide by zero." );
        this.HResult = -2147352558;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.ArithmeticException.$ctor1.call( this, message );
        this.HResult = -2147352558;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.ArithmeticException.$ctor2.call( this, message, innerException );
        this.HResult = -2147352558;
      }
    }
  } );

  // @source ExceptionArgument.js

  Bridge.define( "System.ExceptionArgument", {
    $kind: "enum",
    statics: {
      fields: {
        obj: 0,
        dictionary: 1,
        array: 2,
        info: 3,
        key: 4,
        collection: 5,
        list: 6,
        match: 7,
        converter: 8,
        capacity: 9,
        index: 10,
        startIndex: 11,
        value: 12,
        count: 13,
        arrayIndex: 14,
        $name: 15,
        item: 16,
        options: 17,
        view: 18,
        sourceBytesToCopy: 19,
        action: 20,
        comparison: 21,
        offset: 22,
        newSize: 23,
        elementType: 24,
        $length: 25,
        length1: 26,
        length2: 27,
        length3: 28,
        lengths: 29,
        len: 30,
        lowerBounds: 31,
        sourceArray: 32,
        destinationArray: 33,
        sourceIndex: 34,
        destinationIndex: 35,
        indices: 36,
        index1: 37,
        index2: 38,
        index3: 39,
        other: 40,
        comparer: 41,
        endIndex: 42,
        keys: 43,
        creationOptions: 44,
        timeout: 45,
        tasks: 46,
        scheduler: 47,
        continuationFunction: 48,
        millisecondsTimeout: 49,
        millisecondsDelay: 50,
        function: 51,
        exceptions: 52,
        exception: 53,
        cancellationToken: 54,
        delay: 55,
        asyncResult: 56,
        endMethod: 57,
        endFunction: 58,
        beginMethod: 59,
        continuationOptions: 60,
        continuationAction: 61,
        concurrencyLevel: 62,
        text: 63,
        callBack: 64,
        type: 65,
        stateMachine: 66,
        pHandle: 67,
        values: 68,
        task: 69,
        s: 70,
        keyValuePair: 71,
        input: 72,
        ownedMemory: 73,
        pointer: 74,
        start: 75,
        format: 76,
        culture: 77,
        comparable: 78,
        source: 79,
        state: 80
      }
    }
  } );

  // @source ExceptionResource.js

  Bridge.define( "System.ExceptionResource", {
    $kind: "enum",
    statics: {
      fields: {
        Argument_ImplementIComparable: 0,
        Argument_InvalidType: 1,
        Argument_InvalidArgumentForComparison: 2,
        Argument_InvalidRegistryKeyPermissionCheck: 3,
        ArgumentOutOfRange_NeedNonNegNum: 4,
        Arg_ArrayPlusOffTooSmall: 5,
        Arg_NonZeroLowerBound: 6,
        Arg_RankMultiDimNotSupported: 7,
        Arg_RegKeyDelHive: 8,
        Arg_RegKeyStrLenBug: 9,
        Arg_RegSetStrArrNull: 10,
        Arg_RegSetMismatchedKind: 11,
        Arg_RegSubKeyAbsent: 12,
        Arg_RegSubKeyValueAbsent: 13,
        Argument_AddingDuplicate: 14,
        Serialization_InvalidOnDeser: 15,
        Serialization_MissingKeys: 16,
        Serialization_NullKey: 17,
        Argument_InvalidArrayType: 18,
        NotSupported_KeyCollectionSet: 19,
        NotSupported_ValueCollectionSet: 20,
        ArgumentOutOfRange_SmallCapacity: 21,
        ArgumentOutOfRange_Index: 22,
        Argument_InvalidOffLen: 23,
        Argument_ItemNotExist: 24,
        ArgumentOutOfRange_Count: 25,
        ArgumentOutOfRange_InvalidThreshold: 26,
        ArgumentOutOfRange_ListInsert: 27,
        NotSupported_ReadOnlyCollection: 28,
        InvalidOperation_CannotRemoveFromStackOrQueue: 29,
        InvalidOperation_EmptyQueue: 30,
        InvalidOperation_EnumOpCantHappen: 31,
        InvalidOperation_EnumFailedVersion: 32,
        InvalidOperation_EmptyStack: 33,
        ArgumentOutOfRange_BiggerThanCollection: 34,
        InvalidOperation_EnumNotStarted: 35,
        InvalidOperation_EnumEnded: 36,
        NotSupported_SortedListNestedWrite: 37,
        InvalidOperation_NoValue: 38,
        InvalidOperation_RegRemoveSubKey: 39,
        Security_RegistryPermission: 40,
        UnauthorizedAccess_RegistryNoWrite: 41,
        ObjectDisposed_RegKeyClosed: 42,
        NotSupported_InComparableType: 43,
        Argument_InvalidRegistryOptionsCheck: 44,
        Argument_InvalidRegistryViewCheck: 45,
        InvalidOperation_NullArray: 46,
        Arg_MustBeType: 47,
        Arg_NeedAtLeast1Rank: 48,
        ArgumentOutOfRange_HugeArrayNotSupported: 49,
        Arg_RanksAndBounds: 50,
        Arg_RankIndices: 51,
        Arg_Need1DArray: 52,
        Arg_Need2DArray: 53,
        Arg_Need3DArray: 54,
        NotSupported_FixedSizeCollection: 55,
        ArgumentException_OtherNotArrayOfCorrectLength: 56,
        Rank_MultiDimNotSupported: 57,
        InvalidOperation_IComparerFailed: 58,
        ArgumentOutOfRange_EndIndexStartIndex: 59,
        Arg_LowerBoundsMustMatch: 60,
        Arg_BogusIComparer: 61,
        Task_WaitMulti_NullTask: 62,
        Task_ThrowIfDisposed: 63,
        Task_Start_TaskCompleted: 64,
        Task_Start_Promise: 65,
        Task_Start_ContinuationTask: 66,
        Task_Start_AlreadyStarted: 67,
        Task_RunSynchronously_TaskCompleted: 68,
        Task_RunSynchronously_Continuation: 69,
        Task_RunSynchronously_Promise: 70,
        Task_RunSynchronously_AlreadyStarted: 71,
        Task_MultiTaskContinuation_NullTask: 72,
        Task_MultiTaskContinuation_EmptyTaskList: 73,
        Task_Dispose_NotCompleted: 74,
        Task_Delay_InvalidMillisecondsDelay: 75,
        Task_Delay_InvalidDelay: 76,
        Task_ctor_LRandSR: 77,
        Task_ContinueWith_NotOnAnything: 78,
        Task_ContinueWith_ESandLR: 79,
        TaskT_TransitionToFinal_AlreadyCompleted: 80,
        TaskCompletionSourceT_TrySetException_NullException: 81,
        TaskCompletionSourceT_TrySetException_NoExceptions: 82,
        MemoryDisposed: 83,
        Memory_OutstandingReferences: 84,
        InvalidOperation_WrongAsyncResultOrEndCalledMultiple: 85,
        ConcurrentDictionary_ConcurrencyLevelMustBePositive: 86,
        ConcurrentDictionary_CapacityMustNotBeNegative: 87,
        ConcurrentDictionary_TypeOfValueIncorrect: 88,
        ConcurrentDictionary_TypeOfKeyIncorrect: 89,
        ConcurrentDictionary_KeyAlreadyExisted: 90,
        ConcurrentDictionary_ItemKeyIsNull: 91,
        ConcurrentDictionary_IndexIsNegative: 92,
        ConcurrentDictionary_ArrayNotLargeEnough: 93,
        ConcurrentDictionary_ArrayIncorrectType: 94,
        ConcurrentCollection_SyncRoot_NotSupported: 95,
        ArgumentOutOfRange_Enum: 96,
        InvalidOperation_HandleIsNotInitialized: 97,
        AsyncMethodBuilder_InstanceNotInitialized: 98,
        ArgumentNull_SafeHandle: 99
      }
    }
  } );

  // @source FormatException.js

  Bridge.define( "System.FormatException", {
    inherits: [System.SystemException],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.SystemException.$ctor1.call( this, "One of the identified items was in an invalid format." );
        this.HResult = -2146233033;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2146233033;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, innerException );
        this.HResult = -2146233033;
      }
    }
  } );

  // @source FormattableString.js

  Bridge.define( "System.FormattableString", {
    inherits: [System.IFormattable],
    statics: {
      methods: {
        Invariant: function ( formattable ) {
          if ( formattable == null ) {
            throw new System.ArgumentNullException.$ctor1( "formattable" );
          }

          return formattable.ToString( System.Globalization.CultureInfo.invariantCulture );
        }
      }
    },
    methods: {
      System$IFormattable$format: function ( ignored, formatProvider ) {
        return this.ToString( formatProvider );
      },
      toString: function () {
        return this.ToString( System.Globalization.CultureInfo.getCurrentCulture() );
      }
    }
  } );

  // @source ConcreteFormattableString.js

  Bridge.define( "System.Runtime.CompilerServices.FormattableStringFactory.ConcreteFormattableString", {
    inherits: [System.FormattableString],
    $kind: "nested class",
    fields: {
      _format: null,
      _arguments: null
    },
    props: {
      Format: {
        get: function () {
          return this._format;
        }
      },
      ArgumentCount: {
        get: function () {
          return this._arguments.length;
        }
      }
    },
    ctors: {
      ctor: function ( format, $arguments ) {
        this.$initialize();
        System.FormattableString.ctor.call( this );
        this._format = format;
        this._arguments = $arguments;
      }
    },
    methods: {
      GetArguments: function () {
        return this._arguments;
      },
      GetArgument: function ( index ) {
        return this._arguments[System.Array.index( index, this._arguments )];
      },
      ToString: function ( formatProvider ) {
        return System.String.formatProvider.apply( System.String, [formatProvider, this._format].concat( this._arguments ) );
      }
    }
  } );

  // @source FormattableStringFactory.js

  Bridge.define( "System.Runtime.CompilerServices.FormattableStringFactory", {
    statics: {
      methods: {
        Create: function ( format, $arguments ) {
          if ( $arguments === void 0 ) { $arguments = []; }
          if ( format == null ) {
            throw new System.ArgumentNullException.$ctor1( "format" );
          }

          if ( $arguments == null ) {
            throw new System.ArgumentNullException.$ctor1( "arguments" );
          }

          return new System.Runtime.CompilerServices.FormattableStringFactory.ConcreteFormattableString( format, $arguments );
        }
      }
    }
  } );

  // @source ITupleInternal.js

  Bridge.define( "System.ITupleInternal", {
    $kind: "interface"
  } );

  // @source IndexOutOfRangeException.js

  Bridge.define( "System.IndexOutOfRangeException", {
    inherits: [System.SystemException],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.SystemException.$ctor1.call( this, "Index was outside the bounds of the array." );
        this.HResult = -2146233080;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2146233080;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, innerException );
        this.HResult = -2146233080;
      }
    }
  } );

  // @source InvalidCastException.js

  Bridge.define( "System.InvalidCastException", {
    inherits: [System.SystemException],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.SystemException.$ctor1.call( this, "Specified cast is not valid." );
        this.HResult = -2147467262;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2147467262;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, innerException );
        this.HResult = -2147467262;
      },
      $ctor3: function ( message, errorCode ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = errorCode;
      }
    }
  } );

  // @source InvalidOperationException.js

  Bridge.define( "System.InvalidOperationException", {
    inherits: [System.SystemException],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.SystemException.$ctor1.call( this, "Operation is not valid due to the current state of the object." );
        this.HResult = -2146233079;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2146233079;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, innerException );
        this.HResult = -2146233079;
      }
    }
  } );

  // @source ObjectDisposedException.js

  Bridge.define( "System.ObjectDisposedException", {
    inherits: [System.InvalidOperationException],
    fields: {
      _objectName: null
    },
    props: {
      Message: {
        get: function () {
          var name = this.ObjectName;
          if ( name == null || name.length === 0 ) {
            return Bridge.ensureBaseProperty( this, "Message" ).$System$Exception$Message;
          }

          var objectDisposed = System.SR.Format( "Object name: '{0}'.", name );
          return ( Bridge.ensureBaseProperty( this, "Message" ).$System$Exception$Message || "" ) + ( "\n" || "" ) + ( objectDisposed || "" );
        }
      },
      ObjectName: {
        get: function () {
          if ( this._objectName == null ) {
            return "";
          }
          return this._objectName;
        }
      }
    },
    ctors: {
      ctor: function () {
        System.ObjectDisposedException.$ctor3.call( this, null, "Cannot access a disposed object." );
      },
      $ctor1: function ( objectName ) {
        System.ObjectDisposedException.$ctor3.call( this, objectName, "Cannot access a disposed object." );
      },
      $ctor3: function ( objectName, message ) {
        this.$initialize();
        System.InvalidOperationException.$ctor1.call( this, message );
        this.HResult = -2146232798;
        this._objectName = objectName;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.InvalidOperationException.$ctor2.call( this, message, innerException );
        this.HResult = -2146232798;
      }
    }
  } );

  // @source InvalidProgramException.js

  Bridge.define( "System.InvalidProgramException", {
    inherits: [System.SystemException],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.SystemException.$ctor1.call( this, "Common Language Runtime detected an invalid program." );
        this.HResult = -2146233030;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2146233030;
      },
      $ctor2: function ( message, inner ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, inner );
        this.HResult = -2146233030;
      }
    }
  } );

  // @source MissingMethodException.js

  Bridge.define( "System.MissingMethodException", {
    inherits: [System.Exception],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.Exception.ctor.call( this, "Attempted to access a missing method." );
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.Exception.ctor.call( this, message );
      },
      $ctor2: function ( message, inner ) {
        this.$initialize();
        System.Exception.ctor.call( this, message, inner );
      },
      $ctor3: function ( className, methodName ) {
        this.$initialize();
        System.Exception.ctor.call( this, ( className || "" ) + "." + ( methodName || "" ) + " Due to: Attempted to access a missing member." );
      }
    }
  } );

  // @source CultureNotFoundException.js

  Bridge.define( "System.Globalization.CultureNotFoundException", {
    inherits: [System.ArgumentException],
    statics: {
      props: {
        DefaultMessage: {
          get: function () {
            return "Culture is not supported.";
          }
        }
      }
    },
    fields: {
      _invalidCultureName: null,
      _invalidCultureId: null
    },
    props: {
      InvalidCultureId: {
        get: function () {
          return this._invalidCultureId;
        }
      },
      InvalidCultureName: {
        get: function () {
          return this._invalidCultureName;
        }
      },
      FormatedInvalidCultureId: {
        get: function () {
          return this.InvalidCultureId != null ? System.String.formatProvider( System.Globalization.CultureInfo.invariantCulture, "{0} (0x{0:x4})", [Bridge.box( System.Nullable.getValue( this.InvalidCultureId ), System.Int32 )] ) : this.InvalidCultureName;
        }
      },
      Message: {
        get: function () {
          var s = Bridge.ensureBaseProperty( this, "Message" ).$System$ArgumentException$Message;
          if ( this._invalidCultureId != null || this._invalidCultureName != null ) {
            var valueMessage = System.SR.Format( "{0} is an invalid culture identifier.", this.FormatedInvalidCultureId );
            if ( s == null ) {
              return valueMessage;
            }

            return ( s || "" ) + ( "\n" || "" ) + ( valueMessage || "" );
          }
          return s;
        }
      }
    },
    ctors: {
      ctor: function () {
        this.$initialize();
        System.ArgumentException.$ctor1.call( this, System.Globalization.CultureNotFoundException.DefaultMessage );
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.ArgumentException.$ctor1.call( this, message );
      },
      $ctor5: function ( paramName, message ) {
        this.$initialize();
        System.ArgumentException.$ctor3.call( this, message, paramName );
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.ArgumentException.$ctor2.call( this, message, innerException );
      },
      $ctor7: function ( paramName, invalidCultureName, message ) {
        this.$initialize();
        System.ArgumentException.$ctor3.call( this, message, paramName );
        this._invalidCultureName = invalidCultureName;
      },
      $ctor6: function ( message, invalidCultureName, innerException ) {
        this.$initialize();
        System.ArgumentException.$ctor2.call( this, message, innerException );
        this._invalidCultureName = invalidCultureName;
      },
      $ctor3: function ( message, invalidCultureId, innerException ) {
        this.$initialize();
        System.ArgumentException.$ctor2.call( this, message, innerException );
        this._invalidCultureId = invalidCultureId;
      },
      $ctor4: function ( paramName, invalidCultureId, message ) {
        this.$initialize();
        System.ArgumentException.$ctor3.call( this, message, paramName );
        this._invalidCultureId = invalidCultureId;
      }
    }
  } );

  // @source DateTimeFormatInfoScanner.js

  Bridge.define( "System.Globalization.DateTimeFormatInfoScanner", {
    statics: {
      fields: {
        MonthPostfixChar: 0,
        IgnorableSymbolChar: 0,
        CJKYearSuff: null,
        CJKMonthSuff: null,
        CJKDaySuff: null,
        KoreanYearSuff: null,
        KoreanMonthSuff: null,
        KoreanDaySuff: null,
        KoreanHourSuff: null,
        KoreanMinuteSuff: null,
        KoreanSecondSuff: null,
        CJKHourSuff: null,
        ChineseHourSuff: null,
        CJKMinuteSuff: null,
        CJKSecondSuff: null,
        s_knownWords: null
      },
      props: {
        KnownWords: {
          get: function () {
            if ( System.Globalization.DateTimeFormatInfoScanner.s_knownWords == null ) {
              var temp = new ( System.Collections.Generic.Dictionary$2( System.String, System.String ) ).ctor();

              temp.add( "/", "" );
              temp.add( "-", "" );
              temp.add( ".", "" );
              temp.add( System.Globalization.DateTimeFormatInfoScanner.CJKYearSuff, "" );
              temp.add( System.Globalization.DateTimeFormatInfoScanner.CJKMonthSuff, "" );
              temp.add( System.Globalization.DateTimeFormatInfoScanner.CJKDaySuff, "" );
              temp.add( System.Globalization.DateTimeFormatInfoScanner.KoreanYearSuff, "" );
              temp.add( System.Globalization.DateTimeFormatInfoScanner.KoreanMonthSuff, "" );
              temp.add( System.Globalization.DateTimeFormatInfoScanner.KoreanDaySuff, "" );
              temp.add( System.Globalization.DateTimeFormatInfoScanner.KoreanHourSuff, "" );
              temp.add( System.Globalization.DateTimeFormatInfoScanner.KoreanMinuteSuff, "" );
              temp.add( System.Globalization.DateTimeFormatInfoScanner.KoreanSecondSuff, "" );
              temp.add( System.Globalization.DateTimeFormatInfoScanner.CJKHourSuff, "" );
              temp.add( System.Globalization.DateTimeFormatInfoScanner.ChineseHourSuff, "" );
              temp.add( System.Globalization.DateTimeFormatInfoScanner.CJKMinuteSuff, "" );
              temp.add( System.Globalization.DateTimeFormatInfoScanner.CJKSecondSuff, "" );

              System.Globalization.DateTimeFormatInfoScanner.s_knownWords = temp;
            }
            return ( System.Globalization.DateTimeFormatInfoScanner.s_knownWords );
          }
        }
      },
      ctors: {
        init: function () {
          this.MonthPostfixChar = 57344;
          this.IgnorableSymbolChar = 57345;
          this.CJKYearSuff = "\u5e74";
          this.CJKMonthSuff = "\u6708";
          this.CJKDaySuff = "\u65e5";
          this.KoreanYearSuff = "\ub144";
          this.KoreanMonthSuff = "\uc6d4";
          this.KoreanDaySuff = "\uc77c";
          this.KoreanHourSuff = "\uc2dc";
          this.KoreanMinuteSuff = "\ubd84";
          this.KoreanSecondSuff = "\ucd08";
          this.CJKHourSuff = "\u6642";
          this.ChineseHourSuff = "\u65f6";
          this.CJKMinuteSuff = "\u5206";
          this.CJKSecondSuff = "\u79d2";
        }
      },
      methods: {
        SkipWhiteSpacesAndNonLetter: function ( pattern, currentIndex ) {
          while ( currentIndex < pattern.length ) {
            var ch = pattern.charCodeAt( currentIndex );
            if ( ch === 92 ) {
              currentIndex = ( currentIndex + 1 ) | 0;
              if ( currentIndex < pattern.length ) {
                ch = pattern.charCodeAt( currentIndex );
                if ( ch === 39 ) {
                  continue;
                }
              } else {
                break;
              }
            }
            if ( System.Char.isLetter( ch ) || ch === 39 || ch === 46 ) {
              break;
            }
            currentIndex = ( currentIndex + 1 ) | 0;
          }
          return ( currentIndex );
        },
        ScanRepeatChar: function ( pattern, ch, index, count ) {
          count.v = 1;
          while ( ( ( index = ( index + 1 ) | 0 ) ) < pattern.length && pattern.charCodeAt( index ) === ch ) {
            count.v = ( count.v + 1 ) | 0;
          }
          return ( index );
        },
        GetFormatFlagGenitiveMonth: function ( monthNames, genitveMonthNames, abbrevMonthNames, genetiveAbbrevMonthNames ) {
          return ( ( !System.Globalization.DateTimeFormatInfoScanner.EqualStringArrays( monthNames, genitveMonthNames ) || !System.Globalization.DateTimeFormatInfoScanner.EqualStringArrays( abbrevMonthNames, genetiveAbbrevMonthNames ) ) ? 1 : 0 );
        },
        GetFormatFlagUseSpaceInMonthNames: function ( monthNames, genitveMonthNames, abbrevMonthNames, genetiveAbbrevMonthNames ) {
          var formatFlags = 0;
          formatFlags |= ( System.Globalization.DateTimeFormatInfoScanner.ArrayElementsBeginWithDigit( monthNames ) || System.Globalization.DateTimeFormatInfoScanner.ArrayElementsBeginWithDigit( genitveMonthNames ) || System.Globalization.DateTimeFormatInfoScanner.ArrayElementsBeginWithDigit( abbrevMonthNames ) || System.Globalization.DateTimeFormatInfoScanner.ArrayElementsBeginWithDigit( genetiveAbbrevMonthNames ) ? 32 : 0 );

          formatFlags |= ( System.Globalization.DateTimeFormatInfoScanner.ArrayElementsHaveSpace( monthNames ) || System.Globalization.DateTimeFormatInfoScanner.ArrayElementsHaveSpace( genitveMonthNames ) || System.Globalization.DateTimeFormatInfoScanner.ArrayElementsHaveSpace( abbrevMonthNames ) || System.Globalization.DateTimeFormatInfoScanner.ArrayElementsHaveSpace( genetiveAbbrevMonthNames ) ? 4 : 0 );
          return ( formatFlags );
        },
        GetFormatFlagUseSpaceInDayNames: function ( dayNames, abbrevDayNames ) {
          return ( ( System.Globalization.DateTimeFormatInfoScanner.ArrayElementsHaveSpace( dayNames ) || System.Globalization.DateTimeFormatInfoScanner.ArrayElementsHaveSpace( abbrevDayNames ) ) ? 16 : 0 );
        },
        GetFormatFlagUseHebrewCalendar: function ( calID ) {
          return ( calID === 8 ? 10 : 0 );
        },
        EqualStringArrays: function ( array1, array2 ) {
          if ( Bridge.referenceEquals( array1, array2 ) ) {
            return true;
          }

          if ( array1.length !== array2.length ) {
            return false;
          }

          for ( var i = 0; i < array1.length; i = ( i + 1 ) | 0 ) {
            if ( !System.String.equals( array1[System.Array.index( i, array1 )], array2[System.Array.index( i, array2 )] ) ) {
              return false;
            }
          }

          return true;
        },
        ArrayElementsHaveSpace: function ( array ) {
          for ( var i = 0; i < array.length; i = ( i + 1 ) | 0 ) {
            for ( var j = 0; j < array[System.Array.index( i, array )].length; j = ( j + 1 ) | 0 ) {
              if ( System.Char.isWhiteSpace( String.fromCharCode( array[System.Array.index( i, array )].charCodeAt( j ) ) ) ) {
                return true;
              }
            }
          }

          return false;
        },
        ArrayElementsBeginWithDigit: function ( array ) {
          for ( var i = 0; i < array.length; i = ( i + 1 ) | 0 ) {
            if ( array[System.Array.index( i, array )].length > 0 && array[System.Array.index( i, array )].charCodeAt( 0 ) >= 48 && array[System.Array.index( i, array )].charCodeAt( 0 ) <= 57 ) {
              var index = 1;
              while ( index < array[System.Array.index( i, array )].length && array[System.Array.index( i, array )].charCodeAt( index ) >= 48 && array[System.Array.index( i, array )].charCodeAt( index ) <= 57 ) {
                index = ( index + 1 ) | 0;
              }
              if ( index === array[System.Array.index( i, array )].length ) {
                return ( false );
              }

              if ( index === ( ( array[System.Array.index( i, array )].length - 1 ) | 0 ) ) {
                switch ( array[System.Array.index( i, array )].charCodeAt( index ) ) {
                  case 26376:
                  case 50900:
                    return ( false );
                }
              }

              if ( index === ( ( array[System.Array.index( i, array )].length - 4 ) | 0 ) ) {
                if ( array[System.Array.index( i, array )].charCodeAt( index ) === 39 && array[System.Array.index( i, array )].charCodeAt( ( ( index + 1 ) | 0 ) ) === 32 && array[System.Array.index( i, array )].charCodeAt( ( ( index + 2 ) | 0 ) ) === 26376 && array[System.Array.index( i, array )].charCodeAt( ( ( index + 3 ) | 0 ) ) === 39 ) {
                  return ( false );
                }
              }
              return ( true );
            }
          }

          return false;
        }
      }
    },
    fields: {
      m_dateWords: null,
      _ymdFlags: 0
    },
    ctors: {
      init: function () {
        this.m_dateWords = new ( System.Collections.Generic.List$1( System.String ) ).ctor();
        this._ymdFlags = System.Globalization.DateTimeFormatInfoScanner.FoundDatePattern.None;
      }
    },
    methods: {
      AddDateWordOrPostfix: function ( formatPostfix, str ) {
        if ( str.length > 0 ) {
          if ( System.String.equals( str, "." ) ) {
            this.AddIgnorableSymbols( "." );
            return;
          }
          var words = {};
          if ( System.Globalization.DateTimeFormatInfoScanner.KnownWords.tryGetValue( str, words ) === false ) {
            if ( this.m_dateWords == null ) {
              this.m_dateWords = new ( System.Collections.Generic.List$1( System.String ) ).ctor();
            }
            if ( Bridge.referenceEquals( formatPostfix, "MMMM" ) ) {
              var temp = String.fromCharCode( System.Globalization.DateTimeFormatInfoScanner.MonthPostfixChar ) + ( str || "" );
              if ( !this.m_dateWords.contains( temp ) ) {
                this.m_dateWords.add( temp );
              }
            } else {
              if ( !this.m_dateWords.contains( str ) ) {
                this.m_dateWords.add( str );
              }
              if ( str.charCodeAt( ( ( str.length - 1 ) | 0 ) ) === 46 ) {
                var strWithoutDot = str.substr( 0, ( ( str.length - 1 ) | 0 ) );
                if ( !this.m_dateWords.contains( strWithoutDot ) ) {
                  this.m_dateWords.add( strWithoutDot );
                }
              }
            }
          }
        }
      },
      AddDateWords: function ( pattern, index, formatPostfix ) {
        var newIndex = System.Globalization.DateTimeFormatInfoScanner.SkipWhiteSpacesAndNonLetter( pattern, index );
        if ( newIndex !== index && formatPostfix != null ) {
          formatPostfix = null;
        }
        index = newIndex;

        var dateWord = new System.Text.StringBuilder();

        while ( index < pattern.length ) {
          var ch = pattern.charCodeAt( index );
          if ( ch === 39 ) {
            this.AddDateWordOrPostfix( formatPostfix, dateWord.toString() );
            index = ( index + 1 ) | 0;
            break;
          } else if ( ch === 92 ) {

            index = ( index + 1 ) | 0;
            if ( index < pattern.length ) {
              dateWord.append( String.fromCharCode( pattern.charCodeAt( index ) ) );
              index = ( index + 1 ) | 0;
            }
          } else if ( System.Char.isWhiteSpace( String.fromCharCode( ch ) ) ) {
            this.AddDateWordOrPostfix( formatPostfix, dateWord.toString() );
            if ( formatPostfix != null ) {
              formatPostfix = null;
            }
            dateWord.setLength( 0 );
            index = ( index + 1 ) | 0;
          } else {
            dateWord.append( String.fromCharCode( ch ) );
            index = ( index + 1 ) | 0;
          }
        }
        return ( index );
      },
      AddIgnorableSymbols: function ( text ) {
        if ( this.m_dateWords == null ) {
          this.m_dateWords = new ( System.Collections.Generic.List$1( System.String ) ).ctor();
        }
        var temp = String.fromCharCode( System.Globalization.DateTimeFormatInfoScanner.IgnorableSymbolChar ) + ( text || "" );
        if ( !this.m_dateWords.contains( temp ) ) {
          this.m_dateWords.add( temp );
        }
      },
      ScanDateWord: function ( pattern ) {
        this._ymdFlags = System.Globalization.DateTimeFormatInfoScanner.FoundDatePattern.None;

        var i = 0;
        while ( i < pattern.length ) {
          var ch = pattern.charCodeAt( i );
          var chCount = {};

          switch ( ch ) {
            case 39:
              i = this.AddDateWords( pattern, ( ( i + 1 ) | 0 ), null );
              break;
            case 77:
              i = System.Globalization.DateTimeFormatInfoScanner.ScanRepeatChar( pattern, 77, i, chCount );
              if ( chCount.v >= 4 ) {
                if ( i < pattern.length && pattern.charCodeAt( i ) === 39 ) {
                  i = this.AddDateWords( pattern, ( ( i + 1 ) | 0 ), "MMMM" );
                }
              }
              this._ymdFlags |= System.Globalization.DateTimeFormatInfoScanner.FoundDatePattern.FoundMonthPatternFlag;
              break;
            case 121:
              i = System.Globalization.DateTimeFormatInfoScanner.ScanRepeatChar( pattern, 121, i, chCount );
              this._ymdFlags |= System.Globalization.DateTimeFormatInfoScanner.FoundDatePattern.FoundYearPatternFlag;
              break;
            case 100:
              i = System.Globalization.DateTimeFormatInfoScanner.ScanRepeatChar( pattern, 100, i, chCount );
              if ( chCount.v <= 2 ) {
                this._ymdFlags |= System.Globalization.DateTimeFormatInfoScanner.FoundDatePattern.FoundDayPatternFlag;
              }
              break;
            case 92:
              i = ( i + 2 ) | 0;
              break;
            case 46:
              if ( this._ymdFlags === System.Globalization.DateTimeFormatInfoScanner.FoundDatePattern.FoundYMDPatternFlag ) {
                this.AddIgnorableSymbols( "." );
                this._ymdFlags = System.Globalization.DateTimeFormatInfoScanner.FoundDatePattern.None;
              }
              i = ( i + 1 ) | 0;
              break;
            default:
              if ( this._ymdFlags === System.Globalization.DateTimeFormatInfoScanner.FoundDatePattern.FoundYMDPatternFlag && !System.Char.isWhiteSpace( String.fromCharCode( ch ) ) ) {
                this._ymdFlags = System.Globalization.DateTimeFormatInfoScanner.FoundDatePattern.None;
              }
              i = ( i + 1 ) | 0;
              break;
          }
        }
      },
      GetDateWordsOfDTFI: function ( dtfi ) {
        var datePatterns = dtfi.getAllDateTimePatterns( 68 );
        var i;

        for ( i = 0; i < datePatterns.length; i = ( i + 1 ) | 0 ) {
          this.ScanDateWord( datePatterns[System.Array.index( i, datePatterns )] );
        }

        datePatterns = dtfi.getAllDateTimePatterns( 100 );
        for ( i = 0; i < datePatterns.length; i = ( i + 1 ) | 0 ) {
          this.ScanDateWord( datePatterns[System.Array.index( i, datePatterns )] );
        }
        datePatterns = dtfi.getAllDateTimePatterns( 121 );
        for ( i = 0; i < datePatterns.length; i = ( i + 1 ) | 0 ) {
          this.ScanDateWord( datePatterns[System.Array.index( i, datePatterns )] );
        }

        this.ScanDateWord( dtfi.monthDayPattern );

        datePatterns = dtfi.getAllDateTimePatterns( 84 );
        for ( i = 0; i < datePatterns.length; i = ( i + 1 ) | 0 ) {
          this.ScanDateWord( datePatterns[System.Array.index( i, datePatterns )] );
        }

        datePatterns = dtfi.getAllDateTimePatterns( 116 );
        for ( i = 0; i < datePatterns.length; i = ( i + 1 ) | 0 ) {
          this.ScanDateWord( datePatterns[System.Array.index( i, datePatterns )] );
        }

        var result = null;
        if ( this.m_dateWords != null && this.m_dateWords.Count > 0 ) {
          result = System.Array.init( this.m_dateWords.Count, null, System.String );
          for ( i = 0; i < this.m_dateWords.Count; i = ( i + 1 ) | 0 ) {
            result[System.Array.index( i, result )] = this.m_dateWords.getItem( i );
          }
        }
        return ( result );
      }
    }
  } );

  // @source DateTimeStyles.js

  Bridge.define( "System.Globalization.DateTimeStyles", {
    $kind: "enum",
    statics: {
      fields: {
        None: 0,
        AllowLeadingWhite: 1,
        AllowTrailingWhite: 2,
        AllowInnerWhite: 4,
        AllowWhiteSpaces: 7,
        NoCurrentDateDefault: 8,
        AdjustToUniversal: 16,
        AssumeLocal: 32,
        AssumeUniversal: 64,
        RoundtripKind: 128
      }
    },
    $flags: true
  } );

  // @source FORMATFLAGS.js

  Bridge.define( "System.Globalization.FORMATFLAGS", {
    $kind: "enum",
    statics: {
      fields: {
        None: 0,
        UseGenitiveMonth: 1,
        UseLeapYearMonth: 2,
        UseSpacesInMonthNames: 4,
        UseHebrewParsing: 8,
        UseSpacesInDayNames: 16,
        UseDigitPrefixInTokens: 32
      }
    }
  } );

  // @source FoundDatePattern.js

  Bridge.define( "System.Globalization.DateTimeFormatInfoScanner.FoundDatePattern", {
    $kind: "nested enum",
    statics: {
      fields: {
        None: 0,
        FoundYearPatternFlag: 1,
        FoundMonthPatternFlag: 2,
        FoundDayPatternFlag: 4,
        FoundYMDPatternFlag: 7
      }
    }
  } );

  // @source NotImplemented.js

  Bridge.define( "System.NotImplemented", {
    statics: {
      props: {
        ByDesign: {
          get: function () {
            return new System.NotImplementedException.ctor();
          }
        }
      },
      methods: {
        ByDesignWithMessage: function ( message ) {
          return new System.NotImplementedException.$ctor1( message );
        }
      }
    }
  } );

  // @source NotImplementedException.js

  Bridge.define( "System.NotImplementedException", {
    inherits: [System.SystemException],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.SystemException.$ctor1.call( this, "The method or operation is not implemented." );
        this.HResult = -2147467263;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2147467263;
      },
      $ctor2: function ( message, inner ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, inner );
        this.HResult = -2147467263;
      }
    }
  } );

  // @source NotSupportedException.js

  Bridge.define( "System.NotSupportedException", {
    inherits: [System.SystemException],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.SystemException.$ctor1.call( this, "Specified method is not supported." );
        this.HResult = -2146233067;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2146233067;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, innerException );
        this.HResult = -2146233067;
      }
    }
  } );

  // @source NullReferenceException.js

  Bridge.define( "System.NullReferenceException", {
    inherits: [System.SystemException],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.SystemException.$ctor1.call( this, "Object reference not set to an instance of an object." );
        this.HResult = -2147467261;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2147467261;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, innerException );
        this.HResult = -2147467261;
      }
    }
  } );

  // @source OperationCanceledException.js

  Bridge.define( "System.OperationCanceledException", {
    inherits: [System.SystemException],
    fields: {
      _cancellationToken: null
    },
    props: {
      CancellationToken: {
        get: function () {
          return this._cancellationToken;
        },
        set: function ( value ) {
          this._cancellationToken = value;
        }
      }
    },
    ctors: {
      init: function () {
        this._cancellationToken = new System.Threading.CancellationToken();
      },
      ctor: function () {
        this.$initialize();
        System.SystemException.$ctor1.call( this, "The operation was canceled." );
        this.HResult = -2146233029;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2146233029;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, innerException );
        this.HResult = -2146233029;
      },
      $ctor5: function ( token ) {
        System.OperationCanceledException.ctor.call( this );
        this.CancellationToken = token;
      },
      $ctor4: function ( message, token ) {
        System.OperationCanceledException.$ctor1.call( this, message );
        this.CancellationToken = token;
      },
      $ctor3: function ( message, innerException, token ) {
        System.OperationCanceledException.$ctor2.call( this, message, innerException );
        this.CancellationToken = token;
      }
    }
  } );

  // @source OverflowException.js

  Bridge.define( "System.OverflowException", {
    inherits: [System.ArithmeticException],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.ArithmeticException.$ctor1.call( this, "Arithmetic operation resulted in an overflow." );
        this.HResult = -2146233066;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.ArithmeticException.$ctor1.call( this, message );
        this.HResult = -2146233066;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.ArithmeticException.$ctor2.call( this, message, innerException );
        this.HResult = -2146233066;
      }
    }
  } );

  // @source ParseFailureKind.js

  Bridge.define( "System.ParseFailureKind", {
    $kind: "enum",
    statics: {
      fields: {
        None: 0,
        ArgumentNull: 1,
        Format: 2,
        FormatWithParameter: 3,
        FormatBadDateTimeCalendar: 4
      }
    }
  } );

  // @source ParseFlags.js

  Bridge.define( "System.ParseFlags", {
    $kind: "enum",
    statics: {
      fields: {
        HaveYear: 1,
        HaveMonth: 2,
        HaveDay: 4,
        HaveHour: 8,
        HaveMinute: 16,
        HaveSecond: 32,
        HaveTime: 64,
        HaveDate: 128,
        TimeZoneUsed: 256,
        TimeZoneUtc: 512,
        ParsedMonthName: 1024,
        CaptureOffset: 2048,
        YearDefault: 4096,
        Rfc1123Pattern: 8192,
        UtcSortPattern: 16384
      }
    },
    $flags: true
  } );

  // @source StringBuilderCache.js

  Bridge.define( "System.Text.StringBuilderCache", {
    statics: {
      fields: {
        MAX_BUILDER_SIZE: 0,
        DEFAULT_CAPACITY: 0,
        t_cachedInstance: null
      },
      ctors: {
        init: function () {
          this.MAX_BUILDER_SIZE = 260;
          this.DEFAULT_CAPACITY = 16;
        }
      },
      methods: {
        Acquire: function ( capacity ) {
          if ( capacity === void 0 ) { capacity = 16; }
          if ( capacity <= System.Text.StringBuilderCache.MAX_BUILDER_SIZE ) {
            var sb = System.Text.StringBuilderCache.t_cachedInstance;
            if ( sb != null ) {
              if ( capacity <= sb.getCapacity() ) {
                System.Text.StringBuilderCache.t_cachedInstance = null;
                sb.clear();
                return sb;
              }
            }
          }
          return new System.Text.StringBuilder( "", capacity );
        },
        Release: function ( sb ) {
          if ( sb.getCapacity() <= System.Text.StringBuilderCache.MAX_BUILDER_SIZE ) {
            System.Text.StringBuilderCache.t_cachedInstance = sb;
          }
        },
        GetStringAndRelease: function ( sb ) {
          var result = sb.toString();
          System.Text.StringBuilderCache.Release( sb );
          return result;
        }
      }
    }
  } );

  // @source BinaryReader.js

  Bridge.define( "System.IO.BinaryReader", {
    inherits: [System.IDisposable],
    statics: {
      fields: {
        MaxCharBytesSize: 0
      },
      ctors: {
        init: function () {
          this.MaxCharBytesSize = 128;
        }
      }
    },
    fields: {
      m_stream: null,
      m_buffer: null,
      m_encoding: null,
      m_charBytes: null,
      m_singleChar: null,
      m_charBuffer: null,
      m_maxCharsSize: 0,
      m_2BytesPerChar: false,
      m_isMemoryStream: false,
      m_leaveOpen: false,
      lastCharsRead: 0
    },
    props: {
      BaseStream: {
        get: function () {
          return this.m_stream;
        }
      }
    },
    alias: ["Dispose", "System$IDisposable$Dispose"],
    ctors: {
      init: function () {
        this.lastCharsRead = 0;
      },
      ctor: function ( input ) {
        System.IO.BinaryReader.$ctor2.call( this, input, new System.Text.UTF8Encoding.ctor(), false );
      },
      $ctor1: function ( input, encoding ) {
        System.IO.BinaryReader.$ctor2.call( this, input, encoding, false );
      },
      $ctor2: function ( input, encoding, leaveOpen ) {
        this.$initialize();
        if ( input == null ) {
          throw new System.ArgumentNullException.$ctor1( "input" );
        }
        if ( encoding == null ) {
          throw new System.ArgumentNullException.$ctor1( "encoding" );
        }
        if ( !input.CanRead ) {
          throw new System.ArgumentException.$ctor1( "Argument_StreamNotReadable" );
        }
        this.m_stream = input;
        this.m_encoding = encoding;
        this.m_maxCharsSize = encoding.GetMaxCharCount( System.IO.BinaryReader.MaxCharBytesSize );
        var minBufferSize = encoding.GetMaxByteCount( 1 );
        if ( minBufferSize < 23 ) {
          minBufferSize = 23;
        }
        this.m_buffer = System.Array.init( minBufferSize, 0, System.Byte );

        this.m_2BytesPerChar = Bridge.is( encoding, System.Text.UnicodeEncoding );
        this.m_isMemoryStream = ( Bridge.referenceEquals( Bridge.getType( this.m_stream ), System.IO.MemoryStream ) );
        this.m_leaveOpen = leaveOpen;

      }
    },
    methods: {
      Close: function () {
        this.Dispose$1( true );
      },
      Dispose$1: function ( disposing ) {
        if ( disposing ) {
          var copyOfStream = this.m_stream;
          this.m_stream = null;
          if ( copyOfStream != null && !this.m_leaveOpen ) {
            copyOfStream.Close();
          }
        }
        this.m_stream = null;
        this.m_buffer = null;
        this.m_encoding = null;
        this.m_charBytes = null;
        this.m_singleChar = null;
        this.m_charBuffer = null;
      },
      Dispose: function () {
        this.Dispose$1( true );
      },
      PeekChar: function () {

        if ( this.m_stream == null ) {
          System.IO.__Error.FileNotOpen();
        }

        if ( !this.m_stream.CanSeek ) {
          return -1;
        }
        var origPos = this.m_stream.Position;
        var ch = this.Read();
        this.m_stream.Position = origPos;
        return ch;
      },
      Read: function () {

        if ( this.m_stream == null ) {
          System.IO.__Error.FileNotOpen();
        }
        return this.InternalReadOneChar();
      },
      Read$2: function ( buffer, index, count ) {
        if ( buffer == null ) {
          throw new System.ArgumentNullException.$ctor3( "buffer", "ArgumentNull_Buffer" );
        }
        if ( index < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "index", "ArgumentOutOfRange_NeedNonNegNum" );
        }
        if ( count < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "count", "ArgumentOutOfRange_NeedNonNegNum" );
        }
        if ( ( ( buffer.length - index ) | 0 ) < count ) {
          throw new System.ArgumentException.$ctor1( "Argument_InvalidOffLen" );
        }

        if ( this.m_stream == null ) {
          System.IO.__Error.FileNotOpen();
        }

        return this.InternalReadChars( buffer, index, count );
      },
      Read$1: function ( buffer, index, count ) {
        if ( buffer == null ) {
          throw new System.ArgumentNullException.$ctor3( "buffer", "ArgumentNull_Buffer" );
        }
        if ( index < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "index", "ArgumentOutOfRange_NeedNonNegNum" );
        }
        if ( count < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "count", "ArgumentOutOfRange_NeedNonNegNum" );
        }
        if ( ( ( buffer.length - index ) | 0 ) < count ) {
          throw new System.ArgumentException.$ctor1( "Argument_InvalidOffLen" );
        }

        if ( this.m_stream == null ) {
          System.IO.__Error.FileNotOpen();
        }
        return this.m_stream.Read( buffer, index, count );
      },
      ReadBoolean: function () {
        this.FillBuffer( 1 );
        return ( this.m_buffer[System.Array.index( 0, this.m_buffer )] !== 0 );
      },
      ReadByte: function () {
        if ( this.m_stream == null ) {
          System.IO.__Error.FileNotOpen();
        }

        var b = this.m_stream.ReadByte();
        if ( b === -1 ) {
          System.IO.__Error.EndOfFile();
        }
        return ( b & 255 );
      },
      ReadSByte: function () {
        this.FillBuffer( 1 );
        return Bridge.Int.sxb( ( this.m_buffer[System.Array.index( 0, this.m_buffer )] ) & 255 );
      },
      ReadChar: function () {
        var value = this.Read();
        if ( value === -1 ) {
          System.IO.__Error.EndOfFile();
        }
        return ( value & 65535 );
      },
      ReadInt16: function () {
        this.FillBuffer( 2 );
        return Bridge.Int.sxs( ( this.m_buffer[System.Array.index( 0, this.m_buffer )] | this.m_buffer[System.Array.index( 1, this.m_buffer )] << 8 ) & 65535 );
      },
      ReadUInt16: function () {
        this.FillBuffer( 2 );
        return ( ( this.m_buffer[System.Array.index( 0, this.m_buffer )] | this.m_buffer[System.Array.index( 1, this.m_buffer )] << 8 ) & 65535 );
      },
      ReadInt32: function () {
        if ( this.m_isMemoryStream ) {
          if ( this.m_stream == null ) {
            System.IO.__Error.FileNotOpen();
          }
          var mStream = Bridge.as( this.m_stream, System.IO.MemoryStream );

          return mStream.InternalReadInt32();
        } else {
          this.FillBuffer( 4 );
          return this.m_buffer[System.Array.index( 0, this.m_buffer )] | this.m_buffer[System.Array.index( 1, this.m_buffer )] << 8 | this.m_buffer[System.Array.index( 2, this.m_buffer )] << 16 | this.m_buffer[System.Array.index( 3, this.m_buffer )] << 24;
        }
      },
      ReadUInt32: function () {
        this.FillBuffer( 4 );
        return ( ( this.m_buffer[System.Array.index( 0, this.m_buffer )] | this.m_buffer[System.Array.index( 1, this.m_buffer )] << 8 | this.m_buffer[System.Array.index( 2, this.m_buffer )] << 16 | this.m_buffer[System.Array.index( 3, this.m_buffer )] << 24 ) >>> 0 );
      },
      ReadInt64: function () {
        this.FillBuffer( 8 );
        var lo = ( this.m_buffer[System.Array.index( 0, this.m_buffer )] | this.m_buffer[System.Array.index( 1, this.m_buffer )] << 8 | this.m_buffer[System.Array.index( 2, this.m_buffer )] << 16 | this.m_buffer[System.Array.index( 3, this.m_buffer )] << 24 ) >>> 0;
        var hi = ( this.m_buffer[System.Array.index( 4, this.m_buffer )] | this.m_buffer[System.Array.index( 5, this.m_buffer )] << 8 | this.m_buffer[System.Array.index( 6, this.m_buffer )] << 16 | this.m_buffer[System.Array.index( 7, this.m_buffer )] << 24 ) >>> 0;
        return System.Int64.clip64( System.UInt64( hi ) ).shl( 32 ).or( System.Int64( lo ) );
      },
      ReadUInt64: function () {
        this.FillBuffer( 8 );
        var lo = ( this.m_buffer[System.Array.index( 0, this.m_buffer )] | this.m_buffer[System.Array.index( 1, this.m_buffer )] << 8 | this.m_buffer[System.Array.index( 2, this.m_buffer )] << 16 | this.m_buffer[System.Array.index( 3, this.m_buffer )] << 24 ) >>> 0;
        var hi = ( this.m_buffer[System.Array.index( 4, this.m_buffer )] | this.m_buffer[System.Array.index( 5, this.m_buffer )] << 8 | this.m_buffer[System.Array.index( 6, this.m_buffer )] << 16 | this.m_buffer[System.Array.index( 7, this.m_buffer )] << 24 ) >>> 0;
        return System.UInt64( hi ).shl( 32 ).or( System.UInt64( lo ) );
      },
      ReadSingle: function () {
        this.FillBuffer( 4 );
        var tmpBuffer = ( this.m_buffer[System.Array.index( 0, this.m_buffer )] | this.m_buffer[System.Array.index( 1, this.m_buffer )] << 8 | this.m_buffer[System.Array.index( 2, this.m_buffer )] << 16 | this.m_buffer[System.Array.index( 3, this.m_buffer )] << 24 ) >>> 0;
        return System.BitConverter.toSingle( System.BitConverter.getBytes$8( tmpBuffer ), 0 );
      },
      ReadDouble: function () {
        this.FillBuffer( 8 );
        var lo = ( this.m_buffer[System.Array.index( 0, this.m_buffer )] | this.m_buffer[System.Array.index( 1, this.m_buffer )] << 8 | this.m_buffer[System.Array.index( 2, this.m_buffer )] << 16 | this.m_buffer[System.Array.index( 3, this.m_buffer )] << 24 ) >>> 0;
        var hi = ( this.m_buffer[System.Array.index( 4, this.m_buffer )] | this.m_buffer[System.Array.index( 5, this.m_buffer )] << 8 | this.m_buffer[System.Array.index( 6, this.m_buffer )] << 16 | this.m_buffer[System.Array.index( 7, this.m_buffer )] << 24 ) >>> 0;

        var tmpBuffer = System.UInt64( hi ).shl( 32 ).or( System.UInt64( lo ) );
        return System.BitConverter.toDouble( System.BitConverter.getBytes$9( tmpBuffer ), 0 );
      },
      ReadDecimal: function () {
        this.FillBuffer( 23 );
        try {
          return System.Decimal.fromBytes( this.m_buffer );
        } catch ( $e1 ) {
          $e1 = System.Exception.create( $e1 );
          var e;
          if ( Bridge.is( $e1, System.ArgumentException ) ) {
            e = $e1;
            throw new System.IO.IOException.$ctor2( "Arg_DecBitCtor", e );
          } else {
            throw $e1;
          }
        }
      },
      ReadString: function () {

        if ( this.m_stream == null ) {
          System.IO.__Error.FileNotOpen();
        }

        var currPos = 0;
        var n;
        var stringLength;
        var readLength;
        var charsRead;

        stringLength = this.Read7BitEncodedInt();
        if ( stringLength < 0 ) {
          throw new System.IO.IOException.$ctor1( "IO.IO_InvalidStringLen_Len" );
        }

        if ( stringLength === 0 ) {
          return "";
        }

        if ( this.m_charBytes == null ) {
          this.m_charBytes = System.Array.init( System.IO.BinaryReader.MaxCharBytesSize, 0, System.Byte );
        }

        if ( this.m_charBuffer == null ) {
          this.m_charBuffer = System.Array.init( this.m_maxCharsSize, 0, System.Char );
        }

        var sb = null;
        do {
          readLength = ( ( ( ( stringLength - currPos ) | 0 ) ) > System.IO.BinaryReader.MaxCharBytesSize ) ? System.IO.BinaryReader.MaxCharBytesSize : ( ( ( stringLength - currPos ) | 0 ) );

          n = this.m_stream.Read( this.m_charBytes, 0, readLength );
          if ( n === 0 ) {
            System.IO.__Error.EndOfFile();
          }

          charsRead = this.m_encoding.GetChars$2( this.m_charBytes, 0, n, this.m_charBuffer, 0 );

          if ( currPos === 0 && n === stringLength ) {
            return System.String.fromCharArray( this.m_charBuffer, 0, charsRead );
          }

          if ( sb == null ) {
            sb = new System.Text.StringBuilder( "", stringLength );
          }

          for ( var i = 0; i < charsRead; i = ( i + 1 ) | 0 ) {
            sb.append( String.fromCharCode( this.m_charBuffer[System.Array.index( i, this.m_charBuffer )] ) );
          }

          currPos = ( currPos + n ) | 0;

        } while ( currPos < stringLength );

        return sb.toString();
      },
      InternalReadChars: function ( buffer, index, count ) {

        var charsRemaining = count;

        if ( this.m_charBytes == null ) {
          this.m_charBytes = System.Array.init( System.IO.BinaryReader.MaxCharBytesSize, 0, System.Byte );
        }

        if ( index < 0 || charsRemaining < 0 || ( ( index + charsRemaining ) | 0 ) > buffer.length ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "charsRemaining" );
        }

        while ( charsRemaining > 0 ) {

          var ch = this.InternalReadOneChar( true );

          if ( ch === -1 ) {
            break;
          }

          buffer[System.Array.index( index, buffer )] = ch & 65535;

          if ( this.lastCharsRead === 2 ) {
            buffer[System.Array.index( ( ( index = ( index + 1 ) | 0 ) ), buffer )] = this.m_singleChar[System.Array.index( 1, this.m_singleChar )];
            charsRemaining = ( charsRemaining - 1 ) | 0;
          }

          charsRemaining = ( charsRemaining - 1 ) | 0;
          index = ( index + 1 ) | 0;
        }


        return ( ( ( count - charsRemaining ) | 0 ) );
      },
      InternalReadOneChar: function ( allowSurrogate ) {
        if ( allowSurrogate === void 0 ) { allowSurrogate = false; }
        var charsRead = 0;
        var numBytes = 0;
        var posSav = System.Int64( 0 );

        if ( this.m_stream.CanSeek ) {
          posSav = this.m_stream.Position;
        }

        if ( this.m_charBytes == null ) {
          this.m_charBytes = System.Array.init( System.IO.BinaryReader.MaxCharBytesSize, 0, System.Byte );
        }
        if ( this.m_singleChar == null ) {
          this.m_singleChar = System.Array.init( 2, 0, System.Char );
        }

        var addByte = false;
        var internalPos = 0;
        while ( charsRead === 0 ) {
          numBytes = this.m_2BytesPerChar ? 2 : 1;

          if ( Bridge.is( this.m_encoding, System.Text.UTF32Encoding ) ) {
            numBytes = 4;
          }

          if ( addByte ) {
            var r = this.m_stream.ReadByte();
            this.m_charBytes[System.Array.index( ( ( internalPos = ( internalPos + 1 ) | 0 ) ), this.m_charBytes )] = r & 255;
            if ( r === -1 ) {
              numBytes = 0;
            }

            if ( numBytes === 2 ) {
              r = this.m_stream.ReadByte();
              this.m_charBytes[System.Array.index( ( ( internalPos = ( internalPos + 1 ) | 0 ) ), this.m_charBytes )] = r & 255;
              if ( r === -1 ) {
                numBytes = 1;
              }
            }
          } else {
            var r1 = this.m_stream.ReadByte();
            this.m_charBytes[System.Array.index( 0, this.m_charBytes )] = r1 & 255;
            internalPos = 0;
            if ( r1 === -1 ) {
              numBytes = 0;
            }

            if ( numBytes === 2 ) {
              r1 = this.m_stream.ReadByte();
              this.m_charBytes[System.Array.index( 1, this.m_charBytes )] = r1 & 255;
              if ( r1 === -1 ) {
                numBytes = 1;
              }
              internalPos = 1;
            } else if ( numBytes === 4 ) {
              r1 = this.m_stream.ReadByte();
              this.m_charBytes[System.Array.index( 1, this.m_charBytes )] = r1 & 255;
              if ( r1 === -1 ) {
                return -1;
              }

              r1 = this.m_stream.ReadByte();
              this.m_charBytes[System.Array.index( 2, this.m_charBytes )] = r1 & 255;
              if ( r1 === -1 ) {
                return -1;
              }

              r1 = this.m_stream.ReadByte();
              this.m_charBytes[System.Array.index( 3, this.m_charBytes )] = r1 & 255;
              if ( r1 === -1 ) {
                return -1;
              }

              internalPos = 3;
            }
          }


          if ( numBytes === 0 ) {
            return -1;
          }

          addByte = false;
          try {
            charsRead = this.m_encoding.GetChars$2( this.m_charBytes, 0, ( ( internalPos + 1 ) | 0 ), this.m_singleChar, 0 );

            if ( !allowSurrogate && charsRead === 2 ) {
              throw new System.ArgumentException.ctor();
            }
          } catch ( $e1 ) {
            $e1 = System.Exception.create( $e1 );

            if ( this.m_stream.CanSeek ) {
              this.m_stream.Seek( ( posSav.sub( this.m_stream.Position ) ), 1 );
            }

            throw $e1;
          }

          if ( this.m_encoding._hasError ) {
            charsRead = 0;
            addByte = true;
          }

          if ( !allowSurrogate ) {
          }
        }

        this.lastCharsRead = charsRead;

        if ( charsRead === 0 ) {
          return -1;
        }

        return this.m_singleChar[System.Array.index( 0, this.m_singleChar )];
      },
      ReadChars: function ( count ) {
        if ( count < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "count", "ArgumentOutOfRange_NeedNonNegNum" );
        }
        if ( this.m_stream == null ) {
          System.IO.__Error.FileNotOpen();
        }

        if ( count === 0 ) {
          return System.Array.init( 0, 0, System.Char );
        }

        var chars = System.Array.init( count, 0, System.Char );
        var n = this.InternalReadChars( chars, 0, count );
        if ( n !== count ) {
          var copy = System.Array.init( n, 0, System.Char );
          System.Array.copy( chars, 0, copy, 0, Bridge.Int.mul( 2, n ) );
          chars = copy;
        }

        return chars;
      },
      ReadBytes: function ( count ) {
        if ( count < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "count", "ArgumentOutOfRange_NeedNonNegNum" );
        }
        if ( this.m_stream == null ) {
          System.IO.__Error.FileNotOpen();
        }

        if ( count === 0 ) {
          return System.Array.init( 0, 0, System.Byte );
        }

        var result = System.Array.init( count, 0, System.Byte );

        var numRead = 0;
        do {
          var n = this.m_stream.Read( result, numRead, count );
          if ( n === 0 ) {
            break;
          }
          numRead = ( numRead + n ) | 0;
          count = ( count - n ) | 0;
        } while ( count > 0 );

        if ( numRead !== result.length ) {
          var copy = System.Array.init( numRead, 0, System.Byte );
          System.Array.copy( result, 0, copy, 0, numRead );
          result = copy;
        }

        return result;
      },
      FillBuffer: function ( numBytes ) {
        if ( this.m_buffer != null && ( numBytes < 0 || numBytes > this.m_buffer.length ) ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "numBytes", "ArgumentOutOfRange_BinaryReaderFillBuffer" );
        }
        var bytesRead = 0;
        var n = 0;

        if ( this.m_stream == null ) {
          System.IO.__Error.FileNotOpen();
        }

        if ( numBytes === 1 ) {
          n = this.m_stream.ReadByte();
          if ( n === -1 ) {
            System.IO.__Error.EndOfFile();
          }
          this.m_buffer[System.Array.index( 0, this.m_buffer )] = n & 255;
          return;
        }

        do {
          n = this.m_stream.Read( this.m_buffer, bytesRead, ( ( numBytes - bytesRead ) | 0 ) );
          if ( n === 0 ) {
            System.IO.__Error.EndOfFile();
          }
          bytesRead = ( bytesRead + n ) | 0;
        } while ( bytesRead < numBytes );
      },
      Read7BitEncodedInt: function () {
        var count = 0;
        var shift = 0;
        var b;
        do {
          if ( shift === 35 ) {
            throw new System.FormatException.$ctor1( "Format_Bad7BitInt32" );
          }

          b = this.ReadByte();
          count = count | ( ( b & 127 ) << shift );
          shift = ( shift + 7 ) | 0;
        } while ( ( b & 128 ) !== 0 );
        return count;
      }
    }
  } );

  // @source BinaryWriter.js

  Bridge.define( "System.IO.BinaryWriter", {
    inherits: [System.IDisposable],
    statics: {
      fields: {
        LargeByteBufferSize: 0,
        Null: null
      },
      ctors: {
        init: function () {
          this.LargeByteBufferSize = 256;
          this.Null = new System.IO.BinaryWriter.ctor();
        }
      }
    },
    fields: {
      OutStream: null,
      _buffer: null,
      _encoding: null,
      _leaveOpen: false,
      _tmpOneCharBuffer: null
    },
    props: {
      BaseStream: {
        get: function () {
          this.Flush();
          return this.OutStream;
        }
      }
    },
    alias: ["Dispose", "System$IDisposable$Dispose"],
    ctors: {
      ctor: function () {
        this.$initialize();
        this.OutStream = System.IO.Stream.Null;
        this._buffer = System.Array.init( 16, 0, System.Byte );
        this._encoding = new System.Text.UTF8Encoding.$ctor2( false, true );
      },
      $ctor1: function ( output ) {
        System.IO.BinaryWriter.$ctor3.call( this, output, new System.Text.UTF8Encoding.$ctor2( false, true ), false );
      },
      $ctor2: function ( output, encoding ) {
        System.IO.BinaryWriter.$ctor3.call( this, output, encoding, false );
      },
      $ctor3: function ( output, encoding, leaveOpen ) {
        this.$initialize();
        if ( output == null ) {
          throw new System.ArgumentNullException.$ctor1( "output" );
        }
        if ( encoding == null ) {
          throw new System.ArgumentNullException.$ctor1( "encoding" );
        }
        if ( !output.CanWrite ) {
          throw new System.ArgumentException.$ctor1( "Argument_StreamNotWritable" );
        }

        this.OutStream = output;
        this._buffer = System.Array.init( 16, 0, System.Byte );
        this._encoding = encoding;
        this._leaveOpen = leaveOpen;
      }
    },
    methods: {
      Close: function () {
        this.Dispose$1( true );
      },
      Dispose$1: function ( disposing ) {
        if ( disposing ) {
          if ( this._leaveOpen ) {
            this.OutStream.Flush();
          } else {
            this.OutStream.Close();
          }
        }
      },
      Dispose: function () {
        this.Dispose$1( true );
      },
      Flush: function () {
        this.OutStream.Flush();
      },
      Seek: function ( offset, origin ) {
        return this.OutStream.Seek( System.Int64( offset ), origin );
      },
      Write: function ( value ) {
        this._buffer[System.Array.index( 0, this._buffer )] = ( value ? 1 : 0 ) & 255;
        this.OutStream.Write( this._buffer, 0, 1 );
      },
      Write$1: function ( value ) {
        this.OutStream.WriteByte( value );
      },
      Write$12: function ( value ) {
        this.OutStream.WriteByte( ( value & 255 ) );
      },
      Write$2: function ( buffer ) {
        if ( buffer == null ) {
          throw new System.ArgumentNullException.$ctor1( "buffer" );
        }
        this.OutStream.Write( buffer, 0, buffer.length );
      },
      Write$3: function ( buffer, index, count ) {
        this.OutStream.Write( buffer, index, count );
      },
      Write$4: function ( ch ) {
        if ( System.Char.isSurrogate( ch ) ) {
          throw new System.ArgumentException.$ctor1( "Arg_SurrogatesNotAllowedAsSingleChar" );
        }

        var numBytes = 0;
        numBytes = this._encoding.GetBytes$3( System.Array.init( [ch], System.Char ), 0, 1, this._buffer, 0 );

        this.OutStream.Write( this._buffer, 0, numBytes );
      },
      Write$5: function ( chars ) {
        if ( chars == null ) {
          throw new System.ArgumentNullException.$ctor1( "chars" );
        }

        var bytes = this._encoding.GetBytes$1( chars, 0, chars.length );
        this.OutStream.Write( bytes, 0, bytes.length );
      },
      Write$6: function ( chars, index, count ) {
        var bytes = this._encoding.GetBytes$1( chars, index, count );
        this.OutStream.Write( bytes, 0, bytes.length );
      },
      Write$8: function ( value ) {
        var TmpValue = System.Int64.clipu64( System.BitConverter.doubleToInt64Bits( value ) );
        this._buffer[System.Array.index( 0, this._buffer )] = System.Int64.clipu8( TmpValue );
        this._buffer[System.Array.index( 1, this._buffer )] = System.Int64.clipu8( TmpValue.shru( 8 ) );
        this._buffer[System.Array.index( 2, this._buffer )] = System.Int64.clipu8( TmpValue.shru( 16 ) );
        this._buffer[System.Array.index( 3, this._buffer )] = System.Int64.clipu8( TmpValue.shru( 24 ) );
        this._buffer[System.Array.index( 4, this._buffer )] = System.Int64.clipu8( TmpValue.shru( 32 ) );
        this._buffer[System.Array.index( 5, this._buffer )] = System.Int64.clipu8( TmpValue.shru( 40 ) );
        this._buffer[System.Array.index( 6, this._buffer )] = System.Int64.clipu8( TmpValue.shru( 48 ) );
        this._buffer[System.Array.index( 7, this._buffer )] = System.Int64.clipu8( TmpValue.shru( 56 ) );
        this.OutStream.Write( this._buffer, 0, 8 );
      },
      Write$7: function ( value ) {
        var buf = value.getBytes();
        this.OutStream.Write( buf, 0, 23 );
      },
      Write$9: function ( value ) {
        this._buffer[System.Array.index( 0, this._buffer )] = value & 255;
        this._buffer[System.Array.index( 1, this._buffer )] = ( value >> 8 ) & 255;
        this.OutStream.Write( this._buffer, 0, 2 );
      },
      Write$15: function ( value ) {
        this._buffer[System.Array.index( 0, this._buffer )] = value & 255;
        this._buffer[System.Array.index( 1, this._buffer )] = ( value >> 8 ) & 255;
        this.OutStream.Write( this._buffer, 0, 2 );
      },
      Write$10: function ( value ) {
        this._buffer[System.Array.index( 0, this._buffer )] = value & 255;
        this._buffer[System.Array.index( 1, this._buffer )] = ( value >> 8 ) & 255;
        this._buffer[System.Array.index( 2, this._buffer )] = ( value >> 16 ) & 255;
        this._buffer[System.Array.index( 3, this._buffer )] = ( value >> 24 ) & 255;
        this.OutStream.Write( this._buffer, 0, 4 );
      },
      Write$16: function ( value ) {
        this._buffer[System.Array.index( 0, this._buffer )] = value & 255;
        this._buffer[System.Array.index( 1, this._buffer )] = ( value >>> 8 ) & 255;
        this._buffer[System.Array.index( 2, this._buffer )] = ( value >>> 16 ) & 255;
        this._buffer[System.Array.index( 3, this._buffer )] = ( value >>> 24 ) & 255;
        this.OutStream.Write( this._buffer, 0, 4 );
      },
      Write$11: function ( value ) {
        this._buffer[System.Array.index( 0, this._buffer )] = System.Int64.clipu8( value );
        this._buffer[System.Array.index( 1, this._buffer )] = System.Int64.clipu8( value.shr( 8 ) );
        this._buffer[System.Array.index( 2, this._buffer )] = System.Int64.clipu8( value.shr( 16 ) );
        this._buffer[System.Array.index( 3, this._buffer )] = System.Int64.clipu8( value.shr( 24 ) );
        this._buffer[System.Array.index( 4, this._buffer )] = System.Int64.clipu8( value.shr( 32 ) );
        this._buffer[System.Array.index( 5, this._buffer )] = System.Int64.clipu8( value.shr( 40 ) );
        this._buffer[System.Array.index( 6, this._buffer )] = System.Int64.clipu8( value.shr( 48 ) );
        this._buffer[System.Array.index( 7, this._buffer )] = System.Int64.clipu8( value.shr( 56 ) );
        this.OutStream.Write( this._buffer, 0, 8 );
      },
      Write$17: function ( value ) {
        this._buffer[System.Array.index( 0, this._buffer )] = System.Int64.clipu8( value );
        this._buffer[System.Array.index( 1, this._buffer )] = System.Int64.clipu8( value.shru( 8 ) );
        this._buffer[System.Array.index( 2, this._buffer )] = System.Int64.clipu8( value.shru( 16 ) );
        this._buffer[System.Array.index( 3, this._buffer )] = System.Int64.clipu8( value.shru( 24 ) );
        this._buffer[System.Array.index( 4, this._buffer )] = System.Int64.clipu8( value.shru( 32 ) );
        this._buffer[System.Array.index( 5, this._buffer )] = System.Int64.clipu8( value.shru( 40 ) );
        this._buffer[System.Array.index( 6, this._buffer )] = System.Int64.clipu8( value.shru( 48 ) );
        this._buffer[System.Array.index( 7, this._buffer )] = System.Int64.clipu8( value.shru( 56 ) );
        this.OutStream.Write( this._buffer, 0, 8 );
      },
      Write$13: function ( value ) {
        var TmpValue = System.BitConverter.toUInt32( System.BitConverter.getBytes$6( value ), 0 );
        this._buffer[System.Array.index( 0, this._buffer )] = TmpValue & 255;
        this._buffer[System.Array.index( 1, this._buffer )] = ( TmpValue >>> 8 ) & 255;
        this._buffer[System.Array.index( 2, this._buffer )] = ( TmpValue >>> 16 ) & 255;
        this._buffer[System.Array.index( 3, this._buffer )] = ( TmpValue >>> 24 ) & 255;
        this.OutStream.Write( this._buffer, 0, 4 );
      },
      Write$14: function ( value ) {
        if ( value == null ) {
          throw new System.ArgumentNullException.$ctor1( "value" );
        }

        var buffer = this._encoding.GetBytes$2( value );
        var len = buffer.length;
        this.Write7BitEncodedInt( len );
        this.OutStream.Write( buffer, 0, len );
      },
      Write7BitEncodedInt: function ( value ) {
        var v = value >>> 0;
        while ( v >= 128 ) {
          this.Write$1( ( ( ( ( v | 128 ) >>> 0 ) ) & 255 ) );
          v = v >>> 7;
        }
        this.Write$1( ( v & 255 ) );
      }
    }
  } );

  // @source Stream.js

  Bridge.define( "System.IO.Stream", {
    inherits: [System.IDisposable],
    statics: {
      fields: {
        _DefaultCopyBufferSize: 0,
        Null: null
      },
      ctors: {
        init: function () {
          this._DefaultCopyBufferSize = 81920;
          this.Null = new System.IO.Stream.NullStream();
        }
      },
      methods: {
        Synchronized: function ( stream ) {
          if ( stream == null ) {
            throw new System.ArgumentNullException.$ctor1( "stream" );
          }

          return stream;
        },
        BlockingEndRead: function ( asyncResult ) {

          return System.IO.Stream.SynchronousAsyncResult.EndRead( asyncResult );
        },
        BlockingEndWrite: function ( asyncResult ) {
          System.IO.Stream.SynchronousAsyncResult.EndWrite( asyncResult );
        }
      }
    },
    props: {
      CanTimeout: {
        get: function () {
          return false;
        }
      },
      ReadTimeout: {
        get: function () {
          throw new System.InvalidOperationException.ctor();
        },
        set: function ( value ) {
          throw new System.InvalidOperationException.ctor();
        }
      },
      WriteTimeout: {
        get: function () {
          throw new System.InvalidOperationException.ctor();
        },
        set: function ( value ) {
          throw new System.InvalidOperationException.ctor();
        }
      }
    },
    alias: ["Dispose", "System$IDisposable$Dispose"],
    methods: {
      CopyTo: function ( destination ) {
        if ( destination == null ) {
          throw new System.ArgumentNullException.$ctor1( "destination" );
        }
        if ( !this.CanRead && !this.CanWrite ) {
          throw new System.Exception();
        }
        if ( !destination.CanRead && !destination.CanWrite ) {
          throw new System.Exception( "destination" );
        }
        if ( !this.CanRead ) {
          throw new System.NotSupportedException.ctor();
        }
        if ( !destination.CanWrite ) {
          throw new System.NotSupportedException.ctor();
        }

        this.InternalCopyTo( destination, System.IO.Stream._DefaultCopyBufferSize );
      },
      CopyTo$1: function ( destination, bufferSize ) {
        if ( destination == null ) {
          throw new System.ArgumentNullException.$ctor1( "destination" );
        }
        if ( bufferSize <= 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "bufferSize" );
        }
        if ( !this.CanRead && !this.CanWrite ) {
          throw new System.Exception();
        }
        if ( !destination.CanRead && !destination.CanWrite ) {
          throw new System.Exception( "destination" );
        }
        if ( !this.CanRead ) {
          throw new System.NotSupportedException.ctor();
        }
        if ( !destination.CanWrite ) {
          throw new System.NotSupportedException.ctor();
        }

        this.InternalCopyTo( destination, bufferSize );
      },
      InternalCopyTo: function ( destination, bufferSize ) {

        var buffer = System.Array.init( bufferSize, 0, System.Byte );
        var read;
        while ( ( ( read = this.Read( buffer, 0, buffer.length ) ) ) !== 0 ) {
          destination.Write( buffer, 0, read );
        }
      },
      Close: function () {
        /* These are correct, but we'd have to fix PipeStream & NetworkStream very carefully.
        Contract.Ensures(CanRead == false);
        Contract.Ensures(CanWrite == false);
        Contract.Ensures(CanSeek == false);
        */

        this.Dispose$1( true );
      },
      Dispose: function () {
        /* These are correct, but we'd have to fix PipeStream & NetworkStream very carefully.
        Contract.Ensures(CanRead == false);
        Contract.Ensures(CanWrite == false);
        Contract.Ensures(CanSeek == false);
        */

        this.Close();
      },
      Dispose$1: function ( disposing ) { },
      BeginRead: function ( buffer, offset, count, callback, state ) {
        return this.BeginReadInternal( buffer, offset, count, callback, state, false );
      },
      BeginReadInternal: function ( buffer, offset, count, callback, state, serializeAsynchronously ) {
        if ( !this.CanRead ) {
          System.IO.__Error.ReadNotSupported();
        }

        return this.BlockingBeginRead( buffer, offset, count, callback, state );
      },
      EndRead: function ( asyncResult ) {
        if ( asyncResult == null ) {
          throw new System.ArgumentNullException.$ctor1( "asyncResult" );
        }

        return System.IO.Stream.BlockingEndRead( asyncResult );
      },
      BeginWrite: function ( buffer, offset, count, callback, state ) {
        return this.BeginWriteInternal( buffer, offset, count, callback, state, false );
      },
      BeginWriteInternal: function ( buffer, offset, count, callback, state, serializeAsynchronously ) {
        if ( !this.CanWrite ) {
          System.IO.__Error.WriteNotSupported();
        }
        return this.BlockingBeginWrite( buffer, offset, count, callback, state );
      },
      EndWrite: function ( asyncResult ) {
        if ( asyncResult == null ) {
          throw new System.ArgumentNullException.$ctor1( "asyncResult" );
        }

        System.IO.Stream.BlockingEndWrite( asyncResult );
      },
      ReadByte: function () {

        var oneByteArray = System.Array.init( 1, 0, System.Byte );
        var r = this.Read( oneByteArray, 0, 1 );
        if ( r === 0 ) {
          return -1;
        }
        return oneByteArray[System.Array.index( 0, oneByteArray )];
      },
      WriteByte: function ( value ) {
        var oneByteArray = System.Array.init( 1, 0, System.Byte );
        oneByteArray[System.Array.index( 0, oneByteArray )] = value;
        this.Write( oneByteArray, 0, 1 );
      },
      BlockingBeginRead: function ( buffer, offset, count, callback, state ) {

        var asyncResult;
        try {
          var numRead = this.Read( buffer, offset, count );
          asyncResult = new System.IO.Stream.SynchronousAsyncResult.$ctor1( numRead, state );
        } catch ( $e1 ) {
          $e1 = System.Exception.create( $e1 );
          var ex;
          if ( Bridge.is( $e1, System.IO.IOException ) ) {
            ex = $e1;
            asyncResult = new System.IO.Stream.SynchronousAsyncResult.ctor( ex, state, false );
          } else {
            throw $e1;
          }
        }

        if ( !Bridge.staticEquals( callback, null ) ) {
          callback( asyncResult );
        }

        return asyncResult;
      },
      BlockingBeginWrite: function ( buffer, offset, count, callback, state ) {

        var asyncResult;
        try {
          this.Write( buffer, offset, count );
          asyncResult = new System.IO.Stream.SynchronousAsyncResult.$ctor2( state );
        } catch ( $e1 ) {
          $e1 = System.Exception.create( $e1 );
          var ex;
          if ( Bridge.is( $e1, System.IO.IOException ) ) {
            ex = $e1;
            asyncResult = new System.IO.Stream.SynchronousAsyncResult.ctor( ex, state, true );
          } else {
            throw $e1;
          }
        }

        if ( !Bridge.staticEquals( callback, null ) ) {
          callback( asyncResult );
        }

        return asyncResult;
      }
    }
  } );

  // @source BufferedStream.js

  Bridge.define( "System.IO.BufferedStream", {
    inherits: [System.IO.Stream],
    statics: {
      fields: {
        _DefaultBufferSize: 0,
        MaxShadowBufferSize: 0
      },
      ctors: {
        init: function () {
          this._DefaultBufferSize = 4096;
          this.MaxShadowBufferSize = 81920;
        }
      }
    },
    fields: {
      _stream: null,
      _buffer: null,
      _bufferSize: 0,
      _readPos: 0,
      _readLen: 0,
      _writePos: 0
    },
    props: {
      UnderlyingStream: {
        get: function () {
          return this._stream;
        }
      },
      BufferSize: {
        get: function () {
          return this._bufferSize;
        }
      },
      CanRead: {
        get: function () {
          return this._stream != null && this._stream.CanRead;
        }
      },
      CanWrite: {
        get: function () {
          return this._stream != null && this._stream.CanWrite;
        }
      },
      CanSeek: {
        get: function () {
          return this._stream != null && this._stream.CanSeek;
        }
      },
      Length: {
        get: function () {
          this.EnsureNotClosed();

          if ( this._writePos > 0 ) {
            this.FlushWrite();
          }

          return this._stream.Length;
        }
      },
      Position: {
        get: function () {
          this.EnsureNotClosed();
          this.EnsureCanSeek();

          return this._stream.Position.add( System.Int64( ( ( ( ( ( this._readPos - this._readLen ) | 0 ) + this._writePos ) | 0 ) ) ) );
        },
        set: function ( value ) {
          if ( value.lt( System.Int64( 0 ) ) ) {
            throw new System.ArgumentOutOfRangeException.$ctor1( "value" );
          }

          this.EnsureNotClosed();
          this.EnsureCanSeek();

          if ( this._writePos > 0 ) {
            this.FlushWrite();
          }

          this._readPos = 0;
          this._readLen = 0;
          this._stream.Seek( value, 0 );
        }
      }
    },
    ctors: {
      ctor: function () {
        this.$initialize();
        System.IO.Stream.ctor.call( this );
      },
      $ctor1: function ( stream ) {
        System.IO.BufferedStream.$ctor2.call( this, stream, System.IO.BufferedStream._DefaultBufferSize );
      },
      $ctor2: function ( stream, bufferSize ) {
        this.$initialize();
        System.IO.Stream.ctor.call( this );

        if ( stream == null ) {
          throw new System.ArgumentNullException.$ctor1( "stream" );
        }

        if ( bufferSize <= 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "bufferSize" );
        }

        this._stream = stream;
        this._bufferSize = bufferSize;


        if ( !this._stream.CanRead && !this._stream.CanWrite ) {
          System.IO.__Error.StreamIsClosed();
        }
      }
    },
    methods: {
      EnsureNotClosed: function () {

        if ( this._stream == null ) {
          System.IO.__Error.StreamIsClosed();
        }
      },
      EnsureCanSeek: function () {


        if ( !this._stream.CanSeek ) {
          System.IO.__Error.SeekNotSupported();
        }
      },
      EnsureCanRead: function () {


        if ( !this._stream.CanRead ) {
          System.IO.__Error.ReadNotSupported();
        }
      },
      EnsureCanWrite: function () {


        if ( !this._stream.CanWrite ) {
          System.IO.__Error.WriteNotSupported();
        }
      },
      EnsureShadowBufferAllocated: function () {


        if ( this._buffer.length !== this._bufferSize || this._bufferSize >= System.IO.BufferedStream.MaxShadowBufferSize ) {
          return;
        }

        var shadowBuffer = System.Array.init( Math.min( ( ( this._bufferSize + this._bufferSize ) | 0 ), System.IO.BufferedStream.MaxShadowBufferSize ), 0, System.Byte );
        System.Array.copy( this._buffer, 0, shadowBuffer, 0, this._writePos );
        this._buffer = shadowBuffer;
      },
      EnsureBufferAllocated: function () {


        if ( this._buffer == null ) {
          this._buffer = System.Array.init( this._bufferSize, 0, System.Byte );
        }
      },
      Dispose$1: function ( disposing ) {

        try {
          if ( disposing && this._stream != null ) {
            try {
              this.Flush();
            } finally {
              this._stream.Close();
            }
          }
        } finally {
          this._stream = null;
          this._buffer = null;

          System.IO.Stream.prototype.Dispose$1.call( this, disposing );
        }
      },
      Flush: function () {

        this.EnsureNotClosed();

        if ( this._writePos > 0 ) {

          this.FlushWrite();
          return;
        }

        if ( this._readPos < this._readLen ) {

          if ( !this._stream.CanSeek ) {
            return;
          }

          this.FlushRead();

          if ( this._stream.CanWrite || Bridge.is( this._stream, System.IO.BufferedStream ) ) {
            this._stream.Flush();
          }

          return;
        }

        if ( this._stream.CanWrite || Bridge.is( this._stream, System.IO.BufferedStream ) ) {
          this._stream.Flush();
        }

        this._writePos = ( this._readPos = ( this._readLen = 0 ) );
      },
      FlushRead: function () {


        if ( ( ( this._readPos - this._readLen ) | 0 ) !== 0 ) {
          this._stream.Seek( System.Int64( this._readPos - this._readLen ), 1 );
        }

        this._readPos = 0;
        this._readLen = 0;
      },
      ClearReadBufferBeforeWrite: function () {



        if ( this._readPos === this._readLen ) {

          this._readPos = ( this._readLen = 0 );
          return;
        }


        if ( !this._stream.CanSeek ) {
          throw new System.NotSupportedException.ctor();
        }

        this.FlushRead();
      },
      FlushWrite: function () {


        this._stream.Write( this._buffer, 0, this._writePos );
        this._writePos = 0;
        this._stream.Flush();
      },
      ReadFromBuffer: function ( array, offset, count ) {

        var readBytes = ( this._readLen - this._readPos ) | 0;

        if ( readBytes === 0 ) {
          return 0;
        }


        if ( readBytes > count ) {
          readBytes = count;
        }

        System.Array.copy( this._buffer, this._readPos, array, offset, readBytes );
        this._readPos = ( this._readPos + readBytes ) | 0;

        return readBytes;
      },
      ReadFromBuffer$1: function ( array, offset, count, error ) {

        try {

          error.v = null;
          return this.ReadFromBuffer( array, offset, count );

        } catch ( ex ) {
          ex = System.Exception.create( ex );
          error.v = ex;
          return 0;
        }
      },
      Read: function ( array, offset, count ) {

        if ( array == null ) {
          throw new System.ArgumentNullException.$ctor1( "array" );
        }
        if ( offset < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "offset" );
        }
        if ( count < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "count" );
        }
        if ( ( ( array.length - offset ) | 0 ) < count ) {
          throw new System.ArgumentException.ctor();
        }

        this.EnsureNotClosed();
        this.EnsureCanRead();

        var bytesFromBuffer = this.ReadFromBuffer( array, offset, count );


        if ( bytesFromBuffer === count ) {
          return bytesFromBuffer;
        }

        var alreadySatisfied = bytesFromBuffer;
        if ( bytesFromBuffer > 0 ) {
          count = ( count - bytesFromBuffer ) | 0;
          offset = ( offset + bytesFromBuffer ) | 0;
        }

        this._readPos = ( this._readLen = 0 );

        if ( this._writePos > 0 ) {
          this.FlushWrite();
        }

        if ( count >= this._bufferSize ) {

          return ( ( this._stream.Read( array, offset, count ) + alreadySatisfied ) | 0 );
        }

        this.EnsureBufferAllocated();
        this._readLen = this._stream.Read( this._buffer, 0, this._bufferSize );

        bytesFromBuffer = this.ReadFromBuffer( array, offset, count );


        return ( ( bytesFromBuffer + alreadySatisfied ) | 0 );
      },
      ReadByte: function () {

        this.EnsureNotClosed();
        this.EnsureCanRead();

        if ( this._readPos === this._readLen ) {

          if ( this._writePos > 0 ) {
            this.FlushWrite();
          }

          this.EnsureBufferAllocated();
          this._readLen = this._stream.Read( this._buffer, 0, this._bufferSize );
          this._readPos = 0;
        }

        if ( this._readPos === this._readLen ) {
          return -1;
        }

        var b = this._buffer[System.Array.index( Bridge.identity( this._readPos, ( ( this._readPos = ( this._readPos + 1 ) | 0 ) ) ), this._buffer )];
        return b;
      },
      WriteToBuffer: function ( array, offset, count ) {

        var bytesToWrite = Math.min( ( ( this._bufferSize - this._writePos ) | 0 ), count.v );

        if ( bytesToWrite <= 0 ) {
          return;
        }

        this.EnsureBufferAllocated();
        System.Array.copy( array, offset.v, this._buffer, this._writePos, bytesToWrite );

        this._writePos = ( this._writePos + bytesToWrite ) | 0;
        count.v = ( count.v - bytesToWrite ) | 0;
        offset.v = ( offset.v + bytesToWrite ) | 0;
      },
      WriteToBuffer$1: function ( array, offset, count, error ) {

        try {

          error.v = null;
          this.WriteToBuffer( array, offset, count );

        } catch ( ex ) {
          ex = System.Exception.create( ex );
          error.v = ex;
        }
      },
      Write: function ( array, offset, count ) {
        offset = { v: offset };
        count = { v: count };

        if ( array == null ) {
          throw new System.ArgumentNullException.$ctor1( "array" );
        }
        if ( offset.v < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "offset" );
        }
        if ( count.v < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "count" );
        }
        if ( ( ( array.length - offset.v ) | 0 ) < count.v ) {
          throw new System.ArgumentException.ctor();
        }

        this.EnsureNotClosed();
        this.EnsureCanWrite();

        if ( this._writePos === 0 ) {
          this.ClearReadBufferBeforeWrite();
        }



        var totalUserBytes;
        var useBuffer;
        totalUserBytes = Bridge.Int.check( this._writePos + count.v, System.Int32 );
        useBuffer = ( Bridge.Int.check( totalUserBytes + count.v, System.Int32 ) < ( Bridge.Int.check( this._bufferSize + this._bufferSize, System.Int32 ) ) );

        if ( useBuffer ) {

          this.WriteToBuffer( array, offset, count );

          if ( this._writePos < this._bufferSize ) {

            return;
          }


          this._stream.Write( this._buffer, 0, this._writePos );
          this._writePos = 0;

          this.WriteToBuffer( array, offset, count );


        } else {

          if ( this._writePos > 0 ) {


            if ( totalUserBytes <= ( ( ( this._bufferSize + this._bufferSize ) | 0 ) ) && totalUserBytes <= System.IO.BufferedStream.MaxShadowBufferSize ) {

              this.EnsureShadowBufferAllocated();
              System.Array.copy( array, offset.v, this._buffer, this._writePos, count.v );
              this._stream.Write( this._buffer, 0, totalUserBytes );
              this._writePos = 0;
              return;
            }

            this._stream.Write( this._buffer, 0, this._writePos );
            this._writePos = 0;
          }

          this._stream.Write( array, offset.v, count.v );
        }
      },
      WriteByte: function ( value ) {

        this.EnsureNotClosed();

        if ( this._writePos === 0 ) {

          this.EnsureCanWrite();
          this.ClearReadBufferBeforeWrite();
          this.EnsureBufferAllocated();
        }

        if ( this._writePos >= ( ( this._bufferSize - 1 ) | 0 ) ) {
          this.FlushWrite();
        }

        this._buffer[System.Array.index( Bridge.identity( this._writePos, ( ( this._writePos = ( this._writePos + 1 ) | 0 ) ) ), this._buffer )] = value;

      },
      Seek: function ( offset, origin ) {

        this.EnsureNotClosed();
        this.EnsureCanSeek();

        if ( this._writePos > 0 ) {

          this.FlushWrite();
          return this._stream.Seek( offset, origin );
        }


        if ( ( ( this._readLen - this._readPos ) | 0 ) > 0 && origin === 1 ) {

          offset = offset.sub( System.Int64( ( ( ( this._readLen - this._readPos ) | 0 ) ) ) );
        }

        var oldPos = this.Position;

        var newPos = this._stream.Seek( offset, origin );


        this._readPos = System.Int64.clip32( newPos.sub( ( oldPos.sub( System.Int64( this._readPos ) ) ) ) );

        if ( 0 <= this._readPos && this._readPos < this._readLen ) {

          this._stream.Seek( System.Int64( this._readLen - this._readPos ), 1 );

        } else {

          this._readPos = ( this._readLen = 0 );
        }

        return newPos;
      },
      SetLength: function ( value ) {

        if ( value.lt( System.Int64( 0 ) ) ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "value" );
        }

        this.EnsureNotClosed();
        this.EnsureCanSeek();
        this.EnsureCanWrite();

        this.Flush();
        this._stream.SetLength( value );
      }
    }
  } );

  // @source IOException.js

  Bridge.define( "System.IO.IOException", {
    inherits: [System.SystemException],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.SystemException.$ctor1.call( this, "I/O error occurred." );
        this.HResult = -2146232800;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2146232800;
      },
      $ctor3: function ( message, hresult ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = hresult;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, innerException );
        this.HResult = -2146232800;
      }
    }
  } );

  // @source EndOfStreamException.js

  Bridge.define( "System.IO.EndOfStreamException", {
    inherits: [System.IO.IOException],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.IO.IOException.$ctor1.call( this, "Arg_EndOfStreamException" );
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.IO.IOException.$ctor1.call( this, message );
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.IO.IOException.$ctor2.call( this, message, innerException );
      }
    }
  } );

  // @source FileMode.js

  Bridge.define( "System.IO.FileMode", {
    $kind: "enum",
    statics: {
      fields: {
        CreateNew: 1,
        Create: 2,
        Open: 3,
        OpenOrCreate: 4,
        Truncate: 5,
        Append: 6
      }
    }
  } );

  // @source FileOptions.js

  Bridge.define( "System.IO.FileOptions", {
    $kind: "enum",
    statics: {
      fields: {
        None: 0,
        WriteThrough: -2147483648,
        Asynchronous: 1073741824,
        RandomAccess: 268435456,
        DeleteOnClose: 67108864,
        SequentialScan: 134217728,
        Encrypted: 16384
      }
    },
    $flags: true
  } );

  // @source FileShare.js

  Bridge.define( "System.IO.FileShare", {
    $kind: "enum",
    statics: {
      fields: {
        None: 0,
        Read: 1,
        Write: 2,
        ReadWrite: 3,
        Delete: 4,
        Inheritable: 16
      }
    },
    $flags: true
  } );

  // @source FileStream.js

  Bridge.define( "System.IO.FileStream", {
    inherits: [System.IO.Stream],
    statics: {
      methods: {
        FromFile: function ( file ) {
          var completer = new System.Threading.Tasks.TaskCompletionSource();
          var fileReader = new FileReader();
          fileReader.onload = function () {
            completer.setResult( new System.IO.FileStream.ctor( fileReader.result, file.name ) );
          };
          fileReader.onerror = function ( e ) {
            completer.setException( new System.SystemException.$ctor1( Bridge.unbox( e ).target.error.As() ) );
          };
          fileReader.readAsArrayBuffer( file );

          return completer.task;
        },
        ReadBytes: function ( path ) {
          if ( Bridge.isNode ) {
            var fs = require( "fs" );
            return Bridge.cast( fs.readFileSync( path ), ArrayBuffer );
          } else {
            var req = new XMLHttpRequest();
            req.open( "GET", path, false );
            req.overrideMimeType( "text/plain; charset=x-user-defined" );
            req.send( null );
            if ( req.status !== 200 ) {
              throw new System.IO.IOException.$ctor1( System.String.concat( "Status of request to " + ( path || "" ) + " returned status: ", req.status ) );
            }

            var text = req.responseText;
            var resultArray = new Uint8Array( text.length );
            System.String.toCharArray( text, 0, text.length ).forEach( function ( v, index, array ) {
              var $t;
              return ( $t = ( v & 255 ) & 255, resultArray[index] = $t, $t );
            } );
            return resultArray.buffer;
          }
        },
        ReadBytesAsync: function ( path ) {
          var tcs = new System.Threading.Tasks.TaskCompletionSource();

          if ( Bridge.isNode ) {
            var fs = require( "fs" );
            fs.readFile( path, Bridge.fn.$build( [function ( err, data ) {
              if ( err != null ) {
                throw new System.IO.IOException.ctor();
              }

              tcs.setResult( data );
            }] ) );
          } else {
            var req = new XMLHttpRequest();
            req.open( "GET", path, true );
            req.overrideMimeType( "text/plain; charset=binary-data" );
            req.send( null );

            req.onreadystatechange = function () {
              if ( req.readyState !== 4 ) {
                return;
              }

              if ( req.status !== 200 ) {
                throw new System.IO.IOException.$ctor1( System.String.concat( "Status of request to " + ( path || "" ) + " returned status: ", req.status ) );
              }

              var text = req.responseText;
              var resultArray = new Uint8Array( text.length );
              System.String.toCharArray( text, 0, text.length ).forEach( function ( v, index, array ) {
                var $t;
                return ( $t = ( v & 255 ) & 255, resultArray[index] = $t, $t );
              } );
              tcs.setResult( resultArray.buffer );
            };
          }

          return tcs.task;
        }
      }
    },
    fields: {
      name: null,
      _buffer: null
    },
    props: {
      CanRead: {
        get: function () {
          return true;
        }
      },
      CanWrite: {
        get: function () {
          return false;
        }
      },
      CanSeek: {
        get: function () {
          return false;
        }
      },
      IsAsync: {
        get: function () {
          return false;
        }
      },
      Name: {
        get: function () {
          return this.name;
        }
      },
      Length: {
        get: function () {
          return System.Int64( this.GetInternalBuffer().byteLength );
        }
      },
      Position: System.Int64( 0 )
    },
    ctors: {
      $ctor1: function ( path, mode ) {
        this.$initialize();
        System.IO.Stream.ctor.call( this );
        this.name = path;
      },
      ctor: function ( buffer, name ) {
        this.$initialize();
        System.IO.Stream.ctor.call( this );
        this._buffer = buffer;
        this.name = name;
      }
    },
    methods: {
      Flush: function () { },
      Seek: function ( offset, origin ) {
        throw new System.NotImplementedException.ctor();
      },
      SetLength: function ( value ) {
        throw new System.NotImplementedException.ctor();
      },
      Write: function ( buffer, offset, count ) {
        throw new System.NotImplementedException.ctor();
      },
      GetInternalBuffer: function () {
        if ( this._buffer == null ) {
          this._buffer = System.IO.FileStream.ReadBytes( this.name );

        }

        return this._buffer;
      },
      EnsureBufferAsync: function () {
        var $step = 0,
          $task1,
          $taskResult1,
          $jumpFromFinally,
          $tcs = new System.Threading.Tasks.TaskCompletionSource(),
          $returnValue,
          $async_e,
          $asyncBody = Bridge.fn.bind( this, function () {
            try {
              for ( ; ; ) {
                $step = System.Array.min( [0, 1, 2, 3], $step );
                switch ( $step ) {
                  case 0: {
                    if ( this._buffer == null ) {
                      $step = 1;
                      continue;
                    }
                    $step = 3;
                    continue;
                  }
                  case 1: {
                    $task1 = System.IO.FileStream.ReadBytesAsync( this.name );
                    $step = 2;
                    if ( $task1.isCompleted() ) {
                      continue;
                    }
                    $task1.continue( $asyncBody );
                    return;
                  }
                  case 2: {
                    $taskResult1 = $task1.getAwaitedResult();
                    this._buffer = $taskResult1;
                    $step = 3;
                    continue;
                  }
                  case 3: {
                    $tcs.setResult( null );
                    return;
                  }
                  default: {
                    $tcs.setResult( null );
                    return;
                  }
                }
              }
            } catch ( $async_e1 ) {
              $async_e = System.Exception.create( $async_e1 );
              $tcs.setException( $async_e );
            }
          }, arguments );

        $asyncBody();
        return $tcs.task;
      },
      Read: function ( buffer, offset, count ) {
        if ( buffer == null ) {
          throw new System.ArgumentNullException.$ctor1( "buffer" );
        }

        if ( offset < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "offset" );
        }

        if ( count < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "count" );
        }

        if ( ( ( ( buffer.length - offset ) | 0 ) ) < count ) {
          throw new System.ArgumentException.ctor();
        }

        var num = this.Length.sub( this.Position );
        if ( num.gt( System.Int64( count ) ) ) {
          num = System.Int64( count );
        }

        if ( num.lte( System.Int64( 0 ) ) ) {
          return 0;
        }

        var byteBuffer = new Uint8Array( this.GetInternalBuffer() );
        if ( num.gt( System.Int64( 8 ) ) ) {
          for ( var n = 0; System.Int64( n ).lt( num ); n = ( n + 1 ) | 0 ) {
            buffer[System.Array.index( ( ( n + offset ) | 0 ), buffer )] = byteBuffer[this.Position.add( System.Int64( n ) )];
          }
        } else {
          var num1 = num;
          while ( true ) {
            var num2 = num1.sub( System.Int64( 1 ) );
            num1 = num2;
            if ( num2.lt( System.Int64( 0 ) ) ) {
              break;
            }
            buffer[System.Array.index( System.Int64.toNumber( System.Int64( offset ).add( num1 ) ), buffer )] = byteBuffer[this.Position.add( num1 )];
          }
        }
        this.Position = this.Position.add( num );
        return System.Int64.clip32( num );
      }
    }
  } );

  // @source Iterator.js

  Bridge.define( "System.IO.Iterator$1", function ( TSource ) {
    return {
      inherits: [System.Collections.Generic.IEnumerable$1( TSource ), System.Collections.Generic.IEnumerator$1( TSource )],
      fields: {
        state: 0,
        current: Bridge.getDefaultValue( TSource )
      },
      props: {
        Current: {
          get: function () {
            return this.current;
          }
        },
        System$Collections$IEnumerator$Current: {
          get: function () {
            return this.Current;
          }
        }
      },
      alias: [
        "Current", ["System$Collections$Generic$IEnumerator$1$" + Bridge.getTypeAlias( TSource ) + "$Current$1", "System$Collections$Generic$IEnumerator$1$Current$1"],
        "Dispose", "System$IDisposable$Dispose",
        "GetEnumerator", ["System$Collections$Generic$IEnumerable$1$" + Bridge.getTypeAlias( TSource ) + "$GetEnumerator", "System$Collections$Generic$IEnumerable$1$GetEnumerator"]
      ],
      ctors: {
        ctor: function () {
          this.$initialize();
        }
      },
      methods: {
        Dispose: function () {
          this.Dispose$1( true );
        },
        Dispose$1: function ( disposing ) {
          this.current = Bridge.getDefaultValue( TSource );
          this.state = -1;
        },
        GetEnumerator: function () {
          if ( this.state === 0 ) {
            this.state = 1;
            return this;
          }

          var duplicate = this.Clone();
          duplicate.state = 1;
          return duplicate;
        },
        System$Collections$IEnumerable$GetEnumerator: function () {
          return this.GetEnumerator();
        },
        System$Collections$IEnumerator$reset: function () {
          throw new System.NotSupportedException.ctor();
        }
      }
    };
  } );

  // @source SeekOrigin.js

  Bridge.define( "System.IO.SeekOrigin", {
    $kind: "enum",
    statics: {
      fields: {
        Begin: 0,
        Current: 1,
        End: 2
      }
    }
  } );

  // @source NullStream.js

  Bridge.define( "System.IO.Stream.NullStream", {
    inherits: [System.IO.Stream],
    $kind: "nested class",
    props: {
      CanRead: {
        get: function () {
          return true;
        }
      },
      CanWrite: {
        get: function () {
          return true;
        }
      },
      CanSeek: {
        get: function () {
          return true;
        }
      },
      Length: {
        get: function () {
          return System.Int64( 0 );
        }
      },
      Position: {
        get: function () {
          return System.Int64( 0 );
        },
        set: function ( value ) { }
      }
    },
    ctors: {
      ctor: function () {
        this.$initialize();
        System.IO.Stream.ctor.call( this );
      }
    },
    methods: {
      Dispose$1: function ( disposing ) { },
      Flush: function () { },
      BeginRead: function ( buffer, offset, count, callback, state ) {
        if ( !this.CanRead ) {
          System.IO.__Error.ReadNotSupported();
        }

        return this.BlockingBeginRead( buffer, offset, count, callback, state );
      },
      EndRead: function ( asyncResult ) {
        if ( asyncResult == null ) {
          throw new System.ArgumentNullException.$ctor1( "asyncResult" );
        }

        return System.IO.Stream.BlockingEndRead( asyncResult );
      },
      BeginWrite: function ( buffer, offset, count, callback, state ) {
        if ( !this.CanWrite ) {
          System.IO.__Error.WriteNotSupported();
        }

        return this.BlockingBeginWrite( buffer, offset, count, callback, state );
      },
      EndWrite: function ( asyncResult ) {
        if ( asyncResult == null ) {
          throw new System.ArgumentNullException.$ctor1( "asyncResult" );
        }

        System.IO.Stream.BlockingEndWrite( asyncResult );
      },
      Read: function ( buffer, offset, count ) {
        return 0;
      },
      ReadByte: function () {
        return -1;
      },
      Write: function ( buffer, offset, count ) { },
      WriteByte: function ( value ) { },
      Seek: function ( offset, origin ) {
        return System.Int64( 0 );
      },
      SetLength: function ( length ) { }
    }
  } );

  // @source SynchronousAsyncResult.js

  Bridge.define( "System.IO.Stream.SynchronousAsyncResult", {
    inherits: [System.IAsyncResult],
    $kind: "nested class",
    statics: {
      methods: {
        EndRead: function ( asyncResult ) {

          var ar = Bridge.as( asyncResult, System.IO.Stream.SynchronousAsyncResult );
          if ( ar == null || ar._isWrite ) {
            System.IO.__Error.WrongAsyncResult();
          }

          if ( ar._endXxxCalled ) {
            System.IO.__Error.EndReadCalledTwice();
          }

          ar._endXxxCalled = true;

          ar.ThrowIfError();
          return ar._bytesRead;
        },
        EndWrite: function ( asyncResult ) {

          var ar = Bridge.as( asyncResult, System.IO.Stream.SynchronousAsyncResult );
          if ( ar == null || !ar._isWrite ) {
            System.IO.__Error.WrongAsyncResult();
          }

          if ( ar._endXxxCalled ) {
            System.IO.__Error.EndWriteCalledTwice();
          }

          ar._endXxxCalled = true;

          ar.ThrowIfError();
        }
      }
    },
    fields: {
      _stateObject: null,
      _isWrite: false,
      _exceptionInfo: null,
      _endXxxCalled: false,
      _bytesRead: 0
    },
    props: {
      IsCompleted: {
        get: function () {
          return true;
        }
      },
      AsyncState: {
        get: function () {
          return this._stateObject;
        }
      },
      CompletedSynchronously: {
        get: function () {
          return true;
        }
      }
    },
    alias: [
      "IsCompleted", "System$IAsyncResult$IsCompleted",
      "AsyncState", "System$IAsyncResult$AsyncState",
      "CompletedSynchronously", "System$IAsyncResult$CompletedSynchronously"
    ],
    ctors: {
      $ctor1: function ( bytesRead, asyncStateObject ) {
        this.$initialize();
        this._bytesRead = bytesRead;
        this._stateObject = asyncStateObject;
      },
      $ctor2: function ( asyncStateObject ) {
        this.$initialize();
        this._stateObject = asyncStateObject;
        this._isWrite = true;
      },
      ctor: function ( ex, asyncStateObject, isWrite ) {
        this.$initialize();
        this._exceptionInfo = ex;
        this._stateObject = asyncStateObject;
        this._isWrite = isWrite;
      }
    },
    methods: {
      ThrowIfError: function () {
        if ( this._exceptionInfo != null ) {
          throw this._exceptionInfo;
        }
      }
    }
  } );

  // @source TextReader.js

  Bridge.define( "System.IO.TextReader", {
    inherits: [System.IDisposable],
    statics: {
      fields: {
        Null: null
      },
      ctors: {
        init: function () {
          this.Null = new System.IO.TextReader.NullTextReader();
        }
      },
      methods: {
        Synchronized: function ( reader ) {
          if ( reader == null ) {
            throw new System.ArgumentNullException.$ctor1( "reader" );
          }

          return reader;
        }
      }
    },
    alias: ["Dispose", "System$IDisposable$Dispose"],
    ctors: {
      ctor: function () {
        this.$initialize();
      }
    },
    methods: {
      Close: function () {
        this.Dispose$1( true );
      },
      Dispose: function () {
        this.Dispose$1( true );
      },
      Dispose$1: function ( disposing ) { },
      Peek: function () {

        return -1;
      },
      Read: function () {
        return -1;
      },
      Read$1: function ( buffer, index, count ) {
        if ( buffer == null ) {
          throw new System.ArgumentNullException.$ctor1( "buffer" );
        }
        if ( index < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "index" );
        }
        if ( count < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "count" );
        }
        if ( ( ( buffer.length - index ) | 0 ) < count ) {
          throw new System.ArgumentException.ctor();
        }

        var n = 0;
        do {
          var ch = this.Read();
          if ( ch === -1 ) {
            break;
          }
          buffer[System.Array.index( ( ( index + Bridge.identity( n, ( ( n = ( n + 1 ) | 0 ) ) ) ) | 0 ), buffer )] = ch & 65535;
        } while ( n < count );
        return n;
      },
      ReadToEndAsync: function () {
        return System.Threading.Tasks.Task.fromResult( this.ReadToEnd(), System.String );
      },
      ReadToEnd: function () {

        var chars = System.Array.init( 4096, 0, System.Char );
        var len;
        var sb = new System.Text.StringBuilder( "", 4096 );
        while ( ( ( len = this.Read$1( chars, 0, chars.length ) ) ) !== 0 ) {
          sb.append( System.String.fromCharArray( chars, 0, len ) );
        }
        return sb.toString();
      },
      ReadBlock: function ( buffer, index, count ) {

        var i, n = 0;
        do {
          n = ( n + ( ( i = this.Read$1( buffer, ( ( index + n ) | 0 ), ( ( count - n ) | 0 ) ) ) ) ) | 0;
        } while ( i > 0 && n < count );
        return n;
      },
      ReadLine: function () {
        var sb = new System.Text.StringBuilder();
        while ( true ) {
          var ch = this.Read();
          if ( ch === -1 ) {
            break;
          }
          if ( ch === 13 || ch === 10 ) {
            if ( ch === 13 && this.Peek() === 10 ) {
              this.Read();
            }
            return sb.toString();
          }
          sb.append( String.fromCharCode( ( ch & 65535 ) ) );
        }
        if ( sb.getLength() > 0 ) {
          return sb.toString();
        }
        return null;
      }
    }
  } );

  // @source StreamReader.js

  Bridge.define( "System.IO.StreamReader", {
    inherits: [System.IO.TextReader],
    statics: {
      fields: {
        DefaultFileStreamBufferSize: 0,
        MinBufferSize: 0,
        Null: null
      },
      props: {
        DefaultBufferSize: {
          get: function () {
            return 1024;
          }
        }
      },
      ctors: {
        init: function () {
          this.DefaultFileStreamBufferSize = 4096;
          this.MinBufferSize = 128;
          this.Null = new System.IO.StreamReader.NullStreamReader();
        }
      }
    },
    fields: {
      stream: null,
      encoding: null,
      byteBuffer: null,
      charBuffer: null,
      charPos: 0,
      charLen: 0,
      byteLen: 0,
      bytePos: 0,
      _maxCharsPerBuffer: 0,
      _detectEncoding: false,
      _isBlocked: false,
      _closable: false
    },
    props: {
      CurrentEncoding: {
        get: function () {
          return this.encoding;
        }
      },
      BaseStream: {
        get: function () {
          return this.stream;
        }
      },
      LeaveOpen: {
        get: function () {
          return !this._closable;
        }
      },
      EndOfStream: {
        get: function () {
          if ( this.stream == null ) {
            System.IO.__Error.ReaderClosed();
          }


          if ( this.charPos < this.charLen ) {
            return false;
          }

          var numRead = this.ReadBuffer();
          return numRead === 0;
        }
      }
    },
    ctors: {
      ctor: function () {
        this.$initialize();
        System.IO.TextReader.ctor.call( this );
      },
      $ctor1: function ( stream ) {
        System.IO.StreamReader.$ctor2.call( this, stream, true );
      },
      $ctor2: function ( stream, detectEncodingFromByteOrderMarks ) {
        System.IO.StreamReader.$ctor6.call( this, stream, System.Text.Encoding.UTF8, detectEncodingFromByteOrderMarks, System.IO.StreamReader.DefaultBufferSize, false );
      },
      $ctor3: function ( stream, encoding ) {
        System.IO.StreamReader.$ctor6.call( this, stream, encoding, true, System.IO.StreamReader.DefaultBufferSize, false );
      },
      $ctor4: function ( stream, encoding, detectEncodingFromByteOrderMarks ) {
        System.IO.StreamReader.$ctor6.call( this, stream, encoding, detectEncodingFromByteOrderMarks, System.IO.StreamReader.DefaultBufferSize, false );
      },
      $ctor5: function ( stream, encoding, detectEncodingFromByteOrderMarks, bufferSize ) {
        System.IO.StreamReader.$ctor6.call( this, stream, encoding, detectEncodingFromByteOrderMarks, bufferSize, false );
      },
      $ctor6: function ( stream, encoding, detectEncodingFromByteOrderMarks, bufferSize, leaveOpen ) {
        this.$initialize();
        System.IO.TextReader.ctor.call( this );
        if ( stream == null || encoding == null ) {
          throw new System.ArgumentNullException.$ctor1( ( stream == null ? "stream" : "encoding" ) );
        }
        if ( !stream.CanRead ) {
          throw new System.ArgumentException.ctor();
        }
        if ( bufferSize <= 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "bufferSize" );
        }

        this.Init$1( stream, encoding, detectEncodingFromByteOrderMarks, bufferSize, leaveOpen );
      },
      $ctor7: function ( path ) {
        System.IO.StreamReader.$ctor8.call( this, path, true );
      },
      $ctor8: function ( path, detectEncodingFromByteOrderMarks ) {
        System.IO.StreamReader.$ctor11.call( this, path, System.Text.Encoding.UTF8, detectEncodingFromByteOrderMarks, System.IO.StreamReader.DefaultBufferSize );
      },
      $ctor9: function ( path, encoding ) {
        System.IO.StreamReader.$ctor11.call( this, path, encoding, true, System.IO.StreamReader.DefaultBufferSize );
      },
      $ctor10: function ( path, encoding, detectEncodingFromByteOrderMarks ) {
        System.IO.StreamReader.$ctor11.call( this, path, encoding, detectEncodingFromByteOrderMarks, System.IO.StreamReader.DefaultBufferSize );
      },
      $ctor11: function ( path, encoding, detectEncodingFromByteOrderMarks, bufferSize ) {
        System.IO.StreamReader.$ctor12.call( this, path, encoding, detectEncodingFromByteOrderMarks, bufferSize, true );
      },
      $ctor12: function ( path, encoding, detectEncodingFromByteOrderMarks, bufferSize, checkHost ) {
        this.$initialize();
        System.IO.TextReader.ctor.call( this );
        if ( path == null || encoding == null ) {
          throw new System.ArgumentNullException.$ctor1( ( path == null ? "path" : "encoding" ) );
        }
        if ( path.length === 0 ) {
          throw new System.ArgumentException.ctor();
        }
        if ( bufferSize <= 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "bufferSize" );
        }

        var stream = new System.IO.FileStream.$ctor1( path, 3 );
        this.Init$1( stream, encoding, detectEncodingFromByteOrderMarks, bufferSize, false );
      }
    },
    methods: {
      Init$1: function ( stream, encoding, detectEncodingFromByteOrderMarks, bufferSize, leaveOpen ) {
        this.stream = stream;
        this.encoding = encoding;
        if ( bufferSize < System.IO.StreamReader.MinBufferSize ) {
          bufferSize = System.IO.StreamReader.MinBufferSize;
        }
        this.byteBuffer = System.Array.init( bufferSize, 0, System.Byte );
        this._maxCharsPerBuffer = encoding.GetMaxCharCount( bufferSize );
        this.charBuffer = System.Array.init( this._maxCharsPerBuffer, 0, System.Char );
        this.byteLen = 0;
        this.bytePos = 0;
        this._detectEncoding = detectEncodingFromByteOrderMarks;
        this._isBlocked = false;
        this._closable = !leaveOpen;
      },
      Init: function ( stream ) {
        this.stream = stream;
        this._closable = true;
      },
      Close: function () {
        this.Dispose$1( true );
      },
      Dispose$1: function ( disposing ) {
        try {
          if ( !this.LeaveOpen && disposing && ( this.stream != null ) ) {
            this.stream.Close();
          }
        } finally {
          if ( !this.LeaveOpen && ( this.stream != null ) ) {
            this.stream = null;
            this.encoding = null;
            this.byteBuffer = null;
            this.charBuffer = null;
            this.charPos = 0;
            this.charLen = 0;
            System.IO.TextReader.prototype.Dispose$1.call( this, disposing );
          }
        }
      },
      DiscardBufferedData: function () {

        this.byteLen = 0;
        this.charLen = 0;
        this.charPos = 0;
        this._isBlocked = false;
      },
      Peek: function () {
        if ( this.stream == null ) {
          System.IO.__Error.ReaderClosed();
        }

        if ( this.charPos === this.charLen ) {
          if ( this._isBlocked || this.ReadBuffer() === 0 ) {
            return -1;
          }
        }
        return this.charBuffer[System.Array.index( this.charPos, this.charBuffer )];
      },
      Read: function () {
        if ( this.stream == null ) {
          System.IO.__Error.ReaderClosed();
        }


        if ( this.charPos === this.charLen ) {
          if ( this.ReadBuffer() === 0 ) {
            return -1;
          }
        }
        var result = this.charBuffer[System.Array.index( this.charPos, this.charBuffer )];
        this.charPos = ( this.charPos + 1 ) | 0;
        return result;
      },
      Read$1: function ( buffer, index, count ) {
        if ( buffer == null ) {
          throw new System.ArgumentNullException.$ctor1( "buffer" );
        }
        if ( index < 0 || count < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( ( index < 0 ? "index" : "count" ) );
        }
        if ( ( ( buffer.length - index ) | 0 ) < count ) {
          throw new System.ArgumentException.ctor();
        }

        if ( this.stream == null ) {
          System.IO.__Error.ReaderClosed();
        }


        var charsRead = 0;
        var readToUserBuffer = { v: false };
        while ( count > 0 ) {
          var n = ( this.charLen - this.charPos ) | 0;
          if ( n === 0 ) {
            n = this.ReadBuffer$1( buffer, ( ( index + charsRead ) | 0 ), count, readToUserBuffer );
          }
          if ( n === 0 ) {
            break;
          }
          if ( n > count ) {
            n = count;
          }
          if ( !readToUserBuffer.v ) {
            System.Array.copy( this.charBuffer, this.charPos, buffer, ( ( ( index + charsRead ) | 0 ) ), n );
            this.charPos = ( this.charPos + n ) | 0;
          }
          charsRead = ( charsRead + n ) | 0;
          count = ( count - n ) | 0;
          if ( this._isBlocked ) {
            break;
          }
        }

        return charsRead;
      },
      ReadToEndAsync: function () {
        var $step = 0,
          $task1,
          $task2,
          $taskResult2,
          $jumpFromFinally,
          $tcs = new System.Threading.Tasks.TaskCompletionSource(),
          $returnValue,
          $async_e,
          $asyncBody = Bridge.fn.bind( this, function () {
            try {
              for ( ; ; ) {
                $step = System.Array.min( [0, 1, 2, 3, 4], $step );
                switch ( $step ) {
                  case 0: {
                    if ( Bridge.is( this.stream, System.IO.FileStream ) ) {
                      $step = 1;
                      continue;
                    }
                    $step = 3;
                    continue;
                  }
                  case 1: {
                    $task1 = this.stream.EnsureBufferAsync();
                    $step = 2;
                    if ( $task1.isCompleted() ) {
                      continue;
                    }
                    $task1.continue( $asyncBody );
                    return;
                  }
                  case 2: {
                    $task1.getAwaitedResult();
                    $step = 3;
                    continue;
                  }
                  case 3: {
                    $task2 = System.IO.TextReader.prototype.ReadToEndAsync.call( this );
                    $step = 4;
                    if ( $task2.isCompleted() ) {
                      continue;
                    }
                    $task2.continue( $asyncBody );
                    return;
                  }
                  case 4: {
                    $taskResult2 = $task2.getAwaitedResult();
                    $tcs.setResult( $taskResult2 );
                    return;
                  }
                  default: {
                    $tcs.setResult( null );
                    return;
                  }
                }
              }
            } catch ( $async_e1 ) {
              $async_e = System.Exception.create( $async_e1 );
              $tcs.setException( $async_e );
            }
          }, arguments );

        $asyncBody();
        return $tcs.task;
      },
      ReadToEnd: function () {
        if ( this.stream == null ) {
          System.IO.__Error.ReaderClosed();
        }

        var sb = new System.Text.StringBuilder( "", ( ( this.charLen - this.charPos ) | 0 ) );
        do {
          sb.append( System.String.fromCharArray( this.charBuffer, this.charPos, ( ( this.charLen - this.charPos ) | 0 ) ) );
          this.charPos = this.charLen;
          this.ReadBuffer();
        } while ( this.charLen > 0 );
        return sb.toString();
      },
      ReadBlock: function ( buffer, index, count ) {
        if ( buffer == null ) {
          throw new System.ArgumentNullException.$ctor1( "buffer" );
        }
        if ( index < 0 || count < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( ( index < 0 ? "index" : "count" ) );
        }
        if ( ( ( buffer.length - index ) | 0 ) < count ) {
          throw new System.ArgumentException.ctor();
        }

        if ( this.stream == null ) {
          System.IO.__Error.ReaderClosed();
        }

        return System.IO.TextReader.prototype.ReadBlock.call( this, buffer, index, count );
      },
      CompressBuffer: function ( n ) {
        System.Array.copy( this.byteBuffer, n, this.byteBuffer, 0, ( ( this.byteLen - n ) | 0 ) );
        this.byteLen = ( this.byteLen - n ) | 0;
      },
      DetectEncoding: function () {
        if ( this.byteLen < 2 ) {
          return;
        }
        this._detectEncoding = false;
        var changedEncoding = false;
        if ( this.byteBuffer[System.Array.index( 0, this.byteBuffer )] === 254 && this.byteBuffer[System.Array.index( 1, this.byteBuffer )] === 255 ) {

          this.encoding = new System.Text.UnicodeEncoding.$ctor1( true, true );
          this.CompressBuffer( 2 );
          changedEncoding = true;
        } else if ( this.byteBuffer[System.Array.index( 0, this.byteBuffer )] === 255 && this.byteBuffer[System.Array.index( 1, this.byteBuffer )] === 254 ) {
          if ( this.byteLen < 4 || this.byteBuffer[System.Array.index( 2, this.byteBuffer )] !== 0 || this.byteBuffer[System.Array.index( 3, this.byteBuffer )] !== 0 ) {
            this.encoding = new System.Text.UnicodeEncoding.$ctor1( false, true );
            this.CompressBuffer( 2 );
            changedEncoding = true;
          } else {
            this.encoding = new System.Text.UTF32Encoding.$ctor1( false, true );
            this.CompressBuffer( 4 );
            changedEncoding = true;
          }
        } else if ( this.byteLen >= 3 && this.byteBuffer[System.Array.index( 0, this.byteBuffer )] === 239 && this.byteBuffer[System.Array.index( 1, this.byteBuffer )] === 187 && this.byteBuffer[System.Array.index( 2, this.byteBuffer )] === 191 ) {
          this.encoding = System.Text.Encoding.UTF8;
          this.CompressBuffer( 3 );
          changedEncoding = true;
        } else if ( this.byteLen >= 4 && this.byteBuffer[System.Array.index( 0, this.byteBuffer )] === 0 && this.byteBuffer[System.Array.index( 1, this.byteBuffer )] === 0 && this.byteBuffer[System.Array.index( 2, this.byteBuffer )] === 254 && this.byteBuffer[System.Array.index( 3, this.byteBuffer )] === 255 ) {
          this.encoding = new System.Text.UTF32Encoding.$ctor1( true, true );
          this.CompressBuffer( 4 );
          changedEncoding = true;
        } else if ( this.byteLen === 2 ) {
          this._detectEncoding = true;
        }

        if ( changedEncoding ) {
          this._maxCharsPerBuffer = this.encoding.GetMaxCharCount( this.byteBuffer.length );
          this.charBuffer = System.Array.init( this._maxCharsPerBuffer, 0, System.Char );
        }
      },
      IsPreamble: function () {
        return false;
      },
      ReadBuffer: function () {
        this.charLen = 0;
        this.charPos = 0;

        this.byteLen = 0;
        do {
          this.byteLen = this.stream.Read( this.byteBuffer, 0, this.byteBuffer.length );

          if ( this.byteLen === 0 ) {
            return this.charLen;
          }

          this._isBlocked = ( this.byteLen < this.byteBuffer.length );

          if ( this.IsPreamble() ) {
            continue;
          }

          if ( this._detectEncoding && this.byteLen >= 2 ) {
            this.DetectEncoding();
          }

          this.charLen = ( this.charLen + ( this.encoding.GetChars$2( this.byteBuffer, 0, this.byteLen, this.charBuffer, this.charLen ) ) ) | 0;
        } while ( this.charLen === 0 );
        return this.charLen;
      },
      ReadBuffer$1: function ( userBuffer, userOffset, desiredChars, readToUserBuffer ) {
        this.charLen = 0;
        this.charPos = 0;

        this.byteLen = 0;

        var charsRead = 0;

        readToUserBuffer.v = desiredChars >= this._maxCharsPerBuffer;

        do {


          this.byteLen = this.stream.Read( this.byteBuffer, 0, this.byteBuffer.length );


          if ( this.byteLen === 0 ) {
            break;
          }

          this._isBlocked = ( this.byteLen < this.byteBuffer.length );

          if ( this.IsPreamble() ) {
            continue;
          }

          if ( this._detectEncoding && this.byteLen >= 2 ) {
            this.DetectEncoding();
            readToUserBuffer.v = desiredChars >= this._maxCharsPerBuffer;
          }

          this.charPos = 0;
          if ( readToUserBuffer.v ) {
            charsRead = ( charsRead + ( this.encoding.GetChars$2( this.byteBuffer, 0, this.byteLen, userBuffer, ( ( userOffset + charsRead ) | 0 ) ) ) ) | 0;
            this.charLen = 0;
          } else {
            charsRead = this.encoding.GetChars$2( this.byteBuffer, 0, this.byteLen, this.charBuffer, charsRead );
            this.charLen = ( this.charLen + charsRead ) | 0;
          }
        } while ( charsRead === 0 );

        this._isBlocked = !!( this._isBlocked & charsRead < desiredChars );

        return charsRead;
      },
      ReadLine: function () {
        if ( this.stream == null ) {
          System.IO.__Error.ReaderClosed();
        }

        if ( this.charPos === this.charLen ) {
          if ( this.ReadBuffer() === 0 ) {
            return null;
          }
        }

        var sb = null;
        do {
          var i = this.charPos;
          do {
            var ch = this.charBuffer[System.Array.index( i, this.charBuffer )];
            if ( ch === 13 || ch === 10 ) {
              var s;
              if ( sb != null ) {
                sb.append( System.String.fromCharArray( this.charBuffer, this.charPos, ( ( i - this.charPos ) | 0 ) ) );
                s = sb.toString();
              } else {
                s = System.String.fromCharArray( this.charBuffer, this.charPos, ( ( i - this.charPos ) | 0 ) );
              }
              this.charPos = ( i + 1 ) | 0;
              if ( ch === 13 && ( this.charPos < this.charLen || this.ReadBuffer() > 0 ) ) {
                if ( this.charBuffer[System.Array.index( this.charPos, this.charBuffer )] === 10 ) {
                  this.charPos = ( this.charPos + 1 ) | 0;
                }
              }
              return s;
            }
            i = ( i + 1 ) | 0;
          } while ( i < this.charLen );
          i = ( this.charLen - this.charPos ) | 0;
          if ( sb == null ) {
            sb = new System.Text.StringBuilder( "", ( ( i + 80 ) | 0 ) );
          }
          sb.append( System.String.fromCharArray( this.charBuffer, this.charPos, i ) );
        } while ( this.ReadBuffer() > 0 );
        return sb.toString();
      }
    }
  } );

  // @source NullStreamReader.js

  Bridge.define( "System.IO.StreamReader.NullStreamReader", {
    inherits: [System.IO.StreamReader],
    $kind: "nested class",
    props: {
      BaseStream: {
        get: function () {
          return System.IO.Stream.Null;
        }
      },
      CurrentEncoding: {
        get: function () {
          return System.Text.Encoding.Unicode;
        }
      }
    },
    ctors: {
      ctor: function () {
        this.$initialize();
        System.IO.StreamReader.ctor.call( this );
        this.Init( System.IO.Stream.Null );
      }
    },
    methods: {
      Dispose$1: function ( disposing ) { },
      Peek: function () {
        return -1;
      },
      Read: function () {
        return -1;
      },
      Read$1: function ( buffer, index, count ) {
        return 0;
      },
      ReadLine: function () {
        return null;
      },
      ReadToEnd: function () {
        return "";
      },
      ReadBuffer: function () {
        return 0;
      }
    }
  } );

  // @source TextWriter.js

  Bridge.define( "System.IO.TextWriter", {
    inherits: [System.IDisposable],
    statics: {
      fields: {
        InitialNewLine: null,
        Null: null
      },
      ctors: {
        init: function () {
          this.InitialNewLine = "\r\n";
          this.Null = new System.IO.TextWriter.NullTextWriter();
        }
      },
      methods: {
        Synchronized: function ( writer ) {
          if ( writer == null ) {
            throw new System.ArgumentNullException.$ctor1( "writer" );
          }

          return writer;
        }
      }
    },
    fields: {
      CoreNewLine: null,
      InternalFormatProvider: null
    },
    props: {
      FormatProvider: {
        get: function () {
          if ( this.InternalFormatProvider == null ) {
            return System.Globalization.CultureInfo.getCurrentCulture();
          } else {
            return this.InternalFormatProvider;
          }
        }
      },
      NewLine: {
        get: function () {
          return System.String.fromCharArray( this.CoreNewLine );
        },
        set: function ( value ) {
          if ( value == null ) {
            value = System.IO.TextWriter.InitialNewLine;
          }
          this.CoreNewLine = System.String.toCharArray( value, 0, value.length );
        }
      }
    },
    alias: ["Dispose", "System$IDisposable$Dispose"],
    ctors: {
      init: function () {
        this.CoreNewLine = System.Array.init( [13, 10], System.Char );
      },
      ctor: function () {
        this.$initialize();
        this.InternalFormatProvider = null;
      },
      $ctor1: function ( formatProvider ) {
        this.$initialize();
        this.InternalFormatProvider = formatProvider;
      }
    },
    methods: {
      Close: function () {
        this.Dispose$1( true );
      },
      Dispose$1: function ( disposing ) { },
      Dispose: function () {
        this.Dispose$1( true );
      },
      Flush: function () { },
      Write$1: function ( value ) { },
      Write$2: function ( buffer ) {
        if ( buffer != null ) {
          this.Write$3( buffer, 0, buffer.length );
        }
      },
      Write$3: function ( buffer, index, count ) {
        if ( buffer == null ) {
          throw new System.ArgumentNullException.$ctor1( "buffer" );
        }
        if ( index < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "index" );
        }
        if ( count < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( "count" );
        }
        if ( ( ( buffer.length - index ) | 0 ) < count ) {
          throw new System.ArgumentException.ctor();
        }

        for ( var i = 0; i < count; i = ( i + 1 ) | 0 ) {
          this.Write$1( buffer[System.Array.index( ( ( index + i ) | 0 ), buffer )] );
        }
      },
      Write: function ( value ) {
        this.Write$10( value ? System.Boolean.trueString : System.Boolean.falseString );
      },
      Write$6: function ( value ) {
        this.Write$10( System.Int32.format( value, "G", this.FormatProvider ) );
      },
      Write$15: function ( value ) {
        this.Write$10( System.UInt32.format( value, "G", this.FormatProvider ) );
      },
      Write$7: function ( value ) {
        this.Write$10( value.format( "G", this.FormatProvider ) );
      },
      Write$16: function ( value ) {
        this.Write$10( value.format( "G", this.FormatProvider ) );
      },
      Write$9: function ( value ) {
        this.Write$10( System.Single.format( value, "G", this.FormatProvider ) );
      },
      Write$5: function ( value ) {
        this.Write$10( System.Double.format( value, "G", this.FormatProvider ) );
      },
      Write$4: function ( value ) {
        this.Write$10( Bridge.Int.format( value, "G", this.FormatProvider ) );
      },
      Write$10: function ( value ) {
        if ( value != null ) {
          this.Write$2( System.String.toCharArray( value, 0, value.length ) );
        }
      },
      Write$8: function ( value ) {
        if ( value != null ) {
          var f = Bridge.as( value, System.IFormattable );
          if ( f != null ) {
            this.Write$10( Bridge.format( f, null, this.FormatProvider ) );
          } else {
            this.Write$10( Bridge.toString( value ) );
          }
        }
      },
      Write$11: function ( format, arg0 ) {
        this.Write$10( System.String.formatProvider( this.FormatProvider, format, [arg0] ) );
      },
      Write$12: function ( format, arg0, arg1 ) {
        this.Write$10( System.String.formatProvider( this.FormatProvider, format, arg0, arg1 ) );
      },
      Write$13: function ( format, arg0, arg1, arg2 ) {
        this.Write$10( System.String.formatProvider( this.FormatProvider, format, arg0, arg1, arg2 ) );
      },
      Write$14: function ( format, arg ) {
        if ( arg === void 0 ) { arg = []; }
        this.Write$10( System.String.formatProvider.apply( System.String, [this.FormatProvider, format].concat( arg ) ) );
      },
      WriteLine: function () {
        this.Write$2( this.CoreNewLine );
      },
      WriteLine$2: function ( value ) {
        this.Write$1( value );
        this.WriteLine();
      },
      WriteLine$3: function ( buffer ) {
        this.Write$2( buffer );
        this.WriteLine();
      },
      WriteLine$4: function ( buffer, index, count ) {
        this.Write$3( buffer, index, count );
        this.WriteLine();
      },
      WriteLine$1: function ( value ) {
        this.Write( value );
        this.WriteLine();
      },
      WriteLine$7: function ( value ) {
        this.Write$6( value );
        this.WriteLine();
      },
      WriteLine$16: function ( value ) {
        this.Write$15( value );
        this.WriteLine();
      },
      WriteLine$8: function ( value ) {
        this.Write$7( value );
        this.WriteLine();
      },
      WriteLine$17: function ( value ) {
        this.Write$16( value );
        this.WriteLine();
      },
      WriteLine$10: function ( value ) {
        this.Write$9( value );
        this.WriteLine();
      },
      WriteLine$6: function ( value ) {
        this.Write$5( value );
        this.WriteLine();
      },
      WriteLine$5: function ( value ) {
        this.Write$4( value );
        this.WriteLine();
      },
      WriteLine$11: function ( value ) {

        if ( value == null ) {
          this.WriteLine();
        } else {
          var vLen = value.length;
          var nlLen = this.CoreNewLine.length;
          var chars = System.Array.init( ( ( vLen + nlLen ) | 0 ), 0, System.Char );
          System.String.copyTo( value, 0, chars, 0, vLen );
          if ( nlLen === 2 ) {
            chars[System.Array.index( vLen, chars )] = this.CoreNewLine[System.Array.index( 0, this.CoreNewLine )];
            chars[System.Array.index( ( ( vLen + 1 ) | 0 ), chars )] = this.CoreNewLine[System.Array.index( 1, this.CoreNewLine )];
          } else if ( nlLen === 1 ) {
            chars[System.Array.index( vLen, chars )] = this.CoreNewLine[System.Array.index( 0, this.CoreNewLine )];
          } else {
            System.Array.copy( this.CoreNewLine, 0, chars, Bridge.Int.mul( vLen, 2 ), Bridge.Int.mul( nlLen, 2 ) );
          }
          this.Write$3( chars, 0, ( ( vLen + nlLen ) | 0 ) );
        }
        /* 
        Write(value);  // We could call Write(String) on StreamWriter...
        WriteLine();
        */
      },
      WriteLine$9: function ( value ) {
        if ( value == null ) {
          this.WriteLine();
        } else {
          var f = Bridge.as( value, System.IFormattable );
          if ( f != null ) {
            this.WriteLine$11( Bridge.format( f, null, this.FormatProvider ) );
          } else {
            this.WriteLine$11( Bridge.toString( value ) );
          }
        }
      },
      WriteLine$12: function ( format, arg0 ) {
        this.WriteLine$11( System.String.formatProvider( this.FormatProvider, format, [arg0] ) );
      },
      WriteLine$13: function ( format, arg0, arg1 ) {
        this.WriteLine$11( System.String.formatProvider( this.FormatProvider, format, arg0, arg1 ) );
      },
      WriteLine$14: function ( format, arg0, arg1, arg2 ) {
        this.WriteLine$11( System.String.formatProvider( this.FormatProvider, format, arg0, arg1, arg2 ) );
      },
      WriteLine$15: function ( format, arg ) {
        if ( arg === void 0 ) { arg = []; }
        this.WriteLine$11( System.String.formatProvider.apply( System.String, [this.FormatProvider, format].concat( arg ) ) );
      }
    }
  } );

  // @source NullTextReader.js

  Bridge.define( "System.IO.TextReader.NullTextReader", {
    inherits: [System.IO.TextReader],
    $kind: "nested class",
    ctors: {
      ctor: function () {
        this.$initialize();
        System.IO.TextReader.ctor.call( this );
      }
    },
    methods: {
      Read$1: function ( buffer, index, count ) {
        return 0;
      },
      ReadLine: function () {
        return null;
      }
    }
  } );

  // @source NullTextWriter.js

  Bridge.define( "System.IO.TextWriter.NullTextWriter", {
    inherits: [System.IO.TextWriter],
    $kind: "nested class",
    props: {
      Encoding: {
        get: function () {
          return System.Text.Encoding.Default;
        }
      }
    },
    ctors: {
      ctor: function () {
        this.$initialize();
        System.IO.TextWriter.$ctor1.call( this, System.Globalization.CultureInfo.invariantCulture );
      }
    },
    methods: {
      Write$3: function ( buffer, index, count ) { },
      Write$10: function ( value ) { },
      WriteLine: function () { },
      WriteLine$11: function ( value ) { },
      WriteLine$9: function ( value ) { }
    }
  } );

  // @source __Error.js

  Bridge.define( "System.IO.__Error", {
    statics: {
      methods: {
        EndOfFile: function () {
          throw new System.IO.EndOfStreamException.$ctor1( "IO.EOF_ReadBeyondEOF" );
        },
        FileNotOpen: function () {
          throw new System.Exception( "ObjectDisposed_FileClosed" );
        },
        StreamIsClosed: function () {
          throw new System.Exception( "ObjectDisposed_StreamClosed" );
        },
        MemoryStreamNotExpandable: function () {
          throw new System.NotSupportedException.$ctor1( "NotSupported_MemStreamNotExpandable" );
        },
        ReaderClosed: function () {
          throw new System.Exception( "ObjectDisposed_ReaderClosed" );
        },
        ReadNotSupported: function () {
          throw new System.NotSupportedException.$ctor1( "NotSupported_UnreadableStream" );
        },
        SeekNotSupported: function () {
          throw new System.NotSupportedException.$ctor1( "NotSupported_UnseekableStream" );
        },
        WrongAsyncResult: function () {
          throw new System.ArgumentException.$ctor1( "Arg_WrongAsyncResult" );
        },
        EndReadCalledTwice: function () {
          throw new System.ArgumentException.$ctor1( "InvalidOperation_EndReadCalledMultiple" );
        },
        EndWriteCalledTwice: function () {
          throw new System.ArgumentException.$ctor1( "InvalidOperation_EndWriteCalledMultiple" );
        },
        WriteNotSupported: function () {
          throw new System.NotSupportedException.$ctor1( "NotSupported_UnwritableStream" );
        },
        WriterClosed: function () {
          throw new System.Exception( "ObjectDisposed_WriterClosed" );
        }
      }
    }
  } );

  // @source AmbiguousMatchException.js

  Bridge.define( "System.Reflection.AmbiguousMatchException", {
    inherits: [System.SystemException],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.SystemException.$ctor1.call( this, "Ambiguous match found." );
        this.HResult = -2147475171;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2147475171;
      },
      $ctor2: function ( message, inner ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, inner );
        this.HResult = -2147475171;
      }
    }
  } );

  // @source Binder.js

  Bridge.define( "System.Reflection.Binder", {
    ctors: {
      ctor: function () {
        this.$initialize();
      }
    }
  } );

  // @source BindingFlags.js

  Bridge.define( "System.Reflection.BindingFlags", {
    $kind: "enum",
    statics: {
      fields: {
        Default: 0,
        IgnoreCase: 1,
        DeclaredOnly: 2,
        Instance: 4,
        Static: 8,
        Public: 16,
        NonPublic: 32,
        FlattenHierarchy: 64,
        InvokeMethod: 256,
        CreateInstance: 512,
        GetField: 1024,
        SetField: 2048,
        GetProperty: 4096,
        SetProperty: 8192,
        PutDispProperty: 16384,
        PutRefDispProperty: 32768,
        ExactBinding: 65536,
        SuppressChangeType: 131072,
        OptionalParamBinding: 262144,
        IgnoreReturn: 16777216,
        DoNotWrapExceptions: 33554432
      }
    },
    $flags: true
  } );

  // @source CallingConventions.js

  Bridge.define( "System.Reflection.CallingConventions", {
    $kind: "enum",
    statics: {
      fields: {
        Standard: 1,
        VarArgs: 2,
        Any: 3,
        HasThis: 32,
        ExplicitThis: 64
      }
    },
    $flags: true
  } );

  // @source ICustomAttributeProvider.js

  Bridge.define( "System.Reflection.ICustomAttributeProvider", {
    $kind: "interface"
  } );

  // @source InvalidFilterCriteriaException.js

  Bridge.define( "System.Reflection.InvalidFilterCriteriaException", {
    inherits: [System.ApplicationException],
    ctors: {
      ctor: function () {
        System.Reflection.InvalidFilterCriteriaException.$ctor1.call( this, "Specified filter criteria was invalid." );
      },
      $ctor1: function ( message ) {
        System.Reflection.InvalidFilterCriteriaException.$ctor2.call( this, message, null );
      },
      $ctor2: function ( message, inner ) {
        this.$initialize();
        System.ApplicationException.$ctor2.call( this, message, inner );
        this.HResult = -2146232831;
      }
    }
  } );

  // @source IReflect.js

  Bridge.define( "System.Reflection.IReflect", {
    $kind: "interface"
  } );

  // @source MemberTypes.js

  Bridge.define( "System.Reflection.MemberTypes", {
    $kind: "enum",
    statics: {
      fields: {
        Constructor: 1,
        Event: 2,
        Field: 4,
        Method: 8,
        Property: 16,
        TypeInfo: 32,
        Custom: 64,
        NestedType: 128,
        All: 191
      }
    },
    $flags: true
  } );

  // @source Module.js

  Bridge.define( "System.Reflection.Module", {
    inherits: [System.Reflection.ICustomAttributeProvider, System.Runtime.Serialization.ISerializable],
    statics: {
      fields: {
        DefaultLookup: 0,
        FilterTypeName: null,
        FilterTypeNameIgnoreCase: null
      },
      ctors: {
        init: function () {
          this.DefaultLookup = 28;
          this.FilterTypeName = System.Reflection.Module.FilterTypeNameImpl;
          this.FilterTypeNameIgnoreCase = System.Reflection.Module.FilterTypeNameIgnoreCaseImpl;
        }
      },
      methods: {
        FilterTypeNameImpl: function ( cls, filterCriteria ) {
          if ( filterCriteria == null || !( Bridge.is( filterCriteria, System.String ) ) ) {
            throw new System.Reflection.InvalidFilterCriteriaException.$ctor1( "A String must be provided for the filter criteria." );
          }

          var str = Bridge.cast( filterCriteria, System.String );

          if ( str.length > 0 && str.charCodeAt( ( ( str.length - 1 ) | 0 ) ) === 42 ) {
            str = str.substr( 0, ( ( str.length - 1 ) | 0 ) );
            return System.String.startsWith( Bridge.Reflection.getTypeName( cls ), str, 4 );
          }

          return System.String.equals( Bridge.Reflection.getTypeName( cls ), str );
        },
        FilterTypeNameIgnoreCaseImpl: function ( cls, filterCriteria ) {
          var $t;
          if ( filterCriteria == null || !( Bridge.is( filterCriteria, System.String ) ) ) {
            throw new System.Reflection.InvalidFilterCriteriaException.$ctor1( "A String must be provided for the filter criteria." );
          }

          var str = Bridge.cast( filterCriteria, System.String );

          if ( str.length > 0 && str.charCodeAt( ( ( str.length - 1 ) | 0 ) ) === 42 ) {
            str = str.substr( 0, ( ( str.length - 1 ) | 0 ) );
            var name = Bridge.Reflection.getTypeName( cls );
            if ( name.length >= str.length ) {
              return ( ( $t = str.length, System.String.compare( name.substr( 0, $t ), str.substr( 0, $t ), 5 ) ) === 0 );
            } else {
              return false;
            }
          }
          return ( System.String.compare( str, Bridge.Reflection.getTypeName( cls ), 5 ) === 0 );
        },
        op_Equality: function ( left, right ) {
          if ( Bridge.referenceEquals( left, right ) ) {
            return true;
          }

          if ( left == null || right == null ) {
            return false;
          }

          return left.equals( right );
        },
        op_Inequality: function ( left, right ) {
          return !( System.Reflection.Module.op_Equality( left, right ) );
        }
      }
    },
    props: {
      Assembly: {
        get: function () {
          throw System.NotImplemented.ByDesign;
        }
      },
      FullyQualifiedName: {
        get: function () {
          throw System.NotImplemented.ByDesign;
        }
      },
      Name: {
        get: function () {
          throw System.NotImplemented.ByDesign;
        }
      },
      MDStreamVersion: {
        get: function () {
          throw System.NotImplemented.ByDesign;
        }
      },
      ModuleVersionId: {
        get: function () {
          throw System.NotImplemented.ByDesign;
        }
      },
      ScopeName: {
        get: function () {
          throw System.NotImplemented.ByDesign;
        }
      },
      MetadataToken: {
        get: function () {
          throw System.NotImplemented.ByDesign;
        }
      }
    },
    alias: [
      "IsDefined", "System$Reflection$ICustomAttributeProvider$IsDefined",
      "GetCustomAttributes", "System$Reflection$ICustomAttributeProvider$GetCustomAttributes",
      "GetCustomAttributes$1", "System$Reflection$ICustomAttributeProvider$GetCustomAttributes$1"
    ],
    ctors: {
      ctor: function () {
        this.$initialize();
      }
    },
    methods: {
      IsResource: function () {
        throw System.NotImplemented.ByDesign;
      },
      IsDefined: function ( attributeType, inherit ) {
        throw System.NotImplemented.ByDesign;
      },
      GetCustomAttributes: function ( inherit ) {
        throw System.NotImplemented.ByDesign;
      },
      GetCustomAttributes$1: function ( attributeType, inherit ) {
        throw System.NotImplemented.ByDesign;
      },
      GetMethod: function ( name ) {
        if ( name == null ) {
          throw new System.ArgumentNullException.$ctor1( "name" );
        }

        return this.GetMethodImpl( name, System.Reflection.Module.DefaultLookup, null, 3, null, null );
      },
      GetMethod$2: function ( name, types ) {
        return this.GetMethod$1( name, System.Reflection.Module.DefaultLookup, null, 3, types, null );
      },
      GetMethod$1: function ( name, bindingAttr, binder, callConvention, types, modifiers ) {
        if ( name == null ) {
          throw new System.ArgumentNullException.$ctor1( "name" );
        }
        if ( types == null ) {
          throw new System.ArgumentNullException.$ctor1( "types" );
        }
        for ( var i = 0; i < types.length; i = ( i + 1 ) | 0 ) {
          if ( types[System.Array.index( i, types )] == null ) {
            throw new System.ArgumentNullException.$ctor1( "types" );
          }
        }
        return this.GetMethodImpl( name, bindingAttr, binder, callConvention, types, modifiers );
      },
      GetMethodImpl: function ( name, bindingAttr, binder, callConvention, types, modifiers ) {
        throw System.NotImplemented.ByDesign;
      },
      GetMethods: function () {
        return this.GetMethods$1( System.Reflection.Module.DefaultLookup );
      },
      GetMethods$1: function ( bindingFlags ) {
        throw System.NotImplemented.ByDesign;
      },
      GetField: function ( name ) {
        return this.GetField$1( name, System.Reflection.Module.DefaultLookup );
      },
      GetField$1: function ( name, bindingAttr ) {
        throw System.NotImplemented.ByDesign;
      },
      GetFields: function () {
        return this.GetFields$1( System.Reflection.Module.DefaultLookup );
      },
      GetFields$1: function ( bindingFlags ) {
        throw System.NotImplemented.ByDesign;
      },
      GetTypes: function () {
        throw System.NotImplemented.ByDesign;
      },
      GetType: function ( className ) {
        return this.GetType$2( className, false, false );
      },
      GetType$1: function ( className, ignoreCase ) {
        return this.GetType$2( className, false, ignoreCase );
      },
      GetType$2: function ( className, throwOnError, ignoreCase ) {
        throw System.NotImplemented.ByDesign;
      },
      FindTypes: function ( filter, filterCriteria ) {
        var c = this.GetTypes();
        var cnt = 0;
        for ( var i = 0; i < c.length; i = ( i + 1 ) | 0 ) {
          if ( !Bridge.staticEquals( filter, null ) && !filter( c[System.Array.index( i, c )], filterCriteria ) ) {
            c[System.Array.index( i, c )] = null;
          } else {
            cnt = ( cnt + 1 ) | 0;
          }
        }
        if ( cnt === c.length ) {
          return c;
        }

        var ret = System.Array.init( cnt, null, System.Type );
        cnt = 0;
        for ( var i1 = 0; i1 < c.length; i1 = ( i1 + 1 ) | 0 ) {
          if ( c[System.Array.index( i1, c )] != null ) {
            ret[System.Array.index( Bridge.identity( cnt, ( ( cnt = ( cnt + 1 ) | 0 ) ) ), ret )] = c[System.Array.index( i1, c )];
          }
        }
        return ret;
      },
      ResolveField: function ( metadataToken ) {
        return this.ResolveField$1( metadataToken, null, null );
      },
      ResolveField$1: function ( metadataToken, genericTypeArguments, genericMethodArguments ) {
        throw System.NotImplemented.ByDesign;
      },
      ResolveMember: function ( metadataToken ) {
        return this.ResolveMember$1( metadataToken, null, null );
      },
      ResolveMember$1: function ( metadataToken, genericTypeArguments, genericMethodArguments ) {
        throw System.NotImplemented.ByDesign;
      },
      ResolveMethod: function ( metadataToken ) {
        return this.ResolveMethod$1( metadataToken, null, null );
      },
      ResolveMethod$1: function ( metadataToken, genericTypeArguments, genericMethodArguments ) {
        throw System.NotImplemented.ByDesign;
      },
      ResolveSignature: function ( metadataToken ) {
        throw System.NotImplemented.ByDesign;
      },
      ResolveString: function ( metadataToken ) {
        throw System.NotImplemented.ByDesign;
      },
      ResolveType: function ( metadataToken ) {
        return this.ResolveType$1( metadataToken, null, null );
      },
      ResolveType$1: function ( metadataToken, genericTypeArguments, genericMethodArguments ) {
        throw System.NotImplemented.ByDesign;
      },
      equals: function ( o ) {
        return Bridge.equals( this, o );
      },
      getHashCode: function () {
        return Bridge.getHashCode( this );
      },
      toString: function () {
        return this.ScopeName;
      }
    }
  } );

  // @source ParameterModifier.js

  Bridge.define( "System.Reflection.ParameterModifier", {
    $kind: "struct",
    statics: {
      methods: {
        getDefaultValue: function () { return new System.Reflection.ParameterModifier(); }
      }
    },
    fields: {
      _byRef: null
    },
    ctors: {
      $ctor1: function ( parameterCount ) {
        this.$initialize();
        if ( parameterCount <= 0 ) {
          throw new System.ArgumentException.$ctor1( "Must specify one or more parameters." );
        }

        this._byRef = System.Array.init( parameterCount, false, System.Boolean );
      },
      ctor: function () {
        this.$initialize();
      }
    },
    methods: {
      getItem: function ( index ) {
        return this._byRef[System.Array.index( index, this._byRef )];
      },
      setItem: function ( index, value ) {
        this._byRef[System.Array.index( index, this._byRef )] = value;
      },
      getHashCode: function () {
        var h = Bridge.addHash( [6723435274, this._byRef] );
        return h;
      },
      equals: function ( o ) {
        if ( !Bridge.is( o, System.Reflection.ParameterModifier ) ) {
          return false;
        }
        return Bridge.equals( this._byRef, o._byRef );
      },
      $clone: function ( to ) {
        var s = to || new System.Reflection.ParameterModifier();
        s._byRef = this._byRef;
        return s;
      }
    }
  } );

  // @source TypeAttributes.js

  Bridge.define( "System.Reflection.TypeAttributes", {
    $kind: "enum",
    statics: {
      fields: {
        VisibilityMask: 7,
        NotPublic: 0,
        Public: 1,
        NestedPublic: 2,
        NestedPrivate: 3,
        NestedFamily: 4,
        NestedAssembly: 5,
        NestedFamANDAssem: 6,
        NestedFamORAssem: 7,
        LayoutMask: 24,
        AutoLayout: 0,
        SequentialLayout: 8,
        ExplicitLayout: 16,
        ClassSemanticsMask: 32,
        Class: 0,
        Interface: 32,
        Abstract: 128,
        Sealed: 256,
        SpecialName: 1024,
        Import: 4096,
        Serializable: 8192,
        WindowsRuntime: 16384,
        StringFormatMask: 196608,
        AnsiClass: 0,
        UnicodeClass: 65536,
        AutoClass: 131072,
        CustomFormatClass: 196608,
        CustomFormatMask: 12582912,
        BeforeFieldInit: 1048576,
        RTSpecialName: 2048,
        HasSecurity: 262144,
        ReservedMask: 264192
      }
    },
    $flags: true
  } );

  // @source RankException.js

  Bridge.define( "System.RankException", {
    inherits: [System.SystemException],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.SystemException.$ctor1.call( this, "Attempted to operate on an array with the incorrect number of dimensions." );
        this.HResult = -2146233065;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2146233065;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, innerException );
        this.HResult = -2146233065;
      }
    }
  } );

  // @source StringComparison.js

  Bridge.define( "System.StringComparison", {
    $kind: "enum",
    statics: {
      fields: {
        CurrentCulture: 0,
        CurrentCultureIgnoreCase: 1,
        InvariantCulture: 2,
        InvariantCultureIgnoreCase: 3,
        Ordinal: 4,
        OrdinalIgnoreCase: 5
      }
    }
  } );

  // @source AggregateException.js

  Bridge.define( "System.AggregateException", {
    inherits: [System.Exception],

    ctor: function ( message, innerExceptions ) {
      this.$initialize();
      this.innerExceptions = new ( System.Collections.ObjectModel.ReadOnlyCollection$1( System.Exception ) )( Bridge.hasValue( innerExceptions ) ? Bridge.toArray( innerExceptions ) : [] );
      System.Exception.ctor.call( this, message || 'One or more errors occurred.', this.innerExceptions.Count > 0 ? this.innerExceptions.getItem( 0 ) : null );
    },

    handle: function ( predicate ) {
      if ( !Bridge.hasValue( predicate ) ) {
        throw new System.ArgumentNullException.$ctor1( "predicate" );
      }

      var count = this.innerExceptions.Count,
        unhandledExceptions = [];

      for ( var i = 0; i < count; i++ ) {
        if ( !predicate( this.innerExceptions.get( i ) ) ) {
          unhandledExceptions.push( this.innerExceptions.getItem( i ) );
        }
      }

      if ( unhandledExceptions.length > 0 ) {
        throw new System.AggregateException( this.Message, unhandledExceptions );
      }
    },

    getBaseException: function () {
      var back = this;
      var backAsAggregate = this;

      while ( backAsAggregate != null && backAsAggregate.innerExceptions.Count === 1 ) {
        back = back.InnerException;
        backAsAggregate = Bridge.as( back, System.AggregateException );
      }

      return back;
    },

    hasTaskCanceledException: function () {
      for ( var i = 0; i < this.innerExceptions.Count; i++ ) {
        var e = this.innerExceptions.getItem( i );
        if ( Bridge.is( e, System.Threading.Tasks.TaskCanceledException ) || ( Bridge.is( e, System.AggregateException ) && e.hasTaskCanceledException() ) ) {
          return true;
        }
      }
      return false;
    },

    flatten: function () {
      // Initialize a collection to contain the flattened exceptions.
      var flattenedExceptions = new ( System.Collections.Generic.List$1( System.Exception ) )();

      // Create a list to remember all aggregates to be flattened, this will be accessed like a FIFO queue
      var exceptionsToFlatten = new ( System.Collections.Generic.List$1( System.AggregateException ) )();
      exceptionsToFlatten.add( this );
      var nDequeueIndex = 0;

      // Continue removing and recursively flattening exceptions, until there are no more.
      while ( exceptionsToFlatten.Count > nDequeueIndex ) {
        // dequeue one from exceptionsToFlatten
        var currentInnerExceptions = exceptionsToFlatten.getItem( nDequeueIndex++ ).innerExceptions,
          count = currentInnerExceptions.Count;

        for ( var i = 0; i < count; i++ ) {
          var currentInnerException = currentInnerExceptions.getItem( i );

          if ( !Bridge.hasValue( currentInnerException ) ) {
            continue;
          }

          var currentInnerAsAggregate = Bridge.as( currentInnerException, System.AggregateException );

          // If this exception is an aggregate, keep it around for later.  Otherwise,
          // simply add it to the list of flattened exceptions to be returned.
          if ( Bridge.hasValue( currentInnerAsAggregate ) ) {
            exceptionsToFlatten.add( currentInnerAsAggregate );
          } else {
            flattenedExceptions.add( currentInnerException );
          }
        }
      }

      return new System.AggregateException( this.Message, flattenedExceptions );
    }
  } );


  // @source PromiseException.js

  Bridge.define( "Bridge.PromiseException", {
    inherits: [System.Exception],

    ctor: function ( args, message, innerException ) {
      this.$initialize();
      this.arguments = System.Array.clone( args );

      if ( message == null ) {
        message = "Promise exception: [";
        message += this.arguments.map( function ( item ) { return item == null ? "null" : item.toString(); } ).join( ", " );
        message += "]";
      }

      System.Exception.ctor.call( this, message, innerException );
    },

    getArguments: function () {
      return this.arguments;
    }
  } );

  // @source ThrowHelper.js

  Bridge.define( "System.ThrowHelper", {
    statics: {
      methods: {
        ThrowArrayTypeMismatchException: function () {
          throw new System.ArrayTypeMismatchException.ctor();
        },
        ThrowInvalidTypeWithPointersNotSupported: function ( targetType ) {
          throw new System.ArgumentException.$ctor1( System.SR.Format( "Cannot use type '{0}'. Only value types without pointers or references are supported.", targetType ) );
        },
        ThrowIndexOutOfRangeException: function () {
          throw new System.IndexOutOfRangeException.ctor();
        },
        ThrowArgumentOutOfRangeException: function () {
          throw new System.ArgumentOutOfRangeException.ctor();
        },
        ThrowArgumentOutOfRangeException$1: function ( argument ) {
          throw new System.ArgumentOutOfRangeException.$ctor1( System.ThrowHelper.GetArgumentName( argument ) );
        },
        ThrowArgumentOutOfRangeException$2: function ( argument, resource ) {
          throw System.ThrowHelper.GetArgumentOutOfRangeException( argument, resource );
        },
        ThrowArgumentOutOfRangeException$3: function ( argument, paramNumber, resource ) {
          throw System.ThrowHelper.GetArgumentOutOfRangeException$1( argument, paramNumber, resource );
        },
        ThrowArgumentException_DestinationTooShort: function () {
          throw new System.ArgumentException.$ctor1( "Destination is too short." );
        },
        ThrowArgumentException_OverlapAlignmentMismatch: function () {
          throw new System.ArgumentException.$ctor1( "Overlapping spans have mismatching alignment." );
        },
        ThrowArgumentOutOfRange_IndexException: function () {
          throw System.ThrowHelper.GetArgumentOutOfRangeException( System.ExceptionArgument.index, System.ExceptionResource.ArgumentOutOfRange_Index );
        },
        ThrowIndexArgumentOutOfRange_NeedNonNegNumException: function () {
          throw System.ThrowHelper.GetArgumentOutOfRangeException( System.ExceptionArgument.index, System.ExceptionResource.ArgumentOutOfRange_NeedNonNegNum );
        },
        ThrowLengthArgumentOutOfRange_ArgumentOutOfRange_NeedNonNegNum: function () {
          throw System.ThrowHelper.GetArgumentOutOfRangeException( System.ExceptionArgument.$length, System.ExceptionResource.ArgumentOutOfRange_NeedNonNegNum );
        },
        ThrowStartIndexArgumentOutOfRange_ArgumentOutOfRange_Index: function () {
          throw System.ThrowHelper.GetArgumentOutOfRangeException( System.ExceptionArgument.startIndex, System.ExceptionResource.ArgumentOutOfRange_Index );
        },
        ThrowCountArgumentOutOfRange_ArgumentOutOfRange_Count: function () {
          throw System.ThrowHelper.GetArgumentOutOfRangeException( System.ExceptionArgument.count, System.ExceptionResource.ArgumentOutOfRange_Count );
        },
        ThrowWrongKeyTypeArgumentException: function ( T, key, targetType ) {
          throw System.ThrowHelper.GetWrongKeyTypeArgumentException( key, targetType );
        },
        ThrowWrongValueTypeArgumentException: function ( T, value, targetType ) {
          throw System.ThrowHelper.GetWrongValueTypeArgumentException( value, targetType );
        },
        GetAddingDuplicateWithKeyArgumentException: function ( key ) {
          return new System.ArgumentException.$ctor1( System.SR.Format( "An item with the same key has already been added. Key: {0}", key ) );
        },
        ThrowAddingDuplicateWithKeyArgumentException: function ( T, key ) {
          throw System.ThrowHelper.GetAddingDuplicateWithKeyArgumentException( key );
        },
        ThrowKeyNotFoundException: function ( T, key ) {
          throw System.ThrowHelper.GetKeyNotFoundException( key );
        },
        ThrowArgumentException: function ( resource ) {
          throw System.ThrowHelper.GetArgumentException( resource );
        },
        ThrowArgumentException$1: function ( resource, argument ) {
          throw System.ThrowHelper.GetArgumentException$1( resource, argument );
        },
        GetArgumentNullException: function ( argument ) {
          return new System.ArgumentNullException.$ctor1( System.ThrowHelper.GetArgumentName( argument ) );
        },
        ThrowArgumentNullException: function ( argument ) {
          throw System.ThrowHelper.GetArgumentNullException( argument );
        },
        ThrowArgumentNullException$2: function ( resource ) {
          throw new System.ArgumentNullException.$ctor1( System.ThrowHelper.GetResourceString( resource ) );
        },
        ThrowArgumentNullException$1: function ( argument, resource ) {
          throw new System.ArgumentNullException.$ctor3( System.ThrowHelper.GetArgumentName( argument ), System.ThrowHelper.GetResourceString( resource ) );
        },
        ThrowInvalidOperationException: function ( resource ) {
          throw System.ThrowHelper.GetInvalidOperationException( resource );
        },
        ThrowInvalidOperationException$1: function ( resource, e ) {
          throw new System.InvalidOperationException.$ctor2( System.ThrowHelper.GetResourceString( resource ), e );
        },
        ThrowInvalidOperationException_OutstandingReferences: function () {
          System.ThrowHelper.ThrowInvalidOperationException( System.ExceptionResource.Memory_OutstandingReferences );
        },
        ThrowSerializationException: function ( resource ) {
          throw new System.Runtime.Serialization.SerializationException.$ctor1( System.ThrowHelper.GetResourceString( resource ) );
        },
        ThrowSecurityException: function ( resource ) {
          throw new System.Security.SecurityException.$ctor1( System.ThrowHelper.GetResourceString( resource ) );
        },
        ThrowRankException: function ( resource ) {
          throw new System.RankException.$ctor1( System.ThrowHelper.GetResourceString( resource ) );
        },
        ThrowNotSupportedException$1: function ( resource ) {
          throw new System.NotSupportedException.$ctor1( System.ThrowHelper.GetResourceString( resource ) );
        },
        ThrowNotSupportedException: function () {
          throw new System.NotSupportedException.ctor();
        },
        ThrowUnauthorizedAccessException: function ( resource ) {
          throw new System.UnauthorizedAccessException.$ctor1( System.ThrowHelper.GetResourceString( resource ) );
        },
        ThrowObjectDisposedException$1: function ( objectName, resource ) {
          throw new System.ObjectDisposedException.$ctor3( objectName, System.ThrowHelper.GetResourceString( resource ) );
        },
        ThrowObjectDisposedException: function ( resource ) {
          throw new System.ObjectDisposedException.$ctor3( null, System.ThrowHelper.GetResourceString( resource ) );
        },
        ThrowObjectDisposedException_MemoryDisposed: function () {
          throw new System.ObjectDisposedException.$ctor3( "OwnedMemory<T>", System.ThrowHelper.GetResourceString( System.ExceptionResource.MemoryDisposed ) );
        },
        ThrowAggregateException: function ( exceptions ) {
          throw new System.AggregateException( null, exceptions );
        },
        ThrowOutOfMemoryException: function () {
          throw new System.OutOfMemoryException.ctor();
        },
        ThrowArgumentException_Argument_InvalidArrayType: function () {
          throw System.ThrowHelper.GetArgumentException( System.ExceptionResource.Argument_InvalidArrayType );
        },
        ThrowInvalidOperationException_InvalidOperation_EnumNotStarted: function () {
          throw System.ThrowHelper.GetInvalidOperationException( System.ExceptionResource.InvalidOperation_EnumNotStarted );
        },
        ThrowInvalidOperationException_InvalidOperation_EnumEnded: function () {
          throw System.ThrowHelper.GetInvalidOperationException( System.ExceptionResource.InvalidOperation_EnumEnded );
        },
        ThrowInvalidOperationException_EnumCurrent: function ( index ) {
          throw System.ThrowHelper.GetInvalidOperationException_EnumCurrent( index );
        },
        ThrowInvalidOperationException_InvalidOperation_EnumFailedVersion: function () {
          throw System.ThrowHelper.GetInvalidOperationException( System.ExceptionResource.InvalidOperation_EnumFailedVersion );
        },
        ThrowInvalidOperationException_InvalidOperation_EnumOpCantHappen: function () {
          throw System.ThrowHelper.GetInvalidOperationException( System.ExceptionResource.InvalidOperation_EnumOpCantHappen );
        },
        ThrowInvalidOperationException_InvalidOperation_NoValue: function () {
          throw System.ThrowHelper.GetInvalidOperationException( System.ExceptionResource.InvalidOperation_NoValue );
        },
        ThrowArraySegmentCtorValidationFailedExceptions: function ( array, offset, count ) {
          throw System.ThrowHelper.GetArraySegmentCtorValidationFailedException( array, offset, count );
        },
        GetArraySegmentCtorValidationFailedException: function ( array, offset, count ) {
          if ( array == null ) {
            return System.ThrowHelper.GetArgumentNullException( System.ExceptionArgument.array );
          }
          if ( offset < 0 ) {
            return System.ThrowHelper.GetArgumentOutOfRangeException( System.ExceptionArgument.offset, System.ExceptionResource.ArgumentOutOfRange_NeedNonNegNum );
          }
          if ( count < 0 ) {
            return System.ThrowHelper.GetArgumentOutOfRangeException( System.ExceptionArgument.count, System.ExceptionResource.ArgumentOutOfRange_NeedNonNegNum );
          }

          return System.ThrowHelper.GetArgumentException( System.ExceptionResource.Argument_InvalidOffLen );
        },
        GetArgumentException: function ( resource ) {
          return new System.ArgumentException.$ctor1( System.ThrowHelper.GetResourceString( resource ) );
        },
        GetArgumentException$1: function ( resource, argument ) {
          return new System.ArgumentException.$ctor3( System.ThrowHelper.GetResourceString( resource ), System.ThrowHelper.GetArgumentName( argument ) );
        },
        GetInvalidOperationException: function ( resource ) {
          return new System.InvalidOperationException.$ctor1( System.ThrowHelper.GetResourceString( resource ) );
        },
        GetWrongKeyTypeArgumentException: function ( key, targetType ) {
          return new System.ArgumentException.$ctor3( System.SR.Format$1( "The value \"{0}\" is not of type \"{1}\" and cannot be used in this generic collection.", key, targetType ), "key" );
        },
        GetWrongValueTypeArgumentException: function ( value, targetType ) {
          return new System.ArgumentException.$ctor3( System.SR.Format$1( "The value \"{0}\" is not of type \"{1}\" and cannot be used in this generic collection.", value, targetType ), "value" );
        },
        GetKeyNotFoundException: function ( key ) {
          return new System.Collections.Generic.KeyNotFoundException.$ctor1( System.SR.Format( "The given key '{0}' was not present in the dictionary.", Bridge.toString( key ) ) );
        },
        GetArgumentOutOfRangeException: function ( argument, resource ) {
          return new System.ArgumentOutOfRangeException.$ctor4( System.ThrowHelper.GetArgumentName( argument ), System.ThrowHelper.GetResourceString( resource ) );
        },
        GetArgumentOutOfRangeException$1: function ( argument, paramNumber, resource ) {
          return new System.ArgumentOutOfRangeException.$ctor4( ( System.ThrowHelper.GetArgumentName( argument ) || "" ) + "[" + ( Bridge.toString( paramNumber ) || "" ) + "]", System.ThrowHelper.GetResourceString( resource ) );
        },
        GetInvalidOperationException_EnumCurrent: function ( index ) {
          return System.ThrowHelper.GetInvalidOperationException( index < 0 ? System.ExceptionResource.InvalidOperation_EnumNotStarted : System.ExceptionResource.InvalidOperation_EnumEnded );
        },
        IfNullAndNullsAreIllegalThenThrow: function ( T, value, argName ) {
          if ( !( Bridge.getDefaultValue( T ) == null ) && value == null ) {
            System.ThrowHelper.ThrowArgumentNullException( argName );
          }
        },
        GetArgumentName: function ( argument ) {

          return System.Enum.toString( System.ExceptionArgument, argument );
        },
        GetResourceString: function ( resource ) {

          return System.SR.GetResourceString( System.Enum.toString( System.ExceptionResource, resource ) );
        },
        ThrowNotSupportedExceptionIfNonNumericType: function ( T ) {
          if ( !Bridge.referenceEquals( T, System.Byte ) && !Bridge.referenceEquals( T, System.SByte ) && !Bridge.referenceEquals( T, System.Int16 ) && !Bridge.referenceEquals( T, System.UInt16 ) && !Bridge.referenceEquals( T, System.Int32 ) && !Bridge.referenceEquals( T, System.UInt32 ) && !Bridge.referenceEquals( T, System.Int64 ) && !Bridge.referenceEquals( T, System.UInt64 ) && !Bridge.referenceEquals( T, System.Single ) && !Bridge.referenceEquals( T, System.Double ) ) {
            throw new System.NotSupportedException.$ctor1( "Specified type is not supported" );
          }
        }
      }
    }
  } );

  // @source TimeoutException.js

  Bridge.define( "System.TimeoutException", {
    inherits: [System.SystemException],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.SystemException.$ctor1.call( this, "The operation has timed out." );
        this.HResult = -2146233083;
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.SystemException.$ctor1.call( this, message );
        this.HResult = -2146233083;
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.SystemException.$ctor2.call( this, message, innerException );
        this.HResult = -2146233083;
      }
    }
  } );

  // @source RegexMatchTimeoutException.js

  Bridge.define( "System.RegexMatchTimeoutException", {
    inherits: [System.TimeoutException],

    _regexInput: "",

    _regexPattern: "",

    _matchTimeout: null,

    config: {
      init: function () {
        this._matchTimeout = System.TimeSpan.fromTicks( -1 );
      }
    },

    ctor: function ( message, innerException, matchTimeout ) {
      this.$initialize();

      if ( arguments.length == 3 ) {
        this._regexInput = message;
        this._regexPattern = innerException;
        this._matchTimeout = matchTimeout;

        message = "The RegEx engine has timed out while trying to match a pattern to an input string. This can occur for many reasons, including very large inputs or excessive backtracking caused by nested quantifiers, back-references and other factors.";
        innerException = null;
      }

      System.TimeoutException.ctor.call( this, message, innerException );
    },

    getPattern: function () {
      return this._regexPattern;
    },

    getInput: function () {
      return this._regexInput;
    },

    getMatchTimeout: function () {
      return this._matchTimeout;
    }
  } );

  // @source TaskCanceledException.js

  Bridge.define( "System.Threading.Tasks.TaskCanceledException", {
    inherits: [System.OperationCanceledException],
    fields: {
      _canceledTask: null
    },
    props: {
      Task: {
        get: function () {
          return this._canceledTask;
        }
      }
    },
    ctors: {
      ctor: function () {
        this.$initialize();
        System.OperationCanceledException.$ctor1.call( this, "A task was canceled." );
      },
      $ctor1: function ( message ) {
        this.$initialize();
        System.OperationCanceledException.$ctor1.call( this, message );
      },
      $ctor2: function ( message, innerException ) {
        this.$initialize();
        System.OperationCanceledException.$ctor2.call( this, message, innerException );
      },
      $ctor3: function ( task ) {
        this.$initialize();
        System.OperationCanceledException.$ctor4.call( this, "A task was canceled.", task != null ? new System.Threading.CancellationToken() : new System.Threading.CancellationToken() );
        this._canceledTask = task;
      }
    }
  } );

  // @source TaskSchedulerException.js

  Bridge.define( "System.Threading.Tasks.TaskSchedulerException", {
    inherits: [System.Exception],
    ctors: {
      ctor: function () {
        this.$initialize();
        System.Exception.ctor.call( this, "An exception was thrown by a TaskScheduler." );
      },
      $ctor2: function ( message ) {
        this.$initialize();
        System.Exception.ctor.call( this, message );
      },
      $ctor1: function ( innerException ) {
        this.$initialize();
        System.Exception.ctor.call( this, "An exception was thrown by a TaskScheduler.", innerException );
      },
      $ctor3: function ( message, innerException ) {
        this.$initialize();
        System.Exception.ctor.call( this, message, innerException );
      }
    }
  } );

  // @source Version.js

  Bridge.define( "System.Version", {
    inherits: function () { return [System.ICloneable, System.IComparable$1( System.Version ), System.IEquatable$1( System.Version )]; },
    statics: {
      fields: {
        ZERO_CHAR_VALUE: 0,
        separatorsArray: 0
      },
      ctors: {
        init: function () {
          this.ZERO_CHAR_VALUE = 48;
          this.separatorsArray = 46;
        }
      },
      methods: {
        appendPositiveNumber: function ( num, sb ) {
          var index = sb.getLength();
          var reminder;

          do {
            reminder = num % 10;
            num = ( Bridge.Int.div( num, 10 ) ) | 0;
            sb.insert( index, String.fromCharCode( ( ( ( ( System.Version.ZERO_CHAR_VALUE + reminder ) | 0 ) ) & 65535 ) ) );
          } while ( num > 0 );
        },
        parse: function ( input ) {
          if ( input == null ) {
            throw new System.ArgumentNullException.$ctor1( "input" );
          }

          var r = { v: new System.Version.VersionResult() };
          r.v.init( "input", true );
          if ( !System.Version.tryParseVersion( input, r ) ) {
            throw r.v.getVersionParseException();
          }
          return r.v.m_parsedVersion;
        },
        tryParse: function ( input, result ) {
          var r = { v: new System.Version.VersionResult() };
          r.v.init( "input", false );
          var b = System.Version.tryParseVersion( input, r );
          result.v = r.v.m_parsedVersion;
          return b;
        },
        tryParseVersion: function ( version, result ) {
          var major = {}, minor = {}, build = {}, revision = {};

          if ( version == null ) {
            result.v.setFailure( System.Version.ParseFailureKind.ArgumentNullException );

            return false;
          }

          var parsedComponents = System.String.split( version, [System.Version.separatorsArray].map( function ( i ) { { return String.fromCharCode( i ); } } ) );
          var parsedComponentsLength = parsedComponents.length;

          if ( ( parsedComponentsLength < 2 ) || ( parsedComponentsLength > 4 ) ) {
            result.v.setFailure( System.Version.ParseFailureKind.ArgumentException );
            return false;
          }

          if ( !System.Version.tryParseComponent( parsedComponents[System.Array.index( 0, parsedComponents )], "version", result, major ) ) {
            return false;
          }

          if ( !System.Version.tryParseComponent( parsedComponents[System.Array.index( 1, parsedComponents )], "version", result, minor ) ) {
            return false;
          }

          parsedComponentsLength = ( parsedComponentsLength - 2 ) | 0;

          if ( parsedComponentsLength > 0 ) {
            if ( !System.Version.tryParseComponent( parsedComponents[System.Array.index( 2, parsedComponents )], "build", result, build ) ) {
              return false;
            }

            parsedComponentsLength = ( parsedComponentsLength - 1 ) | 0;

            if ( parsedComponentsLength > 0 ) {
              if ( !System.Version.tryParseComponent( parsedComponents[System.Array.index( 3, parsedComponents )], "revision", result, revision ) ) {
                return false;
              } else {
                result.v.m_parsedVersion = new System.Version.$ctor3( major.v, minor.v, build.v, revision.v );
              }
            } else {
              result.v.m_parsedVersion = new System.Version.$ctor2( major.v, minor.v, build.v );
            }
          } else {
            result.v.m_parsedVersion = new System.Version.$ctor1( major.v, minor.v );
          }

          return true;
        },
        tryParseComponent: function ( component, componentName, result, parsedComponent ) {
          if ( !System.Int32.tryParse( component, parsedComponent ) ) {
            result.v.setFailure$1( System.Version.ParseFailureKind.FormatException, component );
            return false;
          }

          if ( parsedComponent.v < 0 ) {
            result.v.setFailure$1( System.Version.ParseFailureKind.ArgumentOutOfRangeException, componentName );
            return false;
          }

          return true;
        },
        op_Equality: function ( v1, v2 ) {
          if ( Bridge.referenceEquals( v1, null ) ) {
            return Bridge.referenceEquals( v2, null );
          }

          return v1.equalsT( v2 );
        },
        op_Inequality: function ( v1, v2 ) {
          return !( System.Version.op_Equality( v1, v2 ) );
        },
        op_LessThan: function ( v1, v2 ) {
          if ( v1 == null ) {
            throw new System.ArgumentNullException.$ctor1( "v1" );
          }

          return ( v1.compareTo( v2 ) < 0 );
        },
        op_LessThanOrEqual: function ( v1, v2 ) {
          if ( v1 == null ) {
            throw new System.ArgumentNullException.$ctor1( "v1" );
          }

          return ( v1.compareTo( v2 ) <= 0 );
        },
        op_GreaterThan: function ( v1, v2 ) {
          return ( System.Version.op_LessThan( v2, v1 ) );
        },
        op_GreaterThanOrEqual: function ( v1, v2 ) {
          return ( System.Version.op_LessThanOrEqual( v2, v1 ) );
        }
      }
    },
    fields: {
      _Major: 0,
      _Minor: 0,
      _Build: 0,
      _Revision: 0
    },
    props: {
      Major: {
        get: function () {
          return this._Major;
        }
      },
      Minor: {
        get: function () {
          return this._Minor;
        }
      },
      Build: {
        get: function () {
          return this._Build;
        }
      },
      Revision: {
        get: function () {
          return this._Revision;
        }
      },
      MajorRevision: {
        get: function () {
          return Bridge.Int.sxs( ( this._Revision >> 16 ) & 65535 );
        }
      },
      MinorRevision: {
        get: function () {
          return Bridge.Int.sxs( ( this._Revision & 65535 ) & 65535 );
        }
      }
    },
    alias: [
      "clone", "System$ICloneable$clone",
      "compareTo", ["System$IComparable$1$System$Version$compareTo", "System$IComparable$1$compareTo"],
      "equalsT", "System$IEquatable$1$System$Version$equalsT"
    ],
    ctors: {
      init: function () {
        this._Build = -1;
        this._Revision = -1;
      },
      $ctor3: function ( major, minor, build, revision ) {
        this.$initialize();
        if ( major < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "major", "Cannot be < 0" );
        }

        if ( minor < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "minor", "Cannot be < 0" );
        }

        if ( build < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "build", "Cannot be < 0" );
        }

        if ( revision < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "revision", "Cannot be < 0" );
        }

        this._Major = major;
        this._Minor = minor;
        this._Build = build;
        this._Revision = revision;
      },
      $ctor2: function ( major, minor, build ) {
        this.$initialize();
        if ( major < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "major", "Cannot be < 0" );
        }

        if ( minor < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "minor", "Cannot be < 0" );
        }

        if ( build < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "build", "Cannot be < 0" );
        }

        this._Major = major;
        this._Minor = minor;
        this._Build = build;
      },
      $ctor1: function ( major, minor ) {
        this.$initialize();
        if ( major < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "major", "Cannot be < 0" );
        }

        if ( minor < 0 ) {
          throw new System.ArgumentOutOfRangeException.$ctor4( "minor", "Cannot be < 0" );
        }

        this._Major = major;
        this._Minor = minor;
      },
      $ctor4: function ( version ) {
        this.$initialize();
        var v = System.Version.parse( version );
        this._Major = v.Major;
        this._Minor = v.Minor;
        this._Build = v.Build;
        this._Revision = v.Revision;
      },
      ctor: function () {
        this.$initialize();
        this._Major = 0;
        this._Minor = 0;
      }
    },
    methods: {
      clone: function () {
        var v = new System.Version.ctor();
        v._Major = this._Major;
        v._Minor = this._Minor;
        v._Build = this._Build;
        v._Revision = this._Revision;
        return ( v );
      },
      compareTo$1: function ( version ) {
        if ( version == null ) {
          return 1;
        }

        var v = Bridge.as( version, System.Version );
        if ( System.Version.op_Equality( v, null ) ) {
          throw new System.ArgumentException.$ctor1( "version should be of System.Version type" );
        }

        if ( this._Major !== v._Major ) {
          if ( this._Major > v._Major ) {
            return 1;
          } else {
            return -1;
          }
        }

        if ( this._Minor !== v._Minor ) {
          if ( this._Minor > v._Minor ) {
            return 1;
          } else {
            return -1;
          }
        }

        if ( this._Build !== v._Build ) {
          if ( this._Build > v._Build ) {
            return 1;
          } else {
            return -1;
          }
        }

        if ( this._Revision !== v._Revision ) {
          if ( this._Revision > v._Revision ) {
            return 1;
          } else {
            return -1;
          }
        }

        return 0;
      },
      compareTo: function ( value ) {
        if ( System.Version.op_Equality( value, null ) ) {
          return 1;
        }

        if ( this._Major !== value._Major ) {
          if ( this._Major > value._Major ) {
            return 1;
          } else {
            return -1;
          }
        }

        if ( this._Minor !== value._Minor ) {
          if ( this._Minor > value._Minor ) {
            return 1;
          } else {
            return -1;
          }
        }

        if ( this._Build !== value._Build ) {
          if ( this._Build > value._Build ) {
            return 1;
          } else {
            return -1;
          }
        }

        if ( this._Revision !== value._Revision ) {
          if ( this._Revision > value._Revision ) {
            return 1;
          } else {
            return -1;
          }
        }

        return 0;
      },
      equals: function ( obj ) {
        return this.equalsT( Bridge.as( obj, System.Version ) );
      },
      equalsT: function ( obj ) {
        if ( System.Version.op_Equality( obj, null ) ) {
          return false;
        }

        if ( ( this._Major !== obj._Major ) || ( this._Minor !== obj._Minor ) || ( this._Build !== obj._Build ) || ( this._Revision !== obj._Revision ) ) {
          return false;
        }

        return true;
      },
      getHashCode: function () {

        var accumulator = 0;

        accumulator = accumulator | ( ( this._Major & 15 ) << 28 );
        accumulator = accumulator | ( ( this._Minor & 255 ) << 20 );
        accumulator = accumulator | ( ( this._Build & 255 ) << 12 );
        accumulator = accumulator | ( this._Revision & 4095 );

        return accumulator;
      },
      toString: function () {
        if ( this._Build === -1 ) {
          return ( this.toString$1( 2 ) );
        }
        if ( this._Revision === -1 ) {
          return ( this.toString$1( 3 ) );
        }
        return ( this.toString$1( 4 ) );
      },
      toString$1: function ( fieldCount ) {
        var sb;
        switch ( fieldCount ) {
          case 0:
            return ( "" );
          case 1:
            return ( Bridge.toString( this._Major ) );
          case 2:
            sb = new System.Text.StringBuilder();
            System.Version.appendPositiveNumber( this._Major, sb );
            sb.append( String.fromCharCode( 46 ) );
            System.Version.appendPositiveNumber( this._Minor, sb );
            return sb.toString();
          default:
            if ( this._Build === -1 ) {
              throw new System.ArgumentException.$ctor3( "Build should be > 0 if fieldCount > 2", "fieldCount" );
            }
            if ( fieldCount === 3 ) {
              sb = new System.Text.StringBuilder();
              System.Version.appendPositiveNumber( this._Major, sb );
              sb.append( String.fromCharCode( 46 ) );
              System.Version.appendPositiveNumber( this._Minor, sb );
              sb.append( String.fromCharCode( 46 ) );
              System.Version.appendPositiveNumber( this._Build, sb );
              return sb.toString();
            }
            if ( this._Revision === -1 ) {
              throw new System.ArgumentException.$ctor3( "Revision should be > 0 if fieldCount > 3", "fieldCount" );
            }
            if ( fieldCount === 4 ) {
              sb = new System.Text.StringBuilder();
              System.Version.appendPositiveNumber( this._Major, sb );
              sb.append( String.fromCharCode( 46 ) );
              System.Version.appendPositiveNumber( this._Minor, sb );
              sb.append( String.fromCharCode( 46 ) );
              System.Version.appendPositiveNumber( this._Build, sb );
              sb.append( String.fromCharCode( 46 ) );
              System.Version.appendPositiveNumber( this._Revision, sb );
              return sb.toString();
            }
            throw new System.ArgumentException.$ctor3( "Should be < 5", "fieldCount" );
        }
      }
    }
  } );

  // @source ParseFailureKind.js

  Bridge.define( "System.Version.ParseFailureKind", {
    $kind: "nested enum",
    statics: {
      fields: {
        ArgumentNullException: 0,
        ArgumentException: 1,
        ArgumentOutOfRangeException: 2,
        FormatException: 3
      }
    }
  } );

  // @source VersionResult.js

  Bridge.define( "System.Version.VersionResult", {
    $kind: "nested struct",
    statics: {
      methods: {
        getDefaultValue: function () { return new System.Version.VersionResult(); }
      }
    },
    fields: {
      m_parsedVersion: null,
      m_failure: 0,
      m_exceptionArgument: null,
      m_argumentName: null,
      m_canThrow: false
    },
    ctors: {
      ctor: function () {
        this.$initialize();
      }
    },
    methods: {
      init: function ( argumentName, canThrow ) {
        this.m_canThrow = canThrow;
        this.m_argumentName = argumentName;
      },
      setFailure: function ( failure ) {
        this.setFailure$1( failure, "" );
      },
      setFailure$1: function ( failure, argument ) {
        this.m_failure = failure;
        this.m_exceptionArgument = argument;
        if ( this.m_canThrow ) {
          throw this.getVersionParseException();
        }
      },
      getVersionParseException: function () {
        switch ( this.m_failure ) {
          case System.Version.ParseFailureKind.ArgumentNullException:
            return new System.ArgumentNullException.$ctor1( this.m_argumentName );
          case System.Version.ParseFailureKind.ArgumentException:
            return new System.ArgumentException.$ctor1( "VersionString" );
          case System.Version.ParseFailureKind.ArgumentOutOfRangeException:
            return new System.ArgumentOutOfRangeException.$ctor4( this.m_exceptionArgument, "Cannot be < 0" );
          case System.Version.ParseFailureKind.FormatException:
            try {
              System.Int32.parse( this.m_exceptionArgument );
            } catch ( $e1 ) {
              $e1 = System.Exception.create( $e1 );
              var e;
              if ( Bridge.is( $e1, System.FormatException ) ) {
                e = $e1;
                return e;
              } else if ( Bridge.is( $e1, System.OverflowException ) ) {
                e = $e1;
                return e;
              } else {
                throw $e1;
              }
            }
            return new System.FormatException.$ctor1( "InvalidString" );
          default:
            return new System.ArgumentException.$ctor1( "VersionString" );
        }
      },
      getHashCode: function () {
        var h = Bridge.addHash( [5139482776, this.m_parsedVersion, this.m_failure, this.m_exceptionArgument, this.m_argumentName, this.m_canThrow] );
        return h;
      },
      equals: function ( o ) {
        if ( !Bridge.is( o, System.Version.VersionResult ) ) {
          return false;
        }
        return Bridge.equals( this.m_parsedVersion, o.m_parsedVersion ) && Bridge.equals( this.m_failure, o.m_failure ) && Bridge.equals( this.m_exceptionArgument, o.m_exceptionArgument ) && Bridge.equals( this.m_argumentName, o.m_argumentName ) && Bridge.equals( this.m_canThrow, o.m_canThrow );
      },
      $clone: function ( to ) {
        var s = to || new System.Version.VersionResult();
        s.m_parsedVersion = this.m_parsedVersion;
        s.m_failure = this.m_failure;
        s.m_exceptionArgument = this.m_exceptionArgument;
        s.m_argumentName = this.m_argumentName;
        s.m_canThrow = this.m_canThrow;
        return s;
      }
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
