// conditionally render component when there is an image id, start with falsy and on clock

// say-greeting in html = sayGreeting in props

Vue.component("modal-details", {
    data: function () {
        return {
            image: "",
            comments: [],
            name: "",
            comment: "",
            newTag: "LOL",
        };
    },
    watch: {
        imageId: function () {
            this.getData();
        },
    },
    props: ["imageId", "currentTag"],
    template: "#modal-template",
    mounted: function () {
        this.getData();
    },
    methods: {
        getData: function () {
            var me = this;
            axios
                .get(`/image/${this.imageId}`)
                .then(function (response) {
                    if (response.data != 0) {
                        me.image = response.data[0];
                        // let tagsArray = response.data[0].tags.split(",");
                        // tagsArray.forEach(function (e) {
                        //     me.tag.push(e);
                        // });
                        // console.log(me.tag);
                        console.log("response received");
                    } else {
                        console.log("no response received");
                        me.$emit("close");
                    }
                })
                .catch(function (err) {
                    console.log("err in GET /singleImage", err);
                });

            axios
                .get(`/comments/${this.imageId}`)
                .then(function (res) {
                    me.comments = res.data;
                    // console.log(me.comments);
                })
                .catch(function (err) {
                    console.log("err in GET /comments", err);
                });
        },
        postComment: function (e) {
            e.preventDefault();
            var me = this;

            let newComment = {};

            newComment.name = this.name;
            newComment.comment = this.comment;
            newComment.imageId = this.imageId;

            axios
                .post("/comment", { newComment })
                .then(function (response) {
                    console.log(
                        "response from /PostComment: ",
                        response.data.rows
                    );
                    me.comments.unshift(response.data.rows);
                    me.name = "";
                    me.comment = "";
                })
                .catch(function (err) {
                    console.log("error in posting comments: ", err);
                });
        },
        closeModal: function () {
            this.$emit("close");
        },
        showByTag: function (arg) {
            console.log("My .js chosen tag is:", arg);
            // here I have to change
            this.newTag = arg;
            // console.log("The one before emit: ", newTag);
            this.$emit("show", arg);
        },
        deleteImage: function (arg) {
            var me = this;

            axios
                .get(`/delete/${arg}`)
                .then(function () {
                    console.log("please delete me, id:", arg);

                    me.$emit("remove", arg);
                })
                .catch(function (err) {
                    console.log("err in GET /comments", err);
                });
        },
    },
    computed: {
        splittedArray: function () {
            if (this.image.tags) {
                console.log(this.image.tags.split(", "));
                return this.image.tags.split(", ");
            }
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
        tags: "",
        file: null,
        imageId: location.hash.slice(1),
        button: true,
        currentTag: null,
        addNewPopup: null,
        newAwaitingImages: [],
        maxNumberQuery: null,
    },
    mounted: function () {
        var me = this;
        addEventListener("hashchange", function () {
            console.log("the hash changed");
            me.imageId = location.hash.slice(1);
        });
        // important to store this in var so it does not lose its reference
        axios
            .get("/images")
            .then(function (response) {
                console.log("response from getImages: ", response);
                me.images = response.data;

                setTimeout(function () {
                    me.checkForNew();
                }, 3000);
            })
            .catch(function (err) {
                console.log("err in GET /images: ", err);
            });
    },
    methods: {
        checkForNew: function () {
            let numbers = this.images.map(({ id }) => id);
            let maxNumber = Math.max(...numbers);
            console.log("maxNumber: ", maxNumber);
            this.maxNumberQuery = maxNumber;
            this.request(maxNumber);
        },

        request: function (maxNumberAwaiting) {
            console.log("function request is running: ", maxNumberAwaiting);
            var me = this;
            if (!this.currentTag) {
                axios
                    .get(`/images/new/${maxNumberAwaiting}`)
                    .then(function (response) {
                        if (response.data.length) {
                            console.log("nowe dodane");

                            let awaitingNumbers = response.data.map(
                                ({ id }) => id
                            );
                            let maxNumberAwaiting = Math.max(
                                ...awaitingNumbers
                            );

                            me.maxNumberQuery = maxNumberAwaiting;

                            me.newAwaitingImages = [
                                ...response.data,
                                ...me.newAwaitingImages,
                            ];

                            console.log(me.newAwaitingImages);
                            me.addNewPopup = true;
                            // setTimeout(me.request(me.maxNumberQuery), 3000);
                            setTimeout(function () {
                                me.request(me.maxNumberQuery);
                            }, 3000);
                        } else {
                            console.log("nowe nie dodane");
                            // setTimeout(me.request(me.maxNumberQuery), 3000);
                            setTimeout(function () {
                                me.request(me.maxNumberQuery);
                            }, 3000);
                        }
                    })
                    .catch(function (err) {
                        console.log("err in GET /max number Images", err);
                    });
            }
        },

        addNewlyAdded: function () {
            console.log;
            this.images = [...this.newAwaitingImages, ...this.images];
            this.newAwaitingImages = [];
        },

        handleClick: function (e) {
            e.preventDefault();
            // console.log("this!: ", this);

            // we are handling that because of sending a file, otherwise we send just an object
            var formData = new FormData();
            formData.append("title", this.title);
            formData.append("description", this.description);
            formData.append("username", this.username);
            formData.append("file", this.file);
            formData.append("tags", this.tags);
            console.log("formData: ", formData);
            var me = this;
            console.log(formData);
            axios
                .post("/images", formData)
                .then(function (response) {
                    console.log("response from /Post: ", response);
                    me.images.unshift(response.data.rows);
                    me.maxNumberQuery = null;

                    me.title = "";
                    me.description = "";
                    me.username = "";
                    me.tags = "";
                    me.file = null;

                    const uploadButton = document.getElementById("file");
                    uploadButton.nextElementSibling.innerHTML =
                        '<i class="fas fa-cloud-upload-alt arrow"></i>';
                })
                .catch(function (err) {
                    console.log("error in posting images: ", err);
                });
        },
        handleChange: function (e) {
            e.target.nextElementSibling.innerHTML =
                '<i class="fas fa-vote-yea arrow"></i>';
            // console.log("label: ", label);

            // console.log("handleChange is running");
            // console.log("file: ", e.target.files[0]);
            this.file = e.target.files[0];
        },
        setValue: function (id) {
            this.imageId = id;
        },

        closeModalMain: function () {
            this.imageId = null;
            location.hash = "0";
        },
        showByTagMain: function (tag) {
            console.log("My newest tag is: ", tag);
            this.imageId = null;
            location.hash = "0";
            var me = this;
            axios
                .get(`/tags/${tag}`)
                .then(function (response) {
                    console.log("response from getImages: ", response);
                    me.images = response.data;
                    me.currentTag = tag;
                    me.noTagFiltering = false;
                })
                .catch(function (err) {
                    console.log("err in GET /images: ", err);
                });
        },

        moreImages: function (e) {
            e.preventDefault();

            let numbers = this.images.map(({ id }) => id);
            let minNumber = Math.min(...numbers);
            var me = this;

            axios
                .get(`/images/${minNumber}`)
                .then(function (response) {
                    console.log("response from nextImages: ", response);
                    me.images = [...me.images, ...response.data];
                    console.log("lowest id: ", response.data[0].lowestId);
                    if (
                        me.images.filter(function (e) {
                            return e.id === response.data[0].lowestId;
                        }).length > 0
                    ) {
                        me.button = false;
                    }
                })
                .catch(function (err) {
                    console.log("err in GET /more Images", err);
                });
        },
        removeImage: function (id) {
            console.log("got it, I will delete you");
            this.images = this.images.filter(function (obj) {
                return obj.id !== id;
            });
            location.hash = "0";
        },
        closeTag: function () {
            // this.currentTag = null;
            // this.button = true;
            var me = this;

            axios
                .get("/images")
                .then(function (response) {
                    console.log("response from getImages: ", response);
                    me.images = response.data;
                    me.maxNumberQuery = null;
                    me.currentTag = null;
                    me.button = true;
                    setTimeout(me.checkForNew, 3000);
                })
                .catch(function (err) {
                    console.log("err in GET /images: ", err);
                });
        },
    },
});
