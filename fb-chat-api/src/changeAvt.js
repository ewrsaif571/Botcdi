"use strict";

const axios = require("axios");
const utils = require("../utils");

async function postImage(api, botID, formData) {
    const res = await api.httpPostFormData(
        `https://www.facebook.com/profile/picture/upload/?profile_id=${botID}&photo_source=57&av=${botID}`,
        formData
    );
    return JSON.parse(res.split("for (;;);")[1]);
}

module.exports = function (defaultFuncs, api, ctx) {
    return function changeAvt(link, caption = "", callback) {
        let resolveFunc, rejectFunc;
        const returnPromise = new Promise((resolve, reject) => {
            resolveFunc = resolve;
            rejectFunc = reject;
        });

        if (!callback) {
            callback = function (err, data) {
                if (err) return rejectFunc(err);
                resolveFunc(data);
            };
        }

        axios.get(link, { responseType: "stream" }).then(async (res) => {
            try {
                const uploaded = await postImage(api, ctx.userID, { file: res.data });
                if (!uploaded?.payload?.fbid) return callback("Failed to upload image or no fbid returned.");

                const form = {
                    av: ctx.userID,
                    fb_api_req_friendly_name: "ProfileCometProfilePictureSetMutation",
                    fb_api_caller_class: "RelayModern",
                    doc_id: "5066134240065849", // Might need updating
                    variables: JSON.stringify({
                        input: {
                            caption,
                            existing_photo_id: uploaded.payload.fbid,
                            expiration_time: null,
                            profile_id: ctx.userID,
                            profile_pic_method: "EXISTING",
                            profile_pic_source: "TIMELINE",
                            scaled_crop_rect: { height: 1, width: 1, x: 0, y: 0 },
                            skip_cropping: true,
                            actor_id: ctx.userID,
                            client_mutation_id: Math.random().toString(36).substr(2, 10)
                        },
                        isPage: false,
                        isProfile: true,
                        scale: 3
                    })
                };

                const resData = await defaultFuncs
                    .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
                    .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

                if (resData.error) return callback(resData.error);
                return callback(null, true);
            } catch (err) {
                return callback(err.message || err);
            }
        }).catch(err => callback(err.message || err));

        return returnPromise;
    };
}; 