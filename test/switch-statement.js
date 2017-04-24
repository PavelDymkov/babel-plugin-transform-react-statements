const {assert} = require("chai");
const isEquil = require("./tools");


describe("Switch statement", () => {
    it("should transform simple case", () => {
        let input = `
            <div>
                <Switch value={x}>
                    <Case value={1}>
                        <div> Text 1 </div>
                    </Case>
                    <Case value={"lol"}>
                        <div> Text 2 </div>
                    </Case>
                    <Default>
                        <div> default </div>
                    </Default>
                </Switch>
            </div>;
        `;
        let output = `
            <div>
                {
                    function (value, case1, case2) {
                        switch (value) {
                            case case1:
                                return <div> Text 1 </div>;

                            case case2:
                                return <div> Text 2 </div>;
                        }

                        return <div> default </div>;
                    }.call(this, x, 1, "lol")
                }
            </div>;
        `;

        assert.isTrue(isEquil(input, output));
    });
});
