import transformIfStatement from "./if-statement.js";
import transformForStatement from "./for-statement.js";
import transformSwitchStatement from "./switch-statement.js";

import {
    getTagName
} from "./helper.js";


export default function({ types: t }) {
    return {
        inherits: require("babel-plugin-syntax-jsx"),

        visitor: {
            JSXElement(path, state) {
                let tagName = getTagName(t, path);

                switch (tagName) {
                    case "If":
                        log("If")
                        transformIfStatement(t, path, state.opts);
                        break;

                    case "For":
                        log("For")
                        transformForStatement(t, path, state.opts);
                        break;

                    case "Switch":
                        log("Switch")
                        transformSwitchStatement(t, path, state.opts);
                        break;
                }
            }
        }
    };
};

function log(...args) {
    return
    console.log(">>>>>>>>>>>>>>>>>>>>>");
    console.log(...args);
}
