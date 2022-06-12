let config = {}
console.log('Environment:::', process.env.NODE_ENV)

if (process.env.NODE_ENV === 'production') {
    config = {
        API_BASE_URL: 'http://52.205.86.196:3000/api/v1/admin/',
        LANGUAGE: 'EN',
        web_url: 'http://52.205.86.196/',
        DEFAULT_AUTH_TOKEN: '@#Slsjpoq$S1o08#MnbAiB%UVUV&Y*5EU@exS1o!08L9TSlsjpo#',
        APP_ICON: 'Images/App_icon.png'
    };
}

else if (process.env.NODE_ENV === 'sandbox') {
    config = {
        API_BASE_URL: 'http://52.205.86.196:3000/api/v1/admin/',
        LANGUAGE: 'EN',
        web_url: 'http://52.205.86.196/',
        DEFAULT_AUTH_TOKEN: '@#Slsjpoq$S1o08#MnbAiB%UVUV&Y*5EU@exS1o!08L9TSlsjpo#',
        APP_ICON: 'Images/App_icon.png'
    };
}

else {
    config = {
        API_BASE_URL: 'http://52.205.86.196:3000/api/v1/admin/',
        LANGUAGE: 'EN',
        web_url: 'http://52.205.86.196/',
        DEFAULT_AUTH_TOKEN: '@#Slsjpoq$S1o08#MnbAiB%UVUV&Y*5EU@exS1o!08L9TSlsjpo#',
        APP_ICON: '../../Images/App_icon.png'
    };
}

export default config;