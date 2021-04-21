var express = require("express");
var session = require("express-session");
var passport = require("passport");
var OAuth2Strategy = require("passport-oauth").OAuth2Strategy;
var request = require("request");
var exphbs = require("express-handlebars");

// Initialize Express and middlewares
var app = express();

require("dotenv").config();

app.set("view engine", "hbs");
app.engine(
  "hbs",
  exphbs({
    extname: "hbs",
  })
);

app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());

// Override passport profile function to get user profile from Twitch API
OAuth2Strategy.prototype.userProfile = function (accessToken, done) {
  var options = {
    url: "https://api.twitch.tv/helix/users",
    method: "GET",
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID,
      Accept: "application/vnd.twitchtv.v5+json",
      Authorization: "Bearer " + accessToken,
    },
  };

  request(options, function (error, response, body) {
    if (response && response.statusCode == 200) {
      done(null, JSON.parse(body));
    } else {
      done(JSON.parse(body));
    }
  });
};

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  "twitch",
  new OAuth2Strategy(
    {
      authorizationURL: "https://id.twitch.tv/oauth2/authorize",
      tokenURL: "https://id.twitch.tv/oauth2/token",
      clientID: process.env.TWITCH_CLIENT_ID,
      clientSecret: process.env.TWITCH_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      state: true,
    },
    function (accessToken, refreshToken, profile, done) {
      profile.accessToken = accessToken;
      profile.refreshToken = refreshToken;
      done(null, profile);
    }
  )
);

// Set route to start OAuth link, this is where you define scopes to request
app.get(
  "/auth/twitch",
  passport.authenticate("twitch", { scope: "user_read" })
);

// Set route for OAuth redirect
app.get(
  "/auth/twitch/callback",
  passport.authenticate("twitch", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

app.get("/watch/:user_name", function (req, res) {
  res.render("watch", {
    domain: process.env.DOMAIN,
    userData: req.session.passport ? req.session.passport.user : false,
    channelData: req.params,
  });
});

// If user has an authenticated session, display it, otherwise display link to authenticate
app.get("/", function (req, res) {
  if (req.session && req.session.passport && req.session.passport.user) {
    var options = {
      url:
        "https://api.twitch.tv/kraken/users/" +
        req.session.passport.user.data[0].id +
        "/follows/channels?limit=100",
      method: "GET",
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        Accept: "application/vnd.twitchtv.v5+json",
        Authorization: "Bearer " + req.session.passport.user.accessToken,
      },
    };

    request(options, function (error, response, body) {
      if (response && response.statusCode == 200) {
        var following_channels = JSON.parse(body),
          channel_ids = [];

        req.session.passport.user.following_channels = following_channels;

        for (let i = 0; i < following_channels.follows.length; ++i) {
          channel_ids.push(
            "user_id=" + following_channels.follows[i].channel._id
          );
        }

        channel_ids = channel_ids.join("&");

        request(
          {
            url: "https://api.twitch.tv/helix/streams/?" + channel_ids,
            method: "GET",
            headers: {
              "Client-ID": process.env.TWITCH_CLIENT_ID,
              Accept: "application/vnd.twitchtv.v5+json",
              Authorization: "Bearer " + req.session.passport.user.accessToken,
            },
          },
          function (error, response, body, live_channels) {
            if (response && response.statusCode == 200) {
              var live_channels = JSON.parse(body);
              req.session.passport.user.live_channels = live_channels;

              for (
                let i = 0;
                i < req.session.passport.user.live_channels.data.length;
                i++
              ) {
                req.session.passport.user.live_channels.data[
                  i
                ].thumbnail_url = req.session.passport.user.live_channels.data[
                  i
                ].thumbnail_url.replace("{width}", 300);

                req.session.passport.user.live_channels.data[
                  i
                ].thumbnail_url = req.session.passport.user.live_channels.data[
                  i
                ].thumbnail_url.replace("{height}", 180);
              }

              res.render("dashboard", {
                userData: req.session.passport.user,
              });

              // console.log(req.session.passport.user.live_channels.data);
              // console.log(JSON.stringify(req.session.passport.user));
            } else {
              console.log(error);
            }
          }
        );
      }
    });
  } else {
    res.render("login");
  }
});

app.listen(process.env.PORT, function () {
  console.log("Twitch custom view listening on port 3000!");
});
