// conditionally render component when there is an image id, start with falsy and on clock

// say-greeting in html = sayGreeting in props

Vue.component("modal-details", {
    data: function () {
        return {
            image: "",
            comments: [],
            name: "",
            comment: "",
        };
    },
    props: ["imageId"],
    template: "#modal-template",
    mounted: function () {
        var me = this;
        axios
            .get(`/image/${this.imageId}`)
            .then(function (response) {
                me.image = response.data[0];
            })
            .catch(function (err) {
                console.log("err in GET /singleImage", err);
            });

        axios
            .get(`/comments/${this.imageId}`)
            .then(function (res) {
                me.comments = res.data;
                console.log(me.comments);
            })
            .catch(function (err) {
                console.log("err in GET /comments", err);
            });
    },
    methods: {
        postComment: function () {
            var me = this;
            axios
                .post("/comments")
                .then(function (response) {
                    console.log("response from /PostComment: ", response);
                    me.comments.unshift(response.data.rows);
                })
                .catch(function (err) {
                    console.log("error in posting comments: ", err);
                });
        },
    },
});

new Vue({
    el: "#main",
    data: {
        images: [],
        title: "",
        description: "",
        username: "",
        file: null,
        imageId: null,
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
            console.log("formData: ", formData);
            var me = this;
            axios
                .post("/images", formData)
                .then(function (response) {
                    console.log("response from /Post: ", response);
                    me.images.unshift(response.data.rows);
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
        setValue: function (id) {
            this.imageId = id;
        },
    },
});
