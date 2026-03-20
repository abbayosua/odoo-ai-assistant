/** @odoo-module **/

/**
 * Utils - Utility Functions and Hooks
 * Reusable helper functions and stateful logic
 */

export * from "./helpers";
export * from "./hooks";

export default {
    ...require("./helpers"),
    ...require("./hooks"),
};
