import { fn } from "@storybook/test";
import { Button } from "./Button";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
export default {
    title: "Example/Button",
    tags: ["autodocs"],
    render: (args) => Button(args),
    argTypes: {
        backgroundColor: { control: "color" },
        size: {
            control: { type: "select" },
            options: ["small", "medium", "large"],
        },
    },
    args: { onClick: fn() },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary = {
    args: {
        primary: true,
        label: "Button",
    },
};

export const Secondary = {
    args: {
        label: "Button",
    },
};

export const Large = {
    args: {
        size: "large",
        label: "Button",
    },
};

export const Small = {
    args: {
        size: "small",
        label: "Button",
    },
};

export const PrimaryTest1 = {};
export const PrimaryTest2 = {};
export const PrimaryTest3 = {};
export const PrimaryTest4 = {};
export const PrimaryTest5 = {};
export const PrimaryTest6 = {};
export const PrimaryTest7 = {};
export const PrimaryTest8 = {};
export const PrimaryTest9 = {};
export const PrimaryTest10 = {};
export const PrimaryTest11 = {};
export const PrimaryTest12 = {};
export const PrimaryTest13 = {};
export const PrimaryTest14 = {};
export const PrimaryTest15 = {};
export const PrimaryTest16 = {};
export const PrimaryTest17 = {};
export const PrimaryTest18 = {};
export const PrimaryTest19 = {};
export const PrimaryTest20 = {};
export const PrimaryTest21 = {};
export const PrimaryTest22 = {};
export const PrimaryTest23 = {};
export const PrimaryTest24 = {};
export const PrimaryTest25 = {};
export const PrimaryTest26 = {};
export const PrimaryTest27 = {};
export const PrimaryTest28 = {};
export const PrimaryTest29 = {};
export const PrimaryTest30 = {};
export const PrimaryTest31 = {};
export const PrimaryTest32 = {};
export const PrimaryTest33 = {};
export const PrimaryTest34 = {};
export const PrimaryTest35 = {};
export const PrimaryTest36 = {};
export const PrimaryTest37 = {};
export const PrimaryTest38 = {};
export const PrimaryTest39 = {};
export const PrimaryTest40 = {};
export const PrimaryTest41 = {};
export const PrimaryTest42 = {};
export const PrimaryTest43 = {};
export const PrimaryTest44 = {};
export const PrimaryTest45 = {};
export const PrimaryTest46 = {};
export const PrimaryTest47 = {};
export const PrimaryTest48 = {};
export const PrimaryTest49 = {};
export const PrimaryTest50 = {};
export const PrimaryTest51 = {};
export const PrimaryTest52 = {};
export const PrimaryTest53 = {};
export const PrimaryTest54 = {};
export const PrimaryTest55 = {};
export const PrimaryTest56 = {};
export const PrimaryTest57 = {};
export const PrimaryTest58 = {};
export const PrimaryTest59 = {};
export const PrimaryTest60 = {};
export const PrimaryTest61 = {};
export const PrimaryTest62 = {};
export const PrimaryTest63 = {};
export const PrimaryTest64 = {};
export const PrimaryTest65 = {};
export const PrimaryTest66 = {};
export const PrimaryTest67 = {};
export const PrimaryTest68 = {};
export const PrimaryTest69 = {};
export const PrimaryTest70 = {};
export const PrimaryTest71 = {};
export const PrimaryTest72 = {};
export const PrimaryTest73 = {};
export const PrimaryTest74 = {};
export const PrimaryTest75 = {};
export const PrimaryTest76 = {};
export const PrimaryTest77 = {};
export const PrimaryTest78 = {};
export const PrimaryTest79 = {};
export const PrimaryTest80 = {};
export const PrimaryTest81 = {};
export const PrimaryTest82 = {};
export const PrimaryTest83 = {};
export const PrimaryTest84 = {};
export const PrimaryTest85 = {};
export const PrimaryTest86 = {};
export const PrimaryTest87 = {};
export const PrimaryTest88 = {};
export const PrimaryTest89 = {};
export const PrimaryTest90 = {};
export const PrimaryTest91 = {};
export const PrimaryTest92 = {};
export const PrimaryTest93 = {};
export const PrimaryTest94 = {};
export const PrimaryTest95 = {};
export const PrimaryTest96 = {};
export const PrimaryTest97 = {};
export const PrimaryTest98 = {};
export const PrimaryTest99 = {};
export const PrimaryTest100 = {};
