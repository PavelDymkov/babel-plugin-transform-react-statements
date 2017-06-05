const babel = require("babel-core");
const t = require("babel-types");

const errors = {
    WRAPPER_PARSE_ERROR: "incorrect \"wrapper\" parameter",
    NO_WRAP_ERROR: "elements must be wrapped in React.Component",
    WRAP_INVALID_TYPE: "WRAP_INVALID_TYPE"
};


export function appendExpressions(expressions, path, options) {
    let parentPath = path.parentPath;

    if (parentPath.isJSXElement()) {
        let {node: parentNode} = parentPath;
        let {openingElement, closingElement, children} = parentNode;
        let isSelfClosing = closingElement == null;

        let items = expressions.map(toJSXExpression);
        let index = children.indexOf(path.node);

        children.splice(index, 1, ...items);

        let newParentPath = t.jSXElement(openingElement, closingElement, children, isSelfClosing);

        parentPath.replaceWith(newParentPath);
    } else {
        if (expressions.length == 1) {
            let [expression] = expressions;

            path.replaceWith(t.expressionStatement(expression));
        } else {
            let jsxExpressions = expressions.map(toJSXExpression);
            let wrapper = combineElements(jsxExpressions, options);

            path.replaceWith(wrapper);
        }
    }
}

function toJSXExpression(expression) {
    return t.jSXExpressionContainer(expression);
}


export function combineElements(elements, options) {
    if (options.wrapper == "no-wrap") {
        if (elements.length != 1)
            throw new Error(errors.NO_WRAP_ERROR);
    }

    if (elements.length == 1) return elements[0];

    let wrapper = options.wrapper || "<span />";

    if (wrapper == "array-supported") {
        return t.arrayExpression(elements.reduce(toJSExpression, []));
    }

    try {
        let {ast} = babel.transform(wrapper, { plugins: ["syntax-jsx"] });
        let [expressionStatement] = ast.program.body;

        if (!t.isExpressionStatement(expressionStatement))
            throw null;

        let wrapperASTSource = expressionStatement.expression;

        if (!t.isJSXElement(wrapperASTSource))
            throw null;

        let openingElementSource = wrapperASTSource.openingElement;
        let { name: tagIdentifier } = openingElementSource;

        let openingElement =
            t.jSXOpeningElement(tagIdentifier, openingElementSource.attributes);
        let closingElement = t.jSXClosingElement(tagIdentifier);

        return t.jSXElement(openingElement, closingElement, elements, false);
    } catch (error) {
        throw new Error(errors.WRAPPER_PARSE_ERROR);
    }
}

function toJSExpression(expressions, node) {
    if (t.isJSXExpressionContainer(node)) {
        expressions.push(node.expression);
    }
    else
    if (t.isJSXText(node)) {
        let text = node.value.trim();

        if (text) {
            expressions.push(t.stringLiteral(text));
        }
    }
    else {
        expressions.push(node);
    }

    return expressions;
}


export function wrapElement(element, wrapper) {
    if (t.isJSXElement(element))
        return element;

    let childNode = null;

    if (isValidChildNode(element)) {
        childNode = element;
    } else {
        try {
            childNode = t.jSXExpressionContainer(element);
        } catch (error) {
            throw new Error(errors.WRAP_INVALID_TYPE);
        }
    }

    try {
        let {ast} = babel.transform(wrapper, { plugins: ["syntax-jsx"] });
        let [expressionStatement] = ast.program.body;

        if (!t.isExpressionStatement(expressionStatement))
            throw null;

        let wrapperASTSource = expressionStatement.expression;

        if (!t.isJSXElement(wrapperASTSource))
            throw null;

        let openingElementSource = wrapperASTSource.openingElement;
        let { name: tagIdentifier, attributes } = openingElementSource;

        let openingElement = t.jSXOpeningElement(tagIdentifier, attributes);
        let closingElement = t.jSXClosingElement(tagIdentifier);

        return t.jSXElement(openingElement, closingElement, [childNode], false);
    } catch (error) {
        throw new Error(errors.WRAPPER_PARSE_ERROR);
    }
}

function isValidChildNode(node) {
    return t.isJSXElement(node) ||
        t.isJSXEmptyExpression(node) ||
        t.isJSXExpressionContainer(node) ||
        t.isJSXSpreadChild(node) ||
        t.isJSXText(node);

}


export function getChildren(node) {
    return node.children.reduce(toValidChildNodes, []);
}

function toValidChildNodes(children, node) {
    if (t.isJSXEmptyExpression(node))
        return children;

    if (t.isJSXText(node)) {
        let value = node.value.trim();

        if (value) {
            let textNode = t.jSXText(value);

            children.push(textNode);
        }
    } else {
        children.push(node)
    }

    return children;
}
