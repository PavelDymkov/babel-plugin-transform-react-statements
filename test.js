const babel = require("babel-core");
const babelOptions = {
    plugins: [["transform-react-statements", { wrapper: '<span class="x" data-attr="0" />' }]]
};


let input;

input = `
let x = <div>
    <Switch value={x}>
        <Case value={true}>
                <If true={true}>
                    <For in={x}>
                        <Component />
                    </For>
                </If>
        </Case>
    </Switch>
</div>
`;

/*input = `
let x = <div>
    <For each="item" in={items}>
        { this.method(item) }
    </For>
</div>
`;*/

/*input = `
let x = <div>
    <If true={true}>
        text
    </If>
</div>
`;*/

// babel.transform(input, babelOptions).code;
console.log( babel.transform(input, babelOptions).code );
