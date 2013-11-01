Elm.Native.Regex = {};
Elm.Native.Regex.make = function(elm) {
    elm.Native = elm.Native || {};
    elm.Native.Regex = elm.Native.Regex || {};
    if (elm.Native.Regex.values) return elm.Native.Regex.values;
    if ('values' in Elm.Native.Regex)
        return elm.Native.Regex.values = Elm.Native.Regex.values;

    var Maybe = Elm.Maybe.make(elm);
    var JS = Elm.JavaScript.make(elm);

    function escape(str) {
        return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    function caseInsensitive(re) {
        return new RegExp(re.source, 'gi');
    }
    function pattern(raw) {
        return new RegExp(raw, 'g');
    }

    function contains(re, string) {
        return re.test(JS.fromString(string));
    }

    function find(re, string) {
        return findN(Infinity, re, string);
    }
    function findN(n, re, str) {
        var out = [];
        var number = 0;
        var string = JS.fromString(str);
        var result;
        while (number++ < n && (result = re.exec(string))) {
            var i = result.length - 1;
            var subs = new Array(i);
            while (i > 0) {
                var submatch = result[i];
                subs[--i] = submatch === undefined
                    ? Maybe.Nothing
                    : Maybe.Just(JS.toString(submatch));
            }
            out.push({
                _:{},
                match: JS.toString(result[0]),
                submatches: JS.toList(subs),
                index: result.index,
                number: number,
            });
        }
        return JS.toList(out);
    }

    function replace(re, replacer, string) {
        return replaceN(Infinity, re, replacer, string);
    }
    function replaceN(n, re, replacer, string) {
        var count = 0;
        function jsReplacer(match) {
            if (count++ > n) return match;
            var i = arguments.length-3;
            var submatches = new Array(i);
            while (i > 0) {
                var submatch = arguments[i];
                submatches[--i] = submatch === undefined
                    ? Maybe.Nothing
                    : Maybe.Just(JS.toString(submatch));
            }
            return JS.fromString(replacer({
                _:{},
                match:match,
                submatches:JS.toList(submatches),
                index:arguments[i-1],
                number:count
            }));
        }
        return string.replace(re, jsReplacer);
    }

    function split(re, string) {
        return JS.toList(JS.fromString(string).split(re));
    }
    function splitN(n, re, str) {
        var string = JS.fromString(str);
        var result;
        var out = [];
        var start = re.lastIndex;
        while (n--) {
            if (!(result = re.exec(string))) break;
            out.push(string.slice(start, result.index));
            start = re.lastIndex;
        }
        out.push(string.slice(start));
        return JS.toList(out);
    }

    return Elm.Native.Regex.values = {
        pattern: pattern,
        caseInsensitive: caseInsensitive,
        escape: escape,

        contains: F2(contains),
        find: F2(find),
        findN: F3(findN),

        replace: F3(replace),
        replaceN: F4(replaceN),

        split: F2(split),
        splitN: F3(splitN),
    };
};