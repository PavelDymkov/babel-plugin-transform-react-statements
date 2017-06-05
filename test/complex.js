const {assert} = require("chai");
const isEquil = require("./tools");


describe("Complex tests", () => {
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
            var _this = this;

            props => <div>
                {
                    true && function (value, case1) {
                        switch (value) {
                            case case1:
                                return <div> Text 1 </div>;
                        }
                    }.call(_this, x, 1)
                }
            </div>;
        `;

        assert.isTrue(isEquil(input, output));
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
            var _this = this;

            props => <div>
                {
                    function (value, case1, case2) {
                        switch (value) {
                            case case1:
                                return !false && <div> Text 1 </div>;

                            case case2:
                                return <span>{Array.prototype.map.call(some, function (x, index) {
                                        return <div> {x} </div>;
                                    }, this)}</span>;
                        }
                    }.call(_this, x, 1, 2)
                }
            </div>;
        `;

        assert.isTrue(isEquil(input, output));
    });
});
