export function getTagName(t, path) {
    if (!t.isJSXElement(path))
        return null;

    let identifier = path.get("openingElement").get("name");

    return t.isJSXIdentifier(identifier) && identifier.node ? identifier.node.name : null;
};


export function getAttributeName(attribute) {
    return attribute.get("name").node.name;
};


export function getAttributes(t, path) {
    if (!t.isJSXElement(path))
        return [];

    return path.get("openingElement").get("attributes");
};


export function getAttribute(name, t, path) {
    let attributes = getAttributes(t, path);

    for (let i = 0, lim = attributes.length; i < lim; i++) {
        let attribute = attributes[i];

        if (getAttributeName(attribute) == name)
            return attribute;
    }

    return null;
};


export function appendStatements(t, path, statements) {
    let parentPath = path.parentPath;

    if (t.isJSXElement(parentPath)) {
        let openingElement = parentPath.get("openingElement").node;
        let closingElement = parentPath.get("closingElement").node;

        let newParentPath =
            t.jSXElement(
                openingElement,
                closingElement,
                statements,
                closingElement == null
            );

        parentPath.replaceWith(newParentPath);
    }
    else
    if (t.isReturnStatement(parentPath)) {
        let expression = statements[0] && statements[0].expression;
        
        path.replaceWith(t.expressionStatement(expression));
    }
};


export function notNull(value) {
    return value;
};

function log(...args) {
    console.log(">>>>>>>>>>>>>>>>>>>>>");
    console.log(...args);
}
