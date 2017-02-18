const {assert} = require("chai");
const isEquil = require("./tools");


describe("If statement", () => {
    it("should transform simple case", () => {
        let input = `
            props => <div>
                <If true={true}>
                    <div> test </div>
                </If>
            </div>;
        `;
        let output = `
            props => <div>
                { true && <div> test </div> }
            </div>;
        `;

        assert.isTrue(isEquil(input, output));
    });

    it ("should transform to milti expressions", () => {
        let input = `
            props => <div>
                <If true={true}>
                    <div> test </div>
                    <div> test </div>
                </If>
            </div>;
        `;
        let output = `
            props => <div>
                { true && <div> test </div> }
                { true && <div> test </div> }
            </div>;
        `;

        assert.isTrue(isEquil(input, output));
    });

    it ("should transform jsx expression", () => {
        let input = `
            props => <div>
                <If true={true}>
                    { x }
                </If>
            </div>;
        `;
        let output = `
            props => <div>{true && x}</div>;
        `;

        assert.isTrue(isEquil(input, output));
    });
});
