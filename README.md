# Twitch Custom View
**WIP 🛠**

Source code of https://twitch-custom-view.herokuapp.com/

A custom website you can connect with your twitch account and watch twitch streamers you already follow. It's like a simple [twitch.tv](https://www.twitch.tv) clone.

## Setup & Installation
After you have cloned this repository, create .env file and use [npm](https://www.npmjs.com/) to install dependencies.

Clone this repository;
```git
git clone https://github.com/merkdev/twitch-custom-view
```

Create **.env** file and paste following;
```.env
TWITCH_CLIENT_ID= // Get this on twitch developer page
TWITCH_SECRET= // Get this on twitch developer page
SESSION_SECRET= // Some random strings for security
CALLBACK_URL= // Define it in twitch api tool and paste here
PORT= // Write port number
DOMAIN= // Enter production domain
```

For development build;
```sh
$ npm install
$ npm run start:dev
```

## Demo and production use
[💻 DEMO & WATCH ONLINE](https://twitch-custom-view.herokuapp.com/)

Idea from _kadgar.net_