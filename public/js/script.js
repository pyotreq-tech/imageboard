new Vue({
    el: "#main",
    data: {
        images: [],
    },
    mounted: function () {
        // important to store this in var so it does not lose its reference
        var me = this;
        axios.get("/images").then(function (response) {
            me.images = response.data;
        });
    },
    methods: {},
});
