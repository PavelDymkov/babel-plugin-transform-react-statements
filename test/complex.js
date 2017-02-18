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
                    }.call(_this, 1)
                }
            </div>;
        `;

        assert.isTrue(isEquil(input, output));
    });
});
