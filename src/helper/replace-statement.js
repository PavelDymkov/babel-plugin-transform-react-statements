const { types: t } = require("@babel/core");


export default function replaceStatement(path, replacementExpression) {
    let { parentPath } = path;

    if (parentPath.isJSXElement()) {
        path.replaceWith(t.jsxExpressionContainer(replacementExpression));
    } else {
        path.replaceWith(replacementExpression);
    }
}
