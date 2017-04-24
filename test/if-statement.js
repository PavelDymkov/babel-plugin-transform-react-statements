const {assert} = require("chai");
const isEquil = require("./tools");


describe("If statement", () => {
    it("should transform simple case", () => {
        let input = `
            <div>
                <If true={true}>
                    <div> test </div>
                </If>
            </div>;
        `;
        let output = `
            <div>
                { true && <div> test </div> }
            </div>;
        `;

        assert.isTrue(isEquil(input, output));
    });

    it ("should transform to milti expressions", () => {
        let input = `
            <div>
                <If true={true}>
                    <div> test </div>
                    <div> test </div>
                </If>
            </div>;
        `;
        let output = `
            <div>
                { true && <div> test </div> }
                { true && <div> test </div> }
            </div>;
        `;

        assert.isTrue(isEquil(input, output));
    });

    it ("should transform jsx expression", () => {
        let input = `
            <div>
                <If true={true}>
                    { x }
                </If>
            </div>;
        `;
        let output = `
            <div>{true && x}</div>;
        `;

        assert.isTrue(isEquil(input, output));
    });

    it ("should transform", () => {
        let input = `
            <div>
                <div> test </div>

                <If true={true}>
                    <div> test </div>
                </If>
                
                <div> test </div>
            </div>;
        `;
        let output = `
            <div>
                <div> test </div>

                {true && <div> test </div>}
                
                <div> test </div>
            </div>;
        `;

        assert.isTrue(isEquil(input, output));
    });
});
