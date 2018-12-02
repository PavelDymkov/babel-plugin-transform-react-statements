const { types: t } = require("@babel/core");


export default function getComponentName(node) {
    if (t.isJSXElement(node)) {
        let { name } = node.openingElement.name;

        return name;
    }

    return null;
}
