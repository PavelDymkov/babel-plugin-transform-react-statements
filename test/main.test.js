const { assert } = require("chai");
const createPluginTestHelper = require("babel-plugin-test-helper");

const isEqual = createPluginTestHelper(require("../"), null, "preset");


describe("Complex preset test:", () => {
    it("should transform switch-statement in if-statement", () => {
        let input = `
            props => <div>
                <If true={true}>
                    <Switch value={x}>
                        <Case value={1}>
                            <div> Text 1 </div>
                        </Case>
                    </Switch>
                </If>
            </div>;
        `;
        let output = `
            props => <div>
                {true && function (value, case1) {
                    switch (value) {
                        case case1: return <div> Text 1 </div>;
                    }
                }.call(this, x, 1)}
            </div>;
        `;

        assert.isTrue(isEqual(input, output));
    });
    it("should transform if-statement and for-statement in switch-statement", () => {
        let input = `
            props => <div>
                <Switch value={x}>
                    <Case value={1}>
                        <If false={false}>
                            <div> Text 1 </div>
                        </If>
                    </Case>
                    <Case value={2}>
                        <For each="x" in={some}>
                            <div> {x} </div>
                        </For>
                    </Case>
                </Switch>
            </div>;
        `;
        let output = `
            props => <div>
                {function (value, case1, case2) {
                    switch (value) {
                        case case1: return !false && <div> Text 1 </div>;
                        case case2: return Array.prototype.map.call(some, function (x, index) {
                            return <div> {x} </div>;
                        }, this);
                    }
                }.call(this, x, 1, 2)}
            </div>;
        `;

        assert.isTrue(isEqual(input, output));
    });

    it("should test preset options", () => {
        let input = `
            props => <div>
                <Component>{"1"}</Component>
                <CustomComponent>{"1"}</CustomComponent>

                <For each="item" in={array}>{item}</For>
                <CustomFor each="item" in={array}>{item}</CustomFor>

                <If true={1}>{"1"}</If>
                <CustomIf true={1}>{"1"}</CustomIf>

                <Switch value={x}>
                    <Case value={1}>{"1"}</Case>
                    <Default>{"1"}</Default>
                </Switch>
                <CustomSwitch value={x}>
                    <CustomCase value={1}>{"1"}</CustomCase>
                    <CustomDefault>{"1"}</CustomDefault>
                </CustomSwitch>
            </div>;
        `;
        let output = `
            props => <div>
                <Component>{"1"}</Component>
                {props => "1"}

                <For each="item" in={array}>{item}</For>
                {Array.prototype.map.call(array, function (item, index) {
                    return item;
                }, this)}

                <If true={1}>{"1"}</If>
                {1 && "1"}

                <Switch value={x}>
                    <Case value={1}>{"1"}</Case>
                    <Default>{"1"}</Default>
                </Switch>
                {function (value, case1) {
                    switch (value) {
                        case case1: return "1";
                    }

                    return "1";
                }.call(this, x, 1)}
            </div>;
        `;
        let presetOptions = {
            componentStatement: { statementName: "CustomComponent" },
            forStatement: { statementName: "CustomFor" },
            ifStatement: { statementName: "CustomIf" },
            switchStatement: {
                statementName: "CustomSwitch",
                caseAlias: "CustomCase",
                defaultCaseAlias: "CustomDefault",
            },
        };

        assert.isTrue(isEqual(input, output, presetOptions));
    });
});
