# Twitch Custom View
**WIP 🛠**

Source code of https://twitch-custom-view.herokuapp.com/

A custom website you can connect with your twitch account and watch twitch streamers as simple as possible

## Setup & Installation
After you have cloned this repository, use [npm](https://www.npmjs.com/) to install dependencies.

Change create a **.env** file and paste following;
```javascript
TWITCH_CLIENT_ID= //Get this on twitch developer page
TWITCH_SECRET= //Get this on twitch developer page
SESSION_SECRET= //Some random strings for security
CALLBACK_URL= //Define it in twitch api tool and paste here
PORT= //Choose port number
DOMAIN= //Enter production domain
```

```sh
$ npm install
$ npm run start:dev
```

## Demo and production use
[💻 DEMO & WATCH ONLINE](https://twitch-custom-view.herokuapp.com/)