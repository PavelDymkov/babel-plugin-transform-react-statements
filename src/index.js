import componentStatementPlugin from "./statement/component";
import forStatementPlugin from "./statement/for";
import ifStatementPlugin from "./statement/if";
import switchStatementPlugin from "./statement/switch";


export default (babel, options) => ({
    plugins: [
        [componentStatementPlugin, options.componentStatement],
        [forStatementPlugin, options.forStatement],
        [ifStatementPlugin, options.ifStatement],
        [switchStatementPlugin, options.switchStatement],
    ],
});
