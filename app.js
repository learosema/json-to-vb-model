(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? (module.exports = factory())
    : typeof define === 'function' && define.amd
    ? define(factory)
    : ((global = global || self), (global.App = factory()));
})(this, function () {
  'use strict';

  var config = { indent: 3 },
    vbTypes = {
      undefined: 'Object',
      object: 'Object',
      function: 'Object',
      number: 'Decimal',
      string: 'String',
      datetime: 'DateTime',
    };

  function highlightVB(input) {
    return input
      .replace(
        new RegExp(
          '(Public|Class|End|Property|As|Of|Nothing|String|Integer|Decimal|Double)',
          'g'
        ),
        '<span style="color: #00f">$1</span>'
      )
      .replace(
        new RegExp('(DateTime|Object|List|[a-zA-Z0-9_]*Model)', 'g'),
        '<span style="color: #0ab;">$1</span>'
      );
  }

  function whites(n) {
    return new Array(1 + n).join(' ');
  }

  function indent(code, columns) {
    return code
      .split(/\n/)
      .map(function (el) {
        return whites(columns) + el;
      })
      .join('\n');
  }

  function listOf(x) {
    return 'List (Of ' + x + ')';
  }

  function modelify(x) {
    return x.slice(0, 1).toUpperCase() + x.slice(1) + 'Model';
  }

  function getArrayType(arr) {
    var usedTypes = [],
      vbType,
      hasNull = false;

    if (arr instanceof Array === false) {
      return undefined;
    }
    arr.forEach(function (el) {
      if (el === null || el === undefined) {
        hasNull = true;
      } else {
        if (typeof el === 'string' && isISODate(el)) {
          vbType = vbType.datetime;
        } else {
          vbType =
            el instanceof Array ? listOf(getArrayType(el)) : vbTypes[typeof el];
        }
        if (usedTypes.indexOf(vbType) === -1) {
          usedTypes.push(vbType);
        }
      }
    });
    if (usedTypes.length === 1) {
      return usedTypes[0];
    }
    return 'Object';
  }

  function mergeObjects(arr) {
    var result;
    if (!arr) return;
    arr.forEach(function (el) {
      if (el !== null && typeof el === 'object') {
        if (el instanceof Array) {
          // todo: recursive
        } else {
          result = result || {};
          for (var prop in el) {
            if (el.hasOwnProperty(prop)) {
              result[prop] = el[prop];
            }
          }
        }
      }
    });
    return result;
  }

  function isISODate(x) {
    // checks if x is an ISO 8601 date
    return /^\d{4}\-\d{2}\-\d{2}T\d{2}:\d{2}(:\d{2}|)(Z|\+\d{2}(:\d{2}|)|)$/.test(
      x
    );
  }

  function convertToVB(obj, name, parentName) {
    var output = [],
      classDefs = [],
      types,
      prop,
      tmp;
    name = name || 'Data';
    if (typeof obj === 'object') {
      if (obj instanceof Array) {
        var arrayType = getArrayType(obj);
        if (
          obj !== null &&
          arrayType === 'Object' &&
          typeof (tmp = mergeObjects(obj)) === 'object'
        ) {
          output.push(
            'Public Property ' + name + ' As ' + listOf(modelify(name))
          );
          output.push(convertToVB(tmp, name));
        } else {
          output.push('Public Property ' + name + ' As ' + listOf(arrayType));
        }
      } else {
        if (obj !== null) {
          if (parentName) {
            output.push('Public Property ' + name + ' As ' + modelify(name));
          }
          output.push('Public Class ' + modelify(name));
          for (prop in obj) {
            if (obj.hasOwnProperty(prop)) {
              output.push(
                indent(convertToVB(obj[prop], prop, name), config.indent)
              );
            }
          }
          output.push('End Class');
        } else {
          output.push('Public Property ' + name + ' As ' + 'Object');
        }
      }
    }
    if (typeof obj === 'number') {
      output.push('Public Property ' + name + ' As Decimal');
    }
    if (typeof obj === 'string') {
      output.push(
        'Public Property ' +
          name +
          ' As ' +
          (isISODate(obj) ? 'DateTime' : 'String')
      );
    }
    if (typeof obj === 'undefined' || typeof obj === 'null') {
      output.push('Public Property ' + prop + ' As Object');
    }
    return output.join('\n');
  }

  function run() {
    var editor, tbInput, divOutput;
    tbInput = document.getElementById('tbInput');
    divOutput = document.getElementById('divOutput');
    editor = CodeMirror.fromTextArea(tbInput, {
      mode: 'javascript',
      json: true,
      lineWrapping: true,
      lineNumbers: true,
      viewportMargin: Infinity,
      indentUnit: 4,
      smartIndent: false,
      extraKeys: { 'Ctrl-Space': 'autocomplete' },
    });

    if (
      window.localStorage &&
      window.localStorage.hasOwnProperty('data.json')
    ) {
      editor.doc.setValue(window.localStorage['data.json']);
      try {
        divOutput.innerHTML = highlightVB(
          convertToVB(JSON.parse(window.localStorage['data.json']))
        ).replace(/\n/g, '<br>');
      } catch (ex) {}
    }

    editor.on('change', function (cm) {
      var ex;
      try {
        var o = JSON.parse(cm.doc.getValue());
        divOutput.innerHTML = highlightVB(convertToVB(o)).replace(
          /\n/g,
          '<br>'
        );
        if (window.localStorage) {
          window.localStorage['data.json'] = cm.doc.getValue();
        }
      } catch (ex) {
        /* console.log(ex.message); */
      }
    });
  }

  var App = {
    getArrayType: getArrayType,
    mergeObjects: mergeObjects,
    run: run,
  };

  return App;
});
