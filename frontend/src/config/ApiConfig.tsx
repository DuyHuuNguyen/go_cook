// endpoints.ts

const SERVICE = {
    USER: "",
    CURRICULUM: "/curriculum-service",
} as const;

const VERSION = {
    V1: "/api/v1",
    V2: "/api/v2",
    V3: "/api/v3",
} as const;

const endpoint = (
    service: string,
    version: string,
    path: string,
) => {
    console.log("endpoint", `${service}${version}${path}`);
    return `${service}${version}${path}`;
}

export const ENDPOINTS = {
    HOME: { GET: { V1: endpoint(SERVICE.USER, VERSION.V1, "/home") } },
    LOCATION :{
        PROVINCE:{
            V1:  endpoint(SERVICE.USER, VERSION.V1, "/locations/provinces"),
        },
        WARD:{
            V1:  endpoint(SERVICE.USER, VERSION.V1, "/locations/wards"),
        }
    },
    USER: {
        LOGIN: {
            V1: endpoint(SERVICE.USER, VERSION.V1, "/users/login"),
            V2: endpoint(SERVICE.USER, VERSION.V2, "/users/login"),
        },

        SIGN_UP: {
            V1: endpoint(SERVICE.USER, VERSION.V1, "/users/sign-up"),
        },

        VERIFY_OTP: {
            V1: endpoint(SERVICE.USER, VERSION.V1, "/users/verify-otp"),
        },

        FORGOT_PASSWORD: {
            V1: endpoint(SERVICE.USER, VERSION.V1, "/users/forgot-password"),
        },

        RESET_PASSWORD: {
            V1: endpoint(SERVICE.USER, VERSION.V1, "/users/reset-password"),
        },

        REFRESH_TOKEN: {
            V1: endpoint(SERVICE.USER, VERSION.V1, "/users/refresh-token"),
            V2: endpoint(SERVICE.USER, VERSION.V2, "/users/refresh-token"),
        },

        LOGOUT: {
            V1: endpoint(SERVICE.USER, VERSION.V1, "/users/logout"),
            V2: endpoint(SERVICE.USER, VERSION.V2, "/users/logout"),
        },

        PROFILE: {
            GET: {
                V1: endpoint(SERVICE.USER, VERSION.V1, "/users/profile"),
            },

            UPDATE: {
                V1: endpoint(SERVICE.USER, VERSION.V1, "/users/profile"),
            },
        },

        AVATAR: {
            UPLOAD: {
                V1: endpoint(SERVICE.USER, VERSION.V1, "/users/avatar"),
            },
        },

        DETAIL: {
            GET: {
                V1: (id: number | string) =>
                    endpoint(SERVICE.USER, VERSION.V1, `/users/detail/${id}`),
            },
        },

        INSTRUCTOR: {
            CREATE: {
                V1: endpoint(SERVICE.USER, VERSION.V1, "/users/instructor"),
            },
        },
        CHEF:{
            CREATE: {
                V2: endpoint(SERVICE.USER, VERSION.V3, "/users/become-chef"),
            }
        }
    },

    CURRICULUM: {
        CURRICULUM_MANAGEMENT:{
            GET:{
                V1: endpoint(SERVICE.CURRICULUM,VERSION.V1,"/channels/management/curriculums")
            }
        },
        TOPIC:{
            GET:{
                V1: endpoint(SERVICE.CURRICULUM,VERSION.V1,"/topics")
            }
        },
        CREATE:{
            POST:{
                V1: endpoint(SERVICE.CURRICULUM,VERSION.V1,"/curriculums")
            }
        },
        CURRICULUM_HOME: {
            GET: {
                V1: endpoint(SERVICE.CURRICULUM, VERSION.V1, "/curriculums/home")
            }
        },
        PURCHASED_CURRICULUMS: {
            GET: {
                V1: endpoint(SERVICE.CURRICULUM, VERSION.V1, "/curriculums/purchased-curriculums")
            }
        },
        CURRICULUM_WISH_LIST:{
            POST:{
                V1: endpoint(SERVICE.CURRICULUM,VERSION.V1,"/curriculums/wishlist")
            }

        },
        CURRICULUM_REVIEW: {
            GET: {
                V1: endpoint(SERVICE.CURRICULUM, VERSION.V1, "/curriculums/review")
            }
        },
        CURRICULUM_BY_TOPIC_ID: {
            GET:{
                V1: endpoint(SERVICE.CURRICULUM,VERSION.V1,"/curriculums"),
            }
        },
        BANNER:{
            GET:{
                V1: endpoint(SERVICE.CURRICULUM,VERSION.V1,"/banners")
            }
        },
        LEARNING_PROGRESS:{
            GET:{
                V1: endpoint(SERVICE.CURRICULUM,VERSION.V1,"/learning-progresses")
            }
        },
        SESSIONS: {
            GET: {
                V1: endpoint(SERVICE.CURRICULUM, VERSION.V1, "/curriculums/sessions")
            }
        },
        STOP_WATCHING: {
            POST: {
                V1: endpoint(SERVICE.CURRICULUM, VERSION.V1, "/tracking-behaviors/stop-watching")
            }
        }
    },
    COMPANY:{
        GROUP:{
          GET:{
              v1: endpoint(SERVICE.CURRICULUM,VERSION.V1,"/companies/groups")
          }
        },
        DASH_BOARD:{
            GET:{
                v1: endpoint(SERVICE.CURRICULUM,VERSION.V1,"/groups/dashboard")
            }
        },
        COMPANY:{
            POST:{
                V1: endpoint(SERVICE.CURRICULUM,VERSION.V1,"/companies")
            },
            GET:{
                V1: endpoint(SERVICE.CURRICULUM,VERSION.V1,"/companies")
            }
        }
    },
    VIDEO:{
        VIDEO_STREAMING: {
            POST: {
                V1: endpoint(SERVICE.CURRICULUM, VERSION.V1, "/videos/presign-url-video-streaming")
            }
        },
        VIDEO_DEMO: {
            POST: {
                V1: endpoint(SERVICE.CURRICULUM, VERSION.V1, "/videos/admin-system/gen-presign-streaming")
            }
        },
        UPLOADING: {
            POST: {
                V1: endpoint(SERVICE.CURRICULUM, VERSION.V1, "/videos/presign-url-video-uploading")
            }
        }
    },
    NOTE:{
        POST: {
            V1: endpoint(SERVICE.CURRICULUM, VERSION.V1, "/notes")
        }
    },
    EXAM: {
        DETAIL: {
            GET: {
                V1: endpoint(SERVICE.CURRICULUM, VERSION.V1, "/exams/detail")
            }
        }
    }
} as const;