let type = 'r'
const noColor = true;
const defaultOptions = {
    maxDepth: Infinity,
    lineLength: 40,
    arrayIndex: true,
    hideFunction: false,
};
const f = {
    string: (v) => `§6"${v}"§${type}`,
    number: (v) => `§a${v}§${type}`,
    boolean: (v) => `§s${v}§${type}`,
    'null': () => `§7null§${type}`,
    'undefined': () => `§7undefined§${type}`,
    'class': (v) => `§g[class ${v.name}]§${type}`,
    'function': (v) => `§5§oƒ§${type} §e${v.name ?? ''}()§${type}`,
    'constructor': (v) => `§l§7${v}§${type}`,
    'index': (v) => `§7${v}§${type}`,
    circular: () => `§c[Circular]§${type}`,
    omission: () => `§7...§${type}`
};
class Formatter {
    options;
    stack;
    constructor(options) {
        this.options = { ...defaultOptions, ...options };
        this.stack = [];
    }
    static format(value, options) {
        const formatter = new this(options);
        return formatter.run(value, '', 1);
    }
    run(value, result, step) {
        const nextLine = () => '\n';
        const indent = (s) => ' '.repeat(2 * s);
        const bracket = (b) => step % 2 ? `§e${b}§${type}` : `§d${b}§${type}`;
        const startBracket = (b, line) => result += (line ? nextLine() : '') + bracket(b);
        const endBracket = (b, line) => result += (line ? `${nextLine()}${indent(step - 1)}` : '') + bracket(b);
        if (typeof value === 'string')
            return result += f.string(value);
        if (typeof value === 'number')
            return result += f.number(value);
        if (typeof value === 'boolean')
            return result += f.boolean(value);
        if (typeof value === 'function') {
            if (isClass(value))
                return result += f.class(value);
            else
                return result += f.function(value);
        }
        if (typeof value === 'undefined')
            return result += f.undefined();
        if (value === null)
            return result += f.null();
        if (isObject(value)) {
            for (const _value of this.stack) {
                if (_value === value)
                    return result += f.circular();
            }
            if (value.__proto__)
                result += f.constructor(value.__proto__.constructor.name) + ' ';
            startBracket('{');
            let short;
            if (step >= this.options.maxDepth) {
                result += ` ${f.omission()} `;
                short = true;
            }
            else {
                this.stack.push(value);
                const entries = [];
                for (const key in value) {
                    const v = value[key];
                    if (!this.options.hideFunction && typeof v === 'function')
                        continue;
                    const formatted = this.run(v, '', step + 1);
                    const k = key.match(/\.|\//) ? `"${key}"` : key;
                    entries.push(`${k}: ${formatted}`);
                }
                short = entries.reduce((a, b) => a + b.length, 0) < this.options.lineLength;
                result += short
                    ? (entries.length > 0 ? ` ${entries.join(', ')} ` : '')
                    : `\n${indent(step)}` + entries.join(',\n' + indent(step));
                this.stack.pop();
            }
            endBracket('}', !short);
            return result;
        }
        if (Array.isArray(value)) {
            for (const _value of this.stack) {
                if (_value === value)
                    return result += f.circular();
            }
            result += f.constructor(`Array(${value.length}) `);
            startBracket('[');
            let short;
            if (step >= this.options.maxDepth) {
                result += ` ${f.omission()} `;
                short = true;
            }
            else {
                this.stack.push(value);
                const entries = [];
                for (const index in value) {
                    const v = value[index];
                    if (!this.options.hideFunction && typeof v === 'function')
                        continue;
                    const formatted = this.run(v, '', step + 1);
                    entries.push((this.options.arrayIndex ? `${f.index(index)}: ` : '') + formatted);
                }
                short = entries.reduce((a, b) => a + b.length, 0) < this.options.lineLength;
                result += short
                    ? (entries.length > 0 ? ` ${entries.join(', ')} ` : '')
                    : `\n${indent(step)}` + entries.join(',\n' + indent(step));
                this.stack.pop();
            }
            endBracket(']', !short);
            return result;
        }
        return String(value);
    }
}
function isClass(obj) {
    return obj.toString().startsWith("class ");
}
function isObject(obj) {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}
export function format(value, options) {
    const res = Formatter.format(value, options);
    return noColor ? res.replace(/§./g, '') : res;
}


export const setType = (t) => {
    type = t
}