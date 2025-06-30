import { defineAppSetup } from "@slidev/types";
import VueKonva from "vue-konva";

export default defineAppSetup(({ app, router }) => {
    // Register your Vue plugin here
    app.use(VueKonva);
});
