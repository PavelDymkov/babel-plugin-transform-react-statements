const babel = require("babel-core");
const babelOptions = {
    plugins: [["transform-react-statements", { wrapper: '<span class="x" data-attr="0" />' }]]
};


let input = `
let x = <If true={1}>
    <div> foo </div>
    <div> bar </div>
</If>
`;

// babel.transform(input, babelOptions).code;
console.log( babel.transform(input, babelOptions).code );
