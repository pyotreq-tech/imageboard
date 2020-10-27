new Vue({
    el: "#main",
    data: {
        images: [],
        title: "",
        description: "",
        username: "",
        file: null,
    },
    mounted: function () {
        // important to store this in var so it does not lose its reference
        var me = this;
        axios
            .get("/images")
            .then(function (response) {
                me.images = response.data;
            })
            .catch(function (err) {
                console.log("err in GET /images: ", err);
            });
    },
    methods: {
        handleClick: function (e) {
            e.preventDefault();
            // console.log("this!: ", this);

            // we are handling that because of sending a file, otherwise we send just an object
            var formData = new FormData();
            formData.append("title", this.title);
            formData.append("description", this.title);
            formData.append("username", this.username);
            formData.append("file", this.file);

            axios
                .post("/images", formData)
                .then(function (response) {
                    console.log("response from /Post: ", response);
                })
                .catch(function (err) {
                    console.log("error in posting images: ", err);
                });
        },
        handleChange: function (e) {
            // console.log("handleChange is running");
            // console.log("file: ", e.target.files[0]);
            this.file = e.target.files[0];
        },
    },
});
